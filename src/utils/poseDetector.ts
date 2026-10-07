/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlignmentStatus, PoseType } from '../types/camera';

interface TargetGeometry {
  headCenterX: number;     // 0.0 to 1.0
  headCenterY: number;     // 0.0 to 1.0
  headRadiusY: number;     // relative height
  shoulderY: number;
  shoulderWidth: number;
  feetY: number;
  expectedHeight: number;  // head to feet / bottom
  toleranceX: number;
  toleranceY: number;
}

export function getPoseTargetGeometry(pose: PoseType): TargetGeometry {
  switch (pose) {
    case 'medium_shot':
      return {
        headCenterX: 0.5,
        headCenterY: 0.26,
        headRadiusY: 0.11,
        shoulderY: 0.44,
        shoulderWidth: 0.46,
        feetY: 0.95, // waist/hips cutoff
        expectedHeight: 0.70,
        toleranceX: 0.08,
        toleranceY: 0.07,
      };
    case 'portrait':
      return {
        headCenterX: 0.5,
        headCenterY: 0.32,
        headRadiusY: 0.16,
        shoulderY: 0.60,
        shoulderWidth: 0.64,
        feetY: 0.98,
        expectedHeight: 0.68,
        toleranceX: 0.07,
        toleranceY: 0.06,
      };
    case 'casual_model':
      return {
        headCenterX: 0.48,
        headCenterY: 0.20,
        headRadiusY: 0.08,
        shoulderY: 0.34,
        shoulderWidth: 0.36,
        feetY: 0.91,
        expectedHeight: 0.72,
        toleranceX: 0.09,
        toleranceY: 0.08,
      };
    case 'seated':
      return {
        headCenterX: 0.5,
        headCenterY: 0.30,
        headRadiusY: 0.09,
        shoulderY: 0.46,
        shoulderWidth: 0.42,
        feetY: 0.88,
        expectedHeight: 0.60,
        toleranceX: 0.09,
        toleranceY: 0.08,
      };
    case 'couple':
      return {
        headCenterX: 0.5,
        headCenterY: 0.25,
        headRadiusY: 0.09,
        shoulderY: 0.42,
        shoulderWidth: 0.70,
        feetY: 0.92,
        expectedHeight: 0.68,
        toleranceX: 0.10,
        toleranceY: 0.08,
      };
    case 'full_body':
    default:
      return {
        headCenterX: 0.5,
        headCenterY: 0.18,
        headRadiusY: 0.07,
        shoulderY: 0.30,
        shoulderWidth: 0.34,
        feetY: 0.92,
        expectedHeight: 0.75,
        toleranceX: 0.08,
        toleranceY: 0.07,
      };
  }
}

export class PoseFrameAnalyzer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private faceDetector: any = null;
  private prevCenterX = 0.5;
  private prevCenterY = 0.3;
  private prevScore = 0;
  private prevHeight = 0.7;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 160;
    this.canvas.height = 120;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    // Initialize native FaceDetector if supported by Chrome/Android
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        const FaceDetectorClass = (window as any).FaceDetector;
        this.faceDetector = new FaceDetectorClass({ fastMode: true, maxDetectedFaces: 2 });
      } catch {
        this.faceDetector = null;
      }
    }
  }

  async analyzeFrame(
    videoElement: HTMLVideoElement,
    poseType: PoseType,
    isMirrored: boolean = false
  ): Promise<AlignmentStatus> {
    if (!this.ctx || !videoElement || videoElement.readyState < 2) {
      return {
        isDetected: false,
        score: 0,
        isAligned: false,
        guidanceTextUz: 'Kamera tasviri yuklanmoqda...',
        direction: 'none',
        bodyMetrics: null,
      };
    }

    const cw = this.canvas.width;
    const ch = this.canvas.height;

    // Draw downscaled frame
    this.ctx.drawImage(videoElement, 0, 0, cw, ch);
    const imgData = this.ctx.getImageData(0, 0, cw, ch);
    const data = imgData.data;

    let detectedHeadX = -1;
    let detectedHeadY = -1;
    let detectedHeadRadius = 0.08;

    // 1. Try native FaceDetector
    if (this.faceDetector) {
      try {
        const faces = await this.faceDetector.detect(this.canvas);
        if (faces && faces.length > 0) {
          const face = faces[0].boundingBox;
          let fx = (face.x + face.width / 2) / cw;
          if (isMirrored) fx = 1.0 - fx;
          detectedHeadX = fx;
          detectedHeadY = (face.y + face.height / 2) / ch;
          detectedHeadRadius = (face.height / ch) / 2;
        }
      } catch {
        // Fallback to pixel color/luminance analysis
      }
    }

    // 2. Pixel segmentation: Human skin tone & silhouette mass analysis
    let skinPixelCount = 0;
    let sumX = 0;
    let sumY = 0;
    let topSkinY = ch;
    let bottomSkinY = 0;
    let minSkinX = cw;
    let maxSkinX = 0;

    // Row histogram to find head and shoulder contours
    const rowCounts = new Uint16Array(ch);
    const colCounts = new Uint16Array(cw);

    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const idx = (y * cw + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Fast RGB skin tone heuristic
        // R > 95, G > 40, B > 20, max - min > 15, |R - G| > 15, R > G, R > B
        const isSkin = 
          r > 70 && g > 35 && b > 20 &&
          r > g && r > b &&
          (Math.max(r, g, b) - Math.min(r, g, b) > 12) &&
          Math.abs(r - g) > 8;

        if (isSkin) {
          skinPixelCount++;
          sumX += x;
          sumY += y;
          rowCounts[y]++;
          colCounts[x]++;

          if (y < topSkinY) topSkinY = y;
          if (y > bottomSkinY) bottomSkinY = y;
          if (x < minSkinX) minSkinX = x;
          if (x > maxSkinX) maxSkinX = x;
        }
      }
    }

    const minSkinThreshold = (cw * ch) * 0.015; // At least ~1.5% skin pixels
    const target = getPoseTargetGeometry(poseType);

    if (skinPixelCount < minSkinThreshold && detectedHeadX < 0) {
      // No person detected or person is outside frame
      return {
        isDetected: false,
        score: 0,
        isAligned: false,
        guidanceTextUz: 'Kadrga kiring va siluetga moslashing',
        secondaryTipUz: 'Kameraga to‘g‘ri qarang',
        direction: 'center',
        bodyMetrics: null,
      };
    }

    // Determine head position
    if (detectedHeadX < 0) {
      let rawHeadX = (sumX / skinPixelCount) / cw;
      if (isMirrored) rawHeadX = 1.0 - rawHeadX;
      detectedHeadX = rawHeadX;
      detectedHeadY = (topSkinY / ch) + 0.05;
      detectedHeadRadius = Math.max(0.06, ((bottomSkinY - topSkinY) / ch) * 0.25);
    }

    // Determine shoulder and body metrics
    let rawCenterX = (sumX / skinPixelCount) / cw;
    if (isMirrored) rawCenterX = 1.0 - rawCenterX;

    // Body height estimate
    let detectedHeight = Math.max(0.4, (bottomSkinY - topSkinY) / ch * 1.8);
    if (poseType === 'full_body' && detectedHeight < 0.6) {
      detectedHeight = 0.65;
    }

    // Smooth values to prevent jitter
    const alpha = 0.3;
    const smoothX = this.prevCenterX * (1 - alpha) + detectedHeadX * alpha;
    const smoothY = this.prevCenterY * (1 - alpha) + detectedHeadY * alpha;
    const smoothH = this.prevHeight * (1 - alpha) + detectedHeight * alpha;

    this.prevCenterX = smoothX;
    this.prevCenterY = smoothY;
    this.prevHeight = smoothH;

    // Compute deviation from target silhouette
    const dx = smoothX - target.headCenterX;
    const dy = smoothY - target.headCenterY;
    const dH = smoothH - target.expectedHeight;

    // Calculate sub-scores
    const xScore = Math.max(0, 100 - Math.abs(dx) * 450);
    const yScore = Math.max(0, 100 - Math.abs(dy) * 450);
    const hScore = Math.max(0, 100 - Math.abs(dH) * 250);

    const rawTotalScore = Math.round(xScore * 0.4 + yScore * 0.4 + hScore * 0.2);
    const score = Math.max(0, Math.min(100, Math.round(this.prevScore * 0.4 + rawTotalScore * 0.6)));
    this.prevScore = score;

    const isAligned = score >= 78;

    // Generate accurate, human Uzbek instructions matching the user prompt
    let guidanceTextUz = 'Shu joyda turing';
    let secondaryTipUz = '';
    let direction: AlignmentStatus['direction'] = 'center';

    if (isAligned) {
      guidanceTextUz = 'Zo‘r! Suratga olish mumkin.';
      secondaryTipUz = '✅ Tayyor!';
      direction = 'center';
    } else {
      // Prioritize the biggest deviation
      // Mirroring affects left/right instructions for user's perspective
      const adjustedDx = isMirrored ? -dx : dx;

      if (Math.abs(dH) > 0.22) {
        if (dH > 0) {
          guidanceTextUz = 'Bir qadam orqaga';
          secondaryTipUz = 'Kameradan uzoqlashing';
          direction = 'further';
        } else {
          guidanceTextUz = 'Bir qadam oldinga';
          secondaryTipUz = 'Kameraga yaqinlashing';
          direction = 'closer';
        }
      } else if (Math.abs(adjustedDx) > target.toleranceX) {
        if (adjustedDx > 0) {
          guidanceTextUz = 'Bir oz chapga';
          secondaryTipUz = 'Kadr markaziga siljing';
          direction = 'left';
        } else {
          guidanceTextUz = 'Bir oz o‘ngga';
          secondaryTipUz = 'Kadr markaziga siljing';
          direction = 'right';
        }
      } else if (Math.abs(dy) > target.toleranceY) {
        if (dy > 0) {
          guidanceTextUz = 'Boshingizni yuqoriroq tuting';
          secondaryTipUz = 'Boshni konturga to‘g‘rilang';
          direction = 'up';
        } else {
          guidanceTextUz = 'Bir oz pastroqqa turing';
          secondaryTipUz = 'Kontur balandligiga moslang';
          direction = 'down';
        }
      } else if (poseType === 'full_body' && Math.abs(dH) > 0.12) {
        guidanceTextUz = 'Oyoqlaringizni belgiga moslang';
        secondaryTipUz = 'To‘liq qadni kadrga joylashtiring';
        direction = 'down';
      } else {
        guidanceTextUz = 'Shu joyda turing';
        secondaryTipUz = 'Siluetga to‘liq moslashing';
        direction = 'center';
      }
    }

    const estimatedDistance = Math.max(0.6, Math.min(4.5, Number((1.5 / (smoothH || 0.7)).toFixed(1))));

    return {
      isDetected: true,
      score,
      isAligned,
      guidanceTextUz,
      secondaryTipUz,
      direction,
      bodyMetrics: {
        headX: smoothX,
        headY: smoothY,
        headRadius: detectedHeadRadius,
        shoulderY: target.shoulderY,
        shoulderWidth: target.shoulderWidth,
        bodyHeight: smoothH,
        centerX: smoothX,
        estimatedDistanceMeters: estimatedDistance,
      },
    };
  }
}

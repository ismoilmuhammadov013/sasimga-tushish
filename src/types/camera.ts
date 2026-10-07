/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PoseType = 
  | 'full_body'      // To‘liq qad (boshdan oyoqqacha)
  | 'medium_shot'    // Yarim qad (beldan yuqori)
  | 'portrait'       // Portret (bosh va yelka, rasmiy)
  | 'casual_model'   // Erkin / Model (zamonaviy burchakli turish)
  | 'seated'         // O‘tirgan holat
  | 'couple';        // Juftlik (ikki kishi)

export interface PosePreset {
  id: PoseType;
  titleUz: string;
  subtitleUz: string;
  descriptionUz: string;
  recommendedDistanceUz: string;
  aspectRatio: 'full' | 'medium' | 'close';
}

export interface AlignmentStatus {
  isDetected: boolean;
  score: number; // 0 to 100
  isAligned: boolean; // score >= 75
  guidanceTextUz: string;
  secondaryTipUz?: string;
  direction: 'center' | 'left' | 'right' | 'up' | 'down' | 'closer' | 'further' | 'tilt' | 'none';
  bodyMetrics: {
    headY: number;
    headX: number;
    headRadius: number;
    shoulderY: number;
    shoulderWidth: number;
    bodyHeight: number;
    centerX: number;
    estimatedDistanceMeters: number;
  } | null;
}

export interface CameraSettings {
  facingMode: 'user' | 'environment';
  timerSeconds: 0 | 3 | 5 | 10;
  gridEnabled: boolean;
  autoScaleSilhouette: boolean;
  silhouetteOpacity: number; // 0.15 to 0.70
  soundEnabled: boolean;
}

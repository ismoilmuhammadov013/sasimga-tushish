/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { AlignmentStatus, PoseType } from '../types/camera';

interface SilhouetteOverlayProps {
  poseType: PoseType;
  alignment: AlignmentStatus;
  opacity: number; // 0.15 to 0.70 (default ~0.35)
  isMirrored?: boolean;
  scaleOffset?: number; // 0.8 to 1.3
  yOffset?: number; // -100 to 100 px
}

export const SilhouetteOverlay: React.FC<SilhouetteOverlayProps> = ({
  poseType,
  alignment,
  opacity,
  scaleOffset = 1.0,
  yOffset = 0,
}) => {
  // Determine dynamic color based on alignment state
  const { strokeColor, glowColor, stateClass } = useMemo(() => {
    if (!alignment.isDetected) {
      return {
        strokeColor: `rgba(255, 255, 255, ${opacity})`,
        glowColor: 'transparent',
        stateClass: 'searching',
      };
    }
    if (alignment.isAligned) {
      return {
        strokeColor: `rgba(52, 211, 153, ${Math.min(0.85, opacity * 1.6)})`,
        glowColor: 'rgba(52, 211, 153, 0.25)',
        stateClass: 'aligned',
      };
    }
    if (alignment.score >= 50) {
      return {
        strokeColor: `rgba(251, 191, 36, ${Math.min(0.75, opacity * 1.3)})`,
        glowColor: 'rgba(251, 191, 36, 0.18)',
        stateClass: 'adjusting',
      };
    }
    return {
      strokeColor: `rgba(248, 113, 113, ${Math.min(0.7, opacity * 1.2)})`,
      glowColor: 'rgba(248, 113, 113, 0.15)',
      stateClass: 'misaligned',
    };
  }, [alignment.isDetected, alignment.isAligned, alignment.score, opacity]);

  // Transform styles for auto or user adjusted scale and position
  const transformStyle = useMemo(() => {
    const scale = scaleOffset;
    return `translate(0px, ${yOffset}px) scale(${scale})`;
  }, [scaleOffset, yOffset]);

  return (
    <div 
      className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden transition-all duration-300"
      style={{
        filter: glowColor !== 'transparent' ? `drop-shadow(0 0 6px ${glowColor})` : 'none',
      }}
    >
      <svg
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full max-h-screen transition-transform duration-300 ease-out"
        style={{ transform: transformStyle, transformOrigin: 'center 40%' }}
      >
        <defs>
          <linearGradient id="fadeVertical" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.9" />
            <stop offset="85%" stopColor={strokeColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.15" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* POSE 1: TO‘LIQ QAD (FULL BODY) */}
        {poseType === 'full_body' && (
          <g
            stroke={strokeColor}
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          >
            {/* Bosh (Head oval & chin) */}
            <path
              d="M 184 75 
                 C 184 52, 216 52, 216 75 
                 C 216 95, 208 108, 200 112 
                 C 192 108, 184 95, 184 75 Z"
            />
            {/* Ko‘z va markaz sathi - juda nafis ingichka chiziq */}
            <line x1="190" y1="78" x2="210" y2="78" strokeDasharray="2 3" strokeWidth="0.9" opacity="0.6" />
            <line x1="200" y1="62" x2="200" y2="92" strokeDasharray="2 4" strokeWidth="0.8" opacity="0.4" />

            {/* Bo‘yin va Yelka (Neck & Shoulders) */}
            <path
              d="M 194 110 C 193 118, 188 124, 172 130 
                 C 152 138, 142 146, 140 162"
            />
            <path
              d="M 206 110 C 207 118, 212 124, 228 130 
                 C 248 138, 258 146, 260 162"
            />
            {/* Yelka gorizontal yo‘naltiruvchi sathi */}
            <line x1="148" y1="135" x2="252" y2="135" strokeDasharray="3 4" strokeWidth="0.8" opacity="0.45" />

            {/* Qo‘llar (Arms) */}
            {/* Chap qo‘l */}
            <path
              d="M 140 162 
                 C 137 195, 134 235, 133 268 
                 C 132 295, 135 315, 138 335"
            />
            <path
              d="M 148 168 
                 C 145 198, 144 235, 143 268 
                 C 142 290, 143 310, 145 330"
            />
            {/* O‘ng qo‘l */}
            <path
              d="M 260 162 
                 C 263 195, 266 235, 267 268 
                 C 268 295, 265 315, 262 335"
            />
            <path
              d="M 252 168 
                 C 255 198, 256 235, 257 268 
                 C 258 290, 257 310, 255 330"
            />

            {/* Gavda va Bel (Torso & Waist) */}
            <path
              d="M 165 142 
                 C 168 180, 168 215, 166 245 
                 C 164 265, 160 282, 156 302"
            />
            <path
              d="M 235 142 
                 C 232 180, 232 215, 234 245 
                 C 236 265, 240 282, 244 302"
            />
            {/* Bel chizig‘i belgisi */}
            <line x1="170" y1="242" x2="230" y2="242" strokeDasharray="2 3" strokeWidth="0.8" opacity="0.35" />

            {/* Chanoq va Oyoqlar (Hips & Legs) */}
            {/* Chap oyoq tashqi konturi */}
            <path
              d="M 156 302 
                 C 152 340, 152 385, 156 430 
                 C 160 470, 163 510, 166 545"
            />
            {/* Chap oyoq ichki konturi */}
            <path
              d="M 194 325 
                 C 192 365, 188 410, 185 450 
                 C 183 485, 182 518, 182 545"
            />

            {/* O‘ng oyoq tashqi konturi */}
            <path
              d="M 244 302 
                 C 248 340, 248 385, 244 430 
                 C 240 470, 237 510, 234 545"
            />
            {/* O‘ng oyoq ichki konturi */}
            <path
              d="M 206 325 
                 C 208 365, 212 410, 215 450 
                 C 217 485, 218 518, 218 545"
            />

            {/* Oyoq kaftlari va pol tayanch belgilari */}
            <ellipse cx="174" cy="548" rx="14" ry="4" strokeDasharray="2 3" opacity="0.6" />
            <ellipse cx="226" cy="548" rx="14" ry="4" strokeDasharray="2 3" opacity="0.6" />
            <line x1="140" y1="552" x2="260" y2="552" strokeDasharray="4 4" strokeWidth="1" opacity="0.5" />
          </g>
        )}

        {/* POSE 2: YARIM QAD / BELDAN YUQORI (MEDIUM SHOT) */}
        {poseType === 'medium_shot' && (
          <g
            stroke={strokeColor}
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          >
            {/* Bosh (Kattaroq portret bosh qismi) */}
            <path
              d="M 174 105 
                 C 174 72, 226 72, 226 105 
                 C 226 138, 214 158, 200 164 
                 C 186 158, 174 138, 174 105 Z"
            />
            {/* Ko‘z sathi chizig‘i */}
            <line x1="184" y1="110" x2="216" y2="110" strokeDasharray="2 3" strokeWidth="0.9" opacity="0.6" />
            <line x1="200" y1="88" x2="200" y2="135" strokeDasharray="2 4" strokeWidth="0.8" opacity="0.4" />

            {/* Bo‘yin va Yoqa (Neck & Collar) */}
            <path d="M 190 162 C 188 178, 180 188, 154 198 C 122 210, 106 226, 102 250" />
            <path d="M 210 162 C 212 178, 220 188, 246 198 C 278 210, 294 226, 298 250" />

            {/* Yelka sathi */}
            <line x1="115" y1="206" x2="285" y2="206" strokeDasharray="3 4" strokeWidth="0.8" opacity="0.45" />

            {/* Qo‘llar va Ko‘krak */}
            <path d="M 102 250 C 96 300, 92 370, 90 440" />
            <path d="M 298 250 C 304 300, 308 370, 310 440" />

            <path d="M 148 220 C 150 280, 146 360, 138 440" />
            <path d="M 252 220 C 250 280, 254 360, 262 440" />

            {/* Bel chizig‘i */}
            <path d="M 138 440 C 170 455, 230 455, 262 440" strokeDasharray="3 3" opacity="0.5" />
          </g>
        )}

        {/* POSE 3: PORTRET / RASMIY / BIZNES (PORTRAIT) */}
        {poseType === 'portrait' && (
          <g
            stroke={strokeColor}
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          >
            {/* Markaziy qat’iy portret boshi */}
            <path
              d="M 166 145 
                 C 166 102, 234 102, 234 145 
                 C 234 188, 218 214, 200 222 
                 C 182 214, 166 188, 166 145 Z"
            />
            {/* Ko‘z balandligi va simmetriya to‘ri */}
            <line x1="176" y1="152" x2="224" y2="152" strokeDasharray="2 3" strokeWidth="1" opacity="0.7" />
            <line x1="200" y1="118" x2="200" y2="185" strokeDasharray="2 4" strokeWidth="0.8" opacity="0.5" />
            {/* Burun va iyak belgilari */}
            <circle cx="200" cy="172" r="1.5" fill={strokeColor} opacity="0.6" />
            <path d="M 192 195 Q 200 198 208 195" strokeWidth="0.9" opacity="0.5" />

            {/* Bo‘yin va yelkalar */}
            <path d="M 186 219 C 184 240, 172 254, 140 268 C 95 285, 75 310, 68 360 C 65 400, 64 450, 64 500" />
            <path d="M 214 219 C 216 240, 228 254, 260 268 C 305 285, 325 310, 332 360 C 335 400, 336 450, 336 500" />

            {/* Yoqa va kostyum/ko‘ylak simmetriya chizig‘i */}
            <path d="M 176 265 L 200 320 L 224 265" strokeDasharray="2 3" opacity="0.45" />
            <line x1="200" y1="320" x2="200" y2="500" strokeDasharray="4 4" opacity="0.35" />
            <line x1="85" y1="280" x2="315" y2="280" strokeDasharray="3 4" strokeWidth="0.8" opacity="0.4" />
          </g>
        )}

        {/* POSE 4: ERKIN / ZAMONAVIY MODEL (CASUAL MODEL) */}
        {poseType === 'casual_model' && (
          <g
            stroke={strokeColor}
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          >
            {/* Biroz burilgan yuz / bosh */}
            <path
              d="M 176 82 
                 C 174 60, 206 56, 212 80 
                 C 216 102, 204 116, 196 120 
                 C 186 116, 177 102, 176 82 Z"
            />
            <line x1="182" y1="84" x2="206" y2="86" strokeDasharray="2 3" strokeWidth="0.9" opacity="0.6" />

            {/* Erkin yelkalar (biri biroz balandroq - tabiiy model pozasi) */}
            <path d="M 188 119 C 185 128, 178 132, 160 138 C 138 146, 130 155, 128 172" />
            <path d="M 204 119 C 206 128, 214 135, 234 144 C 255 154, 264 165, 265 182" />

            {/* Bir qo‘l belda yoki cho‘ntakda */}
            <path d="M 128 172 C 124 205, 120 240, 134 265 C 142 280, 154 285, 164 285" />
            <path d="M 265 182 C 268 215, 269 250, 266 285 C 263 315, 260 340, 256 365" />

            {/* Gavda va engil egilgan bel */}
            <path d="M 155 150 C 158 190, 164 230, 162 260 C 160 285, 152 305, 146 325" />
            <path d="M 235 154 C 230 190, 226 230, 230 260 C 234 285, 240 305, 242 325" />

            {/* Og‘irlik bir oyoqda (Contrapposto) */}
            {/* Asosiy tayanch oyoq */}
            <path d="M 146 325 C 142 370, 144 420, 150 470 C 154 505, 158 535, 160 550" />
            <path d="M 188 340 C 184 385, 180 435, 178 480 C 176 515, 176 538, 176 550" />

            {/* Bo‘shatilgan erkin oyoq */}
            <path d="M 242 325 C 244 370, 238 415, 226 465 C 218 505, 215 530, 216 548" />
            <path d="M 204 340 C 206 385, 204 430, 198 475 C 195 510, 196 532, 198 548" />

            <ellipse cx="168" cy="552" rx="13" ry="4" strokeDasharray="2 3" opacity="0.6" />
            <ellipse cx="207" cy="550" rx="12" ry="4" strokeDasharray="2 3" opacity="0.4" />
          </g>
        )}

        {/* POSE 5: O‘TIRGAN HOLAT (SEATED) */}
        {poseType === 'seated' && (
          <g
            stroke={strokeColor}
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          >
            {/* Bosh */}
            <path
              d="M 182 120 
                 C 182 92, 218 92, 218 120 
                 C 218 145, 208 160, 200 165 
                 C 192 160, 182 145, 182 120 Z"
            />
            <line x1="188" y1="124" x2="212" y2="124" strokeDasharray="2 3" strokeWidth="0.9" opacity="0.6" />

            {/* Yelkalar va tana */}
            <path d="M 192 164 C 190 174, 182 180, 162 188 C 138 198, 128 210, 126 230" />
            <path d="M 208 164 C 210 174, 218 180, 238 188 C 262 198, 272 210, 274 230" />

            {/* Qo‘llar tizzada */}
            <path d="M 126 230 C 122 270, 130 320, 155 350" />
            <path d="M 274 230 C 278 270, 270 320, 245 350" />

            {/* O‘tirgan qad: Bel va tizzalar gorizontal */}
            <path d="M 148 200 C 150 250, 148 300, 140 340 L 120 380 L 124 510" />
            <path d="M 252 200 C 250 250, 252 300, 260 340 L 280 380 L 276 510" />
            <path d="M 140 340 C 160 365, 240 365, 260 340" strokeDasharray="3 3" opacity="0.4" />

            {/* Oyoq kaftlari polga */}
            <line x1="100" y1="512" x2="300" y2="512" strokeDasharray="4 4" opacity="0.45" />
            <ellipse cx="124" cy="510" rx="14" ry="4" strokeDasharray="2 3" opacity="0.5" />
            <ellipse cx="276" cy="510" rx="14" ry="4" strokeDasharray="2 3" opacity="0.5" />
          </g>
        )}

        {/* POSE 6: JUFTLIK / IKKI KISHI (COUPLE) */}
        {poseType === 'couple' && (
          <g
            stroke={strokeColor}
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          >
            {/* Chapdagi odam (biroz balandroq) */}
            <g transform="translate(-45, -10)">
              <path d="M 186 100 C 186 78, 214 78, 214 100 C 214 120, 206 132, 200 136 C 194 132, 186 120, 186 100 Z" />
              <line x1="190" y1="104" x2="210" y2="104" strokeDasharray="2 3" strokeWidth="0.8" opacity="0.6" />
              <path d="M 194 135 C 192 142, 186 148, 168 154 C 146 162, 138 172, 136 190" />
              <path d="M 206 135 C 208 142, 214 148, 226 154 C 238 160, 244 172, 246 190" />
              <path d="M 136 190 C 132 230, 130 300, 134 380 L 142 520" />
              <path d="M 180 200 C 182 250, 184 310, 182 380 L 184 520" />
            </g>

            {/* O‘ngdagi odam */}
            <g transform="translate(45, 5)">
              <path d="M 186 105 C 186 85, 214 85, 214 105 C 214 124, 206 136, 200 140 C 194 136, 186 124, 186 105 Z" />
              <line x1="190" y1="109" x2="210" y2="109" strokeDasharray="2 3" strokeWidth="0.8" opacity="0.6" />
              <path d="M 194 139 C 192 146, 186 152, 174 158 C 162 164, 156 176, 154 194" />
              <path d="M 206 139 C 208 146, 214 152, 232 158 C 254 166, 262 176, 264 194" />
              <path d="M 216 200 C 214 250, 212 310, 214 380 L 212 505" />
              <path d="M 264 194 C 268 230, 270 300, 266 380 L 258 505" />
            </g>

            {/* Markaziy uyg‘unlik chizig‘i */}
            <line x1="200" y1="130" x2="200" y2="480" strokeDasharray="3 5" strokeWidth="0.8" opacity="0.3" />
          </g>
        )}

        {/* DYNAMIC REAL-TIME ALIGNMENT CROSSHAIRS (NOZIK BELGILAR) */}
        {alignment.isDetected && alignment.bodyMetrics && (
          <g className="transition-all duration-200">
            {/* Head target ring with soft pulse */}
            <circle
              cx={alignment.bodyMetrics.headX * 400}
              cy={alignment.bodyMetrics.headY * 600}
              r={alignment.bodyMetrics.headRadius * 600 * 0.8}
              stroke={strokeColor}
              strokeWidth="0.9"
              strokeDasharray="3 3"
              fill="none"
              opacity={alignment.isAligned ? 0.7 : 0.4}
            />

            {/* Small center dot */}
            <circle
              cx={alignment.bodyMetrics.headX * 400}
              cy={alignment.bodyMetrics.headY * 600}
              r="2.5"
              fill={strokeColor}
              opacity={alignment.isAligned ? 0.8 : 0.5}
            />

            {/* Direction arrows when misaligned */}
            {!alignment.isAligned && alignment.direction !== 'center' && (
              <g
                transform={`translate(${alignment.bodyMetrics.headX * 400}, ${alignment.bodyMetrics.headY * 600})`}
                stroke={strokeColor}
                strokeWidth="1.5"
                fill="none"
                opacity="0.8"
              >
                {alignment.direction === 'left' && (
                  <path d="M -24 0 L -36 0 M -30 -6 L -36 0 L -30 6" />
                )}
                {alignment.direction === 'right' && (
                  <path d="M 24 0 L 36 0 M 30 -6 L 36 0 L 30 6" />
                )}
                {alignment.direction === 'up' && (
                  <path d="M 0 -24 L 0 -36 M -6 -30 L 0 -36 L 6 -30" />
                )}
                {alignment.direction === 'down' && (
                  <path d="M 0 24 L 0 36 M -6 30 L 0 36 L 6 30" />
                )}
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};

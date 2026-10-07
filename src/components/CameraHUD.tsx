/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Camera, 
  FlipHorizontal, 
  Grid3X3, 
  Timer, 
  Volume2, 
  VolumeX, 
  Sliders, 
  CheckCircle2, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { AlignmentStatus, CameraSettings, PosePreset, PoseType } from '../types/camera';

interface CameraHUDProps {
  alignment: AlignmentStatus;
  settings: CameraSettings;
  activePreset: PosePreset;
  isCapturing: boolean;
  timerCount: number | null;
  onUpdateSettings: (patch: Partial<CameraSettings>) => void;
  onTogglePoseDrawer: () => void;
  onSwitchCamera: () => void;
  onTriggerShutter: () => void;
  onOpenHelp: () => void;
  onOpenDemoPicker: () => void;
}

export const CameraHUD: React.FC<CameraHUDProps> = ({
  alignment,
  settings,
  activePreset,
  isCapturing,
  timerCount,
  onUpdateSettings,
  onTogglePoseDrawer,
  onSwitchCamera,
  onTriggerShutter,
  onOpenHelp,
  onOpenDemoPicker,
}) => {
  // Timer cycles: 0s -> 3s -> 5s -> 10s -> 0s
  const cycleTimer = () => {
    const cycleMap: Record<number, 0 | 3 | 5 | 10> = { 0: 3, 3: 5, 5: 10, 10: 0 };
    onUpdateSettings({ timerSeconds: cycleMap[settings.timerSeconds] || 0 });
  };

  // Opacity cycles: 0.25 -> 0.40 -> 0.60 -> 0.25
  const cycleOpacity = () => {
    const next = settings.silhouetteOpacity < 0.3 ? 0.40 : settings.silhouetteOpacity < 0.5 ? 0.60 : 0.25;
    onUpdateSettings({ silhouetteOpacity: next });
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
      {/* 1. TOP BAR HUD (Controls) */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        {/* Brand / Mode badge */}
        <div className="flex items-center gap-2 bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-display font-semibold text-xs tracking-wide text-white/90">
            KadrAI
          </span>
          <span className="text-[11px] text-white/50 border-l border-white/15 pl-2">
            {activePreset.titleUz}
          </span>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1.5 bg-black/45 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-sm">
          {/* Timer button */}
          <button
            onClick={cycleTimer}
            className={`min-h-[38px] min-w-[38px] px-2 rounded-full flex items-center justify-center text-xs transition-colors ${
              settings.timerSeconds > 0
                ? 'bg-amber-500/30 text-amber-300 font-medium'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Taymer (0s, 3s, 5s, 10s)"
            aria-label="Taymer"
          >
            <Timer className="w-3.5 h-3.5 mr-1" />
            <span className="text-[11px]">{settings.timerSeconds > 0 ? `${settings.timerSeconds}s` : 'O‘chiq'}</span>
          </button>

          {/* Grid toggle */}
          <button
            onClick={() => onUpdateSettings({ gridEnabled: !settings.gridEnabled })}
            className={`min-h-[38px] min-w-[38px] rounded-full flex items-center justify-center transition-colors ${
              settings.gridEnabled
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Kadr to‘ri (3x3 Oltin nisbat)"
            aria-label="Kadr to‘ri"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>

          {/* Silhouette Opacity cycler */}
          <button
            onClick={cycleOpacity}
            className="min-h-[38px] min-w-[38px] px-2 rounded-full flex items-center justify-center text-[11px] text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Siluet xiraligi"
            aria-label="Siluet xiraligi"
          >
            <Sliders className="w-3.5 h-3.5 mr-1" />
            <span>{Math.round(settings.silhouetteOpacity * 100)}%</span>
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className="min-h-[38px] min-w-[38px] rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Ovozli yo‘riqnoma"
            aria-label="Ovoz"
          >
            {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-50" />}
          </button>

          {/* Switch Camera */}
          <button
            onClick={onSwitchCamera}
            className="min-h-[38px] min-w-[38px] rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Kamerani almashtirish (Oldi / Orqa)"
            aria-label="Kamerani almashtirish"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. CENTER GUIDANCE & ALIGNMENT BADGE */}
      <div className="flex flex-col items-center justify-center w-full my-auto pointer-events-none">
        {/* Big Timer countdown if active */}
        {timerCount !== null && (
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-black/60 border-2 border-amber-400/80 flex items-center justify-center backdrop-blur-md animate-ping absolute inset-0" />
            <div className="w-24 h-24 rounded-full bg-black/80 border-2 border-amber-400 flex items-center justify-center backdrop-blur-md relative shadow-2xl">
              <span className="font-display text-5xl font-bold text-amber-300">
                {timerCount}
              </span>
            </div>
          </div>
        )}

        {/* Real-time Discreet Guidance Prompt (User requirement: juda kichik va interfeysga xalaqit bermaydigan) */}
        <div 
          className={`pointer-events-auto transition-all duration-300 transform max-w-[90%] text-center px-4 py-2 rounded-full backdrop-blur-md border shadow-lg ${
            alignment.isAligned
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
              : alignment.isDetected
              ? alignment.score >= 50
                ? 'bg-amber-950/70 border-amber-500/30 text-amber-200'
                : 'bg-red-950/70 border-red-500/30 text-red-200'
              : 'bg-black/65 border-white/10 text-white/80'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            {alignment.isAligned ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
            )}
            
            <p className="text-xs sm:text-sm font-medium tracking-wide">
              {alignment.guidanceTextUz}
            </p>

            {alignment.isDetected && (
              <span className="text-[11px] font-mono text-white/60 ml-1 border-l border-white/20 pl-2">
                {alignment.score}%
              </span>
            )}
          </div>

          {alignment.secondaryTipUz && (
            <p className="text-[10px] text-white/60 mt-0.5 tracking-tight">
              {alignment.secondaryTipUz}
            </p>
          )}
        </div>
      </div>

      {/* 3. BOTTOM CONTROL ZONE (Pose picker + Shutter Trigger) */}
      <div className="w-full pointer-events-auto flex flex-col items-center gap-3 pb-2 sm:pb-4">
        {/* Pose Preset Selector bar */}
        <button
          onClick={onTogglePoseDrawer}
          className="flex items-center gap-2 bg-black/60 hover:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-white/90 text-xs transition-all active:scale-95 shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Pozitsiya: <strong>{activePreset.titleUz}</strong></span>
          <span className="text-white/40">·</span>
          <span className="text-white/60 text-[11px]">{activePreset.subtitleUz}</span>
        </button>

        {/* Shutter Button Row */}
        <div className="flex items-center justify-between w-full max-w-sm px-6">
          {/* Left: Demo / Sample Picker */}
          <button
            onClick={onOpenDemoPicker}
            className="min-h-[46px] min-w-[46px] rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/80 transition-all active:scale-95"
            title="Sinov rejimi yoki rasm yuklash"
            aria-label="Namuna rasm"
          >
            <Camera className="w-5 h-5 text-white/80" />
          </button>

          {/* Center: BIG TACTILE SHUTTER BUTTON */}
          <div className="relative flex items-center justify-center">
            {alignment.isAligned && (
              <div className="absolute inset-0 rounded-full border-2 border-emerald-400/80 animate-ping" />
            )}
            <button
              onClick={onTriggerShutter}
              disabled={isCapturing}
              className={`min-h-[76px] min-w-[76px] sm:min-h-[82px] sm:min-w-[82px] rounded-full p-1.5 flex items-center justify-center transition-all duration-150 active:scale-90 shadow-2xl ${
                alignment.isAligned
                  ? 'border-4 border-emerald-400 bg-emerald-500/20 shadow-emerald-500/30'
                  : 'border-4 border-white/90 bg-white/10 hover:border-white shadow-black/50'
              }`}
              title="Suratga olish"
              aria-label="Suratga olish"
            >
              <div 
                className={`w-full h-full rounded-full transition-transform duration-150 flex items-center justify-center ${
                  alignment.isAligned
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'bg-white hover:bg-slate-100 text-slate-900'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full border-2 border-black/40" />
              </div>
            </button>
          </div>

          {/* Right: Help / Tips Modal trigger */}
          <button
            onClick={onOpenHelp}
            className="min-h-[46px] min-w-[46px] rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/80 transition-all active:scale-95"
            title="Qo‘llanma va maslahatlar"
            aria-label="Yordam"
          >
            <HelpCircle className="w-5 h-5 text-white/80" />
          </button>
        </div>
      </div>
    </div>
  );
};

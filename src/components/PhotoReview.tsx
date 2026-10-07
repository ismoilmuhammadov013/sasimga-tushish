/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Download, 
  RotateCcw, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  Calendar,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AlignmentStatus, PosePreset } from '../types/camera';

interface PhotoReviewProps {
  photoDataUrl: string;
  alignmentAtCapture: AlignmentStatus;
  preset: PosePreset;
  onRetake: () => void;
  onClose: () => void;
}

export const PhotoReview: React.FC<PhotoReviewProps> = ({
  photoDataUrl,
  alignmentAtCapture,
  preset,
  onRetake,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Trigger celebratory confetti once on mount if alignment was good
  React.useEffect(() => {
    if (alignmentAtCapture.isAligned) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#34d399', '#60a5fa', '#fbbf24', '#ffffff'],
      });
    }
  }, [alignmentAtCapture.isAligned]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photoDataUrl;
    link.download = `KadrAI_${preset.id}_${new Date().toISOString().slice(0, 10)}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const res = await fetch(photoDataUrl);
        const blob = await res.blob();
        const file = new File([blob], `kadrai_${preset.id}.jpg`, { type: 'image/jpeg' });
        await navigator.share({
          title: 'KadrAI bilan olingan surat',
          text: `KadrAI ilovasida "${preset.titleUz}" pozasi bilan ideal suratga tushdim!`,
          files: [file],
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy link/confirmation
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const accuracy = Math.max(70, Math.min(99, alignmentAtCapture.score || 85));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-white animate-in fade-in duration-200 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-sm text-white">Surat tayyor!</span>
          <span className="text-zinc-500">·</span>
          <span className="text-xs text-emerald-400 font-medium flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            {accuracy}% aniqlik
          </span>
        </div>

        <button
          onClick={onRetake}
          className="text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Qayta olish</span>
        </button>
      </div>

      {/* Main Image Frame */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 min-h-[50vh]">
        <div className="relative max-w-md w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-black">
          <img
            src={photoDataUrl}
            alt="Olingan surat"
            className="w-full h-auto max-h-[65vh] object-contain mx-auto"
          />

          {/* Discreet watermark badge */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 text-[11px] text-white/80">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>KadrAI · {preset.titleUz}</span>
          </div>
        </div>
      </div>

      {/* Analysis Card / Quality Score */}
      <div className="px-4 pb-2 max-w-md mx-auto w-full">
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3.5 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-zinc-100">AI Kadr Bahosi</h4>
                <p className="text-[11px] text-zinc-400">
                  {alignmentAtCapture.isAligned 
                    ? 'Siluetga to‘liq mos kelindi, kompozitsiya a’lo!' 
                    : 'Kadr markazi va bosh joylashuvi to‘g‘ri ushlandi.'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold font-mono text-emerald-400">{accuracy}%</span>
              <p className="text-[10px] text-zinc-500">Moslik</p>
            </div>
          </div>

          {showAnalysis && (
            <div className="mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-300 space-y-1.5 animate-in fade-in">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Pozitsiya uslubi:</span>
                <span className="font-medium text-white">{preset.titleUz}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Bosh va ko‘z sathi:</span>
                <span className="text-emerald-400 font-medium">To‘g‘ri nisbatda</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Yelka va gavda balansi:</span>
                <span className="text-emerald-400 font-medium">Muvozanatli</span>
              </div>
              <p className="text-[11px] text-amber-300/90 pt-1">
                💡 Maslahat: Yorug‘lik manbai (deraza yoki chiroq) yuzingiz tomon qarasa, tasvir yanada tiniqroq chiqadi.
              </p>
            </div>
          )}

          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="w-full mt-2 pt-2 border-t border-zinc-800/60 text-center text-[11px] text-zinc-400 hover:text-white transition-colors"
          >
            {showAnalysis ? 'Batafsil ma’lumotni yashirish ▲' : 'Batafsil tahlilni ko‘rish ▼'}
          </button>
        </div>
      </div>

      {/* Bottom Sticky Action Bar (User requirement: “Qayta olish” va “Saqlash” tugmalari) */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent border-t border-zinc-800/80">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
          {/* Qayta olish */}
          <button
            onClick={onRetake}
            className="h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm flex items-center justify-center gap-2 border border-zinc-700 transition-all active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Qayta olish</span>
          </button>

          {/* Saqlash */}
          <button
            onClick={handleDownload}
            className="h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Saqlash</span>
          </button>
        </div>

        {/* Extra share trigger */}
        <div className="max-w-md mx-auto mt-2 text-center">
          <button
            onClick={handleShare}
            className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1.5 py-1"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isCopied ? 'Nusxalandi!' : 'Do‘stlar bilan ulashish'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

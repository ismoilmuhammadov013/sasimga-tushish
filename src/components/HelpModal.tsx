/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, CheckCircle2, ShieldCheck, Camera, Sparkles, Smartphone } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white">
                KadrAI Qanday Ishlaydi?
              </h3>
              <p className="text-[11px] text-zinc-400">
                Suratga tushishdan oldin to‘g‘ri joylashish yo‘riqnomasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[36px] min-w-[36px] rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4 text-xs text-zinc-300 pr-1 leading-relaxed">
          {/* Step 1 */}
          <div className="flex items-start gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
            <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              1
            </span>
            <div>
              <h4 className="font-semibold text-white text-xs mb-1">Xira namunaviy siluet</h4>
              <p className="text-zinc-400">
                Kamera ochilganda ekranda juda yengil, ingichka va yarim shaffof inson konturi paydo bo‘ladi. Bu siz turishingiz kerak bo‘lgan eng ideal namuna.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
            <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              2
            </span>
            <div>
              <h4 className="font-semibold text-white text-xs mb-1">O‘zingizni konturga moslang</h4>
              <p className="text-zinc-400">
                Boshingizni yuqorigi ovalga, yelkalaringizni yelka chiziqlariga va oyoqlaringizni pastki belgilarga to‘g‘rilang.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
            <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              3
            </span>
            <div>
              <h4 className="font-semibold text-white text-xs mb-1">AI Maslahatlariga quloq soling</h4>
              <p className="text-zinc-400">
                AI sizga kichik yozuvlar orqali ko‘rsatma beradi: <span className="text-amber-300">“Bir qadam orqaga”</span>, <span className="text-amber-300">“Bir oz chapga”</span>, <span className="text-amber-300">“Boshingizni yuqoriroq tuting”</span>.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3 bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/30">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              4
            </span>
            <div>
              <h4 className="font-semibold text-emerald-300 text-xs mb-1">Yashil rang va Suratga olish</h4>
              <p className="text-zinc-300">
                Konturga to‘g‘ri mos tushsangiz, chiziqlar nafis yashil rangga o‘tadi va <strong className="text-emerald-400">“✅ Tayyor!”</strong> belgisi chiqadi. Shu onda katta tugmani bosing!
              </p>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-center gap-2 pt-2 text-[11px] text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Kamera tasviri qurilmangizda xavfsiz va maxfiy tahlil qilinadi.</span>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800 mt-auto">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm transition-colors"
          >
            Tushundim, davom etish
          </button>
        </div>
      </div>
    </div>
  );
};

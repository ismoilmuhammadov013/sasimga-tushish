/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Check, User, Users, Briefcase, Sparkles, Armchair } from 'lucide-react';
import { PosePreset, PoseType } from '../types/camera';

export const POSE_PRESETS: PosePreset[] = [
  {
    id: 'full_body',
    titleUz: 'To‘liq qad',
    subtitleUz: 'Boshdan oyoqqacha',
    descriptionUz: 'Butun bo‘y-bast ko‘rinadigan klassik to‘liq kadr. Bosh, yelka va oyoqlar to‘liq belgiga moslanadi.',
    recommendedDistanceUz: '2.5 – 3.5 metr masofadan',
    aspectRatio: 'full',
  },
  {
    id: 'medium_shot',
    titleUz: 'Yarim qad',
    subtitleUz: 'Beldan yuqori',
    descriptionUz: 'Eng ommabop ijtimoiy tarmoq va estetik suratlar uchun. Ko‘krak va bel sathi bo‘yicha moslashuv.',
    recommendedDistanceUz: '1.5 – 2.0 metr masofadan',
    aspectRatio: 'medium',
  },
  {
    id: 'portrait',
    titleUz: 'Portret / Rasmiy',
    subtitleUz: 'Yaqindan yuz va yelka',
    descriptionUz: 'Biznes profil, rezyume yoki pasport uslubidagi jiddiy, simmetrik bosh va ko‘z markazlashuvi.',
    recommendedDistanceUz: '1.0 – 1.4 metr masofadan',
    aspectRatio: 'close',
  },
  {
    id: 'casual_model',
    titleUz: 'Erkin / Model',
    subtitleUz: 'Zamonaviy erkin turish',
    descriptionUz: 'Tabiiy va jonli ko‘rinish: og‘irlik bir oyoqda, yengil burchak ostida relaks poza.',
    recommendedDistanceUz: '2.0 – 3.0 metr masofadan',
    aspectRatio: 'full',
  },
  {
    id: 'seated',
    titleUz: 'O‘tirgan holat',
    subtitleUz: 'Kreslo yoki supa',
    descriptionUz: 'Qulay o‘tirgan holatda kadr kompozitsiyasi va tana mutanosibligi.',
    recommendedDistanceUz: '1.8 – 2.5 metr masofadan',
    aspectRatio: 'medium',
  },
  {
    id: 'couple',
    titleUz: 'Juftlik',
    subtitleUz: 'Ikki kishi uchun',
    descriptionUz: 'Do‘stlar yoki sevishganlar uchun muvozanatli masofa va yonma-yon kompozitsiya.',
    recommendedDistanceUz: '2.5 – 3.5 metr masofadan',
    aspectRatio: 'full',
  },
];

interface PoseSelectorProps {
  isOpen: boolean;
  activePose: PoseType;
  onSelectPose: (pose: PoseType) => void;
  onClose: () => void;
}

export const PoseSelector: React.FC<PoseSelectorProps> = ({
  isOpen,
  activePose,
  onSelectPose,
  onClose,
}) => {
  if (!isOpen) return null;

  const getPoseIcon = (id: PoseType) => {
    switch (id) {
      case 'portrait':
        return <Briefcase className="w-5 h-5" />;
      case 'couple':
        return <Users className="w-5 h-5" />;
      case 'casual_model':
        return <Sparkles className="w-5 h-5" />;
      case 'seated':
        return <Armchair className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab bar affordance for mobile */}
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="font-display font-bold text-base text-white">
              Suratga tushish pozitsiyasini tanlang
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              AI tanlangan namunaga mos xira kontur chizib beradi
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Cards List */}
        <div className="overflow-y-auto py-3 space-y-2.5 pr-1">
          {POSE_PRESETS.map((preset) => {
            const isSelected = activePose === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  onSelectPose(preset.id);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 min-h-[58px] ${
                  isSelected
                    ? 'bg-zinc-800/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-800/40 hover:border-zinc-700'
                }`}
              >
                <div 
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {getPoseIcon(preset.id)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-zinc-100 truncate">
                      {preset.titleUz}
                    </span>
                    {isSelected && (
                      <span className="flex items-center text-[11px] text-emerald-400 font-medium">
                        <Check className="w-3.5 h-3.5 mr-1" /> Faol
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    {preset.descriptionUz}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-zinc-500">
                    <span>Tavsiya: {preset.recommendedDistanceUz}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom footer button */}
        <div className="pt-3 border-t border-zinc-800 mt-auto">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-colors"
          >
            Tanlovni tasdiqlash
          </button>
        </div>
      </div>
    </div>
  );
};

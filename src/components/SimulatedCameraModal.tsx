/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { X, Upload, Check, Image as ImageIcon, Camera } from 'lucide-react';

interface SimulatedCameraModalProps {
  isOpen: boolean;
  onSelectSampleImage: (dataUrl: string) => void;
  onSwitchToRealCamera: () => void;
  onClose: () => void;
  hasLiveCamera: boolean;
}

// Built-in high quality SVG portraits for testing without camera
const SAMPLE_PREVIEWS = [
  {
    id: 'aligned_full',
    title: 'Ideal To‘liq Qad (Mos kelgan)',
    description: 'Bosh, yelka va oyoqlar konturga 90%+ mos keladi',
    badge: '✅ Tayyor holat',
    renderSvg: () => (
      <svg viewBox="0 0 200 300" className="w-full h-full bg-zinc-800">
        <rect width="200" height="300" fill="#18181b" />
        {/* Soft background room elements */}
        <line x1="0" y1="260" x2="200" y2="260" stroke="#27272a" strokeWidth="2" />
        <rect x="20" y="40" width="30" height="80" fill="#27272a" opacity="0.4" />
        {/* Person properly aligned */}
        <circle cx="100" cy="50" r="16" fill="#fbcfe8" />
        <path d="M 85 70 Q 100 78 115 70 L 125 150 L 75 150 Z" fill="#3b82f6" />
        <line x1="88" y1="150" x2="88" y2="260" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
        <line x1="112" y1="150" x2="112" y2="260" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'shifted_right',
    title: 'Chapga siljigan (Tuzatish kerak)',
    description: 'AI “Bir oz o‘ngga” deb ko‘rsatma beradi',
    badge: '⚠️ O‘ngga siljish kerak',
    renderSvg: () => (
      <svg viewBox="0 0 200 300" className="w-full h-full bg-zinc-800">
        <rect width="200" height="300" fill="#18181b" />
        <line x1="0" y1="260" x2="200" y2="260" stroke="#27272a" strokeWidth="2" />
        {/* Person shifted far left */}
        <circle cx="55" cy="55" r="16" fill="#fbcfe8" />
        <path d="M 40 75 Q 55 83 70 75 L 80 155 L 30 155 Z" fill="#f59e0b" />
        <line x1="43" y1="155" x2="43" y2="260" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
        <line x1="67" y1="155" x2="67" y2="260" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'too_close',
    title: 'Juda yaqin (Masofa noto‘g‘ri)',
    description: 'AI “Bir qadam orqaga” deb maslahat beradi',
    badge: '⚠️ Orqaga chekinish kerak',
    renderSvg: () => (
      <svg viewBox="0 0 200 300" className="w-full h-full bg-zinc-800">
        <rect width="200" height="300" fill="#18181b" />
        {/* Giant head taking up the screen */}
        <circle cx="100" cy="80" r="45" fill="#fbcfe8" />
        <path d="M 45 130 Q 100 150 155 130 L 190 300 L 10 300 Z" fill="#10b981" />
      </svg>
    ),
  },
];

export const SimulatedCameraModal: React.FC<SimulatedCameraModalProps> = ({
  isOpen,
  onSelectSampleImage,
  onSwitchToRealCamera,
  onClose,
  hasLiveCamera,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSelectSampleImage(event.target.result as string);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleClick = (id: string) => {
    // Generate data URL from SVG render
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw realistic mock camera scene
    ctx.fillStyle = '#1e1e24';
    ctx.fillRect(0, 0, 640, 960);

    // Floor line
    ctx.fillStyle = '#141418';
    ctx.fillRect(0, 800, 640, 160);

    if (id === 'aligned_full') {
      // Head aligned at target
      ctx.fillStyle = '#f6d5c2';
      ctx.beginPath();
      ctx.arc(320, 150, 42, 0, Math.PI * 2);
      ctx.fill();

      // Shirt / Shoulders
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.moveTo(210, 240);
      ctx.lineTo(430, 240);
      ctx.lineTo(390, 480);
      ctx.lineTo(250, 480);
      ctx.closePath();
      ctx.fill();

      // Legs
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(260, 480, 45, 340);
      ctx.fillRect(335, 480, 45, 340);
    } else if (id === 'shifted_right') {
      // Shifted left
      ctx.fillStyle = '#f6d5c2';
      ctx.beginPath();
      ctx.arc(170, 160, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(70, 250);
      ctx.lineTo(270, 250);
      ctx.lineTo(240, 490);
      ctx.lineTo(100, 490);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(110, 490, 40, 330);
      ctx.fillRect(190, 490, 40, 330);
    } else {
      // Too close
      ctx.fillStyle = '#f6d5c2';
      ctx.beginPath();
      ctx.arc(320, 240, 120, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.moveTo(80, 400);
      ctx.lineTo(560, 400);
      ctx.lineTo(600, 960);
      ctx.lineTo(40, 960);
      ctx.closePath();
      ctx.fill();
    }

    onSelectSampleImage(canvas.toDataURL('image/jpeg', 0.9));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="font-display font-bold text-sm text-white">
              Kamera va Sinov Rejimi
            </h3>
            <p className="text-[11px] text-zinc-400">
              Jonli kamera yoki tayyor namunaviy kadrni tanlang
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[36px] min-w-[36px] rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-3 space-y-3">
          {/* Option 1: Live Camera Button */}
          <button
            onClick={() => {
              onSwitchToRealCamera();
              onClose();
            }}
            className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-colors ${
              hasLiveCamera
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-800/80 border-zinc-700 text-white hover:bg-zinc-800'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <h4 className="text-xs font-semibold">Jonli Kamera (Tavsiya etiladi)</h4>
              <p className="text-[11px] text-zinc-400">
                Telefon yoki veb-kamerangiz orqali real vaqtda yo‘riqnoma olish
              </p>
            </div>
          </button>

          {/* Option 2: Upload Own Photo */}
          <div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800/50 flex items-center gap-3 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <h4 className="text-xs font-semibold text-white">Galereyadan Rasm Yuklash</h4>
                <p className="text-[11px] text-zinc-400">
                  O‘zingizning biror suratingizni AI konturiga solishtirib ko‘ring
                </p>
              </div>
            </button>
          </div>

          {/* Section: Test Demos */}
          <div className="pt-2">
            <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Tezkor Sinov Namunasi (Simulyatsiya)
            </h4>
            <div className="space-y-2">
              {SAMPLE_PREVIEWS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSampleClick(sample.id)}
                  className="w-full p-2.5 rounded-xl border border-zinc-800/80 bg-zinc-950/80 hover:bg-zinc-800/60 flex items-center gap-3 transition-all text-left"
                >
                  <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                    {sample.renderSvg()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-white block truncate">
                      {sample.title}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      {sample.description}
                    </span>
                    <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {sample.badge}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800 mt-auto">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};

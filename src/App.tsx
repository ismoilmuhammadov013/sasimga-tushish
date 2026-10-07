/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  FlipHorizontal, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  Info,
  Maximize2
} from 'lucide-react';
import { 
  AlignmentStatus, 
  CameraSettings, 
  PoseType 
} from './types/camera';
import { PoseFrameAnalyzer } from './utils/poseDetector';
import { cameraAudio } from './utils/audio';
import { SilhouetteOverlay } from './components/SilhouetteOverlay';
import { CameraHUD } from './components/CameraHUD';
import { POSE_PRESETS, PoseSelector } from './components/PoseSelector';
import { PhotoReview } from './components/PhotoReview';
import { HelpModal } from './components/HelpModal';
import { SimulatedCameraModal } from './components/SimulatedCameraModal';

export default function App() {
  // Camera state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [flashActive, setFlashActive] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<CameraSettings>({
    facingMode: 'user', // default to front selfie camera for personal alignment
    timerSeconds: 0,
    gridEnabled: false,
    autoScaleSilhouette: true,
    silhouetteOpacity: 0.35,
    soundEnabled: true,
  });

  // Active pose selection
  const [activePose, setActivePose] = useState<PoseType>('full_body');
  const [isPoseDrawerOpen, setIsPoseDrawerOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  // Simulated static image if camera is not available or user uploads
  const [simulatedImageSrc, setSimulatedImageSrc] = useState<string | null>(null);

  // Live AI alignment analysis state
  const [alignment, setAlignment] = useState<AlignmentStatus>({
    isDetected: false,
    score: 0,
    isAligned: false,
    guidanceTextUz: 'Kadrga kiring va siluetga moslashing',
    direction: 'none',
    bodyMetrics: null,
  });

  // Captured photo state
  const [capturedPhoto, setCapturedPhoto] = useState<{
    dataUrl: string;
    alignmentAtCapture: AlignmentStatus;
  } | null>(null);

  // Timer countdown
  const [timerCount, setTimerCount] = useState<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const staticImgRef = useRef<HTMLImageElement | null>(null);
  const analyzerRef = useRef<PoseFrameAnalyzer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastChimeTimeRef = useRef<number>(0);

  // Current active preset metadata
  const activePreset = POSE_PRESETS.find((p) => p.id === activePose) || POSE_PRESETS[0];

  // Initialize frame analyzer
  useEffect(() => {
    analyzerRef.current = new PoseFrameAnalyzer();
  }, []);

  // Update camera settings helper
  const updateSettings = useCallback((patch: Partial<CameraSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  // Initialize or switch camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      setSimulatedImageSrc(null);

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: settings.facingMode,
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err: unknown) {
      console.warn('Camera access denied or unavailable:', err);
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('Permission') || message.includes('denied')) {
        setCameraError('Kameradan foydalanishga ruxsat berilmadi. Iltimos brauzer sozlamalarida ruxsat bering yoki namunaviy sinovdan foydalaning.');
      } else {
        setCameraError('Kameraga ulanib bo‘lmadi. Sinov rejimi yoki rasm yuklashdan foydalanishingiz mumkin.');
      }
      setCameraActive(false);
    }
  }, [settings.facingMode, stream]);

  // Handle switching camera between front/back
  const handleSwitchCamera = useCallback(() => {
    const nextMode = settings.facingMode === 'user' ? 'environment' : 'user';
    setSettings((prev) => ({ ...prev, facingMode: nextMode }));
  }, [settings.facingMode]);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
  }, [settings.facingMode]);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [stream]);

  // Continuous frame analysis loop
  useEffect(() => {
    let isRunning = true;

    const processLoop = async () => {
      if (!isRunning) return;

      if (analyzerRef.current) {
        const isMirrored = settings.facingMode === 'user' && !simulatedImageSrc;

        if (videoRef.current && cameraActive && videoRef.current.readyState >= 2) {
          const result = await analyzerRef.current.analyzeFrame(
            videoRef.current,
            activePose,
            isMirrored
          );
          setAlignment(result);

          // Play subtle affirmative chime once when aligned
          if (result.isAligned && settings.soundEnabled) {
            const now = Date.now();
            if (now - lastChimeTimeRef.current > 3500) {
              cameraAudio.playAlignedChime();
              lastChimeTimeRef.current = now;
            }
          }
        } else if (simulatedImageSrc && staticImgRef.current && staticImgRef.current.complete) {
          // Analyze simulated image via offscreen canvas
          const canvas = document.createElement('canvas');
          canvas.width = 160;
          canvas.height = 120;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(staticImgRef.current, 0, 0, 160, 120);
            // Mock video-like element
            const mockVideo = {
              readyState: 4,
              videoWidth: 640,
              videoHeight: 480,
            } as any;
            const result = await analyzerRef.current.analyzeFrame(canvas as any, activePose, false);
            setAlignment(result);
          }
        }
      }

      // 15-20 FPS analysis loop is lightweight and battery-friendly
      setTimeout(() => {
        if (isRunning) {
          animFrameRef.current = requestAnimationFrame(processLoop);
        }
      }, 65);
    };

    animFrameRef.current = requestAnimationFrame(processLoop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [cameraActive, simulatedImageSrc, activePose, settings.facingMode, settings.soundEnabled]);

  // Immediate snap capture
  const performCapture = useCallback(() => {
    setIsCapturing(true);

    // Flash animation
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    // Play crisp shutter sound
    if (settings.soundEnabled) {
      cameraAudio.playShutter();
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (videoRef.current && cameraActive) {
        const vw = videoRef.current.videoWidth || 1280;
        const vh = videoRef.current.videoHeight || 720;
        canvas.width = vw;
        canvas.height = vh;

        // Mirror horizontal if user selfie camera
        if (settings.facingMode === 'user') {
          ctx.translate(vw, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoRef.current, 0, 0, vw, vh);
      } else if (simulatedImageSrc && staticImgRef.current) {
        const nw = staticImgRef.current.naturalWidth || 800;
        const nh = staticImgRef.current.naturalHeight || 1200;
        canvas.width = nw;
        canvas.height = nh;
        ctx.drawImage(staticImgRef.current, 0, 0, nw, nh);
      } else {
        // Fallback canvas
        canvas.width = 800;
        canvas.height = 1200;
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, 800, 1200);
      }

      const photoUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedPhoto({
        dataUrl: photoUrl,
        alignmentAtCapture: { ...alignment },
      });
    } finally {
      setIsCapturing(false);
      setTimerCount(null);
    }
  }, [cameraActive, settings.facingMode, settings.soundEnabled, simulatedImageSrc, alignment]);

  // Trigger shutter button (handles timer if enabled)
  const handleTriggerShutter = useCallback(() => {
    if (isCapturing) return;

    if (settings.timerSeconds > 0) {
      let remaining = settings.timerSeconds;
      setTimerCount(remaining);

      if (settings.soundEnabled) {
        cameraAudio.playTimerBeep(false);
      }

      timerIntervalRef.current = window.setInterval(() => {
        remaining -= 1;
        if (remaining > 0) {
          setTimerCount(remaining);
          if (settings.soundEnabled) {
            cameraAudio.playTimerBeep(false);
          }
        } else {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          if (settings.soundEnabled) {
            cameraAudio.playTimerBeep(true);
          }
          setTimerCount(null);
          performCapture();
        }
      }, 1000);
    } else {
      performCapture();
    }
  }, [isCapturing, settings.timerSeconds, settings.soundEnabled, performCapture]);

  // Clean timer interval on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return (
    <main className="relative w-full h-[100dvh] bg-black text-white overflow-hidden flex flex-col select-none touch-none font-sans">
      {/* CAMERA VIEWFINDER CONTAINER */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-zinc-950">
        {/* Real Video Stream */}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            cameraActive ? 'opacity-100' : 'opacity-0 hidden'
          } ${settings.facingMode === 'user' ? '-scale-x-100' : ''}`}
        />

        {/* Simulated Image (if testing without live camera) */}
        {simulatedImageSrc && !cameraActive && (
          <img
            ref={staticImgRef}
            src={simulatedImageSrc}
            alt="Simulyatsiya kadr"
            className="w-full h-full object-cover opacity-90"
          />
        )}

        {/* WELCOME / CAMERA OFF STATE */}
        {!cameraActive && !simulatedImageSrc && (
          <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm mx-auto z-10 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 shadow-xl">
              <Camera className="w-8 h-8 text-emerald-400" />
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white mb-2">
              KadrAI
            </h1>
            
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
              Suratga tushishdan <strong className="text-white">OLDIN</strong> qayerda va qanday turishingizni real vaqtda xira, ingichka siluet orqali ko‘rsatuvchi aqlli kamera.
            </p>

            {cameraError && (
              <div className="flex items-start gap-2.5 bg-red-950/60 border border-red-500/40 p-3 rounded-xl text-left text-xs text-red-200 mb-5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p>{cameraError}</p>
              </div>
            )}

            <div className="w-full space-y-2.5">
              <button
                onClick={startCamera}
                className="w-full py-3.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>📷 Kamerani yoqish</span>
              </button>

              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full py-3 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-98 text-zinc-300 font-medium text-xs flex items-center justify-center gap-2 border border-zinc-800 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Sinov rejimi yoki rasm yuklash</span>
              </button>
            </div>

            <button
              onClick={() => setIsHelpOpen(true)}
              className="mt-5 text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Qanday ishlaydi?</span>
            </button>
          </div>
        )}

        {/* VIEWFINDER GRID OVERLAY (3x3 Rule of thirds) */}
        {settings.gridEnabled && (cameraActive || simulatedImageSrc) && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10 opacity-35">
            <div className="border-r border-b border-white/30" />
            <div className="border-r border-b border-white/30" />
            <div className="border-b border-white/30" />
            <div className="border-r border-b border-white/30" />
            <div className="border-r border-b border-white/30" />
            <div className="border-b border-white/30" />
            <div className="border-r border-white/30" />
            <div className="border-r border-white/30" />
            <div />
          </div>
        )}

        {/* VIEWFINDER CORNER BRACKETS (Pro Camera aesthetic) */}
        {(cameraActive || simulatedImageSrc) && (
          <div className="absolute inset-4 pointer-events-none z-10 opacity-30">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white" />
          </div>
        )}

        {/* THE CORE HERO REQUIREMENT: ULTRA-DELICATE, THIN, TRANSLUCENT SILHOUETTE OVERLAY */}
        {(cameraActive || simulatedImageSrc) && (
          <SilhouetteOverlay
            poseType={activePose}
            alignment={alignment}
            opacity={settings.silhouetteOpacity}
            isMirrored={settings.facingMode === 'user' && !simulatedImageSrc}
          />
        )}

        {/* SHUTTER WHITE FLASH EFFECT */}
        <div 
          className={`absolute inset-0 bg-white z-40 pointer-events-none transition-opacity duration-150 ${
            flashActive ? 'opacity-90' : 'opacity-0'
          }`}
        />

        {/* CAMERA HUD OVERLAY (Controls, Guidance Prompts, Big Shutter) */}
        {(cameraActive || simulatedImageSrc) && (
          <CameraHUD
            alignment={alignment}
            settings={settings}
            activePreset={activePreset}
            isCapturing={isCapturing}
            timerCount={timerCount}
            onUpdateSettings={updateSettings}
            onTogglePoseDrawer={() => setIsPoseDrawerOpen(true)}
            onSwitchCamera={handleSwitchCamera}
            onTriggerShutter={handleTriggerShutter}
            onOpenHelp={() => setIsHelpOpen(true)}
            onOpenDemoPicker={() => setIsDemoModalOpen(true)}
          />
        )}
      </div>

      {/* POSE SELECTOR DRAWER */}
      <PoseSelector
        isOpen={isPoseDrawerOpen}
        activePose={activePose}
        onSelectPose={(pose) => setActivePose(pose)}
        onClose={() => setIsPoseDrawerOpen(false)}
      />

      {/* PHOTO REVIEW & EXPORT MODAL */}
      {capturedPhoto && (
        <PhotoReview
          photoDataUrl={capturedPhoto.dataUrl}
          alignmentAtCapture={capturedPhoto.alignmentAtCapture}
          preset={activePreset}
          onRetake={() => setCapturedPhoto(null)}
          onClose={() => setCapturedPhoto(null)}
        />
      )}

      {/* HOW IT WORKS / HELP MODAL */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* SIMULATED CAMERA / SAMPLE PHOTO MODAL */}
      <SimulatedCameraModal
        isOpen={isDemoModalOpen}
        hasLiveCamera={cameraActive}
        onSelectSampleImage={(dataUrl) => {
          if (stream) {
            stream.getTracks().forEach((t) => t.stop());
          }
          setStream(null);
          setCameraActive(false);
          setSimulatedImageSrc(dataUrl);
        }}
        onSwitchToRealCamera={startCamera}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </main>
  );
}

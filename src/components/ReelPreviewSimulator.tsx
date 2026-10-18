import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Heart,
  Download,
  Share2,
  Sparkles,
  Instagram,
} from 'lucide-react';
import {
  calculateSceneTimeline,
  COMIC_FRAME_THEMES,
  COMIC_MOM_ASSETS,
} from '../utils/videoLogic.ts';

interface ReelPreviewSimulatorProps {
  cartoonPose: 'sweater' | 'searching';
  realPhoto: string | null;
  humorQuote: string;
  emotionalQuote: string;
  taglineText: string;
  themeId: string;
  isPlaying: boolean;
  isMuted: boolean;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onToggleMute: () => void;
  onOpenExportModal: () => void;
  onShareWhatsApp: () => void;
  onShareInstagram: () => void;
  onTriggerTransitionSFX: () => void;
}

interface FloatingSticker {
  id: number;
  x: number;
  emoji: string;
  size: number;
  duration: number;
}

export const ReelPreviewSimulator: React.FC<ReelPreviewSimulatorProps> = ({
  cartoonPose,
  realPhoto,
  humorQuote,
  emotionalQuote,
  taglineText,
  themeId,
  isPlaying,
  isMuted,
  onPlay,
  onPause,
  onRestart,
  onToggleMute,
  onOpenExportModal,
  onShareWhatsApp,
  onShareInstagram,
  onTriggerTransitionSFX,
}) => {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [floatingStickers, setFloatingStickers] = useState<FloatingSticker[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const stickerCounterRef = useRef(0);
  const prevSceneRef = useRef<number>(1);

  const totalDurationMs = 5000;
  const theme = COMIC_FRAME_THEMES[themeId] || COMIC_FRAME_THEMES.comicClassic;
  const cartoonSrc = COMIC_MOM_ASSETS[cartoonPose] || COMIC_MOM_ASSETS.sweater;

  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const tick = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setElapsedMs((prev) => {
        const next = prev + delta;
        if (next >= totalDurationMs) {
          return 0; // seamless loop
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const timeline = calculateSceneTimeline(elapsedMs, totalDurationMs);
  const isScene1 = timeline.activeScene === 1;

  // Trigger comic SFX specifically at the transition moment (Scene 1 -> Scene 2)
  useEffect(() => {
    if (timeline.activeScene === 2 && prevSceneRef.current === 1 && isPlaying && !isMuted) {
      onTriggerTransitionSFX();
    }
    prevSceneRef.current = timeline.activeScene;
  }, [timeline.activeScene, isPlaying, isMuted, onTriggerTransitionSFX]);

  const triggerStickerBurst = () => {
    const emojis = ['❤️', '🧉', '💖', '✨', '🧥', '🌸'];
    const newItems: FloatingSticker[] = Array.from({ length: 5 }).map(() => ({
      id: ++stickerCounterRef.current,
      x: 25 + Math.random() * 50,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      size: 20 + Math.random() * 12,
      duration: 1.8 + Math.random() * 0.6,
    }));
    setFloatingStickers((prev) => [...prev, ...newItems]);

    setTimeout(() => {
      setFloatingStickers((prev) => prev.filter((item) => !newItems.some((n) => n.id === item.id)));
    }, 2400);
  };

  const hasPhotos = Boolean(realPhoto);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Outer Comic Container with Decorative Floating Stickers */}
      <div className="relative">
        {/* Playful Stickers on Bezel */}
        <div className="absolute -top-4 -left-4 z-40 bg-yellow-300 border-2 border-slate-900 rounded-full w-9 h-9 flex items-center justify-center text-lg shadow-comic-sm rotate-[-12deg] animate-comic-bounce">
          🧉
        </div>
        <div className="absolute -top-3 -right-3 z-40 bg-rose-400 border-2 border-slate-900 rounded-full w-9 h-9 flex items-center justify-center text-lg shadow-comic-sm rotate-[12deg] animate-comic-wiggle">
          ❤️
        </div>
        <div className="absolute -bottom-3 -left-3 z-40 bg-sky-300 border-2 border-slate-900 rounded-full px-2 py-0.5 text-xs font-bold font-comic shadow-comic-sm rotate-[8deg]">
          ¡POW! 💥
        </div>
        <div className="absolute -bottom-3 -right-3 z-40 bg-amber-300 border-2 border-slate-900 rounded-full w-9 h-9 flex items-center justify-center text-base shadow-comic-sm rotate-[-8deg]">
          🧥
        </div>

        {/* Smartphone Shell with Comic Styling */}
        <div className="relative w-68 sm:w-76 h-[510px] sm:h-[560px] bg-slate-900 rounded-[38px] p-2.5 shadow-comic-lg border-4 border-slate-900 flex flex-col justify-between select-none overflow-hidden">
          
          {/* Dynamic Island / Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-30 flex items-center justify-end px-2">
            <div className="w-2 h-2 rounded-full bg-slate-700" />
          </div>

          {/* Inner Comic Screen */}
          <div
            className="relative w-full h-full rounded-[28px] overflow-hidden flex flex-col justify-between border-2 border-slate-900"
            style={{ backgroundColor: theme.backgroundColor }}
          >
            {!hasPhotos ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-amber-50">
                <div className="w-14 h-14 rounded-2xl bg-yellow-300 border-3 border-slate-900 flex items-center justify-center text-2xl shadow-comic-sm rotate-[-4deg]">
                  🎨
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 font-comic">
                    Reel Cómic Madre Argentina
                  </p>
                  <p className="text-xs text-slate-600 mt-1 font-comic leading-relaxed">
                    Hacé clic en <strong>"Usar fotos de muestra"</strong> o subí tu foto para ver la caricatura y el final emotivo.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* ESCENA 1: (0.0s – 2.5s) Humor Argentino & Caricatura de Mamá */}
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isScene1 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {/* Cartoon Mom Illustration */}
                  <img
                    src={cartoonSrc}
                    alt="Mamá argentina caricatura"
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isPlaying && isScene1 ? 'animate-comic-zoom' : ''
                    }`}
                  />

                  {/* Top Comic Tag */}
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20">
                    <span className="bg-yellow-300 border-2 border-slate-900 px-3 py-1 rounded-full text-xs font-bold text-slate-900 font-comic shadow-comic-sm whitespace-nowrap">
                      ¡MAMÁ ARGENTINA! 🇦🇷
                    </span>
                  </div>

                  {/* Comic Speech Bubble */}
                  <div className="absolute top-20 left-4 right-4 z-20">
                    <div className="comic-bubble p-3.5 shadow-comic-sm bg-white">
                      <p className="text-slate-900 text-xs sm:text-sm font-bold text-center leading-snug font-comic">
                        {humorQuote || '¡Llevate una campera que va a refrescar! 🧥'}
                      </p>
                    </div>
                  </div>

                  {/* Vignette badge */}
                  <div className="absolute bottom-4 left-4 z-20">
                    <span className="bg-white/95 border-2 border-slate-900 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-800 font-comic shadow-comic-sm">
                      Escena 1 · Humor Criollo
                    </span>
                  </div>
                </div>

                {/* ESCENA 2: (2.5s – 5.0s) Emotivo & Foto Real dentro de Marco Ilustrado */}
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    !isScene1 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                  style={{ backgroundColor: theme.backgroundColor }}
                >
                  {/* Real Photo Frame */}
                  <div className="absolute top-8 left-3.5 right-3.5 bottom-24 rounded-2xl overflow-hidden border-4 border-slate-900 shadow-comic bg-black">
                    {realPhoto && (
                      <img
                        src={realPhoto}
                        alt="Foto real con mamá"
                        className={`w-full h-full object-cover transition-transform ${
                          isPlaying && !isScene1 ? 'animate-comic-zoom' : ''
                        }`}
                      />
                    )}

                    {/* Cute Frame Stickers */}
                    <div className="absolute top-2 left-2 text-xl drop-shadow-sm animate-comic-bounce">
                      ❤️
                    </div>
                    <div className="absolute top-2 right-2 text-xl drop-shadow-sm">
                      ✨
                    </div>
                    <div className="absolute bottom-2 left-2 text-lg drop-shadow-sm">
                      🧉
                    </div>
                    <div className="absolute bottom-2 right-2 text-lg drop-shadow-sm">
                      💖
                    </div>
                  </div>

                  {/* Pop-In Emotional Message Banner */}
                  <div className="absolute bottom-5 left-3 right-3 z-20">
                    <div
                      className={`bg-white border-3 border-slate-900 rounded-2xl p-3 shadow-comic text-center relative ${
                        isPlaying && !isScene1 ? 'animate-pop' : ''
                      }`}
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border-2 border-slate-900 whitespace-nowrap font-comic">
                        ¡TE AMO MAMÁ! ❤️
                      </div>
                      <p className="text-slate-900 text-xs sm:text-sm font-bold leading-snug font-comic pt-1">
                        {emotionalQuote || 'Aunque a veces me vuelvas loco/a... ¡Feliz día, mamá! Te amo ❤️'}
                      </p>
                      <span className="block text-[10px] text-slate-500 font-mono mt-1">
                        {taglineText || 'creado en TuApp.com'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Stories Progress Bar (5.0s linear) */}
                <div className="absolute top-2.5 left-3 right-3 h-2 bg-slate-900/30 rounded-full overflow-hidden z-30 border border-slate-900">
                  <div
                    className="h-full bg-rose-500 transition-all duration-75 ease-linear"
                    style={{ width: `${timeline.overallProgress * 100}%` }}
                  />
                </div>

                {/* Floating Heart & Sticker Reactions */}
                <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                  {floatingStickers.map((item) => (
                    <div
                      key={item.id}
                      className="absolute animate-float-heart"
                      style={{
                        left: `${item.x}%`,
                        bottom: '25%',
                        fontSize: `${item.size}px`,
                      }}
                    >
                      {item.emoji}
                    </div>
                  ))}
                </div>

                {/* MARCA DE AGUA FLOTANTE (ESTILO CÓMIC / STICKER) */}
                <div className="absolute top-3 right-3 bg-white border-2 border-black px-2.5 py-1 rounded-xl shadow-[2px_2px_0px_#000] rotate-2 z-30 flex items-center gap-1 pointer-events-none select-none">
                  <span className="text-[10px] font-black text-slate-900 tracking-tight">BITANOMALY</span>
                  <span className="text-[9px] font-bold text-pink-600">@huapirodriguez</span>
                </div>

                {/* Sound Button */}
                <div className="absolute top-12 right-3 z-30">
                  <button
                    type="button"
                    onClick={onToggleMute}
                    aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
                    className="w-7 h-7 rounded-full bg-white text-slate-900 border-2 border-slate-900 shadow-comic-sm flex items-center justify-center transition cursor-pointer hover:bg-yellow-200"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Heart Burst Reaction Button */}
                <div className="absolute bottom-28 right-3 z-30">
                  <button
                    type="button"
                    onClick={triggerStickerBurst}
                    aria-label="Reaccionar con stickers"
                    className="w-9 h-9 rounded-full bg-rose-500 text-white border-2 border-slate-900 shadow-comic flex items-center justify-center active:scale-90 transition cursor-pointer hover:bg-rose-600 animate-comic-bounce"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                  </button>
                </div>

                {/* Time Indicator */}
                <div className="absolute top-3 left-3 z-30 px-2 py-0.5 rounded-md bg-white border border-slate-900 text-[10px] font-mono font-bold text-slate-900">
                  {(elapsedMs / 1000).toFixed(1)}s / 5.0s
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Simulator Control Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          disabled={!hasPhotos}
          onClick={isPlaying ? onPause : onPlay}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 border-slate-900 shadow-comic-sm flex items-center gap-1.5 transition cursor-pointer font-comic active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
            !hasPhotos
              ? 'opacity-40 cursor-not-allowed bg-slate-300 text-slate-600'
              : isPlaying
              ? 'bg-yellow-300 text-slate-900 hover:bg-yellow-200'
              : 'bg-rose-500 text-white hover:bg-rose-600'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Reproducir Cómic (5s)</span>
            </>
          )}
        </button>

        <button
          type="button"
          disabled={!hasPhotos}
          onClick={onRestart}
          title="Reiniciar reproducción"
          className="p-2 rounded-xl bg-white border-2 border-slate-900 shadow-comic-sm hover:bg-yellow-100 text-slate-900 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          disabled={!hasPhotos}
          onClick={onOpenExportModal}
          className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-900 border-2 border-slate-900 shadow-comic-sm flex items-center gap-1.5 transition cursor-pointer font-comic disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Video</span>
        </button>

        <button
          type="button"
          onClick={onShareWhatsApp}
          title="Compartir en WhatsApp"
          className="p-2 rounded-xl bg-emerald-500 text-white border-2 border-slate-900 shadow-comic-sm hover:bg-emerald-600 transition cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onShareInstagram}
          title="Compartir en Instagram Stories"
          className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white border-2 border-slate-900 shadow-comic-sm hover:brightness-110 transition cursor-pointer"
        >
          <Instagram className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

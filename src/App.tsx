/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  Sparkles,
  Play,
  RotateCcw,
  Download,
  Share2,
  CheckCircle2,
  Coffee,
  Smile,
  Dices,
  Instagram,
} from 'lucide-react';
import { Header } from './components/Header.tsx';
import { PhotoUploader } from './components/PhotoUploader.tsx';
import { CustomMessageEditor } from './components/CustomMessageEditor.tsx';
import { MusicSelector } from './components/MusicSelector.tsx';
import { ThemeSelector } from './components/ThemeSelector.tsx';
import { SFXSelector } from './components/SFXSelector.tsx';
import { ReelPreviewSimulator } from './components/ReelPreviewSimulator.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import { VideoAudioPlayer } from './utils/audioEngine.ts';
import {
  generateWhatsAppMessage,
  ARGENTINE_MOM_HUMOR_QUOTES,
  ARGENTINE_MOM_EMOTIONAL_QUOTES,
} from './utils/videoLogic.ts';

// Frases típicas de Mamá Argentina
export const FRASES_MAMA = [
  "¡Llevate una campera que va a refrescar! 🧥",
  "¿Y si lo encuentro yo qué te hago? 🤨",
  "¡Mientras vivas bajo este techo...! 🏠",
  "¿Te pensás que soy de plata? 💸",
  "¡La que limpia en esta casa soy yo! 🧼",
  "¡Un día voy a tirar todo a la basura! 🗑️",
  "¿Y si tus amigos se tiran de un puente, vos también te tirás? 🌉",
  "¡Vení para acá que no te voy a hacer nada! 🏃",
];

// Foto de muestra de alta fidelidad para prueba en 1 clic
const SAMPLE_PHOTO_MOTHER = '/src/assets/images/sample_mother_photo_1792293690256.jpg';

export default function App() {
  // Estado canónico de frase, foto y reproducción de escenas
  const [fraseActual, setFraseActual] = useState(FRASES_MAMA[0]);
  const [fotoReal, setFotoReal] = useState<string | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [escena, setEscena] = useState<1 | 2>(1);

  // Personaje en caricatura de mamá (Escena 1)
  const [selectedCartoonPose, setSelectedCartoonPose] = useState<'sweater' | 'searching'>('sweater');

  // Mensaje de cierre emotivo y dedicatoria (Escena 2)
  const [emotionalQuote, setEmotionalQuote] = useState(ARGENTINE_MOM_EMOTIONAL_QUOTES[0]);
  const [taglineText, setTaglineText] = useState('creado en TuApp.com');
  const [momName, setMomName] = useState('');
  const [senderName, setSenderName] = useState('');

  // Audio: Pista de fondo y Efecto de Sonido Cómic para transición
  const [selectedTrackId, setSelectedTrackId] = useState('lullaby');
  const [selectedSFXId, setSelectedSFXId] = useState('boing');
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [customAudioName, setCustomAudioName] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.85);
  const [isPreviewingAudio, setIsPreviewingAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Marco de historieta y modal
  const [themeId, setThemeId] = useState('comicClassic');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const audioPlayerRef = useRef<VideoAudioPlayer | null>(null);
  const previewSectionRef = useRef<HTMLDivElement>(null);
  const editorSectionRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<{ escena2?: NodeJS.Timeout; final?: NodeJS.Timeout }>({});

  // Inicializar Web Audio Player
  useEffect(() => {
    audioPlayerRef.current = new VideoAudioPlayer();
    return () => {
      audioPlayerRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    audioPlayerRef.current?.setVolume(volume);
  }, [volume]);

  // Limpiar temporizadores al desmontar
  useEffect(() => {
    return () => {
      if (timersRef.current.escena2) clearTimeout(timersRef.current.escena2);
      if (timersRef.current.final) clearTimeout(timersRef.current.final);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Cambiar a una frase típica al azar diferente de la actual
  const cambiarFraseAleatoria = () => {
    const disponibles = FRASES_MAMA.filter((f) => f !== fraseActual);
    const nueva = disponibles[Math.floor(Math.random() * disponibles.length)] || FRASES_MAMA[0];
    setFraseActual(nueva);
    showToast('¡Nueva frase de mamá seleccionada! 🎲');
  };

  // Iniciar la reproducción sincronizada de 5 segundos con transición SFX a los 2.5s
  const iniciarVistaPrevia = () => {
    if (!fotoReal) {
      showToast('¡Cargá tu foto o hacé clic en "Usar fotos de muestra" para ver el reel!');
      return;
    }

    if (timersRef.current.escena2) clearTimeout(timersRef.current.escena2);
    if (timersRef.current.final) clearTimeout(timersRef.current.final);

    setReproduciendo(true);
    setEscena(1);

    if (!isMuted && selectedTrackId !== 'none') {
      audioPlayerRef.current?.playTrack(selectedTrackId, customAudioUrl, volume);
    }

    // Cambiar a Escena 2 a los 2.5 segundos (2500ms) y disparar el SFX de transición
    timersRef.current.escena2 = setTimeout(() => {
      setEscena(2);
      if (!isMuted && selectedSFXId !== 'none') {
        audioPlayerRef.current?.playTransitionSFX(selectedSFXId);
      }
    }, 2500);

    // Finalizar ciclo de simulación a los 5 segundos
    timersRef.current.final = setTimeout(() => {
      // Reinicia automáticamente el bucle para mantener el reel en reproducción
      iniciarVistaPrevia();
    }, 5000);
  };

  const pausarVistaPrevia = () => {
    if (timersRef.current.escena2) clearTimeout(timersRef.current.escena2);
    if (timersRef.current.final) clearTimeout(timersRef.current.final);
    setReproduciendo(false);
    audioPlayerRef.current?.stop();
    setIsPreviewingAudio(false);
  };

  const reiniciarVistaPrevia = () => {
    pausarVistaPrevia();
    setTimeout(() => {
      iniciarVistaPrevia();
    }, 100);
  };

  const toggleSilencio = () => {
    if (isMuted) {
      setIsMuted(false);
      if (reproduciendo && selectedTrackId !== 'none') {
        audioPlayerRef.current?.playTrack(selectedTrackId, customAudioUrl, volume);
      }
    } else {
      setIsMuted(true);
      audioPlayerRef.current?.stop();
    }
  };

  // Disparar SFX en la transición de Escena 1 a Escena 2
  const handleTriggerTransitionSFX = () => {
    if (!isMuted && selectedSFXId !== 'none') {
      audioPlayerRef.current?.playTransitionSFX(selectedSFXId);
    }
  };

  const handlePreviewSFX = (sfxId: string) => {
    audioPlayerRef.current?.playTransitionSFX(sfxId);
  };

  // Carga instantánea con foto de muestra
  const handleLoadSamplePhotos = () => {
    setFotoReal(SAMPLE_PHOTO_MOTHER);
    showToast('¡Foto de muestra lista! Mirá el reel cómic');
    setTimeout(() => {
      iniciarVistaPrevia();
      previewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
  };

  const handleSelectTrack = (trackId: string) => {
    setSelectedTrackId(trackId);
    if (reproduciendo && !isMuted) {
      audioPlayerRef.current?.playTrack(trackId, customAudioUrl, volume);
    } else if (isPreviewingAudio) {
      audioPlayerRef.current?.playTrack(trackId, customAudioUrl, volume);
    }
  };

  const handleUploadCustomAudio = (file: File) => {
    const url = URL.createObjectURL(file);
    setCustomAudioUrl(url);
    setCustomAudioName(file.name);
    setSelectedTrackId('custom');
    showToast(`Audio "${file.name}" cargado`);
    if (reproduciendo && !isMuted) {
      audioPlayerRef.current?.playTrack('custom', url, volume);
    }
  };

  const handleToggleAudioPreview = () => {
    if (isPreviewingAudio) {
      audioPlayerRef.current?.stop();
      setIsPreviewingAudio(false);
    } else {
      setIsPreviewingAudio(true);
      audioPlayerRef.current?.playTrack(selectedTrackId, customAudioUrl, volume);
    }
  };

  const handleShareWhatsApp = () => {
    const text = generateWhatsAppMessage(fraseActual, emotionalQuote, momName, senderName);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareInstagram = () => {
    const caption = `🇦🇷 Feliz Día de la Madre ❤️\n\n"${fraseActual}"\n\n${emotionalQuote}\n\n#DiaDeLaMadre #MamaArgentina #ReelMama #AmorDeMadre`;
    navigator.clipboard.writeText(caption);
    showToast('¡Texto copiado para tu Historia o Reel de Instagram! Abriendo Instagram...');
    setTimeout(() => {
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    }, 600);
  };

  const hasPhotos = Boolean(fotoReal);

  return (
    <div className="min-h-screen bg-amber-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans'] relative bg-comic-dots">
      {/* Comic Header */}
      <Header
        onScrollToEditor={() => {
          editorSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        onUseSamplePhotos={handleLoadSamplePhotos}
      />

      {/* Hero Banner: Comic Style with Argentine Humor */}
      <section className="relative overflow-hidden border-b-4 border-slate-900 bg-yellow-200/90 py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border-2 border-slate-900 shadow-comic-sm text-slate-900 text-xs font-bold font-['Fredoka'] rotate-[-1deg]">
            <span>🇦🇷 Especial Día de la Madre Argentina</span>
            <span aria-hidden="true">·</span>
            <span>Estilo Cómic 2D & Humor Criollo</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight font-['Fredoka']">
            ¡Hacé reír y emocionar a Mamá con un{' '}
            <span className="text-rose-600 underline decoration-wavy decoration-yellow-400">
              Reel de Historieta
            </span>!
          </h1>

          <p className="text-slate-800 text-sm sm:text-base max-w-2xl mx-auto font-['Fredoka'] leading-relaxed">
            Escena 1 te saca una sonrisa con las frases típicas de mamá en caricatura y Escena 2 conmueve con tu foto real, corazones y dedicatoria en 5 segundos.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleLoadSamplePhotos}
              className="px-5 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-xs sm:text-sm border-3 border-slate-900 shadow-comic hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 transition-all cursor-pointer font-['Fredoka']"
            >
              <Sparkles className="w-4 h-4" />
              <span>Usar fotos de muestra (1 Clic)</span>
            </button>

            <button
              onClick={cambiarFraseAleatoria}
              className="px-4 py-3 bg-white hover:bg-yellow-100 text-slate-900 border-3 border-slate-900 rounded-2xl text-xs sm:text-sm font-bold shadow-comic-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 transition-all cursor-pointer font-['Fredoka']"
            >
              <Dices className="w-4 h-4 text-rose-600" />
              <span>Cambiar Frase de Humor 🎲</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Studio: 2 Columns */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Herramientas de Creación (7 Cols) */}
          <div ref={editorSectionRef} className="lg:col-span-7 space-y-6">
            
            {/* 1. Personajes Cómic y Carga de Foto Real */}
            <div className="bg-white border-4 border-slate-900 rounded-3xl p-5 sm:p-6 shadow-comic space-y-5">
              <PhotoUploader
                realPhoto={fotoReal}
                selectedCartoonPose={selectedCartoonPose}
                onRealPhotoChange={setFotoReal}
                onSelectCartoonPose={setSelectedCartoonPose}
                onLoadSamplePhotos={handleLoadSamplePhotos}
              />

              {/* Botón Principal de Generar / Vista Previa */}
              <button
                type="button"
                disabled={!hasPhotos}
                onClick={iniciarVistaPrevia}
                className={`w-full py-4 text-white font-bold rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer border-3 border-slate-900 font-['Fredoka'] ${
                  !hasPhotos
                    ? 'opacity-40 cursor-not-allowed bg-slate-400 text-slate-700'
                    : 'bg-rose-500 hover:bg-rose-600 shadow-comic hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {hasPhotos
                    ? 'Ver Video Cómic (5s) ✨'
                    : 'Cargá tu foto o probá con fotos de muestra'}
                </span>
              </button>
            </div>

            {/* 2. Editor de Guion de Mensajes (Frase Cómic + Mensaje Emotivo) */}
            <div className="bg-white border-4 border-slate-900 rounded-3xl p-5 sm:p-6 shadow-comic">
              <CustomMessageEditor
                humorQuote={fraseActual}
                emotionalQuote={emotionalQuote}
                taglineText={taglineText}
                momName={momName}
                senderName={senderName}
                onHumorQuoteChange={setFraseActual}
                onEmotionalQuoteChange={setEmotionalQuote}
                onTaglineChange={setTaglineText}
                onMomNameChange={setMomName}
                onSenderNameChange={setSenderName}
              />
            </div>

            {/* 3. Capa de Efectos de Sonido Cómicos para Transición (SFX) */}
            <div className="bg-white border-4 border-slate-900 rounded-3xl p-5 sm:p-6 shadow-comic">
              <SFXSelector
                selectedSFXId={selectedSFXId}
                onSelectSFX={setSelectedSFXId}
                onPreviewSFX={handlePreviewSFX}
              />
            </div>

            {/* 4. Selector de Marcos Cómic */}
            <div className="bg-white border-4 border-slate-900 rounded-3xl p-5 sm:p-6 shadow-comic">
              <ThemeSelector
                selectedThemeId={themeId}
                onSelectTheme={setThemeId}
              />
            </div>

            {/* 5. Selector de Música de Fondo */}
            <div className="bg-white border-4 border-slate-900 rounded-3xl p-5 sm:p-6 shadow-comic">
              <MusicSelector
                selectedTrackId={selectedTrackId}
                customAudioName={customAudioName}
                volume={volume}
                isPreviewingAudio={isPreviewingAudio}
                onSelectTrack={handleSelectTrack}
                onUploadCustomAudio={handleUploadCustomAudio}
                onVolumeChange={setVolume}
                onToggleAudioPreview={handleToggleAudioPreview}
              />
            </div>

          </div>

          {/* Columna Derecha: Reproductor Simulador Móvil 9:16 (5 Cols, Sticky) */}
          <div ref={previewSectionRef} className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white border-4 border-slate-900 rounded-3xl p-5 sm:p-6 shadow-comic flex flex-col items-center">
              
              <div className="w-full flex items-center justify-between pb-3 border-b-2 border-slate-200 mb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Fredoka'] flex items-center gap-1.5">
                    <span>Simulador Móvil 9:16</span>
                    <span className="text-[10px] bg-yellow-300 text-slate-900 border border-slate-900 px-2 py-0.5 rounded-full font-['Fredoka']">
                      {escena === 1 ? 'Escena 1 (Humor)' : 'Escena 2 (Emotivo)'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-600 font-['Fredoka']">
                    5s: Caricatura + Transición SFX + Foto Real
                  </p>
                </div>

                {hasPhotos && (
                  <button
                    type="button"
                    onClick={reiniciarVistaPrevia}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer font-['Fredoka']"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reiniciar</span>
                  </button>
                )}
              </div>

              {/* Reproductor Cómic 9:16 */}
              <ReelPreviewSimulator
                cartoonPose={selectedCartoonPose}
                realPhoto={fotoReal}
                humorQuote={fraseActual}
                emotionalQuote={emotionalQuote}
                taglineText={taglineText}
                themeId={themeId}
                isPlaying={reproduciendo}
                isMuted={isMuted}
                onPlay={iniciarVistaPrevia}
                onPause={pausarVistaPrevia}
                onRestart={reiniciarVistaPrevia}
                onToggleMute={toggleSilencio}
                onTriggerTransitionSFX={handleTriggerTransitionSFX}
                onOpenExportModal={() => setIsExportModalOpen(true)}
                onShareWhatsApp={handleShareWhatsApp}
                onShareInstagram={handleShareInstagram}
              />

              {/* Barra de Acciones del Reproductor */}
              <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-4 border-t-2 border-slate-200">
                <button
                  type="button"
                  disabled={!hasPhotos}
                  onClick={() => setIsExportModalOpen(true)}
                  className="w-full py-2.5 px-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold border-2 border-slate-900 shadow-comic-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] flex items-center justify-center gap-1 transition cursor-pointer font-['Fredoka'] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Bajar Video</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareInstagram}
                  className="w-full py-2.5 px-2 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:brightness-110 text-white rounded-xl text-xs font-bold border-2 border-slate-900 shadow-comic-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] flex items-center justify-center gap-1 transition cursor-pointer font-['Fredoka']"
                >
                  <Instagram className="w-3.5 h-3.5 text-white" />
                  <span>Instagram</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-full py-2.5 px-2 bg-emerald-400 hover:bg-emerald-300 text-slate-900 rounded-xl text-xs font-bold border-2 border-slate-900 shadow-comic-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] flex items-center justify-center gap-1 transition cursor-pointer font-['Fredoka']"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-900" />
                  <span>WhatsApp</span>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Sección de Costumbres y Consejos */}
        <section className="mt-14 pt-8 border-t-3 border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 bg-yellow-100 border-3 border-slate-900 rounded-2xl shadow-comic-sm space-y-1.5">
            <span className="text-2xl">🧥</span>
            <h4 className="text-sm font-bold text-slate-900 font-['Fredoka']">El Mito de la Campera</h4>
            <p className="text-xs text-slate-700 font-['Fredoka'] leading-relaxed">
              No importa si hacen 35 grados a la sombra: toda mamá argentina sabe que "a la noche va a refrescar".
            </p>
          </div>

          <div className="p-4 bg-sky-100 border-3 border-slate-900 rounded-2xl shadow-comic-sm space-y-1.5">
            <span className="text-2xl">🧉</span>
            <h4 className="text-sm font-bold text-slate-900 font-['Fredoka']">Los Mates de la Mañana</h4>
            <p className="text-xs text-slate-700 font-['Fredoka'] leading-relaxed">
              El domingo de las madres arranca temprano con la pava en el fuego, facturas de dulce de leche y anécdotas de familia.
            </p>
          </div>

          <div className="p-4 bg-rose-100 border-3 border-slate-900 rounded-2xl shadow-comic-sm space-y-1.5">
            <span className="text-2xl">💖</span>
            <h4 className="text-sm font-bold text-slate-900 font-['Fredoka']">Amor Incondicional</h4>
            <p className="text-xs text-slate-700 font-['Fredoka'] leading-relaxed">
              Detrás de cada reto cariñoso hay un amor infinito. ¡Sorprendela con este homenaje en su día!
            </p>
          </div>
        </section>
      </main>

      {/* Modal de Exportación */}
      {fotoReal && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          cartoonPose={selectedCartoonPose}
          realPhoto={fotoReal}
          humorQuote={fraseActual}
          emotionalQuote={emotionalQuote}
          taglineText={taglineText}
          momName={momName}
          senderName={senderName}
          themeId={themeId}
          audioTrack={audioPlayerRef.current?.getAudioStream() || null}
          onTriggerTransitionSFX={handleTriggerTransitionSFX}
        />
      )}

      {/* Notificación Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-yellow-300 border-3 border-slate-900 text-slate-900 text-xs font-bold shadow-comic flex items-center gap-2 font-['Fredoka'] animate-pop">
          <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Pie de Página Cómic */}
      <footer className="border-t-3 border-slate-900 bg-yellow-200/90 py-5 px-4 text-center text-xs font-bold font-['Fredoka'] text-slate-800">
        <p>
          Madre Reels Argentina 🇦🇷 · Creado con humor y mucho amor para todas las mamás · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

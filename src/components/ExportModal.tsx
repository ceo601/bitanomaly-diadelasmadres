import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  Check,
  Video,
  Image as ImageIcon,
  Loader2,
  Instagram,
  Smartphone,
  Cloud,
  Sparkles,
} from 'lucide-react';
import { exportReelVideo } from '../utils/videoExporter.ts';
import { generateWhatsAppMessage, COMIC_MOM_ASSETS } from '../utils/videoLogic.ts';
import { auth, googleProvider, signInWithPopup } from '../firebase/config.ts';
import { saveReelToFirestore } from '../firebase/reelsService.ts';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartoonPose: 'sweater' | 'searching';
  realPhoto: string;
  humorQuote: string;
  emotionalQuote: string;
  taglineText: string;
  momName: string;
  senderName: string;
  themeId: string;
  audioTrack: MediaStreamTrack | null;
  onTriggerTransitionSFX?: () => void;
  onReelSavedToFirebase?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  cartoonPose,
  realPhoto,
  humorQuote,
  emotionalQuote,
  taglineText,
  momName,
  senderName,
  themeId,
  audioTrack,
  onTriggerTransitionSFX,
  onReelSavedToFirebase,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [copiedInstagram, setCopiedInstagram] = useState(false);
  const [gallerySaved, setGallerySaved] = useState(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [cloudSaved, setCloudSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const cartoonImgUrl = COMIC_MOM_ASSETS[cartoonPose] || COMIC_MOM_ASSETS.sweater;

  const getOrGenerateBlob = async (): Promise<Blob> => {
    if (lastBlob) return lastBlob;

    setIsExporting(true);
    setExportProgress(0);
    setErrorMessage(null);

    try {
      const blob = await exportReelVideo({
        cartoonImgUrl,
        realPhotoUrl: realPhoto,
        humorQuote,
        emotionalQuote,
        taglineText,
        themeId,
        audioTrack,
        onTriggerTransitionSFX,
        onProgress: (p) => setExportProgress(Math.round(p * 100)),
      });

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setLastBlob(blob);
      return blob;
    } finally {
      setIsExporting(false);
    }
  };

  const handleStartExport = async () => {
    try {
      const blob = await getOrGenerateBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Madre_Reels_Comic_Argentina_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setInfoNotice('¡Descarga iniciada! El video 9:16 está listo.');
    } catch (err: unknown) {
      console.error('Export error:', err);
      setErrorMessage('Ocurrió un error al procesar el video. Intentá nuevamente.');
    }
  };

  /**
   * Guarda el video directamente en la galería de fotos del usuario (Carrete / Photos).
   * En dispositivos móviles (iOS / Android) abre la hoja nativa con la opción directa
   * "Guardar video" en la galería de fotos o publicación directa en Historias de Instagram.
   */
  const handleSaveToGallery = async () => {
    setErrorMessage(null);
    setInfoNotice(null);

    try {
      const blob = await getOrGenerateBlob();
      const videoFilename = `Reel_Mama_Argentina_${Date.now()}.webm`;

      // 1. Intento con Web Share API con archivos (Soporte nativo en celulares y navegadores modernos)
      if (typeof navigator !== 'undefined' && 'canShare' in navigator) {
        try {
          const file = new File([blob], videoFilename, { type: blob.type || 'video/webm' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Reel Día de la Madre 🇦🇷',
              text: '¡Guardá este video en tu Galería de Fotos / Carrete y subilo directo a tu Historia de Instagram! 🎬❤️',
            });
            setGallerySaved(true);
            setInfoNotice('¡Listo! Seleccioná "Guardar video" para añadirlo a tu Galería/Carrete o tocale a "Historias de Instagram".');
            setTimeout(() => setGallerySaved(false), 4000);
            return;
          }
        } catch (shareErr) {
          // Si el usuario canceló el diálogo o falló, continuamos al método siguiente
          if (shareErr instanceof Error && shareErr.name === 'AbortError') {
            return;
          }
        }
      }

      // 2. Intento con File System Access API (Navegadores desktop compatibles para elegir carpeta de Fotos/Galería)
      if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: videoFilename,
            types: [
              {
                description: 'Video Reel Vertical (WebM / MP4)',
                accept: {
                  'video/webm': ['.webm'],
                  'video/mp4': ['.mp4'],
                },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          setGallerySaved(true);
          setInfoNotice('¡Guardado directamente en tu carpeta de Fotos/Galería! Listo para Instagram Story.');
          setTimeout(() => setGallerySaved(false), 4000);
          return;
        } catch (fsErr) {
          if (fsErr instanceof Error && fsErr.name === 'AbortError') {
            return;
          }
        }
      }

      // 3. Fallback directo de descarga optimizado para el carrete del dispositivo
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = videoFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setGallerySaved(true);
      setInfoNotice('¡Video descargado a tu Galería! Podés abrir Instagram > Tu Historia y seleccionarlo.');
      setTimeout(() => setGallerySaved(false), 4000);
    } catch (err: unknown) {
      console.error('Save to gallery error:', err);
      setErrorMessage('No se pudo guardar automáticamente en la galería. Podés usar la descarga estándar.');
    }
  };

  /**
   * Guarda el homenaje en Firebase Firestore
   */
  const handleSaveToCloud = async () => {
    setIsSavingToCloud(true);
    setErrorMessage(null);

    try {
      if (!auth.currentUser) {
        await signInWithPopup(auth, googleProvider);
      }

      await saveReelToFirestore({
        authorName: senderName || 'Hijo/a',
        momName: momName || 'Mamá',
        humorQuote,
        emotionalQuote,
        frameStyle: themeId,
        cartoonPose,
        photoUrl: realPhoto,
        isPublic: true,
      });

      setCloudSaved(true);
      setInfoNotice('¡Reel guardado en la nube de Firebase! Ya aparece en el Muro Comunitario.');
      onReelSavedToFirebase?.();
      setTimeout(() => setCloudSaved(false), 4000);
    } catch (err: unknown) {
      console.error('Cloud save error:', err);
      setErrorMessage('No se pudo guardar en la nube. Comprobá tu inicio de sesión de Google.');
    } finally {
      setIsSavingToCloud(false);
    }
  };

  const handleDownloadCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(0, 0, 1080, 1350);

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(70, 100, 940, 850, 40);
      ctx.clip();
      ctx.drawImage(img, 70, 100, 940, 850);
      ctx.restore();

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.roundRect(70, 100, 940, 850, 40);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(70, 990, 940, 260, 30);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.roundRect(60, 980, 940, 260, 30);
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 48px "Fredoka", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(emotionalQuote, 530, 1100, 880);

      ctx.font = '700 24px "Space Mono", monospace';
      ctx.fillStyle = '#f43f5e';
      ctx.fillText(taglineText, 530, 1190);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Postal_Dia_De_La_Madre_${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      });
    };
    img.src = realPhoto;
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppMessage(humorQuote, emotionalQuote, momName, senderName);
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  const handleShareInstagram = async () => {
    const caption = `🇦🇷 Feliz Día de la Madre ❤️\n\n"${humorQuote}"\n\n${emotionalQuote}\n\n#DiaDeLaMadre #MamaArgentina #ReelMama #AmorDeMadre`;

    if (lastBlob && navigator.canShare) {
      try {
        const file = new File([lastBlob], 'Reel_Dia_De_La_Madre.webm', { type: 'video/webm' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Reel Día de la Madre 🇦🇷',
            text: caption,
          });
          return;
        }
      } catch {
        // Fallback
      }
    }

    navigator.clipboard.writeText(caption);
    setCopiedInstagram(true);
    setTimeout(() => setCopiedInstagram(false), 3000);

    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-yellow-50 border-4 border-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-comic-lg relative space-y-4 animate-pop max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-800 bg-white hover:bg-rose-500 hover:text-white border-2 border-slate-900 shadow-comic-sm transition cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-14 h-14 rounded-2xl bg-rose-500 border-3 border-slate-900 shadow-comic flex items-center justify-center text-white mx-auto rotate-[-4deg]">
            <Video className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 pt-2 font-comic">
            ¡Exportar y Compartir Reel! 🎬
          </h2>
          <p className="text-xs text-slate-700 font-comic">
            Video vertical 9:16 de 5 segundos con humor, efectos de sonido y final emotivo.
          </p>
        </div>

        {/* Export progress */}
        {isExporting ? (
          <div className="space-y-3 py-4 text-center bg-white rounded-2xl p-4 border-3 border-slate-900 shadow-comic-sm">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto" />
            <div>
              <p className="text-xs font-bold text-slate-900 font-comic">
                Renderizando video con SFX... {exportProgress}%
              </p>
              <p className="text-[11px] text-slate-600 font-comic mt-0.5">
                Dibujando viñetas, globitos de diálogo y mezclando audio de transición
              </p>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden border-2 border-slate-900">
              <div
                className="bg-rose-500 h-full transition-all duration-150"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* BOTÓN PRINCIPAL: GUARDAR DIRECTO EN GALERÍA DE FOTOS / CARRETE */}
            <button
              type="button"
              onClick={handleSaveToGallery}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:brightness-105 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex flex-col items-center justify-center gap-1 border-3 border-slate-900 shadow-comic hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer font-comic"
            >
              <div className="flex items-center gap-2">
                {gallerySaved ? (
                  <Check className="w-5 h-5 text-slate-950 stroke-[3]" />
                ) : (
                  <Smartphone className="w-5 h-5 text-slate-950" />
                )}
                <span className="text-sm sm:text-base">
                  {gallerySaved ? '¡Guardado en Galería / Carrete!' : 'Guardar en Galería de Fotos (Carrete)'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-900 opacity-90">
                📲 Acceso directo para publicar luego como Instagram Story o Reel
              </span>
            </button>

            {/* BOTÓN SECUNDARIO: DESCARGA DIRECTA ARCHIVO */}
            <button
              type="button"
              onClick={handleStartExport}
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 border-2 border-slate-900 shadow-comic-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer font-comic"
            >
              <Download className="w-4 h-4" />
              <span>
                {downloadUrl ? 'Volver a Descargar Video (.webm)' : 'Descargar Archivo de Video 9:16 (.webm)'}
              </span>
            </button>

            {/* BOTONES DE REDES SOCIALES */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleShareInstagram}
                className="py-2.5 px-3 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:brightness-110 text-white border-2 border-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-comic-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer font-comic"
              >
                {copiedInstagram ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>¡Texto Copiado!</span>
                  </>
                ) : (
                  <>
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram Reel / Story</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="py-2.5 px-3 bg-emerald-400 hover:bg-emerald-300 text-slate-900 border-2 border-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-comic-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer font-comic"
              >
                {copiedWhatsApp ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-slate-900 stroke-[3]" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-900" />
                    <span>WhatsApp</span>
                  </>
                )}
              </button>
            </div>

            {/* GUARDAR EN LA NUBE FIREBASE */}
            <button
              type="button"
              onClick={handleSaveToCloud}
              disabled={isSavingToCloud}
              className="w-full py-2.5 px-3 bg-sky-400 hover:bg-sky-300 text-slate-900 border-2 border-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-comic-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer font-comic disabled:opacity-50"
            >
              {isSavingToCloud ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
              ) : cloudSaved ? (
                <Check className="w-4 h-4 text-emerald-800 stroke-[3]" />
              ) : (
                <Cloud className="w-4 h-4 text-slate-900" />
              )}
              <span>
                {isSavingToCloud
                  ? 'Guardando en Firebase...'
                  : cloudSaved
                  ? '¡Guardado en la Nube!'
                  : 'Guardar Homenaje en la Nube (Firebase)'}
              </span>
            </button>

            {/* DESCARGA DE POSTAL */}
            <button
              type="button"
              onClick={handleDownloadCard}
              className="w-full py-2 px-3 bg-yellow-300 hover:bg-yellow-200 text-slate-900 border-2 border-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-comic-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer font-comic"
            >
              <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
              <span>Descargar Tarjeta Postal PNG</span>
            </button>

            {infoNotice && (
              <div className="p-2.5 bg-emerald-100 border-2 border-emerald-800 rounded-xl text-xs text-emerald-900 font-comic flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                <p>{infoNotice}</p>
              </div>
            )}

            {errorMessage && (
              <p className="text-xs text-rose-600 text-center font-bold font-comic">
                {errorMessage}
              </p>
            )}
          </div>
        )}

        {/* Guía de Instagram Story */}
        <div className="p-3 bg-white rounded-xl border-2 border-slate-900 text-[11px] text-slate-700 font-comic space-y-1.5 shadow-comic-sm">
          <p className="font-bold text-slate-900 flex items-center gap-1.5">
            <Instagram className="w-3.5 h-3.5 text-pink-600" />
            <span>¿Cómo publicar como Instagram Story desde la Galería?</span>
          </p>
          <p>
            1. Tocá <strong>"Guardar en Galería de Fotos (Carrete)"</strong> arriba para almacenarlo en tu álbum.
          </p>
          <p>
            2. Abrí la app de <strong>Instagram</strong> en tu teléfono, deslizá a la derecha o tocá en <strong>Tu Historia</strong>.
          </p>
          <p>
            3. Seleccioná el video vertical recién guardado en la esquina inferior izquierda. ¡El formato 9:16 y el audio encajan al 100%!
          </p>
        </div>
      </div>
    </div>
  );
};

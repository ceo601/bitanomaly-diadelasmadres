import React, { useState } from 'react';
import { X, Download, Share2, Check, Video, Image as ImageIcon, Loader2, Instagram } from 'lucide-react';
import { exportReelVideo } from '../utils/videoExporter.ts';
import { generateWhatsAppMessage, COMIC_MOM_ASSETS } from '../utils/videoLogic.ts';

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
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [copiedInstagram, setCopiedInstagram] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const cartoonImgUrl = COMIC_MOM_ASSETS[cartoonPose] || COMIC_MOM_ASSETS.sweater;

  const handleStartExport = async () => {
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

      // Trigger auto download
      const a = document.createElement('a');
      a.href = url;
      a.download = `Madre_Reels_Comic_Argentina_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: unknown) {
      console.error('Export error:', err);
      setErrorMessage('Ocurrió un error al procesar el video. Intentá nuevamente.');
    } finally {
      setIsExporting(false);
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

    // Try native share sheet with file if available
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
        // Fallback below
      }
    }

    navigator.clipboard.writeText(caption);
    setCopiedInstagram(true);
    setTimeout(() => setCopiedInstagram(false), 3000);

    // Open Instagram web or intent
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-yellow-50 border-4 border-slate-900 rounded-3xl max-w-md w-full p-6 shadow-comic-lg relative space-y-5 animate-pop max-h-[92vh] overflow-y-auto">
        
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
            ¡Descargá tu Reel Cómic! 🎬
          </h2>
          <p className="text-xs text-slate-700 font-comic">
            Video vertical 9:16 con humor en la primera escena, transición con sonido cómic y final emotivo con música.
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
            <button
              type="button"
              onClick={handleStartExport}
              className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 border-3 border-slate-900 shadow-comic hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer font-comic"
            >
              <Download className="w-4 h-4" />
              <span>
                {downloadUrl ? 'Volver a Descargar Video (.webm)' : 'Descargar Video 9:16 (.webm / mp4)'}
              </span>
            </button>

            {/* Sharing Options */}
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
                    <span>Instagram Reel</span>
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

            <button
              type="button"
              onClick={handleDownloadCard}
              className="w-full py-2 px-3 bg-yellow-300 hover:bg-yellow-200 text-slate-900 border-2 border-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-comic-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer font-comic"
            >
              <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
              <span>Descargar Tarjeta Postal PNG</span>
            </button>

            {errorMessage && (
              <p className="text-xs text-rose-600 text-center font-bold font-comic">
                {errorMessage}
              </p>
            )}
          </div>
        )}

        <div className="p-3 bg-white rounded-xl border-2 border-slate-900 text-[11px] text-slate-700 font-comic space-y-1 shadow-comic-sm">
          <p className="font-bold text-slate-900">📸 ¿Cómo subir a Instagram Stories o Reels?</p>
          <p>
            1. Descargá el video a tu dispositivo haciendo clic en <strong>"Descargar Video 9:16"</strong>.
          </p>
          <p>
            2. Abrí Instagram, tocá en <strong>"+"</strong> y elegí <strong>Historia</strong> o <strong>Reel</strong>. ¡El formato 9:16 encaja a la perfección!
          </p>
        </div>
      </div>
    </div>
  );
};

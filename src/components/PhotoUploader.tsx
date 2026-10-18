import React, { useRef } from 'react';
import { Camera, Heart, Sparkles, UploadCloud, Trash2, Smile } from 'lucide-react';
import { COMIC_MOM_ASSETS } from '../utils/videoLogic.ts';

interface PhotoUploaderProps {
  realPhoto: string | null;
  selectedCartoonPose: 'sweater' | 'searching';
  onRealPhotoChange: (url: string | null) => void;
  onSelectCartoonPose: (pose: 'sweater' | 'searching') => void;
  onLoadSamplePhotos: () => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  realPhoto,
  selectedCartoonPose,
  onRealPhotoChange,
  onSelectCartoonPose,
  onLoadSamplePhotos,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onRealPhotoChange(url);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      onRealPhotoChange(url);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 font-comic">
            <span>Fotos & Personajes del Reel</span>
            <span className="text-xs bg-rose-200 text-rose-800 font-bold px-2 py-0.5 rounded-full border border-slate-900">
              Cómic 2D + Real
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-comic">
            Escena 1 muestra la mamá en caricatura y Escena 2 revela tu foto emotiva.
          </p>
        </div>

        <button
          type="button"
          onClick={onLoadSamplePhotos}
          className="text-xs font-bold text-slate-900 bg-yellow-300 hover:bg-yellow-200 border-2 border-slate-900 px-3 py-1.5 rounded-xl shadow-comic-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-1.5 transition-all cursor-pointer font-comic"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
          <span>Usar fotos de muestra</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Slot 1: Escena 1 - Personaje Caricatura de Mamá */}
        <div className="bg-amber-100/90 border-3 border-slate-900 rounded-2xl p-3 shadow-comic-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 font-comic">
            <span className="flex items-center gap-1">
              <span>Escena 1: Mamá en Caricatura</span>
              <span>🎨</span>
            </span>
            <span className="text-[11px] bg-white px-2 py-0.5 rounded-md border border-slate-900 font-sans-body">
              0.0s – 2.5s
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSelectCartoonPose('sweater')}
              className={`relative rounded-xl overflow-hidden border-2 transition-all p-1.5 text-left cursor-pointer ${
                selectedCartoonPose === 'sweater'
                  ? 'border-slate-900 bg-yellow-200 shadow-comic-sm ring-2 ring-rose-400'
                  : 'border-slate-400 bg-white/70 hover:bg-white hover:border-slate-800'
              }`}
            >
              <img
                src={COMIC_MOM_ASSETS.sweater}
                alt="Mamá con campera y mate"
                className="w-full h-24 object-cover rounded-lg border border-slate-900"
              />
              <span className="block text-[11px] font-bold text-slate-900 mt-1 font-comic truncate">
                🧥 Campera & Mate
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectCartoonPose('searching')}
              className={`relative rounded-xl overflow-hidden border-2 transition-all p-1.5 text-left cursor-pointer ${
                selectedCartoonPose === 'searching'
                  ? 'border-slate-900 bg-yellow-200 shadow-comic-sm ring-2 ring-rose-400'
                  : 'border-slate-400 bg-white/70 hover:bg-white hover:border-slate-800'
              }`}
            >
              <img
                src={COMIC_MOM_ASSETS.searching}
                alt="Mamá buscando"
                className="w-full h-24 object-cover rounded-lg border border-slate-900"
              />
              <span className="block text-[11px] font-bold text-slate-900 mt-1 font-comic truncate">
                🤨 ¿Y si lo encuentro?
              </span>
            </button>
          </div>
        </div>

        {/* Slot 2: Escena 2 - Tu Foto Real con Mamá */}
        <div className="bg-rose-100/90 border-3 border-slate-900 rounded-2xl p-3 shadow-comic-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 font-comic">
            <span className="flex items-center gap-1">
              <span>Escena 2: Tu Foto Emotiva</span>
              <span>❤️</span>
            </span>
            <span className="text-[11px] bg-white px-2 py-0.5 rounded-md border border-slate-900 font-sans-body">
              2.5s – 5.0s
            </span>
          </div>

          <div className="relative group">
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-3 border-dashed rounded-xl h-28 sm:h-29 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative transition-all ${
                realPhoto
                  ? 'border-rose-500 bg-white shadow-sm'
                  : 'border-slate-800 hover:border-rose-600 bg-white/80 hover:bg-white'
              }`}
            >
              {realPhoto ? (
                <>
                  <img
                    src={realPhoto}
                    alt="Foto emotiva con mamá"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold font-comic">
                    <UploadCloud className="w-5 h-5 text-yellow-300" />
                    <span>Cambiar foto real</span>
                  </div>
                </>
              ) : (
                <div className="p-2 text-center pointer-events-none space-y-1">
                  <div className="w-8 h-8 rounded-full bg-rose-200 border-2 border-slate-900 flex items-center justify-center mx-auto text-rose-600 shadow-comic-sm">
                    <Camera className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 font-comic">
                    Subí tu foto con Mamá
                  </p>
                  <p className="text-[10px] text-slate-500 font-sans-body">
                    Hacé clic o arrastrá el archivo
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
            </label>

            {realPhoto && (
              <button
                type="button"
                onClick={() => onRealPhotoChange(null)}
                aria-label="Eliminar foto real"
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-white hover:bg-rose-500 text-slate-800 hover:text-white border-2 border-slate-900 shadow-comic-sm transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

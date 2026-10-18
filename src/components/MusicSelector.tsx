import React, { useRef } from 'react';
import { Music, Play, Square, Volume2, Upload, Check } from 'lucide-react';
import { MUSIC_TRACKS, MusicTrackOption } from '../utils/audioEngine.ts';

interface MusicSelectorProps {
  selectedTrackId: string;
  customAudioName: string | null;
  volume: number;
  isPreviewingAudio: boolean;
  onSelectTrack: (trackId: string) => void;
  onUploadCustomAudio: (file: File) => void;
  onVolumeChange: (vol: number) => void;
  onToggleAudioPreview: () => void;
}

export const MusicSelector: React.FC<MusicSelectorProps> = ({
  selectedTrackId,
  customAudioName,
  volume,
  isPreviewingAudio,
  onSelectTrack,
  onUploadCustomAudio,
  onVolumeChange,
  onToggleAudioPreview,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadCustomAudio(file);
    }
  };

  return (
    <div id="musica" className="space-y-3 pt-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 font-comic">
            <Music className="w-5 h-5 text-rose-500" />
            <span>Música de Fondo para el Reel</span>
          </h2>
          <p className="text-xs text-slate-600 font-comic">
            Elegí una música tierna y divertida que acompañe el video.
          </p>
        </div>

        {selectedTrackId !== 'none' && (
          <button
            type="button"
            onClick={onToggleAudioPreview}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border-2 border-slate-900 flex items-center gap-1.5 transition-all cursor-pointer font-comic shadow-comic-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${
              isPreviewingAudio
                ? 'bg-rose-500 text-white'
                : 'bg-yellow-300 text-slate-900 hover:bg-yellow-200'
            }`}
          >
            {isPreviewingAudio ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Pausar muestra</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Probar sonido</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {MUSIC_TRACKS.map((track: MusicTrackOption) => {
          const isSelected = selectedTrackId === track.id;
          return (
            <div
              key={track.id}
              onClick={() => onSelectTrack(track.id)}
              className={`p-3 rounded-2xl border-3 border-slate-900 text-left cursor-pointer transition-all ${
                isSelected
                  ? 'bg-rose-100 shadow-comic ring-2 ring-rose-500'
                  : 'bg-white hover:bg-amber-50 shadow-comic-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{track.icon}</span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-comic">
                      <span>{track.name}</span>
                    </h3>
                    <p className="text-[11px] text-slate-600 font-comic mt-0.5 leading-snug">
                      {track.id === 'custom' && customAudioName
                        ? `Archivo: ${customAudioName}`
                        : track.description}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? 'bg-rose-500 text-white' : 'bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {track.id === 'custom' && isSelected && (
                <div className="mt-2.5 pt-2 border-t-2 border-slate-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="w-full text-xs font-bold py-1.5 px-3 bg-yellow-300 hover:bg-yellow-200 text-slate-900 rounded-xl border-2 border-slate-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-comic shadow-comic-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{customAudioName ? 'Cambiar archivo' : 'Subir MP3 / Audio'}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleCustomFile}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedTrackId !== 'none' && (
        <div className="flex items-center gap-3 p-3 bg-white border-2 border-slate-900 rounded-xl shadow-comic-sm">
          <Volume2 className="w-4 h-4 text-slate-700 shrink-0" />
          <span className="text-xs font-bold text-slate-800 font-comic shrink-0">Volumen:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-rose-500 h-2 bg-slate-200 rounded-lg cursor-pointer border border-slate-900"
          />
          <span className="text-xs font-mono font-bold text-slate-700 w-10 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Volume2, Play, Sparkles, Check } from 'lucide-react';
import { TRANSITION_SFX_OPTIONS, TransitionSFXOption } from '../utils/audioEngine.ts';

interface SFXSelectorProps {
  selectedSFXId: string;
  onSelectSFX: (id: string) => void;
  onPreviewSFX: (id: string) => void;
}

export const SFXSelector: React.FC<SFXSelectorProps> = ({
  selectedSFXId,
  onSelectSFX,
  onPreviewSFX,
}) => {
  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 font-comic">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span>Efecto de Sonido Cómic para la Transición (SFX)</span>
          </h2>
          <p className="text-xs text-slate-600 font-comic">
            Suena exactamente en el cambio de Escena 1 a Escena 2 (al pasar a la foto real).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {TRANSITION_SFX_OPTIONS.map((sfx: TransitionSFXOption) => {
          const isSelected = selectedSFXId === sfx.id;
          return (
            <div
              key={sfx.id}
              onClick={() => {
                onSelectSFX(sfx.id);
                onPreviewSFX(sfx.id);
              }}
              className={`p-3 rounded-2xl border-3 border-slate-900 text-left cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-yellow-200 shadow-comic ring-2 ring-rose-500 translate-y-[-2px]'
                  : 'bg-white hover:bg-amber-100 shadow-comic-sm hover:translate-x-[1px] hover:translate-y-[1px]'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <span className="text-2xl">{sfx.emoji}</span>
                <div className="flex items-center gap-1">
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center border border-slate-900">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2">
                <h3 className="text-xs font-bold text-slate-900 font-comic truncate">
                  {sfx.name}
                </h3>
                <p className="text-[10px] text-slate-600 font-comic mt-0.5 line-clamp-2 leading-tight">
                  {sfx.description}
                </p>
              </div>

              {sfx.id !== 'none' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreviewSFX(sfx.id);
                  }}
                  className="mt-2.5 w-full py-1 px-2 rounded-lg bg-white hover:bg-yellow-300 text-slate-900 text-[10px] font-bold border-2 border-slate-900 flex items-center justify-center gap-1 font-comic transition-colors cursor-pointer"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Probar sonido</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

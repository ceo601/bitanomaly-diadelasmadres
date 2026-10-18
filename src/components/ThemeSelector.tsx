import React from 'react';
import { Frame, Check } from 'lucide-react';
import { COMIC_FRAME_THEMES } from '../utils/videoLogic.ts';

interface ThemeSelectorProps {
  selectedThemeId: string;
  onSelectTheme: (id: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedThemeId,
  onSelectTheme,
}) => {
  return (
    <div id="marcos-comic" className="space-y-3 pt-1">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 font-comic">
          <Frame className="w-5 h-5 text-rose-500" />
          <span>Estilo de Marco de Historieta</span>
        </h2>
        <span className="text-xs text-slate-600 font-comic">
          Bordes y stickers del video
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {Object.values(COMIC_FRAME_THEMES).map((theme) => {
          const isSelected = selectedThemeId === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectTheme(theme.id)}
              className={`p-3 rounded-2xl border-3 border-slate-900 text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                isSelected
                  ? 'bg-yellow-200 shadow-comic ring-2 ring-rose-500 translate-y-[-2px]'
                  : 'bg-white hover:bg-amber-100 shadow-comic-sm hover:translate-x-[1px] hover:translate-y-[1px]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-slate-900 font-comic">
                  {theme.name}
                </span>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center border border-slate-900">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between w-full pt-2">
                <span className="text-sm">
                  {theme.stickers.slice(0, 3).join(' ')}
                </span>
                <div
                  className="w-5 h-5 rounded-full border-2 border-slate-900 shadow-comic-sm"
                  style={{ backgroundColor: theme.backgroundColor }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

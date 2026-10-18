import React from 'react';
import { Heart, Sparkles, Wand2 } from 'lucide-react';

interface HeaderProps {
  onScrollToEditor: () => void;
  onUseSamplePhotos: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onScrollToEditor, onUseSamplePhotos }) => {
  return (
    <header className="border-b-4 border-slate-900 bg-amber-100/95 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Zone 1: Comic Brand Wordmark */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-rose-500 border-2 border-slate-900 shadow-comic-sm flex items-center justify-center text-white rotate-[-4deg] animate-comic-wiggle">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-comic flex items-center gap-1.5">
              <span>Madre Reels Argentina</span>
              <span className="text-base">🇦🇷</span>
            </span>
            <span className="block text-[11px] font-semibold text-rose-700 tracking-wide font-comic">
              Edición Cómic & Humor Maternal
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-800 font-comic">
          <button
            onClick={onScrollToEditor}
            className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-left"
          >
            Personalizar Reel
          </button>
          <a
            href="#frases-humor"
            className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
          >
            Frases de Mamá
          </a>
          <a
            href="#marcos-comic"
            className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
          >
            Marcos Cómic
          </a>
          <a
            href="#musica"
            className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
          >
            Música
          </a>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onUseSamplePhotos}
            className="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-900 bg-yellow-300 hover:bg-yellow-200 border-2 border-slate-900 rounded-xl shadow-comic-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer font-comic"
            title="Cargar fotos y dedicatoria para probar al instante"
          >
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span>Usar fotos de muestra</span>
          </button>
        </div>
      </div>
    </header>
  );
};

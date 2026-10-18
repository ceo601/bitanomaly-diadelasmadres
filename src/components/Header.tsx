import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase/config.ts';
import { onAuthStateChanged, User } from 'firebase/auth';

interface HeaderProps {
  onScrollToEditor: () => void;
  onUseSamplePhotos: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onScrollToEditor, onUseSamplePhotos }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthAction = async () => {
    if (currentUser) {
      await signOut(auth);
    } else {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (e) {
        console.error('Login error:', e);
      }
    }
  };

  return (
    <header className="border-b-4 border-slate-900 bg-amber-100/95 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
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
        <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-slate-800 font-comic">
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
            href="#comunidad-reels"
            className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
          >
            Muro Comunitario 🇦🇷
          </a>
        </nav>

        {/* Zone 3: Actions (Google Auth & Sample Photos) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onUseSamplePhotos}
            className="px-3 py-2 text-xs font-bold text-slate-900 bg-yellow-300 hover:bg-yellow-200 border-2 border-slate-900 rounded-xl shadow-comic-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer font-comic"
            title="Cargar fotos y dedicatoria para probar al instante"
          >
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">Usar fotos de muestra</span>
            <span className="sm:hidden">Muestra</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border-2 border-slate-900 shadow-comic-sm">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Usuario'}
                  className="w-6 h-6 rounded-full border border-slate-900"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-slate-700" />
              )}
              <span className="text-xs font-bold font-comic text-slate-800 hidden md:inline max-w-[100px] truncate">
                {currentUser.displayName?.split(' ')[0] || 'Cuenta'}
              </span>
              <button
                type="button"
                onClick={handleAuthAction}
                className="text-slate-500 hover:text-rose-600 transition p-0.5 cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAuthAction}
              className="px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border-2 border-slate-900 rounded-xl shadow-comic-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-1.5 cursor-pointer font-comic"
              title="Iniciar sesión para guardar tus reels en la nube"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Conectar Google</span>
              <span className="sm:hidden">Ingresar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

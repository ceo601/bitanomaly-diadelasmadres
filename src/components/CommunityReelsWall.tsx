import React, { useEffect, useState } from 'react';
import { Heart, Sparkles, Film, Trash2, Calendar, User, MessageCircle } from 'lucide-react';
import {
  SavedReel,
  subscribeToCommunityReels,
  likeReelInFirestore,
  deleteReelFromFirestore,
} from '../firebase/reelsService.ts';
import { auth } from '../firebase/config.ts';

interface CommunityReelsWallProps {
  onLoadReel: (reel: SavedReel) => void;
}

export const CommunityReelsWall: React.FC<CommunityReelsWallProps> = ({ onLoadReel }) => {
  const [reels, setReels] = useState<SavedReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = subscribeToCommunityReels(
      (loaded) => {
        setReels(loaded);
        setLoading(false);
      },
      (err) => {
        console.error('Community reels subscription error:', err);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleLike = async (reelId: string) => {
    if (likedReels[reelId]) return;
    setLikedReels((prev) => ({ ...prev, [reelId]: true }));
    try {
      await likeReelInFirestore(reelId);
    } catch (e) {
      console.error('Error liking reel:', e);
    }
  };

  const handleDelete = async (reelId: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar este reel guardado?')) return;
    try {
      await deleteReelFromFirestore(reelId);
    } catch (e) {
      console.error('Error deleting reel:', e);
    }
  };

  return (
    <section id="comunidad-reels" className="scroll-mt-24 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-3 border-slate-900 pb-3">
        <div>
          <h3 className="text-xl font-black text-slate-900 font-comic flex items-center gap-2">
            <span>Muro Comunitario de Homenaje a Mamá</span>
            <span className="text-base">🇦🇷</span>
          </h3>
          <p className="text-xs text-slate-700 font-comic">
            Reels creados y guardados en la nube con Firebase. ¡Tocá cualquiera para cargarlo en el reproductor!
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 font-comic bg-amber-200/70 border-2 border-slate-900 px-3 py-1.5 rounded-xl shadow-comic-sm self-start">
          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
          <span>{reels.length} {reels.length === 1 ? 'Reel guardado' : 'Reels guardados'}</span>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center bg-white/70 border-3 border-slate-900 rounded-2xl shadow-comic font-comic">
          <p className="text-xs text-slate-700">Cargando homenajes desde Firebase...</p>
        </div>
      ) : reels.length === 0 ? (
        <div className="p-8 text-center bg-white/80 border-3 border-slate-900 rounded-2xl shadow-comic font-comic space-y-2">
          <p className="text-sm font-bold text-slate-900">¡Sé el primero en guardar un Reel en la nube!</p>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Personalizá tu video, tocale a <strong>"Exportar Video"</strong> y elegí <strong>"Guardar Homenaje en la Nube (Firebase)"</strong> para que aparezca acá.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reels.map((reel) => {
            const isOwner = auth.currentUser?.uid === reel.userId;
            const hasLiked = !!likedReels[reel.id];

            return (
              <div
                key={reel.id}
                className="bg-white border-3 border-slate-900 rounded-2xl p-4 shadow-comic hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex flex-col justify-between space-y-3 font-comic relative group"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-slate-900 px-2 py-0.5 rounded-lg">
                      Homenaje a {reel.momName}
                    </span>
                    <p className="text-xs text-slate-500 font-sans mt-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Por {reel.authorName}</span>
                    </p>
                  </div>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleDelete(reel.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Eliminar de la nube"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Phrase bubble */}
                <div className="bg-yellow-100 border-2 border-slate-900 rounded-xl p-2.5 shadow-comic-sm">
                  <p className="text-xs font-bold text-slate-900 flex items-start gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">"{reel.humorQuote}"</span>
                  </p>
                </div>

                {/* Emotional Dedication */}
                <p className="text-xs text-slate-700 italic line-clamp-2 border-l-2 border-rose-400 pl-2">
                  "{reel.emotionalQuote}"
                </p>

                {/* Action buttons */}
                <div className="pt-2 border-t-2 border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onLoadReel(reel)}
                    className="flex-1 py-1.5 px-2 bg-yellow-300 hover:bg-yellow-200 text-slate-950 font-bold border-2 border-slate-900 rounded-xl text-xs flex items-center justify-center gap-1 shadow-comic-sm hover:shadow-none transition cursor-pointer"
                    title="Cargar en el simulador 9:16"
                  >
                    <Film className="w-3 h-3 text-rose-600" />
                    <span>Cargar en Reel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLike(reel.id)}
                    className={`py-1.5 px-2.5 border-2 border-slate-900 rounded-xl text-xs font-bold flex items-center gap-1 shadow-comic-sm transition cursor-pointer ${
                      hasLiked
                        ? 'bg-rose-500 text-white'
                        : 'bg-white hover:bg-rose-50 text-slate-800'
                    }`}
                    title="Dar amor"
                  >
                    <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-white' : 'text-rose-500'}`} />
                    <span>{(reel.likesCount || 0) + (hasLiked ? 1 : 0)}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

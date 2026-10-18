import React from 'react';
import { MessageSquare, Dices, Heart, Sparkles, MessageCircle } from 'lucide-react';
import {
  ARGENTINE_MOM_HUMOR_QUOTES,
  ARGENTINE_MOM_EMOTIONAL_QUOTES,
  getRandomHumorQuote,
} from '../utils/videoLogic.ts';

interface CustomMessageEditorProps {
  humorQuote: string;
  emotionalQuote: string;
  taglineText: string;
  momName: string;
  senderName: string;
  onHumorQuoteChange: (val: string) => void;
  onEmotionalQuoteChange: (val: string) => void;
  onTaglineChange: (val: string) => void;
  onMomNameChange: (val: string) => void;
  onSenderNameChange: (val: string) => void;
}

export const CustomMessageEditor: React.FC<CustomMessageEditorProps> = ({
  humorQuote,
  emotionalQuote,
  taglineText,
  momName,
  senderName,
  onHumorQuoteChange,
  onEmotionalQuoteChange,
  onTaglineChange,
  onMomNameChange,
  onSenderNameChange,
}) => {
  const handleRandomHumor = () => {
    const next = getRandomHumorQuote(humorQuote);
    onHumorQuoteChange(next);
  };

  return (
    <div id="frases-humor" className="space-y-4 pt-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 font-comic">
            <MessageSquare className="w-5 h-5 text-rose-500" />
            <span>Guion del Video: De la Risa a la Emoción</span>
          </h2>
          <p className="text-xs text-slate-600 font-comic">
            Elegí la clásica frase con la que te retaba mamá y el mensaje emotivo de cierre.
          </p>
        </div>
      </div>

      {/* Escena 1: Humor Cómic */}
      <div className="bg-yellow-100/90 border-3 border-slate-900 rounded-2xl p-4 shadow-comic-sm space-y-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="humor-quote-input"
            className="text-xs sm:text-sm font-bold text-slate-900 font-comic flex items-center gap-1.5"
          >
            <span>Escena 1 (Humor Cómic): La Frase de Mamá</span>
            <span className="text-base">🧥</span>
          </label>

          <button
            type="button"
            onClick={handleRandomHumor}
            className="text-xs font-bold bg-white hover:bg-yellow-300 text-slate-900 border-2 border-slate-900 px-2.5 py-1 rounded-xl shadow-comic-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-1.5 cursor-pointer font-comic"
            title="Cambiar a otra frase típica al azar"
          >
            <Dices className="w-3.5 h-3.5 text-rose-600" />
            <span>🎲 Frase al azar</span>
          </button>
        </div>

        {/* Comic Speech Bubble Input preview */}
        <div className="relative">
          <input
            id="humor-quote-input"
            type="text"
            value={humorQuote}
            maxLength={70}
            onChange={(e) => onHumorQuoteChange(e.target.value)}
            placeholder="¡Llevate una campera que va a refrescar! 🧥"
            className="w-full bg-white border-3 border-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-400 rounded-xl px-4 py-3 text-sm sm:text-base font-bold text-slate-900 placeholder-slate-400 shadow-comic-sm font-comic transition-all"
          />
        </div>

        {/* Quick Selection Buttons */}
        <div className="pt-1">
          <span className="text-[11px] font-bold text-slate-700 font-comic flex items-center gap-1 mb-2">
            <Sparkles className="w-3 h-3 text-rose-500" />
            <span>Frases típicas argentinas para elegir:</span>
          </span>

          <div className="flex flex-wrap gap-1.5">
            {ARGENTINE_MOM_HUMOR_QUOTES.slice(0, 5).map((quote, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onHumorQuoteChange(quote)}
                className={`text-xs px-2.5 py-1 rounded-xl border-2 border-slate-900 font-comic font-medium transition-all cursor-pointer ${
                  humorQuote === quote
                    ? 'bg-rose-400 text-white shadow-comic-sm'
                    : 'bg-white hover:bg-yellow-200 text-slate-800'
                }`}
              >
                {quote}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Escena 2: Mensaje Emotivo */}
      <div className="bg-rose-100/90 border-3 border-slate-900 rounded-2xl p-4 shadow-comic-sm space-y-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="emotional-quote-input"
            className="text-xs sm:text-sm font-bold text-slate-900 font-comic flex items-center gap-1.5"
          >
            <span>Escena 2 (Emotivo): Mensaje Final de Amor</span>
            <span className="text-base">❤️</span>
          </label>
          <span className="text-[11px] font-mono text-slate-600">
            {emotionalQuote.length}/80 car.
          </span>
        </div>

        <textarea
          id="emotional-quote-input"
          rows={2}
          value={emotionalQuote}
          maxLength={90}
          onChange={(e) => onEmotionalQuoteChange(e.target.value)}
          placeholder="Aunque a veces me vuelvas loco/a... ¡Feliz día, mamá! Te amo ❤️"
          className="w-full bg-white border-3 border-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-400 rounded-xl px-4 py-2.5 text-sm sm:text-base font-bold text-slate-900 placeholder-slate-400 shadow-comic-sm font-comic transition-all resize-none"
        />

        {/* Emotional Quick Presets */}
        <div className="flex flex-wrap gap-1.5">
          {ARGENTINE_MOM_EMOTIONAL_QUOTES.slice(0, 3).map((msg, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onEmotionalQuoteChange(msg)}
              className={`text-xs px-2.5 py-1 rounded-xl border-2 border-slate-900 font-comic font-medium transition-all cursor-pointer ${
                emotionalQuote === msg
                  ? 'bg-rose-500 text-white shadow-comic-sm'
                  : 'bg-white hover:bg-rose-200 text-slate-800'
              }`}
            >
              {msg}
            </button>
          ))}
        </div>
      </div>

      {/* Extra Details: Names & Watermark */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/90 border-3 border-slate-900 rounded-2xl p-3.5 shadow-comic-sm">
        <div>
          <label htmlFor="mom-name" className="block text-xs font-bold text-slate-800 mb-1 font-comic">
            Nombre de Mamá (opcional)
          </label>
          <input
            id="mom-name"
            type="text"
            value={momName}
            maxLength={30}
            onChange={(e) => onMomNameChange(e.target.value)}
            placeholder="Ej: Mamá Silvia"
            className="w-full bg-amber-50/70 border-2 border-slate-900 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 placeholder-slate-400 font-comic"
          />
        </div>

        <div>
          <label htmlFor="sender-name" className="block text-xs font-bold text-slate-800 mb-1 font-comic">
            Tu Nombre o Firma
          </label>
          <input
            id="sender-name"
            type="text"
            value={senderName}
            maxLength={30}
            onChange={(e) => onSenderNameChange(e.target.value)}
            placeholder="Ej: Lucas y Juli"
            className="w-full bg-amber-50/70 border-2 border-slate-900 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 placeholder-slate-400 font-comic"
          />
        </div>

        <div className="sm:col-span-2 pt-1 border-t-2 border-slate-200">
          <label htmlFor="tagline" className="block text-xs font-bold text-slate-800 mb-1 font-comic">
            Marca de agua inferior (Discreta)
          </label>
          <input
            id="tagline"
            type="text"
            value={taglineText}
            maxLength={35}
            onChange={(e) => onTaglineChange(e.target.value)}
            placeholder="creado en TuApp.com"
            className="w-full bg-amber-50/70 border-2 border-slate-900 rounded-xl px-3 py-1.5 text-xs font-mono font-medium text-slate-800 font-comic"
          />
        </div>
      </div>
    </div>
  );
};

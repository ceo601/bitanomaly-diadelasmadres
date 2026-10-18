/**
 * Pure helper functions for video timeline, comic frame styling,
 * speech bubbles, and Argentine Mother's Day cartoon humor.
 */

export interface SceneTimeline {
  activeScene: 1 | 2;
  sceneProgress: number; // 0 to 1
  overallProgress: number; // 0 to 1
  isFinished: boolean;
}

export interface ComicFrameTheme {
  id: string;
  name: string;
  badge: string;
  frameBorderColor: string;
  frameBorderWidth: number;
  backgroundColor: string;
  speechBubbleBg: string;
  speechBubbleText: string;
  accentColor: string;
  stickers: string[];
}

export const COMIC_MOM_ASSETS = {
  sweater: '/src/assets/images/comic_argentine_mom_1792294497028.jpg',
  searching: '/src/assets/images/comic_mom_searching_1792294511936.jpg',
};

export const ARGENTINE_MOM_HUMOR_QUOTES = [
  '¡Llevate una campera que va a refrescar! 🧥',
  '¿Y si lo encuentro yo qué te hago? 🤨',
  '¡Mientras vivas bajo este techo...! 🏠',
  '¿Te pensás que soy de plata? 💸',
  '¡La que limpia en esta casa soy yo! 🧼',
  '¡Un día voy a tirar todo a la basura! 🗑️',
  '¿Y si tus amigos se tiran de un puente, vos también te tirás? 🌉',
  '¡Vení para acá que no te voy a hacer nada! 🏃',
  '¡Abrigate el pecho que después estás tosiendo! 🧣',
  '¡Cuando tengas tus hijos me vas a entender! 👶',
  '¡No me hagas ir a buscar la chancleta! 🩴',
];

export const ARGENTINE_MOM_EMOTIONAL_QUOTES = [
  'Aunque a veces me vuelvas loco/a... ¡Feliz día, mamá! Te amo ❤️',
  'Gracias por cuidarme, retarme y quererme tanto. ¡Feliz día, ma! ❤️',
  'Sos la mejor mamá del mundo. ¡Te amo con toda mi alma! ❤️',
  'Por más mates compartidos y anécdotas juntos. ¡Feliz día! ❤️',
  'No hay abrazo como el tuyo en todo el universo. ¡Te amo, mamá! ❤️',
];

export const COMIC_FRAME_THEMES: Record<string, ComicFrameTheme> = {
  comicClassic: {
    id: 'comicClassic',
    name: 'Clásico Cómic',
    badge: '📰 Viñeta Clásica',
    frameBorderColor: '#0f172a',
    frameBorderWidth: 8,
    backgroundColor: '#fef08a', // pastel yellow
    speechBubbleBg: '#ffffff',
    speechBubbleText: '#0f172a',
    accentColor: '#f43f5e',
    stickers: ['💥', '🧥', '🧉', '❤️'],
  },
  comicRose: {
    id: 'comicRose',
    name: 'Rosa Amor',
    badge: '💖 Dulce y Cariñoso',
    frameBorderColor: '#0f172a',
    frameBorderWidth: 8,
    backgroundColor: '#fce7f3', // soft pink
    speechBubbleBg: '#fff1f2',
    speechBubbleText: '#881337',
    accentColor: '#fb7185',
    stickers: ['💖', '✨', '🌸', '🥰'],
  },
  comicHome: {
    id: 'comicHome',
    name: 'Hogareño Mate',
    badge: '🧉 Mate & Tradición',
    frameBorderColor: '#0f172a',
    frameBorderWidth: 8,
    backgroundColor: '#e0f2fe', // sky blue
    speechBubbleBg: '#ffffff',
    speechBubbleText: '#0369a1',
    accentColor: '#0284c7',
    stickers: ['🧉', '☀️', '🥐', '❤️'],
  },
  comicPopArt: {
    id: 'comicPopArt',
    name: 'Pop-Art Explosivo',
    badge: '⭐ Pop Art',
    frameBorderColor: '#0f172a',
    frameBorderWidth: 10,
    backgroundColor: '#fef9c3', // bright yellow
    speechBubbleBg: '#ffffff',
    speechBubbleText: '#0f172a',
    accentColor: '#ec4899',
    stickers: ['⭐', '🗯️', '💥', '❤️'],
  },
};

/**
 * Calculates current scene and normalized progress values from time in ms.
 */
export function calculateSceneTimeline(timeMs: number, totalDurationMs = 5000): SceneTimeline {
  const boundedTime = Math.max(0, Math.min(timeMs, totalDurationMs));
  const overallProgress = totalDurationMs > 0 ? boundedTime / totalDurationMs : 0;
  const isFinished = boundedTime >= totalDurationMs;

  const sceneDuration = totalDurationMs / 2;
  let activeScene: 1 | 2 = 1;
  let sceneProgress = 0;

  if (boundedTime < sceneDuration) {
    activeScene = 1;
    sceneProgress = boundedTime / sceneDuration;
  } else {
    activeScene = 2;
    sceneProgress = (boundedTime - sceneDuration) / sceneDuration;
  }

  return {
    activeScene,
    sceneProgress: Math.min(Math.max(sceneProgress, 0), 1),
    overallProgress,
    isFinished,
  };
}

/**
 * Calculates progressive zoom scale
 */
export function calculateZoomScale(sceneProgress: number, maxZoom = 1.09): number {
  const eased = Math.sin((sceneProgress * Math.PI) / 2);
  return 1.0 + (maxZoom - 1.0) * eased;
}

/**
 * Calculates draw image cover coordinates to fit an image into a canvas without stretching.
 */
export function calculateObjectCoverFit(
  imgWidth: number,
  imgHeight: number,
  targetWidth: number,
  targetHeight: number,
  zoomScale = 1.0
): { sx: number; sy: number; sWidth: number; sHeight: number; dx: number; dy: number; dWidth: number; dHeight: number } {
  if (imgWidth <= 0 || imgHeight <= 0 || targetWidth <= 0 || targetHeight <= 0) {
    return { sx: 0, sy: 0, sWidth: 1, sHeight: 1, dx: 0, dy: 0, dWidth: targetWidth, dHeight: targetHeight };
  }

  const imgAspect = imgWidth / imgHeight;
  const targetAspect = targetWidth / targetHeight;

  let sWidth = imgWidth;
  let sHeight = imgHeight;
  let sx = 0;
  let sy = 0;

  if (imgAspect > targetAspect) {
    sWidth = imgHeight * targetAspect;
    sx = (imgWidth - sWidth) / 2;
  } else {
    sHeight = imgWidth / targetAspect;
    sy = (imgHeight - sHeight) / 2;
  }

  const zoomedSWidth = sWidth / zoomScale;
  const zoomedSHeight = sHeight / zoomScale;
  const zoomedSx = sx + (sWidth - zoomedSWidth) / 2;
  const zoomedSy = sy + (sHeight - zoomedSHeight) / 2;

  return {
    sx: zoomedSx,
    sy: zoomedSy,
    sWidth: zoomedSWidth,
    sHeight: zoomedSHeight,
    dx: 0,
    dy: 0,
    dWidth: targetWidth,
    dHeight: targetHeight,
  };
}

/**
 * Returns a random humor quote different from the current one.
 */
export function getRandomHumorQuote(currentQuote: string): string {
  const available = ARGENTINE_MOM_HUMOR_QUOTES.filter((q) => q !== currentQuote);
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex] || ARGENTINE_MOM_HUMOR_QUOTES[0];
}

/**
 * Generates WhatsApp share text with Argentine comic tribute format.
 */
export function generateWhatsAppMessage(
  humorQuote: string,
  emotionalQuote: string,
  momName?: string,
  senderName?: string
): string {
  const to = momName?.trim() ? `¡Para la mejor mamá, ${momName.trim()}!\n` : '¡Para vos, Mamá! ❤️\n';
  const from = senderName?.trim() ? `\n\nCon todo mi amor, ${senderName.trim()} 🇦🇷` : '\n\n¡Te amo con todo mi corazón! ❤️';
  return `🇦🇷 *Especial Día de la Madre*\n\n${to}😂 Mamá decía siempre:\n"${humorQuote.trim()}"\n\n✨ Pero la verdad es que:\n*${emotionalQuote.trim()}*${from}\n\nCreado en TuApp.com`;
}

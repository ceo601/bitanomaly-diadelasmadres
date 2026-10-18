import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSceneTimeline,
  calculateZoomScale,
  calculateObjectCoverFit,
  generateWhatsAppMessage,
  getRandomHumorQuote,
  COMIC_FRAME_THEMES,
  ARGENTINE_MOM_HUMOR_QUOTES,
  ARGENTINE_MOM_EMOTIONAL_QUOTES,
} from './videoLogic.ts';

test('calculateSceneTimeline correctly calculates Scene 1 and Scene 2 transitions', () => {
  const atStart = calculateSceneTimeline(0, 5000);
  assert.equal(atStart.activeScene, 1);
  assert.equal(atStart.sceneProgress, 0);
  assert.equal(atStart.overallProgress, 0);

  const atSwitch = calculateSceneTimeline(2500, 5000);
  assert.equal(atSwitch.activeScene, 2);
  assert.equal(atSwitch.sceneProgress, 0);
  assert.equal(atSwitch.overallProgress, 0.5);

  const atEnd = calculateSceneTimeline(5000, 5000);
  assert.equal(atEnd.activeScene, 2);
  assert.equal(atEnd.sceneProgress, 1);
  assert.equal(atEnd.isFinished, true);
});

test('calculateZoomScale smoothly scales up', () => {
  const z0 = calculateZoomScale(0, 1.09);
  assert.equal(z0, 1.0);
  const z1 = calculateZoomScale(1, 1.09);
  assert.ok(Math.abs(z1 - 1.09) < 0.001);
});

test('calculateObjectCoverFit handles dimensions properly', () => {
  const fit = calculateObjectCoverFit(600, 800, 720, 1280, 1.0);
  assert.equal(fit.dx, 0);
  assert.equal(fit.dy, 0);
  assert.equal(fit.dWidth, 720);
  assert.equal(fit.dHeight, 1280);
});

test('getRandomHumorQuote returns a valid quote', () => {
  const quote = getRandomHumorQuote('¡Llevate una campera que va a refrescar! 🧥');
  assert.ok(ARGENTINE_MOM_HUMOR_QUOTES.includes(quote));
});

test('generateWhatsAppMessage creates Argentine comic formatted text', () => {
  const msg = generateWhatsAppMessage(
    '¡Llevate una campera que va a refrescar! 🧥',
    'Aunque a veces me vuelvas loco/a... ¡Feliz día, mamá! Te amo ❤️',
    'Mamá Silvia',
    'Martín'
  );
  assert.ok(msg.includes('Día de la Madre'));
  assert.ok(msg.includes('campera'));
  assert.ok(msg.includes('Mamá Silvia'));
  assert.ok(msg.includes('TuApp.com'));
});

test('comic frame themes are properly configured', () => {
  assert.ok(COMIC_FRAME_THEMES.comicClassic);
  assert.ok(COMIC_FRAME_THEMES.comicRose);
  assert.ok(COMIC_FRAME_THEMES.comicHome);
  assert.ok(COMIC_FRAME_THEMES.comicPopArt);
  assert.equal(COMIC_FRAME_THEMES.comicClassic.name, 'Clásico Cómic');
});

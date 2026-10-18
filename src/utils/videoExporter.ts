import { calculateObjectCoverFit, calculateZoomScale, COMIC_FRAME_THEMES } from './videoLogic.ts';

export interface ExportVideoParams {
  cartoonImgUrl: string;
  realPhotoUrl: string;
  humorQuote: string;
  emotionalQuote: string;
  taglineText?: string;
  themeId?: string;
  audioTrack?: MediaStreamTrack | null;
  onTriggerTransitionSFX?: () => void;
  onProgress?: (ratio: number) => void;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Draws a comic speech bubble with outline and tail
 */
function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  tailX: number,
  tailY: number,
  bgColor: string,
  borderColor = '#0f172a',
  borderWidth = 5
) {
  ctx.save();
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);

  // Draw speech bubble body
  ctx.fill();
  ctx.stroke();

  // Draw tail triangle
  ctx.beginPath();
  const tailBaseX = x + width * 0.45;
  ctx.moveTo(tailBaseX, y + height);
  ctx.lineTo(tailX, tailY);
  ctx.lineTo(tailBaseX + 30, y + height);
  ctx.closePath();
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.stroke();

  // Patch over inside line
  ctx.fillStyle = bgColor;
  ctx.fillRect(tailBaseX + 2, y + height - borderWidth, 26, borderWidth * 2);

  ctx.restore();
}

export async function exportReelVideo(params: ExportVideoParams): Promise<Blob> {
  const {
    cartoonImgUrl,
    realPhotoUrl,
    humorQuote,
    emotionalQuote,
    taglineText = 'creado en TuApp.com',
    themeId = 'comicClassic',
    audioTrack,
    onTriggerTransitionSFX,
    onProgress,
  } = params;

  // Preload images
  const [imgCartoon, imgReal] = await Promise.all([
    loadImage(cartoonImgUrl),
    loadImage(realPhotoUrl),
  ]);

  const width = 720;
  const height = 1280;
  const fps = 30;
  const totalDuration = 5; // seconds
  const totalFrames = fps * totalDuration;
  const halfFrames = totalFrames / 2;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Setup media stream
  const canvasStream = canvas.captureStream(fps);
  if (audioTrack) {
    canvasStream.addTrack(audioTrack);
  }

  // Select MIME type
  let mimeType = 'video/webm;codecs=vp9,opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8,opus';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const recordedChunks: Blob[] = [];
  const recorder = new MediaRecorder(canvasStream, {
    mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
    videoBitsPerSecond: 3_500_000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  const recordingPromise = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      resolve(blob);
    };
  });

  recorder.start();

  const theme = COMIC_FRAME_THEMES[themeId] || COMIC_FRAME_THEMES.comicClassic;

  for (let frame = 0; frame <= totalFrames; frame++) {
    // Trigger transition SFX at the exact moment Escena 1 turns into Escena 2
    if (frame === halfFrames && onTriggerTransitionSFX) {
      try {
        onTriggerTransitionSFX();
      } catch {
        // ignore
      }
    }

    const isScene1 = frame < halfFrames;
    const sceneProgress = isScene1 ? frame / halfFrames : (frame - halfFrames) / halfFrames;
    const overallProgress = frame / totalFrames;

    ctx.clearRect(0, 0, width, height);

    // Background color
    ctx.fillStyle = theme.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    if (isScene1) {
      // ESCENA 1: Cartoon Mom + Speech Bubble
      const zoom = calculateZoomScale(sceneProgress, 1.08);
      const fit = calculateObjectCoverFit(
        imgCartoon.width,
        imgCartoon.height,
        width,
        height,
        zoom
      );

      ctx.save();
      ctx.drawImage(
        imgCartoon,
        fit.sx,
        fit.sy,
        fit.sWidth,
        fit.sHeight,
        fit.dx,
        fit.dy,
        fit.dWidth,
        fit.dHeight
      );
      ctx.restore();

      // Top Comic Badge
      ctx.fillStyle = '#fde047'; // bright yellow
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 130, 48, 260, 40, 10);
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 20px "Fredoka", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText('¡MAMÁ ARGENTINA! 🇦🇷', width / 2, 75);

      // Speech Bubble with Humor Quote
      const bubbleW = width - 80;
      const bubbleH = 150;
      const bubbleX = 40;
      const bubbleY = 110;

      drawSpeechBubble(
        ctx,
        bubbleX,
        bubbleY,
        bubbleW,
        bubbleH,
        24,
        bubbleX + bubbleW * 0.4,
        bubbleY + bubbleH + 35,
        theme.speechBubbleBg,
        theme.frameBorderColor,
        6
      );

      // Render text inside speech bubble
      ctx.font = '700 32px "Fredoka", sans-serif';
      ctx.fillStyle = theme.speechBubbleText;
      ctx.textAlign = 'center';
      const lines = wrapText(ctx, humorQuote, bubbleW - 40);
      const startTextY = bubbleY + 55 + (lines.length === 1 ? 20 : 0);
      lines.forEach((line, idx) => {
        ctx.fillText(line, width / 2, startTextY + idx * 40);
      });

    } else {
      // ESCENA 2: Real Photo framed with hearts & Emotional declaration
      const zoom = calculateZoomScale(sceneProgress, 1.07);

      // Photo frame area
      const frameX = 40;
      const frameY = 80;
      const frameW = width - 80;
      const frameH = 750;

      // Draw real photo inside rounded clip
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(frameX, frameY, frameW, frameH, 30);
      ctx.clip();

      const fit = calculateObjectCoverFit(
        imgReal.width,
        imgReal.height,
        frameW,
        frameH,
        zoom
      );

      ctx.drawImage(
        imgReal,
        fit.sx,
        fit.sy,
        fit.sWidth,
        fit.sHeight,
        frameX + fit.dx,
        frameY + fit.dy,
        fit.dWidth,
        fit.dHeight
      );
      ctx.restore();

      // Comic photo frame border
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.roundRect(frameX, frameY, frameW, frameH, 30);
      ctx.stroke();

      // Heart stickers around photo frame
      ctx.font = '36px "Fredoka", sans-serif';
      ctx.fillText('❤️', frameX + 25, frameY + 45);
      ctx.fillText('✨', frameX + frameW - 45, frameY + 45);
      ctx.fillText('💖', frameX + frameW - 45, frameY + frameH - 25);
      ctx.fillText('🧉', frameX + 25, frameY + frameH - 25);

      // Emotional Message Box with Pop-In animation
      const popScale = Math.min(1.0, 0.5 + sceneProgress * 0.9);
      const boxW = width - 60;
      const boxH = 240;
      const boxX = 30;
      const boxY = height - 370;

      ctx.save();
      ctx.translate(width / 2, boxY + boxH / 2);
      ctx.scale(popScale, popScale);
      ctx.translate(-width / 2, -(boxY + boxH / 2));

      // Comic shadow
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(boxX + 8, boxY + 8, boxW, boxH, 24);
      ctx.fill();

      // Box surface
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 24);
      ctx.fill();
      ctx.stroke();

      // Top mini badge
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.roundRect(boxX + 30, boxY - 18, 160, 36, 12);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.font = '700 16px "Fredoka", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('¡FELIZ DÍA MAMÁ! ❤️', boxX + 110, boxY + 6);

      // Text inside box
      ctx.font = '700 32px "Fredoka", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      const lines = wrapText(ctx, emotionalQuote, boxW - 50);
      const startEmotionalY = boxY + 65;
      lines.forEach((line, idx) => {
        ctx.fillText(line, width / 2, startEmotionalY + idx * 42);
      });

      ctx.restore();

      // Tagline watermark
      ctx.font = '600 20px "Space Mono", monospace';
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.fillText(taglineText, width / 2, height - 60);
    }

    // Outer Thick Comic Frame Border around video
    ctx.strokeStyle = theme.frameBorderColor;
    ctx.lineWidth = theme.frameBorderWidth;
    ctx.strokeRect(0, 0, width, height);

    // MARCA DE AGUA FLOTANTE (ESTILO CÓMIC / STICKER)
    ctx.save();
    ctx.translate(width - 240, 36);
    ctx.rotate((2 * Math.PI) / 180);
    // shadow
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(4, 4, 210, 48, 14);
    ctx.fill();
    // white card
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(0, 0, 210, 48, 14);
    ctx.fill();
    ctx.stroke();
    // BITANOMALY @huapirodriguez
    ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.fillText('BITANOMALY', 14, 31);
    ctx.font = '700 16px "Fredoka", sans-serif';
    ctx.fillStyle = '#db2777';
    ctx.fillText('@huapirodriguez', 134, 30);
    ctx.restore();

    // Top Stories Progress Bar
    const barPadding = 24;
    const barHeight = 8;
    const barWidth = width - barPadding * 2;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.beginPath();
    ctx.roundRect(barPadding, 20, barWidth, barHeight, 4);
    ctx.fill();

    ctx.fillStyle = '#f43f5e';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(barPadding, 20, barWidth * overallProgress, barHeight, 4);
    ctx.fill();
    ctx.stroke();

    if (onProgress) {
      onProgress(frame / totalFrames);
    }

    await new Promise((r) => setTimeout(r, 1000 / fps));
  }

  recorder.stop();
  const resultBlob = await recordingPromise;
  return resultBlob;
}

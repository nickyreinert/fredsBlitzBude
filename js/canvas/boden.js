'use strict';

/* ================================================================
   BODEN – Gras und Straße zeichnen (saisonal eingefärbt)
   ================================================================ */

function zeichneBoden(w, h) {
  const bodenY = h * 0.65;
  const jz = JAHRESZEITEN[gameState.jahreszeit] || JAHRESZEITEN.fruehling;

  // Gras-Bereich
  const grasGrad = ctx.createLinearGradient(0, bodenY, 0, h);
  grasGrad.addColorStop(0, jz.boden[0]);
  grasGrad.addColorStop(1, jz.boden[1]);
  ctx.fillStyle = grasGrad;
  ctx.fillRect(0, bodenY, w, h - bodenY);

  // Graslinie
  ctx.fillStyle = jz.boden[1];
  ctx.fillRect(0, bodenY, w, 4);

  // Winter: Schneedecke
  if (gameState.jahreszeit === 'winter') {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(0, bodenY, w, h * 0.07);
  }

  // Straße
  const strasseY = h * 0.78;
  ctx.fillStyle = '#9e9e9e';
  ctx.fillRect(0, strasseY, w, h - strasseY);

  // Straßenrand (saisonal)
  ctx.fillStyle = jz.strasseRand;
  ctx.fillRect(0, strasseY, w, 4);

  // Mittelstreifen
  ctx.fillStyle = '#ffee58';
  ctx.setLineDash([w * 0.05, w * 0.04]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffee58';
  ctx.beginPath();
  ctx.moveTo(0, strasseY + (h - strasseY) * 0.5);
  ctx.lineTo(w, strasseY + (h - strasseY) * 0.5);
  ctx.stroke();
  ctx.setLineDash([]);
}

'use strict';

/* ================================================================
   HIMMEL – Himmel, Sonne, Wolken zeichnen
   ================================================================ */

// Himmel (Farbverlauf – saisonal eingefärbt)
function zeichneHimmel(w, h) {
  const jz = JAHRESZEITEN[gameState.jahreszeit] || JAHRESZEITEN.fruehling;
  const grad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
  grad.addColorStop(0, jz.himmel[0]);
  grad.addColorStop(1, jz.himmel[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h * 0.65);

  // Winter: Schneeflocken-Punkte im Himmel
  if (gameState.jahreszeit === 'winter') {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    const seed = gameState.day * 137;
    for (let i = 0; i < 18; i++) {
      const sx = ((seed * (i + 1) * 7919) % w);
      const sy = ((seed * (i + 3) * 6271) % (h * 0.55));
      const sr = 1.5 + (i % 3);
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Herbst: Blätter-Punkte
  if (gameState.jahreszeit === 'herbst') {
    const blaetter = ['🍂', '🍁'];
    const seed = gameState.day * 137;
    ctx.font = '14px serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    for (let i = 0; i < 6; i++) {
      const bx = ((seed * (i + 2) * 4001) % w);
      const by = ((seed * (i + 5) * 3307) % (h * 0.5));
      ctx.fillText(blaetter[i % 2], bx, by);
    }
  }
}

// Sonne (bewegt sich von links nach rechts als Sinusbogen)
function zeichneSonne(w, h) {
  const t = gameState.sunX;
  const x = w * (0.05 + t * 0.90);
  const bogenHoehe = h * 0.55;
  const grundY = h * 0.68;
  const y = grundY - Math.sin(t * Math.PI) * bogenHoehe;
  const r = Math.min(w, h) * 0.055;

  // Strahlen
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#FFD54F';
  ctx.lineWidth = Math.max(2, r * 0.15);
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(r * 1.3, 0);
    ctx.lineTo(r * 1.9, 0);
    ctx.stroke();
  }
  ctx.restore();

  // Sonnenkreis
  const sunGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  sunGrad.addColorStop(0, '#FFF9C4');
  sunGrad.addColorStop(0.6, '#FFD54F');
  sunGrad.addColorStop(1, '#FFA000');
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = sunGrad;
  ctx.fill();
}

// Wolken (einfache Kreisgruppen)
function zeichneWolken(w, h) {
  const wolkenPositionen = [
    { x: w * 0.25, y: h * 0.08, size: 1.0 },
    { x: w * 0.65, y: h * 0.05, size: 0.7 },
    { x: w * 0.85, y: h * 0.11, size: 0.8 },
  ];
  wolkenPositionen.forEach(wolke => {
    zeichneWolke(wolke.x, wolke.y, wolke.size * Math.min(w, h) * 0.08);
  });
}

function zeichneWolke(x, y, r) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  [[0, 0], [-r * 0.9, r * 0.3], [r * 0.9, r * 0.3], [-r * 0.5, -r * 0.3], [r * 0.5, -r * 0.2]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
  });
}

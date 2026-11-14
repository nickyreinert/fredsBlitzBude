'use strict';

/* ================================================================
   HIMMEL – Himmel, Sonne, Wolken zeichnen
   ================================================================ */

// Himmel (Farbverlauf – saisonal eingefärbt)
function zeichneHimmel(w, h) {
  const jz = JAHRESZEITEN[gameState.jahreszeit] || JAHRESZEITEN.fruehling;
  const himmelH = szenenMasse(w, h).bodenY;
  const grad = ctx.createLinearGradient(0, 0, 0, himmelH);
  if (istRegen()) {
    // Regentag: grauer, trüber Himmel
    grad.addColorStop(0, '#78909c');
    grad.addColorStop(1, '#b0bec5');
  } else {
    grad.addColorStop(0, jz.himmel[0]);
    grad.addColorStop(1, jz.himmel[1]);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, himmelH);

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
  const sz = szenenMasse(w, h);
  const x = w * (0.05 + t * 0.90);
  const bogenHoehe = sz.szeneH * 0.55;
  const grundY = sz.szeneH * 0.68;
  const y = grundY - Math.sin(t * Math.PI) * bogenHoehe;
  const r = Math.min(w, sz.szeneH) * 0.055;

  // Bei Regen ist die Sonne nur blass hinter den Wolken zu sehen
  ctx.save();
  if (istRegen()) ctx.globalAlpha = 0.3;

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
  ctx.restore();
}

// Wolken (einfache Kreisgruppen) – bei Regen mehr und dunkler
function zeichneWolken(w, h) {
  const regen = istRegen();
  const wolkenPositionen = regen
    ? [
        { x: w * 0.08, y: h * 0.07, size: 1.1 },
        { x: w * 0.28, y: h * 0.10, size: 1.2 },
        { x: w * 0.50, y: h * 0.06, size: 1.0 },
        { x: w * 0.72, y: h * 0.10, size: 1.2 },
        { x: w * 0.92, y: h * 0.07, size: 1.0 },
      ]
    : [
        { x: w * 0.25, y: h * 0.08, size: 1.0 },
        { x: w * 0.65, y: h * 0.05, size: 0.7 },
        { x: w * 0.85, y: h * 0.11, size: 0.8 },
      ];
  const farbe = regen ? 'rgba(96, 110, 120, 0.95)' : 'rgba(255, 255, 255, 0.9)';
  wolkenPositionen.forEach(wolke => {
    zeichneWolke(wolke.x, wolke.y, wolke.size * Math.min(w, h) * 0.08, farbe);
  });
}

function zeichneWolke(x, y, r, farbe = 'rgba(255, 255, 255, 0.9)') {
  ctx.fillStyle = farbe;
  [[0, 0], [-r * 0.9, r * 0.3], [r * 0.9, r * 0.3], [-r * 0.5, -r * 0.3], [r * 0.5, -r * 0.2]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Regentropfen (schräge Striche, fallen animiert nach unten)
function zeichneRegen(w, h) {
  if (!istRegen()) return;
  const zeit = performance.now();
  const anzahl = Math.round(Math.min(160, w * 0.12));
  const laenge = Math.max(10, h * 0.025);

  ctx.save();
  ctx.strokeStyle = 'rgba(200, 225, 255, 0.65)';
  ctx.lineWidth = Math.max(1.5, w * 0.0015);
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i < anzahl; i++) {
    // Feste Pseudo-Zufallsposition pro Tropfen, Fallbewegung über die Zeit
    const startX = (i * 7919) % w;
    const tempo  = 0.5 + ((i * 31) % 10) / 20;      // px pro ms
    const y = ((i * 6271) + zeit * tempo) % (h + laenge) - laenge;
    const x = startX - y * 0.15;
    ctx.moveTo(x, y);
    ctx.lineTo(x - laenge * 0.15, y + laenge);
  }
  ctx.stroke();
  ctx.restore();
}

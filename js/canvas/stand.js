'use strict';

/* ================================================================
   STAND – Holzstand zeichnen (braunes Rechteck mit Dach)
   ================================================================ */

function zeichneStand(w, h) {
  const standBreite  = Math.min(w * 0.6, 340);
  const standHoehe   = Math.min(h * 0.28, 180);
  const standX       = (w - standBreite) / 2;
  const standY       = h * 0.48;
  const theke        = standHoehe * 0.4;

  // Schatten
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(w / 2, standY + standHoehe + 6, standBreite * 0.52, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Holz-Rückwand
  const holzGrad = ctx.createLinearGradient(standX, standY, standX + standBreite, standY + standHoehe);
  holzGrad.addColorStop(0, '#8d6e63');
  holzGrad.addColorStop(1, '#5d4037');
  ctx.fillStyle = holzGrad;
  ctx.beginPath();
  ctx.roundRect(standX, standY, standBreite, standHoehe - theke, 8);
  ctx.fill();

  // Holzmaserung
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) {
    const lineY = standY + (standHoehe - theke) * (i / 5);
    ctx.beginPath();
    ctx.moveTo(standX + 4, lineY);
    ctx.lineTo(standX + standBreite - 4, lineY);
    ctx.stroke();
  }

  // Theke
  const thekeGrad = ctx.createLinearGradient(standX, standY + standHoehe - theke, standX, standY + standHoehe);
  thekeGrad.addColorStop(0, '#a1887f');
  thekeGrad.addColorStop(1, '#795548');
  ctx.fillStyle = thekeGrad;
  ctx.beginPath();
  ctx.roundRect(standX - 10, standY + standHoehe - theke, standBreite + 20, theke, [0, 0, 8, 8]);
  ctx.fill();

  // Thekenkante
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(standX - 10, standY + standHoehe - theke, standBreite + 20, 5);

  // Dach
  const dachUeberstand = standBreite * 0.15;
  ctx.fillStyle = '#e53935';
  ctx.beginPath();
  ctx.moveTo(standX - dachUeberstand, standY + 5);
  ctx.lineTo(w / 2, standY - standHoehe * 0.45);
  ctx.lineTo(standX + standBreite + dachUeberstand, standY + 5);
  ctx.closePath();
  ctx.fill();

  // Dachkante
  ctx.fillStyle = '#b71c1c';
  ctx.beginPath();
  ctx.moveTo(standX - dachUeberstand, standY + 5);
  ctx.lineTo(standX + standBreite + dachUeberstand, standY + 5);
  ctx.lineTo(standX + standBreite + dachUeberstand, standY + 12);
  ctx.lineTo(standX - dachUeberstand, standY + 12);
  ctx.closePath();
  ctx.fill();

  // Schild
  const schildBreite = standBreite * 0.55;
  const schildX = (w - schildBreite) / 2;
  const schildY = standY + (standHoehe - theke) * 0.15;
  const schildH = (standHoehe - theke) * 0.3;

  ctx.fillStyle = '#fff9c4';
  ctx.strokeStyle = '#f57f17';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(schildX, schildY, schildBreite, schildH, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#e65100';
  ctx.font = `bold ${Math.max(12, schildH * 0.55)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🥦 Freds Blitz-Bude', w / 2, schildY + schildH / 2);

  // Stand-Koordinaten für Produkte speichern
  gameState._stand = { x: standX, y: standY, b: standBreite, h: standHoehe, theke };
}

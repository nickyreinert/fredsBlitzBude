'use strict';

/* ================================================================
   FIGUREN – Köpfe, Kunden, Passanten zeichnen
   ================================================================ */

// Kopf einer Figur zeichnen
function zeichneKopf(cx, cy, r, kunde, gespiegelt) {
  if (!kunde) return;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = kunde.haut || '#FFCC80';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = r * 0.12;
  ctx.stroke();

  // Haare je nach Frisur
  ctx.fillStyle = kunde.haar || '#5D4037';
  const frisur = kunde.frisur || 'kurz';

  if (frisur === 'glatze') {
    // nichts
  } else if (frisur === 'kurz') {
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.1, r * 1.05, Math.PI * 1.1, Math.PI * 1.9);
    ctx.fill();
  } else if (frisur === 'lang') {
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.1, r * 1.05, Math.PI * 1.1, Math.PI * 1.9);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(cx - r * 1.05, cy - r * 0.2, r * 0.35, r * 1.4, r * 0.15);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(cx + r * 0.7, cy - r * 0.2, r * 0.35, r * 1.4, r * 0.15);
    ctx.fill();
  } else if (frisur === 'zopf') {
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.1, r * 1.05, Math.PI * 1.1, Math.PI * 1.9);
    ctx.fill();
    const zopfX = gespiegelt ? cx - r * 0.5 : cx + r * 0.5;
    ctx.beginPath();
    ctx.arc(zopfX, cy - r * 0.85, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  } else if (frisur === 'locken') {
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI + (i / 5) * Math.PI;
      const lx = cx + Math.cos(angle) * r * 0.85;
      const ly = cy + Math.sin(angle) * r * 0.85;
      ctx.beginPath();
      ctx.arc(lx, ly, r * 0.42, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Augen
  ctx.fillStyle = '#333';
  const augeAbstand = r * 0.35;
  ctx.beginPath();
  ctx.arc(cx - augeAbstand, cy - r * 0.1, r * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + augeAbstand, cy - r * 0.1, r * 0.13, 0, Math.PI * 2);
  ctx.fill();

  // Mund
  ctx.beginPath();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = r * 0.1;
  ctx.arc(cx, cy + r * 0.2, r * 0.28, 0.1, Math.PI - 0.1);
  ctx.stroke();
}

// Strichmännchen als Kunde zeichnen (steht links vom Stand)
function zeichneKunde(w, _h) {
  const { x: sX } = gameState._stand || { x: w * 0.2 };
  const kundeX = sX - Math.min(w * 0.12, 70);
  const kundeY = gameState.customerAnimY;
  const kopfR = Math.min(w * 0.035, 20);
  const koerperH = kopfR * 2.8;

  // Schatten
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(kundeX, kundeY + koerperH + kopfR + 5, kopfR * 0.9, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = Math.max(2, kopfR * 0.25);
  ctx.lineCap = 'round';

  // Rumpf
  ctx.beginPath();
  ctx.moveTo(kundeX, kundeY + kopfR);
  ctx.lineTo(kundeX, kundeY + kopfR + koerperH);
  ctx.stroke();

  // Arme
  const armWinkel = Math.sin(gameState.walkStep * 0.15) * 0.3;
  ctx.beginPath();
  ctx.moveTo(kundeX, kundeY + kopfR + koerperH * 0.3);
  ctx.lineTo(kundeX - kopfR * 1.5 - armWinkel * kopfR, kundeY + kopfR + koerperH * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(kundeX, kundeY + kopfR + koerperH * 0.3);
  ctx.lineTo(kundeX + kopfR * 1.5 + armWinkel * kopfR, kundeY + kopfR + koerperH * 0.8);
  ctx.stroke();

  // Beine
  const beinWinkel = Math.sin(gameState.walkStep * 0.15) * 0.25;
  ctx.beginPath();
  ctx.moveTo(kundeX, kundeY + kopfR + koerperH);
  ctx.lineTo(kundeX - kopfR * 0.8 - beinWinkel * kopfR, kundeY + kopfR + koerperH * 1.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(kundeX, kundeY + kopfR + koerperH);
  ctx.lineTo(kundeX + kopfR * 0.8 + beinWinkel * kopfR, kundeY + kopfR + koerperH * 1.6);
  ctx.stroke();

  // Kopf
  const kunde = gameState.currentCustomer;
  if (kunde) {
    zeichneKopf(kundeX, kundeY, kopfR, kunde, false);
  } else {
    ctx.beginPath();
    ctx.arc(kundeX, kundeY, kopfR, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc80';
    ctx.fill();
    ctx.strokeStyle = '#5d4037';
    ctx.stroke();
  }
}

// Einen einzelnen Passanten zeichnen
function zeichnePassant(p, w, h) {
  const strasseY = h * 0.84;
  const x = p.x;
  const y = strasseY;
  const scale = p.groesse;
  const kopfR = Math.min(w * 0.032, 18) * scale;
  const koerperH = kopfR * 2.6;

  // Schatten
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.beginPath();
  ctx.ellipse(x, y + koerperH + kopfR + 3, kopfR * 0.85, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const schwung = p.steht ? Math.sin(p.walkStep * 2) * 0.06 : Math.sin(p.walkStep) * 0.3;

  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = Math.max(1.5, kopfR * 0.22);
  ctx.lineCap = 'round';

  // Rumpf
  ctx.beginPath();
  ctx.moveTo(x, y + kopfR * 0.8);
  ctx.lineTo(x, y + kopfR * 0.8 + koerperH);
  ctx.stroke();

  // Arme
  ctx.beginPath();
  ctx.moveTo(x, y + kopfR + koerperH * 0.25);
  ctx.lineTo(x - kopfR * 1.4 - schwung * kopfR * p.richtung, y + kopfR + koerperH * 0.75);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + kopfR + koerperH * 0.25);
  ctx.lineTo(x + kopfR * 1.4 + schwung * kopfR * p.richtung, y + kopfR + koerperH * 0.75);
  ctx.stroke();

  // Beine
  ctx.beginPath();
  ctx.moveTo(x, y + kopfR * 0.8 + koerperH);
  ctx.lineTo(x - kopfR * 0.7 - schwung * kopfR, y + kopfR * 0.8 + koerperH * 1.55);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + kopfR * 0.8 + koerperH);
  ctx.lineTo(x + kopfR * 0.7 + schwung * kopfR, y + kopfR * 0.8 + koerperH * 1.55);
  ctx.stroke();

  // Kopf
  const kopfY = y - kopfR * 0.5;
  zeichneKopf(x, kopfY, kopfR, p.kunde, p.richtung === -1);

  // Sprechblase wenn Passant steht und kaufen will
  if (p.steht && !p.gespraechen && p.stehtTimer > 400
      && gameState.customers.length > 0) {
    const blasenW = 44;
    const blasenH = 26;
    let blasenX = x + (p.richtung === 1 ? kopfR * 2.5 : -kopfR * 2.5);
    let blasenY = kopfY - kopfR - blasenH - 4;
    blasenX = Math.max(blasenW / 2 + 4, Math.min(canvas.width - blasenW / 2 - 4, blasenX));
    blasenY = Math.max(80, blasenY);

    ctx.fillStyle = '#fff9c4';
    ctx.strokeStyle = '#f9a825';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(blasenX - blasenW / 2, blasenY, blasenW, blasenH, 8);
    ctx.fill();
    ctx.stroke();
    ctx.font = `${kopfR * 1.1}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛒', blasenX, blasenY + blasenH / 2);
  }
}

// Alle Passanten zeichnen
function zeichnePassanten(w, h) {
  gameState.passanten.forEach(p => zeichnePassant(p, w, h));
}

// Hund neben dem Stand zeichnen (sitzt rechts vom Stand)
function zeichneHund(w, h) {
  if (!gameState.zubehoer.hund) return;

  const standInfo = gameState._stand || { x: w * 0.2, breite: w * 0.35 };
  const strasseY = h * 0.84;

  // Position: rechts vom Stand-Tresen
  const hundX = standInfo.x + (standInfo.breite ?? w * 0.35) * 0.55 + Math.min(w * 0.06, 40);
  const hundY = strasseY;

  // Grundeinheit relativ zur Canvas-Breite
  const gr = Math.min(w * 0.028, 16);

  // Leichte Schwanz-Wackelanimation
  const wag = Math.sin(Date.now() * 0.004) * 0.15;

  ctx.save();
  ctx.translate(hundX, hundY);

  // Schatten
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.beginPath();
  ctx.ellipse(0, gr * 0.1, gr * 1.4, gr * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Körper (sitzende Haltung: ovaler Rumpf)
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.ellipse(0, -gr * 1.1, gr * 1.0, gr * 1.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hinterbeine (sitzend)
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.ellipse(-gr * 0.7, -gr * 0.1, gr * 0.5, gr * 0.35, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(gr * 0.7, -gr * 0.1, gr * 0.5, gr * 0.35, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Vorderpfoten
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.ellipse(-gr * 0.55, gr * 0.0, gr * 0.3, gr * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(gr * 0.55, gr * 0.0, gr * 0.3, gr * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Schwanz (wackelt)
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = gr * 0.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(gr * 0.9, -gr * 1.6);
  ctx.quadraticCurveTo(gr * 1.8 + wag * gr * 3, -gr * 2.4, gr * 1.4 + wag * gr * 4, -gr * 2.8);
  ctx.stroke();

  // Kopf
  ctx.fillStyle = '#CD853F';
  ctx.beginPath();
  ctx.arc(0, -gr * 2.5, gr * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Schnauze
  ctx.fillStyle = '#DEB887';
  ctx.beginPath();
  ctx.ellipse(0, -gr * 2.1, gr * 0.5, gr * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nase
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(0, -gr * 2.05, gr * 0.18, gr * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Augen
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(-gr * 0.3, -gr * 2.55, gr * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(gr * 0.3, -gr * 2.55, gr * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Glanzpunkte in den Augen
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-gr * 0.26, -gr * 2.59, gr * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(gr * 0.34, -gr * 2.59, gr * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Schlappohren
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.ellipse(-gr * 0.75, -gr * 2.4, gr * 0.28, gr * 0.6, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(gr * 0.75, -gr * 2.4, gr * 0.28, gr * 0.6, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

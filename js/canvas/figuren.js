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

  // Rote Bäckchen
  ctx.fillStyle = 'rgba(244, 143, 177, 0.55)';
  ctx.beginPath();
  ctx.arc(cx - r * 0.55, cy + r * 0.2, r * 0.16, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.55, cy + r * 0.2, r * 0.16, 0, Math.PI * 2);
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

// Einen einzelnen Passanten zeichnen (Körper mit T-Shirt, Hose, Schuhen und Händen)
function zeichnePassant(p, w, h) {
  const sz = szenenMasse(w, h);
  const x = p.x;
  const y = sz.laufY;
  const scale = p.groesse;
  const kopfR = sz.figurR * scale;
  const R = kopfR;

  const shirt = p.shirt || '#1e88e5';
  const hose  = p.hose  || '#37474f';
  const haut  = p.kunde?.haut || '#FFCC80';

  // Gehbewegung: Beine und Arme schwingen gegengleich, beim Stehen nur leichtes Wippen
  const schwung = p.steht ? Math.sin(p.walkStep * 2) * 0.05 : Math.sin(p.walkStep) * 0.45;

  const huefteY    = y + R * 2.55;
  const beinL      = R * 2.25;
  const schulterY  = y + R * 0.85;
  const armL       = R * 1.75;

  // Schatten unter den Füßen
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(x, huefteY + beinL + R * 0.2, R * 1.1, R * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineCap = 'round';

  // Beine (Hose) mit Schuhen
  [schwung, -schwung].forEach((winkel, i) => {
    const hx = x + (i === 0 ? -R * 0.3 : R * 0.3);
    const fx = hx + Math.sin(winkel) * beinL;
    const fy = huefteY + Math.cos(winkel) * beinL;
    ctx.strokeStyle = hose;
    ctx.lineWidth = R * 0.5;
    ctx.beginPath();
    ctx.moveTo(hx, huefteY);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    // Schuh zeigt in Laufrichtung
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.ellipse(fx + p.richtung * R * 0.15, fy + R * 0.1, R * 0.38, R * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Oberkörper (T-Shirt) – abgerundetes Rechteck
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.roundRect(x - R * 0.85, y + R * 0.55, R * 1.7, R * 2.15, R * 0.45);
  ctx.fill();

  // Arme (Ärmel in Shirt-Farbe) mit Händen
  [-schwung, schwung].forEach((winkel, i) => {
    const sxA = x + (i === 0 ? -R * 0.75 : R * 0.75);
    const seite = i === 0 ? -1 : 1;
    const hx = sxA + seite * R * 0.35 + Math.sin(winkel) * armL;
    const hy = schulterY + Math.cos(winkel) * armL;
    ctx.strokeStyle = shirt;
    ctx.lineWidth = R * 0.42;
    ctx.beginPath();
    ctx.moveTo(sxA, schulterY);
    ctx.lineTo(hx, hy);
    ctx.stroke();
    ctx.fillStyle = haut;
    ctx.beginPath();
    ctx.arc(hx, hy, R * 0.24, 0, Math.PI * 2);
    ctx.fill();
  });

  // Hals
  ctx.fillStyle = haut;
  ctx.fillRect(x - R * 0.22, y + R * 0.3, R * 0.44, R * 0.35);

  // Kopf
  const kopfY = y - kopfR * 0.5;
  zeichneKopf(x, kopfY, kopfR, p.kunde, p.richtung === -1);

  // Blase "Zu teuer!" mit traurigem Gesicht
  if (p.steht && p.zuTeuer) {
    const bh = Math.max(28, kopfR * 1.7);
    ctx.font = `bold ${bh * 0.5}px system-ui`;
    const bw = ctx.measureText('😞 Zu teuer!').width + bh * 0.8;   // Breite nach Text
    const bx = Math.max(bw / 2 + 4, Math.min(canvas.width - bw / 2 - 4, x));
    const by = Math.max(80, kopfY - kopfR - bh - 6);
    ctx.fillStyle = '#ffebee';
    ctx.strokeStyle = '#e53935';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bx - bw / 2, by, bw, bh, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c62828';
    ctx.font = `bold ${bh * 0.5}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('😞 Zu teuer!', bx, by + bh / 2);
  }

  // Sprechblase wenn Passant steht und kaufen will
  if (p.steht && !p.gespraechen && !p.zuTeuer && p.stehtTimer > 400
      && gameState.customers.length > 0) {
    const blasenW = Math.max(44, kopfR * 2.6);
    const blasenH = Math.max(26, kopfR * 1.6);
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

  const sz = szenenMasse(w, h);

  // Position: rechts neben dem Stand, auf dem Gehweg
  // Grundeinheit relativ zur Figurengröße
  const grHund = sz.figurR * 0.9;
  // Neben der Kühlbox (falls gekauft) und nicht aus dem Bild laufen
  const hundX = Math.min(sz.mitteX + sz.standB * 0.5 + sz.figurR * 2 + kuehlboxPlatz(sz), w - grHund * 2);
  const hundY = sz.laufY;

  // Grundeinheit relativ zur Figurengröße
  const gr = sz.figurR * 0.9;

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

/* ── Weitere Tiere aus dem Zubehör-Shop ─────────────────────────── */

// Punkt auf der Dachschräge berechnen (t = 0 → Dachkante, t = 1 → Dachspitze)
// seite: -1 = linke Schräge, +1 = rechte Schräge (Geometrie wie in stand.js)
function dachPunkt(sz, seite, t) {
  const ueberstand = sz.standB * 0.15;
  const kanteX = sz.mitteX + seite * (sz.standB / 2 + ueberstand);
  const kanteY = sz.standY + 5;
  const spitzeY = sz.standY - sz.standH * 0.45;
  return {
    x: kanteX + (sz.mitteX - kanteX) * t,
    y: kanteY + (spitzeY - kanteY) * t,
  };
}

// Emoji auf den Canvas malen (unten mittig ausgerichtet)
function zeichneTierEmoji(emoji, x, y, groesse, spiegeln) {
  ctx.save();
  ctx.translate(x, y);
  if (spiegeln) ctx.scale(-1, 1);
  ctx.font = `${groesse}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(emoji, 0, 0);
  ctx.restore();
}

// Alle gekauften Tiere (außer Hund – der hat eigene Zeichnung) zeichnen
function zeichneTiere(w, h) {
  const sz = szenenMasse(w, h);
  const zeit = performance.now();
  const tierGroesse = sz.figurR * 2.6;

  // Katze: steht auf der linken Dachschräge und "atmet" leicht
  if (gameState.zubehoer.katze) {
    const p = dachPunkt(sz, -1, 0.45);
    const atmen = 1 + Math.sin(zeit * 0.002) * 0.03;
    zeichneTierEmoji('🐈', p.x, p.y + tierGroesse * 0.12, tierGroesse * atmen, false);
  }

  // Papagei: sitzt auf der rechten Dachschräge und wippt
  if (gameState.zubehoer.papagei) {
    const p = dachPunkt(sz, 1, 0.45);
    const wippen = Math.sin(zeit * 0.004) * sz.figurR * 0.15;
    zeichneTierEmoji('🦜', p.x, p.y + tierGroesse * 0.1 + wippen, tierGroesse, true);
  }

  // Goldfische: rundes Glas auf einem Hocker links neben dem Stand
  const fische = gameState.zubehoer.fisch || 0;
  if (fische > 0) {
    const glasR = sz.figurR * 2.1;
    const glasX = Math.max(glasR + 6, sz.mitteX - sz.standB / 2 - glasR * 1.4);
    const hockerH = glasR * 0.9;
    const bodenY = sz.strasseY;                 // Hocker steht am Straßenrand
    const glasY = bodenY - hockerH - glasR;     // Mittelpunkt des Glases

    // Hocker (Holz)
    ctx.fillStyle = '#795548';
    ctx.fillRect(glasX - glasR * 0.7, bodenY - hockerH, glasR * 1.4, glasR * 0.2);
    ctx.fillRect(glasX - glasR * 0.6, bodenY - hockerH, glasR * 0.15, hockerH);
    ctx.fillRect(glasX + glasR * 0.45, bodenY - hockerH, glasR * 0.15, hockerH);

    // Wasser im Glas
    ctx.save();
    ctx.beginPath();
    ctx.arc(glasX, glasY, glasR, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = 'rgba(129, 212, 250, 0.55)';
    ctx.fillRect(glasX - glasR, glasY - glasR * 0.55, glasR * 2, glasR * 2);

    // Fische schwimmen hin und her
    for (let i = 0; i < fische; i++) {
      const phase = zeit * 0.0012 + i * 2.1;
      const fx = glasX + Math.sin(phase) * glasR * 0.45;
      const fy = glasY + glasR * (0.35 - i * 0.28) + Math.sin(phase * 1.7) * glasR * 0.06;
      // Blickrichtung passend zur Schwimmrichtung
      zeichneTierEmoji("🐠", fx, fy + glasR * 0.3, glasR * 0.8, Math.cos(phase) > 0);
    }
    ctx.restore();

    // Glasrand mit Glanzlicht
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = Math.max(2, glasR * 0.08);
    ctx.beginPath();
    ctx.arc(glasX, glasY, glasR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(glasX, glasY, glasR * 0.75, Math.PI * 1.1, Math.PI * 1.4);
    ctx.stroke();
  }
}

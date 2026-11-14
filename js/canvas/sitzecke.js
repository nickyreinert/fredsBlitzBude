'use strict';

/* ================================================================
   SITZECKE – Tische, Stühle, Bank und sitzende Gäste zeichnen
   Querformat: rechts neben der Szene (dort, wo sonst die Panel-Karte liegt)
   Hochformat: auf der Wiese unterhalb der Straße
   ================================================================ */

// Breite der Möbelstücke in Einheiten (u ≈ Kopfradius der Figuren)
const MOEBEL_BREITE = { tisch: 7.6, bank: 5.2 };

// Position aller Möbel und Sitzplätze berechnen (null = keine Möbel gekauft)
function sitzeckeLayout(w, h) {
  const zb = gameState.zubehoer || {};
  const teile = [];
  for (let i = 0; i < (zb.tisch || 0); i++) teile.push('tisch');
  if (zb.bank) teile.push('bank');
  if (teile.length === 0) return null;

  const sz = szenenMasse(w, h);
  let x0, x1, boden;
  if (sz.quer) {
    // Rechts neben der Szene, auf der Wiese am Straßenrand
    x0 = sz.mitteX * 2 + 10;
    x1 = w - 10;
    boden = sz.strasseY;
  } else {
    // Hochformat: Wiese unterhalb der Straße
    x0 = 10;
    x1 = w - 10;
    boden = sz.szeneH + (h - sz.szeneH) * 0.42;
  }

  // Einheit so wählen, dass alles nebeneinander passt
  const luecke = 1;
  const gesamt = teile.reduce((s, t) => s + MOEBEL_BREITE[t], 0) + luecke * (teile.length - 1);
  const u = Math.min(sz.figurR * 1.1, (x1 - x0) / gesamt);

  let x = (x0 + x1) / 2 - (gesamt * u) / 2;
  const moebel = [];
  const plaetze = [];
  teile.forEach(typ => {
    const breite = MOEBEL_BREITE[typ] * u;
    const cx = x + breite / 2;
    moebel.push({ typ, cx });
    // Tisch: je ein Stuhl links und rechts – Bank: zwei Plätze nebeneinander
    const abstand = typ === 'tisch' ? 2.9 * u : 1.2 * u;
    plaetze.push({ x: cx - abstand, typ }, { x: cx + abstand, typ });
    x += breite + luecke * u;
  });

  return { u, boden, moebel, plaetze };
}

// Holz-Farben
const HOLZ_HELL = '#a1887f';
const HOLZ_DUNKEL = '#6d4c41';

// Stuhl (Lehne hinter der sitzenden Person)
function zeichneStuhl(x, boden, u) {
  const sitzY = boden - 1.5 * u;
  ctx.fillStyle = HOLZ_DUNKEL;
  ctx.fillRect(x - 0.65 * u, sitzY, 0.18 * u, 1.5 * u);
  ctx.fillRect(x + 0.47 * u, sitzY, 0.18 * u, 1.5 * u);
  ctx.fillStyle = HOLZ_HELL;
  ctx.beginPath();
  ctx.roundRect(x - 0.75 * u, sitzY - 2.3 * u, 1.5 * u, 2.3 * u, 0.3 * u);   // Lehne
  ctx.fill();
  ctx.fillStyle = HOLZ_DUNKEL;
  ctx.fillRect(x - 0.85 * u, sitzY - 0.1 * u, 1.7 * u, 0.3 * u);              // Sitzfläche
}

// Bank (lange Lehne + Sitzfläche)
function zeichneBank(cx, boden, u) {
  const sitzY = boden - 1.5 * u;
  const halb = 2.4 * u;
  ctx.fillStyle = HOLZ_HELL;
  ctx.beginPath();
  ctx.roundRect(cx - halb, sitzY - 2.2 * u, halb * 2, 1.9 * u, 0.3 * u);
  ctx.fill();
  ctx.fillStyle = HOLZ_DUNKEL;
  ctx.fillRect(cx - halb, sitzY - 0.1 * u, halb * 2, 0.32 * u);
  ctx.fillRect(cx - halb + 0.2 * u, sitzY, 0.22 * u, 1.5 * u);
  ctx.fillRect(cx + halb - 0.42 * u, sitzY, 0.22 * u, 1.5 * u);
}

// Tisch (runder Bistrotisch mit einem Bein) und etwas zu trinken darauf
function zeichneTisch(cx, boden, u) {
  const platteY = boden - 2.4 * u;
  ctx.fillStyle = HOLZ_DUNKEL;
  ctx.fillRect(cx - 0.18 * u, platteY, 0.36 * u, 2.4 * u);           // Bein
  ctx.fillRect(cx - 0.8 * u, boden - 0.2 * u, 1.6 * u, 0.2 * u);      // Fuß
  ctx.fillStyle = '#fff8e1';                                           // Tischdecke
  ctx.beginPath();
  ctx.roundRect(cx - 1.6 * u, platteY - 0.15 * u, 3.2 * u, 0.55 * u, 0.25 * u);
  ctx.fill();
  ctx.fillStyle = '#e53935';                                           // rote Borte
  ctx.fillRect(cx - 1.6 * u, platteY + 0.25 * u, 3.2 * u, 0.15 * u);
  ctx.font = `${1.2 * u}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('☕', cx - 0.6 * u, platteY - 0.05 * u);
  ctx.fillText('🍓', cx + 0.6 * u, platteY - 0.05 * u);
}

// Sitzende Person (von vorne, Hände im Schoß)
function zeichneSitzendenGast(gast, x, boden, u) {
  const R = u * 0.95;
  const huefteY = boden - 1.5 * u;
  const wippen = Math.sin(performance.now() * 0.002 + gast.wipp) * R * 0.04;
  const rumpfOben = huefteY - 2.15 * R + wippen;
  const haut = gast.kunde?.haut || '#FFCC80';

  ctx.lineCap = 'round';
  // Unterschenkel bis zum Boden + Schuhe
  [-1, 1].forEach(seite => {
    ctx.strokeStyle = gast.hose;
    ctx.lineWidth = R * 0.5;
    ctx.beginPath();
    ctx.moveTo(x + seite * 0.35 * R, huefteY + 0.1 * R);
    ctx.lineTo(x + seite * 0.4 * R, boden - 0.2 * R);
    ctx.stroke();
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.ellipse(x + seite * 0.45 * R, boden - 0.1 * R, R * 0.36, R * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  // Schoß (Oberschenkel von vorne gesehen)
  ctx.fillStyle = gast.hose;
  ctx.beginPath();
  ctx.roundRect(x - 0.85 * R, huefteY - 0.25 * R, 1.7 * R, 0.6 * R, 0.25 * R);
  ctx.fill();
  // Oberkörper
  ctx.fillStyle = gast.shirt;
  ctx.beginPath();
  ctx.roundRect(x - 0.85 * R, rumpfOben, 1.7 * R, huefteY - rumpfOben + 0.05 * R, 0.45 * R);
  ctx.fill();
  // Arme mit Händen im Schoß
  [-1, 1].forEach(seite => {
    ctx.strokeStyle = gast.shirt;
    ctx.lineWidth = R * 0.42;
    ctx.beginPath();
    ctx.moveTo(x + seite * 0.75 * R, rumpfOben + 0.3 * R);
    ctx.lineTo(x + seite * 0.55 * R, huefteY - 0.1 * R);
    ctx.stroke();
    ctx.fillStyle = haut;
    ctx.beginPath();
    ctx.arc(x + seite * 0.5 * R, huefteY - 0.05 * R, R * 0.24, 0, Math.PI * 2);
    ctx.fill();
  });
  // Hals und Kopf
  ctx.fillStyle = haut;
  ctx.fillRect(x - 0.22 * R, rumpfOben - 0.3 * R, 0.44 * R, 0.4 * R);
  zeichneKopf(x, rumpfOben - 1.05 * R, R, gast.kunde, false);
}

// Ganze Sitzecke zeichnen: erst Stühle/Bänke, dann Gäste, dann Tische davor
function zeichneSitzecke(w, h) {
  const lay = sitzeckeLayout(w, h);
  if (!lay) return;
  const { u, boden, moebel, plaetze } = lay;

  moebel.forEach(m => {
    if (m.typ === 'tisch') {
      zeichneStuhl(m.cx - 2.9 * u, boden, u);
      zeichneStuhl(m.cx + 2.9 * u, boden, u);
    } else {
      zeichneBank(m.cx, boden, u);
    }
  });

  gameState.gaeste.forEach(g => {
    const platz = plaetze[g.sitz];
    if (platz) zeichneSitzendenGast(g, platz.x, boden, u);
  });

  moebel.forEach(m => {
    if (m.typ === 'tisch') zeichneTisch(m.cx, boden, u);
  });
}

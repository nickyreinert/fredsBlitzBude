'use strict';

/* ================================================================
   SPIELWELT – Haupt-Zeichenfunktion + Tageszeit-Overlay
   ================================================================ */

// Haupt-Zeichenfunktion
function zeichneSpielwelt() {
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  zeichneHimmel(w, h);
  zeichneSonne(w, h);
  zeichneWolken(w, h);
  zeichneBoden(w, h);
  zeichneStand(w, h);

  // Produkte auf dem Stand anzeigen
  const hatWaren = Object.values(gameState.inventory).some(v => v > 0);
  if (hatWaren) {
    zeichneProdukte(w, h);
  }

  // Hund neben dem Stand (wenn gekauft)
  zeichneHund(w, h);

  // Passanten auf der Straße
  zeichnePassanten(w, h);

  // Tageszeit-Stimmungsoverlay
  if (gameState.standOpen) {
    zeichneTagesOverlay(w, h);
  }
}

// Halbtransparentes Farb-Overlay für Tageszeit-Stimmung
function zeichneTagesOverlay(w, h) {
  const tf = gameState.tagesfortschritt;

  // Interpoliere zwischen den nächsten zwei Stützpunkten
  let s0 = TAGES_OVERLAY_STUFEN[0];
  let s1 = TAGES_OVERLAY_STUFEN[1];
  for (let i = 0; i < TAGES_OVERLAY_STUFEN.length - 1; i++) {
    if (tf >= TAGES_OVERLAY_STUFEN[i].t && tf <= TAGES_OVERLAY_STUFEN[i + 1].t) {
      s0 = TAGES_OVERLAY_STUFEN[i];
      s1 = TAGES_OVERLAY_STUFEN[i + 1];
      break;
    }
  }
  const span = s1.t - s0.t || 1;
  const mix  = (tf - s0.t) / span;
  const r = Math.round(s0.r + (s1.r - s0.r) * mix);
  const g = Math.round(s0.g + (s1.g - s0.g) * mix);
  const b = Math.round(s0.b + (s1.b - s0.b) * mix);
  const a = s0.a + (s1.a - s0.a) * mix;

  if (a <= 0.005) return;

  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle   = `rgba(${r},${g},${b},${a})`;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

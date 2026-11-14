'use strict';

/* ================================================================
   GÄSTE – Kunden setzen sich nach dem Einkauf in die Sitzecke
   (nur wenn Tisch oder Bank gekauft und ein Platz frei ist)
   ================================================================ */

// Index eines freien Sitzplatzes, oder -1 wenn alles besetzt / keine Möbel
function freierSitzplatz() {
  const lay = sitzeckeLayout(canvas.width, canvas.height);
  if (!lay) return -1;
  const belegt = new Set(gameState.gaeste.map(g => g.sitz));
  const frei = lay.plaetze.map((_, i) => i).filter(i => !belegt.has(i));
  return frei.length > 0 ? zufallsElement(frei) : -1;
}

// Nach dem Einkauf: Kunde setzt sich (manchmal) noch kurz hin
function gastSetztSich(passant) {
  if (!passant || Math.random() > SITZ_CHANCE) return;
  const sitz = freierSitzplatz();
  if (sitz < 0) return;
  gameState.gaeste.push({
    sitz,
    kunde: passant.kunde,                 // gleiches Aussehen wie am Stand
    shirt: passant.shirt || '#1e88e5',
    hose:  passant.hose  || '#37474f',
    timer: zufall(SITZ_DAUER_MIN_MS, SITZ_DAUER_MAX_MS),
    wipp:  Math.random() * 6,
  });
}

// Sitzzeit herunterzählen – wer fertig ist, steht auf (verschwindet)
function aktualisiereGaeste(delta) {
  if (gameState.gaeste.length === 0) return;
  gameState.gaeste = gameState.gaeste.filter(g => (g.timer -= delta) > 0);
}

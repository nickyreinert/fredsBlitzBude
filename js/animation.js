'use strict';

/* ================================================================
   ANIMATION – Animations-Schleife (Hauptloop)
   ================================================================ */

let letzterZeitstempel = 0;

function animationsSchleife(zeitstempel) {
  const delta = zeitstempel - letzterZeitstempel;
  letzterZeitstempel = zeitstempel;

  // Sonne synchron mit Tagesfortschritt bewegen
  // Wenn Stand offen: tagesfortschritt steuert (wird in aktualisierePassanten gesetzt)
  // Wenn Stand noch zu: Sonne wartet bei Tagesbeginn (0) – kein Druck aufs Kind
  if (gameState.standOpen) {
    gameState.sunX = gameState.tagesfortschritt;
  } else {
    gameState.sunX = 0;
  }

  // Passanten bewegen
  aktualisierePassanten(delta);

  // Leichte Schaukel-Animation beim aktiven Kunden
  if (gameState.customerVisible && !gameState.customerWalking) {
    gameState.walkStep += delta * 0.003;
  }

  // Spielwelt neu zeichnen
  zeichneSpielwelt();

  // HUD-Uhr aktualisieren: Fortschritt = Tagesfortschritt (0–1)
  if (gameState.standOpen) {
    zeichneHudUhr(gameState.tagesfortschritt);
    // Uhrzeit berechnen (8:00–18:00) und auf volle Stunden runden
    const aktuelleStunden = 8 + gameState.tagesfortschritt * 10;
    const stunde   = Math.floor(aktuelleStunden);
    const uhrzeitEl = document.getElementById('hud-uhrzeit');
    if (uhrzeitEl) uhrzeitEl.textContent = `${stunde}:00`;
    // Tageszeit-Slot-Emoji in der Tag-Anzeige (kein Monat – nur Jahreszeit)
    const slot = gameState.tagesZeitSlot;
    const slotEmoji = TAGESRHYTHMUS[slot]?.emoji ?? '';
    const jz2 = JAHRESZEITEN[gameState.jahreszeit] || JAHRESZEITEN.fruehling;
    document.getElementById('hud-day').textContent =
      `${gameState.day} – ${jz2.name} ${jz2.emoji} ${slotEmoji}`;
  }

  // Schleife fortsetzen
  gameState.animFrame = requestAnimationFrame(animationsSchleife);
}

// Animation starten
function starteAnimation() {
  if (gameState.animFrame) cancelAnimationFrame(gameState.animFrame);
  letzterZeitstempel = performance.now();
  gameState.animFrame = requestAnimationFrame(animationsSchleife);
}

// Animation stoppen
function stoppeAnimation() {
  if (gameState.animFrame) {
    cancelAnimationFrame(gameState.animFrame);
    gameState.animFrame = null;
  }
}

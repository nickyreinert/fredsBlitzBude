'use strict';

/* ================================================================
   HUD – Head-Up-Display aktualisieren
   ================================================================ */

function aktualisiereHUD() {
  document.getElementById('hud-money').textContent = keineKommazahlen
    ? `${Math.round(gameState.money)} €`
    : formatEuro(gameState.money);
  // Tag + Monat + Jahreszeit-Emoji
  const jz = JAHRESZEITEN[gameState.jahreszeit] || JAHRESZEITEN.fruehling;
  document.getElementById('hud-day').textContent =
    `${gameState.day} – ${MONATSNAMEN[gameState.monat]} ${jz.emoji}`;
  // Kunden-Zähler: nur heute bediente Kunden anzeigen
  document.getElementById('hud-customers').textContent =
    `${gameState.customersServed}`;

  // Sterne-Anzeige
  const avg = durchschnittsBewertung();
  const sterneEl = document.getElementById('hud-stars');
  const gesamtEl = document.getElementById('hud-total-customers');
  if (avg === null) {
    sterneEl.textContent = '–';
  } else {
    // Halbe Sterne: ★ = voll, ½ = halb, ☆ = leer
    const voll  = Math.floor(avg);
    const halb  = avg - voll >= 0.5 ? 1 : 0;
    const leer  = 5 - voll - halb;
    sterneEl.textContent = '★'.repeat(voll) + (halb ? '½' : '') + '☆'.repeat(leer)
      + ` ${avg.toFixed(1)}`;
  }
  gesamtEl.textContent = gameState.gesamtKunden > 0
    ? `${gameState.gesamtKunden} Bewertungen`
    : '';
}

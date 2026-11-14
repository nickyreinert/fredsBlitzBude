'use strict';

/* ================================================================
   HUD – Head-Up-Display aktualisieren
   ================================================================ */

function aktualisiereHUD() {
  document.getElementById('hud-money').textContent = keineKommazahlen
    ? `${Math.round(gameState.money)} €`
    : formatEuro(gameState.money);
  // Tag-Nummer und Jahreszeit-Emoji getrennt anzeigen
  const jz = JAHRESZEITEN[gameState.jahreszeit] || JAHRESZEITEN.fruehling;
  const dayNumEl = document.getElementById('hud-day-num');
  if (dayNumEl) dayNumEl.textContent = gameState.day;
  const seasonBadge = document.getElementById('hud-season-badge');
  if (seasonBadge) seasonBadge.textContent = jz.emoji + (istRegen() ? ' 🌧️' : '');
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
    // Symbole und Zahl getrennt – auf kleinen Bildschirmen wird nur die Zahl gezeigt
    sterneEl.innerHTML =
      `<span class="hud-sterne-symbole">${'★'.repeat(voll) + (halb ? '½' : '') + '☆'.repeat(leer)}</span>`
      + ` <span class="hud-sterne-zahl">${avg.toFixed(1).replace('.', ',')}</span>`;
  }
  gesamtEl.textContent = gameState.bewertungAnzahl > 0
    ? `${gameState.bewertungAnzahl} Bew.`
    : '';
}

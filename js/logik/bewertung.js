'use strict';

/* ================================================================
   BEWERTUNG – Kundenbewertungen und Bewertungsfaktor
   ================================================================ */

// Aktuelle Durchschnittsbewertung (1–5), oder null wenn keine
function durchschnittsBewertung() {
  if (gameState.bewertungAnzahl === 0) return null;
  return gameState.bewertungSumme / gameState.bewertungAnzahl;
}

// Kunden-Multiplikator aus Bewertung berechnen
function bewertungsFaktor() {
  const avg = durchschnittsBewertung();
  if (avg === null) return 1.0;
  const staerke = parseFloat(localStorage.getItem('bewertungsStaerke') ?? String(DEFAULT_BEWERTUNGS_STAERKE));
  return 1.0 + ((avg - 3) / 2) * staerke;
}

// Bewertungs-Wahrscheinlichkeit aus Einstellungen (0 = niemand, 1 = jeder)
function bewertungsChance() {
  return parseFloat(localStorage.getItem('bewertungsChance') ?? String(DEFAULT_BEWERTUNGS_CHANCE));
}

// Bewertung nach Transaktion vergeben (nur mit konfigurierter Wahrscheinlichkeit)
function vergebeKundenBewertung(diffCent) {
  gameState.gesamtKunden += 1;

  // Wahrscheinlichkeitsprüfung: gibt dieser Kunde eine Bewertung ab?
  if (Math.random() > bewertungsChance()) {
    aktualisiereHUD();
    speichereSpielstand();
    return null; // keine Bewertung
  }

  let sterne;
  if (diffCent === 0) {
    sterne = 4;
  } else if (diffCent > 0) {
    sterne = 5;
  } else {
    const zuWenig = -diffCent;
    if (zuWenig <= 10)       sterne = 3;
    else if (zuWenig <= 50)  sterne = 2;
    else                     sterne = 1;
  }
  gameState.bewertungSumme  += sterne;
  gameState.bewertungAnzahl += 1;
  aktualisiereHUD();
  speichereSpielstand();
  return sterne;
}

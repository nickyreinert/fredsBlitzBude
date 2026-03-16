'use strict';

/* ================================================================
   TRINKGELD – Trinkgeld-Berechnung
   ================================================================ */

// Trinkgeld aktiv?
function trinkgeldAktiv() {
  return localStorage.getItem('trinkgeldAktiv') === '1';
}

// Basis-Wahrscheinlichkeit
function trinkgeldBasisChance() {
  return parseFloat(localStorage.getItem('trinkgeldBasisChance') ?? String(DEFAULT_TRINKGELD_BASIS_CHANCE));
}

// Maximaler Trinkgeld-Betrag in Cent
function trinkgeldMaxCent() {
  return parseInt(localStorage.getItem('trinkgeldMaxCent') ?? String(DEFAULT_TRINKGELD_MAX_CENT), 10);
}

// Zubehör-Bonus (logarithmisch gedämpft) für Trinkgeld-Chance
function zubehoerTrinkgeldBonus() {
  const anzahl = Object.values(gameState.zubehoer).reduce((s, n) => s + n, 0);
  if (anzahl === 0) return 1.0;
  return 1 + ZUBEHOER_BONUS_STAERKE_TRINKGELD * Math.log2(anzahl + 1);
}

// Trinkgeld für einen Kunden berechnen
function berechneKundenTrinkgeld(typKey) {
  if (!trinkgeldAktiv()) return 0;

  const grosszuegigkeit = TRINKGELD_GROSSZUEGIGKEIT[typKey] ?? 0.5;

  // Bewertungs-Bonus
  const avg = durchschnittsBewertung() ?? 3;
  const bBonus = 0.2 + ((avg - 1) / 4) * 1.8;

  // Zubehör-Bonus: Hund macht Kunden freigebiger
  const zBonus = zubehoerTrinkgeldBonus();

  const chance = trinkgeldBasisChance() * grosszuegigkeit * bBonus * zBonus;
  if (Math.random() > chance) return 0;

  const maxCent = trinkgeldMaxCent() * grosszuegigkeit * bBonus * zBonus;
  let betragCent = zufall(10, Math.max(10, Math.round(maxCent)));
  betragCent = Math.round(betragCent / 5) * 5;

  if (keineKommazahlen) betragCent = Math.round(betragCent / 100) * 100;

  return betragCent / 100;
}

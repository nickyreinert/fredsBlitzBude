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

// Trinkgeld für einen Kunden berechnen
function berechneKundenTrinkgeld(typKey) {
  if (!trinkgeldAktiv()) return 0;

  const grosszuegigkeit = TRINKGELD_GROSSZUEGIGKEIT[typKey] ?? 0.5;

  // Bewertungs-Bonus
  const avg = durchschnittsBewertung() ?? 3;
  const bBonus = 0.2 + ((avg - 1) / 4) * 1.8;

  const chance = trinkgeldBasisChance() * grosszuegigkeit * bBonus;
  if (Math.random() > chance) return 0;

  const maxCent = trinkgeldMaxCent() * grosszuegigkeit * bBonus;
  let betragCent = zufall(10, Math.max(10, Math.round(maxCent)));
  betragCent = Math.round(betragCent / 5) * 5;

  if (keineKommazahlen) betragCent = Math.round(betragCent / 100) * 100;

  return betragCent / 100;
}

'use strict';

/* ================================================================
   TRINKGELD – Trinkgeld-Berechnung
   Wie im echten Leben: Der Kunde rundet auf einen glatten Betrag auf
   ("Mach 3 €, der Rest ist für dich!") oder sagt "Stimmt so!".
   Es wird nie ein krummer Extra-Betrag auf den Schein gelegt.
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

// Würfelt aus, ob dieser Kunde überhaupt Trinkgeld geben möchte
function kundeMoechteTrinkgeldGeben(typKey) {
  if (!trinkgeldAktiv()) return false;

  const grosszuegigkeit = TRINKGELD_GROSSZUEGIGKEIT[typKey] ?? 0.25;
  if (grosszuegigkeit <= 0) return false;

  // Bewertungs-Bonus: 1★ → 0.5, 3★ → 0.9, 5★ → 1.3
  const avg = durchschnittsBewertung() ?? 3;
  const bBonus = 0.5 + ((avg - 1) / 4) * 0.8;

  // Zubehör-Bonus: Hund macht Kunden freigebiger
  const zBonus = zubehoerTrinkgeldBonus();

  const chance = trinkgeldBasisChance() * grosszuegigkeit * bBonus * zBonus;
  return Math.random() < chance;
}

// Trinkgeld in Cent berechnen – passend zu Preis und gegebenem Geld.
// Ergebnis: Preis + Trinkgeld ist immer ein glatter Betrag (z.B. 3,00 € oder 2,50 €)
// und nie mehr als der Kunde hingelegt hat.
function berechneTrinkgeldCent(typKey, preisCent, zahltCent) {
  if (preisCent <= 0 || zahltCent <= preisCent) return 0;

  // Großzügige Kunden runden auch mal kräftiger auf
  const grosszuegig = typKey === 'reich' || typKey === 'star';

  // Obergrenze: Einstellung, und höchstens ein Viertel vom Preis (mind. 50 Cent)
  const anteil  = grosszuegig ? 0.5 : 0.25;
  const maxCent = Math.min(trinkgeldMaxCent(), Math.max(50, Math.round(preisCent * anteil)));

  // Mögliche glatte Zielbeträge (Rundungsschritte)
  const schritte = keineKommazahlen ? [100, 500, 1000] : [50, 100, 500, 1000];
  const kandidaten = [];
  for (const schritt of schritte) {
    let ziel = Math.ceil(preisCent / schritt) * schritt;
    if (ziel === preisCent) ziel += schritt;    // schon glatt → nächster Schritt
    const tip = ziel - preisCent;
    if (tip > 0 && tip <= maxCent && ziel <= zahltCent && !kandidaten.includes(ziel)) {
      kandidaten.push(ziel);
    }
  }
  if (kandidaten.length === 0) return 0;

  // "Stimmt so!" – wenn der hingelegte Betrag selbst ein passendes Ziel ist
  if (kandidaten.includes(zahltCent) && Math.random() < 0.5) {
    return zahltCent - preisCent;
  }

  // Sonst meistens den kleinsten Aufrund-Betrag, Großzügige auch mal den größeren
  const ziel = grosszuegig && kandidaten.length > 1 && Math.random() < 0.5
    ? kandidaten[1]
    : kandidaten[0];
  return ziel - preisCent;
}

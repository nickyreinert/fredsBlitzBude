'use strict';

/* ================================================================
   ZEIT – Jahreszeiten, Oma-Lieferung
   ================================================================ */

// Jahreszeit-Dauer aus den Einstellungen lesen
function jahreszeitTageProSaison() {
  return parseInt(localStorage.getItem('jahreszeitTage') ?? String(DEFAULT_JAHRESZEIT_TAGE), 10);
}

// Jahreszeit direkt aus Spieltag berechnen (unabhängig von Monaten)
function jahresZeitFuerTag(tag) {
  const dauer = jahreszeitTageProSaison();
  const index = Math.floor((tag - 1) / dauer) % JAHRESZEITEN_REIHENFOLGE.length;
  return JAHRESZEITEN_REIHENFOLGE[index];
}

// Jahreszeit aktualisieren (wird jeden Tag aufgerufen)
function aktualisiereZeit() {
  const neueJahreszeit = jahresZeitFuerTag(gameState.day);
  const jahresZeitGewechselt = neueJahreszeit !== gameState.jahreszeit;
  gameState.jahreszeit = neueJahreszeit;
  return jahresZeitGewechselt;
}

// Saisonale Oma-Lieferung
function omaLieferung() {
  if (gameState.grossmarktGenutzt && Math.random() < 0.6) return [];

  const verfuegbar = Object.entries(PRODUKTE)
    .filter(([, p]) => p.saisons.includes(gameState.jahreszeit));

  const anzahlProdukte = gameState.grossmarktGenutzt ? 1 : zufall(1, 2);
  const nachricht = [];
  // Kopie der verfügbaren Produkte damit kein Produkt doppelt geliefert werden kann
  const verfuegbarKopie = [...verfuegbar];

  for (let i = 0; i < anzahlProdukte; i++) {
    if (verfuegbarKopie.length === 0) break;
    const idx = zufall(0, verfuegbarKopie.length - 1);
    const [key, prod] = verfuegbarKopie[idx];
    // Gewähltes Produkt entfernen damit es nicht doppelt ausgewählt werden kann
    verfuegbarKopie.splice(idx, 1);
    const menge = zufall(1, 3);
    lagerEin(key, menge);
    if (!gameState.prices[key]) gameState.prices[key] = 0;
    nachricht.push(`${prod.emoji} ${menge}× ${prod.name}`);
  }

  return nachricht;
}

/* ── Wetter ─────────────────────────────────────────────────────── */

// Wetter für einen neuen Tag auswürfeln (abhängig von der Jahreszeit)
function wuerfleWetter() {
  const chance = REGEN_CHANCE[gameState.jahreszeit] ?? 0.25;
  gameState.wetter = Math.random() < chance ? 'regen' : 'sonne';
}

// Regnet es heute?
function istRegen() {
  return gameState.wetter === 'regen';
}

// Multiplikator für Kunden/Passanten (Regen = weniger Leute)
function wetterKundenFaktor() {
  return istRegen() ? REGEN_KUNDEN_FAKTOR : 1.0;
}

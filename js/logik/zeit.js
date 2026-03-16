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

  for (let i = 0; i < anzahlProdukte; i++) {
    if (verfuegbar.length === 0) break;
    const [key, prod] = zufallsElement(verfuegbar);
    const menge = zufall(1, 3);
    lagerEin(key, menge);
    if (!gameState.prices[key]) gameState.prices[key] = 0;
    nachricht.push(`${prod.emoji} ${menge}× ${prod.name}`);
  }

  return nachricht;
}

'use strict';

/* ================================================================
   ZEIT – Jahreszeiten, Monate, Oma-Lieferung
   ================================================================ */

// Monat → Jahreszeit
function jahresZeitFuerMonat(monat) {
  for (const [key, jz] of Object.entries(JAHRESZEITEN)) {
    if (jz.monate.includes(monat)) return key;
  }
  return 'fruehling';
}

// Monat und Jahreszeit aktualisieren (alle 10 Spieltage = 1 Monat)
function aktualisiereZeit() {
  const neuerMonatIndex = (START_MONAT_INDEX + Math.floor((gameState.day - 1) / 10)) % 12;
  gameState.monat = neuerMonatIndex + 1;

  const neueJahreszeit = jahresZeitFuerMonat(gameState.monat);
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

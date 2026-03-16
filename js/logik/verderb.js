'use strict';

/* ================================================================
   VERDERB – Haltbarkeit, Lagerverwaltung, Frische
   ================================================================ */

// Inventar-Alter um 1 Tag erhöhen, verdorbene Einheiten entfernen
function verderbeInventar() {
  const tage = haltbarkeitTage();
  const verluste = {};

  if (tage === 0) return verluste;

  for (const key of Object.keys(gameState.inventory)) {
    if (!gameState.inventarAlter[key]) gameState.inventarAlter[key] = [];

    gameState.inventarAlter[key] = gameState.inventarAlter[key].map(a => a + 1);

    const vorher = gameState.inventarAlter[key].length;
    gameState.inventarAlter[key] = gameState.inventarAlter[key].filter(a => a < tage);
    const verdorben = vorher - gameState.inventarAlter[key].length;

    if (verdorben > 0) {
      verluste[key] = verdorben;
      gameState.inventory[key] = Math.max(0, (gameState.inventory[key] || 0) - verdorben);
    }
  }

  return verluste;
}

// Neue Ware einlagern (Alter = 0)
function lagerEin(key, anzahl) {
  if (!gameState.inventarAlter[key]) gameState.inventarAlter[key] = [];
  for (let i = 0; i < anzahl; i++) {
    gameState.inventarAlter[key].push(0);
  }
  gameState.inventory[key] = (gameState.inventory[key] || 0) + anzahl;
}

// Ware beim Verkauf aus Lager nehmen (älteste zuerst)
function lagerAus(key, anzahl = 1) {
  if (!gameState.inventarAlter[key]) gameState.inventarAlter[key] = [];
  gameState.inventarAlter[key].sort((a, b) => b - a);
  for (let i = 0; i < anzahl; i++) {
    gameState.inventarAlter[key].pop();
  }
  gameState.inventory[key] = Math.max(0, (gameState.inventory[key] || 0) - anzahl);
}

// Frischezustand pro Einheit: 'gruen', 'orange', 'rot'
function einheitFarbe(alter, tage) {
  if (tage === 0) return 'gruen';
  const anteil = alter / tage;
  if (anteil < 0.5)  return 'gruen';
  if (anteil < 0.8)  return 'orange';
  return 'rot';
}

// Zählt Einheiten pro Ampelkategorie
function frischeProduktAufteilung(key) {
  const tage = haltbarkeitTage();
  const alter = gameState.inventarAlter[key] || [];
  const erg = { gruen: 0, orange: 0, rot: 0 };
  for (const a of alter) {
    erg[einheitFarbe(a, tage)]++;
  }
  return erg;
}

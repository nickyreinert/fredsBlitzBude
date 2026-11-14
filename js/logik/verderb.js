'use strict';

/* ================================================================
   VERDERB – Haltbarkeit, Lagerverwaltung, Frische
   ================================================================ */

// Inventar-Alter um 1 Tag erhöhen, verdorbene Einheiten entfernen
function verderbeInventar() {
  const tage = effektiveHaltbarkeit();
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

// Ware beim Verkauf aus Lager nehmen.
// Mit stufe ('gruen'/'orange'/'rot') werden Einheiten genau dieser Frische genommen,
// sonst (oder wenn davon nicht genug da sind) die ältesten zuerst.
function lagerAus(key, anzahl = 1, stufe = null) {
  if (!gameState.inventarAlter[key]) gameState.inventarAlter[key] = [];
  const alter = gameState.inventarAlter[key];
  const tage  = effektiveHaltbarkeit();
  alter.sort((a, b) => b - a);   // älteste zuerst
  for (let i = 0; i < anzahl; i++) {
    let idx = stufe ? alter.findIndex(a => einheitFarbe(a, tage) === stufe) : -1;
    if (idx === -1) idx = 0;      // Rückfall: älteste Einheit
    if (alter.length > 0) alter.splice(idx, 1);
  }
  gameState.inventory[key] = Math.max(0, (gameState.inventory[key] || 0) - anzahl);
}

// Haltbarkeit inkl. Kühlbox-Bonus (0 = Verderb ausgeschaltet)
function effektiveHaltbarkeit() {
  const tage = haltbarkeitTage();
  if (tage === 0) return 0;
  return tage + (gameState.zubehoer.kuehlbox ? KUEHLBOX_EXTRA_TAGE : 0);
}

// Bestand eines Produkts je Frische-Stufe (passt immer zur Vorratsmenge)
function bestandNachStufe(key) {
  const erg = frischeProduktAufteilung(key);
  const gezaehlt = erg.gruen + erg.orange + erg.rot;
  const menge = gameState.inventory[key] || 0;
  // Falls das Alter-Array nicht ganz passt (alte Spielstände): Rest als frisch zählen
  if (menge > gezaehlt) erg.gruen += menge - gezaehlt;
  return erg;
}

// Verkaufspreis je Frische-Stufe – ohne eigenen Preis gilt der normale (frische) Preis
function preisFuer(key, stufe) {
  const normal = gameState.prices[key] || 0;
  if (!stufe || stufe === 'gruen') return normal;
  const eigener = gameState.preiseFrische?.[key]?.[stufe];
  return eigener > 0 ? eigener : normal;
}

// Eigenen Preis für eine Frische-Stufe setzen
function setzeFrischePreis(key, stufe, preis) {
  if (stufe === 'gruen') { gameState.prices[key] = preis; return; }
  if (!gameState.preiseFrische) gameState.preiseFrische = {};
  if (!gameState.preiseFrische[key]) gameState.preiseFrische[key] = {};
  gameState.preiseFrische[key][stufe] = preis;
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
  const tage = effektiveHaltbarkeit();
  const alter = gameState.inventarAlter[key] || [];
  const erg = { gruen: 0, orange: 0, rot: 0 };
  for (const a of alter) {
    erg[einheitFarbe(a, tage)]++;
  }
  return erg;
}

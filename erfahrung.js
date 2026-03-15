'use strict';

/* ================================================================
   ERFAHRUNGSSYSTEM – Konfiguration und Berechnungsfunktionen
   Diese Datei kann unabhängig von game.js angepasst werden.
   ================================================================ */

// Levelstufen: xpBis = kumulative XP die man INSGESAMT braucht um
// dieses Level zu verlassen (nicht-linear: Schwellen steigen exponentiell)
const XP_STUFEN = [
  { level: 1,  xpBis: 100    },
  { level: 2,  xpBis: 280    },
  { level: 3,  xpBis: 600    },
  { level: 4,  xpBis: 1200   },
  { level: 5,  xpBis: 2500   },
  { level: 6,  xpBis: 5000   },
  { level: 7,  xpBis: 9000   },
  { level: 8,  xpBis: 15000  },
  { level: 9,  xpBis: 25000  },
  { level: 10, xpBis: Infinity }, // Max-Level
];

// XP-Quellen – Koeffizienten hier anpassen
const XP_QUELLEN = {
  umsatz: {
    xpProEuro: 2,   // 2 XP pro verdientem Euro
  },
  kunde: {
    xpProKunde: 10, // 10 XP pro bedientem Kunden
  },
  bewertung: {
    // XP je nach Sternezahl (Index = Sterne: 0–5)
    // 5★ = 20 XP, 4★ = 12 XP, 3★ = 5 XP, 2★ = 1 XP, 1★ = 0 XP
    xpTabelle: [0, 0, 1, 5, 12, 20],
  },
};

// Level-Symbole (erscheinen im HUD-Badge)
const LEVEL_SYMBOLE = [
  '',      // Level 0 (nicht genutzt)
  '🌱',   // Level 1
  '🌿',   // Level 2 – ab hier sichtbar im HUD
  '⭐',   // Level 3
  '🌟',   // Level 4
  '💫',   // Level 5
  '🏆',   // Level 6
  '👑',   // Level 7
  '🚀',   // Level 8
  '💎',   // Level 9
  '🔥',   // Level 10 (Max)
];

/* ----------------------------------------------------------------
   Berechnungsfunktionen
   ---------------------------------------------------------------- */

// Aktuelles Level für gegebene kumulative XP bestimmen
function levelFuerXP(gesamtXP) {
  let level = 1;
  for (const stufe of XP_STUFEN) {
    if (gesamtXP < stufe.xpBis) break;
    level = stufe.level + 1;
    if (stufe.xpBis === Infinity) {
      level = stufe.level;
      break;
    }
  }
  return Math.min(level, XP_STUFEN[XP_STUFEN.length - 1].level);
}

// XP-Fortschritt innerhalb des aktuellen Levels
// Gibt { xpAktuell, xpZiel, prozent } zurück
function xpFortschritt(gesamtXP) {
  const level    = levelFuerXP(gesamtXP);
  const maxLevel = XP_STUFEN[XP_STUFEN.length - 1].level;

  // Bei Max-Level: 100%
  if (level >= maxLevel) {
    return { xpAktuell: 0, xpZiel: 0, prozent: 100 };
  }

  // XP-Start des aktuellen Levels (= xpBis des vorherigen)
  const stufeIdx   = level - 1; // Index in XP_STUFEN
  const xpStart    = stufeIdx > 0 ? XP_STUFEN[stufeIdx - 1].xpBis : 0;
  const xpZiel     = XP_STUFEN[stufeIdx].xpBis;
  const xpAktuell  = gesamtXP - xpStart;
  const xpBenoetigt = xpZiel - xpStart;
  const prozent    = Math.min(100, Math.round((xpAktuell / xpBenoetigt) * 100));

  return { xpAktuell, xpZiel: xpBenoetigt, prozent };
}

// XP für eine abgeschlossene Transaktion berechnen
function xpFuerTransaktion(einnahmeEuro, sterne) {
  const xpUmsatz    = Math.floor(einnahmeEuro * XP_QUELLEN.umsatz.xpProEuro);
  const xpKunde     = XP_QUELLEN.kunde.xpProKunde;
  const xpBewertung = XP_QUELLEN.bewertung.xpTabelle[Math.max(0, Math.min(5, sterne))] ?? 0;
  return xpUmsatz + xpKunde + xpBewertung;
}

// XP addieren, Level neu berechnen, Level-Up prüfen, HUD aktualisieren
function addiereXP(xp) {
  if (xp <= 0) return;
  const altesLevel     = gameState.level;
  gameState.gesamtXP  += xp;
  gameState.level      = levelFuerXP(gameState.gesamtXP);
  aktualisiereXpHud();
  if (gameState.level > altesLevel) {
    zeigeLevelUpToast(gameState.level);
  }
}

// HUD-Badge, Zahl und XP-Balken aktualisieren
function aktualisiereXpHud() {
  const item    = document.getElementById('hud-level-item');
  const badge   = document.getElementById('hud-level-badge');
  const fill    = document.getElementById('hud-xp-fill');
  const symbol  = document.getElementById('hud-level-symbol');
  if (!item || !badge || !fill) return;

  // Erst ab Level 2 sichtbar
  if (gameState.level >= 2) {
    item.classList.remove('hidden');
  } else {
    item.classList.add('hidden');
    return;
  }

  // Symbol und Zahl setzen
  const sym = LEVEL_SYMBOLE[gameState.level] ?? '⭐';
  if (symbol) symbol.textContent = sym;
  badge.textContent = gameState.level;

  // XP-Balken
  const { prozent } = xpFortschritt(gameState.gesamtXP);
  fill.style.width  = prozent + '%';
}

// Level-Up Toast anzeigen (kurze Animation)
function zeigeLevelUpToast(neuesLevel) {
  const sym  = LEVEL_SYMBOLE[neuesLevel] ?? '⭐';
  const toast = document.createElement('div');
  toast.className  = 'level-up-toast';
  toast.textContent = `${sym} Level ${neuesLevel}! Glückwunsch!`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

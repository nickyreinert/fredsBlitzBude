'use strict';

/* ================================================================
   ERFAHRUNGSSYSTEM – Berechnungsfunktionen
   Konstanten (XP_STUFEN, XP_QUELLEN, LEVEL_SYMBOLE) kommen aus config.js
   ================================================================ */

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
  const stufeIdx   = level - 1;
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

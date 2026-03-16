'use strict';

/* ================================================================
   SPEICHERN – Spielstand speichern und laden
   ================================================================ */

function speichereSpielstand() {
  const stand = {
    money:              gameState.money,
    inventory:          gameState.inventory,
    inventarAlter:      gameState.inventarAlter,
    day:                gameState.day,
    monat:              gameState.monat,
    jahreszeit:         gameState.jahreszeit,
    phase:              gameState.phase,
    prices:             gameState.prices,
    tagesfortschritt:   gameState.tagesfortschritt,
    tagesZeitSlot:      gameState.tagesZeitSlot,
    standOpen:          gameState.standOpen,
    customersServed:    gameState.customersServed,
    dailyEarnings:      gameState.dailyEarnings,
    customers:          gameState.customers,
    bewertungSumme:     gameState.bewertungSumme,
    bewertungAnzahl:    gameState.bewertungAnzahl,
    gesamtKunden:       gameState.gesamtKunden,
    grossmarktGenutzt:  gameState.grossmarktGenutzt,
    gesamtXP:           gameState.gesamtXP,
    level:              gameState.level,
    zubehoer:           gameState.zubehoer,
  };
  localStorage.setItem('spielstand', JSON.stringify(stand));
}

// Spielstand laden – gibt true zurück wenn Daten vorhanden
function ladeSpielstand() {
  const raw = localStorage.getItem('spielstand');
  if (!raw) return false;
  try {
    const stand = JSON.parse(raw);
    gameState.money            = stand.money            ?? 0;
    gameState.inventory        = stand.inventory        ?? { gurke: 1 };
    gameState.inventarAlter    = stand.inventarAlter    ?? { gurke: [0] };
    gameState.day              = stand.day              ?? 1;
    gameState.monat            = stand.monat            ?? 3;
    gameState.jahreszeit       = stand.jahreszeit       ?? 'fruehling';
    gameState.phase            = stand.phase            ?? 1;
    gameState.prices           = stand.prices           ?? { gurke: 0 };
    gameState.tagesfortschritt = stand.tagesfortschritt ?? 0;
    gameState.tagesZeitSlot    = stand.tagesZeitSlot    ?? 'morgen';
    gameState.standOpen        = stand.standOpen        ?? false;
    gameState.customersServed  = stand.customersServed  ?? 0;
    gameState.dailyEarnings    = stand.dailyEarnings    ?? 0;
    gameState.customers        = stand.customers        ?? [];
    gameState.bewertungSumme   = stand.bewertungSumme   ?? 0;
    gameState.bewertungAnzahl  = stand.bewertungAnzahl  ?? 0;
    gameState.gesamtKunden     = stand.gesamtKunden     ?? 0;
    gameState.grossmarktGenutzt = stand.grossmarktGenutzt ?? false;
    gameState.gesamtXP         = stand.gesamtXP         ?? 0;
    gameState.level            = stand.level            ?? 1;
    gameState.zubehoer         = stand.zubehoer         ?? {};
    return true;
  } catch {
    return false;
  }
}

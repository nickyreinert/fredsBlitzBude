'use strict';

/* ================================================================
   MELDUNG – Kurze Bestätigungs-Meldung (Toast)
   ================================================================ */

// Kurze Bestätigungs-Meldung im Einstellungs-Screen anzeigen
function zeigeMeldung(text) {
  const box = document.querySelector('.settings-box');
  const el  = document.createElement('div');
  el.className = 'settings-toast';
  el.textContent = text;
  box.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

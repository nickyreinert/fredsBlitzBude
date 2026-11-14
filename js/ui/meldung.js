'use strict';

/* ================================================================
   MELDUNG – Kurze Bestätigungs-Meldung (Toast)
   ================================================================ */

// Kurze Meldung anzeigen:
// – im Einstellungs-Screen innerhalb der Einstellungs-Box
// – sonst als schwebende Meldung oben in der Bildschirmmitte
function zeigeMeldung(text) {
  const el = document.createElement('div');
  el.textContent = text;

  if (aktuellerScreen() === 'screen-settings') {
    el.className = 'settings-toast';
    document.querySelector('.settings-box').appendChild(el);
  } else {
    el.className = 'spiel-toast';
    document.body.appendChild(el);
  }
  setTimeout(() => el.remove(), 2600);
}

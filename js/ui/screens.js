'use strict';

/* ================================================================
   SCREENS – Screen-Wechsel und Ermittlung
   ================================================================ */

// Aktuell sichtbaren Screen ermitteln
function aktuellerScreen() {
  const screens = document.querySelectorAll('.screen.active');
  return screens.length > 0 ? screens[0].id : null;
}

// Screen wechseln
function zeigeScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

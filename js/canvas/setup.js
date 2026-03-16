'use strict';

/* ================================================================
   CANVAS SETUP – Initialisierung und Größenanpassung
   ================================================================ */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Canvas-Größe an Fenstergröße anpassen
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', () => {
  resizeCanvas();
  // Nach Resize neu zeichnen
  if (gameState.standOpen || aktuellerScreen() === 'screen-stand') {
    zeichneSpielwelt();
  }
});

resizeCanvas();

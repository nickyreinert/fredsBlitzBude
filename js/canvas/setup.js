'use strict';

/* ================================================================
   CANVAS SETUP – Initialisierung, Größenanpassung, Szenen-Maße
   ================================================================ */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Canvas-Größe an Fenstergröße anpassen
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

/* Zentrale Szenen-Maße – alle Zeichen-Funktionen richten sich danach.
   Querformat: Panels (Inventar/Kunde) stehen als Karte rechts → Szene rückt nach links.
   Hochformat: Panels stehen unten → Szene nutzt nur den oberen Teil des Bildschirms.
   WICHTIG: Die Werte für "quer" und "panelBreite" müssen zur style.css passen
   (Media-Query "min-width: 700px and min-aspect-ratio: 115/100", Breite clamp(360px, 38vw, 440px)). */
function szenenMasse(w, h) {
  const quer = w >= 700 && w > h * 1.15;
  const panelBreite = quer ? Math.min(440, Math.max(360, w * 0.38)) + 24 : 0;   // inkl. Abstand
  const szeneH = quer ? h : Math.round(h * 0.52);                 // Höhe der sichtbaren Szene
  const szeneB = w - panelBreite;
  const mitteX = szeneB / 2;

  // Stand: so groß wie möglich, aber passend in die Szene
  const standB = Math.min(szeneB * 0.68, szeneH * 0.8, 640);
  const standH = Math.min(szeneH * 0.3, standB * 0.55);

  return {
    quer,
    mitteX,
    szeneH,
    standB,
    standH,
    standY:   szeneH * 0.48,
    bodenY:   szeneH * 0.65,
    strasseY: szeneH * 0.78,
    laufY:    szeneH * 0.84,                      // Kopfhöhe der Passanten
    figurR:   Math.min(w * 0.032, szeneH * 0.03, 30), // Kopf-Radius der Figuren
  };
}

window.addEventListener('resize', () => {
  resizeCanvas();
  // Nach Resize neu zeichnen
  if (gameState.standOpen || aktuellerScreen() === 'screen-stand') {
    zeichneSpielwelt();
  }
});

resizeCanvas();

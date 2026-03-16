'use strict';

/* ================================================================
   INTRO – Intro-Ablauf (Willkommens-Dialog)
   ================================================================ */

let introSchritt = 0;

function starteIntro() {
  introSchritt = 0;
  zeigeIntroSchritt();
  zeigeScreen('screen-intro');
}

function zeigeIntroSchritt() {
  const textEl = document.getElementById('intro-text');
  const text = INTRO_SCHRITTE[introSchritt];
  // Zeilenumbrüche in HTML umwandeln
  textEl.innerHTML = text.replace(/\n/g, '<br>');
}

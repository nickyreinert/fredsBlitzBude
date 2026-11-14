'use strict';

/* ================================================================
   STIMME – Kunden sprechen ihre Sätze laut (Sprachausgabe des Browsers)
   Kinder sprechen hoch, Erwachsene mittel, alte Menschen tief.
   Die Werte pro Kundentyp stehen in config.js unter STIMMEN.
   ================================================================ */

// Ist die Sprachausgabe eingeschaltet? (Standard: aus – muss in den Einstellungen aktiviert werden)
function stimmenAktiv() {
  return localStorage.getItem('stimmenAktiv') === '1';
}

// Sprachausgabe im Browser vorhanden?
function stimmeVerfuegbar() {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

// Deutsche Stimme suchen (Liste wird vom Browser teils verzögert geladen)
let deutscheStimme = null;
function sucheDeutscheStimme() {
  if (!stimmeVerfuegbar()) return;
  const stimmen = window.speechSynthesis.getVoices();
  deutscheStimme = stimmen.find(s => s.lang === 'de-DE')
    || stimmen.find(s => s.lang && s.lang.startsWith('de'))
    || null;
}

// Satz laut vorlesen – typKey bestimmt Tonhöhe und Tempo
function sprich(text, typKey, unfreundlich) {
  if (!stimmenAktiv() || !stimmeVerfuegbar() || !text) return;

  // Emojis und Anführungszeichen entfernen, sonst liest der Browser sie vor
  const sauber = text
    .replace(/\p{Extended_Pictographic}|️|‍/gu, '')
    .replace(/[„“"]/g, '')
    .trim();
  if (!sauber) return;

  const einstellung = STIMMEN[typKey] || STIMMEN.erwachsen;
  const satz = new SpeechSynthesisUtterance(sauber);
  satz.lang  = 'de-DE';
  if (deutscheStimme) satz.voice = deutscheStimme;
  satz.pitch = einstellung.pitch;
  // Unhöfliche Kunden reden schneller und ungeduldiger
  satz.rate  = einstellung.rate * (unfreundlich ? 1.15 : 1);

  // Vorherigen Satz abbrechen, damit nichts durcheinander geredet wird
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(satz);
}

// Laufende Sprachausgabe stoppen
function stoppeStimme() {
  if (stimmeVerfuegbar()) window.speechSynthesis.cancel();
}

(function initStimme() {
  if (!stimmeVerfuegbar()) return;
  sucheDeutscheStimme();
  window.speechSynthesis.addEventListener?.('voiceschanged', sucheDeutscheStimme);

  // iPhone/iPad erlauben Sprachausgabe erst nach einer Berührung:
  // beim ersten Antippen einmal "leer" sprechen, danach geht es automatisch
  const freischalten = () => {
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
    document.removeEventListener('pointerdown', freischalten);
  };
  document.addEventListener('pointerdown', freischalten);
})();

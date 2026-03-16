'use strict';

/* ================================================================
   HILFSFUNKTIONEN – Allgemeine Utilities
   ================================================================ */

// Geldbetrag formatieren (Cent → "X,XX €")
function formatGeld(cent) {
  const euro = cent / 100;
  return euro.toFixed(2).replace('.', ',') + ' €';
}

// Euro-Zahl formatieren (Float → "X,XX €")
function formatEuro(betrag) {
  return betrag.toFixed(2).replace('.', ',') + ' €';
}

// Zufallszahl (min bis max inklusiv)
function zufall(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Array-Element zufällig wählen
function zufallsElement(arr) {
  return arr[zufall(0, arr.length - 1)];
}

// Kurze Verzögerung (Promise)
function warte(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Einstellungs-Hilfsfunktionen (lesen aus localStorage) ───────

// Tagesrhythmus-Faktor für einen Zeitslot
function tagesrhythmusFaktor(slot) {
  const gespeichert = parseFloat(localStorage.getItem(`rhythmus_${slot}`));
  return isNaN(gespeichert) ? TAGESRHYTHMUS[slot].defaultFaktor : gespeichert;
}

// Globale Kundenmenge pro Tag (1–1000)
function globalKundenProTag() {
  const wert = parseInt(localStorage.getItem('globalKundenProTag') ?? String(DEFAULT_KUNDEN_PRO_TAG), 10);
  return isNaN(wert) ? DEFAULT_KUNDEN_PRO_TAG : Math.max(1, Math.min(1000, wert));
}

// Basis-Intervall in ms pro Passant
function basisPassantenIntervall() {
  const kundenProTag = globalKundenProTag();
  return TAG_DAUER_FUER_INTERVALL_MS / kundenProTag;
}

// Häufigkeitsfaktor eines Kundentyps
function kundentypFaktor(typ) {
  const gespeichert = parseFloat(localStorage.getItem(`kundentyp_${typ}`));
  return isNaN(gespeichert) ? KUNDENTYPEN[typ].haeufigkeitBasis : gespeichert;
}

// Zufälligen Kundentyp-Key auswählen (gewichtet)
function zufaelligerKundentyp() {
  const eintraege = Object.entries(KUNDENTYPEN);
  const gewichte = eintraege.map(([typ]) => Math.max(0, kundentypFaktor(typ)));
  const gesamt = gewichte.reduce((a, b) => a + b, 0);
  if (gesamt === 0) return 'erwachsen';
  let rnd = Math.random() * gesamt;
  for (let i = 0; i < eintraege.length; i++) {
    rnd -= gewichte[i];
    if (rnd <= 0) return eintraege[i][0];
  }
  return 'erwachsen';
}

// Großmarkt-Mindestgeld
function grossmarktMinGeld() {
  const wert = parseInt(localStorage.getItem('grossmarktMinGeld') ?? String(DEFAULT_GROSSMARKT_MIN_GELD), 10);
  return isNaN(wert) ? DEFAULT_GROSSMARKT_MIN_GELD : wert;
}

// Haltbarkeit in Tagen (0 = deaktiviert)
function haltbarkeitTage() {
  const wert = parseInt(localStorage.getItem('haltbarkeitTage') ?? String(DEFAULT_HALTBARKEIT_TAGE), 10);
  return isNaN(wert) ? DEFAULT_HALTBARKEIT_TAGE : wert;
}

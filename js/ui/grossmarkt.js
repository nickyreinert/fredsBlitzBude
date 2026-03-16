'use strict';

/* ================================================================
   GROSSMARKT – Großmarkt-Screen, Sortiment, Einkauf
   ================================================================ */

// Warenkorb und Sortiment (nur während Großmarkt-Screen aktiv)
let grossmarktWarenkorb = {};
let grossmarktSortiment = {};

// Saisonales Sortiment generieren – alle verfügbaren Saisonprodukte, größere Mengen
function erstelleGrossmarktSortiment() {
  const saisonProdukte = Object.entries(PRODUKTE)
    .filter(([, p]) => p.saisons.includes(gameState.jahreszeit) && p.kaufPreis > 0);

  // Alle Saisonprodukte anbieten (zufällig gemischt für Abwechslung)
  const gemischt = saisonProdukte.sort(() => Math.random() - 0.5);

  const sortiment = {};
  gemischt.forEach(([key]) => {
    // Größere Mengen: 5–20 Stück je Produkt
    sortiment[key] = { verfuegbar: zufall(5, 20) };
  });
  return sortiment;
}

// Gesamtkosten des Warenkorbs berechnen und Kaufen-Button aktualisieren
function aktualisiereGrossmarktGesamt() {
  let gesamt = 0;
  for (const [key, anzahl] of Object.entries(grossmarktWarenkorb)) {
    gesamt += anzahl * (PRODUKTE[key]?.kaufPreis ?? 0);
  }
  // Einfach-Modus: ganze Euro, sonst Cent-genau
  const fmt = keineKommazahlen ? (n) => `${Math.round(n)} €` : formatEuro;
  document.getElementById('grossmarkt-gesamt-preis').textContent = fmt(gesamt);
  document.getElementById('grossmarkt-money').textContent = fmt(gameState.money);

  const btn = document.getElementById('btn-grossmarkt-kaufen');
  btn.disabled = gesamt <= 0 || gesamt > gameState.money;

  // Budget-Farbe: rot wenn zu teuer
  document.getElementById('grossmarkt-money').style.color =
    gesamt > gameState.money ? '#c62828' : '#fff';
}

// Großmarkt-Screen aufbauen und anzeigen (Animation pausiert)
function zeigeGrossmarkt() {
  stoppeAnimation();

  grossmarktSortiment = erstelleGrossmarktSortiment();
  grossmarktWarenkorb = {};

  // Sortiment-Kacheln aufbauen
  const container = document.getElementById('grossmarkt-sortiment');
  container.innerHTML = '';

  for (const [key, info] of Object.entries(grossmarktSortiment)) {
    const prod   = PRODUKTE[key];
    const kachel = document.createElement('div');
    kachel.className  = 'grossmarkt-kachel';
    kachel.dataset.key = key;
    const fmtGM = keineKommazahlen ? (n) => `${Math.round(n)} €` : formatEuro;
    kachel.innerHTML = `
      <div class="grossmarkt-emoji">${prod.emoji}</div>
      <div class="grossmarkt-name">${prod.name}</div>
      <div class="grossmarkt-preis">${fmtGM(prod.kaufPreis)} / Stück</div>
      <div class="grossmarkt-verfuegbar">Noch ${info.verfuegbar}x da</div>
      <div class="grossmarkt-stepper">
        <button class="btn btn-sm gm-minus" data-key="${key}">−</button>
        <span class="gm-menge" id="gm-menge-${key}">0</span>
        <button class="btn btn-sm gm-plus" data-key="${key}">+</button>
      </div>
    `;
    container.appendChild(kachel);
  }

  aktualisiereGrossmarktGesamt();

  // Nacht-Overlay verstecken, Großmarkt-Screen zeigen
  document.getElementById('overlay-night').classList.add('hidden');
  zeigeScreen('screen-grossmarkt');
}

// Einkauf abschließen
function grossmarktKaufen() {
  let gesamt = 0;
  for (const [key, anzahl] of Object.entries(grossmarktWarenkorb)) {
    if (anzahl > 0) {
      lagerEin(key, anzahl);
      if (!gameState.prices[key]) gameState.prices[key] = 0;
      gesamt += anzahl * PRODUKTE[key].kaufPreis;
    }
  }
  gameState.money -= gesamt;
  gameState.grossmarktGenutzt = true;
  speichereSpielstand();

  // Direkt neuen Tag starten
  starteAnimation();
  naechsterTag();
}

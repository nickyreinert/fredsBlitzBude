'use strict';

/* ================================================================
   ZUBEHÖR-SHOP – Shop öffnen, Artikel kaufen, UI aufbauen
   ================================================================ */

// Anzahl gekaufter Artikel mit einer bestimmten Wirkung ('kunden' oder 'trinkgeld')
function zubehoerAnzahlMitWirkung(wirkung) {
  let anzahl = 0;
  for (const [key, n] of Object.entries(gameState.zubehoer)) {
    if (ZUBEHOER_ARTIKEL[key]?.wirkung?.includes(wirkung)) anzahl += n;
  }
  return anzahl;
}

// Zubehör-Shop öffnen (pausiert die Spielzeit automatisch durch Screen-Wechsel)
function zeigeZubehoerShop() {
  // Geldbetrag im Shop-Header aktualisieren
  document.getElementById('zubehoer-money').textContent = formatEuro(gameState.money);

  // Artikel-Liste aufbauen
  const liste = document.getElementById('zubehoer-artikel-liste');
  liste.innerHTML = '';

  for (const [key, artikel] of Object.entries(ZUBEHOER_ARTIKEL)) {
    const anzahl         = gameState.zubehoer[key] ?? 0;
    const bereitsGekauft = anzahl >= artikel.maxAnzahl;
    const kannKaufen     = !bereitsGekauft && gameState.money >= artikel.preis;
    // Bei Artikeln, die man mehrfach kaufen kann (Fische), den Stand anzeigen
    const anzahlHTML = artikel.maxAnzahl > 1 && anzahl > 0
      ? `<div class="zubehoer-anzahl">${TEXTE.zubehoer.anzahlText(anzahl, artikel.maxAnzahl)}</div>`
      : '';

    const karte = document.createElement('div');
    karte.className = 'zubehoer-karte' + (bereitsGekauft ? ' zubehoer-karte--gekauft' : '');

    karte.innerHTML = `
      <div class="zubehoer-emoji">${artikel.emoji}</div>
      <div class="zubehoer-info">
        <div class="zubehoer-name">${artikel.name}</div>
        <div class="zubehoer-beschreibung">${artikel.beschreibung}</div>
        ${anzahlHTML}
      </div>
      <div class="zubehoer-rechts">
        ${bereitsGekauft
          ? `<div class="zubehoer-status">${TEXTE.zubehoer.statusGekauft}</div>`
          : `<div class="zubehoer-preis">${formatEuro(artikel.preis)}</div>
             <button class="btn btn-success btn-lg zubehoer-kaufen-btn"
               data-key="${key}"
               ${kannKaufen ? '' : 'disabled'}>
               ${kannKaufen ? TEXTE.zubehoer.btnKaufen : TEXTE.zubehoer.btnZuWenig}
             </button>`
        }
      </div>
    `;

    liste.appendChild(karte);
  }

  // Animation stoppen während des Shops (Zeit steht still)
  stoppeAnimation();
  zeigeScreen('screen-zubehoer');
}

// Zubehör kaufen
function zubehoerKaufen(key) {
  const artikel = ZUBEHOER_ARTIKEL[key];
  if (!artikel) return;

  const bereitsGekauft = (gameState.zubehoer[key] ?? 0) >= artikel.maxAnzahl;
  if (bereitsGekauft) return;

  if (gameState.money < artikel.preis) {
    zeigeMeldung(TEXTE.meldungen.zuWenigGeld);
    return;
  }

  // Kaufen: Geld abziehen, Zubehör hinzufügen
  gameState.money = Math.round((gameState.money - artikel.preis) * 100) / 100;
  gameState.zubehoer[key] = (gameState.zubehoer[key] ?? 0) + 1;
  speichereSpielstand();

  zeigeMeldung(TEXTE.meldungen.zubehoerGekauft(artikel.name, artikel.emoji));

  // Shop neu aufbauen damit Button deaktiviert wird
  zeigeZubehoerShop();
}

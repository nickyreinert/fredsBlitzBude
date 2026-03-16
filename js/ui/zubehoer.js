'use strict';

/* ================================================================
   ZUBEHÖR-SHOP – Shop öffnen, Artikel kaufen, UI aufbauen
   ================================================================ */

// Zubehör-Shop öffnen (pausiert die Spielzeit automatisch durch Screen-Wechsel)
function zeigeZubehoerShop() {
  // Geldbetrag im Shop-Header aktualisieren
  document.getElementById('zubehoer-money').textContent = formatEuro(gameState.money);

  // Artikel-Liste aufbauen
  const liste = document.getElementById('zubehoer-artikel-liste');
  liste.innerHTML = '';

  for (const [key, artikel] of Object.entries(ZUBEHOER_ARTIKEL)) {
    const bereitsGekauft = (gameState.zubehoer[key] ?? 0) >= artikel.maxAnzahl;
    const kannKaufen     = !bereitsGekauft && gameState.money >= artikel.preis;

    const karte = document.createElement('div');
    karte.className = 'zubehoer-karte' + (bereitsGekauft ? ' zubehoer-karte--gekauft' : '');

    karte.innerHTML = `
      <div class="zubehoer-emoji">${artikel.emoji}</div>
      <div class="zubehoer-info">
        <div class="zubehoer-name">${artikel.name}</div>
        <div class="zubehoer-beschreibung">${artikel.beschreibung}</div>
      </div>
      <div class="zubehoer-rechts">
        ${bereitsGekauft
          ? `<div class="zubehoer-status">✅ Gekauft!</div>`
          : `<div class="zubehoer-preis">${formatEuro(artikel.preis)}</div>
             <button class="btn btn-success btn-lg zubehoer-kaufen-btn"
               data-key="${key}"
               ${kannKaufen ? '' : 'disabled'}>
               ${kannKaufen ? '🛒 Kaufen' : '💸 Zu wenig Geld'}
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
    zeigeMeldung('💸 Nicht genug Geld!');
    return;
  }

  // Kaufen: Geld abziehen, Zubehör hinzufügen
  gameState.money -= artikel.preis;
  gameState.zubehoer[key] = (gameState.zubehoer[key] ?? 0) + 1;
  speichereSpielstand();

  zeigeMeldung(`${artikel.emoji} ${artikel.name} gekauft! Viel Spaß damit!`);

  // Shop neu aufbauen damit Button deaktiviert wird
  zeigeZubehoerShop();
}

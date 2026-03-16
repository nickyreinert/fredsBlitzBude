'use strict';

/* ================================================================
   INVENTAR – Inventar-Panel aufbauen und Preis-Stepper
   ================================================================ */

function bauInventarPanel() {
  const liste = document.getElementById('inventory-list');
  liste.innerHTML = '';

  Object.entries(gameState.inventory).forEach(([key, menge]) => {
    if (menge <= 0) return;
    const prod = PRODUKTE[key];
    if (!prod) return;

    const aktuellerPreis = gameState.prices[key] || 0;

    const div = document.createElement('div');
    div.className = 'inventory-item';
    const inputWert = aktuellerPreis > 0
      ? (keineKommazahlen ? Math.round(aktuellerPreis) : aktuellerPreis.toFixed(2))
      : '';

    // Frische pro Einheit anzeigen (nicht gemittelt!)
    const tage = haltbarkeitTage();
    let frischeHTML = '';
    if (tage > 0) {
      const auft = frischeProduktAufteilung(key);
      const teile = [];
      if (auft.gruen  > 0) teile.push(`<span style="color:#4caf50">🟢 ${auft.gruen}x frisch</span>`);
      if (auft.orange > 0) teile.push(`<span style="color:#ff9800">🟡 ${auft.orange}x wird alt</span>`);
      if (auft.rot    > 0) teile.push(`<span style="color:#f44336">🔴 ${auft.rot}x verdirbt bald!</span>`);
      if (teile.length > 0) {
        frischeHTML = `<div class="inventory-item-freshness">${teile.join(' &middot; ')}</div>`;
      }
    }

    div.innerHTML = `
      <div class="inventory-item-name">${prod.emoji} ${prod.name}</div>
      <div class="inventory-item-count">Vorrat: ${menge}x</div>
      ${frischeHTML}
      <div class="inventory-item-price">
        <span class="price-label">Preis:</span>
        <div class="preis-stepper" data-produkt="${key}">
          <button class="preis-minus btn">−</button>
          <span class="preis-wert">${inputWert || '0'}</span>
          <button class="preis-plus btn">+</button>
        </div>
        <span class="price-label">€</span>
      </div>
    `;
    liste.appendChild(div);
  });

  // Preis-Stepper: Plus/Minus-Buttons
  const schritt = keineKommazahlen ? 1 : 0.50;
  const minPreis = keineKommazahlen ? 1 : 0.50;
  const maxPreis = keineKommazahlen ? 99 : 99.99;

  liste.querySelectorAll('.preis-stepper').forEach(stepper => {
    const key     = stepper.dataset.produkt;
    const anzeige = stepper.querySelector('.preis-wert');
    const btnMinus = stepper.querySelector('.preis-minus');
    const btnPlus  = stepper.querySelector('.preis-plus');

    function setzePreis(wert) {
      // Auf Schrittgröße runden und in Grenzen halten
      wert = Math.round(wert / schritt) * schritt;
      wert = Math.min(maxPreis, Math.max(minPreis, wert));
      gameState.prices[key] = wert;
      anzeige.textContent = keineKommazahlen ? wert : wert.toFixed(2);
    }

    btnMinus.addEventListener('click', (e) => {
      e.stopPropagation();
      const aktuell = gameState.prices[key] || minPreis;
      setzePreis(aktuell - schritt);
    });
    btnPlus.addEventListener('click', (e) => {
      e.stopPropagation();
      const aktuell = gameState.prices[key] || 0;
      setzePreis(aktuell + schritt);
    });
    // Touch-Events nicht zum Canvas durchreichen
    stepper.addEventListener('touchstart', e => e.stopPropagation());
  });
}

'use strict';

/* ================================================================
   INVENTAR – Inventar-Panel aufbauen und Preis-Stepper
   Pro Produkt eine Zeile mit dem Preis für frische Ware.
   Gibt es ältere Ware (🟡 / 🔴), kommen darunter eigene Preiszeilen dafür.
   ================================================================ */

// Preis als Text mit deutschem Komma
function preisText(preis) {
  if (!(preis > 0)) return '0';
  return keineKommazahlen ? String(Math.round(preis)) : preis.toFixed(2).replace('.', ',');
}

// HTML für einen Preis-Stepper (− Wert +)
function stepperHTML(key, stufe, preis) {
  return `
    <div class="preis-stepper" data-produkt="${key}" data-stufe="${stufe}">
      <button class="preis-minus btn" aria-label="billiger">−</button>
      <span class="preis-wert">${preisText(preis)}</span>
      <button class="preis-plus btn" aria-label="teurer">+</button>
    </div>
    <span class="price-label">€</span>`;
}

function bauInventarPanel() {
  const liste = document.getElementById('inventory-list');
  liste.innerHTML = '';

  // Tages-Trend über der Liste anzeigen
  const trendEl = document.getElementById('inventory-trend');
  if (trendEl) {
    const trendProd = PRODUKTE[gameState.trend];
    trendEl.textContent = trendProd ? TEXTE.trend.heuteGefragt(trendProd) : '';
    trendEl.classList.toggle('hidden', !trendProd);
  }

  const verderbAn = haltbarkeitTage() > 0;

  Object.entries(gameState.inventory).forEach(([key, menge]) => {
    if (menge <= 0) return;
    const prod = PRODUKTE[key];
    if (!prod) return;

    const bestand = bestandNachStufe(key);
    const hatAlteWare = verderbAn && (bestand.orange > 0 || bestand.rot > 0);

    const div = document.createElement('div');
    div.className = 'inventory-item' + (key === gameState.trend ? ' inventory-item--trend' : '');

    // Frische-Übersicht (nur wenn Verderb aktiv und keine eigenen Preiszeilen nötig)
    let frischeHTML = '';
    if (verderbAn && !hatAlteWare) {
      const teile = FRISCHE_REIHENFOLGE
        .filter(st => bestand[st] > 0)
        .map(st => `${FRISCHE_STUFEN[st].emoji} ${bestand[st]}x ${FRISCHE_STUFEN[st].label}`);
      if (teile.length > 0) {
        frischeHTML = `<div class="inventory-item-freshness">${teile.join(' &nbsp;')}</div>`;
      }
    }

    // Bei älterer Ware: eine Preiszeile je Frische-Stufe (frisch, wird alt, verdirbt bald)
    let altPreiseHTML = '';
    if (hatAlteWare) {
      altPreiseHTML = FRISCHE_REIHENFOLGE
        .filter(st => bestand[st] > 0)
        .map(st => `
          <div class="inventory-frische-preis">
            <span class="inventory-frische-label">${FRISCHE_STUFEN[st].emoji} ${bestand[st]}x ${FRISCHE_STUFEN[st].label}</span>
            <div class="inventory-item-price">${stepperHTML(key, st, preisFuer(key, st))}</div>
          </div>`)
        .join('');
    }

    // Kompakte Zeile: Emoji | Name + Vorrat | Preis-Stepper (frisch)
    div.innerHTML = `
      <div class="inventory-item-emoji">${prod.emoji}</div>
      <div class="inventory-item-info">
        <div class="inventory-item-name">${prod.name}${key === gameState.trend ? ' 📈' : ''}</div>
        <div class="inventory-item-count">Vorrat: ${menge}x</div>
        ${frischeHTML}
      </div>
      ${hatAlteWare ? '' : `<div class="inventory-item-price">${stepperHTML(key, 'gruen', gameState.prices[key] || 0)}</div>`}
      ${altPreiseHTML}
    `;
    liste.appendChild(div);
  });

  // Preis-Stepper: Plus/Minus-Buttons
  const schritt = keineKommazahlen ? 1 : 0.50;
  const minPreis = keineKommazahlen ? 1 : 0.50;
  const maxPreis = keineKommazahlen ? 99 : 99.99;

  liste.querySelectorAll('.preis-stepper').forEach(stepper => {
    const key      = stepper.dataset.produkt;
    const stufe    = stepper.dataset.stufe || 'gruen';
    const anzeige  = stepper.querySelector('.preis-wert');
    const btnMinus = stepper.querySelector('.preis-minus');
    const btnPlus  = stepper.querySelector('.preis-plus');

    function setzePreis(wert) {
      // Auf Schrittgröße runden und in Grenzen halten
      wert = Math.round(wert / schritt) * schritt;
      wert = Math.min(maxPreis, Math.max(minPreis, wert));
      setzeFrischePreis(key, stufe, wert);
      anzeige.textContent = preisText(wert);
    }

    btnMinus.addEventListener('click', (e) => {
      e.stopPropagation();
      const aktuell = preisFuer(key, stufe) || minPreis;
      setzePreis(aktuell - schritt);
    });
    btnPlus.addEventListener('click', (e) => {
      e.stopPropagation();
      const aktuell = preisFuer(key, stufe) || 0;
      setzePreis(aktuell + schritt);
    });
    // Antippen der Preiszahl → Preis direkt mit dem Ziffernblock eintippen
    anzeige.addEventListener('click', (e) => {
      e.stopPropagation();
      const prod = PRODUKTE[key];
      const zusatz = stufe !== 'gruen' ? ` (${FRISCHE_STUFEN[stufe].label})` : '';
      oeffnePreisNumpad({
        titel: `${prod.emoji} ${prod.name}${zusatz}`,
        preis: preisFuer(key, stufe),
        onFertig: (neu) => {
          setzeFrischePreis(key, stufe, neu);
          anzeige.textContent = preisText(neu);
        },
      });
    });
    // Touch-Events nicht zum Canvas durchreichen
    stepper.addEventListener('touchstart', e => e.stopPropagation());
  });
}

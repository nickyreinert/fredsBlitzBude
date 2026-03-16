'use strict';

/* ================================================================
   PREISPOPUP – Preis-Popup über dem Preisschild auf dem Canvas
   ================================================================ */

function oeffnePreisPopup(key) {
  const prod   = PRODUKTE[key];
  const hitbox = preisschilderHitbox.find(h => h.key === key);
  if (!prod || !hitbox) return;

  // Altes Popup entfernen
  document.getElementById('preis-popup')?.remove();

  const popup = document.createElement('div');
  popup.id = 'preis-popup';

  // Position: über dem Preisschild auf dem Canvas
  const rect   = canvas.getBoundingClientRect();
  const scaleX = rect.width  / canvas.width;
  const scaleY = rect.height / canvas.height;
  const popupW = 200;
  let popupX   = rect.left + hitbox.x * scaleX + (hitbox.w * scaleX - popupW) / 2;
  let popupY   = rect.top  + hitbox.y * scaleY - 80;
  // Nicht aus dem Bildschirm rausfallen
  popupX = Math.max(8, Math.min(window.innerWidth - popupW - 8, popupX));
  popupY = Math.max(8, popupY);

  const schritt   = keineKommazahlen ? 1 : 0.5;
  const minPreis  = keineKommazahlen ? 1 : 0.5;
  const maxPreis  = 99;
  let aktuellerPreis = gameState.prices[key] > 0 ? gameState.prices[key] : minPreis;

  function preisAnzeige(p) {
    return keineKommazahlen ? `${Math.round(p)}` : p.toFixed(2);
  }

  popup.innerHTML = `
    <div class="preis-popup-titel">${prod.emoji} ${prod.name} – Preis</div>
    <div class="preis-popup-stepper">
      <button class="preis-popup-minus btn">−</button>
      <span class="preis-popup-wert">${preisAnzeige(aktuellerPreis)}</span>
      <span class="preis-popup-euro">€</span>
      <button class="preis-popup-plus btn">+</button>
    </div>
    <div class="preis-popup-btns">
      <button id="preis-popup-ok" class="btn btn-success btn-lg">✓ OK</button>
      <button id="preis-popup-ab" class="btn btn-warning btn-lg">✕</button>
    </div>
  `;
  popup.style.left = popupX + 'px';
  popup.style.top  = popupY + 'px';
  document.getElementById('ui').appendChild(popup);

  const wertEl   = popup.querySelector('.preis-popup-wert');
  const schliessen = () => popup.remove();

  function setzePreis(p) {
    p = Math.round(p / schritt) * schritt;
    p = Math.min(maxPreis, Math.max(minPreis, p));
    aktuellerPreis = p;
    wertEl.textContent = preisAnzeige(p);
  }

  popup.querySelector('.preis-popup-minus').addEventListener('click', (e) => {
    e.stopPropagation();
    setzePreis(aktuellerPreis - schritt);
  });
  popup.querySelector('.preis-popup-plus').addEventListener('click', (e) => {
    e.stopPropagation();
    setzePreis(aktuellerPreis + schritt);
  });

  document.getElementById('preis-popup-ok').addEventListener('click', () => {
    gameState.prices[key] = aktuellerPreis;
    schliessen();
  });
  document.getElementById('preis-popup-ab').addEventListener('click', schliessen);

  // Klick außerhalb schließt
  setTimeout(() => {
    document.addEventListener('click', function außen(e) {
      if (!popup.contains(e.target)) { schliessen(); document.removeEventListener('click', außen); }
    });
  }, 50);
}

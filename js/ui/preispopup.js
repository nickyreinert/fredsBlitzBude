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

  // Welche Frische-Stufen sind vorhanden? (frisch immer, ältere nur wenn Verderb aktiv und Ware da)
  const bestand = bestandNachStufe(key);
  const stufen = haltbarkeitTage() > 0
    ? FRISCHE_REIHENFOLGE.filter(st => st === 'gruen' || bestand[st] > 0)
    : ['gruen'];

  // Arbeitskopie der Preise – wird erst bei OK übernommen
  const neuePreise = {};
  stufen.forEach(st => {
    const p = preisFuer(key, st);
    neuePreise[st] = p > 0 ? p : minPreis;
  });

  function preisAnzeige(p) {
    return keineKommazahlen ? `${Math.round(p)}` : p.toFixed(2).replace('.', ',');
  }

  const mehrereStufen = stufen.length > 1;
  const stepperZeilen = stufen.map(st => `
    ${mehrereStufen ? `<div class="preis-popup-stufe">${FRISCHE_STUFEN[st].emoji} ${FRISCHE_STUFEN[st].label}</div>` : ''}
    <div class="preis-popup-stepper" data-stufe="${st}">
      <button class="preis-popup-minus btn">−</button>
      <span class="preis-popup-wert">${preisAnzeige(neuePreise[st])}</span>
      <span class="preis-popup-euro">€</span>
      <button class="preis-popup-plus btn">+</button>
    </div>`).join('');

  popup.innerHTML = `
    <div class="preis-popup-titel">${prod.emoji} ${prod.name} – Preis</div>
    ${stepperZeilen}
    <div class="preis-popup-btns">
      <button id="preis-popup-ok" class="btn btn-success btn-lg">✓ OK</button>
      <button id="preis-popup-ab" class="btn btn-warning btn-lg">✕</button>
    </div>
  `;
  popup.style.left = popupX + 'px';
  popup.style.top  = popupY + 'px';
  document.getElementById('ui').appendChild(popup);

  // Popup darf nicht unten aus dem Bildschirm ragen (mehrere Zeilen = höher)
  const hoehe = popup.offsetHeight;
  if (popupY + hoehe > window.innerHeight - 8) {
    popup.style.top = Math.max(8, window.innerHeight - hoehe - 8) + 'px';
  }

  const schliessen = () => popup.remove();

  popup.querySelectorAll('.preis-popup-stepper').forEach(zeile => {
    const st = zeile.dataset.stufe;
    const wertEl = zeile.querySelector('.preis-popup-wert');
    const setze = (p) => {
      p = Math.round(p / schritt) * schritt;
      neuePreise[st] = Math.min(maxPreis, Math.max(minPreis, p));
      wertEl.textContent = preisAnzeige(neuePreise[st]);
    };
    zeile.querySelector('.preis-popup-minus').addEventListener('click', (e) => {
      e.stopPropagation();
      setze(neuePreise[st] - schritt);
    });
    zeile.querySelector('.preis-popup-plus').addEventListener('click', (e) => {
      e.stopPropagation();
      setze(neuePreise[st] + schritt);
    });
    // Antippen der Zahl → Preis direkt eintippen
    wertEl.addEventListener('click', (e) => {
      e.stopPropagation();
      oeffnePreisNumpad({
        titel: `${prod.emoji} ${prod.name}${mehrereStufen ? ` (${FRISCHE_STUFEN[st].label})` : ''}`,
        preis: neuePreise[st],
        onFertig: (neu) => {
          neuePreise[st] = neu;
          wertEl.textContent = preisAnzeige(neu);
        },
      });
    });
  });

  document.getElementById('preis-popup-ok').addEventListener('click', () => {
    stufen.forEach(st => setzeFrischePreis(key, st, neuePreise[st]));
    schliessen();
  });
  document.getElementById('preis-popup-ab').addEventListener('click', schliessen);

  // Klick außerhalb schließt
  setTimeout(() => {
    document.addEventListener('click', function außen(e) {
      if (!popup.contains(e.target) && !e.target.closest?.('#preis-numpad')) { schliessen(); document.removeEventListener('click', außen); }
    });
  }, 50);
}

/* ================================================================
   PREIS-ZIFFERNBLOCK – Preis direkt eintippen (statt nur − / +)
   Wird geöffnet, wenn man auf eine Preiszahl tippt.
   ================================================================ */

// titel: Überschrift, preis: aktueller Preis, onFertig(neuerPreis): wird bei OK aufgerufen
function oeffnePreisNumpad({ titel, preis, onFertig }) {
  document.getElementById('preis-numpad')?.remove();

  // Eingabe in Cent (wie beim Wechselgeld) – im Einfach-Modus in ganzen Euro
  let eingabe = '';
  const maxStellen = keineKommazahlen ? 2 : 4;   // bis 99 € bzw. 99,99 €

  const anzeigeText = () => {
    if (eingabe === '') {
      // Noch nichts getippt: alten Preis blass anzeigen
      return keineKommazahlen ? String(Math.round(preis || 0)) : (preis || 0).toFixed(2).replace('.', ',');
    }
    if (keineKommazahlen) return String(parseInt(eingabe, 10));
    const p = eingabe.padStart(3, '0');
    return `${parseInt(p.slice(0, -2), 10)},${p.slice(-2)}`;
  };
  const eingabePreis = () => {
    if (eingabe === '') return null;
    const zahl = parseInt(eingabe, 10);
    return keineKommazahlen ? zahl : zahl / 100;
  };

  const overlay = document.createElement('div');
  overlay.id = 'preis-numpad';
  overlay.className = 'preis-numpad-overlay';
  const tasten = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];
  overlay.innerHTML = `
    <div class="preis-numpad-box">
      <div class="preis-numpad-titel">${titel}</div>
      <div class="preis-numpad-display">
        <span class="preis-numpad-wert alt">${anzeigeText()}</span><span class="preis-numpad-euro">€</span>
      </div>
      <div class="preis-numpad-grid">
        ${tasten.map(t => t === 'del'
          ? '<button class="numpad-btn numpad-del" data-taste="del">⌫</button>'
          : t === 'ok'
            ? '<button class="numpad-btn preis-numpad-ok" data-taste="ok">✓</button>'
            : `<button class="numpad-btn" data-taste="${t}">${t}</button>`).join('')}
      </div>
      <button class="btn btn-warning btn-lg preis-numpad-abbrechen">✕ Abbrechen</button>
    </div>`;
  document.body.appendChild(overlay);

  const wertEl = overlay.querySelector('.preis-numpad-wert');
  const schliessen = () => overlay.remove();

  overlay.addEventListener('click', (e) => {
    // Klicks nicht an andere "Außen-Klick"-Logik (z.B. Preis-Popup) weitergeben
    e.stopPropagation();
    if (e.target === overlay || e.target.closest('.preis-numpad-abbrechen')) { schliessen(); return; }
    const taste = e.target.closest('[data-taste]')?.dataset.taste;
    if (!taste) return;

    if (taste === 'ok') {
      const neu = eingabePreis();
      if (neu !== null) {
        // Mindestpreis 10 Cent (bzw. 1 € im Einfach-Modus), höchstens 99,99 €
        const min = keineKommazahlen ? 1 : 0.1;
        onFertig(Math.min(99.99, Math.max(min, neu)));
      }
      schliessen();
      return;
    }
    if (taste === 'del') eingabe = eingabe.slice(0, -1);
    else if (eingabe.length < maxStellen) eingabe = (eingabe + taste).replace(/^0+(?=\d)/, '');

    wertEl.textContent = anzeigeText();
    wertEl.classList.toggle('alt', eingabe === '');
  });
}

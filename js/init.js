'use strict';

/* ================================================================
   INIT – Event-Listener und App-Startup
   ================================================================ */

// Canvas-Klick: Preisschilder anklicken
function canvasKlickPosition(e) {
  const rect   = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top)  * scaleY,
  };
}

canvas.addEventListener('click', (e) => {
  const { x, y } = canvasKlickPosition(e);
  for (const hitbox of preisschilderHitbox) {
    if (x >= hitbox.x && x <= hitbox.x + hitbox.w &&
        y >= hitbox.y && y <= hitbox.y + hitbox.h) {
      oeffnePreisPopup(hitbox.key);
      return;
    }
  }
});

canvas.addEventListener('touchend', (e) => {
  const touch = e.changedTouches[0];
  const { x, y } = canvasKlickPosition(touch);
  for (const hitbox of preisschilderHitbox) {
    if (x >= hitbox.x && x <= hitbox.x + hitbox.w &&
        y >= hitbox.y && y <= hitbox.y + hitbox.h) {
      e.preventDefault();
      oeffnePreisPopup(hitbox.key);
      return;
    }
  }
}, { passive: false });

// Einstellungen öffnen
document.getElementById('btn-settings').addEventListener('click', () => {
  screenVorEinstellungen = aktuellerScreen() || 'screen-start';
  // Toggle-Status aktuell setzen
  document.getElementById('toggle-nocomma').checked = keineKommazahlen;
  zeigeScreen('screen-settings');
});

// Toggle: Keine Komma-Zahlen
document.getElementById('toggle-nocomma').addEventListener('change', (e) => {
  keineKommazahlen = e.target.checked;
  localStorage.setItem('keineKommazahlen', keineKommazahlen ? '1' : '0');
});

// Großmarkt öffnen (vom Nacht-Overlay)
document.getElementById('btn-grossmarkt').addEventListener('click', zeigeGrossmarkt);

// Großmarkt: Zurück ohne Kauf
document.getElementById('btn-grossmarkt-zurueck').addEventListener('click', () => {
  starteAnimation();
  zeigeScreen('screen-stand');
  document.getElementById('overlay-night').classList.remove('hidden');
});

// Großmarkt: Kaufen
document.getElementById('btn-grossmarkt-kaufen').addEventListener('click', grossmarktKaufen);

// Großmarkt: Stepper-Buttons (delegiert)
document.getElementById('grossmarkt-sortiment').addEventListener('click', (e) => {
  const btn = e.target.closest('.gm-minus, .gm-plus');
  if (!btn) return;
  const key = btn.dataset.key;
  if (!key || !grossmarktSortiment[key]) return;
  const max = grossmarktSortiment[key].verfuegbar;
  if (btn.classList.contains('gm-plus')) {
    grossmarktWarenkorb[key] = Math.min((grossmarktWarenkorb[key] || 0) + 1, max);
  } else {
    grossmarktWarenkorb[key] = Math.max((grossmarktWarenkorb[key] || 0) - 1, 0);
  }
  document.getElementById(`gm-menge-${key}`).textContent = grossmarktWarenkorb[key] || 0;
  aktualisiereGrossmarktGesamt();
});

// Intro zurücksetzen
document.getElementById('btn-reset-intro').addEventListener('click', () => {
  localStorage.removeItem('introGesehen');
  zeigeMeldung('👵 Willkommens-Dialog wird beim nächsten Start wieder angezeigt!');
});

// Alle Daten zurücksetzen
document.getElementById('btn-reset-all').addEventListener('click', () => {
  if (confirm('Wirklich alles zurücksetzen? Dein Spielstand wird gelöscht!')) {
    localStorage.clear();
    keineKommazahlen = false;
    document.getElementById('toggle-nocomma').checked = false;
    document.getElementById('toggle-trinkgeld').checked = false;
    document.getElementById('trinkgeld-detail-controls').classList.add('hidden');
    einkaufsStufe = 1;
    document.querySelectorAll('.einkaufsstufe-btn').forEach(b => {
      const aktiv = parseInt(b.dataset.stufe, 10) === 1;
      b.classList.toggle('btn-primary', aktiv);
      b.classList.toggle('btn-outline', !aktiv);
    });
    // Bewertungen und Erfahrung zurücksetzen
    gameState.bewertungSumme  = 0;
    gameState.bewertungAnzahl = 0;
    gameState.gesamtKunden    = 0;
    gameState.gesamtXP        = 0;
    gameState.level           = 1;
    aktualisiereXpHud();
    zeigeMeldung('🗑️ Alles zurückgesetzt!');
    setTimeout(() => zeigeScreen('screen-start'), 1500);
  }
});

// Einstellungen schließen – zurück zum vorherigen Screen
document.getElementById('btn-settings-back').addEventListener('click', () => {
  zeigeScreen(screenVorEinstellungen);
  // Falls wir vom Stand zurückkommen, Animation neu starten
  if (screenVorEinstellungen === 'screen-stand') {
    starteAnimation();
  }
});

// Startbildschirm: "Spiel starten"
document.getElementById('btn-start').addEventListener('click', () => {
  // Intro nur beim allerersten Mal zeigen
  if (localStorage.getItem('introGesehen')) {
    starteTag();
  } else {
    starteIntro();
  }
});

// Beim Laden: Spielstand wiederherstellen wenn vorhanden → direkt zum Stand
(function pruefeSpielsstand() {
  if (ladeSpielstand()) {
    // Spielstand geladen → direkt weiterspielen
    starteTag();
  }
  // Sonst: Startbildschirm bleibt aktiv (default)
})();

// Intro: "Weiter"
document.getElementById('btn-intro-next').addEventListener('click', () => {
  introSchritt++;
  if (introSchritt >= INTRO_SCHRITTE.length) {
    // Intro fertig → merken damit es nicht nochmal gezeigt wird
    localStorage.setItem('introGesehen', '1');
    starteTag();
  } else {
    zeigeIntroSchritt();
  }
});

// Stand öffnen
document.getElementById('btn-open-stand').addEventListener('click', () => {
  oeffneStand();
});

// Feierabend-Button: Tag frühzeitig beenden
document.getElementById('btn-feierabend').addEventListener('click', () => {
  if (!gameState.standOpen) return;
  tagesEnde();
});

// Wechselgeld geben (öffnet Wechselgeld-Screen)
document.getElementById('btn-give-change').addEventListener('click', () => {
  oeffneWechselgeldScreen();
});

// Kauf ablehnen (zu wenig Geld oder unfreundlich)
document.getElementById('btn-ablehnen').addEventListener('click', () => {
  const kunde = gameState.currentCustomer;
  if (kunde && kunde.passantRef) {
    // Passant geht wieder weg
    kunde.passantRef.steht = false;
    gameState.passanten = gameState.passanten.filter(p => p !== kunde.passantRef);
  }
  // Bei zu wenig Geld: Kunde kommt später nochmal (zurück in Queue)
  // Bei Unfreundlichkeit: Kunde wird weggeschickt, kommt nicht wieder
  if (kunde && !kunde.unfreundlich) {
    gameState.customers.push(kunde);
  }
  gameState.currentCustomer = null;
  gameState.customerVisible  = false;
  document.getElementById('panel-customer').classList.add('hidden');
  naechsterKunde();
});

// Numpad-Tasten
document.getElementById('numpad').addEventListener('click', (e) => {
  const btn = e.target.closest('.numpad-btn');
  if (!btn) return;
  numpadTaste(btn.dataset.val);
});

// Wechselgeld: Bestätigen
document.getElementById('btn-change-confirm').addEventListener('click', () => {
  bestaetigeWechselgeld();
});

// Nacht: Nächster Tag
document.getElementById('btn-next-day').addEventListener('click', () => {
  naechsterTag();
});

/* ================================================================
   STARTZEICHNUNG (Startbildschirm Hintergrund)
   ================================================================ */

// Beim Laden direkt eine Hintergrund-Szene zeichnen
(function initialZeichnung() {
  resizeCanvas();
  gameState.sunX = 0.3;
  gameState._stand = null;
  zeichneHimmel(canvas.width, canvas.height);
  zeichneSonne(canvas.width, canvas.height);
  zeichneWolken(canvas.width, canvas.height);
  zeichneBoden(canvas.width, canvas.height);
  zeichneStand(canvas.width, canvas.height);
})();

// Leichte Animations-Schleife auch auf dem Startbildschirm (Sonne bewegt sich)
(function startAnimation() {
  let lauf = true;

  function frame(_ts) {
    if (!lauf) return;

    // Nur animieren wenn Startbildschirm aktiv
    if (aktuellerScreen() === 'screen-start' || aktuellerScreen() === null) {
      gameState.sunX += 0.0001;
      if (gameState.sunX > 1) gameState.sunX = 0.1;
      zeichneHimmel(canvas.width, canvas.height);
      zeichneSonne(canvas.width, canvas.height);
      zeichneWolken(canvas.width, canvas.height);
      zeichneBoden(canvas.width, canvas.height);
      zeichneStand(canvas.width, canvas.height);
    } else {
      lauf = false; // Haupt-Animation übernimmt
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();

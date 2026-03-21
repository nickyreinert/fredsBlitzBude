'use strict';

/* ================================================================
   TAG – Tagesablauf: Start, Ende, Stand öffnen, nächster Tag
   ================================================================ */

function starteTag() {
  aktualisiereZeit();

  const standWarOffen = gameState.standOpen;

  if (!standWarOffen) {
    gameState.totalCustomers  = 0;
    gameState.customersServed = 0;
    gameState.dailyEarnings   = 0;
    gameState.customers       = [];
    // Tagesfortschritt immer auf 0 zurücksetzen – Stand ist noch geschlossen
    gameState.tagesfortschritt = 0;
    gameState.tagesZeitSlot    = 'morgen';
    // Uhrzeit-Anzeige auf Tagesbeginn setzen
    const uhrzeitEl = document.getElementById('hud-uhrzeit');
    if (uhrzeitEl) uhrzeitEl.textContent = '8:00';
  }

  gameState.sunX = gameState.tagesfortschritt;

  aktualisiereHUD();
  bauInventarPanel();

  document.getElementById('panel-customer').classList.add('hidden');
  document.getElementById('customer-payment-info').classList.add('hidden');
  document.getElementById('overlay-night').classList.add('hidden');

  if (standWarOffen) {
    document.getElementById('panel-inventory').classList.add('hidden');
    document.getElementById('btn-feierabend').classList.remove('hidden');
    document.getElementById('hud-feierabend-item').classList.remove('hidden');
  } else {
    document.getElementById('panel-inventory').classList.remove('hidden');
    document.getElementById('btn-feierabend').classList.add('hidden');
    document.getElementById('hud-feierabend-item').classList.add('hidden');
  }

  zeichneHudUhr(gameState.tagesfortschritt);

  gameState.customerVisible  = false;
  gameState.customerWalking  = false;
  gameState.currentCustomer  = null;
  gameState.passanten      = [];
  gameState.passantenTimer = 2000;

  // Sackgassen-Schutz: kein Inventar und kein Großmarkt-Zugang
  const hatWare = Object.values(gameState.inventory).some(v => v > 0);
  const kannGrossmarkt = gameState.money >= grossmarktMinGeld();
  if (!standWarOffen && !hatWare && !kannGrossmarkt) {
    lagerEin('gurke', 2);
    if (!gameState.prices['gurke']) gameState.prices['gurke'] = 0;
    zeigeMeldung(TEXTE.meldungen.notfallLieferung);
    bauInventarPanel();
  }

  speichereSpielstand();
  // Zubehör-Shop-Button einblenden (nur im Spielstand sichtbar)
  document.getElementById('btn-zubehoer').classList.remove('hidden');
  zeigeScreen('screen-stand');
  starteAnimation();
}

// Stand öffnen
function oeffneStand() {
  const hatPreis = Object.entries(gameState.inventory).some(
    ([k, v]) => v > 0 && gameState.prices[k] > 0
  );

  if (!hatPreis) {
    const btn = document.getElementById('btn-open-stand');
    btn.textContent = TEXTE.stand.oeffnenPreisHinweis;
    btn.style.background = 'linear-gradient(180deg,#ef9a9a,#e53935)';
    setTimeout(() => {
      btn.textContent = TEXTE.stand.oeffnenDefault;
      btn.style.background = '';
    }, TEXTE.stand.oeffnenPreisHinweisTimeoutMs);
    return;
  }

  gameState.standOpen = true;

  const anzahl = berechneKundenAnzahl();
  gameState.customers = generiereKunden(anzahl);
  gameState.totalCustomers = gameState.customers.length;
  aktualisiereHUD();

  document.getElementById('panel-inventory').classList.add('hidden');

  gameState.passantenTimer    = 3000;
  gameState.tagesfortschritt  = 0;
  gameState.tagesZeitSlot     = 'morgen';

  document.getElementById('btn-feierabend').classList.remove('hidden');
  document.getElementById('hud-feierabend-item').classList.remove('hidden');
  // Spielstand sichern damit Kunden-Queue und offener Stand nach Browser-Schließen erhalten bleibt
  speichereSpielstand();
}

// Tagesende
function tagesEnde() {
  // Guard: verhindert doppelten Aufruf (z.B. Feierabend-Button + Timeout gleichzeitig)
  if (!gameState.standOpen) return;
  gameState.standOpen = false;
  gameState.customerVisible = false;

  document.getElementById('btn-feierabend').classList.add('hidden');
  document.getElementById('hud-feierabend-item').classList.add('hidden');

  const nachtOverlay = document.getElementById('overlay-night');
  document.getElementById('night-title').textContent =
    TEXTE.dayEnd.titel(gameState.day);
  document.getElementById('night-text').textContent =
    TEXTE.dayEnd.kundenBedient(gameState.customersServed);

  const verluste = verderbeInventar();
  let verderb_html = '';
  if (Object.keys(verluste).length > 0) {
    const verloreneWaren = Object.entries(verluste)
      .map(([k, n]) => `${PRODUKTE[k]?.emoji || k} ${n}× ${PRODUKTE[k]?.name || k}`)
      .join(', ');
    verderb_html = `<br>${TEXTE.dayEnd.verdorben} <strong>${verloreneWaren}</strong>`;
  }

  let oma_html = '';
  if (gameState.phase === 1) {
    const omaText = omaLieferung();
    if (omaText.length > 0) {
      oma_html = `<br>${TEXTE.dayEnd.omaLiefert} <strong>${omaText.join(', ')}</strong>`;
    }
  }

  document.getElementById('night-stats').innerHTML = `
    ${TEXTE.dayEnd.heuteVerdient} <strong>${formatEuro(gameState.dailyEarnings)}</strong><br>
    ${TEXTE.dayEnd.gesamtGeld} <strong>${formatEuro(gameState.money)}</strong>
    ${verderb_html}${oma_html}
  `;

  const btnGrossmarkt = document.getElementById('btn-grossmarkt');
  if (gameState.money >= grossmarktMinGeld()) {
    btnGrossmarkt.classList.remove('hidden');
  } else {
    btnGrossmarkt.classList.add('hidden');
  }

  nachtOverlay.classList.remove('hidden');
  gameState.sunX = 0.98;
}

// Neuen Tag starten
function naechsterTag() {
  gameState.day++;
  // Großmarkt-Flag zurücksetzen – Oma soll jeden Tag neu entscheiden
  gameState.grossmarktGenutzt = false;

  // Jahreszeit nach neuer Tages-basierter Logik prüfen
  const alteJahreszeit = gameState.jahreszeit;
  const neueJahreszeit = jahresZeitFuerTag(gameState.day);
  const jahreszeitWechsel = neueJahreszeit !== alteJahreszeit;

  if (jahreszeitWechsel) {
    // Toast erst nach aktualisiereZeit() zeigen (neuer Wert)
    const jz = JAHRESZEITEN[neueJahreszeit];
    setTimeout(() => {
      const toast = document.createElement('div');
      toast.style.cssText = `
        position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
        background:rgba(0,0,0,0.75); color:#fff; border-radius:20px;
        padding:1.2rem 2rem; font-size:1.4rem; font-weight:700;
        text-align:center; z-index:9999; pointer-events:none;
        animation: fadeInOut 3s ease forwards;
      `;
      toast.innerHTML = `${jz.emoji} Neue Jahreszeit:<br><strong>${jz.name}!</strong>`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3100);
    }, 500);
  }

  starteTag();
}

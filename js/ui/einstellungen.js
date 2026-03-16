'use strict';

/* ================================================================
   EINSTELLUNGEN – Alle Settings-IIFEs und Event-Listener
   ================================================================ */

// Tab-Navigation
document.querySelectorAll('.settings-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // Alle Tabs und Panels deaktivieren
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.settings-tab-panel').forEach(p => p.classList.add('hidden'));
    // Gewählten Tab und zugehöriges Panel aktivieren
    tab.classList.add('active');
    document.getElementById(`settings-tab-${tab.dataset.tab}`).classList.remove('hidden');
  });
});

// Einstellung: keine Komma-Zahlen – beim Start aus localStorage laden
keineKommazahlen = localStorage.getItem('keineKommazahlen') === '1';
document.getElementById('toggle-nocomma').checked = keineKommazahlen;

// Einstellung: Einkaufsstufe (1 = einfach, 2 = eine Sorte viele Stück, 3 = mehrere Produkte)
einkaufsStufe = parseInt(localStorage.getItem('einkaufsStufe') ?? '1', 10);

// Stufe-Buttons initial hervorheben
(function initEinkaufsstufe() {
  document.querySelectorAll('.einkaufsstufe-btn').forEach(btn => {
    const aktiv = parseInt(btn.dataset.stufe, 10) === einkaufsStufe;
    btn.classList.toggle('btn-primary', aktiv);
    btn.classList.toggle('btn-outline', !aktiv);
  });
})();

// Klick auf Einkaufsstufe-Button
document.querySelectorAll('.einkaufsstufe-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    einkaufsStufe = parseInt(btn.dataset.stufe, 10);
    localStorage.setItem('einkaufsStufe', einkaufsStufe);
    document.querySelectorAll('.einkaufsstufe-btn').forEach(b => {
      const aktiv = parseInt(b.dataset.stufe, 10) === einkaufsStufe;
      b.classList.toggle('btn-primary', aktiv);
      b.classList.toggle('btn-outline', !aktiv);
    });
  });
});

// Verderb-Toggle: beim Start initialisieren
(function initVerderbSettings() {
  const verderbAktiv = haltbarkeitTage() > 0;
  const toggle = document.getElementById('toggle-verderb');
  toggle.checked = verderbAktiv;
  document.getElementById('verderb-tage-row').classList.toggle('hidden', !verderbAktiv);

  // Aktiven Tage-Button hervorheben
  const aktuelleTage = haltbarkeitTage();
  document.querySelectorAll('.verderb-tage-btn').forEach(btn => {
    btn.classList.toggle('btn-primary', parseInt(btn.dataset.tage) === aktuelleTage);
    btn.classList.toggle('btn-sm', true);
  });
})();

document.getElementById('toggle-verderb').addEventListener('change', (e) => {
  if (e.target.checked) {
    // Standard: 3 Tage
    const tage = parseInt(localStorage.getItem('haltbarkeitTage') ?? '3', 10);
    localStorage.setItem('haltbarkeitTage', tage > 0 ? tage : 3);
    document.getElementById('verderb-tage-row').classList.remove('hidden');
  } else {
    localStorage.setItem('haltbarkeitTage', '0');
    document.getElementById('verderb-tage-row').classList.add('hidden');
  }
});

document.querySelectorAll('.verderb-tage-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tage = parseInt(btn.dataset.tage, 10);
    localStorage.setItem('haltbarkeitTage', tage);
    // Aktiven Button hervorheben
    document.querySelectorAll('.verderb-tage-btn').forEach(b => {
      b.classList.toggle('btn-primary', b === btn);
    });
    zeigeMeldung(`✅ Haltbarkeit: ${tage} Tage`);
  });
});

// Globaler Kunden-Slider aufbauen
(function initGlobalKundenSettings() {
  const slider = document.getElementById('global-kunden-slider');
  const wertEl = document.getElementById('global-kunden-wert');
  if (!slider || !wertEl) return;

  // Gespeicherten Wert laden
  const aktuell = globalKundenProTag();
  slider.value = aktuell;
  wertEl.textContent = aktuell;

  slider.addEventListener('input', () => {
    const wert = parseInt(slider.value);
    wertEl.textContent = wert;
    localStorage.setItem('globalKundenProTag', wert);
  });
})();

// Tagesrhythmus-Controls aufbauen
(function initTagesrhythmusSettings() {
  const container = document.getElementById('tagesrhythmus-controls');
  if (!container) return;

  // Stufen: Wert → Emoji + Text-Label
  const STUFEN = RHYTHMUS_STUFEN;

  // Nächste Stufe zum gespeicherten Wert finden (Index 0–4)
  function wertzuIndex(wert) {
    let best = 0;
    let bestDiff = Infinity;
    STUFEN.forEach((s, i) => {
      const d = Math.abs(s.val - wert);
      if (d < bestDiff) { bestDiff = d; best = i; }
    });
    return best;
  }

  Object.entries(TAGESRHYTHMUS).forEach(([slot, info]) => {
    const aktuell = tagesrhythmusFaktor(slot);
    const startIdx = wertzuIndex(aktuell);

    const row = document.createElement('div');
    row.className = 'settings-faktor-row';

    // Slider-HTML: Emoji-Endpunkte links/rechts, Slider in der Mitte, Label darunter
    row.innerHTML = `
      <div class="rhythmus-slider-header">
        <span class="settings-faktor-label">${info.emoji} <strong>${info.label}</strong> <small>(${info.stunden})</small></span>
      </div>
      <div class="rhythmus-slider-wrap">
        <span class="slider-emoji-links">😴</span>
        <input type="range" class="rhythmus-slider" data-slot="${slot}"
               min="0" max="4" step="1" value="${startIdx}">
        <span class="slider-emoji-rechts">🎉</span>
      </div>
      <div class="rhythmus-slider-label" id="rhythmus-label-${slot}">
        ${STUFEN[startIdx].emoji} ${STUFEN[startIdx].label}
      </div>
    `;
    container.appendChild(row);

    // Slider-Änderung speichern + Label aktualisieren
    const slider = row.querySelector('.rhythmus-slider');
    slider.addEventListener('input', () => {
      const idx = parseInt(slider.value, 10);
      const stufe = STUFEN[idx];
      localStorage.setItem(`rhythmus_${slot}`, stufe.val);
      document.getElementById(`rhythmus-label-${slot}`).textContent =
        `${stufe.emoji} ${stufe.label}`;
    });
  });
})();

// Kundentypen-Controls aufbauen
(function initKundentypSettings() {
  const container = document.getElementById('kundentypen-controls');
  if (!container) return;

  Object.entries(KUNDENTYPEN).forEach(([typ, info]) => {
    const aktuell = kundentypFaktor(typ);

    const row = document.createElement('div');
    row.className = 'settings-faktor-row';
    row.innerHTML = `
      <span class="settings-faktor-label">${info.emoji} ${info.label}</span>
      <span class="settings-faktor-desc">${info.beschreibung}</span>
      <div class="faktor-buttons" data-typ="${typ}">
        <button class="btn btn-sm faktor-btn" data-val="0">❌</button>
        <button class="btn btn-sm faktor-btn" data-val="0.3">selten</button>
        <button class="btn btn-sm faktor-btn" data-val="1.0">normal</button>
        <button class="btn btn-sm faktor-btn" data-val="2.0">oft</button>
        <button class="btn btn-sm faktor-btn" data-val="3.5">sehr oft</button>
      </div>
    `;
    container.appendChild(row);

    // Aktiven Button hervorheben (nächster Wert)
    const stufen = KUNDENTYP_HAEUFIGKEIT_STUFEN;
    const naechster = stufen.reduce((a, b) =>
      Math.abs(b - aktuell) < Math.abs(a - aktuell) ? b : a);
    row.querySelectorAll('.faktor-btn').forEach(btn => {
      const val = parseFloat(btn.dataset.val);
      btn.classList.toggle('btn-primary', Math.abs(val - naechster) < 0.01);
      btn.addEventListener('click', () => {
        localStorage.setItem(`kundentyp_${typ}`, val);
        row.querySelectorAll('.faktor-btn').forEach(b =>
          b.classList.toggle('btn-primary', b === btn));
        zeigeMeldung(`✅ ${info.label}: ${val === 0 ? 'deaktiviert' : 'Faktor ' + val}`);
      });
    });
  });
})();

// Jahreszeit-Dauer-Controls aufbauen
(function initJahreszeitTageSettings() {
  const container = document.getElementById('jahreszeit-tage-controls');
  if (!container) return;

  const aktuell = parseInt(localStorage.getItem('jahreszeitTage') ?? String(DEFAULT_JAHRESZEIT_TAGE), 10);

  JAHRESZEIT_TAGE_STUFEN.forEach(({ val, label }) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm faktor-btn';
    btn.textContent = label;
    btn.dataset.val = val;
    btn.classList.toggle('btn-primary', val === aktuell);
    btn.addEventListener('click', () => {
      localStorage.setItem('jahreszeitTage', val);
      container.querySelectorAll('.faktor-btn').forEach(b =>
        b.classList.toggle('btn-primary', b === btn));
      zeigeMeldung(`✅ Jahreszeit-Wechsel alle ${label}`);
    });
    container.appendChild(btn);
  });
})();

// Bewertungs-Chance-Controls aufbauen
(function initBewertungsChanceSettings() {
  const container = document.getElementById('bewertung-chance-controls');
  if (!container) return;

  const aktuell = parseFloat(localStorage.getItem('bewertungsChance') ?? String(DEFAULT_BEWERTUNGS_CHANCE));

  BEWERTUNG_CHANCE_STUFEN.forEach(({ val, label }) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm faktor-btn';
    btn.textContent = label;
    btn.dataset.val = val;
    btn.classList.toggle('btn-primary', Math.abs(val - aktuell) < 0.01);
    btn.addEventListener('click', () => {
      localStorage.setItem('bewertungsChance', val);
      container.querySelectorAll('.faktor-btn').forEach(b =>
        b.classList.toggle('btn-primary', b === btn));
      zeigeMeldung(`✅ Bewertungs-Häufigkeit: ${label}`);
    });
    container.appendChild(btn);
  });
})();

// Bewertungs-Stärke-Controls aufbauen
(function initBewertungsStaerkeSettings() {
  const container = document.getElementById('bewertung-staerke-controls');
  if (!container) return;

  const stufen = BEWERTUNG_STAERKE_STUFEN;
  const aktuell = parseFloat(localStorage.getItem('bewertungsStaerke') ?? '0.5');

  stufen.forEach(({ val, label }) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm faktor-btn';
    btn.textContent = label;
    btn.dataset.val = val;
    btn.classList.toggle('btn-primary', Math.abs(val - aktuell) < 0.01);
    btn.addEventListener('click', () => {
      localStorage.setItem('bewertungsStaerke', val);
      container.querySelectorAll('.faktor-btn').forEach(b =>
        b.classList.toggle('btn-primary', b === btn));
      zeigeMeldung(`✅ Bewertungs-Einfluss: ${label}`);
    });
    container.appendChild(btn);
  });
})();

// Trinkgeld-Settings initialisieren
(function initTrinkgeldSettings() {
  const CHANCE_STUFEN = TRINKGELD_CHANCE_STUFEN;
  const MAX_STUFEN = TRINKGELD_MAX_STUFEN;

  function wertzuIndex(wert, stufen) {
    let best = 0, bestDiff = Infinity;
    stufen.forEach((s, i) => {
      const d = Math.abs(s.val - wert);
      if (d < bestDiff) { bestDiff = d; best = i; }
    });
    return best;
  }

  // Toggle
  const toggle = document.getElementById('toggle-trinkgeld');
  toggle.checked = trinkgeldAktiv();
  const detailControls = document.getElementById('trinkgeld-detail-controls');
  detailControls.classList.toggle('hidden', !trinkgeldAktiv());

  toggle.addEventListener('change', () => {
    localStorage.setItem('trinkgeldAktiv', toggle.checked ? '1' : '0');
    detailControls.classList.toggle('hidden', !toggle.checked);
  });

  // Chance-Slider
  const chanceSlider = document.getElementById('slider-trinkgeld-chance');
  const chanceLabel  = document.getElementById('label-trinkgeld-chance');
  const startChanceIdx = wertzuIndex(trinkgeldBasisChance(), CHANCE_STUFEN);
  chanceSlider.value = startChanceIdx;
  chanceLabel.textContent = CHANCE_STUFEN[startChanceIdx].label;
  chanceSlider.addEventListener('input', () => {
    const idx = parseInt(chanceSlider.value, 10);
    localStorage.setItem('trinkgeldBasisChance', CHANCE_STUFEN[idx].val);
    chanceLabel.textContent = CHANCE_STUFEN[idx].label;
  });

  // Max-Betrag-Slider
  const maxSlider = document.getElementById('slider-trinkgeld-max');
  const maxLabel  = document.getElementById('label-trinkgeld-max');
  const startMaxIdx = wertzuIndex(trinkgeldMaxCent(), MAX_STUFEN);
  maxSlider.value = startMaxIdx;
  maxLabel.textContent = MAX_STUFEN[startMaxIdx].label;
  maxSlider.addEventListener('input', () => {
    const idx = parseInt(maxSlider.value, 10);
    localStorage.setItem('trinkgeldMaxCent', MAX_STUFEN[idx].val);
    maxLabel.textContent = MAX_STUFEN[idx].label;
  });
})();

// Großmarkt-Mindestgeld-Settings aufbauen
(function initGrossmarktSettings() {
  const aktuell = grossmarktMinGeld();
  document.querySelectorAll('.grossmarkt-min-btn').forEach(btn => {
    btn.classList.toggle('btn-primary', parseInt(btn.dataset.wert) === aktuell);
    btn.addEventListener('click', () => {
      const wert = parseInt(btn.dataset.wert);
      localStorage.setItem('grossmarktMinGeld', wert);
      document.querySelectorAll('.grossmarkt-min-btn').forEach(b =>
        b.classList.toggle('btn-primary', b === btn));
      zeigeMeldung(`✅ Großmarkt ab ${wert} €`);
    });
  });
})();

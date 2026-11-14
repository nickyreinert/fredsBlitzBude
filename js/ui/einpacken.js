'use strict';

/* ================================================================
   EINPACKEN – Lese-Profi-Modus
   Das Kind liest, was der Kunde sagt, und packt selbst die richtigen
   Produkte in der richtigen Menge ein. Erst danach kommt das Wechselgeld.
   Einschalten in den Einstellungen (Standard: aus).
   ================================================================ */

// Ausgewählte Mengen: { gurke: 2, erdbeere: 1 }
let einpackenAuswahl = {};
// Wie oft schon falsch eingepackt (für Hilfen)
let einpackenFehlversuche = 0;
// Wird aufgerufen, wenn richtig eingepackt wurde
let einpackenFertigCallback = null;

// Ist der Lese-Profi-Modus an?
function leseModusAktiv() {
  return localStorage.getItem('leseModus') === '1';
}

// Einpack-Schritt starten (zeigt Kundensatz + Produktauswahl, versteckt den Wechselgeld-Teil)
function starteEinpacken(kunde, onFertig) {
  einpackenAuswahl = {};
  einpackenFehlversuche = 0;
  einpackenFertigCallback = onFertig;

  // Was der Kunde gesagt hat – das muss das Kind lesen
  document.getElementById('einpacken-spruch').textContent = `„${kunde._sprache || einkaufText(kunde.einkaufsliste)}“`;

  // Alle Produkte, die gerade am Stand liegen, zur Auswahl anbieten
  const container = document.getElementById('einpacken-produkte');
  container.innerHTML = '';
  for (const [key, menge] of Object.entries(gameState.inventory)) {
    if (menge <= 0 || !PRODUKTE[key]) continue;
    const prod = PRODUKTE[key];
    const kachel = document.createElement('div');
    kachel.className = 'einpacken-kachel';
    kachel.dataset.key = key;
    kachel.innerHTML = `
      <div class="einpacken-emoji">${prod.emoji}</div>
      <div class="einpacken-name">${prod.name}</div>
      <div class="einpacken-stepper">
        <button class="btn einpacken-minus" data-key="${key}" aria-label="weniger">−</button>
        <span class="einpacken-menge" id="einpacken-menge-${key}">0</span>
        <button class="btn einpacken-plus" data-key="${key}" aria-label="mehr">+</button>
      </div>`;
    container.appendChild(kachel);
  }

  const fb = document.getElementById('einpacken-feedback');
  fb.className = 'hidden';
  document.getElementById('btn-einpacken').disabled = false;

  // Einpack-Teil zeigen, Wechselgeld-Teil verstecken
  document.getElementById('change-einpacken').classList.remove('hidden');
  document.getElementById('change-columns').classList.add('hidden');
  document.querySelector('.change-title').textContent = TEXTE.einpacken.titel;
}

// Einpack-Teil verstecken (z.B. wenn der Modus aus ist)
function versteckeEinpacken() {
  document.getElementById('change-einpacken').classList.add('hidden');
  document.getElementById('change-columns').classList.remove('hidden');
  document.querySelector('.change-title').textContent = TEXTE.wechselgeld.titel;
}

// Plus/Minus an einer Produkt-Kachel
function einpackenMengeAendern(key, delta) {
  const max = gameState.inventory[key] || 0;
  const neu = Math.min(max, Math.max(0, (einpackenAuswahl[key] || 0) + delta));
  einpackenAuswahl[key] = neu;
  document.getElementById(`einpacken-menge-${key}`).textContent = neu;
  const kachel = document.querySelector(`.einpacken-kachel[data-key="${key}"]`);
  kachel.classList.toggle('einpacken-kachel--gewaehlt', neu > 0);
  // Markierungen vom letzten Versuch entfernen, sobald geändert wird
  kachel.classList.remove('einpacken-kachel--richtig', 'einpacken-kachel--falsch');
  document.getElementById('einpacken-feedback').className = 'hidden';
}

// Prüfen, ob richtig eingepackt wurde
function pruefeEinpacken() {
  const kunde = gameState.currentCustomer;
  if (!kunde) return;

  // Soll-Mengen je Produkt (Frische egal – das Kind wählt nur Produkt und Anzahl)
  const soll = {};
  for (const pos of kunde.einkaufsliste) {
    soll[pos.prodKey] = (soll[pos.prodKey] || 0) + pos.menge;
  }

  const alleKeys = new Set([...Object.keys(soll), ...Object.keys(einpackenAuswahl)]);
  let allesRichtig = true;
  for (const key of alleKeys) {
    if ((soll[key] || 0) !== (einpackenAuswahl[key] || 0)) allesRichtig = false;
  }

  const fb = document.getElementById('einpacken-feedback');
  if (allesRichtig) {
    fb.className = 'feedback-correct';
    fb.textContent = TEXTE.einpacken.richtig;
    document.getElementById('btn-einpacken').disabled = true;
    setTimeout(() => {
      versteckeEinpacken();
      if (einpackenFertigCallback) einpackenFertigCallback();
    }, 900);
    return;
  }

  einpackenFehlversuche++;
  fb.className = 'feedback-wrong';
  fb.textContent = TEXTE.einpacken.falsch;

  // Ab dem 2. Fehlversuch helfen: richtige Kacheln grün, falsche rot markieren
  if (einpackenFehlversuche >= 2) {
    fb.textContent = TEXTE.einpacken.tipp;
    document.querySelectorAll('.einpacken-kachel').forEach(k => {
      const key = k.dataset.key;
      const gewaehlt = einpackenAuswahl[key] || 0;
      const sollMenge = soll[key] || 0;
      if (gewaehlt === 0 && sollMenge === 0) return;
      k.classList.toggle('einpacken-kachel--richtig', gewaehlt === sollMenge);
      k.classList.toggle('einpacken-kachel--falsch', gewaehlt !== sollMenge);
    });
  }
}

// Klicks auf Plus/Minus und den Einpacken-Knopf
document.getElementById('einpacken-produkte').addEventListener('click', (e) => {
  const btn = e.target.closest('.einpacken-minus, .einpacken-plus');
  if (!btn) return;
  einpackenMengeAendern(btn.dataset.key, btn.classList.contains('einpacken-plus') ? 1 : -1);
});
document.getElementById('btn-einpacken').addEventListener('click', pruefeEinpacken);

/* ================================================================
   Freds Gemüse-Laden – Spiellogik (Phase 1: Straßenstand)
   Vanilla JavaScript, kein Framework
   Kommentare auf Deutsch
   ================================================================ */

'use strict';

/* ================================================================
   SPIELZUSTAND
   ================================================================ */
const gameState = {
  money: 0,             // Startkapital in Euro – Fred beginnt mit leerer Kasse
  inventory: {
    gurke: 1            // Von Oma geschenkt bekommen
  },
  // Alter der Waren: { gurke: [2, 1, 1], apfel: [3] } = Tage seit Einlagerung pro Einheit
  inventarAlter: {
    gurke: [0]          // Startgurke ist frisch (Tag 0 = heute erhalten)
  },
  day: 1,               // Aktueller Tag (absolut)
  monat: 3,             // Aktueller Monat (1–12), Spielstart im März (Frühling)
  jahreszeit: 'fruehling', // fruehling | sommer | herbst | winter
  phase: 1,             // Spielphase (1 = Straßenstand)
  prices: {
    gurke: 0            // Noch nicht gesetzt
  },
  customers: [],        // Warteschlange für heutigen Tag
  currentCustomer: null,// Aktueller Kunde
  standOpen: false,     // Ist der Stand offen?
  customersServed: 0,   // Heute bediente Kunden
  dailyEarnings: 0,     // Heute verdientes Geld
  totalCustomers: 0,    // Wie viele Kunden heute kommen
  changeNeeded: 0,      // Wie viel Wechselgeld benötigt wird
  selectedCoins: [],    // Ausgewählte Münzen/Scheine für Wechselgeld
  sunX: 0,              // X-Position der Sonne (für Animation)
  animFrame: null,      // requestAnimationFrame Handle
  customerAnimY: 0,     // Animations-Y des Kunden (Einlaufen)
  customerVisible: false,
  customerWalking: false,
  walkStep: 0,          // Schrittzähler für Gehanimation
  passanten: [],        // Passanten die die Straße entlanglaufen
  passantenTimer: 0,    // Zeit bis zum nächsten Passanten (ms)
  tagesfortschritt: 0,  // 0.0–1.0: wie weit der Spieltag fortgeschritten ist
  tagesZeitSlot: 'morgen', // 'morgen' | 'mittag' | 'abend'
  // Bewertungssystem
  bewertungSumme: 0,    // Summe aller Bewertungen (jede Bewertung = 1–5 Sterne)
  bewertungAnzahl: 0,   // Anzahl der abgegebenen Bewertungen
  gesamtKunden: 0,      // Alle jemals bedienten Kunden (über alle Tage)
};

/* ================================================================
   KATALOG: Verfügbare Produkte, Münzen, Kunden-Emojis
   ================================================================ */

// Produkte mit Canvas-Zeicheninfos und Saisonverfügbarkeit
// saisons: Array der Jahreszeiten in denen das Produkt verfügbar ist
const PRODUKTE = {
  gurke:    { name: 'Gurke',     emoji: '🥒', farbe: '#4CAF50', form: 'gurke',    kaufPreis: 0,    saisons: ['fruehling', 'sommer'] },
  apfel:    { name: 'Apfel',     emoji: '🍎', farbe: '#f44336', form: 'apfel',    kaufPreis: 0.30, saisons: ['herbst', 'winter'] },
  banane:   { name: 'Banane',    emoji: '🍌', farbe: '#FFC107', form: 'banane',   kaufPreis: 0.20, saisons: ['sommer', 'herbst'] },
  tomate:   { name: 'Tomate',    emoji: '🍅', farbe: '#e53935', form: 'tomate',   kaufPreis: 0.40, saisons: ['sommer'] },
  karotte:  { name: 'Karotte',   emoji: '🥕', farbe: '#FF7043', form: 'karotte',  kaufPreis: 0.25, saisons: ['herbst', 'winter'] },
  erdbeere: { name: 'Erdbeere',  emoji: '🍓', farbe: '#e91e63', form: 'erdbeere', kaufPreis: 0.35, saisons: ['fruehling', 'sommer'] },
  kuerbis:  { name: 'Kürbis',    emoji: '🎃', farbe: '#FF6F00', form: 'kuerbis',  kaufPreis: 0.60, saisons: ['herbst'] },
  zitrone:  { name: 'Zitrone',   emoji: '🍋', farbe: '#FDD835', form: 'zitrone',  kaufPreis: 0.30, saisons: ['winter', 'fruehling'] },
};

/* ================================================================
   JAHRESZEITEN
   ================================================================ */

// Jahreszeiten: Farben, Name, Monate
const JAHRESZEITEN = {
  fruehling: {
    name: 'Frühling',
    emoji: '🌸',
    monate: [3, 4, 5],
    himmel:  ['#b3e5fc', '#e1f5fe'],   // hellblau
    horizont: '#aed581',               // hellgrün
    boden:   ['#8bc34a', '#33691e'],   // grün
    strasseRand: '#9ccc65',
  },
  sommer: {
    name: 'Sommer',
    emoji: '☀️',
    monate: [6, 7, 8],
    himmel:  ['#4fc3f7', '#b3e5fc'],   // kräftiges blau
    horizont: '#66bb6a',
    boden:   ['#4caf50', '#1b5e20'],   // sattgrün
    strasseRand: '#81c784',
  },
  herbst: {
    name: 'Herbst',
    emoji: '🍂',
    monate: [9, 10, 11],
    himmel:  ['#ffcc80', '#ffe0b2'],   // warm orange
    horizont: '#a1887f',
    boden:   ['#ff8f00', '#4e342e'],   // braun-orange
    strasseRand: '#d4a574',
  },
  winter: {
    name: 'Winter',
    emoji: '❄️',
    monate: [12, 1, 2],
    himmel:  ['#b0bec5', '#eceff1'],   // grau-weiß
    horizont: '#90a4ae',
    boden:   ['#e0e0e0', '#90a4ae'],   // schnee-grau
    strasseRand: '#bdbdbd',
  },
};

// Monat → Jahreszeit
function jahresZeitFuerMonat(monat) {
  for (const [key, jz] of Object.entries(JAHRESZEITEN)) {
    if (jz.monate.includes(monat)) return key;
  }
  return 'fruehling';
}

// Monatsnamen
const MONATSNAMEN = ['', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

// Geldeinheiten (Cent-Werte intern, Anzeige in €)
const GELDEINHEITEN = [
  { wert: 1,    anzeige: '1ct',  typ: 'coin' },
  { wert: 2,    anzeige: '2ct',  typ: 'coin' },
  { wert: 5,    anzeige: '5ct',  typ: 'coin' },
  { wert: 10,   anzeige: '10ct', typ: 'coin' },
  { wert: 20,   anzeige: '20ct', typ: 'coin' },
  { wert: 50,   anzeige: '50ct', typ: 'coin' },
  { wert: 100,  anzeige: '1 €',  typ: 'coin' },
  { wert: 200,  anzeige: '2 €',  typ: 'coin' },
  { wert: 500,  anzeige: '5 €',  typ: 'bill' },
  { wert: 1000, anzeige: '10 €', typ: 'bill' },
  { wert: 2000, anzeige: '20 €', typ: 'bill' },
];

// Kunden-Typen: werden als gezeichnete Figuren dargestellt (keine Emojis!)
// haut: Hautfarbe, haar: Haarfarbe, frisur: 'kurz'|'lang'|'glatze'|'zopf'|'locken'
const KUNDEN = [
  { name: 'Max',      haut: '#FFCC80', haar: '#5D4037', frisur: 'kurz'   },
  { name: 'Lisa',     haut: '#FFCC80', haar: '#FDD835', frisur: 'lang'   },
  { name: 'Opa Hans', haut: '#FFCCBC', haar: '#BDBDBD', frisur: 'kurz'   },
  { name: 'Emma',     haut: '#FFE0B2', haar: '#FF7043', frisur: 'zopf'   },
  { name: 'Tom',      haut: '#D7A57A', haar: '#212121', frisur: 'kurz'   },
  { name: 'Mia',      haut: '#FFCC80', haar: '#E91E63', frisur: 'locken' },
  { name: 'Ben',      haut: '#A1887F', haar: '#4E342E', frisur: 'kurz'   },
];

// Kundentypen: beeinflussen Budget (zahlt) und Häufigkeit
// budgetFaktor: multipliziert den normalen Zahlbetrag (z.B. 0.5 = zahlt nur kleine Beträge)
// haeufigkeitBasis: Grundgewicht für die Zufallsauswahl (1.0 = normal)
const KUNDENTYPEN = {
  kind:       { label: 'Kinder',      emoji: '🧒', budgetFaktor: 0.3,  haeufigkeitBasis: 1.0,
                beschreibung: 'Kleines Taschengeld, kommen aber oft' },
  jugend:     { label: 'Jugendliche', emoji: '🧑', budgetFaktor: 0.6,  haeufigkeitBasis: 1.0,
                beschreibung: 'Wenig Geld, kommen regelmäßig' },
  erwachsen:  { label: 'Erwachsene',  emoji: '👩', budgetFaktor: 1.0,  haeufigkeitBasis: 1.0,
                beschreibung: 'Standard – Referenz für alle anderen' },
  rentner:    { label: 'Rentner',     emoji: '👴', budgetFaktor: 0.8,  haeufigkeitBasis: 1.0,
                beschreibung: 'Haben Zeit, zahlen eher passend' },
  familie:    { label: 'Familien',    emoji: '👨‍👩‍👧', budgetFaktor: 1.5,  haeufigkeitBasis: 0.7,
                beschreibung: 'Kaufen mehr auf einmal, kommen seltener' },
  reich:      { label: 'Reiche',      emoji: '🤵', budgetFaktor: 3.0,  haeufigkeitBasis: 0.3,
                beschreibung: 'Zahlen immer mit großen Scheinen, kommen selten' },
  star:       { label: 'Stars',       emoji: '🌟', budgetFaktor: 5.0,  haeufigkeitBasis: 0.1,
                beschreibung: 'Extrem selten, zahlen immer viel zu viel!' },
};

// Tagesrhythmus: Multiplikator für Passanten-Frequenz (1.0 = normal)
// Morgen = langsam, Mittag = viel, Abend = langsam
const TAGESRHYTHMUS = {
  morgen:     { label: 'Morgen',    emoji: '🌅', stunden: '8–11 Uhr',  defaultFaktor: 0.6 },
  mittag:     { label: 'Mittag',    emoji: '☀️', stunden: '11–15 Uhr', defaultFaktor: 1.4 },
  abend:      { label: 'Abend',     emoji: '🌆', stunden: '15–18 Uhr', defaultFaktor: 0.8 },
};

// Tagesrhythmus-Faktoren aus localStorage lesen
function tagesrhythmusFaktor(slot) {
  const gespeichert = parseFloat(localStorage.getItem(`rhythmus_${slot}`));
  return isNaN(gespeichert) ? TAGESRHYTHMUS[slot].defaultFaktor : gespeichert;
}

// Häufigkeitsfaktor eines Kundentyps aus localStorage lesen
function kundentypFaktor(typ) {
  const gespeichert = parseFloat(localStorage.getItem(`kundentyp_${typ}`));
  return isNaN(gespeichert) ? KUNDENTYPEN[typ].haeufigkeitBasis : gespeichert;
}

// Zufälligen Kundentyp-Key auswählen (gewichtet nach Häufigkeit)
function zufaelligerKundentyp() {
  const eintraege = Object.entries(KUNDENTYPEN);
  const gewichte = eintraege.map(([typ]) => Math.max(0, kundentypFaktor(typ)));
  const gesamt = gewichte.reduce((a, b) => a + b, 0);
  if (gesamt === 0) return 'erwachsen';
  let rnd = Math.random() * gesamt;
  for (let i = 0; i < eintraege.length; i++) {
    rnd -= gewichte[i];
    if (rnd <= 0) return eintraege[i][0];
  }
  return 'erwachsen';
}

// Intro-Texte (mehrstufig)
const INTRO_SCHRITTE = [
  'Hallo! Ich bin Fred! 👋\nIch möchte einen Gemüse-Laden aufmachen!',
  'Meine Oma hat mir heute eine frische Gurke aus ihrem Garten gegeben. 🥒',
  'Ich stelle meinen Stand auf die Straße und verkaufe sie!\nDu kannst mir helfen, oder?',
  'Vergiss nicht: Du musst den richtigen Preis setzen und\nauch das Wechselgeld stimmen! 💶',
  'Los geht\'s! Viel Spaß! 🎉',
];

/* ================================================================
   CANVAS SETUP
   ================================================================ */
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Canvas-Größe an Fenstergröße anpassen
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', () => {
  resizeCanvas();
  // Nach Resize neu zeichnen
  if (gameState.standOpen || aktuellerScreen() === 'screen-stand') {
    zeichneSpielwelt();
  }
});

resizeCanvas();

/* ================================================================
   HILFSFUNKTIONEN
   ================================================================ */

// Aktuell sichtbaren Screen ermitteln
function aktuellerScreen() {
  const screens = document.querySelectorAll('.screen.active');
  return screens.length > 0 ? screens[0].id : null;
}

// Screen wechseln
function zeigeScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// Geldbetrag formatieren (Cent → "X,XX €")
function formatGeld(cent) {
  const euro = cent / 100;
  return euro.toFixed(2).replace('.', ',') + ' €';
}

// Euro-Zahl formatieren (Float → "X,XX €")
function formatEuro(betrag) {
  return betrag.toFixed(2).replace('.', ',') + ' €';
}

// Zufallszahl (min bis max inklusiv)
function zufall(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Array-Element zufällig wählen
function zufallsElement(arr) {
  return arr[zufall(0, arr.length - 1)];
}

// Kurze Verzögerung (Promise)
function warte(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ================================================================
   CANVAS ZEICHENFUNKTIONEN
   ================================================================ */

// Haupt-Zeichenfunktion für die Spielwelt
function zeichneSpielwelt() {
  const w = canvas.width;
  const h = canvas.height;

  // Hintergrund löschen
  ctx.clearRect(0, 0, w, h);

  // Himmel zeichnen
  zeichneHimmel(w, h);

  // Sonne
  zeichneSonne(w, h);

  // Wolken
  zeichneWolken(w, h);

  // Straße / Boden
  zeichneBoden(w, h);

  // Holzstand
  zeichneStand(w, h);

  // Produkte auf dem Stand – auch vor dem Öffnen anzeigen (Auslage sichtbar)
  const hatWaren = Object.values(gameState.inventory).some(v => v > 0);
  if (hatWaren) {
    zeichneProdukte(w, h);
  }

  // Passanten auf der Straße (inkl. stehendem Kaufkunden)
  zeichnePassanten(w, h);
}

// Himmel (Farbverlauf – saisonal eingefärbt)
function zeichneHimmel(w, h) {
  const jz = JAHRESZEITEN[gameState.jahreszeit] || JAHRESZEITEN.fruehling;
  const grad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
  grad.addColorStop(0, jz.himmel[0]);
  grad.addColorStop(1, jz.himmel[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h * 0.65);

  // Winter: Schneeflocken-Punkte im Himmel
  if (gameState.jahreszeit === 'winter') {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    // Feste Positionen basierend auf Tag (damit sie nicht flackern)
    const seed = gameState.day * 137;
    for (let i = 0; i < 18; i++) {
      const sx = ((seed * (i + 1) * 7919) % w);
      const sy = ((seed * (i + 3) * 6271) % (h * 0.55));
      const sr = 1.5 + (i % 3);
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Herbst: Blätter-Punkte
  if (gameState.jahreszeit === 'herbst') {
    const blaetter = ['🍂', '🍁'];
    const seed = gameState.day * 137;
    ctx.font = '14px serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    for (let i = 0; i < 6; i++) {
      const bx = ((seed * (i + 2) * 4001) % w);
      const by = ((seed * (i + 5) * 3307) % (h * 0.5));
      ctx.fillText(blaetter[i % 2], bx, by);
    }
  }
}

// Sonne (bewegt sich langsam von links nach rechts)
function zeichneSonne(w, h) {
  // Sonnenbahn: echter Bogen – links-unten → Mitte-oben → rechts-unten
  // sunX: 0 = Morgen (links), 1 = Abend (rechts)
  const t = gameState.sunX;
  const x = w * (0.05 + t * 0.90);                  // horizontal von 5% bis 95%
  const bogenHoehe = h * 0.55;                        // wie hoch der Bogen geht
  const grundY = h * 0.68;                            // Ausgangshöhe (am Horizont)
  const y = grundY - Math.sin(t * Math.PI) * bogenHoehe; // Sinus-Bogen
  const r = Math.min(w, h) * 0.055;

  // Strahlen
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#FFD54F';
  ctx.lineWidth = Math.max(2, r * 0.15);
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(r * 1.3, 0);
    ctx.lineTo(r * 1.9, 0);
    ctx.stroke();
  }
  ctx.restore();

  // Sonnenkreis
  const sunGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  sunGrad.addColorStop(0, '#FFF9C4');
  sunGrad.addColorStop(0.6, '#FFD54F');
  sunGrad.addColorStop(1, '#FFA000');
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = sunGrad;
  ctx.fill();
}

// Wolken (einfache Kreisgruppen)
function zeichneWolken(w, h) {
  const wolkenPositionen = [
    { x: w * 0.25, y: h * 0.08, size: 1.0 },
    { x: w * 0.65, y: h * 0.05, size: 0.7 },
    { x: w * 0.85, y: h * 0.11, size: 0.8 },
  ];

  wolkenPositionen.forEach(wolke => {
    zeichneWolke(wolke.x, wolke.y, wolke.size * Math.min(w, h) * 0.08);
  });
}

function zeichneWolke(x, y, r) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  // Wolke aus 5 Kreisen zusammengesetzt
  [[0, 0], [-r * 0.9, r * 0.3], [r * 0.9, r * 0.3], [-r * 0.5, -r * 0.3], [r * 0.5, -r * 0.2]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Boden: Gras + Straße (saisonal eingefärbt)
function zeichneBoden(w, h) {
  const bodenY = h * 0.65;
  const jz = JAHRESZEITEN[gameState.jahreszeit] || JAHRESZEITEN.fruehling;

  // Gras-Bereich mit Jahreszeit-Farben
  const grasGrad = ctx.createLinearGradient(0, bodenY, 0, h);
  grasGrad.addColorStop(0, jz.boden[0]);
  grasGrad.addColorStop(1, jz.boden[1]);
  ctx.fillStyle = grasGrad;
  ctx.fillRect(0, bodenY, w, h - bodenY);

  // Graslinie
  ctx.fillStyle = jz.boden[1];
  ctx.fillRect(0, bodenY, w, 4);

  // Winter: Schneedecke über dem Gras
  if (gameState.jahreszeit === 'winter') {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(0, bodenY, w, h * 0.07);
  }

  // Straße (grauer Bereich vorne)
  const strasseY = h * 0.78;
  ctx.fillStyle = '#9e9e9e';
  ctx.fillRect(0, strasseY, w, h - strasseY);

  // Straßenrand (saisonal)
  ctx.fillStyle = jz.strasseRand;
  ctx.fillRect(0, strasseY, w, 4);

  // Mittelstreifen
  ctx.fillStyle = '#ffee58';
  ctx.setLineDash([w * 0.05, w * 0.04]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffee58';
  ctx.beginPath();
  ctx.moveTo(0, strasseY + (h - strasseY) * 0.5);
  ctx.lineTo(w, strasseY + (h - strasseY) * 0.5);
  ctx.stroke();
  ctx.setLineDash([]);
}

// Holzstand (braunes Rechteck mit Dach)
function zeichneStand(w, h) {
  const standBreite  = Math.min(w * 0.6, 340);
  const standHoehe   = Math.min(h * 0.28, 180);
  const standX       = (w - standBreite) / 2;
  const standY       = h * 0.48;
  const theke        = standHoehe * 0.4; // Thekenhöhe

  // Schatten
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(w / 2, standY + standHoehe + 6, standBreite * 0.52, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Holz-Rückwand (dunkles Braun)
  const holzGrad = ctx.createLinearGradient(standX, standY, standX + standBreite, standY + standHoehe);
  holzGrad.addColorStop(0, '#8d6e63');
  holzGrad.addColorStop(1, '#5d4037');
  ctx.fillStyle = holzGrad;
  ctx.beginPath();
  ctx.roundRect(standX, standY, standBreite, standHoehe - theke, 8);
  ctx.fill();

  // Holzmaserung (horizontale Linien)
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) {
    const lineY = standY + (standHoehe - theke) * (i / 5);
    ctx.beginPath();
    ctx.moveTo(standX + 4, lineY);
    ctx.lineTo(standX + standBreite - 4, lineY);
    ctx.stroke();
  }

  // Theke (helleres Holz)
  const thekeGrad = ctx.createLinearGradient(standX, standY + standHoehe - theke, standX, standY + standHoehe);
  thekeGrad.addColorStop(0, '#a1887f');
  thekeGrad.addColorStop(1, '#795548');
  ctx.fillStyle = thekeGrad;
  ctx.beginPath();
  ctx.roundRect(standX - 10, standY + standHoehe - theke, standBreite + 20, theke, [0, 0, 8, 8]);
  ctx.fill();

  // Thekenkante (3D-Effekt)
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(standX - 10, standY + standHoehe - theke, standBreite + 20, 5);

  // Dach (rotes/orangefarbenes Dreieck)
  const dachUeberstand = standBreite * 0.15;
  ctx.fillStyle = '#e53935';
  ctx.beginPath();
  ctx.moveTo(standX - dachUeberstand, standY + 5);
  ctx.lineTo(w / 2, standY - standHoehe * 0.45);
  ctx.lineTo(standX + standBreite + dachUeberstand, standY + 5);
  ctx.closePath();
  ctx.fill();

  // Dachkante
  ctx.fillStyle = '#b71c1c';
  ctx.beginPath();
  ctx.moveTo(standX - dachUeberstand, standY + 5);
  ctx.lineTo(standX + standBreite + dachUeberstand, standY + 5);
  ctx.lineTo(standX + standBreite + dachUeberstand, standY + 12);
  ctx.lineTo(standX - dachUeberstand, standY + 12);
  ctx.closePath();
  ctx.fill();

  // Schild "Freds Laden"
  const schildBreite = standBreite * 0.55;
  const schildX = (w - schildBreite) / 2;
  const schildY = standY + (standHoehe - theke) * 0.15;
  const schildH = (standHoehe - theke) * 0.3;

  ctx.fillStyle = '#fff9c4';
  ctx.strokeStyle = '#f57f17';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(schildX, schildY, schildBreite, schildH, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#e65100';
  ctx.font = `bold ${Math.max(12, schildH * 0.55)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🥦 Freds Laden', w / 2, schildY + schildH / 2);

  // Speichere Stand-Koordinaten für Produkte
  gameState._stand = { x: standX, y: standY, b: standBreite, h: standHoehe, theke };
}

// Klickbereiche der Preisschilder (wird jeden Frame neu befüllt)
const preisschilderHitbox = []; // [{ key, x, y, w, h }, ...]

// Produkte auf dem Stand zeichnen (inkl. Preisschilder)
function zeichneProdukte(_w, _h) {
  if (!gameState._stand) return;
  const { x: sX, y: sY, b: sB, h: sH, theke } = gameState._stand;

  preisschilderHitbox.length = 0; // zurücksetzen

  const thekeY = sY + sH - theke * 0.5;
  let produktX = sX + sB * 0.15;
  const abstand = sB * 0.22;

  Object.entries(gameState.inventory).forEach(([key, menge]) => {
    if (menge <= 0) return;
    const prod = PRODUKTE[key];
    if (!prod) return;

    const px = produktX;
    const py = thekeY;
    const r  = Math.min(sB * 0.09, 24);

    switch (prod.form) {
      case 'gurke':    zeichneGurke(px, py, r);    break;
      case 'apfel':    zeichneApfel(px, py, r);    break;
      case 'banane':   zeichneBanane(px, py, r);   break;
      case 'tomate':   zeichneTomate(px, py, r);   break;
      case 'karotte':  zeichneKarotte(px, py, r);  break;
      case 'erdbeere': zeichneErdbeere(px, py, r); break;
      case 'kuerbis':  zeichneKuerbis(px, py, r);  break;
      case 'zitrone':  zeichneZitrone(px, py, r);  break;
      default:
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = prod.farbe;
        ctx.fill();
    }

    // Menge
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.font = `bold ${Math.max(11, r * 0.7)}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(`×${menge}`, px, py + r + 8);
    ctx.fillText(`×${menge}`, px, py + r + 8);

    // Frische-Punkte pro Einheit (nur wenn Verderb aktiv)
    if (haltbarkeitTage() > 0) {
      const auft = frischeProduktAufteilung(key);
      const punkteFarben = [
        ...Array(auft.gruen).fill('#4caf50'),
        ...Array(auft.orange).fill('#ff9800'),
        ...Array(auft.rot).fill('#f44336'),
      ];
      const punktR = Math.max(3, r * 0.22);
      const gesamt = punkteFarben.length;
      const startX = px - (gesamt - 1) * (punktR * 2.4) / 2;
      punkteFarben.forEach((farbe, i) => {
        const dotX = startX + i * (punktR * 2.4);
        const dotY = py - r - 6;
        ctx.beginPath();
        ctx.arc(dotX, dotY, punktR, 0, Math.PI * 2);
        ctx.fillStyle = farbe;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Preisschild unter dem Produkt zeichnen
    zeichnePreisschild(key, prod, px, py + r + 22, r);

    produktX += abstand;
  });
}

// Ein einzelnes Preisschild zeichnen und Hitbox speichern
function zeichnePreisschild(key, _prod, cx, topY, r) {
  const preis  = gameState.prices[key] || 0;
  const hatPreis = preis > 0;
  const preisText = hatPreis
    ? (keineKommazahlen ? `${Math.round(preis)} €` : formatEuro(preis))
    : '? €';

  const schildW = Math.max(r * 2.8, 52);
  const schildH = Math.max(r * 1.4, 26);
  const schildX = cx - schildW / 2;
  const schildY = topY;

  // Schild-Hintergrund (gelb wenn kein Preis, weiß wenn gesetzt)
  ctx.fillStyle   = hatPreis ? '#fff9e6' : '#fff3cd';
  ctx.strokeStyle = hatPreis ? '#f9a825' : '#ff8f00';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.roundRect(schildX, schildY, schildW, schildH, 6);
  ctx.fill();
  ctx.stroke();

  // Bleistift-Symbol (zeigt an: klickbar)
  const iconSize = Math.max(10, schildH * 0.45);
  ctx.font = `${iconSize}px serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('✏️', schildX + schildW - 4, schildY + schildH / 2);

  // Preis-Text
  ctx.fillStyle    = hatPreis ? '#e65100' : '#bf360c';
  ctx.font         = `bold ${Math.max(10, schildH * 0.5)}px system-ui`;
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(preisText, schildX + 5, schildY + schildH / 2);

  // Hitbox speichern
  preisschilderHitbox.push({ key, x: schildX, y: schildY, w: schildW, h: schildH });
}

// Preis-Popup: zeigt ein kleines Overlay-Input direkt über dem Schild
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

// Gurke als grünes Oval
function zeichneGurke(x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(0.6, 1);

  const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.3, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#a5d6a7');
  grad.addColorStop(0.5, '#4CAF50');
  grad.addColorStop(1, '#1b5e20');
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Glanzpunkt
  ctx.beginPath();
  ctx.arc(-r * 0.25, -r * 0.3, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fill();

  ctx.restore();

  // Stiel
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * 0.4, y - r * 1.5, x + r * 0.2, y - r * 1.8);
  ctx.stroke();
}

// Apfel als roter Kreis
function zeichneApfel(x, y, r) {
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  grad.addColorStop(0, '#ff8a80');
  grad.addColorStop(0.5, '#f44336');
  grad.addColorStop(1, '#b71c1c');
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Glanzpunkt
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fill();

  // Stiel
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * 0.5, y - r * 1.6, x + r * 0.3, y - r * 1.9);
  ctx.stroke();

  // Blatt
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.moveTo(x + r * 0.05, y - r * 1.2);
  ctx.quadraticCurveTo(x + r * 0.7, y - r * 1.5, x + r * 0.5, y - r * 0.9);
  ctx.quadraticCurveTo(x + r * 0.2, y - r * 1.1, x + r * 0.05, y - r * 1.2);
  ctx.fill();
}

// Banane als gebogenes gelbes Rechteck
function zeichneBanane(x, y, r) {
  ctx.save();
  ctx.translate(x, y);

  const grad = ctx.createLinearGradient(-r, -r * 0.3, r, r * 0.3);
  grad.addColorStop(0, '#fff9c4');
  grad.addColorStop(0.4, '#FFC107');
  grad.addColorStop(1, '#f57c00');
  ctx.strokeStyle = grad;
  ctx.lineWidth = r * 0.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, r * 0.5, r * 1.1, -Math.PI * 0.75, -Math.PI * 0.15);
  ctx.stroke();

  ctx.restore();
}

// Tomate: roter Kreis mit grünem Kelch oben
function zeichneTomate(x, y, r) {
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  grad.addColorStop(0, '#ff8a80');
  grad.addColorStop(0.5, '#e53935');
  grad.addColorStop(1, '#b71c1c');
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();
  // Kelchblätter oben
  ctx.fillStyle = '#388e3c';
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 0.85);
    ctx.quadraticCurveTo(
      x + Math.cos(a) * r * 0.6, y - r * 1.1 + Math.sin(a) * r * 0.3,
      x + Math.cos(a) * r * 0.4, y - r * 0.7
    );
    ctx.fill();
  }
}

// Karotte: oranges Dreieck mit grünem Blattschopf
function zeichneKarotte(x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  // Karotten-Körper
  const grad = ctx.createLinearGradient(0, -r, 0, r * 1.2);
  grad.addColorStop(0, '#FF8F00');
  grad.addColorStop(1, '#E65100');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-r * 0.55, -r * 0.6);
  ctx.lineTo(r * 0.55, -r * 0.6);
  ctx.lineTo(0, r * 1.1);
  ctx.closePath();
  ctx.fill();
  // Rillen
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const ly = -r * 0.3 + i * r * 0.4;
    const hw = r * 0.5 * (1 - (ly + r * 0.6) / (r * 1.7));
    ctx.beginPath();
    ctx.moveTo(-hw, ly);
    ctx.lineTo(hw, ly);
    ctx.stroke();
  }
  // Blattschopf
  ctx.fillStyle = '#43a047';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * r * 0.2, -r * 0.6);
    ctx.quadraticCurveTo(i * r * 0.5, -r * 1.7, i * r * 0.15, -r * 1.9);
    ctx.quadraticCurveTo(i * r * -0.2, -r * 1.6, i * r * 0.2, -r * 0.6);
    ctx.fill();
  }
  ctx.restore();
}

// Erdbeere: rotes Herz-Dreieck mit Punkten
function zeichneErdbeere(x, y, r) {
  const grad = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.1, x, y, r);
  grad.addColorStop(0, '#ff8a80');
  grad.addColorStop(0.5, '#e91e63');
  grad.addColorStop(1, '#880e4f');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x, y + r);
  ctx.quadraticCurveTo(x - r * 1.1, y, x - r * 0.6, y - r * 0.5);
  ctx.quadraticCurveTo(x - r * 0.1, y - r * 1.1, x, y - r * 0.6);
  ctx.quadraticCurveTo(x + r * 0.1, y - r * 1.1, x + r * 0.6, y - r * 0.5);
  ctx.quadraticCurveTo(x + r * 1.1, y, x, y + r);
  ctx.fill();
  // Kerne
  ctx.fillStyle = 'rgba(255,255,200,0.7)';
  [[-.3,-.1],[.3,-.1],[0,.3],[-.25,.45],[.25,.45]].forEach(([dx,dy]) => {
    ctx.beginPath();
    ctx.arc(x + dx * r, y + dy * r, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
  });
  // Blättchen
  ctx.fillStyle = '#2e7d32';
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.55);
  ctx.quadraticCurveTo(x - r * 0.5, y - r * 1.1, x - r * 0.3, y - r * 1.3);
  ctx.quadraticCurveTo(x, y - r * 0.9, x + r * 0.3, y - r * 1.3);
  ctx.quadraticCurveTo(x + r * 0.5, y - r * 1.1, x, y - r * 0.55);
  ctx.fill();
}

// Kürbis: orange mit Rippen
function zeichneKuerbis(x, y, r) {
  ctx.fillStyle = '#FF6F00';
  for (let i = -1; i <= 1; i++) {
    const cx = x + i * r * 0.55;
    const rx = r * (i === 0 ? 0.7 : 0.55);
    ctx.beginPath();
    ctx.ellipse(cx, y + r * 0.1, rx, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? '#FF8F00' : '#FF6F00';
    ctx.fill();
  }
  // Stiel
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = r * 0.25;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.75);
  ctx.quadraticCurveTo(x + r * 0.4, y - r * 1.3, x + r * 0.2, y - r * 1.5);
  ctx.stroke();
}

// Zitrone: gelbes Oval mit Spitzen
function zeichneZitrone(x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.3, 0.85);
  const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#fff9c4');
  grad.addColorStop(0.5, '#FDD835');
  grad.addColorStop(1, '#F9A825');
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-r * 0.25, -r * 0.3, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fill();
  ctx.restore();
  // Spitzen links/rechts
  ctx.fillStyle = '#F9A825';
  ctx.beginPath();
  ctx.ellipse(x - r * 1.2, y, r * 0.18, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 1.2, y, r * 0.18, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Strichmännchen als Kunde zeichnen
function zeichneKunde(w, _h) {
  const { x: sX } = gameState._stand || { x: w * 0.2 };

  // Kunde steht links vom Stand
  const kundeX = sX - Math.min(w * 0.12, 70);
  const kundeY = gameState.customerAnimY;

  const kopfR = Math.min(w * 0.035, 20);
  const koerperH = kopfR * 2.8;

  // Schatten
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(kundeX, kundeY + koerperH + kopfR + 5, kopfR * 0.9, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Körper
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = Math.max(2, kopfR * 0.25);
  ctx.lineCap = 'round';

  // Rumpf
  ctx.beginPath();
  ctx.moveTo(kundeX, kundeY + kopfR);
  ctx.lineTo(kundeX, kundeY + kopfR + koerperH);
  ctx.stroke();

  // Arme
  const armWinkel = Math.sin(gameState.walkStep * 0.15) * 0.3;
  ctx.beginPath();
  ctx.moveTo(kundeX, kundeY + kopfR + koerperH * 0.3);
  ctx.lineTo(kundeX - kopfR * 1.5 - armWinkel * kopfR, kundeY + kopfR + koerperH * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(kundeX, kundeY + kopfR + koerperH * 0.3);
  ctx.lineTo(kundeX + kopfR * 1.5 + armWinkel * kopfR, kundeY + kopfR + koerperH * 0.8);
  ctx.stroke();

  // Beine
  const beinWinkel = Math.sin(gameState.walkStep * 0.15) * 0.25;
  ctx.beginPath();
  ctx.moveTo(kundeX, kundeY + kopfR + koerperH);
  ctx.lineTo(kundeX - kopfR * 0.8 - beinWinkel * kopfR, kundeY + kopfR + koerperH * 1.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(kundeX, kundeY + kopfR + koerperH);
  ctx.lineTo(kundeX + kopfR * 0.8 + beinWinkel * kopfR, kundeY + kopfR + koerperH * 1.6);
  ctx.stroke();

  // Kopf
  const kunde = gameState.currentCustomer;
  if (kunde) {
    zeichneKopf(kundeX, kundeY, kopfR, kunde, false);
  } else {
    // Fallback: einfacher Kreis
    ctx.beginPath();
    ctx.arc(kundeX, kundeY, kopfR, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc80';
    ctx.fill();
    ctx.strokeStyle = '#5d4037';
    ctx.stroke();
  }
}

/* ================================================================
   PASSANTEN-SYSTEM
   ================================================================ */

// Einen neuen Passanten erzeugen (kommt von links oder rechts)
function neuerPassant() {
  const vonLinks = Math.random() < 0.5;
  const kd = zufallsElement(KUNDEN);
  // Manche Passanten bleiben stehen (potenzielle Kunden), die meisten laufen durch
  // Bleibt nur stehen wenn noch Kunden in der Queue sind und gerade keiner aktiv ist
  const kannKaufen = gameState.standOpen
    && gameState.customers.length > 0
    && !gameState.currentCustomer;
  const bleibtStehen = kannKaufen && Math.random() < 0.5;

  return {
    x:          vonLinks ? -60 : canvas.width + 60, // Startposition außerhalb
    richtung:   vonLinks ? 1 : -1,                  // 1 = rechts, -1 = links
    kunde:      kd,                                 // Kunden-Objekt (Aussehen, Name)
    walkStep:   Math.random() * Math.PI * 2,        // Zufälliger Start-Phase
    geschwindigkeit: 60 + Math.random() * 60,       // px pro Sekunde
    bleibtStehen,
    zielX:      null,   // wird gesetzt wenn der Passant am Stand anhält
    steht:      false,  // steht er gerade am Stand?
    stehtTimer: 0,      // wie lange schon steht er
    gespraechen: false, // hat er schon den Kaufdialog ausgelöst?
    groesse:    0.85 + Math.random() * 0.3, // leicht unterschiedliche Größen
  };
}

// Alle Passanten aktualisieren (Position, Verhalten)
function aktualisierePassanten(delta) {
  const w = canvas.width;
  const standMitteX = w / 2;
  const standBereich = w * 0.18; // Bereich links vom Stand wo sie stoppen

  // Tagesfortschritt aktualisieren (ein Spieltag dauert ~3 Minuten = 180 Sekunden)
  // Morgen: 0–33%, Mittag: 33–75%, Abend: 75–100%
  if (gameState.standOpen) {
    // Ein Spieltag dauert ~300 Sekunden (5 Minuten) Echtzeit
    gameState.tagesfortschritt = Math.min(1, gameState.tagesfortschritt + delta / 300000);
    const tf = gameState.tagesfortschritt;
    gameState.tagesZeitSlot = tf < 0.33 ? 'morgen' : tf < 0.75 ? 'mittag' : 'abend';
  }

  // Neuen Passanten spawnen – Frequenz abhängig von Tageszeit
  gameState.passantenTimer -= delta;
  if (gameState.passantenTimer <= 0 && gameState.standOpen) {
    gameState.passanten.push(neuerPassant());
    // Basis-Intervall: 4 Sekunden; Tagesrhythmus-Faktor verändert die Frequenz
    // Hoher Faktor = viele Kunden = kürzeres Intervall
    const faktor = tagesrhythmusFaktor(gameState.tagesZeitSlot);
    const basisIntervall = 4000;
    const intervall = basisIntervall / Math.max(0.1, faktor);
    gameState.passantenTimer = intervall * (0.7 + Math.random() * 0.6);
    // Spielstand regelmäßig speichern (inkl. Tagesfortschritt)
    speichereSpielstand();
  }

  // Jeden Passanten bewegen
  gameState.passanten = gameState.passanten.filter(p => {
    if (p.steht) {
      // Passant steht am Stand
      p.stehtTimer += delta;
      p.walkStep += delta * 0.001; // leicht schaukeln

      // Kaufdialog auslösen wenn noch kein Kunde aktiv und Queue nicht leer
      if (!p.gespraechen && !gameState.currentCustomer
          && gameState.customers.length > 0 && p.stehtTimer > 600) {
        p.gespraechen = true;
        passerWirdKunde(p);
      }

      // Weggehen wenn:
      // - zu lange gewartet (8s) ohne Kaufdialog
      // - oder: war Kaufkunde, Kauf ist abgeschlossen (currentCustomer !== dieser Passant)
      const istAktiverKunde = gameState.currentCustomer
        && gameState.currentCustomer.passantRef === p;
      const kaufAbgeschlossen = p.gespraechen && !istAktiverKunde
        && gameState.currentCustomer === null;
      // Sofort weggehen wenn keine Ware mehr verfügbar
      const keineWare = gameState.customers.length === 0 && !istAktiverKunde;
      const zuLangeGewartet = !p.gespraechen && (p.stehtTimer > 8000 || keineWare);
      if (kaufAbgeschlossen || zuLangeGewartet) {
        p.steht = false;
        p.gespraechen = false;
      }
      return true;
    }

    // Passant läuft
    p.walkStep += delta * 0.006;
    p.x += p.richtung * p.geschwindigkeit * (delta / 1000);

    // Prüfen ob er am Stand stehen bleiben soll
    if (p.bleibtStehen && !p.steht) {
      const stopX = standMitteX - standBereich * p.richtung;
      const erreicht = p.richtung === 1 ? p.x >= stopX : p.x <= stopX;
      if (erreicht) {
        p.x = stopX;
        p.steht = true;
        p.stehtTimer = 0;
        return true;
      }
    }

    // Passant der den Bildschirm verlassen hat entfernen
    const raus = p.richtung === 1 ? p.x > w + 80 : p.x < -80;
    return !raus;
  });
}

// Passant wird zum echten Kaufkunden
function passerWirdKunde(passant) {
  if (gameState.customers.length === 0) return;
  // Nächsten Kunden aus der Queue nehmen und mit diesem Passanten verknüpfen
  const kunde = gameState.customers.shift();
  if (!kunde) return;

  // Aussehen des Passanten auf den Queue-Kunden übertragen (selbe Person!)
  kunde.haut   = passant.kunde.haut;
  kunde.haar   = passant.kunde.haar;
  kunde.frisur = passant.kunde.frisur;
  kunde.name   = passant.kunde.name;

  gameState.currentCustomer = kunde;
  gameState.currentCustomer.passantRef = passant;
  // customerVisible bleibt false – der Passant selbst wird weiter gezeichnet
  gameState.customerVisible = false;
  setTimeout(zeigeKundenDialog, 400);
}

// Kopf einer Figur zeichnen (gezeichnet, kein Emoji)
// cx/cy = Mittelpunkt des Kopfes, r = Radius, kunde = Kunden-Objekt, gespiegelt = bool
function zeichneKopf(cx, cy, r, kunde, gespiegelt) {
  if (!kunde) return;

  // Kopfkreis
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = kunde.haut || '#FFCC80';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = r * 0.12;
  ctx.stroke();

  // Haare je nach Frisur
  ctx.fillStyle = kunde.haar || '#5D4037';
  const frisur = kunde.frisur || 'kurz';

  if (frisur === 'glatze') {
    // nichts
  } else if (frisur === 'kurz') {
    // kurze Kappe oben
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.1, r * 1.05, Math.PI * 1.1, Math.PI * 1.9);
    ctx.fill();
  } else if (frisur === 'lang') {
    // lange Haare: Kappe + seitliche Strähnen
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.1, r * 1.05, Math.PI * 1.1, Math.PI * 1.9);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(cx - r * 1.05, cy - r * 0.2, r * 0.35, r * 1.4, r * 0.15);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(cx + r * 0.7, cy - r * 0.2, r * 0.35, r * 1.4, r * 0.15);
    ctx.fill();
  } else if (frisur === 'zopf') {
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.1, r * 1.05, Math.PI * 1.1, Math.PI * 1.9);
    ctx.fill();
    // Zopf oben
    const zopfX = gespiegelt ? cx - r * 0.5 : cx + r * 0.5;
    ctx.beginPath();
    ctx.arc(zopfX, cy - r * 0.85, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  } else if (frisur === 'locken') {
    // Lockige Kappe aus mehreren kleinen Kreisen
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI + (i / 5) * Math.PI;
      const lx = cx + Math.cos(angle) * r * 0.85;
      const ly = cy + Math.sin(angle) * r * 0.85;
      ctx.beginPath();
      ctx.arc(lx, ly, r * 0.42, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Augen
  ctx.fillStyle = '#333';
  const augeAbstand = r * 0.35;
  ctx.beginPath();
  ctx.arc(cx - augeAbstand, cy - r * 0.1, r * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + augeAbstand, cy - r * 0.1, r * 0.13, 0, Math.PI * 2);
  ctx.fill();

  // Mund (kleines Lächeln)
  ctx.beginPath();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = r * 0.1;
  ctx.arc(cx, cy + r * 0.2, r * 0.28, 0.1, Math.PI - 0.1);
  ctx.stroke();
}

// Einen einzelnen Passanten zeichnen
function zeichnePassant(p, w, h) {
  const strasseY = h * 0.84; // auf der Straße
  const x = p.x;
  const y = strasseY;
  const scale = p.groesse;
  const kopfR = Math.min(w * 0.032, 18) * scale;
  const koerperH = kopfR * 2.6;

  // Schatten
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.beginPath();
  ctx.ellipse(x, y + koerperH + kopfR + 3, kopfR * 0.85, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gehanimation: Beine und Arme schwingen
  const schwung = p.steht ? Math.sin(p.walkStep * 2) * 0.06 : Math.sin(p.walkStep) * 0.3;

  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = Math.max(1.5, kopfR * 0.22);
  ctx.lineCap = 'round';

  // Rumpf
  ctx.beginPath();
  ctx.moveTo(x, y + kopfR * 0.8);
  ctx.lineTo(x, y + kopfR * 0.8 + koerperH);
  ctx.stroke();

  // Arme
  ctx.beginPath();
  ctx.moveTo(x, y + kopfR + koerperH * 0.25);
  ctx.lineTo(x - kopfR * 1.4 - schwung * kopfR * p.richtung, y + kopfR + koerperH * 0.75);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + kopfR + koerperH * 0.25);
  ctx.lineTo(x + kopfR * 1.4 + schwung * kopfR * p.richtung, y + kopfR + koerperH * 0.75);
  ctx.stroke();

  // Beine
  ctx.beginPath();
  ctx.moveTo(x, y + kopfR * 0.8 + koerperH);
  ctx.lineTo(x - kopfR * 0.7 - schwung * kopfR, y + kopfR * 0.8 + koerperH * 1.55);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + kopfR * 0.8 + koerperH);
  ctx.lineTo(x + kopfR * 0.7 + schwung * kopfR, y + kopfR * 0.8 + koerperH * 1.55);
  ctx.stroke();

  // Kopf: sitzt oben auf dem Körper
  const kopfY = y - kopfR * 0.5;
  zeichneKopf(x, kopfY, kopfR, p.kunde, p.richtung === -1);

  // Sprechblase nur wenn Passant steht, noch kein Dialog läuft UND noch Ware da ist
  if (p.steht && !p.gespraechen && p.stehtTimer > 400
      && gameState.customers.length > 0) {
    // Blase über dem Kopf, nach innen versetzt damit sie nicht abgeschnitten wird
    const blasenW = 44;
    const blasenH = 26;
    let blasenX = x + (p.richtung === 1 ? kopfR * 2.5 : -kopfR * 2.5);
    let blasenY = kopfY - kopfR - blasenH - 4;
    // Innerhalb des Canvas halten
    blasenX = Math.max(blasenW / 2 + 4, Math.min(canvas.width - blasenW / 2 - 4, blasenX));
    blasenY = Math.max(80, blasenY); // nicht hinter HUD
    ctx.fillStyle = '#fff9c4';
    ctx.strokeStyle = '#f9a825';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(blasenX - blasenW / 2, blasenY, blasenW, blasenH, 8);
    ctx.fill();
    ctx.stroke();
    ctx.font = `${kopfR * 1.1}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛒', blasenX, blasenY + blasenH / 2);
  }
}

// Alle Passanten zeichnen
function zeichnePassanten(w, h) {
  gameState.passanten.forEach(p => zeichnePassant(p, w, h));
}

/* ================================================================
   ANIMATIONS-SCHLEIFE
   ================================================================ */

let letzterZeitstempel = 0;

function animationsSchleife(zeitstempel) {
  const delta = zeitstempel - letzterZeitstempel;
  letzterZeitstempel = zeitstempel;

  // Sonne synchron mit Tagesfortschritt bewegen
  // Wenn Stand offen: tagesfortschritt steuert (wird in aktualisierePassanten gesetzt)
  // Wenn Stand noch zu: sunX eigenständig animieren bis Stand öffnet
  if (!gameState.standOpen) {
    gameState.sunX += delta * 0.000003;
    if (gameState.sunX > 1) gameState.sunX = 0;
  } else {
    gameState.sunX = gameState.tagesfortschritt;
  }

  // Passanten bewegen
  aktualisierePassanten(delta);

  // Leichte Schaukel-Animation beim aktiven Kunden
  if (gameState.customerVisible && !gameState.customerWalking) {
    gameState.walkStep += delta * 0.003;
  }

  // Spielwelt neu zeichnen
  zeichneSpielwelt();

  // HUD-Uhr aktualisieren: Fortschritt = Tagesfortschritt (0–1)
  if (gameState.standOpen) {
    zeichneHudUhr(gameState.tagesfortschritt);
    // Tageszeit-Slot-Emoji in der Tag-Anzeige
    const slot = gameState.tagesZeitSlot;
    const slotEmoji = TAGESRHYTHMUS[slot]?.emoji ?? '';
    const jz2 = JAHRESZEITEN[gameState.jahreszeit] || JAHRESZEITEN.fruehling;
    document.getElementById('hud-day').textContent =
      `${gameState.day} – ${MONATSNAMEN[gameState.monat]} ${jz2.emoji} ${slotEmoji}`;
  }

  // Schleife fortsetzen
  gameState.animFrame = requestAnimationFrame(animationsSchleife);
}

// Animation starten
function starteAnimation() {
  if (gameState.animFrame) cancelAnimationFrame(gameState.animFrame);
  letzterZeitstempel = performance.now();
  gameState.animFrame = requestAnimationFrame(animationsSchleife);
}

// Animation stoppen
function stoppeAnimation() {
  if (gameState.animFrame) {
    cancelAnimationFrame(gameState.animFrame);
    gameState.animFrame = null;
  }
}

/* ================================================================
   HUD AKTUALISIEREN
   ================================================================ */

function aktualisiereHUD() {
  document.getElementById('hud-money').textContent     = keineKommazahlen
    ? `${Math.round(gameState.money)} €`
    : formatEuro(gameState.money);
  // Tag + Monat + Jahreszeit-Emoji
  const jz = JAHRESZEITEN[gameState.jahreszeit] || JAHRESZEITEN.fruehling;
  document.getElementById('hud-day').textContent =
    `${gameState.day} – ${MONATSNAMEN[gameState.monat]} ${jz.emoji}`;
  // Kunden-Zähler: bedient / (bedient + noch in Queue)
  const gesamt = gameState.customersServed + gameState.customers.length;
  document.getElementById('hud-customers').textContent =
    `${gameState.customersServed}/${gesamt}`;

  // Sterne-Anzeige
  const avg = durchschnittsBewertung();
  const sterneEl = document.getElementById('hud-stars');
  const gesamtEl = document.getElementById('hud-total-customers');
  if (avg === null) {
    sterneEl.textContent = '–';
  } else {
    // Halbe Sterne: ★ = voll, ⯨ = halb, ☆ = leer
    const voll  = Math.floor(avg);
    const halb  = avg - voll >= 0.5 ? 1 : 0;
    const leer  = 5 - voll - halb;
    sterneEl.textContent = '★'.repeat(voll) + (halb ? '½' : '') + '☆'.repeat(leer)
      + ` ${avg.toFixed(1)}`;
  }
  gesamtEl.textContent = gameState.gesamtKunden > 0
    ? `${gameState.gesamtKunden} Bewertungen`
    : '';
}

/* ================================================================
   HUD-UHR
   ================================================================ */

const clockCanvas = document.getElementById('hud-clock');
const clockCtx    = clockCanvas.getContext('2d');

// Zeichnet eine analoge Uhr die den Tagesfortschritt anzeigt.
// fortschritt: 0.0 (Tagesbeginn) bis 1.0 (Tagesende)
function zeichneHudUhr(fortschritt) {
  const w  = clockCanvas.width;
  const h  = clockCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const r  = w / 2 - 3;

  clockCtx.clearRect(0, 0, w, h);

  // Zifferblatt-Hintergrund
  clockCtx.beginPath();
  clockCtx.arc(cx, cy, r, 0, Math.PI * 2);
  clockCtx.fillStyle = '#fffde7';
  clockCtx.fill();
  clockCtx.strokeStyle = '#f9a825';
  clockCtx.lineWidth = 3;
  clockCtx.stroke();

  // Farbiger Fortschritts-Bogen (von 12 Uhr im Uhrzeigersinn)
  const startWinkel = -Math.PI / 2; // 12 Uhr
  const endWinkel   = startWinkel + fortschritt * Math.PI * 2;
  clockCtx.beginPath();
  clockCtx.moveTo(cx, cy);
  clockCtx.arc(cx, cy, r - 4, startWinkel, endWinkel);
  clockCtx.closePath();
  // Farbe: grün am Anfang, wird orange/rot wenn Tag fast vorbei
  const rot   = Math.round(76  + fortschritt * (229 - 76));
  const gruen = Math.round(175 + fortschritt * (57  - 175));
  clockCtx.fillStyle = `rgb(${rot},${gruen},50)`;
  clockCtx.fill();

  // Stunden-Markierungen (12 kleine Striche)
  clockCtx.strokeStyle = '#bbb';
  clockCtx.lineWidth = 1.5;
  for (let i = 0; i < 12; i++) {
    const a  = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + Math.cos(a) * (r - 3);
    const y1 = cy + Math.sin(a) * (r - 3);
    const x2 = cx + Math.cos(a) * (r - 8);
    const y2 = cy + Math.sin(a) * (r - 8);
    clockCtx.beginPath();
    clockCtx.moveTo(x1, y1);
    clockCtx.lineTo(x2, y2);
    clockCtx.stroke();
  }

  // Zeiger: zeigt auf den aktuellen Fortschritt
  const zeigerWinkel = startWinkel + fortschritt * Math.PI * 2;
  const zeigerLaenge = r * 0.62;
  clockCtx.strokeStyle = '#e53935';
  clockCtx.lineWidth = 3;
  clockCtx.lineCap = 'round';
  clockCtx.beginPath();
  clockCtx.moveTo(cx, cy);
  clockCtx.lineTo(
    cx + Math.cos(zeigerWinkel) * zeigerLaenge,
    cy + Math.sin(zeigerWinkel) * zeigerLaenge
  );
  clockCtx.stroke();

  // Mittelpunkt
  clockCtx.beginPath();
  clockCtx.arc(cx, cy, 3.5, 0, Math.PI * 2);
  clockCtx.fillStyle = '#e53935';
  clockCtx.fill();
}

/* ================================================================
   INVENTAR-PANEL AUFBAUEN
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

/* ================================================================
   INTRO-ABLAUF
   ================================================================ */

let introSchritt = 0;

function starteIntro() {
  introSchritt = 0;
  zeigeIntroSchritt();
  zeigeScreen('screen-intro');
}

function zeigeIntroSchritt() {
  const textEl = document.getElementById('intro-text');
  const text = INTRO_SCHRITTE[introSchritt];
  // Zeilenumbrüche in HTML umwandeln
  textEl.innerHTML = text.replace(/\n/g, '<br>');
}

/* ================================================================
   TAG STARTEN
   ================================================================ */

// Spielstand speichern (wird bei jedem Tagesbeginn aufgerufen)
function speichereSpielstand() {
  const stand = {
    money:            gameState.money,
    inventory:        gameState.inventory,
    inventarAlter:    gameState.inventarAlter,
    day:              gameState.day,
    monat:            gameState.monat,
    jahreszeit:       gameState.jahreszeit,
    phase:            gameState.phase,
    prices:           gameState.prices,
    // Tagesfortschritt und Stand-Zustand mitspecihern
    tagesfortschritt: gameState.tagesfortschritt,
    tagesZeitSlot:    gameState.tagesZeitSlot,
    standOpen:        gameState.standOpen,
    customersServed:  gameState.customersServed,
    dailyEarnings:    gameState.dailyEarnings,
    customers:        gameState.customers,
    bewertungSumme:   gameState.bewertungSumme,
    bewertungAnzahl:  gameState.bewertungAnzahl,
    gesamtKunden:     gameState.gesamtKunden,
  };
  localStorage.setItem('spielstand', JSON.stringify(stand));
}

// Spielstand laden – gibt true zurück wenn Daten vorhanden
function ladeSpielstand() {
  const raw = localStorage.getItem('spielstand');
  if (!raw) return false;
  try {
    const stand = JSON.parse(raw);
    gameState.money            = stand.money            ?? 0;
    gameState.inventory        = stand.inventory         ?? { gurke: 1 };
    gameState.inventarAlter    = stand.inventarAlter     ?? { gurke: [0] };
    gameState.day              = stand.day               ?? 1;
    gameState.monat            = stand.monat             ?? 3;
    gameState.jahreszeit       = stand.jahreszeit        ?? 'fruehling';
    gameState.phase            = stand.phase             ?? 1;
    gameState.prices           = stand.prices            ?? { gurke: 0 };
    gameState.tagesfortschritt = stand.tagesfortschritt  ?? 0;
    gameState.tagesZeitSlot    = stand.tagesZeitSlot     ?? 'morgen';
    gameState.standOpen        = stand.standOpen         ?? false;
    gameState.customersServed  = stand.customersServed   ?? 0;
    gameState.dailyEarnings    = stand.dailyEarnings     ?? 0;
    gameState.customers        = stand.customers         ?? [];
    gameState.bewertungSumme   = stand.bewertungSumme    ?? 0;
    gameState.bewertungAnzahl  = stand.bewertungAnzahl   ?? 0;
    gameState.gesamtKunden     = stand.gesamtKunden      ?? 0;
    return true;
  } catch {
    return false;
  }
}

function starteTag() {
  // Monat und Jahreszeit synchronisieren
  aktualisiereZeit();

  // War der Stand beim letzten Speichern bereits geöffnet? (z.B. nach Reload)
  const standWarOffen = gameState.standOpen;

  // Nur zurücksetzen wenn frischer Tagesbeginn (nicht Reload mitten im Tag)
  if (!standWarOffen) {
    gameState.totalCustomers  = 0;
    gameState.customersServed = 0;
    gameState.dailyEarnings   = 0;
    gameState.customers       = [];
    gameState.tagesfortschritt = 0;
    gameState.tagesZeitSlot    = 'morgen';
  }

  // Sonne mit Tagesfortschritt synchronisieren
  gameState.sunX = gameState.tagesfortschritt;

  // HUD aktualisieren
  aktualisiereHUD();

  // Inventar-Panel aufbauen
  bauInventarPanel();

  // Panels je nach Zustand einblenden
  document.getElementById('panel-customer').classList.add('hidden');
  document.getElementById('customer-payment-info').classList.add('hidden');
  document.getElementById('overlay-night').classList.add('hidden');

  if (standWarOffen) {
    // Stand war offen: Inventar-Panel ausblenden, Feierabend-Button zeigen
    document.getElementById('panel-inventory').classList.add('hidden');
    document.getElementById('btn-feierabend').classList.remove('hidden');
  } else {
    document.getElementById('panel-inventory').classList.remove('hidden');
    document.getElementById('btn-feierabend').classList.add('hidden');
  }

  // Uhr auf gespeicherten Fortschritt setzen
  zeichneHudUhr(gameState.tagesfortschritt);

  // Kein Kunde sichtbar, keine Animation
  gameState.customerVisible  = false;
  gameState.customerWalking  = false;
  gameState.currentCustomer  = null;
  // Passanten zurücksetzen (Passanten selbst können nicht sinnvoll gespeichert werden)
  gameState.passanten      = [];
  gameState.passantenTimer = 2000;

  speichereSpielstand();
  zeigeScreen('screen-stand');
  starteAnimation();
}

// Zufällige Kunden-Liste generieren
function generiereKunden(anzahl) {
  const liste = [];
  // Inventar-Kopie zum Simulieren (damit nicht mehr verkauft wird als vorrätig)
  const simuliertesInventar = { ...gameState.inventory };

  for (let i = 0; i < anzahl; i++) {
    const kd = zufallsElement(KUNDEN);
    // Welches Produkt kauft der Kunde? – nur was noch simuliert vorrätig ist
    const verfuegbar = Object.entries(simuliertesInventar).filter(
      ([k, v]) => v > 0 && gameState.prices[k] > 0
    );
    if (verfuegbar.length === 0) break; // nichts mehr auf Lager

    const [prodKey] = zufallsElement(verfuegbar);
    simuliertesInventar[prodKey]--; // simuliert einen Verkauf
    // Bei "Einfaches Rechnen": Preis auf ganze Euro runden
    let preis = gameState.prices[prodKey];
    if (keineKommazahlen) preis = Math.max(1, Math.round(preis));

    // Kundentyp bestimmen – muss sich den Preis leisten können
    // Maximal 3 Versuche, sonst Fallback auf Erwachsene
    const preisCent = Math.round(preis * 100);
    let typKey, typ, alleBetraege;
    for (let versuch = 0; versuch < 3; versuch++) {
      typKey = zufaelligerKundentyp();
      typ    = KUNDENTYPEN[typKey];
      if (typ.budgetFaktor >= 4.0) {
        alleBetraege = [5000, 10000];
      } else if (typ.budgetFaktor >= 2.0) {
        alleBetraege = [1000, 2000, 5000];
      } else if (typ.budgetFaktor >= 1.0) {
        alleBetraege = [200, 500, 1000, 2000];
      } else if (typ.budgetFaktor >= 0.5) {
        alleBetraege = [100, 200, 500];
      } else {
        alleBetraege = [50, 100, 200];
      }
      // Kann dieser Typ den Preis bezahlen? Wenn ja, Typ verwenden
      if (alleBetraege.some(b => b >= preisCent)) break;
      // Zu wenig Budget – nochmal würfeln (letzter Versuch: Erwachsene als Fallback)
      if (versuch === 2) { typKey = 'erwachsen'; typ = KUNDENTYPEN.erwachsen; alleBetraege = [200, 500, 1000, 2000]; }
    }

    const moeglicheBetraege = alleBetraege.filter(b => b >= preisCent);
    let zahlt;
    if (moeglicheBetraege.length === 0) {
      // Sollte nicht mehr vorkommen, aber als Sicherheit
      zahlt = [...alleBetraege].sort((a, b) => b - a).find(b => b >= preisCent) ?? 2000;
    } else if (moeglicheBetraege.length === 1) {
      zahlt = moeglicheBetraege[0];
    } else {
      // Meistens kleinsten passenden Schein, manchmal einen größeren
      const index = Math.random() < 0.65 ? 0 : zufall(1, moeglicheBetraege.length - 1);
      zahlt = moeglicheBetraege[index];
    }

    // Unfreundliche Kunden: nur Reiche und Stars, ca. 50% Chance
    const kannUnfreundlich = typKey === 'reich' || typKey === 'star';
    const istUnfreundlich  = kannUnfreundlich && Math.random() < 0.5;

    liste.push({
      haut:          kd.haut,
      haar:          kd.haar,
      frisur:        kd.frisur,
      name:          kd.name,
      typKey,                      // Kundentyp-Key (z.B. 'kind', 'reich')
      typLabel:      typ.label,    // Anzeigename
      typEmoji:      typ.emoji,    // Emoji für diesen Typ
      unfreundlich:  istUnfreundlich,
      produkt:       prodKey,
      preis:         preis,        // in Euro
      zahlt:         zahlt / 100,  // in Euro
      wechsel:       zahlt / 100 - preis,
    });
  }
  return liste;
}

/* ================================================================
   PREISBASIERTE KUNDENANZAHL
   ================================================================ */

// Aktuelle Durchschnittsbewertung (1–5), oder null wenn noch keine Bewertung
function durchschnittsBewertung() {
  if (gameState.bewertungAnzahl === 0) return null;
  return gameState.bewertungSumme / gameState.bewertungAnzahl;
}

// Berechnet den Kunden-Multiplikator aus der Bewertung.
// 5 Sterne = +stärke, 1 Stern = -stärke, 3 Sterne = neutral
// Stärke aus Settings (Standard 0.5 = ±50%)
function bewertungsFaktor() {
  const avg = durchschnittsBewertung();
  if (avg === null) return 1.0; // Noch keine Bewertung = kein Effekt
  const staerke = parseFloat(localStorage.getItem('bewertungsStaerke') ?? '0.5');
  // Lineare Interpolation: 1 Stern → (1 - stärke), 3 Sterne → 1.0, 5 Sterne → (1 + stärke)
  return 1.0 + ((avg - 3) / 2) * staerke;
}

// Bewertung nach Transaktion vergeben
// diff: Differenz in Cent (positiv = zu viel gegeben, 0 = genau, negativ = zu wenig)
function vergebeKundenBewertung(diffCent) {
  let sterne;
  if (diffCent === 0) {
    sterne = 4; // Genau richtig = 4 Sterne
  } else if (diffCent > 0) {
    // Zu viel gegeben – großzügig = 5 Sterne (egal wie viel)
    sterne = 5;
  } else {
    // Zu wenig gegeben: je nach wie viel zu wenig
    const zuWenig = -diffCent;
    if (zuWenig <= 10)       sterne = 3; // ≤10 Cent: noch okay
    else if (zuWenig <= 50)  sterne = 2;
    else                     sterne = 1;
  }
  gameState.bewertungSumme  += sterne;
  gameState.bewertungAnzahl += 1;
  gameState.gesamtKunden    += 1;
  aktualisiereHUD();
  speichereSpielstand();
  return sterne;
}

// Berechnet wie viele Kunden kommen basierend auf den gesetzten Preisen.
// Fairer Preis (Referenz ~1,50€) = 4-6 Kunden; teuer = weniger; billig = mehr.
function berechneKundenAnzahl() {
  // Durchschnittspreis aller Produkte mit Preis > 0 und Lagerbestand > 0
  const preise = Object.entries(gameState.prices)
    .filter(([k, v]) => v > 0 && (gameState.inventory[k] || 0) > 0)
    .map(([, v]) => v);

  if (preise.length === 0) return zufall(3, 5);

  const durchschnitt = preise.reduce((a, b) => a + b, 0) / preise.length;

  // Referenzpreis: 1,50€ → ~5 Kunden (Basis)
  // Teurer (+1€) → ~1 Kunden weniger; günstiger (-1€) → ~2 mehr
  // Bereich: min 1, max 8
  const basis = 5;
  const abweichung = durchschnitt - 1.50;
  const rohAnzahl = basis - abweichung * 1.5;
  const anzahlPreis = Math.round(Math.min(8, Math.max(1, rohAnzahl)));

  // Bewertungs-Faktor anwenden
  const anzahl = Math.round(anzahlPreis * bewertungsFaktor());

  // Kleines Zufallsrauschen ±1
  return Math.max(1, anzahl + zufall(-1, 1));
}

/* ================================================================
   STAND ÖFFNEN
   ================================================================ */

function oeffneStand() {
  // Prüfen ob mindestens ein Preis gesetzt ist
  const hatPreis = Object.entries(gameState.inventory).some(
    ([k, v]) => v > 0 && gameState.prices[k] > 0
  );

  if (!hatPreis) {
    // Hinweis: Preis muss gesetzt werden
    const btn = document.getElementById('btn-open-stand');
    btn.textContent = '⚠️ Bitte Preis eingeben!';
    btn.style.background = 'linear-gradient(180deg,#ef9a9a,#e53935)';
    setTimeout(() => {
      btn.textContent = '🏪 Stand öffnen!';
      btn.style.background = '';
    }, 2000);
    return;
  }

  gameState.standOpen = true;

  // Kunden jetzt generieren – Preise sind jetzt bekannt
  // Je höher der Durchschnittspreis, desto weniger Kunden kommen
  const anzahl = berechneKundenAnzahl();
  gameState.customers = generiereKunden(anzahl);
  gameState.totalCustomers = gameState.customers.length;
  aktualisiereHUD();

  // Inventar-Panel ausblenden
  document.getElementById('panel-inventory').classList.add('hidden');

  // Ersten Passanten nach 3 Sekunden; Tagesfortschritt zurücksetzen
  gameState.passantenTimer    = 3000;
  gameState.tagesfortschritt  = 0;
  gameState.tagesZeitSlot     = 'morgen';

  // Feierabend-Button anzeigen
  document.getElementById('btn-feierabend').classList.remove('hidden');
}

/* ================================================================
   KUNDEN-ABLAUF
   ================================================================ */

function naechsterKunde() {
  if (gameState.customers.length === 0) {
    // Queue leer – aber noch Passanten unterwegs die kaufen könnten?
    // Warten bis alle stehenden Passanten abgefertigt sind, dann Tag beenden
    const nochKaufer = gameState.passanten.some(p => p.steht || p.bleibtStehen);
    if (!nochKaufer) {
      // Kurze Pause dann Tag-Ende (damit letzter Kauf noch sichtbar ist)
      setTimeout(() => {
        if (gameState.customers.length === 0 && !gameState.currentCustomer) {
          tagesEnde();
        }
      }, 3000);
    }
    // Sonst warten – passerWirdKunde() läuft noch
  }
}

// Kundendialog nach Einlauf-Animation einblenden
function zeigeKundenDialog() {
  const kunde = gameState.currentCustomer;
  if (!kunde) return;

  const prod = PRODUKTE[kunde.produkt];
  const prodName = prod ? prod.name : 'etwas';

  // Sprechtext je nach Kundentyp – freundlich oder unfreundlich
  const typSaetze = {
    kind:      [`Hallo! Ich möchte bitte ${prodName}! 🍬`, `Darf ich ${prodName} kaufen?`, `Kann ich ${prodName} haben? Ich hab Taschengeld!`],
    jugend:    [`Hey, was kostet ${prodName}?`, `Ich nehm ${prodName}, bitte.`, `Haben Sie noch ${prodName}?`],
    erwachsen: [`Hallo! Ich hätte gerne ${prodName}. Was kostet das?`, `Guten Tag! Darf ich ${prodName} haben?`, `Einmal ${prodName} bitte!`],
    rentner:   [`Guten Morgen! Ich suche schöne ${prodName}.`, `Ach, ${prodName}! Die nehme ich! Was kostet das denn?`, `${prodName}? Die schaut gut aus! Was verlangen Sie dafür?`],
    familie:   [`Kinder, schaut mal! Wir nehmen ${prodName}!`, `Haben Sie genug ${prodName} für uns alle?`, `Wir brauchen ${prodName}, bitte!`],
    reich:     [`Ich nehme ${prodName}. Geben Sie her.`, `${prodName}? Gut, ich nehme es.`, `Einmal ${prodName} – und machen Sie schnell.`],
    star:      [`Oh! ${prodName}! Fabulous! Ich nehme alles!`, `Darling, ${prodName}! So rustikal! Ich liebe es!`, `${prodName}? Für meine neue Detox-Kur! Herrlich!`],
  };
  // Unfreundliche Varianten (nur reich/star)
  const unfreundlichSaetze = {
    reich: [
      { text: `Na wird's bald?! Ich will ${prodName}! 😤`,         emoji: '😤' },
      { text: `${prodName}! Sofort! Ich hab keine Zeit! 😒`,        emoji: '😒' },
      { text: `Soll ich ewig warten?! Her mit dem ${prodName}! 🙄`, emoji: '🙄' },
      { text: `Ich bin wichtig. ${prodName}. Jetzt. 😠`,            emoji: '😠' },
    ],
    star: [
      { text: `Ugh, ${prodName}?! Ich hoffe das ist bio! 😤`,               emoji: '😤' },
      { text: `Mein Assistent hätte das bestellen sollen. ${prodName}. Schnell! 💅`, emoji: '💅' },
      { text: `Wissen Sie wer ich bin?! Ich will ${prodName}! 🙄`,           emoji: '🙄' },
      { text: `Das hier ist unter meiner Würde. ${prodName}. Mach hin. 😒`,  emoji: '😒' },
    ],
  };

  let sprache, anzeigeEmoji;
  if (kunde.unfreundlich && unfreundlichSaetze[kunde.typKey]) {
    const eintrag = zufallsElement(unfreundlichSaetze[kunde.typKey]);
    sprache      = eintrag.text;
    anzeigeEmoji = eintrag.emoji;
  } else {
    const saetze = typSaetze[kunde.typKey] || typSaetze.erwachsen;
    sprache      = zufallsElement(saetze);
    anzeigeEmoji = kunde.typEmoji || '🧑';
  }

  document.getElementById('customer-emoji').textContent  = anzeigeEmoji;
  document.getElementById('customer-speech').textContent = sprache;
  document.getElementById('panel-customer').classList.remove('hidden');

  // Nach kurzer Pause Zahlungsinfo zeigen
  setTimeout(() => {
    if (!gameState.currentCustomer) return;
    const k = gameState.currentCustomer;
    const fmt = keineKommazahlen ? (n) => `${Math.round(n)} €` : formatEuro;

    // Aktuellen Preis aus gameState.prices lesen (nicht den eingefrorenen Wert)
    let aktuellerPreis = gameState.prices[k.produkt] ?? k.preis;
    if (keineKommazahlen) aktuellerPreis = Math.max(1, Math.round(aktuellerPreis));
    k.preis = aktuellerPreis; // Kunden-Objekt aktualisieren für Wechselgeld-Berechnung

    document.getElementById('customer-gives').textContent = fmt(k.zahlt);
    document.getElementById('customer-price').textContent = fmt(k.preis);

    // "Kauf ablehnen"-Button zeigen wenn Kunde nicht genug Geld hat ODER unfreundlich ist
    const zuWenig       = k.zahlt < k.preis;
    const ablehnenGrund = zuWenig ? 'geld' : k.unfreundlich ? 'unfreundlich' : null;
    const btnAblehnen   = document.getElementById('btn-ablehnen');
    if (ablehnenGrund === 'geld') {
      btnAblehnen.textContent = '❌ Kauf ablehnen – zu wenig Geld!';
    } else if (ablehnenGrund === 'unfreundlich') {
      btnAblehnen.textContent = '🚫 Nicht bedienen – zu unfreundlich!';
    }
    btnAblehnen.classList.toggle('hidden', !ablehnenGrund);
    document.getElementById('btn-give-change').classList.toggle('hidden', !!ablehnenGrund);

    document.getElementById('customer-payment-info').classList.remove('hidden');
  }, 1000);
}

/* ================================================================
   WECHSELGELD-SCREEN (Numpad-Eingabe)
   ================================================================ */

// Eingabe-Puffer: Ziffernfolge als String, z.B. "202" = 2,02 €
let numpadEingabe = '';

function oeffneWechselgeldScreen() {
  const kunde = gameState.currentCustomer;
  if (!kunde) return;

  // Eingabe zurücksetzen
  numpadEingabe = '';

  // Infos setzen – im Einfach-Modus ohne Cent
  const fmt = keineKommazahlen
    ? (n) => `${Math.round(n)} €`
    : formatEuro;
  document.getElementById('change-paid').textContent  = fmt(kunde.zahlt);
  document.getElementById('change-price').textContent = fmt(kunde.preis);

  // Komma-Taste im Einfach-Modus ausblenden
  document.querySelector('.numpad-comma').style.visibility =
    keineKommazahlen ? 'hidden' : 'visible';

  // Display zurücksetzen
  aktualisiereNumpadAnzeige();

  // Feedback verstecken, Bestätigen-Button zurücksetzen
  const fb = document.getElementById('change-feedback');
  fb.className = 'hidden';
  const btnConfirm = document.getElementById('btn-change-confirm');
  btnConfirm.textContent     = '✅ Bestätigen';
  btnConfirm.className       = 'btn btn-success btn-xl';
  btnConfirm.dataset.trotzdem = '';

  // Modal über dem Stand einblenden (nicht als eigener Screen)
  document.getElementById('screen-change').classList.add('active');
}

// Numpad-Taste gedrückt
function numpadTaste(val) {
  const fb = document.getElementById('change-feedback');
  fb.className = 'hidden';
  // Button-Zustand zurücksetzen wenn Spieler Eingabe korrigiert
  const btnConfirm = document.getElementById('btn-change-confirm');
  btnConfirm.textContent      = '✅ Bestätigen';
  btnConfirm.className        = 'btn btn-success btn-xl';
  btnConfirm.dataset.trotzdem = '';

  if (val === 'del') {
    // Letzte Ziffer löschen
    numpadEingabe = numpadEingabe.slice(0, -1);
  } else if (val === ',') {
    // Komma ignorieren – Eingabe läuft immer in Cent (letzte 2 Stellen = Cent)
    // Komma-Taste macht nichts extra, da wir immer Cent-basiert rechnen
    return;
  } else {
    // Maximal 6 Ziffern (= 9999,99 €)
    if (numpadEingabe.length >= 6) return;
    numpadEingabe += val;
  }

  aktualisiereNumpadAnzeige();
}

// Display aktualisieren
function aktualisiereNumpadAnzeige() {
  const el = document.getElementById('change-input-display');
  if (numpadEingabe === '') {
    el.textContent = keineKommazahlen ? '0' : '0,00';
    return;
  }
  if (keineKommazahlen) {
    // Einfacher Modus: Eingabe direkt als ganze Euro
    el.textContent = parseInt(numpadEingabe, 10).toString();
  } else {
    // Normal: letzte 2 Ziffern = Cent
    const padded = numpadEingabe.padStart(3, '0');
    const euro = padded.slice(0, -2);
    const cent = padded.slice(-2);
    el.textContent = `${parseInt(euro, 10)},${cent}`;
  }
}

// Eingegebenen Betrag in Cent auslesen
function numpadBetragInCent() {
  if (numpadEingabe === '') return 0;
  if (keineKommazahlen) {
    // Einfacher Modus: Eingabe ist direkt Euro → mal 100
    return parseInt(numpadEingabe, 10) * 100;
  }
  return parseInt(numpadEingabe.padStart(3, '0'), 10);
}

// Transaktion abschließen – Geld kassieren, Bewertung vergeben, Modal schließen
// diffCent: tatsächlich gegebenes Wechselgeld minus korrektes Wechselgeld (in Cent)
function schliesseTransaktion(diffCent) {
  const kunde = gameState.currentCustomer;
  if (!kunde) return;

  // Geld kassieren
  gameState.money         += kunde.preis;
  gameState.dailyEarnings += kunde.preis;
  lagerAus(kunde.produkt, 1);
  gameState.customersServed++;

  // Bewertung vergeben
  const sterne = vergebeKundenBewertung(diffCent);

  // Sterne-Feedback kurz zeigen
  const feedback = document.getElementById('change-feedback');
  const sterneStr = '★'.repeat(sterne) + '☆'.repeat(5 - sterne);
  if (diffCent === 0) {
    feedback.className = 'feedback-correct';
    feedback.textContent = `🎉 Genau richtig! ${sterneStr}`;
  } else if (diffCent > 0) {
    feedback.className = 'feedback-correct';
    feedback.textContent = `😊 Großzügig! ${sterneStr}`;
  } else {
    feedback.className = 'feedback-wrong';
    feedback.textContent = `😕 Zu wenig gegeben! ${sterneStr}`;
  }

  // Neue Kunden nachlegen wenn Queue leer
  if (gameState.customers.length === 0) {
    const neueKunden = generiereKunden(berechneKundenAnzahl());
    gameState.customers.push(...neueKunden);
  }
  aktualisiereHUD();

  // Nach kurzer Pause Modal schließen
  setTimeout(() => {
    document.getElementById('screen-change').classList.remove('active');
    if (kunde.passantRef) {
      gameState.passanten = gameState.passanten.filter(p => p !== kunde.passantRef);
    }
    gameState.currentCustomer = null;
    gameState.customerVisible  = false;
    document.getElementById('panel-customer').classList.add('hidden');
    naechsterKunde();
  }, 1800);
}

// Wechselgeld bestätigen (Numpad-Eingabe)
function bestaetigeWechselgeld() {
  const kunde = gameState.currentCustomer;
  if (!kunde) return;

  const summe     = numpadBetragInCent();
  const benoetigt = Math.round((kunde.zahlt - kunde.preis) * 100);
  const diff      = summe - benoetigt; // positiv = zu viel, negativ = zu wenig, 0 = richtig
  const feedback  = document.getElementById('change-feedback');
  const btnConfirm = document.getElementById('btn-change-confirm');

  feedback.classList.remove('hidden');

  if (diff === 0) {
    // Genau richtig – direkt abschließen
    btnConfirm.textContent = '✅ Bestätigen';
    btnConfirm.className   = 'btn btn-success btn-xl';
    btnConfirm.dataset.trotzdem = '';
    schliesseTransaktion(0);

  } else {
    // Falsch – Button rot färben, "Trotzdem!"-Modus aktivieren
    const fmt = keineKommazahlen ? (n) => `${Math.round(n / 100)} €` : (n) => formatGeld(n);
    if (diff > 0) {
      feedback.className   = 'feedback-wrong';
      feedback.textContent = `⬆️ ${fmt(diff)} zu viel!`;
    } else {
      feedback.className   = 'feedback-wrong';
      feedback.textContent = `⬇️ ${fmt(-diff)} zu wenig!`;
    }

    if (btnConfirm.dataset.trotzdem === 'ja') {
      // Zweiter Klick: trotzdem abschließen
      btnConfirm.textContent     = '✅ Bestätigen';
      btnConfirm.className       = 'btn btn-success btn-xl';
      btnConfirm.dataset.trotzdem = '';
      schliesseTransaktion(diff);
    } else {
      // Erster Klick bei falschem Betrag: roter Button, Trotzdem-Modus
      btnConfirm.textContent      = '⚠️ Trotzdem geben!';
      btnConfirm.className        = 'btn btn-danger btn-xl';
      btnConfirm.dataset.trotzdem = 'ja';
    }
  }
}

/* ================================================================
   TAGESENDE
   ================================================================ */

function tagesEnde() {
  // Animation kurz weiterlaufen lassen
  gameState.standOpen = false;
  gameState.customerVisible = false;

  // Feierabend-Button verstecken
  document.getElementById('btn-feierabend').classList.add('hidden');

  const nachtOverlay = document.getElementById('overlay-night');
  document.getElementById('night-title').textContent =
    `Gute Nacht! Tag ${gameState.day} ist zu Ende.`;
  document.getElementById('night-text').textContent =
    `Du hast heute ${gameState.customersServed} Kunden bedient!`;
  // Verderb berechnen und anzeigen
  const verluste = verderbeInventar();
  let verderb_html = '';
  if (Object.keys(verluste).length > 0) {
    const verloreneWaren = Object.entries(verluste)
      .map(([k, n]) => `${PRODUKTE[k]?.emoji || k} ${n}× ${PRODUKTE[k]?.name || k}`)
      .join(', ');
    verderb_html = `<br>🗑️ Verdorben: <strong>${verloreneWaren}</strong>`;
  }

  // Oma-Lieferung für morgen früh
  let oma_html = '';
  if (gameState.phase === 1) {
    const omaText = omaLieferung();
    if (omaText.length > 0) {
      oma_html = `<br>👵 Oma liefert: <strong>${omaText.join(', ')}</strong>`;
    }
  }

  document.getElementById('night-stats').innerHTML = `
    💰 Heute verdient: <strong>${formatEuro(gameState.dailyEarnings)}</strong><br>
    🏦 Gesamt-Geld: <strong>${formatEuro(gameState.money)}</strong>
    ${verderb_html}${oma_html}
  `;

  nachtOverlay.classList.remove('hidden');

  // Sonne auf Nachtposition
  gameState.sunX = 0.98;
}

/* ================================================================
   VERDERB-SYSTEM
   ================================================================ */

// Haltbarkeit laden (aus localStorage, Standard: 3 Tage, 0 = deaktiviert)
function haltbarkeitTage() {
  const wert = parseInt(localStorage.getItem('haltbarkeitTage') ?? '3', 10);
  return isNaN(wert) ? 3 : wert;
}

// Inventar-Alter um 1 Tag erhöhen, verdorbene Einheiten entfernen.
// Gibt Objekt zurück: { [key]: anzahlVerdorben }
function verderbeInventar() {
  const tage = haltbarkeitTage();
  const verluste = {};

  if (tage === 0) return verluste; // Verderb deaktiviert

  for (const key of Object.keys(gameState.inventory)) {
    if (!gameState.inventarAlter[key]) gameState.inventarAlter[key] = [];

    // Alter aller Einheiten um 1 erhöhen
    gameState.inventarAlter[key] = gameState.inventarAlter[key].map(a => a + 1);

    // Einheiten die zu alt sind aussortieren
    const vorher = gameState.inventarAlter[key].length;
    gameState.inventarAlter[key] = gameState.inventarAlter[key].filter(a => a < tage);
    const verdorben = vorher - gameState.inventarAlter[key].length;

    if (verdorben > 0) {
      verluste[key] = verdorben;
      gameState.inventory[key] = Math.max(0, (gameState.inventory[key] || 0) - verdorben);
    }
  }

  return verluste;
}

// Neue Ware einlagern (Alter = 0)
function lagerEin(key, anzahl) {
  if (!gameState.inventarAlter[key]) gameState.inventarAlter[key] = [];
  for (let i = 0; i < anzahl; i++) {
    gameState.inventarAlter[key].push(0);
  }
  gameState.inventory[key] = (gameState.inventory[key] || 0) + anzahl;
}

// Ware beim Verkauf aus Lager nehmen (älteste zuerst)
function lagerAus(key, anzahl = 1) {
  if (!gameState.inventarAlter[key]) gameState.inventarAlter[key] = [];
  gameState.inventarAlter[key].sort((a, b) => b - a); // älteste zuerst
  for (let i = 0; i < anzahl; i++) {
    gameState.inventarAlter[key].pop();
  }
  gameState.inventory[key] = Math.max(0, (gameState.inventory[key] || 0) - anzahl);
}

// Frischezustand pro Einheit ermitteln – gibt Ampelfarbe zurück
// 'gruen' = frisch (< 50% der Haltbarkeit verbraucht)
// 'orange' = wird alt (50–80%)
// 'rot' = fast verdorben (> 80%)
function einheitFarbe(alter, tage) {
  if (tage === 0) return 'gruen';
  const anteil = alter / tage;
  if (anteil < 0.5)  return 'gruen';
  if (anteil < 0.8)  return 'orange';
  return 'rot';
}

// Zählt wie viele Einheiten in jeder Ampelkategorie sind
// Rückgabe: { gruen: N, orange: N, rot: N }
function frischeProduktAufteilung(key) {
  const tage = haltbarkeitTage();
  const alter = gameState.inventarAlter[key] || [];
  const erg = { gruen: 0, orange: 0, rot: 0 };
  for (const a of alter) {
    erg[einheitFarbe(a, tage)]++;
  }
  return erg;
}

/* ================================================================
   JAHRESZEIT & MONAT AKTUALISIEREN
   ================================================================ */

// Wird täglich aufgerufen – Monat wechselt alle 10 Spieltage
// Spielstart = März (Monat 3, Index 2)
const START_MONAT_INDEX = 2; // März = Index 2 (0-basiert)
function aktualisiereZeit() {
  const neuerMonatIndex = (START_MONAT_INDEX + Math.floor((gameState.day - 1) / 10)) % 12;
  gameState.monat = neuerMonatIndex + 1; // 1–12

  const neueJahreszeit = jahresZeitFuerMonat(gameState.monat);
  const jahresZeitGewechselt = neueJahreszeit !== gameState.jahreszeit;
  gameState.jahreszeit = neueJahreszeit;

  return jahresZeitGewechselt;
}

// Saisonale Oma-Lieferung: nur was gerade Saison hat
function omaLieferung() {
  const verfuegbar = Object.entries(PRODUKTE)
    .filter(([, p]) => p.saisons.includes(gameState.jahreszeit));

  // 1–2 verschiedene Produkte liefern
  const anzahlProdukte = zufall(1, 2);
  const nachricht = [];

  for (let i = 0; i < anzahlProdukte; i++) {
    if (verfuegbar.length === 0) break;
    const [key, prod] = zufallsElement(verfuegbar);
    const menge = zufall(1, 3);
    lagerEin(key, menge);
    if (!gameState.prices[key]) gameState.prices[key] = 0;
    nachricht.push(`${prod.emoji} ${menge}× ${prod.name}`);
  }

  return nachricht;
}

// Neuen Tag starten
function naechsterTag() {
  gameState.day++;

  // Bei Jahreszeit-Wechsel prüfen (vor aktualisiereZeit in starteTag)
  const alteJahreszeit = gameState.jahreszeit;
  const neuerMonatIndex = (START_MONAT_INDEX + Math.floor((gameState.day - 1) / 10)) % 12;
  const neueJahreszeit = jahresZeitFuerMonat(neuerMonatIndex + 1);
  const jahreszeitWechsel = neueJahreszeit !== alteJahreszeit;

  if (jahreszeitWechsel) {
    const jz = JAHRESZEITEN[gameState.jahreszeit];
    // Kleine Toast-Meldung auf dem Spielfeld
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

/* ================================================================
   EVENT-LISTENER
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

// Einstellung: keine Komma-Zahlen – beim Start aus localStorage laden
let keineKommazahlen = localStorage.getItem('keineKommazahlen') === '1';
document.getElementById('toggle-nocomma').checked = keineKommazahlen;

// Vorheriger Screen – um nach Einstellungen zurückzukehren
let screenVorEinstellungen = 'screen-start';

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

// Tagesrhythmus-Controls aufbauen
(function initTagesrhythmusSettings() {
  const container = document.getElementById('tagesrhythmus-controls');
  if (!container) return;

  Object.entries(TAGESRHYTHMUS).forEach(([slot, info]) => {
    const aktuell = tagesrhythmusFaktor(slot);

    const row = document.createElement('div');
    row.className = 'settings-faktor-row';
    row.innerHTML = `
      <span class="settings-faktor-label">${info.emoji} ${info.label} <small>(${info.stunden})</small></span>
      <div class="faktor-buttons" data-slot="${slot}">
        <button class="btn btn-sm faktor-btn" data-val="0.3">😴</button>
        <button class="btn btn-sm faktor-btn" data-val="0.6">🌅</button>
        <button class="btn btn-sm faktor-btn" data-val="1.0">😊</button>
        <button class="btn btn-sm faktor-btn" data-val="1.4">🏃</button>
        <button class="btn btn-sm faktor-btn" data-val="2.0">🎉</button>
      </div>
    `;
    container.appendChild(row);

    // Aktiven Button hervorheben
    row.querySelectorAll('.faktor-btn').forEach(btn => {
      const val = parseFloat(btn.dataset.val);
      btn.classList.toggle('btn-primary', Math.abs(val - aktuell) < 0.01);
      btn.addEventListener('click', () => {
        localStorage.setItem(`rhythmus_${slot}`, val);
        row.querySelectorAll('.faktor-btn').forEach(b =>
          b.classList.toggle('btn-primary', b === btn));
        zeigeMeldung(`✅ ${info.label}: Faktor ${val}`);
      });
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
    const stufen = [0, 0.3, 1.0, 2.0, 3.5];
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

// Bewertungs-Stärke-Controls aufbauen
(function initBewertungsStaerkeSettings() {
  const container = document.getElementById('bewertung-staerke-controls');
  if (!container) return;

  const stufen = [
    { val: 0,    label: 'Kein Effekt' },
    { val: 0.25, label: 'Schwach' },
    { val: 0.5,  label: 'Normal' },
    { val: 1.0,  label: 'Stark' },
    { val: 2.0,  label: 'Extrem' },
  ];
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
    // Bewertungen im Spielzustand zurücksetzen
    gameState.bewertungSumme  = 0;
    gameState.bewertungAnzahl = 0;
    gameState.gesamtKunden    = 0;
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

// Kurze Bestätigungs-Meldung im Einstellungs-Screen anzeigen
function zeigeMeldung(text) {
  const box = document.querySelector('.settings-box');
  const el  = document.createElement('div');
  el.className = 'settings-toast';
  el.textContent = text;
  box.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

/// Startbildschirm: "Spiel starten"
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
  gameState._stand = null; // Noch kein Stand
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

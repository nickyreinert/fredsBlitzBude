'use strict';

/* ================================================================
   GLOBALE KONFIGURATION – Alle konfigurierbaren Spielparameter
   Änderungen hier wirken sich auf das gesamte Spiel aus.
   ================================================================ */

// ── Produkte: Verfügbare Waren mit Eigenschaften ────────────────
const PRODUKTE = {
  gurke:    { name: 'Gurke',     emoji: '🥒', farbe: '#4CAF50', form: 'gurke',    kaufPreis: 0,    saisons: ['fruehling', 'sommer'] },
  apfel:    { name: 'Apfel',     emoji: '🍎', farbe: '#f44336', form: 'apfel',    kaufPreis: 1.00, saisons: ['herbst', 'winter'] },
  banane:   { name: 'Banane',    emoji: '🍌', farbe: '#FFC107', form: 'banane',   kaufPreis: 0.80, saisons: ['sommer', 'herbst'] },
  tomate:   { name: 'Tomate',    emoji: '🍅', farbe: '#e53935', form: 'tomate',   kaufPreis: 1.20, saisons: ['sommer'] },
  karotte:  { name: 'Karotte',   emoji: '🥕', farbe: '#FF7043', form: 'karotte',  kaufPreis: 0.90, saisons: ['herbst', 'winter'] },
  erdbeere: { name: 'Erdbeere',  emoji: '🍓', farbe: '#e91e63', form: 'erdbeere', kaufPreis: 1.50, saisons: ['fruehling', 'sommer'] },
  kuerbis:  { name: 'Kürbis',    emoji: '🎃', farbe: '#FF6F00', form: 'kuerbis',  kaufPreis: 2.00, saisons: ['herbst'] },
  zitrone:  { name: 'Zitrone',   emoji: '🍋', farbe: '#FDD835', form: 'zitrone',  kaufPreis: 1.00, saisons: ['winter', 'fruehling'] },
};

// ── Jahreszeiten: Farben, Name, Monate ──────────────────────────
const JAHRESZEITEN = {
  fruehling: {
    name: 'Frühling', emoji: '🌸', monate: [3, 4, 5],
    himmel: ['#b3e5fc', '#e1f5fe'], horizont: '#aed581',
    boden: ['#8bc34a', '#33691e'], strasseRand: '#9ccc65',
  },
  sommer: {
    name: 'Sommer', emoji: '☀️', monate: [6, 7, 8],
    himmel: ['#4fc3f7', '#b3e5fc'], horizont: '#66bb6a',
    boden: ['#4caf50', '#1b5e20'], strasseRand: '#81c784',
  },
  herbst: {
    name: 'Herbst', emoji: '🍂', monate: [9, 10, 11],
    himmel: ['#ffcc80', '#ffe0b2'], horizont: '#a1887f',
    boden: ['#ff8f00', '#4e342e'], strasseRand: '#d4a574',
  },
  winter: {
    name: 'Winter', emoji: '❄️', monate: [12, 1, 2],
    himmel: ['#b0bec5', '#eceff1'], horizont: '#90a4ae',
    boden: ['#e0e0e0', '#90a4ae'], strasseRand: '#bdbdbd',
  },
};

// ── Monatsnamen ─────────────────────────────────────────────────
const MONATSNAMEN = [
  '', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

// ── Geldeinheiten (Cent-Werte intern) ───────────────────────────
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

// ── Kunden-Aussehen (gezeichnete Figuren) ───────────────────────
const KUNDEN = [
  { name: 'Max',      haut: '#FFCC80', haar: '#5D4037', frisur: 'kurz'   },
  { name: 'Lisa',     haut: '#FFCC80', haar: '#FDD835', frisur: 'lang'   },
  { name: 'Opa Hans', haut: '#FFCCBC', haar: '#BDBDBD', frisur: 'kurz'   },
  { name: 'Emma',     haut: '#FFE0B2', haar: '#FF7043', frisur: 'zopf'   },
  { name: 'Tom',      haut: '#D7A57A', haar: '#212121', frisur: 'kurz'   },
  { name: 'Mia',      haut: '#FFCC80', haar: '#E91E63', frisur: 'locken' },
  { name: 'Ben',      haut: '#A1887F', haar: '#4E342E', frisur: 'kurz'   },
];

// ── Kundentypen: Budget und Häufigkeit ──────────────────────────
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

// ── Tagesrhythmus: Multiplikator für Passanten-Frequenz ─────────
const TAGESRHYTHMUS = {
  morgen: { label: 'Morgen', emoji: '🌅', stunden: '8–11 Uhr',  defaultFaktor: 0.6 },
  mittag: { label: 'Mittag', emoji: '☀️', stunden: '11–15 Uhr', defaultFaktor: 1.4 },
  abend:  { label: 'Abend',  emoji: '🌆', stunden: '15–18 Uhr', defaultFaktor: 0.8 },
};

// ── Intro-Texte (mehrstufig) ────────────────────────────────────
const INTRO_SCHRITTE = [
  'Hallo! Ich bin Fred! 👋\nIch möchte einen Gemüse-Laden aufmachen!',
  'Meine Oma hat mir heute eine frische Gurke aus ihrem Garten gegeben. 🥒',
  'Ich stelle meinen Stand auf die Straße und verkaufe sie!\nDu kannst mir helfen, oder?',
  'Vergiss nicht: Du musst den richtigen Preis setzen und\nauch das Wechselgeld stimmen! 💶',
  'Los geht\'s! Viel Spaß! 🎉',
];

// ── Erfahrungssystem ────────────────────────────────────────────

// Levelstufen: xpBis = kumulative XP zum Verlassen des Levels
const XP_STUFEN = [
  { level: 1,  xpBis: 100    },
  { level: 2,  xpBis: 280    },
  { level: 3,  xpBis: 600    },
  { level: 4,  xpBis: 1200   },
  { level: 5,  xpBis: 2500   },
  { level: 6,  xpBis: 5000   },
  { level: 7,  xpBis: 9000   },
  { level: 8,  xpBis: 15000  },
  { level: 9,  xpBis: 25000  },
  { level: 10, xpBis: Infinity },
];

// XP-Quellen – Koeffizienten
const XP_QUELLEN = {
  umsatz:    { xpProEuro: 2 },
  kunde:     { xpProKunde: 10 },
  bewertung: { xpTabelle: [0, 0, 1, 5, 12, 20] },
};

// Level-Symbole (erscheinen im HUD-Badge)
const LEVEL_SYMBOLE = [
  '',    '🌱', '🌿', '⭐', '🌟', '💫',
  '🏆', '👑', '🚀', '💎', '🔥',
];

// ── Spieltag-Dauer und Timing ───────────────────────────────────

// Ein Spieltag dauert 300 Sekunden (5 Minuten) Echtzeit
const SPIELTAG_DAUER_MS = 300000;

// Spieltag-Dauer für Basis-Intervall-Berechnung (10 Minuten)
const TAG_DAUER_FUER_INTERVALL_MS = 600000;

// Standard globale Kundenzahl pro Tag
const DEFAULT_KUNDEN_PRO_TAG = 30;

// Standard Großmarkt-Mindestgeld
const DEFAULT_GROSSMARKT_MIN_GELD = 20;

// Standard Haltbarkeit in Tagen
const DEFAULT_HALTBARKEIT_TAGE = 3;

// Spielstart-Monat (März = Index 2, 0-basiert)
const START_MONAT_INDEX = 2;

// Referenzpreis für Kunden-Berechnung
const REFERENZ_PREIS = 1.50;

// ── Tageszeit-Overlay Farbstützpunkte ───────────────────────────
const TAGES_OVERLAY_STUFEN = [
  { t: 0.00, r: 255, g: 140, b:  30, a: 0.28 },
  { t: 0.18, r: 255, g: 200, b:  80, a: 0.10 },
  { t: 0.40, r:   0, g:   0, b:   0, a: 0.00 },
  { t: 0.65, r:   0, g:   0, b:   0, a: 0.00 },
  { t: 0.80, r:  40, g:  60, b: 130, a: 0.12 },
  { t: 1.00, r:  20, g:  30, b: 100, a: 0.32 },
];

// ── Passanten-Parameter ─────────────────────────────────────────
const PASSANT_GESCHWINDIGKEIT_MIN = 60;   // px pro Sekunde
const PASSANT_GESCHWINDIGKEIT_RANGE = 60; // zusätzliche zufällige Geschwindigkeit
const PASSANT_GROESSE_MIN = 0.85;
const PASSANT_GROESSE_RANGE = 0.3;
const PASSANT_WARTEZEIT_KAUF_MS = 600;    // ms bis Kaufdialog startet
const PASSANT_MAX_WARTEZEIT_MS = 8000;    // ms bis Passant weggeht

// ── Kunden-Dialog Sprüche ───────────────────────────────────────
const KUNDEN_SPRUECHE = {
  kind:      (pn) => [`Hallo! Ich möchte bitte ${pn}! 🍬`, `Darf ich ${pn} kaufen?`, `Kann ich ${pn} haben? Ich hab Taschengeld!`],
  jugend:    (pn) => [`Hey, was kostet ${pn}?`, `Ich nehm ${pn}, bitte.`, `Haben Sie noch ${pn}?`],
  erwachsen: (pn) => [`Hallo! Ich hätte gerne ${pn}. Was kostet das?`, `Guten Tag! Darf ich ${pn} haben?`, `Einmal ${pn} bitte!`],
  rentner:   (pn) => [`Guten Morgen! Ich suche schöne ${pn}.`, `Ach, ${pn}! Die nehme ich! Was kostet das denn?`, `${pn}? Die schaut gut aus! Was verlangen Sie dafür?`],
  familie:   (pn) => [`Kinder, schaut mal! Wir nehmen ${pn}!`, `Haben Sie genug ${pn} für uns alle?`, `Wir brauchen ${pn}, bitte!`],
  reich:     (pn) => [`Ich nehme ${pn}. Geben Sie her.`, `${pn}? Gut, ich nehme es.`, `Einmal ${pn} – und machen Sie schnell.`],
  star:      (pn) => [`Oh! ${pn}! Fabulous! Ich nehme alles!`, `Darling, ${pn}! So rustikal! Ich liebe es!`, `${pn}? Für meine neue Detox-Kur! Herrlich!`],
};

// Unfreundliche Sprüche (nur reich/star)
const UNFREUNDLICH_SPRUECHE = {
  reich: (pn) => [
    { text: `Na wird's bald?! Ich will ${pn}! 😤`,         emoji: '😤' },
    { text: `${pn}! Sofort! Ich hab keine Zeit! 😒`,        emoji: '😒' },
    { text: `Soll ich ewig warten?! Her mit dem ${pn}! 🙄`, emoji: '🙄' },
    { text: `Ich bin wichtig. ${pn}. Jetzt. 😠`,            emoji: '😠' },
  ],
  star: (pn) => [
    { text: `Ugh, ${pn}?! Ich hoffe das ist bio! 😤`,               emoji: '😤' },
    { text: `Mein Assistent hätte das bestellen sollen. ${pn}. Schnell! 💅`, emoji: '💅' },
    { text: `Wissen Sie wer ich bin?! Ich will ${pn}! 🙄`,           emoji: '🙄' },
    { text: `Das hier ist unter meiner Würde. ${pn}. Mach hin. 😒`,  emoji: '😒' },
  ],
};

// ── Trinkgeld-Großzügigkeitsfaktoren pro Kundentyp ──────────────
const TRINKGELD_GROSSZUEGIGKEIT = {
  kind:      0.2,
  jugend:    0.3,
  erwachsen: 0.5,
  rentner:   0.6,
  familie:   0.5,
  reich:     1.5,
  star:      2.0,
};

// ── Standard-Trinkgeld-Einstellungen ────────────────────────────
const DEFAULT_TRINKGELD_BASIS_CHANCE = 0.3;
const DEFAULT_TRINKGELD_MAX_CENT = 100;

// ── Bewertungs-Einstellungen ────────────────────────────────────
const DEFAULT_BEWERTUNGS_STAERKE = 0.5;

// ── Tagesrhythmus-Slider Stufen (für Einstellungen) ─────────────
const RHYTHMUS_STUFEN = [
  { val: 0.0, emoji: '😴', label: 'Geschlossen' },
  { val: 0.5, emoji: '🌅', label: 'Wenig'       },
  { val: 1.0, emoji: '😊', label: 'Normal'      },
  { val: 1.5, emoji: '🏃', label: 'Viel'        },
  { val: 2.0, emoji: '🎉', label: 'Ansturm'     },
];

// ── Trinkgeld-Slider Stufen (für Einstellungen) ─────────────────
const TRINKGELD_CHANCE_STUFEN = [
  { val: 0.05, label: 'sehr selten' },
  { val: 0.15, label: 'selten'      },
  { val: 0.30, label: 'normal'      },
  { val: 0.50, label: 'oft'         },
  { val: 0.80, label: 'sehr oft'    },
];

const TRINKGELD_MAX_STUFEN = [
  { val: 20,  label: 'bis 20 Ct' },
  { val: 50,  label: 'bis 50 Ct' },
  { val: 100, label: 'bis 1 €'   },
  { val: 200, label: 'bis 2 €'   },
  { val: 500, label: 'bis 5 €'   },
];

// ── Bewertungs-Stärke Stufen (für Einstellungen) ────────────────
const BEWERTUNG_STAERKE_STUFEN = [
  { val: 0,    label: 'Kein Effekt' },
  { val: 0.25, label: 'Schwach'     },
  { val: 0.5,  label: 'Normal'      },
  { val: 1.0,  label: 'Stark'       },
  { val: 2.0,  label: 'Extrem'      },
];

// ── Kundentyp-Häufigkeits-Stufen (für Einstellungen) ────────────
const KUNDENTYP_HAEUFIGKEIT_STUFEN = [0, 0.3, 1.0, 2.0, 3.5];

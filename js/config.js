'use strict';

/* ================================================================
   GLOBALE KONFIGURATION – Alle konfigurierbaren Spielparameter
   Änderungen hier wirken sich auf das gesamte Spiel aus.
   ================================================================ */

// ── Produkte: Verfügbare Waren mit Eigenschaften ────────────────
const PRODUKTE = {
  // einzahl = Akkusativ mit Artikel ("Ich hätte gern eine Gurke"), mehrzahl = Plural ("zwei Gurken")
  // fairPreis = üblicher Ladenpreis: billiger → mehr Käufer, viel teurer → kaum jemand kauft
  gurke:    { name: 'Gurke',     einzahl: 'eine Gurke',    mehrzahl: 'Gurken',    emoji: '🥒', farbe: '#4CAF50', form: 'gurke',    fairPreis: 1.20, kaufPreis: 0,    saisons: ['fruehling', 'sommer'] },
  apfel:    { name: 'Apfel',     einzahl: 'einen Apfel',   mehrzahl: 'Äpfel',     emoji: '🍎', farbe: '#f44336', form: 'apfel',    fairPreis: 1.50, kaufPreis: 1.00, saisons: ['herbst', 'winter'] },
  banane:   { name: 'Banane',    einzahl: 'eine Banane',   mehrzahl: 'Bananen',   emoji: '🍌', farbe: '#FFC107', form: 'banane',   fairPreis: 1.20, kaufPreis: 0.80, saisons: ['sommer', 'herbst'] },
  tomate:   { name: 'Tomate',    einzahl: 'eine Tomate',   mehrzahl: 'Tomaten',   emoji: '🍅', farbe: '#e53935', form: 'tomate',   fairPreis: 1.80, kaufPreis: 1.20, saisons: ['sommer'] },
  karotte:  { name: 'Karotte',   einzahl: 'eine Karotte',  mehrzahl: 'Karotten',  emoji: '🥕', farbe: '#FF7043', form: 'karotte',  fairPreis: 1.30, kaufPreis: 0.90, saisons: ['herbst', 'winter'] },
  erdbeere: { name: 'Erdbeere',  einzahl: 'eine Erdbeere', mehrzahl: 'Erdbeeren', emoji: '🍓', farbe: '#e91e63', form: 'erdbeere', fairPreis: 2.50, kaufPreis: 1.50, saisons: ['fruehling', 'sommer'] },
  kuerbis:  { name: 'Kürbis',    einzahl: 'einen Kürbis',  mehrzahl: 'Kürbisse',  emoji: '🎃', farbe: '#FF6F00', form: 'kuerbis',  fairPreis: 3.50, kaufPreis: 2.00, saisons: ['herbst'] },
  zitrone:  { name: 'Zitrone',   einzahl: 'eine Zitrone',  mehrzahl: 'Zitronen',  emoji: '🍋', farbe: '#FDD835', form: 'zitrone',  fairPreis: 1.50, kaufPreis: 1.00, saisons: ['winter', 'fruehling'] },
};

// Zahlwörter für natürliche Sätze ("drei Äpfel" statt "3× Apfel")
const ZAHLWOERTER = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'];

// ── Jahreszeiten: Farben, Name, Monate ──────────────────────────
const JAHRESZEITEN = {
  fruehling: {
    name: 'Frühling', kurz: 'Frühl.', emoji: '🌸', monate: [3, 4, 5],
    himmel: ['#b3e5fc', '#e1f5fe'], horizont: '#aed581',
    boden: ['#8bc34a', '#33691e'], strasseRand: '#9ccc65',
  },
  sommer: {
    name: 'Sommer', kurz: 'Sommer', emoji: '☀️', monate: [6, 7, 8],
    himmel: ['#4fc3f7', '#b3e5fc'], horizont: '#66bb6a',
    boden: ['#4caf50', '#1b5e20'], strasseRand: '#81c784',
  },
  herbst: {
    name: 'Herbst', kurz: 'Herbst', emoji: '🍂', monate: [9, 10, 11],
    himmel: ['#ffcc80', '#ffe0b2'], horizont: '#a1887f',
    boden: ['#ff8f00', '#4e342e'], strasseRand: '#d4a574',
  },
  winter: {
    name: 'Winter', kurz: 'Winter', emoji: '❄️', monate: [12, 1, 2],
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

/* ================================================================
   TEXTE – Zentrale Text-Datenbank
   Alle sichtbaren Spieltexte hier ändern → wirkt sich sofort aus.
   ================================================================ */
const TEXTE = {
  // ── HUD-Leiste ───────────────────────────────────────────────
  hud: {
    labelGeld:      '💰 Geld',
    labelKunden:    '🛒 Kunden',
    labelBewertung: '⭐ Bewertung',
    labelLevel:     'Level',
    feierabend:     '🌙 Feierabend',
    tagPrefix:      'Tag',
  },

  // ── Inventar & Stand-Panel ───────────────────────────────────
  stand: {
    panelTitel:                   'Dein Stand',
    oeffnenDefault:               '🏪 Stand öffnen!',
    oeffnenPreisHinweis:          '⚠️ Bitte Preis eingeben!',
    oeffnenPreisHinweisTimeoutMs: 1800,
  },

  // ── Kunden-Dialog ────────────────────────────────────────────
  customer: {
    fallbackProduktName:  'etwas',
    btnBedienen:          '💶 Bedienen',
    ablehnenStandard:     '🚫 Ablehnen',
    ablehnenZuWenigGeld:  '❌ Ablehnen – zu wenig Geld!',
    ablehnenUnhoeflich:   '🚫 Wegschicken!',
    unhoeflichHinweis:    '😠 Ui, der ist unhöflich! Du darfst ihn wegschicken.',
  },

  // ── Wechselgeld-Minispiel ────────────────────────────────────
  wechselgeld: {
    titel:          '💶 Wechselgeld rausgeben',
    labelGezahlt:   'Gezahlt:',
    labelTrinkgeld: '🎁 Trinkgeld für dich:',
    labelPreis:     'Preis:',
    labelGesamt:    'Gesamt:',
    btnBestaetigen: '✅ Bestätigen',
    btnWeiter:      '✅ Weiter',
    btnTrotzdem:    '⚠️ Trotzdem geben!',
    btnTrotzdemWeiter: '⚠️ Trotzdem weiter!',
  },

  // ── Nacht-Overlay ────────────────────────────────────────────
  nacht: {
    emoji:          '🌙',
    btnGrossmarkt:  '🏪 Zum Großmarkt!',
    btnNaechsterTag: '☀️ Neuer Tag',
  },

  // ── Tagesende-Meldungen ──────────────────────────────────────
  dayEnd: {
    titel:          (day) => `Gute Nacht! Tag ${day} ist zu Ende.`,
    kundenBedient:  (count) => `Du hast heute ${count} Kunden bedient!`,
    heuteVerdient:  '💰 Heute verdient:',
    gesamtGeld:     '🏦 Gesamt-Geld:',
    verdorben:      '🗑️ Verdorben:',
    omaLiefert:     '👵 Oma liefert:',
  },

  // ── Großmarkt ────────────────────────────────────────────────
  grossmarkt: {
    titel:          '🏪 Großmarkt',
    btnKaufen:      '🛒 Kaufen & Heimfahren',
    btnZurueck:     '← Zurück',
    labelBudget:    '💰 Dein Geld:',
    labelGesamt:    'Gesamt:',
  },

  // ── Zubehör-Shop ─────────────────────────────────────────────
  zubehoer: {
    titel:          '🛍️ Zubehör-Shop',
    btnZurueck:     '← Zurück',
    btnKaufen:      '🛒 Kaufen',
    btnZuWenig:     '💸 Zu wenig Geld',
    statusGekauft:  '✅ Gekauft!',
    anzahlText:     (n, max) => `Du hast ${n} von ${max}`,
  },

  // ── Einstellungen ────────────────────────────────────────────
  einstellungen: {
    btnZurueck:     '← Zurück',
  },

  // ── Lese-Profi: Ware einpacken ───────────────────────────────
  einpacken: {
    titel:   '📦 Ware einpacken',
    richtig: '✅ Richtig eingepackt! Jetzt das Geld …',
    falsch:  '🤔 Das stimmt noch nicht – lies nochmal genau!',
    tipp:    '💡 Grün ist richtig, Rot stimmt noch nicht.',
  },

  // ── Tages-Trend ──────────────────────────────────────────────
  trend: {
    heuteGefragt: (prod) => `📈 Heute gefragt: ${prod.emoji} ${prod.mehrzahl}!`,
    morgenGefragt: (prod) => `📈 Morgen gefragt: ${prod.emoji} ${prod.mehrzahl}`,
    grossmarktBadge: '📈 Morgen gefragt!',
    // Ansage am Morgen (zufällig eine davon)
    ansage: (prod) => [
      `📈 Heute haben alle Lust auf ${prod.mehrzahl}! ${prod.emoji}`,
      `📈 ${prod.mehrzahl} sind heute der Renner! ${prod.emoji}`,
      `📈 Alle wollen heute ${prod.mehrzahl}! ${prod.emoji}`,
    ],
  },

  // ── System-Meldungen ─────────────────────────────────────────
  meldungen: {
    notfallLieferung: '👵 Oma bringt Notfall-Gurken! Nicht aufgeben!',
    zubehoerGekauft:  (name, emoji) => `${emoji} ${name} gekauft! Viel Spaß damit!`,
    zuWenigGeld:      '💸 Nicht genug Geld!',
    kundeWeggeschickt: '👋 Tschüss! Wer frech ist, kriegt nichts.',
    regenTag:         '🌧️ Heute regnet es – es kommen weniger Kunden.',
    regenTagMarkise:  '🌧️ Heute regnet es – aber deine Markise hält die Kunden trocken! ⛱️',
  },
};

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

// Jahreszeit-Dauer in Spieltagen (Standard: 90)
const DEFAULT_JAHRESZEIT_TAGE = 90;

// Reihenfolge der Jahreszeiten
const JAHRESZEITEN_REIHENFOLGE = ['fruehling', 'sommer', 'herbst', 'winter'];

// Standard-Wahrscheinlichkeit, dass ein Kunde eine Bewertung abgibt (0–1)
const DEFAULT_BEWERTUNGS_CHANCE = 1.0;

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
// pn = Einkauf im Akkusativ, z.B. "eine Gurke" oder "zwei Äpfel und eine Zitrone"
// Pn = dasselbe, aber großgeschrieben (für den Satzanfang)
const KUNDEN_SPRUECHE = {
  kind: (pn, Pn) => [
    `Hallo! Ich hätte gern ${pn}, bitte! 😊`,
    `Darf ich ${pn} kaufen? Ich hab mein Taschengeld dabei!`,
    `Mama hat gesagt, ich soll ${pn} holen.`,
    `Hallo Fred! ${Pn}, bitte!`,
  ],
  jugend: (pn, Pn) => [
    `Hi! Einmal ${pn}, bitte.`,
    `Hey, ich nehm ${pn}.`,
    `Moin! Kann ich ${pn} haben?`,
    `${Pn}, bitte. Danke dir!`,
  ],
  erwachsen: (pn, Pn) => [
    `Guten Tag! Ich hätte gern ${pn}.`,
    `Hallo! Ich nehme ${pn}, bitte.`,
    `Das sieht aber lecker aus! Ich hätte gern ${pn}.`,
    `${Pn}, bitte. Danke schön!`,
  ],
  rentner: (pn, Pn) => [
    `Guten Tag, mein Junge! Ich hätte gern ${pn}.`,
    `Ach, wie schön frisch! Gib mir bitte ${pn}.`,
    `So was Feines gibt es heute selten. Ich nehme ${pn}.`,
    `${Pn}, bitte. Danke, mein Junge!`,
  ],
  familie: (pn, Pn) => [
    `Hallo! Wir hätten gern ${pn}.`,
    `Kinder, schaut mal, wie lecker! Wir nehmen ${pn}.`,
    `Für unser Picknick brauchen wir ${pn}.`,
    `${Pn}, bitte – für die ganze Familie!`,
  ],
  reich: (pn, Pn) => [
    `Guten Tag. Ich nehme ${pn}.`,
    `Für mein Abendessen brauche ich ${pn}. Nur das Beste!`,
    `${Pn}, bitte. Sieht ordentlich aus.`,
  ],
  star: (pn, Pn) => [
    `Hallöchen, Schätzchen! Ich nehme ${pn}!`,
    `Wie süß, ein echter Marktstand! ${Pn}, bitte!`,
    `Ich brauche ${pn} für meinen Smoothie. Fabelhaft!`,
  ],
};

// ── Unhöfliche Kunden ───────────────────────────────────────────
// Wahrscheinlichkeit pro Kundentyp, dass der Kunde unhöflich ist (0–1)
const UNFREUNDLICH_CHANCE = {
  kind:      0,
  jugend:    0.12,
  erwachsen: 0.10,
  rentner:   0.08,
  familie:   0.06,
  reich:     0.35,
  star:      0.35,
};

// Unhöfliche Sprüche (für alle Typen außer Kinder)
const UNFREUNDLICH_SPRUECHE = (pn, Pn) => [
  { text: `He, du! ${Pn}. Aber zackig!`,                         emoji: '😤' },
  { text: `Na endlich! Gib mir ${pn}, ich hab nicht ewig Zeit.`, emoji: '😒' },
  { text: `${Pn}. Und guck nicht so!`,                           emoji: '🙄' },
  { text: `Ist das alles hier? Na gut, dann eben ${pn}.`,        emoji: '😠' },
  { text: `Ich will ${pn}. Und zwar sofort!`,                    emoji: '😤' },
];

// ── Bezahl-Sprüche (im Wechselgeld-Fenster) ─────────────────────
// gibt = Betrag den der Kunde hinlegt, ziel = Preis + Trinkgeld ("Mach 3 €")
const BEZAHL_SPRUECHE = {
  normal:   (gibt) => [`Hier sind ${gibt}.`, `Bitte schön, ${gibt}.`, `Ich gebe dir ${gibt}.`],
  stimmtSo: (gibt) => [`Hier sind ${gibt}. Stimmt so!`, `${gibt} – der Rest ist für dich!`, `Bitte, ${gibt}. Stimmt so!`],
  aufrunden: (gibt, ziel) => [
    `Hier sind ${gibt}. Mach ${ziel}, der Rest ist für dich!`,
    `Ich gebe dir ${gibt}. Mach ${ziel} draus!`,
    `${gibt}, bitte. Mach ${ziel}, stimmt so.`,
  ],
};

// ── Trinkgeld-Großzügigkeitsfaktoren pro Kundentyp ──────────────
const TRINKGELD_GROSSZUEGIGKEIT = {
  kind:      0,
  jugend:    0.10,
  erwachsen: 0.25,
  rentner:   0.35,
  familie:   0.25,
  reich:     0.60,
  star:      0.90,
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

// ── Jahreszeit-Dauer-Stufen (Tage pro Jahreszeit) ────────────────
const JAHRESZEIT_TAGE_STUFEN = [
  { val: 10,  label: '10 Tage'  },
  { val: 30,  label: '30 Tage'  },
  { val: 60,  label: '60 Tage'  },
  { val: 90,  label: '90 Tage'  },
  { val: 180, label: '180 Tage' },
];

// ── Bewertungs-Chance-Stufen (0 = niemand, 1 = jeder) ────────────
const BEWERTUNG_CHANCE_STUFEN = [
  { val: 0,    label: 'Niemand'   },
  { val: 0.25, label: 'Selten'    },
  { val: 0.5,  label: 'Die Hälfte' },
  { val: 0.75, label: 'Meistens'  },
  { val: 1.0,  label: 'Jeder'     },
];

// ── Zubehör-Shop ─────────────────────────────────────────────────

// Verfügbare Zubehör-Artikel (Tiere und Stand-Erweiterungen)
// wirkung: 'kunden' = mehr Kunden kommen, 'trinkgeld' = öfter Trinkgeld,
//          'regenschutz' = weniger Kundenverlust bei Regen, 'frische' = Ware hält länger
// Der Bonus wird pro Wirkung über alle passenden Tiere berechnet (gedämpft, siehe unten).
const ZUBEHOER_ARTIKEL = {
  // ── Tiere ──
  hund: {
    name:         'Hund',
    emoji:        '🐕',
    beschreibung: 'Ein treuer Begleiter! Kunden mögen Hunde, kommen gern vorbei und geben mehr Trinkgeld.',
    preis:        15.00,
    maxAnzahl:    1,
    wirkung:      ['kunden', 'trinkgeld'],
    kategorie:    'tier',
  },
  katze: {
    name:         'Katze',
    emoji:        '🐈',
    beschreibung: 'Spaziert auf dem Dach herum. Die Kunden finden das so süß, dass sie öfter Trinkgeld geben.',
    preis:        12.00,
    maxAnzahl:    1,
    wirkung:      ['trinkgeld'],
    kategorie:    'tier',
  },
  fisch: {
    name:         'Goldfisch',
    emoji:        '🐠',
    beschreibung: 'Schwimmt in einem Glas neben dem Stand. Leute bleiben stehen und gucken – es kommen mehr Kunden! Bis zu 3 Fische.',
    preis:        6.00,
    maxAnzahl:    3,
    wirkung:      ['kunden'],
    kategorie:    'tier',
  },
  papagei: {
    name:         'Papagei',
    emoji:        '🦜',
    beschreibung: 'Sitzt auf dem Dach und ist bunt und laut. Das lockt mehr Kunden an!',
    preis:        20.00,
    maxAnzahl:    1,
    wirkung:      ['kunden'],
    kategorie:    'tier',
  },

  // ── Erweiterungen für den Stand ──
  markise: {
    name:         'Markise',
    emoji:        '⛱️',
    beschreibung: 'Ein gestreiftes Dach über der Theke. Bei Regen bleiben die Kunden trotzdem stehen – fast so viele wie bei Sonne!',
    preis:        25.00,
    maxAnzahl:    1,
    wirkung:      ['regenschutz'],
    kategorie:    'stand',
  },
  kuehlbox: {
    name:         'Kühlbox',
    emoji:        '🧊',
    beschreibung: 'Hält Obst und Gemüse kühl. Die Ware bleibt 2 Tage länger frisch.',
    preis:        30.00,
    maxAnzahl:    1,
    wirkung:      ['frische'],
    kategorie:    'stand',
  },
  blumen: {
    name:         'Blumenkästen',
    emoji:        '🌻',
    beschreibung: 'Bunte Blumen am Stand. Sieht schön aus – es kommen mehr Kunden!',
    preis:        10.00,
    maxAnzahl:    1,
    wirkung:      ['kunden'],
    kategorie:    'stand',
  },
  werbeschild: {
    name:         'Werbeschild',
    emoji:        '📣',
    beschreibung: 'Ein großes Schild auf dem Dach: „FRISCH!“. Man sieht es von weitem – es kommen mehr Kunden!',
    preis:        18.00,
    maxAnzahl:    1,
    wirkung:      ['kunden'],
    kategorie:    'stand',
  },
};

// Abschnitte im Shop
const ZUBEHOER_KATEGORIEN = {
  tier:  '🐾 Tiere',
  stand: '🏪 Für deinen Stand',
};

// Markise: bei Regen kommen so viele Kunden wie sonst (statt REGEN_KUNDEN_FAKTOR)
const REGEN_KUNDEN_FAKTOR_MARKISE = 0.85;

// Bonus-Stärke: logarithmische Dämpfung damit viel Zubehör nicht überpowered ist.
// Formel: bonus = staerke * log2(gesamtAnzahl + 1)
// Beispiel bei staerke=0.20: 1 Artikel → +20%, 3 → +32%, 7 → +46%
const ZUBEHOER_BONUS_STAERKE_TRINKGELD = 0.20; // Zusatz-Multiplikator auf Trinkgeld-Chance
const ZUBEHOER_BONUS_STAERKE_KUNDEN    = 0.15; // Zusatz-Multiplikator auf Kundenanzahl

// ── Wetter ───────────────────────────────────────────────────────
// Regen-Wahrscheinlichkeit pro Tag je Jahreszeit (0–1)
const REGEN_CHANCE = {
  fruehling: 0.30,
  sommer:    0.15,
  herbst:    0.40,
  winter:    0.25,
};

// Bei Regen kommen weniger Leute vorbei (Faktor auf Passanten und Kunden)
const REGEN_KUNDEN_FAKTOR = 0.5;

// ── Stimmen der Kunden (Vorlesen per Sprachausgabe des Browsers) ─
// pitch: Tonhöhe (0 = tief, 1 = normal, 2 = sehr hoch), rate: Sprechtempo (1 = normal)
const STIMMEN = {
  kind:      { pitch: 1.9, rate: 1.1  },
  jugend:    { pitch: 1.35, rate: 1.1 },
  erwachsen: { pitch: 1.0, rate: 1.0  },
  familie:   { pitch: 1.1, rate: 1.0  },
  rentner:   { pitch: 0.55, rate: 0.85 },
  reich:     { pitch: 0.8, rate: 0.95 },
  star:      { pitch: 1.4, rate: 1.05 },
};

// ── Frische-Stufen (für eigene Preise je Frische) ───────────────
// qualitaet: wie gern Kunden diese Stufe kaufen (frisch = 1).
// Kunden vergleichen Qualität und Preis – alte Ware verkauft sich nur, wenn sie billiger ist.
const FRISCHE_STUFEN = {
  gruen:  { emoji: '🟢', label: 'frisch',        qualitaet: 1.0,  wort: '' },
  orange: { emoji: '🟡', label: 'wird alt',      qualitaet: 0.7,  wort: 'älteren' },
  rot:    { emoji: '🔴', label: 'verdirbt bald', qualitaet: 0.45, wort: 'sehr reifen' },
};
const FRISCHE_REIHENFOLGE = ['gruen', 'orange', 'rot'];

// Kühlbox: so viele Tage hält Ware länger
const KUEHLBOX_EXTRA_TAGE = 2;

// Tages-Trend: so viel öfter wird das gefragte Produkt gekauft
const TREND_GEWICHT = 3;

// Kleidungsfarben der Passanten
const SHIRT_FARBEN = ['#e53935', '#1e88e5', '#43a047', '#fb8c00', '#8e24aa', '#00acc1', '#fdd835', '#ec407a'];
const HOSEN_FARBEN = ['#37474f', '#3f51b5', '#5d4037', '#455a64', '#1a237e', '#6d4c41'];

// ── Preis-Reaktion der Kunden ────────────────────────────────────
// Wie stark Kunden auf zu hohe Preise reagieren (1 = normal, kleiner = egal, größer = sparsam)
const PREIS_EMPFINDLICHKEIT = {
  kind:      1.3,
  jugend:    1.2,
  erwachsen: 1.0,
  rentner:   1.2,
  familie:   1.1,
  reich:     0.4,
  star:      0.2,
};
// Wie schnell die Kauflust bei zu hohen Preisen sinkt:
// doppelter Preis → ca. 20 % kaufen noch, dreifacher Preis → ca. 4 %
const PREIS_ABSCHRECKUNG = 1.6;
// Wie lange ein Passant mit "Zu teuer!"-Blase stehen bleibt (ms)
const ZU_TEUER_ANZEIGE_MS = 1600;

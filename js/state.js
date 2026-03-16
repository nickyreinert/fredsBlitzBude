'use strict';

/* ================================================================
   SPIELZUSTAND – Zentrales State-Objekt
   ================================================================ */

const gameState = {
  money: 0,             // Startkapital in Euro
  inventory: {
    gurke: 1            // Von Oma geschenkt bekommen
  },
  // Alter der Waren: { gurke: [2, 1, 1], apfel: [3] } = Tage seit Einlagerung pro Einheit
  inventarAlter: {
    gurke: [0]          // Startgurke ist frisch (Tag 0 = heute erhalten)
  },
  day: 1,               // Aktueller Tag (absolut)
  monat: 3,             // Aktueller Monat (1–12), Spielstart im März
  jahreszeit: 'fruehling',
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
  selectedCoins: [],    // Ausgewählte Münzen/Scheine
  sunX: 0,              // X-Position der Sonne
  animFrame: null,      // requestAnimationFrame Handle
  customerAnimY: 0,     // Animations-Y des Kunden
  customerVisible: false,
  customerWalking: false,
  walkStep: 0,          // Schrittzähler für Gehanimation
  passanten: [],        // Passanten auf der Straße
  passantenTimer: 0,    // Zeit bis zum nächsten Passanten (ms)
  tagesfortschritt: 0,  // 0.0–1.0
  tagesZeitSlot: 'morgen',
  // Bewertungssystem
  bewertungSumme: 0,
  bewertungAnzahl: 0,
  gesamtKunden: 0,      // Alle jemals bedienten Kunden
  // Großmarkt
  grossmarktGenutzt: false,
  // Erfahrungssystem
  gesamtXP: 0,
  level: 1,
  // Interne Referenz für Stand-Koordinaten (wird beim Zeichnen gesetzt)
  _stand: null,
};

// ── Globale Einstellungs-Variablen (aus localStorage geladen) ───
let keineKommazahlen = localStorage.getItem('keineKommazahlen') === '1';
let einkaufsStufe = parseInt(localStorage.getItem('einkaufsStufe') ?? '1', 10);

// Vorheriger Screen – um nach Einstellungen zurückzukehren
let screenVorEinstellungen = 'screen-start';

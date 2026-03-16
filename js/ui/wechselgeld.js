'use strict';

/* ================================================================
   WECHSELGELD – Numpad-Eingabe, Teilrechnung, Transaktion
   ================================================================ */

// Eingabe-Puffer: Ziffernfolge als String, z.B. "202" = 2,02 €
let numpadEingabe = '';

// Welcher Teilrechnungs-Schritt ist gerade aktiv (bei Stufe 3)
// 0..n-1 = Produktposten, n = Gesamtsumme
let teilrechnungSchritt = 0;
// Eingegebene Teilbeträge (in Cent, pro Posten)
let teilrechnungWerte = [];

function oeffneWechselgeldScreen() {
  const kunde = gameState.currentCustomer;
  if (!kunde) return;

  // Eingabe zurücksetzen
  numpadEingabe = '';
  teilrechnungSchritt = 0;
  teilrechnungWerte = [];

  // Infos setzen – im Einfach-Modus ohne Cent
  const fmt = keineKommazahlen
    ? (n) => `${Math.round(n)} €`
    : formatEuro;
  document.getElementById('change-paid').textContent = fmt(kunde.zahlt);

  // Trinkgeld-Zeile im Change-Modal
  const changeTrinkgeldRow = document.getElementById('change-trinkgeld-row');
  if (kunde.trinkgeld > 0) {
    document.getElementById('change-trinkgeld').textContent = fmt(kunde.trinkgeld);
    changeTrinkgeldRow.classList.remove('hidden');
  } else {
    changeTrinkgeldRow.classList.add('hidden');
  }

  // Einkaufsliste im Change-Modal zeigen (Stufe 2+3)
  const listeEl = document.getElementById('change-einkaufsliste');
  const teilEl  = document.getElementById('change-teilrechnung');

  if (einkaufsStufe >= 2 && kunde.einkaufsliste.length > 0) {
    // Einkaufsliste aufbauen
    listeEl.innerHTML = '<div class="change-liste-title">🛒 Einkauf:</div>';
    kunde.einkaufsliste.forEach((pos, idx) => {
      const prod = PRODUKTE[pos.prodKey];
      const zeile = document.createElement('div');
      zeile.className = 'change-liste-zeile';
      zeile.id = `change-liste-zeile-${idx}`;
      if (einkaufsStufe === 2) {
        // Stufe 2: Menge × Produktname – Einzelpreis sichtbar
        zeile.innerHTML = `<span>${prod.emoji} <strong>${pos.menge}×</strong> ${prod.name} à ${fmt(pos.preis)}</span>`;
      } else {
        // Stufe 3: Menge × Produktname à Einzelpreis, Teilergebnis wird per Numpad eingegeben
        const teilBetrag = document.createElement('span');
        teilBetrag.className = 'change-teilbetrag';
        teilBetrag.id = `teilbetrag-${idx}`;
        teilBetrag.textContent = '?';
        zeile.innerHTML = `<span>${prod.emoji} <strong>${pos.menge}×</strong> ${prod.name} à ${fmt(pos.preis)} =</span>`;
        zeile.appendChild(teilBetrag);
      }
      listeEl.appendChild(zeile);
    });

    if (einkaufsStufe === 3) {
      // Gesamtsummen-Zeile
      const gesamt = document.createElement('div');
      gesamt.className = 'change-liste-gesamt';
      gesamt.id = 'change-liste-gesamt-zeile';
      gesamt.innerHTML = `<span>📦 Gesamt =</span><span class="change-teilbetrag" id="teilbetrag-gesamt">?</span>`;
      listeEl.appendChild(gesamt);
    }

    listeEl.classList.remove('hidden');

    if (einkaufsStufe === 3) {
      // Stufe 3: Schritt-für-Schritt – erst Posten, dann Gesamt
      teilEl.classList.remove('hidden');
      zeigeNaechstenTeilrechnungSchritt();
    } else {
      // Stufe 2: Nur Gesamtpreis eingeben
      teilEl.classList.add('hidden');
      // Gesamtpreis-Label anpassen
      document.getElementById('change-gesamt-label').textContent = 'Gesamt:';
      document.getElementById('change-price').textContent = '?'; // Spieler soll rechnen!
    }
  } else {
    // Stufe 1: alles wie gehabt
    listeEl.classList.add('hidden');
    teilEl.classList.add('hidden');
    document.getElementById('change-gesamt-label').textContent = 'Preis:';
    document.getElementById('change-price').textContent = fmt(kunde.preis);
  }

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

// Nächsten Teilrechnungs-Schritt in Stufe 3 anzeigen
function zeigeNaechstenTeilrechnungSchritt() {
  const kunde = gameState.currentCustomer;
  if (!kunde) return;
  const fmt = keineKommazahlen ? (n) => `${Math.round(n)} €` : formatEuro;
  const teilEl = document.getElementById('change-teilrechnung');
  const n = kunde.einkaufsliste.length;

  // Eingabe zurücksetzen für neuen Schritt
  numpadEingabe = '';
  aktualisiereNumpadAnzeige();

  // Alle Zeilen abdimmen, aktive hervorheben
  for (let j = 0; j < n; j++) {
    const z = document.getElementById(`change-liste-zeile-${j}`);
    if (z) z.classList.toggle('change-zeile-aktiv', j === teilrechnungSchritt);
    z?.classList.toggle('change-zeile-fertig', j < teilrechnungSchritt);
  }
  const gesamtZ = document.getElementById('change-liste-gesamt-zeile');
  if (gesamtZ) gesamtZ.classList.toggle('change-zeile-aktiv', teilrechnungSchritt === n);

  if (teilrechnungSchritt < n) {
    // Posten-Schritt: Menge × Einzelpreis = ?
    const pos = kunde.einkaufsliste[teilrechnungSchritt];
    const prod = PRODUKTE[pos.prodKey];
    teilEl.innerHTML = `<div class="teilrechnung-aufgabe">${prod.emoji} ${pos.menge} × ${fmt(pos.preis)} = ?</div>`;
    document.getElementById('change-gesamt-label').textContent = 'Preis:';
    document.getElementById('change-price').textContent = '?';
  } else {
    // Gesamt-Schritt: alle Posten addieren
    const aufgabe = kunde.einkaufsliste
      .map(pos => fmt(pos.preis * pos.menge))
      .join(' + ');
    teilEl.innerHTML = `<div class="teilrechnung-aufgabe">📦 ${aufgabe} = ?</div>`;
    document.getElementById('change-gesamt-label').textContent = 'Gesamt:';
    document.getElementById('change-price').textContent = '?';
  }

  // Bestätigen-Button für Teilschritt umschalten
  const btnConfirm = document.getElementById('btn-change-confirm');
  const istLetzterSchritt = teilrechnungSchritt === n;
  if (!istLetzterSchritt) {
    btnConfirm.textContent = '✅ Weiter';
  } else {
    btnConfirm.textContent = '✅ Bestätigen';
  }
  btnConfirm.className       = 'btn btn-success btn-xl';
  btnConfirm.dataset.trotzdem = '';
  btnConfirm.dataset.teilSchritt = 'ja';
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
    // Komma ignorieren – Eingabe läuft immer in Cent
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

  // Geld kassieren (Preis + Trinkgeld – Trinkgeld gehört dem Spieler)
  const einnahme = kunde.preis + (kunde.trinkgeld ?? 0);
  gameState.money         += einnahme;
  gameState.dailyEarnings += einnahme;
  // Alle gekauften Posten aus dem Lager abbuchen
  for (const pos of kunde.einkaufsliste) {
    lagerAus(pos.prodKey, pos.menge);
  }
  gameState.customersServed++;

  // Bewertung vergeben (kann null sein wenn Kunde keine abgibt)
  const sterne = vergebeKundenBewertung(diffCent);

  // XP vergeben (Umsatz + 1 Kunde + ggf. Bewertung)
  const xp = xpFuerTransaktion(einnahme / 100, sterne ?? 0);
  addiereXP(xp);

  // Feedback kurz zeigen (Sterne nur wenn Bewertung abgegeben wurde)
  const feedback = document.getElementById('change-feedback');
  const sterneStr = sterne !== null
    ? ' ' + '★'.repeat(sterne) + '☆'.repeat(5 - sterne)
    : '';
  if (diffCent === 0) {
    feedback.className = 'feedback-correct';
    feedback.textContent = `🎉 Genau richtig!${sterneStr}`;
  } else if (diffCent > 0) {
    feedback.className = 'feedback-correct';
    feedback.textContent = `😊 Großzügig!${sterneStr}`;
  } else {
    feedback.className = 'feedback-wrong';
    feedback.textContent = `😕 Zu wenig gegeben!${sterneStr}`;
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

  const fmt       = keineKommazahlen ? (n) => `${Math.round(n / 100)} €` : (n) => formatGeld(n);
  const feedback  = document.getElementById('change-feedback');
  const btnConfirm = document.getElementById('btn-change-confirm');
  const n = kunde.einkaufsliste.length;

  // ── STUFE 3: Teilrechnungs-Schritte ──────────────────────────────────────────
  if (einkaufsStufe === 3 && btnConfirm.dataset.teilSchritt === 'ja') {
    const eingabe = numpadBetragInCent();

    if (teilrechnungSchritt < n) {
      // Posten-Schritt: Menge × Einzelpreis prüfen
      const pos = kunde.einkaufsliste[teilrechnungSchritt];
      const richtig = Math.round(pos.menge * pos.preis * 100);
      const teilDiff = eingabe - richtig;

      feedback.classList.remove('hidden');
      if (teilDiff === 0) {
        feedback.className   = 'feedback-correct';
        feedback.textContent = '✅ Richtig!';
        // Teilergebnis in Liste eintragen
        const el = document.getElementById(`teilbetrag-${teilrechnungSchritt}`);
        if (el) el.textContent = fmt(richtig);
        teilrechnungWerte.push(richtig);
        teilrechnungSchritt++;
        setTimeout(() => {
          feedback.className = 'hidden';
          zeigeNaechstenTeilrechnungSchritt();
        }, 700);
      } else {
        feedback.className   = 'feedback-wrong';
        feedback.textContent = teilDiff > 0 ? `⬆️ ${fmt(teilDiff)} zu viel!` : `⬇️ ${fmt(-teilDiff)} zu wenig!`;
        if (btnConfirm.dataset.trotzdem === 'ja') {
          // Trotzdem weiter
          const el = document.getElementById(`teilbetrag-${teilrechnungSchritt}`);
          if (el) el.textContent = fmt(eingabe);
          teilrechnungWerte.push(eingabe);
          teilrechnungSchritt++;
          btnConfirm.dataset.trotzdem = '';
          setTimeout(() => {
            feedback.className = 'hidden';
            zeigeNaechstenTeilrechnungSchritt();
          }, 700);
        } else {
          btnConfirm.textContent      = '⚠️ Trotzdem weiter!';
          btnConfirm.className        = 'btn btn-danger btn-xl';
          btnConfirm.dataset.trotzdem = 'ja';
        }
      }
      return;
    }

    // Gesamt-Schritt: Summe aller Posten prüfen
    const richtigGesamt = Math.round(kunde.preis * 100);
    const gesamtDiff = eingabe - richtigGesamt;
    feedback.classList.remove('hidden');

    if (gesamtDiff === 0) {
      feedback.className   = 'feedback-correct';
      feedback.textContent = '✅ Gesamt richtig!';
      const el = document.getElementById('teilbetrag-gesamt');
      if (el) el.textContent = fmt(richtigGesamt);
      // Preis in change-info zeigen
      document.getElementById('change-price').textContent =
        keineKommazahlen ? `${Math.round(kunde.preis)} €` : formatEuro(kunde.preis);
      // Jetzt Wechselgeld-Schritt – Teilschritt-Modus beenden
      btnConfirm.dataset.teilSchritt = '';
      btnConfirm.textContent = '✅ Bestätigen';
      btnConfirm.className   = 'btn btn-success btn-xl';
      numpadEingabe = '';
      aktualisiereNumpadAnzeige();
    } else {
      feedback.className   = 'feedback-wrong';
      feedback.textContent = gesamtDiff > 0 ? `⬆️ ${fmt(gesamtDiff)} zu viel!` : `⬇️ ${fmt(-gesamtDiff)} zu wenig!`;
      if (btnConfirm.dataset.trotzdem === 'ja') {
        // Falschen Gesamtbetrag akzeptieren
        const el = document.getElementById('teilbetrag-gesamt');
        if (el) el.textContent = fmt(eingabe);
        kunde.preis = eingabe / 100;
        document.getElementById('change-price').textContent =
          keineKommazahlen ? `${Math.round(kunde.preis)} €` : formatEuro(kunde.preis);
        btnConfirm.dataset.teilSchritt = '';
        btnConfirm.dataset.trotzdem    = '';
        btnConfirm.textContent = '✅ Bestätigen';
        btnConfirm.className   = 'btn btn-success btn-xl';
        numpadEingabe = '';
        aktualisiereNumpadAnzeige();
      } else {
        btnConfirm.textContent      = '⚠️ Trotzdem weiter!';
        btnConfirm.className        = 'btn btn-danger btn-xl';
        btnConfirm.dataset.trotzdem = 'ja';
      }
    }
    return;
  }

  // ── STUFE 2: Gesamtpreis-Schritt ─────────────────────────────────────────────
  if (einkaufsStufe === 2 && document.getElementById('change-price').textContent === '?') {
    // Spieler gibt Gesamtpreis ein (Menge × Einzelpreis)
    const eingabe = numpadBetragInCent();
    const richtig = Math.round(kunde.preis * 100);
    const preisDiv = eingabe - richtig;

    feedback.classList.remove('hidden');
    if (preisDiv === 0) {
      feedback.className   = 'feedback-correct';
      feedback.textContent = '✅ Richtig gerechnet!';
      const fmtE = keineKommazahlen ? (n) => `${Math.round(n)} €` : formatEuro;
      document.getElementById('change-price').textContent = fmtE(kunde.preis);
      document.getElementById('change-gesamt-label').textContent = 'Gesamt:';
      numpadEingabe = '';
      aktualisiereNumpadAnzeige();
      setTimeout(() => { feedback.className = 'hidden'; }, 800);
    } else {
      feedback.className   = 'feedback-wrong';
      feedback.textContent = preisDiv > 0 ? `⬆️ ${fmt(preisDiv)} zu viel!` : `⬇️ ${fmt(-preisDiv)} zu wenig!`;
      if (btnConfirm.dataset.trotzdem === 'ja') {
        // Falschen Gesamtbetrag übernehmen
        kunde.preis = eingabe / 100;
        const fmtE = keineKommazahlen ? (n) => `${Math.round(n)} €` : formatEuro;
        document.getElementById('change-price').textContent = fmtE(kunde.preis);
        btnConfirm.dataset.trotzdem = '';
        numpadEingabe = '';
        aktualisiereNumpadAnzeige();
        feedback.className = 'hidden';
      } else {
        btnConfirm.textContent      = '⚠️ Trotzdem weiter!';
        btnConfirm.className        = 'btn btn-danger btn-xl';
        btnConfirm.dataset.trotzdem = 'ja';
      }
    }
    return;
  }

  // ── STANDARD: Wechselgeld-Eingabe (alle Stufen) ───────────────────────────────
  const summe     = numpadBetragInCent();
  // Wechselgeld = was der Kunde gibt minus Preis minus Trinkgeld (das behält Fred)
  const benoetigt = Math.round((kunde.zahlt - kunde.preis - (kunde.trinkgeld ?? 0)) * 100);
  const diff      = summe - benoetigt;

  feedback.classList.remove('hidden');

  if (diff === 0) {
    // Genau richtig – direkt abschließen
    btnConfirm.textContent = '✅ Bestätigen';
    btnConfirm.className   = 'btn btn-success btn-xl';
    btnConfirm.dataset.trotzdem = '';
    schliesseTransaktion(0);

  } else {
    // Falsch – Button rot färben, "Trotzdem!"-Modus aktivieren
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

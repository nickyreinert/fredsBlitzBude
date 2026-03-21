'use strict';

/* ================================================================
   KUNDEN – Generierung, Kundenanzahl, Dialog
   ================================================================ */

// Zubehör-Bonus (logarithmisch gedämpft) auf Kundenanzahl
function zubehoerKundenBonus() {
  const anzahl = Object.values(gameState.zubehoer).reduce((s, n) => s + n, 0);
  if (anzahl === 0) return 1.0;
  return 1 + ZUBEHOER_BONUS_STAERKE_KUNDEN * Math.log2(anzahl + 1);
}

// Berechnet wie viele Kunden kommen
function berechneKundenAnzahl() {
  const preise = Object.entries(gameState.prices)
    .filter(([k, v]) => v > 0 && (gameState.inventory[k] || 0) > 0)
    .map(([, v]) => v);

  if (preise.length === 0) return zufall(3, 5);

  const durchschnitt = preise.reduce((a, b) => a + b, 0) / preise.length;
  const globalBasis = Math.max(1, Math.round(globalKundenProTag() / 10));
  const abweichung   = durchschnitt - REFERENZ_PREIS;
  const preisfaktor  = Math.max(0.2, 1 - abweichung * 0.3);
  // Zubehör-Bonus: Hund lockt mehr Kunden an den Stand
  const zBonus = zubehoerKundenBonus();
  const anzahl = Math.round(globalBasis * preisfaktor * bewertungsFaktor() * zBonus);

  return Math.max(1, anzahl + zufall(-1, 1));
}

// Zufällige Kunden-Liste generieren
function generiereKunden(anzahl) {
  const liste = [];
  const simuliertesInventar = { ...gameState.inventory };

  for (let i = 0; i < anzahl; i++) {
    const kd = zufallsElement(KUNDEN);
    const verfuegbar = Object.entries(simuliertesInventar).filter(
      ([k, v]) => v > 0 && gameState.prices[k] > 0
    );
    if (verfuegbar.length === 0) break;

    // Einkaufsliste je nach Stufe aufbauen
    let einkaufsliste = [];

    if (einkaufsStufe >= 3) {
      const maxPosten = Math.min(3, verfuegbar.length);
      const anzahlPosten = zufall(1, maxPosten);
      const gemischt = [...verfuegbar].sort(() => Math.random() - 0.5).slice(0, anzahlPosten);
      for (const [pk] of gemischt) {
        const maxMenge = Math.min(3, simuliertesInventar[pk]);
        const menge = zufall(1, maxMenge);
        let p = gameState.prices[pk];
        if (keineKommazahlen) p = Math.max(1, Math.round(p));
        einkaufsliste.push({ prodKey: pk, menge, preis: p });
        simuliertesInventar[pk] -= menge;
      }
    } else if (einkaufsStufe === 2) {
      const [prodKey2] = zufallsElement(verfuegbar);
      const maxMenge = Math.min(4, simuliertesInventar[prodKey2]);
      const menge = zufall(1, maxMenge);
      let p = gameState.prices[prodKey2];
      if (keineKommazahlen) p = Math.max(1, Math.round(p));
      einkaufsliste.push({ prodKey: prodKey2, menge, preis: p });
      simuliertesInventar[prodKey2] -= menge;
    } else {
      const [pk] = zufallsElement(verfuegbar);
      let p = gameState.prices[pk];
      if (keineKommazahlen) p = Math.max(1, Math.round(p));
      einkaufsliste.push({ prodKey: pk, menge: 1, preis: p });
      simuliertesInventar[pk]--;
    }

    const gesamtPreis = einkaufsliste.reduce((s, pos) => s + pos.preis * pos.menge, 0);
    const [prodKey] = [einkaufsliste[0].prodKey];
    let preis = gesamtPreis;
    if (keineKommazahlen) preis = Math.round(preis);

    // Kundentyp bestimmen
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
      if (alleBetraege.some(b => b >= preisCent)) break;
      if (versuch === 2) {
        typKey = 'erwachsen';
        typ = KUNDENTYPEN.erwachsen;
        alleBetraege = [200, 500, 1000, 2000];
      }
    }

    const moeglicheBetraege = alleBetraege.filter(b => b >= preisCent);
    let zahlt;
    if (moeglicheBetraege.length === 0) {
      zahlt = [...alleBetraege].sort((a, b) => b - a).find(b => b >= preisCent) ?? 2000;
    } else if (moeglicheBetraege.length === 1) {
      zahlt = moeglicheBetraege[0];
    } else {
      const index = Math.random() < 0.65 ? 0 : zufall(1, moeglicheBetraege.length - 1);
      zahlt = moeglicheBetraege[index];
    }

    const kannUnfreundlich = typKey === 'reich' || typKey === 'star';
    const istUnfreundlich  = kannUnfreundlich && Math.random() < 0.5;
    const trinkgeld = berechneKundenTrinkgeld(typKey);

    liste.push({
      haut:          kd.haut,
      haar:          kd.haar,
      frisur:        kd.frisur,
      name:          kd.name,
      typKey,
      typLabel:      typ.label,
      typEmoji:      typ.emoji,
      unfreundlich:  istUnfreundlich,
      produkt:       prodKey,
      einkaufsliste,
      preis:         preis,
      trinkgeld,
      zahlt:         zahlt / 100,
      wechsel:       zahlt / 100 - preis,
    });

    liste[liste.length - 1].zahlt = zahlt / 100 + trinkgeld;
  }
  return liste;
}

// Kundendialog einblenden
function zeigeKundenDialog() {
  const kunde = gameState.currentCustomer;
  if (!kunde) return;

  const prod = PRODUKTE[kunde.produkt];
  let prodName;
  if (kunde.einkaufsliste && kunde.einkaufsliste.length > 1) {
    const namen = kunde.einkaufsliste.map(pos => PRODUKTE[pos.prodKey]?.name ?? 'etwas');
    prodName = namen.slice(0, -1).join(', ') + ' und ' + namen[namen.length - 1];
  } else {
    prodName = prod ? prod.name : TEXTE.customer.fallbackProduktName;
  }

  let sprache, anzeigeEmoji;
  if (kunde.unfreundlich && UNFREUNDLICH_SPRUECHE[kunde.typKey]) {
    const eintrag = zufallsElement(UNFREUNDLICH_SPRUECHE[kunde.typKey](prodName));
    sprache      = eintrag.text;
    anzeigeEmoji = eintrag.emoji;
  } else {
    const saetze = KUNDEN_SPRUECHE[kunde.typKey]?.(prodName) || KUNDEN_SPRUECHE.erwachsen(prodName);
    sprache      = zufallsElement(saetze);
    anzeigeEmoji = kunde.typEmoji || '🧑';
  }

  document.getElementById('customer-emoji').textContent  = anzeigeEmoji;
  document.getElementById('customer-speech').textContent = sprache;
  document.getElementById('panel-customer').classList.remove('hidden');

  // Nach kurzer Pause Aktions-Buttons zeigen
  setTimeout(() => {
    if (!gameState.currentCustomer) return;
    const k = gameState.currentCustomer;

    // Preise aktualisieren (wird für Wechselgeld-Screen gebraucht)
    let gesamtPreis = 0;
    for (const pos of k.einkaufsliste) {
      let p = gameState.prices[pos.prodKey] ?? pos.preis;
      if (keineKommazahlen) p = Math.max(1, Math.round(p));
      pos.preis = p;
      gesamtPreis += p * pos.menge;
    }
    if (keineKommazahlen) gesamtPreis = Math.round(gesamtPreis);
    k.preis = gesamtPreis;

    // Einkaufsliste anzeigen (ab Stufe 2, nur Produktnamen – keine Preise hier)
    const listeEl = document.getElementById('customer-einkaufsliste');
    if (einkaufsStufe >= 2 && k.einkaufsliste.length > 0) {
      listeEl.innerHTML = '';
      k.einkaufsliste.forEach(pos => {
        const prod = PRODUKTE[pos.prodKey];
        const zeile = document.createElement('div');
        zeile.className = 'customer-einkaufsliste-zeile';
        zeile.textContent = `${prod.emoji} ${pos.menge}× ${prod.name}`;
        listeEl.appendChild(zeile);
      });
      listeEl.classList.remove('hidden');
    } else {
      listeEl.classList.add('hidden');
    }

    const zuWenig     = k.zahlt < k.preis;
    const btnAblehnen = document.getElementById('btn-ablehnen');
    const btnBedienen = document.getElementById('btn-give-change');

    if (zuWenig) {
      // Zu wenig Geld: nur Ablehnen möglich
      btnAblehnen.textContent = TEXTE.customer.ablehnenZuWenigGeld;
      btnAblehnen.classList.remove('hidden');
      btnBedienen.classList.add('hidden');
    } else if (k.unfreundlich) {
      // Unfreundlich: beide Buttons zeigen – Kind entscheidet selbst
      btnAblehnen.textContent = TEXTE.customer.ablehnenStandard;
      btnAblehnen.classList.remove('hidden');
      btnBedienen.classList.remove('hidden');
    } else {
      // Normal: nur Bedienen
      btnAblehnen.classList.add('hidden');
      btnBedienen.classList.remove('hidden');
    }

    document.getElementById('customer-payment-info').classList.remove('hidden');
  }, 280);
}

// Nächsten Kunden in der Queue abarbeiten
function naechsterKunde() {
  if (gameState.customers.length === 0) {
    const hatWare = Object.entries(gameState.inventory).some(
      ([k, v]) => v > 0 && (gameState.prices[k] || 0) > 0
    );
    if (hatWare) {
      const neueKunden = generiereKunden(berechneKundenAnzahl());
      gameState.customers.push(...neueKunden);
      aktualisiereHUD();
    }
    if (gameState.customers.length === 0) {
      setTimeout(() => {
        if (gameState.customers.length === 0 && !gameState.currentCustomer) {
          tagesEnde();
        }
      }, 3000);
    }
  }
}

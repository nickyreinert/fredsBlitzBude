'use strict';

/* ================================================================
   KUNDEN – Generierung, Kundenanzahl, Dialog
   ================================================================ */

// Zubehör-Bonus (logarithmisch gedämpft) auf Kundenanzahl
function zubehoerKundenBonus() {
  // Nur Tiere zählen, die Kunden anlocken (z.B. Hund, Fische, Papagei)
  const anzahl = zubehoerAnzahlMitWirkung('kunden');
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
  // Wetter: bei Regen kommen weniger Kunden
  const wFaktor = wetterKundenFaktor();
  const anzahl = Math.round(globalBasis * preisfaktor * bewertungsFaktor() * zBonus * wFaktor);

  return Math.max(1, anzahl + zufall(-1, 1));
}

// Kauflust für ein Produkt bei einem Preis (1 = normal, >1 = Schnäppchen, ~0 = viel zu teuer)
// Ältere Ware ist weniger wert → ihr fairer Preis sinkt mit der Qualität.
function kaufLust(key, stufe, preis, typKey) {
  const prod = PRODUKTE[key];
  if (!prod || !(preis > 0)) return 0;
  const fair = (prod.fairPreis ?? 1.5) * (FRISCHE_STUFEN[stufe]?.qualitaet ?? 1);
  const verhaeltnis = preis / fair;
  const empfindlich = PREIS_EMPFINDLICHKEIT[typKey] ?? 1;
  if (verhaeltnis <= 1) {
    // Günstiger als üblich: Kunden greifen öfter zu (bis 2,5-fach)
    return Math.min(2.5, 1 + (1 - verhaeltnis) * 1.5 * empfindlich);
  }
  // Teurer als üblich: Kauflust fällt schnell ab
  return Math.exp(-PREIS_ABSCHRECKUNG * empfindlich * (verhaeltnis - 1));
}

// Wie attraktiv ist der Stand insgesamt? (Durchschnitt der Kauflust aller Waren mit Preis)
function standAttraktivitaet() {
  const werte = Object.keys(gameState.inventory)
    .filter(k => (gameState.inventory[k] || 0) > 0 && gameState.prices[k] > 0)
    .map(k => kaufLust(k, 'gruen', gameState.prices[k], 'erwachsen'));
  if (werte.length === 0) return 1;
  return werte.reduce((a, b) => a + b, 0) / werte.length;
}

// Will der Kunde zu diesen Preisen kaufen? (prüft jeden Posten, der teuerste entscheidet)
function kundeWillKaufen(kunde) {
  let chance = 1;
  for (const pos of kunde.einkaufsliste) {
    chance = Math.min(chance, kaufLust(pos.prodKey, pos.stufe, pos.preis, kunde.typKey));
  }
  return Math.random() < chance;
}

// Zufälliges Element nach Gewicht wählen: eintraege = [[wert, gewicht], ...]
function gewichteteWahl(eintraege) {
  const gesamt = eintraege.reduce((s, [, g]) => s + g, 0);
  let rnd = Math.random() * gesamt;
  for (const [wert, g] of eintraege) {
    rnd -= g;
    if (rnd <= 0) return wert;
  }
  return eintraege[eintraege.length - 1][0];
}

// Welche Frische-Stufe nimmt der Kunde? Er vergleicht Qualität und Preis:
// alte Ware wird nur gern gekauft, wenn sie spürbar billiger ist.
function waehleFrischeStufe(key, bestand) {
  const moeglich = FRISCHE_REIHENFOLGE
    .filter(st => bestand[st] > 0)
    .map(st => {
      const preis = Math.max(0.1, preisFuer(key, st));
      const reiz  = FRISCHE_STUFEN[st].qualitaet / preis;
      return [st, Math.max(1e-9, Math.pow(reiz, 3))];
    });
  if (moeglich.length === 0) return 'gruen';
  return gewichteteWahl(moeglich);
}

// Einen Posten für die Einkaufsliste bauen (Produkt, Frische, Menge, Preis)
function bauePosten(key, maxMenge, sim) {
  const stufe = waehleFrischeStufe(key, sim[key]);
  const menge = zufall(1, Math.max(1, Math.min(maxMenge, sim[key][stufe])));
  let p = preisFuer(key, stufe);
  if (keineKommazahlen) p = Math.max(1, Math.round(p));
  sim[key][stufe] -= menge;
  return { prodKey: key, menge, preis: p, stufe };
}

// Zufällige Kunden-Liste generieren
function generiereKunden(anzahl) {
  const liste = [];
  // Simulierter Bestand je Produkt und Frische-Stufe (damit nicht mehr verkauft wird als da ist)
  const sim = {};
  for (const [key, menge] of Object.entries(gameState.inventory)) {
    if (menge > 0) sim[key] = bestandNachStufe(key);
  }
  const restMenge = (key) => sim[key] ? sim[key].gruen + sim[key].orange + sim[key].rot : 0;

  for (let i = 0; i < anzahl; i++) {
    const kd = zufallsElement(KUNDEN);
    const verfuegbar = Object.keys(sim).filter(k => restMenge(k) > 0 && gameState.prices[k] > 0);
    if (verfuegbar.length === 0) break;

    // Tages-Trend: das gefragte Produkt wird dreimal so oft gewählt
    // Billige Ware wird öfter gewählt, sehr teure fast nie
    const gewichtet = verfuegbar.map(k => {
      const trend = k === gameState.trend ? TREND_GEWICHT : 1;
      const lust  = Math.max(0.01, kaufLust(k, 'gruen', gameState.prices[k], 'erwachsen'));
      return [k, trend * lust];
    });

    // Einkaufsliste je nach Stufe aufbauen
    let einkaufsliste = [];

    if (einkaufsStufe >= 3) {
      const anzahlPosten = zufall(1, Math.min(3, verfuegbar.length));
      const kandidaten = [...gewichtet];
      for (let n = 0; n < anzahlPosten && kandidaten.length > 0; n++) {
        const pk = gewichteteWahl(kandidaten);
        kandidaten.splice(kandidaten.findIndex(([k]) => k === pk), 1);
        einkaufsliste.push(bauePosten(pk, 3, sim));
      }
    } else if (einkaufsStufe === 2) {
      einkaufsliste.push(bauePosten(gewichteteWahl(gewichtet), 4, sim));
    } else {
      einkaufsliste.push(bauePosten(gewichteteWahl(gewichtet), 1, sim));
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

    // Unhöflich? (Wahrscheinlichkeit je Kundentyp, Kinder sind nie unhöflich)
    const istUnfreundlich = Math.random() < (UNFREUNDLICH_CHANCE[typKey] ?? 0);
    // Trinkgeld: hier nur auswürfeln OB – der Betrag wird erst beim Bezahlen
    // passend zum aktuellen Preis berechnet (Preis kann sich noch ändern)
    const willTrinkgeld = !istUnfreundlich && kundeMoechteTrinkgeldGeben(typKey);

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
      willTrinkgeld,
      trinkgeld:     0,
      // Der Kunde legt immer einen glatten Schein/eine Münze hin
      zahlt:         zahlt / 100,
    });
  }
  return liste;
}

// Einen Posten als natürlichen Text: "eine Gurke", "drei Äpfel"
function postenText(pos) {
  const prod = PRODUKTE[pos.prodKey];
  if (!prod) return TEXTE.customer.fallbackProduktName;
  const zahl = ZAHLWOERTER[pos.menge] ?? String(pos.menge);
  // Ältere Ware: "zwei von den älteren Erdbeeren" / "eine von den sehr reifen Bananen"
  const wort = FRISCHE_STUFEN[pos.stufe]?.wort;
  if (wort) {
    const anzahlWort = pos.menge === 1 ? prod.einzahl.split(' ')[0] : zahl;
    // Dativ Plural: hängt ein -n an, außer das Wort endet schon auf -n oder -s (Äpfel → Äpfeln)
    const dativ = prod.dativ ?? (/[ns]$/.test(prod.mehrzahl) ? prod.mehrzahl : prod.mehrzahl + 'n');
    return `${anzahlWort} von den ${wort} ${dativ}`;
  }
  if (pos.menge === 1) return prod.einzahl;
  return `${zahl} ${prod.mehrzahl}`;
}

// Frische-Kennzeichen für Listen (leer bei frischer Ware)
function frischeMarke(pos) {
  if (!pos.stufe || pos.stufe === 'gruen') return '';
  return ` ${FRISCHE_STUFEN[pos.stufe].emoji}`;
}

// Ganze Einkaufsliste als Satzteil: "zwei Äpfel, eine Gurke und drei Tomaten"
function einkaufText(liste) {
  const teile = liste.map(postenText);
  if (teile.length === 0) return TEXTE.customer.fallbackProduktName;
  if (teile.length === 1) return teile[0];
  return teile.slice(0, -1).join(', ') + ' und ' + teile[teile.length - 1];
}

// Ersten Buchstaben großschreiben (für den Satzanfang)
function grossAnfang(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Preise des Kunden aktualisieren (Spieler kann Preise ändern, während der Stand offen ist)
function aktualisiereKundenPreis(k) {
  let gesamtPreis = 0;
  for (const pos of k.einkaufsliste) {
    let p = preisFuer(pos.prodKey, pos.stufe) || pos.preis;
    if (keineKommazahlen) p = Math.max(1, Math.round(p));
    pos.preis = p;
    gesamtPreis += p * pos.menge;
  }
  if (keineKommazahlen) gesamtPreis = Math.round(gesamtPreis);
  k.preis = Math.round(gesamtPreis * 100) / 100;

  // Trinkgeld passend zum aktuellen Preis: Preis + Trinkgeld = glatter Betrag
  k.trinkgeld = k.willTrinkgeld
    ? berechneTrinkgeldCent(k.typKey, Math.round(k.preis * 100), Math.round(k.zahlt * 100)) / 100
    : 0;
}

// Kundendialog einblenden
function zeigeKundenDialog() {
  const kunde = gameState.currentCustomer;
  if (!kunde) return;

  // Preise + Trinkgeld vor dem Anzeigen aktualisieren
  aktualisiereKundenPreis(kunde);

  const pn = einkaufText(kunde.einkaufsliste);
  const Pn = grossAnfang(pn);

  let sprache, anzeigeEmoji;
  if (kunde.unfreundlich) {
    const eintrag = zufallsElement(UNFREUNDLICH_SPRUECHE(pn, Pn));
    sprache      = eintrag.text;
    anzeigeEmoji = eintrag.emoji;
  } else {
    const saetze = (KUNDEN_SPRUECHE[kunde.typKey] || KUNDEN_SPRUECHE.erwachsen)(pn, Pn);
    sprache      = zufallsElement(saetze);
    anzeigeEmoji = kunde.typEmoji || '🧑';
  }

  const panel = document.getElementById('panel-customer');
  // Unhöfliche Kunden deutlich rot markieren
  panel.classList.toggle('kunde-unhoeflich', !!kunde.unfreundlich);
  const hinweis = document.getElementById('customer-unhoeflich-hinweis');
  hinweis.textContent = TEXTE.customer.unhoeflichHinweis;
  hinweis.classList.toggle('hidden', !kunde.unfreundlich);

  document.getElementById('customer-emoji').textContent  = anzeigeEmoji;
  document.getElementById('customer-speech').textContent = sprache;
  // Satz merken – im Lese-Profi-Modus muss das Kind ihn beim Einpacken lesen
  kunde._sprache = sprache;
  // Satz laut vorlesen (Stimme passend zum Alter)
  sprich(sprache, kunde.typKey, kunde.unfreundlich);
  // Buttons erst nach kurzer Pause zeigen (Kind soll zuerst lesen)
  document.getElementById('customer-payment-info').classList.add('hidden');
  panel.classList.remove('hidden');

  // Nach kurzer Pause Aktions-Buttons zeigen
  setTimeout(() => {
    if (!gameState.currentCustomer) return;
    const k = gameState.currentCustomer;

    // Einkaufsliste anzeigen (ab Stufe 2, nur Produktnamen – keine Preise hier)
    const listeEl = document.getElementById('customer-einkaufsliste');
    // Im Lese-Profi-Modus keine Liste zeigen – das Kind soll den Satz lesen
    if (einkaufsStufe >= 2 && k.einkaufsliste.length > 0 && !leseModusAktiv()) {
      listeEl.innerHTML = '';
      k.einkaufsliste.forEach(pos => {
        const prod = PRODUKTE[pos.prodKey];
        const zeile = document.createElement('div');
        zeile.className = 'customer-einkaufsliste-zeile';
        zeile.textContent = `${prod.emoji} ${pos.menge}× ${prod.name}${frischeMarke(pos)}`;
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
      // Unhöflich: beide Buttons zeigen – Kind entscheidet selbst
      btnAblehnen.textContent = TEXTE.customer.ablehnenUnhoeflich;
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

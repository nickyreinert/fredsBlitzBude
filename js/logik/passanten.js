'use strict';

/* ================================================================
   PASSANTEN – Passanten-System (Erzeugung, Bewegung, Kaufauslösung)
   ================================================================ */

// Neuen Passanten erzeugen
function neuerPassant() {
  const vonLinks = Math.random() < 0.5;
  const kd = zufallsElement(KUNDEN);
  const kannKaufen = gameState.standOpen
    && gameState.customers.length > 0
    && !gameState.currentCustomer;
  // Günstige Preise locken mehr Leute an den Stand, Wucherpreise kaum jemanden
  const anhalteChance = 0.5 * Math.min(1.6, Math.max(0.5, standAttraktivitaet()));
  const bleibtStehen = kannKaufen && Math.random() < anhalteChance;

  return {
    x:          vonLinks ? -60 : canvas.width + 60,
    richtung:   vonLinks ? 1 : -1,
    kunde:      kd,
    walkStep:   Math.random() * Math.PI * 2,
    geschwindigkeit: PASSANT_GESCHWINDIGKEIT_MIN + Math.random() * PASSANT_GESCHWINDIGKEIT_RANGE,
    bleibtStehen,
    zielX:      null,
    steht:      false,
    stehtTimer: 0,
    gespraechen: false,
    groesse:    PASSANT_GROESSE_MIN + Math.random() * PASSANT_GROESSE_RANGE,
    // Kleidung: zufällige bunte Farben
    shirt:      zufallsElement(SHIRT_FARBEN),
    hose:       zufallsElement(HOSEN_FARBEN),
  };
}

// Alle Passanten aktualisieren
function aktualisierePassanten(delta) {
  const w = canvas.width;
  const sz = szenenMasse(w, canvas.height);
  const standMitteX = sz.mitteX;
  const standBereich = sz.standB * 0.6;

  // Tagesfortschritt aktualisieren
  if (gameState.standOpen) {
    gameState.tagesfortschritt = Math.min(1, gameState.tagesfortschritt + delta / SPIELTAG_DAUER_MS);
    const tf = gameState.tagesfortschritt;
    gameState.tagesZeitSlot = tf < 0.33 ? 'morgen' : tf < 0.75 ? 'mittag' : 'abend';
  }

  // Automatisches Tagesende wenn 18:00 Uhr erreicht (tagesfortschritt >= 1.0)
  if (gameState.standOpen && gameState.tagesfortschritt >= 1.0 && !gameState.currentCustomer) {
    tagesEnde();
    return;
  }

  // Neuen Passanten spawnen (nur wenn Tag noch nicht vorbei)
  gameState.passantenTimer -= delta;
  if (gameState.passantenTimer <= 0 && gameState.standOpen && gameState.tagesfortschritt < 1.0) {
    const faktor = tagesrhythmusFaktor(gameState.tagesZeitSlot);
    if (faktor > 0) {
      gameState.passanten.push(neuerPassant());
    }
    const basisIntervall = basisPassantenIntervall();
    // Bei Regen kommen weniger Passanten (längerer Abstand)
    const wetterFaktor = wetterKundenFaktor();
    // Tiere (Fische, Papagei, Hund) locken mehr Passanten an
    const tierFaktor = zubehoerKundenBonus();
    const intervall = faktor > 0 ? basisIntervall / (faktor * wetterFaktor * tierFaktor) : 60000;
    gameState.passantenTimer = intervall * (0.7 + Math.random() * 0.6);
    speichereSpielstand();
  }

  // Jeden Passanten bewegen
  gameState.passanten = gameState.passanten.filter(p => {
    if (p.steht) {
      p.stehtTimer += delta;
      p.walkStep += delta * 0.001;

      // Fand es zu teuer: kurz traurig gucken, dann weitergehen
      if (p.zuTeuer) {
        p.zuTeuerTimer -= delta;
        if (p.zuTeuerTimer <= 0) {
          p.steht = false;
          p.bleibtStehen = false;
        }
        return true;
      }

      if (!p.gespraechen && !gameState.currentCustomer
          && gameState.customers.length > 0 && p.stehtTimer > PASSANT_WARTEZEIT_KAUF_MS) {
        p.gespraechen = true;
        passerWirdKunde(p);
      }

      const istAktiverKunde = gameState.currentCustomer
        && gameState.currentCustomer.passantRef === p;
      const kaufAbgeschlossen = p.gespraechen && !istAktiverKunde
        && gameState.currentCustomer === null;
      const keineWare = gameState.customers.length === 0 && !istAktiverKunde;
      const zuLangeGewartet = !p.gespraechen && (p.stehtTimer > PASSANT_MAX_WARTEZEIT_MS || keineWare);
      if (kaufAbgeschlossen || zuLangeGewartet) {
        p.steht = false;
        p.gespraechen = false;
        // Weitergehen und nicht gleich wieder anhalten (sonst kauft dieselbe Person mehrfach)
        p.bleibtStehen = false;
      }
      return true;
    }

    // Passant läuft
    p.walkStep += delta * 0.006;
    p.x += p.richtung * p.geschwindigkeit * (delta / 1000);

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

    const raus = p.richtung === 1 ? p.x > w + 80 : p.x < -80;
    return !raus;
  });
}

// Passant wird zum echten Kaufkunden
function passerWirdKunde(passant) {
  if (gameState.customers.length === 0) return;
  const kunde = gameState.customers.shift();
  if (!kunde) return;

  // Preise prüfen: viel zu teuer → Kunde kauft nicht und geht traurig weiter
  aktualisiereKundenPreis(kunde);
  if (!kundeWillKaufen(kunde)) {
    passant.zuTeuer = true;
    passant.zuTeuerTimer = ZU_TEUER_ANZEIGE_MS;
    // Warteschlange auffüllen, damit nach einer Preissenkung wieder Kunden kommen
    if (gameState.customers.length === 0) {
      gameState.customers.push(...generiereKunden(berechneKundenAnzahl()));
    }
    return;
  }

  kunde.haut   = passant.kunde.haut;
  kunde.haar   = passant.kunde.haar;
  kunde.frisur = passant.kunde.frisur;
  kunde.name   = passant.kunde.name;

  gameState.currentCustomer = kunde;
  gameState.currentCustomer.passantRef = passant;
  gameState.customerVisible = false;
  setTimeout(zeigeKundenDialog, 400);
}

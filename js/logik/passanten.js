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
  const bleibtStehen = kannKaufen && Math.random() < 0.5;

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
  };
}

// Alle Passanten aktualisieren
function aktualisierePassanten(delta) {
  const w = canvas.width;
  const standMitteX = w / 2;
  const standBereich = w * 0.18;

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
    const intervall = faktor > 0 ? basisIntervall / faktor : 60000;
    gameState.passantenTimer = intervall * (0.7 + Math.random() * 0.6);
    speichereSpielstand();
  }

  // Jeden Passanten bewegen
  gameState.passanten = gameState.passanten.filter(p => {
    if (p.steht) {
      p.stehtTimer += delta;
      p.walkStep += delta * 0.001;

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

  kunde.haut   = passant.kunde.haut;
  kunde.haar   = passant.kunde.haar;
  kunde.frisur = passant.kunde.frisur;
  kunde.name   = passant.kunde.name;

  gameState.currentCustomer = kunde;
  gameState.currentCustomer.passantRef = passant;
  gameState.customerVisible = false;
  setTimeout(zeigeKundenDialog, 400);
}

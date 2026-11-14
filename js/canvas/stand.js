'use strict';

/* ================================================================
   STAND – Holzstand zeichnen (braunes Rechteck mit Dach)
   ================================================================ */

function zeichneStand(w, h) {
  // Maße kommen zentral aus szenenMasse() (passt sich an Bildschirm und Panels an)
  const sz           = szenenMasse(w, h);
  const mitteX       = sz.mitteX;
  const standBreite  = sz.standB;
  const standHoehe   = sz.standH;
  const standX       = mitteX - standBreite / 2;
  const standY       = sz.standY;
  const theke        = standHoehe * 0.4;

  // Schatten
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(mitteX, standY + standHoehe + 6, standBreite * 0.52, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Holz-Rückwand
  const holzGrad = ctx.createLinearGradient(standX, standY, standX + standBreite, standY + standHoehe);
  holzGrad.addColorStop(0, '#8d6e63');
  holzGrad.addColorStop(1, '#5d4037');
  ctx.fillStyle = holzGrad;
  ctx.beginPath();
  ctx.roundRect(standX, standY, standBreite, standHoehe - theke, 8);
  ctx.fill();

  // Holzmaserung
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) {
    const lineY = standY + (standHoehe - theke) * (i / 5);
    ctx.beginPath();
    ctx.moveTo(standX + 4, lineY);
    ctx.lineTo(standX + standBreite - 4, lineY);
    ctx.stroke();
  }

  // Theke
  const thekeGrad = ctx.createLinearGradient(standX, standY + standHoehe - theke, standX, standY + standHoehe);
  thekeGrad.addColorStop(0, '#a1887f');
  thekeGrad.addColorStop(1, '#795548');
  ctx.fillStyle = thekeGrad;
  ctx.beginPath();
  ctx.roundRect(standX - 10, standY + standHoehe - theke, standBreite + 20, theke, [0, 0, 8, 8]);
  ctx.fill();

  // Thekenkante
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(standX - 10, standY + standHoehe - theke, standBreite + 20, 5);

  // Dach
  const dachUeberstand = standBreite * 0.15;
  ctx.fillStyle = '#e53935';
  ctx.beginPath();
  ctx.moveTo(standX - dachUeberstand, standY + 5);
  ctx.lineTo(mitteX, standY - standHoehe * 0.45);
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

  // Schild
  const schildBreite = standBreite * 0.55;
  const schildX = mitteX - schildBreite / 2;
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
  ctx.fillText('🥦 Freds Blitz-Bude', mitteX, schildY + schildH / 2);

  // Stand-Koordinaten für Produkte speichern
  gameState._stand = { x: standX, y: standY, b: standBreite, h: standHoehe, theke };

  // Gekaufte Stand-Erweiterungen (Markise, Blumen, Werbeschild, Kühlbox)
  zeichneErweiterungen(w, h);
}

/* ── Stand-Erweiterungen aus dem Shop ───────────────────────────── */

function zeichneErweiterungen(w, h) {
  const zb = gameState.zubehoer || {};
  const sz = szenenMasse(w, h);
  const B  = sz.standB;
  const H  = sz.standH;
  const sx = sz.mitteX - B / 2;
  const sy = sz.standY;

  // Markise: rot-weiß gestreift, mit Bögen unten (zwischen Schild und Theke)
  if (zb.markise) {
    const oben   = sy + H * 0.33;
    const hoehe  = H * 0.11;
    const links  = sx - 6;
    const breite = B + 12;
    const streifen = 10;
    const sb = breite / streifen;
    for (let i = 0; i < streifen; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#e53935' : '#ffffff';
      ctx.fillRect(links + i * sb, oben, sb + 0.5, hoehe);
      // Bogen unter jedem Streifen
      ctx.beginPath();
      ctx.arc(links + i * sb + sb / 2, oben + hoehe, sb / 2, 0, Math.PI);
      ctx.fill();
    }
    // Stange oben
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(links, oben - 4, breite, 5);
  }

  // Blumenkästen: links und rechts neben dem Namensschild
  if (zb.blumen) {
    const kastenB = B * 0.17;
    const kastenH = H * 0.06;
    const kastenY = sy + H * 0.25;
    const blumenGr = Math.max(12, H * 0.13);
    [sx + B * 0.03, sx + B * 0.97 - kastenB].forEach((kx, seite) => {
      // Blumen (sitzen im Kasten)
      ctx.font = `${blumenGr}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const blumen = seite === 0 ? ['🌷', '🌻', '🌷'] : ['🌻', '🌷', '🌻'];
      blumen.forEach((b, i) => {
        ctx.fillText(b, kx + kastenB * (0.2 + i * 0.3), kastenY + kastenH * 0.4);
      });
      // Holzkasten
      ctx.fillStyle = '#6d4c41';
      ctx.beginPath();
      ctx.roundRect(kx, kastenY, kastenB, kastenH, 3);
      ctx.fill();
    });
  }

  // Werbeschild auf dem Dach: "FRISCH!" auf zwei Pfosten über der Dachspitze
  if (zb.werbeschild) {
    const spitzeY = sy - H * 0.45;
    const schildB = B * 0.5;
    const schildH = H * 0.2;
    const schildY = spitzeY - H * 0.06 - schildH;
    const schildX = sz.mitteX - schildB / 2;
    const ueberstand = B * 0.15;
    // Pfosten: von der Dachschräge bis zum Schild
    ctx.fillStyle = '#5d4037';
    [-1, 1].forEach(seite => {
      const px = sz.mitteX + seite * schildB * 0.3;
      const dachY = spitzeY + (Math.abs(px - sz.mitteX) / (B / 2 + ueberstand)) * (sy + 5 - spitzeY);
      ctx.fillRect(px - 3, schildY + schildH - 2, 6, dachY - (schildY + schildH) + 4);
    });
    // Schild
    ctx.fillStyle = '#ffeb3b';
    ctx.strokeStyle = '#e53935';
    ctx.lineWidth = Math.max(3, H * 0.025);
    ctx.beginPath();
    ctx.roundRect(schildX, schildY, schildB, schildH, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#d32f2f';
    ctx.font = `900 ${schildH * 0.58}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FRISCH! 🥕', sz.mitteX, schildY + schildH / 2 + 1);
  }

  // Kühlbox: blaue Box rechts neben dem Stand am Straßenrand
  if (zb.kuehlbox) {
    const kb = sz.figurR * 2.6;
    const kh = sz.figurR * 1.9;
    const kx = Math.min(sx + B + sz.figurR * 0.5, w - kb - 4);
    const ky = sz.strasseY - kh;
    ctx.fillStyle = '#1e88e5';
    ctx.beginPath();
    ctx.roundRect(kx, ky, kb, kh, 6);
    ctx.fill();
    // Weißer Deckel
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(kx - 2, ky - kh * 0.12, kb + 4, kh * 0.28, 5);
    ctx.fill();
    // Schneeflocke
    ctx.font = `${kh * 0.5}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('❄️', kx + kb / 2, ky + kh * 0.6);
  }
}

// Breite, die die Kühlbox rechts neben dem Stand belegt (der Hund rückt dann weiter)
function kuehlboxPlatz(sz) {
  return gameState.zubehoer?.kuehlbox ? sz.figurR * 3.3 : 0;
}

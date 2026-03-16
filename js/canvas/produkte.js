'use strict';

/* ================================================================
   PRODUKTE – Produktzeichnungen auf dem Stand + Preisschilder
   ================================================================ */

// Klickbereiche der Preisschilder (wird jeden Frame neu befüllt)
const preisschilderHitbox = [];

// Produkte auf dem Stand zeichnen (inkl. Preisschilder)
function zeichneProdukte(_w, _h) {
  if (!gameState._stand) return;
  const { x: sX, y: sY, b: sB, h: sH, theke } = gameState._stand;

  preisschilderHitbox.length = 0;

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

    // Frische-Punkte (nur wenn Verderb aktiv)
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

    // Preisschild
    zeichnePreisschild(key, prod, px, py + r + 22, r);

    produktX += abstand;
  });
}

// Einzelnes Preisschild zeichnen und Hitbox speichern
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

  ctx.fillStyle   = hatPreis ? '#fff9e6' : '#fff3cd';
  ctx.strokeStyle = hatPreis ? '#f9a825' : '#ff8f00';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.roundRect(schildX, schildY, schildW, schildH, 6);
  ctx.fill();
  ctx.stroke();

  // Bleistift-Symbol
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

  preisschilderHitbox.push({ key, x: schildX, y: schildY, w: schildW, h: schildH });
}

// ── Einzelne Produktformen ──────────────────────────────────────

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
  ctx.beginPath();
  ctx.arc(-r * 0.25, -r * 0.3, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * 0.4, y - r * 1.5, x + r * 0.2, y - r * 1.8);
  ctx.stroke();
}

function zeichneApfel(x, y, r) {
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  grad.addColorStop(0, '#ff8a80');
  grad.addColorStop(0.5, '#f44336');
  grad.addColorStop(1, '#b71c1c');
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fill();
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * 0.5, y - r * 1.6, x + r * 0.3, y - r * 1.9);
  ctx.stroke();
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.moveTo(x + r * 0.05, y - r * 1.2);
  ctx.quadraticCurveTo(x + r * 0.7, y - r * 1.5, x + r * 0.5, y - r * 0.9);
  ctx.quadraticCurveTo(x + r * 0.2, y - r * 1.1, x + r * 0.05, y - r * 1.2);
  ctx.fill();
}

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

function zeichneKarotte(x, y, r) {
  ctx.save();
  ctx.translate(x, y);
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
  ctx.fillStyle = 'rgba(255,255,200,0.7)';
  [[-.3,-.1],[.3,-.1],[0,.3],[-.25,.45],[.25,.45]].forEach(([dx,dy]) => {
    ctx.beginPath();
    ctx.arc(x + dx * r, y + dy * r, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = '#2e7d32';
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.55);
  ctx.quadraticCurveTo(x - r * 0.5, y - r * 1.1, x - r * 0.3, y - r * 1.3);
  ctx.quadraticCurveTo(x, y - r * 0.9, x + r * 0.3, y - r * 1.3);
  ctx.quadraticCurveTo(x + r * 0.5, y - r * 1.1, x, y - r * 0.55);
  ctx.fill();
}

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
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = r * 0.25;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.75);
  ctx.quadraticCurveTo(x + r * 0.4, y - r * 1.3, x + r * 0.2, y - r * 1.5);
  ctx.stroke();
}

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
  ctx.fillStyle = '#F9A825';
  ctx.beginPath();
  ctx.ellipse(x - r * 1.2, y, r * 0.18, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 1.2, y, r * 0.18, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
}

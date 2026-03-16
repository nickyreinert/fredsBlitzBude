'use strict';

/* ================================================================
   HUD-UHR – Analoge Uhr im HUD zeichnen
   ================================================================ */

const clockCanvas = document.getElementById('hud-clock');
const clockCtx    = clockCanvas.getContext('2d');

// Zeichnet eine analoge Uhr: Arbeitszeit 8:00–18:00 Uhr.
function zeichneHudUhr(fortschritt) {
  const w  = clockCanvas.width;
  const h  = clockCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const r  = w / 2 - 3;

  clockCtx.clearRect(0, 0, w, h);

  const startStunde     = 8;
  const gesamtStunden   = 10;
  const aktuelleStunden = startStunde + fortschritt * gesamtStunden;
  const stunde12        = Math.floor(aktuelleStunden) % 12;
  const minute          = (aktuelleStunden % 1) * 60;

  const stundenWinkel = ((stunde12 + minute / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  const minutenWinkel = (minute / 60) * Math.PI * 2 - Math.PI / 2;

  // Zifferblatt
  clockCtx.beginPath();
  clockCtx.arc(cx, cy, r, 0, Math.PI * 2);
  clockCtx.fillStyle = '#fffde7';
  clockCtx.fill();
  clockCtx.strokeStyle = '#f9a825';
  clockCtx.lineWidth = 3;
  clockCtx.stroke();

  // Fortschritts-Ring
  const bogenStart = (startStunde / 12) * Math.PI * 2 - Math.PI / 2;
  const bogenEnd   = bogenStart + fortschritt * (gesamtStunden / 12) * Math.PI * 2;
  const rot   = Math.round(76  + fortschritt * (229 - 76));
  const gruen = Math.round(175 + fortschritt * (57  - 175));
  clockCtx.beginPath();
  clockCtx.arc(cx, cy, r - 2, bogenStart, bogenEnd);
  clockCtx.strokeStyle = `rgb(${rot},${gruen},50)`;
  clockCtx.lineWidth = 4;
  clockCtx.lineCap = 'round';
  clockCtx.stroke();

  // Stunden-Markierungen
  clockCtx.lineWidth = 1.5;
  for (let i = 0; i < 12; i++) {
    const a    = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const lang = (i % 3 === 0);
    clockCtx.strokeStyle = lang ? '#999' : '#ccc';
    const x1 = cx + Math.cos(a) * (r - 3);
    const y1 = cy + Math.sin(a) * (r - 3);
    const x2 = cx + Math.cos(a) * (r - (lang ? 9 : 6));
    const y2 = cy + Math.sin(a) * (r - (lang ? 9 : 6));
    clockCtx.beginPath();
    clockCtx.moveTo(x1, y1);
    clockCtx.lineTo(x2, y2);
    clockCtx.stroke();
  }

  clockCtx.lineCap = 'round';

  // Minutenzeiger
  clockCtx.strokeStyle = '#555';
  clockCtx.lineWidth = 1.5;
  clockCtx.beginPath();
  clockCtx.moveTo(cx, cy);
  clockCtx.lineTo(
    cx + Math.cos(minutenWinkel) * (r * 0.72),
    cy + Math.sin(minutenWinkel) * (r * 0.72)
  );
  clockCtx.stroke();

  // Stundenzeiger
  clockCtx.strokeStyle = '#e53935';
  clockCtx.lineWidth = 3;
  clockCtx.beginPath();
  clockCtx.moveTo(cx, cy);
  clockCtx.lineTo(
    cx + Math.cos(stundenWinkel) * (r * 0.48),
    cy + Math.sin(stundenWinkel) * (r * 0.48)
  );
  clockCtx.stroke();

  // Mittelpunkt
  clockCtx.beginPath();
  clockCtx.arc(cx, cy, 3.5, 0, Math.PI * 2);
  clockCtx.fillStyle = '#e53935';
  clockCtx.fill();
}

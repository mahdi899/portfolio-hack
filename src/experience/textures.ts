import * as THREE from "three";
import { P } from "./palette";

const make = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d")!;
  draw(c);
  const tx = new THREE.CanvasTexture(cv);
  tx.anisotropy = 4;
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
};

/** soft radial glow sprite */
export const haloTexture = (color: string, inner = 0.0) =>
  make(256, 256, (c) => {
    const g = c.createRadialGradient(128, 128, 256 * inner, 128, 128, 128);
    g.addColorStop(0, color);
    g.addColorStop(0.35, color + "66");
    g.addColorStop(1, "transparent");
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
  });

/** simple round particle dot */
export const dotTexture = () =>
  make(64, 64, (c) => {
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.4, "#ffffffcc");
    g.addColorStop(1, "transparent");
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
  });

const roundRect = (
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
};

export interface CardField {
  k: string;
  v: string;
  accent?: string;
}

/** holographic lead card texture (scene 04) */
export const leadCardTexture = (title: string, fields: CardField[], accent: string = P.cyan) =>
  make(512, 312, (c) => {
    c.clearRect(0, 0, 512, 312);
    // glass body
    roundRect(c, 8, 8, 496, 296, 28);
    c.fillStyle = "rgba(10, 13, 30, 0.88)";
    c.fill();
    c.lineWidth = 2.5;
    c.strokeStyle = accent + "99";
    c.stroke();
    // top accent strip
    roundRect(c, 8, 8, 496, 58, 28);
    c.save();
    c.clip();
    c.fillStyle = accent + "22";
    c.fillRect(8, 8, 496, 58);
    c.restore();
    c.beginPath();
    c.moveTo(8, 66);
    c.lineTo(504, 66);
    c.strokeStyle = "rgba(255,255,255,0.12)";
    c.lineWidth = 1.5;
    c.stroke();
    // title row
    c.fillStyle = accent;
    c.beginPath();
    c.arc(44, 38, 7, 0, Math.PI * 2);
    c.fill();
    c.font = "700 24px 'JetBrains Mono', monospace";
    c.fillStyle = P.white;
    c.fillText(title.toUpperCase(), 66, 46);
    // fields
    fields.forEach((f, i) => {
      const y = 110 + i * 50;
      c.font = "500 20px 'JetBrains Mono', monospace";
      c.fillStyle = "#7d87a3";
      c.fillText(f.k.toUpperCase(), 44, y);
      c.font = "700 22px 'Space Grotesk', sans-serif";
      c.fillStyle = f.accent ?? P.white;
      c.textAlign = "right";
      c.fillText(f.v, 468, y);
      c.textAlign = "left";
    });
    // corner ticks
    c.strokeStyle = accent;
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(8, 40);
    c.lineTo(8, 22);
    c.stroke();
  });

/** small uppercase label sprite (agents, system map) */
export const labelTexture = (
  text: string,
  opts: { color?: string; sub?: string; w?: number } = {}
) => {
  const w = opts.w ?? 512;
  return make(w, 128, (c) => {
    c.clearRect(0, 0, w, 128);
    c.textAlign = "center";
    c.font = "700 40px 'Orbitron', sans-serif";
    c.shadowColor = opts.color ?? P.purple;
    c.shadowBlur = 22;
    c.fillStyle = P.white;
    c.fillText(text.toUpperCase(), w / 2, opts.sub ? 56 : 76);
    if (opts.sub) {
      c.shadowBlur = 0;
      c.font = "500 26px 'JetBrains Mono', monospace";
      c.fillStyle = opts.color ?? P.textSec;
      c.fillText(opts.sub.toUpperCase(), w / 2, 102);
    }
  });
};

/** holographic console screen (scene 09) */
export const screenTexture = (
  header: string,
  rows: [string, string][],
  accent: string = P.mint
) =>
  make(512, 360, (c) => {
    c.clearRect(0, 0, 512, 360);
    roundRect(c, 6, 6, 500, 348, 22);
    c.fillStyle = "rgba(8, 12, 26, 0.92)";
    c.fill();
    c.lineWidth = 2.5;
    c.strokeStyle = accent + "88";
    c.stroke();
    // header
    c.font = "700 24px 'Orbitron', sans-serif";
    c.fillStyle = accent;
    c.fillText(header.toUpperCase(), 36, 54);
    c.beginPath();
    c.moveTo(6, 78);
    c.lineTo(506, 78);
    c.strokeStyle = "rgba(255,255,255,0.12)";
    c.lineWidth = 1.5;
    c.stroke();
    rows.forEach(([k, v], i) => {
      const y = 126 + i * 56;
      c.font = "500 21px 'JetBrains Mono', monospace";
      c.fillStyle = "#7d87a3";
      c.fillText(k.toUpperCase(), 36, y);
      c.font = "700 24px 'Space Grotesk', sans-serif";
      c.fillStyle = P.white;
      c.textAlign = "right";
      c.fillText(v, 478, y);
      c.textAlign = "left";
    });
    // scanline hint
    c.fillStyle = accent + "14";
    for (let y = 90; y < 350; y += 8) c.fillRect(6, y, 500, 1.5);
  });

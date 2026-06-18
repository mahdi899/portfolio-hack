import { chromium } from "playwright";

const URL = process.env.SHOT_URL ?? "http://localhost:5176/";

const WEIGHTS = [
  ["01-hero", 1.0],
  ["02-problem", 1.0],
  ["03-traffic", 1.0],
  ["04-capture", 1.0],
  ["05-gate", 1.05],
  ["06-agents", 1.05],
  ["07-tunnel", 0.9],
  ["08-crm", 1.0],
  ["09-human", 0.95],
  ["10-revenue", 1.05],
  ["11-cta", 0.75],
];

const total = WEIGHTS.reduce((s, [, w]) => s + w, 0);
let acc = 0;
const targets = WEIGHTS.map(([id, w]) => {
  const mid = (acc + w / 2) / total;
  acc += w;
  return [id, id === "01-hero" ? 0 : id === "11-cta" ? 0.985 : mid];
});

const only = process.argv[2];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on("console", (m) => {
  if (m.type() === "error") console.log("PAGE ERROR:", m.text());
});
page.on("pageerror", (e) => console.log("PAGE EXCEPTION:", e.message));
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

for (const [id, t] of targets) {
  if (only && !id.includes(only)) continue;
  await page.evaluate((p) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: p * max, behavior: "instant" });
  }, t);
  await page.waitForTimeout(2800);
  await page.screenshot({ path: `shots/${id}.png` });
  console.log("shot", id, "at", t.toFixed(4));
}

await browser.close();

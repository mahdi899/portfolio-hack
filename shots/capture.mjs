import { chromium } from "playwright";

const STOPS = [
  ["01-arrival", 0.0],
  ["02-traffic", 0.24],
  ["03-automation", 0.48],
  ["04-revenue", 0.68],
  ["05-activation", 1.0],
];

const browser = await chromium.launch({
  channel: "msedge",
  args: ["--use-gl=angle", "--enable-unsafe-swiftshader", "--disable-gpu-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
page.on("console", (m) => {
  if (m.type() === "error") console.log("[console.error]", m.text());
});
page.on("pageerror", (e) => console.log("[pageerror]", e.message));

await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);

for (const [name, frac] of STOPS) {
  await page.evaluate((f) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, max * f);
  }, frac);
  // wait for damped camera to settle
  await page.waitForTimeout(4500);
  await page.screenshot({ path: `shots/${name}.png` });
  console.log("captured", name);
}

await browser.close();

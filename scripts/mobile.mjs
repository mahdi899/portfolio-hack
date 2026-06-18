import { chromium } from "playwright";

const URL = process.env.SHOT_URL ?? "http://localhost:5176/";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

for (const [id, t] of [["m-hero", 0], ["m-traffic", 0.2326], ["m-gate", 0.4209], ["m-crm", 0.6977], ["m-revenue", 0.8814], ["m-cta", 0.985]]) {
  await page.evaluate((p) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: p * max, behavior: "instant" });
  }, t);
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `shots/${id}.png` });
  console.log("shot", id);
}
await browser.close();

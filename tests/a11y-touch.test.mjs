// CLEPSIDRA — regresie: ținte tactile ≥44px la 390px (casetele de bifat sunt acoperite de eticheta de 44px) și fără depășire orizontală.
// Rulare: node tests/a11y-touch.test.mjs
import path from "node:path";
import {createRequire} from "node:module";
const require = createRequire(process.env.PW_ROOT || import.meta.url); const {chromium} = require("playwright");
const FILE = "file://" + path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "index.html");
let fails = 0, passes = 0; const check = (n, c, x) => { c ? (passes++, console.log("  ok  " + n)) : (fails++, console.log("FAIL  " + n + (x !== undefined ? "  -> " + JSON.stringify(x) : ""))); };
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined});
const p = await (await b.newContext({viewport: {width: 390, height: 800}})).newPage();
const errs = []; p.on("pageerror", e => errs.push(String(e)));
await p.goto(FILE); await p.waitForTimeout(1200);
const small = await p.evaluate(() => [...document.querySelectorAll("button,select,input:not([type=hidden]),#app-version")]
  .map(e => (e.type === "checkbox" || e.type === "radio") && e.closest("label") ? e.closest("label") : e)
  .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height < 43.5; }).map(e => e.id || e.className));
check("butoane/câmpuri/etichete vizibile ≥44px", small.length === 0, small);
check("fără depășire orizontală", await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
check("0 erori JS", errs.length === 0, errs);
await b.close(); console.log(`\n${passes} reușite, ${fails} eșuate`); process.exit(fails ? 1 : 0);

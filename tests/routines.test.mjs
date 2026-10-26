// Teste v2.0: rutine compuse (lanțuri de cronometre, sunete pe tip de etapă, istoric, reluare după reîncărcare).
// Rulare: node tests/routines.test.mjs  (Playwright din NODE_PATH, Chromium local, rețea blocată, ceas simulat 14.10.2026 10:00 Europe/Bucharest)
import {createRequire as __fffCR} from 'node:module';
const __fffAxe = () => process.env.FFF_AXE || process.env.AXE_PATH || (() => { try { return __fffCR(import.meta.url).resolve('axe-core/axe.min.js'); } catch { return undefined; } })();
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.join(HERE, '..', 'index.html');
const AXE = process.env.FFF_AXE || __fffAxe();
let ok = 0, bad = 0;
const check = (n, c, x) => { if (c) { ok++; console.log('  ok   ' + n); } else { bad++; console.log('  FAIL ' + n + (x !== undefined ? '  → ' + JSON.stringify(x) : '')); } };
const TMP = fs.mkdtempSync(path.join(process.env.FFF_TMP || os.tmpdir(), 'clep-rt-'));
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox']});
const AUDIO = () => {
  window.__tones = [];
  class P { constructor() { this.v = 0; } connect() {} setValueAtTime() {} exponentialRampToValueAtTime() {} }
  class AC {
    constructor() { this.currentTime = 0; this.state = 'running'; this.destination = {}; }
    resume() {} createBuffer() { return {}; } createBufferSource() { return {connect() {}, start() {}}; }
    createGain() { return {gain: new P(), connect() {}}; }
    createOscillator() { const o = {frequency: {set value(v) { window.__tones.push(v); }}, connect() {}, start() {}, stop() {}}; return o; }
  }
  window.AudioContext = AC; window.webkitAudioContext = AC;
};
async function open(w = 1280, h = 900, ctx0) {
  const ctx = ctx0 || await b.newContext({viewport: {width: w, height: h}, acceptDownloads: true, locale: 'ro-RO', timezoneId: 'Europe/Bucharest'});
  const net = [];
  await ctx.route(/^https?:/, (r) => { net.push(r.request().url()); r.abort(); });
  const page = await ctx.newPage();
  await page.addInitScript(AUDIO);
  await page.clock.install({time: new Date('2026-10-14T10:00:00+03:00')});
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { const t = m.text(); if (/Content Security Policy|Refused to/i.test(t)) errs.push('csp: ' + t); });
  await page.goto(FILE);
  await page.waitForTimeout(300);
  return {ctx, page, errs, net};
}
const txt = (page, sel) => page.$eval(sel, (e) => e.textContent.trim());
const hist = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('clepsidra.rhist') || '[]'));

{
  const {ctx, page, errs, net} = await open();
  check('secțiunea Rutine există și rularea e ascunsă', await page.$eval('#rtRun', (e) => e.hidden) && (await page.$('#rtSection')) !== null);
  await page.selectOption('#rtTpl', 'pomo'); await page.click('#rtLoadBtn');
  check('Pomodoro: 8 etape în editor (4 × studiu + pauză)', (await page.$$('#rtSteps .rt-step')).length === 8);
  const mins = await page.$$eval('#rtSteps input[type=number]', (a) => a.map((x) => +x.value));
  check('Pomodoro: durate 25/5 ×3, apoi 25/15', JSON.stringify(mins) === JSON.stringify([25, 5, 25, 5, 25, 5, 25, 15]), mins);
  await page.click('#rtStartBtn');
  check('rularea e vizibilă, etapa 1/8, 25:00', !(await page.$eval('#rtRun', (e) => e.hidden)) && /1\/8/.test(await txt(page, '#rtRunStep')) && (await txt(page, '#rtRunTime')) === '25:00', [await txt(page, '#rtRunStep'), await txt(page, '#rtRunTime')]);
  let tones = await page.evaluate(() => window.__tones.slice());
  check('sunet de „concentrare” la start (660 → 880 Hz)', tones.join() === '660,880', tones);
  await page.clock.runFor(60000);
  const mmss = (x) => { const [m, ss] = x.split(':').map(Number); return m * 60 + ss; };
  const afterMin = mmss(await txt(page, '#rtRunTime'));
  check('după ~1 min: între 23:00 și 24:01 rămase (afișaj rotunjit, ceasul real curge pe fundal)', afterMin >= 23 * 60 && afterMin <= 24 * 60 + 1, afterMin);
  await page.click('#rtPauseBtn');
  const v1 = await txt(page, '#rtRunTime');
  await page.clock.runFor(2 * 60000);
  const v2 = await txt(page, '#rtRunTime');
  check('în pauză cronometrul nu avansează', v1 === v2 && /1\/8/.test(await txt(page, '#rtRunStep')), [v1, v2]);
  check('butonul devine „continuă”', (await txt(page, '#rtPauseBtn')) === 'continuă');
  await page.click('#rtPauseBtn');
  check('„urmează” arată etapa următoare', /Pauză \(5 min\)/.test(await txt(page, '#rtRunNext')), await txt(page, '#rtRunNext'));
  await page.click('#rtStopBtn');
  check('oprire: rularea dispare', await page.$eval('#rtRun', (e) => e.hidden));
  let h = await hist(page);
  check('istoric: intrare parțială (0 etape încheiate, ok=false, ~1 min)', h.length === 1 && h[0].done === 0 && h[0].total === 8 && h[0].ok === false && Math.round(h[0].ms / 60000) === 1, h);
  check('istoric afișat în listă', (await page.$$('#rtHistList .event-item')).length === 1);
  await page.selectOption('#rtTpl', '5010'); await page.click('#rtLoadBtn');
  check('șablon 50+10: 2 etape × 3 repetări', (await page.$$('#rtSteps .rt-step')).length === 2 && (await page.$eval('#rtRounds', (e) => e.value)) === '3');
  // rulare completă, cu durate scurte: 1 min concentrare + 1 min pauză, 2 repetări
  for (const el of await page.$$('#rtSteps input[type=number]')) await el.fill('1');
  await page.fill('#rtRounds', '2');
  await page.click('#rtStartBtn');
  check('start: 1/4, sunet de concentrare', /1\/4/.test(await txt(page, '#rtRunStep')));
  await page.evaluate(() => { window.__tones.length = 0; });
  await page.clock.runFor(63000);
  check('etapa 2/4 (pauză) după încheierea primei', /2\/4/.test(await txt(page, '#rtRunStep')), await txt(page, '#rtRunStep'));
  tones = await page.evaluate(() => window.__tones.slice());
  check('sunet distinct de pauză (880 → 587 Hz)', tones.join() === '880,587', tones);
  await page.click('#rtSkipBtn');
  check('„sari peste” trece la etapa 3/4', /3\/4/.test(await txt(page, '#rtRunStep')));
  await page.click('#rtSkipBtn');
  check('ultima etapă e semnalată', /4\/4/.test(await txt(page, '#rtRunStep')) && (await txt(page, '#rtRunNext')) === 'aceasta e ultima etapă', await txt(page, '#rtRunNext'));
  await page.evaluate(() => { window.__tones.length = 0; });
  await page.clock.runFor(63000);
  check('rutina completă se încheie singură', await page.$eval('#rtRun', (e) => e.hidden));
  h = await hist(page);
  check('istoric: 4/4 etape, ok=true', h.length === 2 && h[0].done === 4 && h[0].total === 4 && h[0].ok === true, h[0]);
  tones = await page.evaluate(() => window.__tones.slice());
  check('sunetul final (acord 523/659/784) a sunat', tones.slice(-3).join() === '523,659,784', tones.slice(-4));
  check('fără erori JS/CSP și fără rețea', errs.length === 0 && net.length === 0, {errs, net});
  await ctx.close();
}

{ // validare, salvare, ștergere, reluare după reîncărcare
  const {ctx, page, errs} = await open();
  await page.fill('#rtName', 'Test =cmd');
  await page.fill('#rtSteps .rt-step input[type=number]', '0');
  await page.click('#rtStartBtn');
  check('durată 0 min: mesaj de eroare, fără pornire', (await txt(page, '#rtMsg')).length > 10 && await page.$eval('#rtRun', (e) => e.hidden), await txt(page, '#rtMsg'));
  await page.fill('#rtSteps .rt-step input[type=number]', '601'); await page.click('#rtSaveBtn');
  check('601 min respins la salvare', (await page.$$('#rtSavedList .event-item')).length === 0);
  await page.fill('#rtSteps .rt-step input[type=text]', 'Citit');
  await page.fill('#rtSteps .rt-step input[type=number]', '2');
  await page.click('#rtAddStep');
  const rows = await page.$$('#rtSteps .rt-step');
  check('+ etapă adaugă un rând', rows.length === 2);
  await rows[1].$eval('input[type=number]', (e) => { e.value = '1'; e.dispatchEvent(new Event('input', {bubbles: true})); });
  await rows[1].$eval('select', (e) => { e.value = 'rest'; e.dispatchEvent(new Event('change', {bubbles: true})); });
  await page.click('#rtSaveBtn');
  check('rutină salvată și afișată', (await page.$$('#rtSavedList .event-item')).length === 1 && /2 etape · 3 min/.test(await txt(page, '#rtSavedList .event-item small')), await txt(page, '#rtSavedList')); 
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('clepsidra.routines')));
  check('stocare cu prefixul clepsidra.', stored.length === 1 && stored[0].steps[0].label === 'Citit' && stored[0].steps[1].kind === 'rest', stored);
  await page.click('#rtSavedList .event-item button:first-child');
  check('pornire din lista salvată', /1\/2/.test(await txt(page, '#rtRunStep')) && (await txt(page, '#rtRunTime')) === '02:00');
  await page.clock.runFor(30000);
  await page.reload(); await page.waitForTimeout(300);
  const txt0 = await txt(page, '#rtRunTime');
  check('după reîncărcare rularea continuă (~1:30 rămase)', !(await page.$eval('#rtRun', (e) => e.hidden)) && (() => { const [m, ss] = (txt0 || '').split(':').map(Number); return m * 60 + ss >= 60 && m * 60 + ss <= 92; })(), await txt(page, '#rtRunTime'));
  await page.click('#rtStopBtn');
  await page.click('#rtSavedList .event-item button[aria-label^="șterge"]');
  check('ștergere rutină salvată', (await page.$$('#rtSavedList .event-item')).length === 0);
  check('fără erori JS/CSP', errs.length === 0, errs);
  await ctx.close();
}

{ // reluare după întrerupere lungă (pagină suspendată): recuperează etapele fără sunet
  const {ctx, page} = await open();
  await page.evaluate(() => {
    localStorage.setItem('clepsidra.run', JSON.stringify({name: 'Salt', steps: [{label: 'A', min: 5, kind: 'focus'}, {label: 'B', min: 5, kind: 'rest'}, {label: 'C', min: 30, kind: 'other'}], i: 0, endAt: Date.now() + 60000, paused: false, remMs: 0, t0: Date.now() - 240000, ran: 0}));
  });
  await page.clock.fastForward(12 * 60000);
  await page.reload(); await page.waitForTimeout(300);
  check('după 12 min offline: etapa 3/3, fără sunet de recuperare', /3\/3/.test(await txt(page, '#rtRunStep')) && (await page.evaluate(() => window.__tones.length)) === 0, [await txt(page, '#rtRunStep')]);
  // date corupte în stocare
  await page.evaluate(() => { localStorage.setItem('clepsidra.run', '{"steps":[{"min":"x"}]}'); localStorage.setItem('clepsidra.routines', '[1,null,{"steps":[]}]'); localStorage.setItem('clepsidra.rhist', '"x"'); });
  await page.reload(); await page.waitForTimeout(300);
  check('stocare coruptă: aplicația pornește, fără rulare', await page.$eval('#rtRun', (e) => e.hidden) && (await page.$$('#rtSavedList .event-item')).length === 0);
  await ctx.close();
}

{ // șablon „din programul de azi” + export CSV
  const {ctx, page} = await open();
  await page.selectOption('#rtTpl', 'today'); await page.click('#rtLoadBtn');
  const n = (await page.$$('#rtSteps .rt-step')).length;
  const first = await page.$eval('#rtSteps .rt-step input[type=number]', (e) => +e.value);
  check('din programul de azi: etape pentru intervalele rămase (ora 10:00)', n >= 3 && first >= 1 && first <= 600, {n, first});
  await page.fill('#rtSteps .rt-step input[type=text]', '=HYPERLINK("x")');
  await page.fill('#rtSteps .rt-step input[type=number]', '1');
  await page.click('#rtStartBtn'); await page.clock.runFor(61000); await page.click('#rtStopBtn');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#rtHistCsv')]);
  const p = path.join(TMP, dl.suggestedFilename()); await dl.saveAs(p);
  const csv = fs.readFileSync(p, 'utf8');
  check('CSV: antet + rând, fără injecție de formule', /^﻿name,start_iso,steps_done/.test(csv) && csv.split('\r\n').length === 3 && !/^"=/m.test(csv), csv);
  await page.click('#rtHistClear');
  check('ștergere istoric', (await hist(page)).length === 0 && (await page.$$('#rtHistList .event-item')).length === 0);
  await ctx.close();
}

{ // limbi: nicio cheie brută în secțiune
  const {ctx, page} = await open();
  for (const l of ['ro', 'en', 'fr', 'it', 'es', 'pt', 'de', 'hu']) {
    await page.selectOption('#langSel', l);
    await page.selectOption('#rtTpl', 'pomo'); await page.click('#rtLoadBtn');
    const raw = await page.$eval('#rtSection', (e) => (e.innerText + ' ' + [...e.querySelectorAll('[aria-label]')].map((x) => x.getAttribute('aria-label')).join(' ')).match(/\brt_[a-z0-9_]+/g));
    check('limba ' + l + ': fără chei netraduse', !raw, raw);
  }
  await ctx.close();
}

{ // accesibilitate + mobil
  const {ctx, page} = await open(360, 740);
  await page.selectOption('#rtTpl', 'pomo'); await page.click('#rtLoadBtn'); await page.click('#rtStartBtn');
  const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('fără depășire orizontală la 360 px', o <= 1, o);
  if (AXE) {
    await page.evaluate(fs.readFileSync(AXE, 'utf8') + '\n;0');
    const ax = await page.evaluate(async () => (await window.axe.run(document, {resultTypes: ['violations']})).violations.map((v) => v.id + ':' + v.nodes.length));
    check('axe 0 violări cu rutina pornită', ax.length === 0, ax);
  } else check('axe disponibil', false, 'FFF_AXE lipsește');
  await ctx.close();
}
await b.close();
fs.rmSync(TMP, {recursive: true, force: true});
console.log(`CLEPSIDRA routines: ${ok} ok, ${bad} eșuate`);
process.exit(bad ? 1 : 0);

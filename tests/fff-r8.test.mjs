// Teste r8 (14 oct. 2026): export calendar (.ics) pentru program/evenimente/alarmă + tipărire program.
// Rulare: node tests/fff-r8.test.mjs  (Playwright din /opt/node-tools, Chromium local, rețea blocată, ceas simulat 14.10.2026 10:00 Europe/Bucharest)
// Verificarea independentă cu `icalendar`/`dateutil` (Python) rulează dacă pachetele sunt disponibile (FFF_PYLIB=<director>).
// [fff-portable] axe-core: FFF_AXE / AXE_PATH, apoi pachetul `axe-core` (npm i -D axe-core). Dacă lipsește: undefined (testele cu axe pică cu mesaj clar).
import {createRequire as __fffCR} from 'node:module';
const __fffAxe = () => { try { return __fffCR(import.meta.url).resolve('axe-core/axe.min.js'); } catch { return undefined; } };
// [fff-portable] versiunea/data/kitul aplicației se citesc din app.json (nu mai sunt hard-codate în teste)
import {readFileSync as __fffRF} from 'node:fs';
const __FFF_APP = JSON.parse(__fffRF(new URL('../app.json', import.meta.url), 'utf8'));
const __fffRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync, execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.join(HERE, '..', 'index.html');
const AXE = process.env.FFF_AXE || __fffAxe();
let ok = 0, bad = 0;
const check = (n, c, x) => { if (c) { ok++; console.log('  ok   ' + n); } else { bad++; console.log('  FAIL ' + n + (x !== undefined ? '  → ' + JSON.stringify(x) : '')); } };
const TMP = fs.mkdtempSync(path.join(process.env.FFF_TMP || os.tmpdir(), 'clep-'));

const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox']});
async function open(w = 1280, h = 800) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, acceptDownloads: true, locale: 'ro-RO', timezoneId: 'Europe/Bucharest'});
  const net = [];
  await ctx.route(/^https?:/, (r) => { net.push(r.request().url()); r.abort(); });
  const page = await ctx.newPage();
  await page.clock.install({time: new Date('2026-10-14T10:00:00+03:00')});
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { const t = m.text(); if (/Content Security Policy|Refused to/i.test(t)) errs.push('csp: ' + t); });
  await page.goto(FILE);
  await page.waitForTimeout(500);
  return {ctx, page, errs, net};
}
async function download(page, selector) {
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click(selector)]);
  const p = path.join(TMP, dl.suggestedFilename());
  await dl.saveAs(p);
  return {name: dl.suggestedFilename(), text: fs.readFileSync(p, 'utf8'), path: p};
}
function structural(text) {
  const lines = text.split('\r\n');
  return {
    crlf: !/[^\r]\n/.test(text) && text.endsWith('\r\n'),
    maxBytes: Math.max(...lines.map((l) => Buffer.byteLength(l, 'utf8'))),
    begin: (text.match(/^BEGIN:VEVENT/gm) || []).length, end: (text.match(/^END:VEVENT/gm) || []).length,
    cal: text.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n') && text.trimEnd().endsWith('END:VCALENDAR')
  };
}
// oracol independent: sărbători legale RO 2026–2027 (Paște ortodox din dateutil)
function oracleHolidays() {
  const py = `
from dateutil.easter import easter, EASTER_ORTHODOX
from datetime import timedelta, date
out = []
for y in (2026, 2027):
    for md in ['01-01','01-02','01-06','01-07','01-24','05-01','06-01','08-15','11-30','12-01','12-25','12-26']:
        out.append('%d-%s' % (y, md))
    e = easter(y, EASTER_ORTHODOX)
    for off in (-2, 0, 1, 49, 50):
        out.append((e + timedelta(days=off)).isoformat())
print(' '.join(sorted(out)))`;
  const r = spawnSync('python3', ['-I', '-c', py], {encoding: 'utf8'});
  return r.status === 0 ? r.stdout.trim().split(' ') : null;
}

{
  const {ctx, page, errs, net} = await open();
  check(`versiune ${__FFF_APP.version} în meta și #app-version`, await page.evaluate((__FFF_APP)=> document.querySelector('meta[name=application-version]').content === __FFF_APP.version && new RegExp(String.raw`^v ${__FFF_APP.versionRe} · ${__FFF_APP.updatedRe}$`).test(document.getElementById('app-version').textContent.trim()), {...__FFF_APP, versionRe: __fffRe(__FFF_APP.version), updatedRe: __fffRe(__FFF_APP.updated)}));

  // --- program ---
  const s = await download(page, '#icsScheduleBtn');
  const st = structural(s.text);
  check('program: nume fișier și structură VCALENDAR (CRLF, linii ≤ 75 octeți)', s.name === 'clepsidra-program.ics' && st.cal && st.crlf && st.maxBytes <= 75, st);
  check('program: 11 + 7 intervale = 18 VEVENT (BEGIN = END)', st.begin === 18 && st.end === 18, st);
  check('program: RRULE săptămânal cu UNTIL, EXDATE și RDATE pentru sărbători', /RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;UNTIL=20271014T235959/.test(s.text) && /EXDATE:2026113[0]T/.test(s.text.replace(/\r\n /g, '')) && /RDATE:/.test(s.text));
  check('mesaj de confirmare afișat', /18 intervale/.test(await page.textContent('#icsSchedMsg')), await page.textContent('#icsSchedMsg'));
  const py = spawnSync('python3', ['-I', path.join(HERE, 'ics_check.py'), s.path, '2026-10-14', '2027-10-13'], {encoding: 'utf8', env: {...process.env}});
  if (py.status === 3) {
    console.log('  --   verificare independentă (icalendar/dateutil) omisă: pachetele lipsesc');
  } else {
    check('verificare independentă: scriptul Python rulează', py.status === 0, py.stderr.slice(0, 300));
    const out = JSON.parse(py.stdout || '{"days":{}}');
    const D = out.days;
    const wd = ['07:00-07:30|mese', '07:30-08:00|deplasare', '08:00-12:30|serviciu', '12:30-13:00|mese', '13:00-16:30|serviciu', '16:30-17:00|deplasare', '17:00-19:00|timp liber', '19:00-19:30|mese', '19:30-22:30|timp liber', '22:30-23:00|altele', '23:00-07:00|somn'].map((x) => x).sort();
    check('miercuri 21.10.2026 are programul zilelor lucrătoare (11 intervale)', JSON.stringify(D['2026-10-21']) === JSON.stringify(wd), D['2026-10-21']);
    const sat = D['2026-10-17'];
    check('sâmbătă 17.10.2026 are programul de weekend (nu cel de serviciu)', sat && sat.length === 7 && !sat.some((x) => /serviciu/.test(x)), sat);
    check('luni 30.11.2026 (Sf. Andrei) are program de weekend', D['2026-11-30'] && !D['2026-11-30'].some((x) => /serviciu/.test(x)) && D['2026-11-30'].length === 7, D['2026-11-30']);
    check('marți 01.12.2026 (Ziua Națională) are program de weekend', D['2026-12-01'] && !D['2026-12-01'].some((x) => /serviciu/.test(x)), D['2026-12-01']);
    const hol = oracleHolidays();
    if (hol) {
      const inRange = hol.filter((d) => d >= '2026-10-14' && d <= '2027-10-13');
      const wrong = [];
      for (const d of inRange) {
        const dow = new Date(d + 'T12:00:00Z').getUTCDay();
        const hasWork = (D[d] || []).some((x) => /serviciu/.test(x));
        if (hasWork) wrong.push(d + ' are serviciu');
        if (dow >= 1 && dow <= 5 && !(D[d] || []).some((x) => /\|(somn)$/.test(x))) wrong.push(d + ' lipsește somn');
      }
      check(`toate cele ${inRange.length} sărbători legale din interval (oracol dateutil) sunt zile fără „serviciu”`, wrong.length === 0, wrong);
      const workDays = Object.keys(D).filter((d) => (D[d] || []).some((x) => /serviciu/.test(x)));
      const bad2 = workDays.filter((d) => hol.includes(d) || [0, 6].includes(new Date(d + 'T12:00:00Z').getUTCDay()));
      check('niciun sfârșit de săptămână sau sărbătoare nu are „serviciu”', bad2.length === 0, bad2.slice(0, 5));
    }
  }

  // --- evenimente ---
  await page.click('#icsEventsBtn');
  check('fără evenimente: mesaj, fără descărcare', /Nu ai evenimente/.test(await page.textContent('#icsEvMsg')));
  await page.fill('#eventName', 'Examen, partea 1; sala 3');
  await page.fill('#eventWhen', '2026-12-05T09:30');
  await page.click('#eventAddBtn');
  await page.fill('#eventName', 'Concediu');
  await page.fill('#eventWhen', '2027-07-01T00:00');
  await page.click('#eventAddBtn');
  const e = await download(page, '#icsEventsBtn');
  const se = structural(e.text);
  check('evenimente: 2 VEVENT cu VALARM -15 min, structură validă', e.name === 'clepsidra-evenimente.ics' && se.begin === 2 && se.cal && se.crlf && se.maxBytes <= 75 && (e.text.match(/TRIGGER:-PT15M/g) || []).length === 2, se);
  check('evenimente: DTSTART în UTC corect (09:30 EET = 07:30Z) și text escapat', /DTSTART:20261205T073000Z/.test(e.text) && /SUMMARY:Examen\\, partea 1\\; sala 3/.test(e.text), e.text.slice(0, 600));
  check('evenimente: concediul la 01.07.2027 00:00 EEST = 30.06 21:00Z', /DTSTART:20270630T210000Z/.test(e.text));
  const pe = spawnSync('python3', ['-I', path.join(HERE, 'ics_check.py'), e.path, '2026-10-14', '2027-10-13'], {encoding: 'utf8', env: {...process.env}});
  if (pe.status === 0) { const o = JSON.parse(pe.stdout); check('evenimente: icalendar le citește (2 evenimente)', o.events === 2, o); }

  // --- alarmă ---
  await page.fill('#alarmInput', '');
  await page.click('#icsAlarmBtn');
  check('alarmă fără oră: mesaj', /Alege mai întâi ora/.test(await page.textContent('#icsAlMsg')));
  await page.fill('#alarmInput', '06:45');
  const a = await download(page, '#icsAlarmBtn');
  const sa = structural(a.text);
  check('alarmă: VEVENT zilnic la 06:45 cu VALARM PT0S', a.name === 'clepsidra-alarma.ics' && sa.begin === 1 && /RRULE:FREQ=DAILY/.test(a.text) && /DTSTART:20261015T064500/.test(a.text) && /TRIGGER:PT0S/.test(a.text), a.text);
  await page.uncheck('#repeatDaily');
  const a2 = await download(page, '#icsAlarmBtn');
  check('alarmă fără repetare: fără RRULE', !/RRULE/.test(a2.text) && /DTSTART:20261015T064500/.test(a2.text));

  // --- tipărire ---
  await page.click('#editorToggleBtn');   // editor deschis, se vede că nu intră în foaie
  await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
  await page.click('#printScheduleBtn');
  check('butonul „tipărește” apelează window.print()', (await page.evaluate(() => window.__printed)) === 1);
  const sheet = await page.evaluate(() => document.getElementById('printSheet').innerText || document.getElementById('printSheet').textContent);
  check('foaia conține ambele programe, evenimentele și alarma', /Zile lucrătoare/.test(sheet) && /Weekend/.test(sheet) && /08:00 – 12:30/.test(sheet) && /Examen/.test(sheet) && /06:45/.test(sheet), sheet.slice(0, 300));
  await page.emulateMedia({media: 'print'});
  const vis = await page.evaluate(() => ({sheet: getComputedStyle(document.getElementById('printSheet')).display, main: getComputedStyle(document.querySelector('main')).display}));
  check('în mod print: se vede doar foaia (main ascuns)', vis.sheet === 'block' && vis.main === 'none', vis);
  const pdfPath = path.join(TMP, 'program.pdf');
  await page.pdf({path: pdfPath});
  const txt = spawnSync('pdftotext', ['-layout', pdfPath, '-'], {encoding: 'utf8'});
  if (txt.status === 0) {
    check('PDF-ul tipărit conține titlul și intervalele, fără butoane/ceas', /CLEPSIDRA — programul meu/.test(txt.stdout) && /08:00 – 12:30/.test(txt.stdout) && !/exportă programul/.test(txt.stdout), txt.stdout.slice(0, 300));
    const pages = spawnSync('pdfinfo', [pdfPath], {encoding: 'utf8'}).stdout.match(/Pages:\s+(\d+)/);
    check('PDF-ul are o singură pagină', pages && pages[1] === '1', pages && pages[1]);
  } else console.log('  --   pdftotext indisponibil: verificarea PDF omisă');
  await page.emulateMedia({media: 'screen'});
  check('în mod ecran foaia e ascunsă', (await page.evaluate(() => getComputedStyle(document.getElementById('printSheet')).display)) === 'none');

  // --- kit: copia de siguranță include datele CLEPSIDRA ---
  const bundle = await page.evaluate(() => FFF.bundle.build());
  const keys = Object.keys(bundle.data);
  check('copia .fff.json (kit) include clepsidra.events și clepsidra.alarm', keys.includes('clepsidra.events') && keys.includes('clepsidra.alarm'), keys);

  // --- accesibilitate ---
  await page.evaluate(fs.readFileSync(AXE, 'utf8') + '\n;0');
  const ax = await page.evaluate(async () => (await window.axe.run(document, {resultTypes: ['violations']})).violations.map((v) => v.id + ':' + v.nodes.length));
  check('axe 0 violări (cu noile butoane și mesaje)', ax.length === 0, ax);
  check('0 erori / 0 CSP / 0 rețea', errs.length === 0 && net.length === 0, {errs, net});
  await ctx.close();
}
{
  const {ctx, page} = await open(360, 740);
  const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('fără depășire orizontală la 360 px', o <= 1, o);
  await ctx.close();
}
await b.close();
fs.rmSync(TMP, {recursive: true, force: true});
console.log(`CLEPSIDRA fff-r8: ${ok} ok, ${bad} eșuate`);
process.exit(bad ? 1 : 0);

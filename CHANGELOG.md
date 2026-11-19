# Changelog — CLEPSIDRA

Format: SemVer MAJOR.MINOR.PATCH. Date: AAAA-LL-ZZ.

## 2.2.3 — 2026-11-20

- fff-kit 1.8.1: când `localStorage`/`sessionStorage` aruncă sau lipsesc (cookie-uri și date de site blocate, WebView fără stocare, `<iframe sandbox>`), kitul pune în loc o stocare în memorie, iar pagina pornește în loc să se oprească; datele nu se păstrează după închiderea paginii
- fff-kit 1.8.1: ghidajul care mărește controalele mici la 44 px măsoară acum și lățimea corpului paginii și a părintelui, deci un rând de butoane nu mai poate ieși din ecran (grupul rămâne neatins când mărirea l-ar depăși)

## 2.2.2 — 2026-11-17

- Compatibilitate cu browsere mai vechi (Chrome/Edge 55+, Firefox 52+, Safari 10.1+/iOS 10.3+): kitul 1.8.0 aduce stratul de compatibilitate (rezerve pentru API-urile care lipsesc în motoarele vechi), iar sintaxa JavaScript mai nouă decât ES2017 a fost înlocuită cu forme echivalente acolo unde exista; expresiile regulate noi și `import()` trec prin rezerve. Fără modificări de funcționalitate intenționate. Verificat cu parser ES2017 și într-un motor vechi simulat, nu pe dispozitive reale.

## 2.2.1 — 2026-11-15

- New: social-sharing buttons (vertical, on the left edge; no external scripts, plain links opened only on click); the magnifier zoom and “fit screen” bar returns to the right edge, vertically centred; fixed overlapping layout at high zoom (panels sized in vh/vw no longer overflow the screen).

## 2.2.0 — 2026-11-15

- New: accessibility on every screen — the “Aa” button (text size, high contrast, no animations, readable text, underlined links, read aloud), a “Back to top” arrow and “Skip to content”; the window always fits the screen; the magnifier zoom and “fit screen” controls now sit on the left edge (fff-kit 1.6.0).

## 2.1.10 — 2026-11-15

- Nou: texturi fractale hiper-detaliate (fff-texturi 1.1.2) — fundalul și suprafețele mari (carduri, panouri, antete, butoane; filele și dialogurile ascunse la încărcare, când se deschid) primesc un material generat local (WebGL2, fără rețea și fără imagini), care se repetă fără cusătură; culorile aplicației rămân ale ei. Se oprește din dialogul „Transparență” sau cu `?notex=1`.

## 2.1.5 — 2026-11-08

- Buton „Testează alarma (3 s)” lângă „activează”: sună o dată peste 3 secunde, fără să modifice alarma reală (8 limbi); test `test-alarma`.

## 2.1.2 — 2026-11-03

- Nou (Etapa 6, suita cer–timp): **locația, ora și fusul orar comune** cu Eclipsa-2027, Bolta, Horizons, Universul Observabil 3D, ORARIUM, CLEPSIDRA și Orar (modul `fff-place`): butonul „📍 Locație” (formular, 38 de orașe, geolocalizare doar la cerere și cu acord explicit, plic `place/fff` prin fișier/clipboard/QR/link), panoul **„Astea se întâmplă deasupra ta mâine”** (Soare, Lună, planete, eclipse; calcul local, fără rețea) și **alertă la eclipsă**. Pe aceeași origine locația se propagă singură; între adrese diferite, printr-un link/plic (o apăsare). Vezi docs/SUITA-CER-TIMP.md în hub.

## 2.1.1 — 2026-11-03

Agendă comună FFF: trimite/primește agenda (agenda/fff, .ics) între Orar, Gospodar și CLEPSIDRA prin plicul FFF, fără server.

## 2.1.0 — 2026-11-02 (reîmprospătare kit)

- Nou (kit): **Sincronizare între dispozitive** (`FFF.sync`) — în dialogul «Transparență» (clic pe versiune → Copie de siguranță): conectezi două dispozitive direct (WebRTC, cod/QR, fără server și fără cont) și își schimbă datele aplicației; cea mai recentă valoare câștigă, secretele (chei API, parole) nu se trimit, ștergerile nu se propagă. Aplicarea trece prin importul kitului (confirmare, chei permise, rollback).
- Nou (kit): **Istoric local — «mașina timpului»** (`FFF.history`) — instantanee automate ale datelor (IndexedDB, fără secrete), diferență față de starea curentă și restaurare reversibilă; «Șterge datele aplicației» șterge și istoricul.
- Module adăugate: `qr`, `p2p`, `sync`, `history` (+~140 KB). Versiunea aplicației nu se schimbă.

## 2.1.0 — 2026-11-01

- Corectat: adaptorul «Trimite la…» nu mai aruncă eroare când kitul FFF lipsește (gardian pe fiecare bloc; găsit de testul «fără kit» din CI).

Nou: «Trimite la…» (fff-kit, modulul FFF.bridge) — după orice export de fișier (GPX, ICS, CSV, Markdown) apare butonul «Trimite la…» către aplicațiile compatibile, iar importul de fișiere al aplicației primește plicuri .fff.json trimise de ele, cu confirmare înainte de import. Fără rețea, fără telemetrie.

## 2.0.1 — 2026-10-27

Doar texte și documentație (fără modificări de logică).

- Nou: secțiune „Clepsidra, Clopoțel sau Orar? Care e diferența” în README (toate cele 8 limbi) și în aplicație, în subsol (bloc pliabil, tradus în 8 limbi), cu linkuri „vezi și” către Clopoțel și Orar. Aplicațiile rămân separate și nu își schimbă date între ele.
- README: liniile „Stare: stabil” și „Offline: complet”.
- Metadate: versiune, dată, SHA-256 canonic în `app.json` și `fff-info`; hash-ul CSP al scriptului principal recalculat (s-au adăugat doar chei de traducere).

## 2.0.0 — 2026-10-26

Rutine compuse (vezi README).

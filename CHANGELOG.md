# Changelog — CLEPSIDRA

Format: SemVer MAJOR.MINOR.PATCH. Date: AAAA-LL-ZZ.

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

# CLEPSIDRA

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · **Italiano** · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

**Versione:** 1.1.0 · **Ultimo aggiornamento:** 2026-10-14

Orologio inverso: non il tempo trascorso, ma il tempo rimanente della giornata e della settimana, più una sveglia e programmi per i giorni lavorativi e il fine settimana.

**Online:** https://chiuta.github.io/CLEPSIDRA/

![Schermata](screenshot.png)

## Che cos'è

Un unico file HTML, senza dipendenze esterne, in lingua rumena. Mostra quanto manca a mezzanotte, quanto resta della settimana lavorativa (o del fine settimana), quale attività si svolge «adesso» secondo il tuo programma e quante ore restano oggi per ciascuna categoria. Nasce «da un pensiero del libro Nemurirea, sull'orologio biologico».

## Funzioni

Verificate nel codice e in test automatici (Chromium headless, orologio simulato, fuso orario Europe/Bucharest):
- Conto alla rovescia fino alla prossima mezzanotte, calcolato sul calendario locale: nei giorni con cambio d'ora le giornate durano 23 o 25 ore e il conto alla rovescia ne tiene conto.
- Conto alla rovescia fino alla fine della settimana lavorativa (sabato 00:00) o del fine settimana (lunedì 00:00). Il fine settimana è fissato a sabato–domenica; i giorni festivi legali della Romania sono trattati come giorni liberi (casella «festività legali», attiva per impostazione predefinita, si può disattivare), con indicazione della prossima festività e del suo nome.
- Programma separato per i giorni lavorativi e il fine settimana, con sei categorie (sonno, spostamenti, lavoro, pasti, tempo libero, altro), barra della giornata, «adesso» e tempo rimanente per categoria; editor di intervalli (anche a cavallo della mezzanotte). L'editor avvisa in caso di intervalli sovrapposti; un intervallo con inizio = fine viene ignorato.
- Eventi: fino a 6 conti alla rovescia verso una data e un'ora a tua scelta (nome fino a 40 caratteri), ordinati cronologicamente, con il tempo rimanente in giorni di 24 ore (`z`) e `HH:MM:SS`; gli eventi passati restano visibili con «trascorso da …» finché non li elimini. Convalida con messaggi (nome mancante, data mancante, limite di 6).
- Sveglia a un'ora scelta, con l'opzione «ripeti ogni giorno», suono ripetuto fino a «ferma», lampeggio visivo e notifica del browser (se la consenti).

## Novità (1.1.0)

- **Esportazione calendario (.ics)** per: il programma della giornata (giorni lavorativi / fine settimana, ripetizione settimanale, orari come «ore flottanti», con eccezioni per le festività legali della Romania su 12 mesi), i tuoi eventi (con promemoria 15 minuti prima) e la sveglia (ripetizione giornaliera se «ripeti ogni giorno» è spuntato). I file sono stati verificati con la libreria Python `icalendar` e con un calcolo indipendente della Pasqua ortodossa.
- **Stampa / PDF del programma**: il pulsante di stampa prepara un foglio con i due programmi (giorni lavorativi e fine settimana) e l'elenco degli eventi; il resto della pagina non viene stampato.
- Copia di sicurezza `.fff.json` (modalità comune «fff-kit», locale, senza rete): si apre dalla finestra che compare cliccando sulla versione nel piè di pagina (esportazione, esportazione cifrata con password, importazione con conferma, cancellazione dei dati dell'app). La copia comprende le chiavi `clepsidra.*`.
- L'interfaccia è solo in rumeno; non ci sono nuove traduzioni da verificare.

## Guida all'uso

1. Apri la pagina; l'orologio parte da solo.
2. Per il programma: premi «modifica il programma», scegli la scheda «giorni lavorativi» o «fine settimana», modifica gli orari e le categorie o aggiungi/elimina intervalli. Le modifiche vengono salvate automaticamente nel browser.
3. Per la sveglia: scegli l'ora, spunta o meno «ripeti ogni giorno» e premi «attiva» (a questo clic il browser può chiedere il permesso per le notifiche e attiva il suono).
4. Quando la sveglia suona, premi «ferma».

## Privacy e rete

- Non viene effettuata alcuna richiesta di rete; il file non carica risorse esterne (ha anche una politica CSP restrittiva) e non ha telemetria.
- Archiviazione locale (`localStorage`): `clepsidra.schedule` (i programmi) e `clepsidra.alarm` (ora della sveglia, ripetizione, attiva) e `clepsidra.holidays` (la casella delle festività legali) e `clepsidra.events` (gli eventi). I dati in archivio vengono convalidati al caricamento; se l'archiviazione è bloccata, l'app funziona ma non conserva le impostazioni.
- Le esportazioni `.ics` e la copia `.fff.json` vengono generate nel browser e scaricate solo quando premi i pulsanti; non contengono dati diversi da quelli sopra indicati.
- Permessi: notifiche (richieste solo al clic su «attiva») e suono.

## Limiti e avvertenze

- **La sveglia funziona solo finché la pagina resta aperta e attiva.** Con la scheda in background i browser rallentano i timer; su telefono con schermo bloccato o con la pagina chiusa la sveglia può suonare in ritardo o non suonare affatto (l'app lo dice anche nell'interfaccia; se rileva la sveglia in ritardo, mostra «N min fa»). Non usarla come unica sveglia per cose importanti.
- Se la pagina era chiusa al momento della sveglia, questa non suona alla riapertura; viene riprogrammata per la successiva occorrenza dell'ora.
- Su iOS/Safari il suono è consentito solo dopo un gesto dell'utente: per questo il suono si attiva alla pressione di «attiva». Non ho potuto testare su dispositivi iOS reali.
- L'elenco delle festività segue la legislazione alla data della verifica e può diventare obsoleto se la legge cambia; i giorni liberi di altri culti o quelli concessi con decisioni puntuali (ponti) non sono inclusi.
- Il programma predefinito è un esempio; modificalo secondo necessità. Nei giorni con cambio d'ora la barra della giornata è scalata alla durata reale (23/25 h), ma le etichette 00–24 restano fisse.

## Esecuzione locale / offline

Scarica `index.html` e aprilo nel browser; funziona completamente senza internet.

## Cronologia / Changelog

### 14 ottobre 2026 (v1.1.0)
- Esportazione `.ics` (programma, eventi, sveglia), foglio di stampa / PDF del programma.
- Copia `.fff.json` tramite i moduli comuni (core, label, bundle); nuovi test: `tests/fff-r8.test.mjs` e `tests/ics_check.py` (verifica indipendente; richiede il pacchetto Python `icalendar`).

### 12 ottobre 2026 (v1.0.0)
- 1.0.0 — 2026-10-12: la versione e la data dell'ultimo aggiornamento sono mostrate nell'app

### 11 ottobre 2026 (seconda voce)
- Nuova funzione: «eventi» — conti alla rovescia verso date scelte dall'utente, conservati in locale (testato: convalida, aggiunta, ordinamento, passato, eliminazione, persistenza al ricaricamento, limite di 6).

### 11 ottobre 2026
- Verifica dell'11 ottobre 2026: axe 0 violazioni, nessun errore in console, nessuno sforamento orizzontale a 360 px; i conti alla rovescia sono calcolati dinamicamente dall'orologio locale (compreso il cambio d'ora del 25 ottobre 2026), quindi non contengono date fisse obsolete.
- Novità: le festività legali della Romania (elenco verificato l'11 ottobre 2026 nel Codice del lavoro art. 139 e in un elenco 2026; Pasqua ortodossa calcolata con l'algoritmo di Meeus, +13 giorni) contano come giorni liberi nel conto alla rovescia della settimana; casella per disattivarle, riga «prossima festività». Screenshot aggiornato.

## Licenza

Licenza MIT — vedi il file `LICENSE`.

## Autore

Alexio — Alexandru-Ionuț Chiuță, contatto: alexio@trom.tf

## Riepilogo

CLEPSIDRA è un «orologio inverso» rumeno in un unico file: tempo rimanente della giornata e della settimana lavorativa/fine settimana, un programma giornaliero con modelli separati per i giorni lavorativi e il fine settimana, e una sveglia. I giorni con cambio d'ora (23/25 h) sono gestiti tramite la mezzanotte di calendario. Nessuna richiesta di rete, nessuna telemetria; le impostazioni sono conservate in localStorage e convalidate al caricamento. La sveglia funziona solo finché la pagina è aperta e attiva (l'app lo dice con franchezza nell'interfaccia). Licenza non ancora dichiarata.

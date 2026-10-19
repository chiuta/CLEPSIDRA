# CLEPSIDRA

[English](README.md) · [Română](README.ro.md) · **Français** · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

**Version :** 1.2.0 · **Dernière mise à jour :** 2026-10-19

Langues de l'interface : **Română, English, Français, Italiano, Español, Português (PT), Deutsch, Magyar**

Horloge inversée : non pas le temps écoulé, mais le temps restant dans la journée et dans la semaine, avec en plus une alarme et des emplois du temps pour les jours ouvrables et le week-end.

**En ligne :** https://chiuta.github.io/CLEPSIDRA/

![Capture d'écran](screenshot.png)

## De quoi s'agit-il

Un seul fichier HTML, sans dépendances externes, avec une interface en 8 langues. Il indique combien de temps il reste jusqu'à minuit, combien il reste de la semaine de travail (ou du week-end), quelle activité a lieu « maintenant » selon votre emploi du temps, et combien d'heures il reste aujourd'hui dans chaque catégorie. Il part « d'une pensée du livre Nemurirea, sur l'horloge biologique ».

## Fonctionnalités

Vérifiées dans le code et dans des tests automatisés (Chromium sans interface, horloge simulée, fuseau horaire Europe/Bucharest) :
- Compte à rebours jusqu'au prochain minuit, calculé sur le calendrier local : les jours de changement d'heure durent 23 ou 25 heures et le compte à rebours en tient compte.
- Compte à rebours jusqu'à la fin de la semaine de travail (samedi 00:00) ou du week-end (lundi 00:00). Le week-end est fixé au samedi–dimanche ; les jours fériés légaux de Roumanie sont traités comme des jours de repos (case « jours fériés », cochée par défaut, désactivable), avec affichage du prochain jour férié et de son nom.
- Emploi du temps distinct pour les jours ouvrables et le week-end, avec six catégories (sommeil, trajet, travail, repas, temps libre, autres), barre de la journée, « maintenant » et temps restant par catégorie ; éditeur d'intervalles (y compris à cheval sur minuit). L'éditeur avertit en cas d'intervalles qui se chevauchent ; un intervalle dont le début = la fin est ignoré.
- Événements : jusqu'à 6 comptes à rebours vers une date et une heure de votre choix (nom jusqu'à 40 caractères), triés chronologiquement, avec le temps restant en jours de 24 heures (`z`) et `HH:MM:SS` ; les événements passés restent affichés avec « passé depuis … » jusqu'à leur suppression. Validation avec messages (nom manquant, date manquante, limite de 6).
- Alarme à une heure choisie, avec l'option « répéter chaque jour », son répété jusqu'à « arrêter », flash visuel et notification du navigateur (si vous l'autorisez).

## Nouveautés (1.1.0)

- **Export de calendrier (.ics)** pour : l'emploi du temps de la journée (jours ouvrables / week-end, répétition hebdomadaire, heures en « heures flottantes », avec exceptions pour les jours fériés légaux de Roumanie sur 12 mois), vos événements (avec un rappel 15 minutes avant) et l'alarme (répétition quotidienne si « répéter chaque jour » est coché). Les fichiers ont été vérifiés avec la bibliothèque Python `icalendar` et avec un calcul indépendant de la Pâques orthodoxe.
- **Impression / PDF de l'emploi du temps** : le bouton d'impression prépare une feuille avec les deux emplois du temps (jours ouvrables et week-end) et la liste des événements ; le reste de la page n'est pas imprimé.
- Sauvegarde `.fff.json` (mode commun « fff-kit », local, sans réseau) : s'ouvre depuis la fenêtre qui apparaît en cliquant sur la version dans le pied de page (export, export chiffré par mot de passe, import avec confirmation, suppression des données de l'application). La sauvegarde couvre les clés `clepsidra.*`.
- L'interface compte 8 langues (RO, EN, FR, IT, ES, PT, DE, HU) ; les traductions autres que le roumain sont automatiques et non vérifiées par des locuteurs natifs.

## Mode d'emploi

1. Ouvrez la page ; l'horloge démarre toute seule.
2. Pour l'emploi du temps : appuyez sur « modifier l'emploi du temps », choisissez l'onglet « jours ouvrables » ou « week-end », modifiez les heures et les catégories ou ajoutez/supprimez des intervalles. Les modifications sont enregistrées automatiquement dans le navigateur.
3. Pour l'alarme : choisissez l'heure, cochez ou non « répéter chaque jour » et appuyez sur « activer » (à ce clic, le navigateur peut demander l'autorisation d'afficher des notifications et active le son).
4. Quand l'alarme sonne, appuyez sur « arrêter ».

## Confidentialité et réseau

- Aucune requête réseau n'est effectuée ; le fichier ne charge aucune ressource externe (il a aussi une politique CSP restrictive) et n'a pas de télémétrie.
- Stockage local (`localStorage`) : `clepsidra.schedule` (les emplois du temps) et `clepsidra.alarm` (heure de l'alarme, répétition, active) et `clepsidra.holidays` (la case des jours fériés) et `clepsidra.events` (les événements). Les données du stockage sont validées au chargement ; si le stockage est bloqué, l'application fonctionne mais ne conserve pas les réglages.
- Les exports `.ics` et la sauvegarde `.fff.json` sont générés dans le navigateur et téléchargés uniquement lorsque vous appuyez sur les boutons ; ils ne contiennent aucune donnée en dehors de celles mentionnées ci-dessus.
- Autorisations : notifications (demandées uniquement au clic sur « activer ») et son.

## Limites et avertissements

- **L'alarme ne fonctionne que tant que la page reste ouverte et active.** Lorsque l'onglet est en arrière-plan, les navigateurs ralentissent les minuteurs ; sur un téléphone à l'écran verrouillé ou avec la page fermée, l'alarme peut sonner avec retard ou pas du tout (l'application l'indique aussi dans l'interface ; si elle capte l'alarme tardivement, elle affiche « il y a N min »). Ne l'utilisez pas comme unique alarme pour des choses importantes.
- Si la page était fermée au moment de l'alarme, celle-ci ne sonne pas à la réouverture ; elle est reprogrammée pour la prochaine occurrence de l'heure.
- Sur iOS/Safari, le son n'est autorisé qu'après un geste de l'utilisateur : c'est pourquoi le son est activé au moment d'appuyer sur « activer ». Je n'ai pas pu tester sur de vrais appareils iOS.
- La liste des jours fériés suit la législation à la date de vérification et peut devenir obsolète si la loi change ; les jours de repos des autres cultes ou ceux accordés par des décisions ponctuelles (ponts) ne sont pas inclus.
- L'emploi du temps par défaut est un exemple ; modifiez-le selon vos besoins. Les jours de changement d'heure ont la barre de la journée mise à l'échelle de la durée réelle (23/25 h), mais les étiquettes 00–24 restent fixes.

## Exécution en local / hors ligne

Téléchargez `index.html` et ouvrez-le dans un navigateur ; il fonctionne entièrement sans internet.

## Historique / Changelog

### 14 octobre 2026 (v1.1.0)
- Export `.ics` (emploi du temps, événements, alarme), feuille d'impression / PDF de l'emploi du temps.
- Sauvegarde `.fff.json` via les modules communs (core, label, bundle) ; nouveaux tests : `tests/fff-r8.test.mjs` et `tests/ics_check.py` (vérification indépendante ; nécessite le paquet Python `icalendar`).

### 12 octobre 2026 (v1.0.0)
- 1.0.0 — 2026-10-12 : la version et la date de la dernière mise à jour sont affichées dans l'application

### 11 octobre 2026 (deuxième entrée)
- Nouvelle fonctionnalité : « événements » — comptes à rebours vers des dates choisies par l'utilisateur, conservés localement (testé : validation, ajout, tri, passé, suppression, persistance au rechargement, limite de 6).

### 11 octobre 2026
- Vérification du 11 octobre 2026 : axe 0 violation, aucune erreur dans la console, pas de débordement horizontal à 360 px ; les comptes à rebours sont calculés dynamiquement à partir de l'horloge locale (y compris le changement d'heure du 25 octobre 2026), donc ils ne contiennent pas de dates fixes périmées.
- Nouveau : les jours fériés légaux de Roumanie (liste vérifiée le 11 octobre 2026 dans le Code du travail art. 139 et dans une liste 2026 ; Pâques orthodoxe calculée par l'algorithme de Meeus, +13 jours) comptent comme jours de repos dans le compte à rebours de la semaine ; case pour les désactiver, ligne « prochain jour férié ». Capture d'écran mise à jour.

## Licence

Licence MIT — voir le fichier `LICENSE`.

## Auteur

Alexio — Alexandru-Ionuț Chiuță, contact : alexio@trom.tf

## Résumé

CLEPSIDRA est une « horloge inversée » en un seul fichier, à interface en 8 langues : temps restant dans la journée et dans la semaine de travail/le week-end, un emploi du temps de la journée avec des modèles distincts pour les jours ouvrables et le week-end, et une alarme. Les jours de changement d'heure (23/25 h) sont gérés via le minuit calendaire. Aucune requête réseau, aucune télémétrie ; les réglages sont conservés dans localStorage et validés au chargement. L'alarme ne fonctionne que tant que la page est ouverte et active (l'application le dit franchement dans l'interface). Licence non encore déclarée.

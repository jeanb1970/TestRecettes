# AGENTS.md — Planificateur hebdomadaire de menus normands

## 1. Mission

Développer une application web responsive, élégante et facile à utiliser, permettant de composer les repas du midi et du soir pour chacun des sept jours de la semaine, puis de consulter un récapitulatif complet des menus.

L'univers graphique doit évoquer une **cuisine familiale traditionnelle de Normandie** : chaleureux, accueillant, authentique et soigné. L'application doit rester simple, lisible et rapide à prendre en main.

## 2. Périmètre fonctionnel

### 2.1 Planification hebdomadaire

- Présenter les sept jours de la semaine, du lundi au dimanche, dans cet ordre.
- Prévoir exactement deux créneaux par jour : **midi** et **soir**.
- Permettre la saisie et la modification indépendantes de chacun des quatorze repas.
- Distinguer clairement les jours et les créneaux, y compris sur mobile.

### 2.2 Composition d'un repas

Chaque créneau doit proposer :

| Élément | Obligatoire | Règle |
| --- | --- | --- |
| Entrée | Non | Une entrée facultative. |
| Plat principal | Oui, pour un repas renseigné | Un plat principal. |
| Légume(s) | Non | Un ou plusieurs accompagnements de type légume. |
| Féculent(s) | Non | Un ou plusieurs accompagnements de type féculent. |
| Dessert | Non | Un dessert facultatif. |
| Nombre de convives | Oui, pour un repas renseigné | Entier compris entre 1 et 6. |

Les intitulés des mets sont saisis librement par l'utilisateur. Ne pas imposer de catalogue fermé ni inventer de menus préremplis. Offrir des exemples dans les placeholders si cela améliore la compréhension.

**Hypothèse de travail à confirmer :** un créneau peut rester non planifié, mais dès qu'il est renseigné, le plat, le dessert et le nombre de convives doivent être valides.

### 2.3 Validation et récapitulatif

- Prévoir une action explicite **« Valider les menus »**.
- Contrôler uniquement les champs obligatoires des repas planifiés (plat et convives) et la plage du nombre de convives ; ne pas exiger de dessert.
- Autoriser la validation d’une semaine partiellement planifiée, voire sans aucun repas planifié, sans inventer de données.
- Afficher les erreurs près des champs concernés avec des messages compréhensibles.
- Si la validation réussit, afficher un récapitulatif organisé **jour par jour**, puis **midi / soir**.
- Afficher toutes les informations sélectionnées pour chaque repas : entrée (si présente), plat, légumes et féculents (si présents), dessert, nombre de convives.
- Ne pas afficher les rubriques optionnelles vides.
- Signaler simplement les créneaux non planifiés s'ils sont autorisés.
- Permettre de revenir à la saisie et de modifier les menus sans perdre les données déjà renseignées.
- Enregistrer automatiquement les modifications dans le stockage local du navigateur et les restaurer au rechargement ou à la réouverture de la page.

## 3. Direction artistique et expérience utilisateur

- Style inspiré des cuisines normandes familiales : bois, pierre, linge de maison, vaisselle ancienne, teintes crème, lin, beige, vert sauge et touches de rouge brique.
- Utiliser quelques **photographies d'illustration** cohérentes avec cet univers : cuisine chaleureuse, table dressée, ingrédients ou plats traditionnels normands. Éviter toute surcharge visuelle.
- Conserver un contraste suffisant pour que le texte soit lisible au-dessus ou à proximité des images.
- Mise en page responsive, utilisable confortablement sur ordinateur, tablette et smartphone.
- Hiérarchie visuelle nette : titre, choix du jour, repas midi/soir, champs, actions et récapitulatif.
- Parcours de saisie intuitif, accessible au clavier, avec libellés explicites et états de focus visibles.
- Textes de l'interface en **français**.
- Préférer une interface chaleureuse et sobre plutôt que des animations complexes.

## 4. Contraintes techniques et structure des fichiers

**Priorité absolue : limiter le nombre de fichiers sources et la complexité de l'application.**

Structure cible :

```text
/
├── AGENTS.md
├── index.html
├── styles.css
├── app.ts
└── assets/
    ├── cuisine-normande.webp
    └── ... autres images strictement nécessaires
```

- **Un seul fichier HTML** pour la structure de l'interface.
- **Un seul fichier CSS** pour tous les styles.
- **Un seul fichier TypeScript** pour les types, données de l'application, logique métier, événements et rendu dynamique.
- Les fichiers image sont autorisés dans `assets/`, en nombre raisonnable et optimisés pour le web.
- Ne pas introduire de framework frontend, de backend, de base de données ou de bibliothèque de composants sans nécessité démontrée.
- TypeScript doit être compilé en JavaScript pour le navigateur ; le fichier JavaScript généré et une éventuelle configuration minimale d'outillage ne comptent pas comme des fichiers sources métier supplémentaires.
- Choisir l'outillage le plus léger possible et expliquer comment démarrer et compiler l'application. Éviter d'ajouter des fichiers de configuration non indispensables.
- Aucun service externe ne doit être nécessaire au fonctionnement des fonctionnalités principales.
- Utiliser `localStorage` pour conserver les menus sur le navigateur et le même appareil, sans serveur ni compte utilisateur. Prévoir une gestion prudente des données absentes, corrompues ou issues d’une ancienne version.

## 5. Architecture et maintenabilité

- Utiliser **une source de vérité unique** pour les données de menus de la semaine, synchronisée avec `localStorage`.
- Définir des types TypeScript explicites pour le jour, le créneau, le repas et les accompagnements.
- Ne pas dupliquer les jours de la semaine, les intitulés des champs ou les règles de validation à différents endroits du code.
- Générer les quatorze formulaires à partir d'une structure commune, plutôt que de recopier leur balisage et leurs gestionnaires.
- Centraliser les opérations récurrentes : création d'un repas, lecture/saisie, validation et génération du récapitulatif.
- Séparer logiquement les données, la validation et le rendu, même si le code réside dans un seul fichier TypeScript.
- Adopter des noms de variables et de fonctions explicites et un code facilement compréhensible.
- Éviter les abstractions superflues, le code mort, les dépendances inutiles et les commentaires qui répètent le code.
- Prévenir les injections HTML lorsque des contenus libres sont restitués à l'écran : utiliser des API DOM sûres ou échapper correctement les données.

## 6. Comportement attendu

1. L'utilisateur ouvre l'application et voit clairement la planification de sa semaine.
2. Il sélectionne un jour et un créneau ou parcourt directement les repas.
3. Il renseigne, pour chaque repas souhaité, l'entrée éventuelle, le plat principal, les accompagnements éventuels, le dessert et le nombre de convives (1 à 6).
4. Il peut revenir sur n'importe quelle saisie avant validation.
5. Il clique sur **« Valider les menus »**.
6. L'application signale les éventuelles erreurs, ou présente une synthèse complète de la semaine, ordonnée du lundi au dimanche et du midi au soir.
7. L'utilisateur peut reprendre la modification de ses menus.

## 7. Critères d'acceptation

L'application est considérée comme terminée si :

- Les 7 jours et les 14 créneaux sont accessibles.
- Les entrées, accompagnements **et desserts** peuvent être laissés vides.
- Les 14 créneaux peuvent être non planifiés, indépendamment les uns des autres.
- Les suggestions de mets sont disponibles, mais chaque intitulé peut aussi être librement saisi.
- Les données obligatoires et les nombres de convives hors de l'intervalle 1–6 sont correctement contrôlés.
- La validation produit une présentation fidèle des informations saisies, sans mélanger les repas.
- Les informations déjà saisies sont préservées lors d'un retour du récapitulatif au formulaire.
- Les vues mobile et ordinateur sont lisibles et utilisables.
- Le projet respecte le principe **1 HTML + 1 CSS + 1 TypeScript**, hors images et fichiers générés ou strictement nécessaires à la compilation.
- Le code ne contient aucune duplication structurelle évitable et reste simple à maintenir.
- La compilation et le lancement local sont documentés de manière concise.

## 8. Règles de travail pour l'agent Antigravity

1. Lire ce fichier avant toute décision d'architecture ou toute modification de code.
2. Respecter les exigences ci-dessus et ne pas étendre le périmètre sans justification.
3. Privilégier la solution la plus simple qui satisfait tous les critères d'acceptation.
4. Ne pas inventer de fonctionnalités supplémentaires (comptes utilisateurs, recettes automatiques, liste de courses, export PDF, etc.).
5. Identifier les points fonctionnels réellement ambigus avant de développer ; si nécessaire, demander une précision plutôt que décider arbitrairement.
6. Vérifier que l'application se compile et que les parcours de saisie, validation, récapitulatif et modification fonctionnent.
7. À la livraison, décrire brièvement les fichiers créés, le mode de lancement et les éventuelles limites connues.

## 9. Décisions confirmées par le demandeur

1. **Convives :** valeur indépendante pour chaque repas, entière de 1 à 6.
2. **Dessert :** facultatif.
3. **Planification :** les créneaux peuvent rester non planifiés.
4. **Persistance :** stockage local automatique (`localStorage`), conservé après fermeture du navigateur, dans les limites des réglages de celui-ci.
5. **Choix des mets :** liste de suggestions prédéfinies et saisie libre possible pour chaque catégorie.

Ces décisions sont des exigences définitives pour cette version. Ne pas les traiter comme des hypothèses. Si un **nouveau** point véritablement bloquant apparaît, poser une question ciblée avant de le trancher arbitrairement.

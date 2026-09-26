# MIGRATION.md : AVTRANS Pointage, de Vue 3 à React

Ce fichier suit toute la migration. Il fait foi entre les sessions : je le mets à jour à chaque étape validée.

- **Source** (lecture seule, jamais modifiée) : `D:\3_PROJET\AVTRANS\pointage2026\vue_avtrans` (commit `14f5ee8`, version `0.1.6`).
- **Cible** : ce dépôt, `react_avtrans`.
- **API** : `../api_avtrans`, hors périmètre, jamais modifiée.
- **Inventaire détaillé** : un fichier par domaine dans [`docs/migration/`](docs/migration/). Chacun décrit, fichier par fichier, les appels API, les messages exacts, les validations, les bugs avec leurs lignes et le découpage React proposé. Ces annexes ont été produites par des sous-agents en lecture seule, puis relues. Les bugs les plus graves ont été revérifiés dans le code Vue.

| Annexe | Périmètre |
|---|---|
| [inventaire-socle-infra.md](docs/migration/inventaire-socle-infra.md) | App.vue, router, store, api, config, 19 composables, composants maison de `components/ui`, CSS, icônes, personnalisations shadcn-vue |
| [inventaire-auth-landing-versions.md](docs/migration/inventaire-auth-landing-versions.md) | auth, NotFound, Unauthorized, légal, landing, FleetViewer, robots, index.html, versions d'app |
| [inventaire-heures-pointage-signatures.md](docs/migration/inventaire-heures-pointage-signatures.md) | Pointage, Planning, Heures, Export, Contrats, Journal, historique des pointages, signatures |
| [inventaire-users-profil-notifications.md](docs/migration/inventaire-users-profil-notifications.md) | Users, UserEdit, UserServices, suivi des présences, Profil, Notifications |
| [inventaire-vehicules.md](docs/migration/inventaire-vehicules.md) | Véhicules, détail véhicule et ses onglets |
| [inventaire-entretiens.md](docs/migration/inventaire-entretiens.md) | Entretiens, entretiens d'un véhicule, types d'entretien |
| [inventaire-absences-acomptes.md](docs/migration/inventaire-absences-acomptes.md) | Absences, types d'absence, mes absences, acomptes, mes acomptes |
| [inventaire-couchettes-stock-cartes-todos.md](docs/migration/inventaire-couchettes-stock-cartes-todos.md) | Couchettes, stock, cartes, types de cartes, todos |

## Légende des statuts

| Statut | Sens |
|---|---|
| `à faire` | rien n'est porté |
| `en cours` | portage commencé, pas encore buildé ni vérifié |
| `fait` | porté ; `npm run build` et `npm run lint` passent |
| `vérifié` | contrôlé dans le navigateur : mobile 360 px et desktop, thème clair et sombre, rôles concernés, comparé au Vue |

Une ligne ne passe à `vérifié` qu'après contrôle visuel contre l'app Vue. « Terminé » signifie toutes les lignes à `vérifié`.

## Avancement

| Phase | Contenu | Statut |
|---|---|---|
| 0. Inventaire | ce fichier + annexes | **fait** (validé le 25/09/2026, voir section 0) |
| 1. Socle | Vite React-TS, git, Tailwind v4, alias, shadcn init, tokens, ESLint/Prettier, React Compiler, `CLAUDE.md` | **fait** (25/09/2026) |
| 2. Couche agnostique | api, services, models, enums, types, utils, lib, config, public ; type-check vert | **fait** (25/09/2026) |
| 3. Coquille | providers, store auth, router + gardes, layout, Login / NotFound / Unauthorized, bannière de version, badge favicon | **fait** (25/09/2026) ; validation visuelle connectée en attente d'une session |
| 4. Domaines | voir l'ordre ci-dessous | **fait** (26/09/2026) : les 43 routes sont portées ; contrôle visuel connecté en attente d'une session |
| 5. Build, SEO, finitions | plugins Vite, pré-rendu, robots, JSON-LD, manifest, revue de parité, nettoyage des dépendances | **fait** (26/09/2026) : build + pré-rendu strict + lint + format sans erreur ni warning ; passage à `vérifié` après le contrôle visuel connecté |

Ordre des domaines en phase 4 (celui du brief) :

| # | Domaine | Statut |
|---|---|---|
| 4.1 | auth (register, verify, mot de passe oublié / reset, Google, écran d'accueil) | fait |
| 4.2 | pointage | fait |
| 4.3 | heures / planning / export / contrats / journal | fait |
| 4.4 | users (liste, pointages d'un employé, suivi des présences) | fait |
| 4.5 | véhicules | fait |
| 4.6 | entretiens | fait |
| 4.7 | absences | fait |
| 4.8 | acomptes | fait |
| 4.9 | signatures | fait |
| 4.10 | couchettes | fait |
| 4.11 | stock | fait |
| 4.12 | cartes | fait |
| 4.13 | todos | fait |
| 4.14 | versions d'app | fait |
| 4.15 | notifications / profil | fait |
| 4.16 | landing + pages légales | fait |

---

## 0. Décisions à valider avant la phase 1

> **Statut (25/09/2026)** : le propriétaire a répondu « vasy met en place le projet » sans trancher point par point. Les **recommandations D1 à D6 sont donc appliquées**. Pour D6, aucun numéro n'ayant été donné, **tous les bugs B-xx de la section 8.2 sont reproduits à l'identique** jusqu'à autorisation explicite ; ceux de la section 8.1 sont corrigés par construction. Chaque décision reste révisable.
> Les **recommandations de la section 9 s'appliquent de la même façon** :
> - Q-NAVBAR : navbar sur les seules pages protégées ;
> - Q-GLOBALDIALOGS : dialogs globaux ouverts dans `AppLayout`, y compris juste après la connexion ; changelog marqué vu quelle que soit la façon de le fermer ;
> - Q-USEREDIT : redirection vers `/users` ;
> - Q-APPVERSIONS, Q-UNAUTHORIZED : parité ;
> - Q-NOTIF-POLL : polling suspendu onglet masqué ;
> - Q-REDIRECT : pas de `?redirect=` ;
> - Q-VALIDATION : messages de validation courts en français, mêmes règles que le Vue ;
> - Q-DATES : champs natifs ;
> - Q-DND : glisser-déposer HTML5 natif ;
> - Q-URL : pas d'état dans l'URL, sauf les `?userUuid=` existants ;
> - Q-ACCENTS : accents manquants corrigés ;
> - Q-TOKENS : tokens `success` / `warning` / `info` conservés.
>
> Le propriétaire a aussi demandé d'**enchaîner toutes les phases sans s'arrêter** : pas de point d'arrêt en fin de phase 3.

Ce sont les seuls points qui bloquaient le socle. Les autres questions (section 9) peuvent attendre le domaine concerné.

**D1. Viewer 3D de la landing : abandonner `@react-three/fiber` et `drei` ?**
`FleetViewer.vue` n'est plus importé nulle part depuis le commit `751eedd` (« retrait du viewer 3D », 24 juin 2026). Porter la 3D ajouterait deux dépendances sans aucun écran pour les utiliser.
*Recommandation* : ne pas le porter, ne pas installer `@react-three/*` ni `three`, ne pas copier `public/models/*.glb` (4 Mo) et retirer `Allow: /models/` de `robots.txt`.

**D2. Métadonnées SEO : balises natives React 19, ou petit hook `usePageMeta` ?**
Les `<title>`, `<meta>` et `<link rel="canonical">` rendus par React 19 s'ajoutent dans `<head>` sans remplacer les balises statiques d'`index.html`. Sur `/login`, on aurait donc deux canonical contradictoires (`/` et `/login`), deux descriptions et deux `robots`.
- *Option A (native, recommandée pour respecter le brief)* : retirer d'`index.html` les quatre balises propres à chaque page (title, description, robots, canonical). Chaque page publique les rend en JSX, y compris la landing. `prerender.cjs` recopie aussi ces balises dans le `<head>` de `dist/index.html`, avec un marqueur. Un script inline les retire avant le montage de React, pour éviter les doublons. Open Graph, Twitter, geo et le JSON-LD du site restent statiques.
- *Option B* : garder un hook impératif `src/hooks/usePageMeta.ts` (même logique que le Vue : modifier les balises existantes, puis restaurer au démontage). C'est plus simple et zéro risque, mais ce ne sont pas les métadonnées natives demandées.

**D3. `erasableSyntaxOnly` du template Vite React-TS.**
Ce flag refuse les `enum` TypeScript (4 fichiers dans `enums/`) et les propriétés déclarées dans le constructeur (`ApiError`). Les fichiers « copiés inchangés » ne compileraient pas.
*Recommandation* : désactiver ce seul flag dans `tsconfig.app.json`, avec un commentaire qui explique pourquoi. Les fichiers restent identiques au Vue. L'alternative est de convertir les enums en objets `as const`, ce qui touche tous leurs usages.

**D4. Extensions de l'arborescence des features.**
Le brief prévoit `features/<domaine>/{api, components, hooks}`. Les inventaires montrent aussi beaucoup de fonctions pures (calculs de dates, statuts de flotte, regroupements par jour) et de schémas zod.
*Recommandation* : autoriser en plus `features/<domaine>/lib/` (fonctions pures, testables) et `features/<domaine>/schemas/` (zod). Les données statiques de la landing iraient dans `features/landing/data/`. La liste des features figure en section 3.

**D5. `CLAUDE.md` versionné ?**
Le `.gitignore` du Vue exclut `CLAUDE.md`. Le brief en fait la référence pour les sessions et les sous-agents.
*Recommandation* : le versionner dans le dépôt React (il ne contient aucun secret) et ne pas reprendre cette ligne du `.gitignore`.

**D6. Politique face aux bugs du Vue.**
Les annexes relèvent plusieurs centaines de constats (bugs, incohérences, code mort, avec des recoupements entre annexes). La section 8 en retient les plus significatifs. Pour respecter la parité sans reproduire des défauts absurdes, je propose trois catégories :
1. **Disparaissent par construction** (section 8.1) : doubles montages, fuites mémoire, `id="app"` dupliqué, `type="button"` manquants… Le port React idiomatique les corrige sans changer le comportement voulu. *Je propose de les corriger sans redemander.*
2. **Bugs à comportement visible** (section 8.2, numérotés) : je les reproduis **à l'identique**, sauf ceux que vous m'autorisez à corriger. Vous pouvez répondre par numéros (« corrige B-01 à B-12 »).
3. **Limites de l'API** (section 8.3) : impossibles à corriger côté front sans toucher `api_avtrans`. Je les note, je ne les « corrige » pas.

**Déjà décidé par le brief ou par la doc à jour (pour information) :**
- Formulaires : la doc shadcn à jour recommande `Field` + `Controller` de react-hook-form plutôt que l'ancien `Form` / `FormField`. J'utiliserai `field`, pas `form`.
- État client global : Zustand pour le seul store `auth`. Les autres états globaux (modale d'historique d'un pointage, vérification de version, passage de relais de l'inscription Google) passent par un contexte React ou un petit module `useSyncExternalStore`, pas par d'autres stores Zustand.
- `ApiError` et les services sont copiés tels quels, y compris leurs formes de réponse hétérogènes. La normalisation se fait dans les `select` des hooks Query.

---

## 1. Environnement vérifié (25/09/2026)

| Élément | Constat |
|---|---|
| Node / npm | v24.18.0 / 11.16.0 (WebSocket natif présent, requis par le client CDP de `prerender.cjs`) |
| Navigateur headless | `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` présent |
| git | 2.55 ; `react_avtrans` n'est pas encore un dépôt (seul `.vscode/` existe) |
| CORS de l'API | `CorsConfig.java` : `allowedOriginPatterns("*")`. React sur 5173 et Vue sur un autre port fonctionnent sans toucher l'API. Pour lancer le Vue à côté : `npx vite --port 5174` depuis `vue_avtrans` (option CLI, aucun fichier modifié). |
| Liens des e-mails en dev | `api_avtrans/application.properties` : `app.base-url=http://192.168.1.120:5173`. Les liens `/verify?token=` et `/password-reset?token=` pointeront vers le serveur de dev React : il faut garder ces chemins et ces paramètres. |
| Variables d'environnement | `.env.development`, `.env.production`, `.env.example` : `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_MAPBOX_TOKEN`, `VITE_GEOCODING_API_URL`. À copier (git-ignorés, sauf `.env.example`). |

**Clés de stockage à conserver à l'identique** (l'app React remplace la Vue sur le même domaine) :
- localStorage : `auth_token` (texte brut), `user` (JSON), `theme-preference`, `changelog_last_seen_version`, `notifications_sound_enabled`.
- sessionStorage : `version_check_reloaded_for`, `version_check_dismissed`.
- Le store Zustand s'hydrate **à la main** depuis `auth_token` et `user` : pas de middleware `persist`, qui écrirait dans un autre format et déconnecterait tout le monde à la bascule.

---

## 2. Dépendances : remplacées, conservées, ajoutées, supprimées

| Vue (package.json) | React | Remarque |
|---|---|---|
| `vue`, `vue-router`, `pinia` | `react`, `react-dom`, `react-router` (v7, mode data), `zustand` | |
| `@vitejs/plugin-vue`, `vue-tsc`, `vite-plugin-vue-devtools` | `@vitejs/plugin-react` + `babel-plugin-react-compiler`, `tsc -b` | React Compiler activé |
| `reka-ui` | primitives Radix installées par le CLI shadcn | |
| `radix-vue` | — | jamais importé : dépendance morte |
| `@tanstack/vue-table` | `@tanstack/react-table` | le Vue n'a en fait **aucun** data-table (seul `table/utils.ts`, mort, l'importe) : tri et filtres sont codés à la main dans chaque vue |
| `@vueuse/core` | hooks maison dans `src/hooks/` | usages réels : `useMediaQuery` (3 vues), `useDebounceFn` et `onClickOutside` (AddressAutocomplete), `useVModel`/`reactiveOmit` (wrappers shadcn-vue, sans équivalent nécessaire). `usehooks-ts` n'apporterait presque rien : pas ajouté. |
| `lucide-vue-next` | `lucide-react` | mêmes noms d'icônes |
| `@fortawesome/*` (4 paquets) | `lucide-react` | 103 icônes enregistrées, 13 utilisées, 9 utilisées mais **non enregistrées** (vides à l'écran). Correspondances en section 4.3. |
| `chart.js`, `vue-chartjs` | `recharts` via le composant `chart` de shadcn | un seul graphique (historique km d'un véhicule) |
| `three`, `@tresjs/core`, `@tresjs/cientos` | — (voir D1) | code mort depuis `751eedd` |
| `mapbox-gl`, `pdfjs-dist`, `jspdf`, `html2canvas-pro` | inchangés | worker pdf.js local (`?url`) au lieu du CDN figé en 4.0.379 |
| `class-variance-authority` | inchangé | |
| `clsx`, `tailwind-merge` | paquet **`cn`** (officiel shadcn-ui) | **Écart au brief, décidé en phase 1.** Le CLI shadcn v4 et son registre importent désormais `cn` depuis ce paquet dans chaque composant généré ; garder clsx + tailwind-merge aurait obligé à retoucher chaque fichier de `components/ui`. `@/lib/utils` réexporte le même `cn`. Parité vérifiée : 52 670 fusions comparées sur les 2 025 chaînes de classes du Vue, 0 écart hors `bg-gradient-to-*` (syntaxe v3 que tailwind-merge prend à tort pour une couleur ; en syntaxe v4 `bg-linear-to-*`, résultats identiques). |
| `tailwindcss`, `@tailwindcss/vite`, `tw-animate-css` | inchangés | |
| `vite`, `typescript`, `@types/node`, `vite-plugin-compression2` | inchangés | |
| — | `@tanstack/react-query` (+ `@tanstack/react-query-devtools` en dev) | |
| — | `react-hook-form`, `zod`, `@hookform/resolvers` | |
| — | `sonner` (via shadcn) | remplace `Messages.vue` + `useMessages` |
| — | `cmdk` (via `command` shadcn) | combobox avec recherche |
| — | `eslint` (config du template), `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `typescript-eslint`, `prettier` (+ `prettier-plugin-tailwindcss` proposé) | |
| — | `@dnd-kit/*` : **non**, sauf décision (Q-DND, section 9) | glisser-déposer du stock, des todos et des types d'entretien |
| — | `dompurify` : **non** | aucun `v-html` dans le Vue ; l'export PDF du planning construit du HTML à la main (voir B-02) : on échappera les valeurs, sans DOMPurify |

**Versions installées en phase 1** (25/09/2026). Vite 8.3, React Router 8.4 et TypeScript 7.0 sont publiés, mais le brief fixe les majeures : on reste sur Vite 7, React Router 7 et TypeScript 5.9 (typescript-eslint exige TS < 6.1).
- **Scaffold** : `create-vite@8.3.0`, dernière version dont le template `react-ts` génère Vite 7.
- **Base** : vite 7.3.6, react / react-dom 19.3.0, typescript 5.9.3, @vitejs/plugin-react 5.2.0, babel-plugin-react-compiler 1.0.0.
- **Styles** : tailwindcss / @tailwindcss/vite 4.3.3, tw-animate-css 1.4.0.
- **UI** : shadcn CLI 4.21 (style `new-york`, Radix via `radix-ui` 1.6.7), lucide-react 1.48, class-variance-authority 0.7.1, cn 0.4.0.
- **Outillage** : eslint 9.39, typescript-eslint 8.x, eslint-plugin-react-hooks 7, prettier 3.9 + prettier-plugin-tailwindcss 0.8.

**shadcn CLI v4** : `init` ne propose plus `--style` ni `--base-color` mais des *presets*. Le preset « vega » installait un style différent du Vue (boutons destructive « doux », paddings réduits) et la police Inter. `components.json` a donc été remis en `style: "new-york"`, `baseColor: "neutral"`, identique aux composants shadcn-vue du projet Vue. Les variantes du `button` généré sont les mêmes que dans le Vue.

## 3. Architecture retenue (rappel du brief et précisions)

```
src/
├── api/ services/ models/ enums/ types/ utils/     # copiés du Vue (voir 5.2)
├── lib/            # utils.ts (cn) + nouveaux helpers purs transverses (dates locales, fichiers, favicon…)
├── config/         # api, map, seo, version, navConfig (adapté lucide-react)
├── stores/         # auth-store.ts (Zustand, seul store)
├── hooks/          # hooks génériques
├── features/<domaine>/{api, components, hooks, lib*, schemas*}   (* voir D4)
├── components/{ui (CLI shadcn uniquement), shared, layout}
├── pages/<domaine>/                                  # mêmes sous-dossiers que src/views du Vue
├── router/         # routes.tsx + gardes
├── providers/      # AppProviders (Query, Theme, Toaster, Tooltip)
└── styles/         # (ou index.css à la racine de src, selon ce que génère shadcn init)
```

**Features prévues** : `auth`, `pointage`, `hours` (heures, export, contrats), `planning`, `service-history` (journal + modale d'historique d'un pointage), `signatures`, `users`, `user-services` (pointages d'un employé côté admin), `monitoring` (suivi des présences), `profile`, `notifications`, `changelog`, `vehicles`, `maintenance`, `absences`, `acomptes`, `couchettes`, `stock`, `cartes`, `todos`, `app-versions`, `landing`.

**Pages** : `pages/{auth, common, legal, landing, users, hours, absences, myabsences, acomptes, signatures, vehicles, maintenance, stock, couchettes, cartes, todos, app-versions}/<Nom>Page.tsx`, avec le même nom de base que la vue Vue (ex. `views/hours/Pointage.vue` → `pages/hours/PointagePage.tsx`). L'asymétrie du Vue est conservée : `MyAcomptes` est dans `acomptes/`, `MyAbsences` dans `myabsences/`.

**Conventions transverses issues de l'inventaire**
- **Query keys** : un `queryKeys.ts` par feature, avec une racine par domaine (`['vehicles']`, `['absences']`…). Les requêtes partagées vivent dans une seule feature et sont importées ailleurs :
  - `useUsersQuery` (features/users), utilisé par absences, acomptes, cartes, couchettes, export, journal ;
  - `useVehiclesQuery` / `useVehicleQuery` (features/vehicles), utilisés par pointage et maintenance ;
  - `useAbsenceTypesQuery` / `useValidateAbsenceMutation` (features/absences), utilisés par planning.
- **Déconnexion** : `logout()` vide aussi le cache TanStack Query (`queryClient.clear()`), sinon les données du compte précédent restent visibles.
- **Toasts** : `useMessages().success(texte, titre?)` devient `toast.success(titre ?? texte, { description: titre ? texte : undefined })`. Durées par défaut du Vue : succès 5 s, erreur 7 s. `showMessage({ id, action })` (Pointage uniquement) devient `toast(…, { id, action })`, et `removeMessage(id)` devient `toast.dismiss(id)`.
- **Utilisateurs masqués** : `selectableUsers()` seulement dans les sélecteurs, dans le composant qui connaît la valeur courante (`keepUuids`). Jamais dans l'admin des comptes (Users, pending users).
- **Dates** : les champs `<input type="date|time|datetime-local">` natifs sont conservés (parité, confort sur téléphone), sauf décision contraire (Q-DATES). Les nouveaux helpers de date locale vont dans `src/lib/dates.ts`, sans `toISOString()` pour une date du jour (source de plusieurs bugs, voir B-01).
- **Menus contextuels** (clic droit dans 7 listes) : `context-menu` shadcn. `useContextMenu` et `ContextMenuPopover` disparaissent.
- **Confirmation « taper CONFIRMER »** (Users, Véhicules, Stock) : `components/shared/ConfirmDialog.tsx` avec une option `confirmText`.
- **Dialogs de formulaire** : `max-h-[90dvh] overflow-y-auto`, fermeture au clic sur l'overlay, jamais `onInteractOutside={e => e.preventDefault()}`. Seule exception déjà présente dans le Vue : `SignatureReminderDialog` (bloquant, sans croix) et le dialog de kilométrage obligatoire de Pointage.

## 4. Composants

### 4.1 shadcn/ui à installer (CLI)

`npx shadcn@latest add` :
`accordion alert alert-dialog avatar badge button card chart checkbox collapsible command context-menu dialog dropdown-menu empty field input input-group label popover progress scroll-area select separator sheet skeleton sonner spinner table tabs textarea toggle-group tooltip`

*Fin de migration* : `alert-dialog`, `card`, `input-group`, `scroll-area`, `toggle` et `toggle-group` ont été retirés, aucun écran ne les utilisant (`ConfirmDialog` repose sur `dialog`).

- **Non installés** : `sidebar` (seul usage : `AppSidebar.vue`, mort), `form` (remplacé par `field`), `calendar` (sauf Q-DATES), `pagination` (une `SimplePagination` maison sur Button suffit ; le Vue a trois variantes de pagination, voir 4.2).
- `accordion` : historique de Pointage uniquement. **Pas** pour la FAQ de la landing : Radix démonte le contenu fermé, les réponses disparaîtraient du HTML pré-rendu. La FAQ garde `<details>`.
- Hook `use-mobile` (livré avec certains composants) : breakpoint 768 px, cohérent avec `md`.

### 4.2 Personnalisations à reporter après `add`

Toute modification d'un fichier de `components/ui` sera justifiée par un commentaire en tête du fichier.

| Composant | Personnalisation du Vue | Décision proposée |
|---|---|---|
| tokens (`index.css`) | palette violette oklch clair et sombre, `--radius: 0.625rem`, tokens `success`, `warning`, `info`, `destructive-foreground` ; règles de base (curseur pointer, correctif largeur des inputs date/time sur iOS, padding safe-area du body) ; `--font-sans`/`--font-mono` venant en réalité de `theme.css` (pile système) | tout reporter ; `chart-*` gardés (utiles au chart) ; `sidebar-*` et règles view-transition non reportés (morts) |
| `button` | tailles `icon-sm`, `icon-lg` (très utilisées), `cursor-pointer` | vérifier dans le fichier généré ; `cursor-pointer` via la règle de base plutôt que dans le composant |
| `badge` | variante **`warning`** (orange, « Expire bientôt » des cartes) ; forme `rounded-full` | ajouter la variante ; comparer la forme au rendu Vue |
| `dialog` | overlay `bg-black/80` ; fermeture **uniquement** au clic sur l'overlay (liste blanche `[data-floating-content]`) | overlay `/80` ; `onInteractOutside` n'ignore que les toasts sonner et la lightbox, jamais un `preventDefault` général |
| `sheet` | overlay `z-[1040] bg-black/80`, contenu `z-[1050]` | établir une échelle de z-index unique (sheet < popover < lightbox < toasts) plutôt que recopier ces valeurs |
| `dropdown-menu`, `tabs` | `cursor-pointer` sur les items et triggers | via la règle de base |
| `skeleton` | `bg-primary/10` (teinte violette) au lieu de `bg-accent` | reporter |
| `table` | conteneur `overflow-auto` | reporter si nécessaire au rendu |
| `checkbox` | mapping `checked`/`modelValue` propre à reka-ui | **ne pas reproduire** : `checked` + `onCheckedChange` natifs |

### 4.3 Icônes FontAwesome → lucide-react

Seules 13 icônes FA sont réellement rendues (pages auth, et `getFileIcon` d'Entretiens / EntretiensVehicule).

| FA | lucide-react | | FA | lucide-react |
|---|---|---|---|---|
| exclamation-circle | `CircleAlert` | | clock | `Clock` |
| key | `KeyRound` | | times-circle | `CircleX` |
| check-circle | `CircleCheck` | | exclamation-triangle | `TriangleAlert` |
| envelope | `Mail` | | file / file-alt | `File` / `FileText` |
| mouse-pointer | `MousePointerClick` | | file-image* | `FileImage` |
| user-shield | `ShieldUser` | | file-pdf*, file-word* | `FileText` |
| info-circle | `Info` | | file-excel* | `FileSpreadsheet` |
| arrow-left | `ArrowLeft` | | file-video*, file-audio*, file-archive* | `FileVideo`, `FileAudio`, `FileArchive` |
| spinner (spin) | `LoaderCircle` + `animate-spin` | | file-powerpoint* | `Presentation` |

\* utilisées mais non enregistrées dans `config/icons.ts` : aujourd'hui **aucune icône ne s'affiche** pour ces types de fichiers. Les afficher en React corrige un bug d'affichage (catégorie 8.1). `getFileIcon` sera mutualisé dans `src/lib/fileIcons.ts`.

### 4.4 Composants, hooks et helpers partagés à créer

**`components/shared/`** (maison, modèle shadcn : `cn()`, `className` fusionné, `...props`, `ref` en prop)

| Composant | Remplace (Vue) | Utilisé par |
|---|---|---|
| `InputField` | `ui/input-field/InputField.vue` (label + icône + hint + erreur + œil mot de passe) | auth ×6, UserEdit, UserEmail, ProfileCompletion ; label **relié** à l'input (`useId`) |
| `Combobox` | `ui/select/Select.vue` (**maison**, 469 l. : recherche par défaut, `clearable`, pas de multi) | ~20 fichiers ; `select` shadcn quand la recherche est inutile |
| `AddressAutocomplete` | `ui/address-autocomplete` | UserEdit, ProfileCompletion (requête géocodage via `useQuery`, debounce) |
| `SearchFilters` | `ui/search-filters` (panneau repliable, configuration par tableau) | Absences, Acomptes, Couchettes, Journal, Entretiens ×2 |
| `BackButton` | `ui/retour/Retour.vue` | Pointage, AbsenceTypes, MyAcomptes, MesCouchettes, MyAbsences, Stock, Entretiens |
| `FileDropzone`, `FileCard`, `ImageLightbox`, `PdfPreview`, `PdfViewerDialog` | `ui/file-dropzone`, `ui/file-card`, `ui/image-lightbox`, `ui/pdf-preview`, visionneuses PDF recopiées dans 2 vues | Véhicules, Entretiens ×2, Profil, Versions |
| `SignaturePad` | `ui/signature-pad` | SignatureReminderDialog |
| `MapboxMap` | `useMapModal` | UserServices |
| `DataTable`, `DataTableColumnHeader`, `DataTablePagination`, `SimplePagination` | tri et pagination recodés dans chaque vue | ~15 listes |
| `ConfirmDialog` | ~15 modales de suppression (avec option « taper CONFIRMER ») | partout |
| `ValidateRequestDialog` | `AbsenceValidateModal`, `AcompteValidateModal`, validation du Planning | absences, acomptes, planning |
| `UserAvatar`, `UserIdentity` | `getInitials` + avatar recopiés dans 8 fichiers ou plus | partout |
| `ErrorState` (Alert + « Réessayer »), états vides via `ui/empty` | blocs d'erreur et de vide de chaque vue | partout |
| `StatCard`, `StatusChips`, `ResponsiveFilterSheet` | cartes de stats, puces de statut, Sheet de filtres des pages « mes » | Pointage, Heures, Contrats, MyAbsences, MyAcomptes |
| `BrandLogo` | logo recopié dans 6 fichiers (`/src/assets/favicon.png`) | auth, légal, Navbar |

**`components/layout/`** : `RootLayout` (Outlet + UpdateBanner + ScrollRestoration), `AppLayout` (Navbar + Outlet + dialogs globaux), `GlobalDialogs`, `Navbar` (+ `NavbarLinks`, `UserMenu`, `MobileNavSheet`), `UpdateBanner`, `LegalLayout`.

**`src/hooks/`** : `useMediaQuery` (ou `use-mobile` shadcn), `useDebouncedValue`, `useNow` (horloge à la seconde via `useSyncExternalStore`), `useLocalStorage`, `usePermissions`, `useTheme` (+ `providers/ThemeProvider`), `useVersionCheck`, `useDialogState`, `useMapboxMap`, `usePdfPreview` (`useQuery`), `usePageMeta` (si D2 = B), `useDragAndDrop` (si pas de dnd-kit).

**`src/lib/`** : `utils.ts` (cn), `dates.ts` (dates locales), `fileIcons.ts`, `fileToDataUrl.ts`, `downloadBlob.ts`, `faviconBadge.ts`, `pdfPreview.ts`, `getDefaultRoute.ts`, `filterNav.ts`.

---

## 5. Table de correspondance

### 5.1 Routes (43, chemins identiques)

Gardes du Vue, dans l'ordre : non connecté → `/login` ; e-mail non vérifié → `logout()` puis `/login` ; compte inactif → `/unauthorized` ; `requiresAdmin` non admin → `/unauthorized` (et un admin en « vue utilisateur » repasse en vue admin) ; `requiresMechanic` = admin **ou** mécanicien ; `requiresCouchette` = `user.isCouchette === true`. Un utilisateur connecté qui ouvre `/login` ou `/register` va sur sa route par défaut (admin `/users`, mécanicien `/vehicules`, sinon `/pointage`). Pas de `?redirect=`. Défilement : position restaurée au retour arrière, sinon haut de page (`<ScrollRestoration />`).

En React : routes layout `RequireAuth` (auth + e-mail vérifié + compte actif), `RequireRole role="admin" | "mechanic"`, `RequireCouchette`, `RedirectIfAuthenticated` ; pages en `lazy`.

| Chemin | Nom Vue | Garde | Vue source | Page React | Statut |
|---|---|---|---|---|---|
| `/` | Landing | public | views/landing/Landing.vue | pages/landing/LandingPage.tsx | fait |
| `/mentions-legales` | MentionsLegales | public | views/legal/MentionsLegales.vue | pages/legal/MentionsLegalesPage.tsx | fait |
| `/politique-confidentialite` | PolitiqueConfidentialite | public | views/legal/PolitiqueConfidentialite.vue | pages/legal/PolitiqueConfidentialitePage.tsx | fait |
| `/unauthorized` | Unauthorized | public | views/common/Unauthorized.vue | pages/common/UnauthorizedPage.tsx | fait |
| `/login` | Login | public, redirige si connecté | views/auth/Login.vue | pages/auth/LoginPage.tsx | fait |
| `/register` | Register | public, redirige si connecté | views/auth/Register.vue | pages/auth/RegisterPage.tsx | fait |
| `/register/google` | GoogleRegister | public | views/auth/GoogleRegister.vue | pages/auth/GoogleRegisterPage.tsx | fait |
| `/verify` | Verify | public (`?token=`) | views/auth/Verify.vue | pages/auth/VerifyPage.tsx | fait |
| `/forgot-password` | ForgotPassword | public | views/auth/ForgotPassword.vue | pages/auth/ForgotPasswordPage.tsx | fait |
| `/password-reset` | PasswordReset | public (`?token=`) | views/auth/ResetPassword.vue | pages/auth/ResetPasswordPage.tsx | fait |
| `/download` | AppDownload | public | views/app-versions/AppVersionsPublic.vue | pages/app-versions/AppVersionsPublicPage.tsx | fait |
| `/add-to-homescreen` | AddToHomescreen | auth | views/auth/AddToHomescreen.vue | pages/auth/AddToHomescreenPage.tsx | fait |
| `/pointage` | Pointage | auth | views/hours/Pointage.vue | pages/hours/PointagePage.tsx | fait |
| `/myabsences` | MyAbsences | auth | views/myabsences/MyAbsences.vue | pages/myabsences/MyAbsencesPage.tsx | fait |
| `/myacomptes` | MyAcomptes | auth | views/acomptes/MyAcomptes.vue | pages/acomptes/MyAcomptesPage.tsx | fait |
| `/mycouchettes` | MesCouchettes | auth + couchette | views/couchettes/MesCouchettes.vue | pages/couchettes/MesCouchettesPage.tsx | fait |
| `/notifications` | Notifications | auth | views/common/Notifications.vue | pages/common/NotificationsPage.tsx | fait |
| `/profile` | Profile | auth | views/common/Profile.vue | pages/common/ProfilePage.tsx | fait |
| `/services` | ServicesMonitoring | admin | views/common/ServicesMonitoring.vue | pages/common/ServicesMonitoringPage.tsx | fait |
| `/users` | Users | admin | views/users/Users.vue | pages/users/UsersPage.tsx | fait |
| `/users/:uuid` | UserEdit | admin | views/users/UserEdit.vue | **à décider (Q-USEREDIT)** : la page Vue est cassée et orpheline | fait |
| `/users/:uuid/services` | UserServices | admin | views/users/UserServices.vue | pages/users/UserServicesPage.tsx | fait |
| `/absences` | Absences | admin (`?userUuid=`) | views/absences/Absences.vue | pages/absences/AbsencesPage.tsx | fait |
| `/absence-types` | AbsenceTypes | admin | views/absences/AbsenceTypes.vue | pages/absences/AbsenceTypesPage.tsx | fait |
| `/planning` | Planning | admin | views/hours/Planning.vue | pages/hours/PlanningPage.tsx | fait |
| `/heures` | Heures | admin | views/hours/Heures.vue | pages/hours/HeuresPage.tsx | fait |
| `/export-hours` | ExportHours | admin | views/hours/ExportHours.vue | pages/hours/ExportHoursPage.tsx | fait |
| `/contract-hours` | ContractHours | admin | views/hours/ContractHours.vue | pages/hours/ContractHoursPage.tsx | fait |
| `/journal-pointages` | JournalPointages | admin | views/hours/JournalPointages.vue | pages/hours/JournalPointagesPage.tsx | fait |
| `/acomptes` | Acomptes | admin (`?userUuid=`) | views/acomptes/Acomptes.vue | pages/acomptes/AcomptesPage.tsx | fait |
| `/signatures` | Signatures | admin | views/signatures/Signatures.vue | pages/signatures/SignaturesPage.tsx | fait |
| `/couchettes` | Couchettes | admin (`?userUuid=`) | views/couchettes/Couchettes.vue | pages/couchettes/CouchettesPage.tsx | fait |
| `/cartes` | Cartes | admin | views/cartes/Cartes.vue | pages/cartes/CartesPage.tsx | fait |
| `/types-cartes` | TypesCartes | admin | views/cartes/TypesCartes.vue | pages/cartes/TypesCartesPage.tsx | fait |
| `/app-versions` | AppVersions | admin (lien de nav limité à un e-mail, voir Q-APPVERSIONS) | views/app-versions/AppVersions.vue | pages/app-versions/AppVersionsPage.tsx | fait |
| `/vehicules` | Vehicules | mécanicien | views/vehicles/Vehicules.vue | pages/vehicles/VehiculesPage.tsx | fait |
| `/vehicules/:id` | VehiculeDetail | mécanicien | views/vehicles/VehiculeDetail.vue | pages/vehicles/VehiculeDetailPage.tsx | fait |
| `/entretiens` | Entretiens | mécanicien | views/maintenance/Entretiens.vue | pages/maintenance/EntretiensPage.tsx | fait |
| `/entretiens/vehicule/:id` | EntretiensVehicule | mécanicien | views/maintenance/EntretiensVehicule.vue | pages/maintenance/EntretiensVehiculePage.tsx | fait |
| `/types-entretien` | TypesEntretien | mécanicien | views/maintenance/TypesEntretien.vue | pages/maintenance/TypesEntretienPage.tsx | fait |
| `/stock` | Stock | mécanicien | views/stock/StockItems.vue | pages/stock/StockItemsPage.tsx | fait |
| `/todos` | Todos | mécanicien | views/todos/Todos.vue | pages/todos/TodosPage.tsx | fait |
| `*` | NotFound | public | views/common/NotFound.vue | pages/common/NotFoundPage.tsx | fait |

**Navbar** : dans le Vue, elle s'affiche si l'utilisateur est connecté et que le nom de route n'est pas dans `pagesWithoutNavbar`. Mais 6 des 9 noms de cette liste ne correspondent à aucune route (voir B-15). En pratique, la navbar est masquée seulement sur `/`, `/download` et 404. En React, le découpage en layouts remplace cette liste ; le choix des pages concernées est la question Q-NAVBAR.

### 5.2 Socle, build et couche agnostique

| Source Vue | Cible React | Adaptation | Phase | Statut |
|---|---|---|---|---|
| `package.json` | `package.json` | nom, scripts (`dev`, `build` = `tsc -b && vite build && node scripts/prerender.cjs`, `lint`, `preview`, `prerender`), dépendances de la section 2 ; version reprise (`0.1.6`) | 1 puis 5 | fait (script `build` = `tsc -b && vite build && node scripts/prerender.cjs`) |
| `vite.config.js` | `vite.config.ts` | `@vitejs/plugin-react` + React Compiler ; alias `@` ; port 5173 et `host 0.0.0.0` ; `define __APP_VERSION__` ; plugins `version.json`, sitemap (sources : `src/pages/landing`, `src/features/landing`, `src/assets/images`, `index.html`, `src/pages/auth/LoginPage.tsx`) et compression gzip + brotli ; `manualChunks` revus (plus de vue, fontawesome, chartjs, threejs) | 1 puis 5 | fait (`vite.config.ts` : React + Compiler, Tailwind, alias, serveur, `define`, version, sitemap, compression, chunk `react-vendor` à la place de `vue-vendor`) |
| `tsconfig.json` | `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json` (template) | alias `@/*` dans les deux premiers ; strict ; `noUncheckedIndexedAccess` (présent dans le Vue) ; `erasableSyntaxOnly` selon D3 | 1 | fait |
| `components.json` | `components.json` | régénéré par `shadcn init` puis remis en `new-york` / `neutral` (CLI v4, voir section 2) ; CSS variables, lucide | 1 | fait |
| `index.html` | `index.html` | point de montage `<div id="app"></div>` **conservé** (attendu par `prerender.cjs`), entrée `/src/main.tsx`, métas, OG, JSON-LD LocalBusiness + WebSite, script anti-FOUC (sans `.dark` sur `/`) ; balises propres à chaque page selon D2 | 1 puis 5 | fait (métas propres à chaque page retirées, rendues par `PageMeta` et recopiées par le pré-rendu : D2) |
| `scripts/prerender.cjs` | `scripts/prerender.cjs` | même client CDP ; attente adaptée à React (`#app h1` + marqueur de fin de rendu) ; `cleanHtml` sans les commentaires Vue ; montage React par `createRoot` (pas `hydrateRoot` : le DOM pré-rendu diffère, avec les classes `revealed` et les compteurs à leur valeur finale) ; capture du `<head>` si D2 = A | 5 | fait |
| `public/` (favicons, icons/, manifest.json, og-image.jpg, robots.txt, .well-known/, sounds/notif.wav) | `public/` | copiés ; pas `models/*.glb` (D1), `sounds/notif.{aiff,flac}`, `notif_converted.wav`, `vite.svg` (morts) | 2 | fait |
| `src/assets/` (favicon.png, logo.png, images/*.webp) | `src/assets/` | copiés ; `images/fonctions.png` jamais importé | 2 | fait |
| `.env.development`, `.env.production`, `.env.example` | idem | copiés (git-ignorés sauf l'exemple) | 2 | fait |
| `.gitignore` | `.gitignore` | repris (secrets, `.env*`, `dist`, `deploy.py`) ; lignes propres au Vue (`*.vue.b`) retirées ; `CLAUDE.md` selon D5 | 1 | fait |
| `CLAUDE.md` | `CLAUDE.md` | réécrit pour React (stack, architecture, conventions, pièges du brief et de cet inventaire) | 1 | fait |
| `deploy/deploy.py`, `deploy/apache-cache-headers.conf`, `deploy/install_apache_headers.py` | `deploy/` | copiés en fin de migration, chemins adaptés, `deploy.py` ajouté au `.gitignore` ; **jamais exécutés par moi** | 5 | fait |
| `src/main.ts` | `src/main.tsx` | `createRoot(#app)`, `RouterProvider`, `AppProviders`, import du CSS ; plus de FontAwesome | 3 | fait |
| `src/App.vue` | `components/layout/RootLayout.tsx`, `components/layout/AppLayout.tsx`, `components/layout/GlobalDialogs.tsx`, `providers/AppProviders.tsx` | voir 5.3 pour les comportements globaux | 3 | fait |
| `src/router/index.ts` | `src/router/routes.tsx`, `src/router/guards.tsx`, `src/lib/getDefaultRoute.ts` | gardes en routes layout ; le passage en vue admin (`setViewMode(false)`) se fait à l'entrée de la zone admin ; `getDefaultRoute` unique (aujourd'hui recopié dans Login, Register et Navbar) | 3 | fait |
| `src/stores/auth.ts` | `src/stores/auth-store.ts` | Zustand ; hydratation manuelle depuis `auth_token` + `user` ; `refreshUser` en arrière-plan au démarrage (GET `/profile`, 401 → déconnexion, erreurs réseau ignorées) ; sélecteurs `isAdmin`/`isMechanic`/`isUser` par UUID de rôle ; `login` et `loginWithGoogle` deviennent des mutations de `features/auth` | 3 | fait |
| `src/api/ApiClient.ts` | `src/api/ApiClient.ts` | copié à l'identique (D3) | 2 | fait |
| `src/api/index.ts` | `src/api/index.ts` | intercepteur 401 conservé (sauf `Access denied: Required role …`) ; déconnexion via `useAuthStore.getState().logout()`, `router.navigate('/login')` par import dynamique, `queryClient.clear()` | 2 puis 3 | fait : les imports dynamiques du store Pinia et du router Vue sont remplacés par `setUnauthorizedHandler()`, enregistré par `RootLayout` |
| `src/services/*.ts` (25 services + index) | `src/services/` | copiés **inchangés** (`export.ts` garde son `fetch` direct ; `POST /services/history` garde son `+1 jour`) | 2 | fait |
| `src/models/*.ts` (36 DTO + index) | `src/models/` | copiés ; seule adaptation : `import type` sur 16 imports de types (10 fichiers), exigé par `verbatimModuleSyntax` du template | 2 | fait |
| `src/enums/*.ts` (UserRole, UserStatus, PeriodiciteType, AbsencePeriod, index) | `src/enums/` | copiés (D3) | 2 | fait |
| `src/types/*.ts` (api, file, geocoding, google-identity.d.ts, index) | `src/types/` | copiés | 2 | fait |
| `src/utils/*.ts` (absenceFormatters, acompteFormatters, fileUtils, timeFormatters, userVisibility) | `src/utils/` | copiés inchangés | 2 | fait |
| `src/utils/serviceModificationFormatters.ts` | `src/utils/serviceModificationFormatters.ts` | seul utilitaire dépendant de Vue : `Component` devient `LucideIcon`, import `lucide-react` | 2 | fait |
| `src/lib/utils.ts` | `src/lib/utils.ts` | réexporte `cn` du paquet `cn` (écart au brief, voir section 2) | 1 | fait |
| `src/config/api.ts`, `map.ts`, `seo.ts`, `version.ts` | `src/config/` | copiés | 2 | fait |
| `src/config/navConfig.ts` | `src/config/navConfig.ts` | `Component` devient `LucideIcon`, import `lucide-react` (mêmes icônes) ; même contenu, y compris `requiredEmails` | 2 | fait |
| `src/config/icons.ts` | — | supprimé (FontAwesome) | 2 | fait |
| `src/data/changelog.ts` | `src/features/changelog/data/changelog.ts` | copié | 2 | fait |
| `src/vite-env.d.ts` | `src/vite-env.d.ts` | sans `declare module '*.vue'` ; ajout de `VITE_MAPBOX_TOKEN` | 2 | fait |
| `src/styles/tailwind.css` | `src/index.css` (fichier de shadcn init) | tokens, `@custom-variant dark`, `@layer base` (voir 4.2) | 1 | fait |
| `src/styles/theme.css` | — | non porté ; seuls `--font-sans`/`--font-mono`, le lissage des polices et une scrollbar adaptée au thème sombre sont repris dans `index.css` | 1 | fait |
| `src/style.css` | — | mort (jamais importé) | — | — |

### 5.3 Comportements globaux (App.vue) → coquille React

| Comportement Vue | Cible React | Statut |
|---|---|---|
| Navbar si connecté et route hors `pagesWithoutNavbar` | `AppLayout` sur les routes concernées (Q-NAVBAR) | fait |
| `<Messages>` (toasts maison, z-1070, `top-16`) | `<Toaster />` sonner dans `AppProviders` | fait |
| `UpdateBanner` + `useVersionCheck` (prod seulement : `/version.json` sans cache, vérification sur visibilité, focus, online, pageshow, navigation, et toutes les 5 min ; rechargement silencieux une fois par version au démarrage ; « plus tard » mémorisé en sessionStorage) | `components/layout/UpdateBanner.tsx` + `src/hooks/useVersionCheck.ts` ; navigation via `router.subscribe` | fait |
| `ChangelogDialog` + `useChangelog` (entrée filtrée par rôle, `changelog_last_seen_version`) | `features/changelog/{components/ChangelogDialog, hooks/useChangelog, data/changelog}` ; ouverture auto (Q-GLOBALDIALOGS) | fait |
| `ProfileCompletionDialog` (adresse ou permis manquant) | `features/profile/components/ProfileCompletionDialog.tsx` (Q-GLOBALDIALOGS) | fait |
| `ServiceHistoryDialog` + `useServiceHistory` (singleton, admin) | `features/service-history/` : contexte `ServiceHistoryProvider` dans `AppLayout`, `useServiceModificationsQuery(uuid)` | fait |
| `SignatureReminderDialog` + `useSignatureReminder` (bloquant, une fois par session, si des heures du mois dernier ne sont pas signées) | `features/signatures/{components/SignatureReminderDialog, api/useSignatureSummaryQuery}` | fait |
| `usePendingUsers` (badge du lien « Utilisateurs », admin) | `features/users/api/usePendingUsers.ts` = `useUsersQuery` + `select` (même cache que la page Utilisateurs) | fait |
| Notifications : cloche, polling toutes les 5 s, son, titre `(n) …`, badge favicon | `features/notifications/{components/NotificationsPopover, api/useUnreadNotificationsQuery (refetchInterval 5 s), hooks/useNotificationSideEffects}` monté **une seule fois** ; `src/lib/faviconBadge.ts` | fait |
| Thème (`useTheme`, `theme-preference`, landing forcée en clair) | `providers/ThemeProvider.tsx` + `useTheme` ; `/` reste en clair | fait |
| Déconnexion (`logout()` puis `/login`) | action du store + `queryClient.clear()` + navigation | fait |

### 5.4 Composables (19)

| Composable | Cible React | Statut |
|---|---|---|
| `useBrowserDetection.ts` | `features/auth/lib/browserDetection.ts` (fonctions pures, sans le champ `icon` jamais rendu) | fait |
| `useChangelog.ts` | `features/changelog/hooks/useChangelog.ts` + `src/hooks/useLocalStorage.ts` | fait |
| `useContextMenu.ts` | — : `ui/context-menu` shadcn | fait |
| `useFaviconBadge.ts` | `src/lib/faviconBadge.ts` (module, pas un hook) | fait |
| `useGoogleIdentity.ts` | `features/auth/lib/googleIdentity.ts` (chargement mémoïsé du script Google) | fait |
| `useGoogleRegistration.ts` | `features/auth/lib/googleRegistration.ts` (état de module en mémoire, volontairement non persisté) | fait |
| `useGoogleSignIn.ts` | `features/auth/api/useGoogleSignInMutation.ts` + `features/auth/hooks/useGoogleSignIn.ts` | fait |
| `useMapModal.ts` | `src/hooks/useMapboxMap.ts` + `components/shared/MapboxMap.tsx` + `features/user-services/components/ServiceLocationDialog.tsx` | fait |
| `useMessages.ts` | sonner (`toast`), voir section 3 | fait |
| `usePageMeta.ts` | balises natives React 19 ou `src/hooks/usePageMeta.ts` (D2) | fait |
| `usePdfPreview.ts` | `src/lib/pdfPreview.ts` + `src/hooks/usePdfPreview.ts` (`useQuery`, clé fondée sur un hash du contenu) | fait |
| `usePendingUsers.ts` | `features/users/api/usePendingUsers.ts` + `features/users/lib/pendingActivation.ts` | fait |
| `usePermissions.ts` | `src/hooks/usePermissions.ts` (sélecteurs du store ; `canAccess`, `hasPermission('couchette')`, simulation UTILISATEUR en « vue utilisateur ») | fait |
| `useServiceHistory.ts` | `features/service-history/` (contexte + requête) | fait |
| `useSignatureReminder.ts` | `features/signatures/api/useSignatureSummaryQuery.ts` + `features/signatures/hooks/useSignatureReminder.ts` | fait |
| `useTheme.ts` | `providers/ThemeProvider.tsx` + `src/hooks/useTheme.ts` | fait |
| `useUserHours.ts` | — : mort (aucun import) | — |
| `useUserServices.ts` (584 l.) | `features/user-services/{api/*, hooks/useServiceFilters.ts, hooks/useAdminServiceActions.ts, lib/groupServicesByDay.ts, lib/serviceLocation.ts, lib/serviceStatus.ts}` | fait |
| `useVersionCheck.ts` | `src/hooks/useVersionCheck.ts` | fait |

### 5.5 Composants de `components/ui` du Vue

**Composants maison, à sortir de `ui/`**

| Vue | Cible React | Statut |
|---|---|---|
| `ui/address-autocomplete/AddressAutocomplete.vue` | `components/shared/AddressAutocomplete.tsx` | fait |
| `ui/changelog/ChangelogDialog.vue` | `features/changelog/components/ChangelogDialog.tsx` | fait |
| `ui/context-menu-popover/*` (3 fichiers) | — : `ui/context-menu` | fait |
| `ui/file-card/FileCard.vue` | `components/shared/FileCard.tsx` | fait |
| `ui/file-dropzone/FileDropzone.vue` | `components/shared/FileDropzone.tsx` (+ `ui/progress`) | fait |
| `ui/image-lightbox/ImageLightbox.vue` (305 l.) | `components/shared/ImageLightbox.tsx` + hooks `useZoom`/`useSwipe` | fait |
| `ui/input-field/InputField.vue` | `components/shared/InputField.tsx` | fait |
| `ui/messages/Messages.vue` | — : `ui/sonner` | fait |
| `ui/navbar/Navbar.vue` (448 l.) | `components/layout/Navbar.tsx`, `NavbarLinks.tsx`, `UserMenu.tsx`, `MobileNavSheet.tsx` + `src/lib/filterNav.ts` | fait |
| `ui/notifications/Notifications.vue` (550 l.) | `features/notifications/components/NotificationsPopover.tsx`, `NotificationItem.tsx`, `hooks/useNotificationSideEffects.ts`, `lib/notificationMeta.ts` (partagé avec la page) | fait |
| `ui/pdf-preview/PdfPreview.vue` | `components/shared/PdfPreview.tsx` | fait |
| `ui/profile-completion/ProfileCompletionDialog.vue` | `features/profile/components/ProfileCompletionDialog.tsx` | fait |
| `ui/retour/Retour.vue` | `components/shared/BackButton.tsx` | fait |
| `ui/search-filters/SearchFilters.vue` | `components/shared/SearchFilters.tsx` | fait |
| `ui/select/Select.vue` (maison) | `components/shared/Combobox.tsx` (popover + command) ; `ui/select` si pas de recherche | fait |
| `ui/signature-pad/SignaturePad.vue` | `components/shared/SignaturePad.tsx` | fait |
| `ui/update-banner/UpdateBanner.vue` | `components/layout/UpdateBanner.tsx` | fait |

**Composants shadcn-vue standard** : régénérés par le CLI, personnalisations de la section 4.2.

| Vue | React | Statut |
|---|---|---|
| `ui/alert-dialog/*` (inutilisé dans le Vue) | non repris : `ConfirmDialog` repose sur `dialog` (`role="alertdialog"`) | fait |
| `ui/avatar/*` | `ui/avatar.tsx` | fait |
| `ui/badge/*` | `ui/badge.tsx` (+ variante `warning`) | fait |
| `ui/button/*` | `ui/button.tsx` | fait |
| `ui/checkbox/*` | `ui/checkbox.tsx` | fait |
| `ui/dialog/*` (dont `DialogScrollContent`, inutilisé) | `ui/dialog.tsx` | fait |
| `ui/dropdown-menu/*` | `ui/dropdown-menu.tsx` | fait |
| `ui/input/*`, `ui/label/*`, `ui/textarea/*` | `ui/input.tsx`, `ui/label.tsx`, `ui/textarea.tsx` | fait |
| `ui/separator/*` | `ui/separator.tsx` | fait |
| `ui/sheet/*` | `ui/sheet.tsx` | fait |
| `ui/skeleton/*` | `ui/skeleton.tsx` | fait |
| `ui/table/*` (`TableEmpty`, `utils.ts` inutilisés) | `ui/table.tsx` | fait |
| `ui/tabs/*` | `ui/tabs.tsx` | fait |
| `ui/tooltip/*` | `ui/tooltip.tsx` | fait |
| `ui/sidebar/*` (18 fichiers) + `components/layout/AppSidebar.vue` | — : morts (aucun import) | — |

### 5.6 Composants métier et pages, par domaine

Chaque ligne liste les fichiers cibles principaux. Le découpage fin (sous-composants, hooks, colonnes) est dans l'annexe du domaine. Les pages de plus de 250 lignes dans le Vue sont **découpées**, pas transcrites.

#### Auth et pages d'erreur (phase 3 pour Login, NotFound, Unauthorized ; 4.1 pour le reste). Annexe : [auth-landing-versions](docs/migration/inventaire-auth-landing-versions.md)

| Source Vue | Cible React | Dépendances clés | Statut |
|---|---|---|---|
| views/auth/Login.vue (220) | pages/auth/LoginPage.tsx ; features/auth/components/{AuthCard, LoginForm, OrDivider, AuthAlert} ; api/useLoginMutation.ts ; schemas/login.ts | InputField, Google, prompt écran d'accueil sur mobile, contrôles e-mail vérifié / compte actif après login | fait |
| views/auth/Register.vue (278) | pages/auth/RegisterPage.tsx ; features/auth/components/{RegisterForm, RegisterSuccess} ; api/useRegisterMutation.ts ; schemas/register.ts | confirmation du mot de passe (`refine`) | fait |
| views/auth/GoogleRegister.vue (190) | pages/auth/GoogleRegisterPage.tsx ; features/auth/components/GoogleRegisterForm.tsx ; api/useGoogleRegisterMutation.ts | relais de l'inscription Google (`lib/googleRegistration.ts`) ; redirection vers `/login` si le relais est vide | fait |
| views/auth/Verify.vue (119) | pages/auth/VerifyPage.tsx ; features/auth/components/VerifyEmailStatus.tsx ; api/useVerifyEmailQuery.ts | `?token=` ; `retry: false`, un seul appel (StrictMode) ; redirection temporisée nettoyée | fait |
| views/auth/ForgotPassword.vue (98) | pages/auth/ForgotPasswordPage.tsx ; features/auth/components/ForgotPasswordForm.tsx ; api/useRequestPasswordResetMutation.ts | | fait |
| views/auth/ResetPassword.vue (148) | pages/auth/ResetPasswordPage.tsx ; features/auth/components/ResetPasswordForm.tsx ; api/useConfirmPasswordResetMutation.ts | `?token=` | fait |
| views/auth/AddToHomescreen.vue (122) | pages/auth/AddToHomescreenPage.tsx ; features/auth/components/BrowserInstructionsTabs.tsx | `lib/browserDetection.ts` | fait |
| components/auth/GoogleSignInButton.vue (100) | features/auth/components/GoogleSignInButton.tsx | script Google (GIS) chargé une fois ; effet avec nettoyage (StrictMode) | fait |
| components/home-screen/HomeScreenPrompt.vue (63) | features/auth/components/HomeScreenPromptDialog.tsx | | fait |
| views/common/NotFound.vue (76) | pages/common/NotFoundPage.tsx (route `*` et `errorElement`) | | fait |
| views/common/Unauthorized.vue (56) | pages/common/UnauthorizedPage.tsx | | fait |

Hooks Query : `useLoginMutation`, `useGoogleSignInMutation`, `useRegisterMutation`, `useGoogleRegisterMutation`, `useVerifyEmailQuery`, `useRequestPasswordResetMutation`, `useConfirmPasswordResetMutation`.

#### Pointage (4.2). Annexe : [heures-pointage-signatures](docs/migration/inventaire-heures-pointage-signatures.md)

| Source Vue | Cible React | Dépendances clés | Statut |
|---|---|---|---|
| views/hours/Pointage.vue (1117) | pages/hours/PointagePage.tsx (~130 l.) ; features/pointage/components/{PointageHeader, PointageSkeleton, StatusHeroCard, StatusPill, WorkedHoursStats, TodayServicesCard, ServiceHistorySection, HistoryDayItem, HistoryPagination, HistoryFiltersSheet, MobileActionBar, KilometrageDialog} ; hooks/{usePointageStatus, useGeolocation, usePointageActions, useKilometrageDialog} ; lib/{workedTime, groupHistoryByDay} | `useNow` (chrono à la seconde), géolocalisation (permission, toasts), km du jour **obligatoire** pour le rôle Utilisateur avant « Démarrer », barre d'actions fixe en bas sous `md` avec safe-area, historique en `accordion`, filtres dans un `sheet` (en bas sous 640 px, à droite au-dessus), `useVehiclesQuery` + `useAddKilometrageMutation` (feature vehicles) | fait |
| components/hours/PointageActions.vue (74) | features/pointage/components/PointageActions.tsx | | fait |
| components/hours/ServiceTimeline.vue (78) | features/pointage/components/ServiceTimeline.tsx | | fait |

Hooks Query : `useActiveServiceQuery`, `useMyWorkedHoursQuery`, `useDailyServicesQuery`, `useServiceHistoryQuery(filters, page)` (POST `/services/history`, `+1 jour` géré par le service), mutations start/end/startBreak/endBreak, `useMyLastKilometrageQuery`. Priorité : **vérifier d'abord à 360 px**.

#### Heures, planning, export, contrats, journal (4.3). Annexe : [heures-pointage-signatures](docs/migration/inventaire-heures-pointage-signatures.md)

| Source Vue | Cible React | Dépendances clés | Statut |
|---|---|---|---|
| views/hours/Planning.vue (1221) | pages/hours/PlanningPage.tsx ; features/planning/components/{PlanningToolbar, PeriodNavigator, CustomRangeControls, PlanningExportMenu, PlanningGrid, PlanningDayHeaderCell, PlanningUserRow, PlanningDayCell, PlanningLegend, AbsenceDetailDialog, AbsenceValidationActions} ; hooks/{usePlanningPeriod, usePlanningExport} ; lib/{frenchHolidays, planningDates, absenceIndex, absenceCellStyle, planningExportHtml, exportPlanningFile} | `tabs`, `dropdown-menu`, jspdf + html2canvas-pro, `useAbsenceTypesQuery` / `useValidateAbsenceMutation` (feature absences) | fait |
| views/hours/Heures.vue (509) | pages/hours/HeuresPage.tsx ; features/hours/components/{HoursStatsGrid, UsersHoursTable, UserHoursCard} ; lib/hoursFormat.ts | data-table | fait |
| views/hours/ExportHours.vue (395) | pages/hours/ExportHoursPage.tsx ; features/hours/components/{ExportHoursForm, PeriodPresets, UserMultiSelectList} ; lib/periodPresets.ts ; `src/lib/downloadBlob.ts` | `exportService` (fetch direct, blob) | fait |
| views/hours/ContractHours.vue (593) | pages/hours/ContractHoursPage.tsx ; features/hours/components/{MonthYearPicker, ContractStatsGrid, ContractComparisonTable, ContractComparisonCard} ; lib/contractFormat.ts | `progress` | fait |
| views/hours/JournalPointages.vue (419) | pages/hours/JournalPointagesPage.tsx ; features/service-history/components/{ServiceModificationsTable, ServiceModificationCard, JournalFilters} ; hooks/useJournalFilters.ts | SearchFilters | fait |
| components/hours/ServiceHistoryDialog.vue (193) | features/service-history/components/{ServiceHistoryDialog, ModificationTimelineEntry}.tsx + `ServiceHistoryProvider` | monté dans AppLayout (admin) | fait |
| components/hours/ModificationUser.vue (48) | features/service-history/components/ModificationUser.tsx | | fait |
| components/hours/ServiceModificationSummary.vue (70) | features/service-history/components/ServiceModificationSummary.tsx | `utils/serviceModificationFormatters` | fait |

Hooks Query : `usePlanningQuery`, `useUsersWithHoursQuery`, `useContractComparisonQuery(year, month)`, `useExportHoursMutation`, `useServiceModificationsSearchQuery`, `useServiceModificationsQuery(uuid)`.

#### Utilisateurs, pointages d'un employé, suivi des présences (4.4). Annexe : [users-profil-notifications](docs/migration/inventaire-users-profil-notifications.md)

| Source Vue | Cible React | Dépendances clés | Statut |
|---|---|---|---|
| views/users/Users.vue (987) | pages/users/UsersPage.tsx ; features/users/components/{PendingActivationSection, UsersToolbar, UsersDataTable, users-columns, UserRowContextMenu, UserActionsDropdown, UserMobileList, UserMobileCard, UserIdentityCell, RoleBadge, PresenceBadge, AccountStatusBadges, LastVehicleInfo, DeleteUserDialog} ; hooks/{useUserActions, useUserDialogs, useUsersFilters} ; lib/{userPresence, formatters} | data-table, context-menu, ConfirmDialog « CONFIRMER » ; **pas** de `selectableUsers` (admin des comptes) | fait |
| views/users/UserEdit.vue (465) | Q-USEREDIT | page cassée (méthodes de service inexistantes) et orpheline | fait |
| views/users/UserServices.vue (919) + composables/useUserServices.ts (584) | pages/users/UserServicesPage.tsx ; features/user-services/components/{UserStatusCard, WorkedHoursStats, ServicesFiltersPanel, ServicesDayList, ServiceDayCard, ServiceRow, ServiceRowActions, ModifiedBadge, DayOffsetBadge, ServiceFormDialog, DeleteServiceDialog, ServiceLocationDialog, ServicesPagination} ; schemas/serviceForm.ts ; hooks/{useServiceFilters, useAdminServiceActions} ; lib/{groupServicesByDay, serviceLocation, serviceStatus} | mapbox-gl, `tooltip`, `toggle-group`, `collapsible`, historique des modifications | fait |
| components/users/UserEditModal.vue (564) | features/users/components/{UserEditDialog, UserEditForm, IdentityFields, AccessFields, ContractField, ContactFields, AddressFields, UserSystemInfo} ; schemas/userEdit.ts | AddressAutocomplete, InputField, cases en carte cliquable | fait |
| components/users/UserEmailModal.vue (191) | features/users/components/UserEmailDialog.tsx ; schemas/userEmail.ts | | fait |
| components/users/UserHoursModal.vue (669) | features/users/components/{UserHoursDialog, HoursPeriodTabs, PeriodNavigator, HoursStatsGrid} ; hooks/useHoursPeriod.ts ; lib/{isoWeek, dateKeys} | contrôlé par `open` + `user` (plus de `ref.open()`) ; réutilisé par le suivi des présences | fait |
| views/common/ServicesMonitoring.vue (583) | pages/common/ServicesMonitoringPage.tsx ; features/monitoring/components/{PresenceStatsPills, PresenceSection, PresenceUserCard, UserActionsMenuItems} ; lib/groupByPresence.ts | `refetchInterval: 10 s`, `collapsible`, context-menu | fait |

Hooks Query : `useUsersQuery`, `usePendingUsers`, `useUsersLastVehiclesQuery`, `useUserQuery`, `useUsersWithStatusQuery`, `useUserActiveServiceQuery`, `useUserServicesHistoryQuery`, `useUserWorkedHoursQuery`, mutations `useUpdateUser`, `useDeleteUser`, `useResendVerification`, create/update/delete/actions de pointage admin.

#### Véhicules (4.5). Annexe : [vehicules](docs/migration/inventaire-vehicules.md)

| Source Vue | Cible React | Dépendances clés | Statut |
|---|---|---|---|
| views/vehicles/Vehicules.vue (967) | pages/vehicles/VehiculesPage.tsx ; features/vehicles/components/list/{VehiclesToolbar, vehiclesColumns, VehiclesDataTable, VehiclesMobileList, VehicleMobileCard, VehicleActionsMenuItems} ; components/{VehicleIdentity, VehicleAvatar, RelaiBadge} ; dialogs/{VehicleCreateDialog, VehicleDeleteDialog} ; forms/{VehicleFormFields, VehiclePictureInput} ; schemas/vehicle.ts | data-table, context-menu, ConfirmDialog « CONFIRMER » | fait |
| views/vehicles/VehiculeDetail.vue (1242) | pages/vehicles/VehiculeDetailPage.tsx ; features/vehicles/components/detail/{VehicleInfoCard, VehicleInfoHeader, VehicleInfoView, VehicleKmBadge, AddKmDialog, VehicleDetailsGrid, InfoTile, VehicleEditForm, VehicleAvatarEditor, VehicleDetailTabs} ; hooks/{useVehicleFilesUpload, useDetailTab} ; PicturesGridDialog | onglets « classeur » (style à reproduire), PdfViewerDialog, ImageLightbox, FileDropzone | fait |
| components/vehicles/VehiculeInfoCard.vue (570) | detail/VehicleInfoCard.tsx et sous-composants ; lib/expiryStatus.ts | échéances orange sous 30 jours, rouge si dépassées | fait |
| components/vehicles/VehiculeKilometragesTab.vue (338) | tabs/kilometrages/{VehicleKmTab, KmChart, KmTimeline, KmTimelineItem, EditKmDialog} | **chart.js → `chart` shadcn (Recharts, AreaChart)** ; édition réservée à l'admin | fait |
| components/vehicles/VehiculeCommentsTab.vue (100) | tabs/comments/{VehicleCommentsTab, CommentCard, AddCommentDialog, AdjustPicturesDialog} | | fait |
| components/vehicles/VehiculeEquipementsTab.vue (85) | tabs/equipements/{VehicleEquipementsTab, EquipementCard} | | fait |
| components/vehicles/VehiculeEquipementModal.vue (142) | tabs/equipements/EquipementFormDialog.tsx | | fait |
| components/vehicles/VehiculeEquipementDeleteModal.vue (79) | tabs/equipements/EquipementDeleteDialog.tsx (ConfirmDialog) | | fait |
| components/vehicles/VehiculeFilesTab.vue (78) | tabs/files/VehicleFilesTab.tsx | FileDropzone, FileCard | fait |
| components/vehicles/VehiculeFileCard.vue (29) | — : simple relais, remplacé par `components/shared/FileCard` | | fait |
| components/vehicles/VehiculePagination.vue (39) | `components/shared/SimplePagination.tsx` | | fait |
| components/vehicles/VehiculeRapportsTab.vue (110) | tabs/rapports/{VehicleRapportsTab, RapportCard} | | fait |

Hooks Query : `useVehiclesQuery`, `useVehicleQuery`, `useVehicleFiles`, `useVehicleKilometrages`, `useVehicleAdjustInfos`, `useAdjustInfoPictures`, `useVehicleRapports`, `useVehicleEquipements` ; mutations create/update/delete véhicule, add/update km (partagée avec Pointage), upload/delete fichier, commentaire, équipements.

#### Entretiens (4.6). Annexe : [entretiens](docs/migration/inventaire-entretiens.md)

| Source Vue | Cible React | Dépendances clés | Statut |
|---|---|---|---|
| views/maintenance/Entretiens.vue (2089) | pages/maintenance/EntretiensPage.tsx ; features/maintenance/components/fleet/{FleetDashboard, FleetStatusSection, FleetVehicleCard, FleetAlertLine, FleetDashboardSkeleton} ; history/{EntretiensHistory, EntretiensHistoryToolbar, entretienColumns, EntretiensDataTable, EntretienMobileCard, EntretienActionsMenu, EntretiensTotalCost} ; form/{EntretienFormDialog, TypeEntretienPicker, EntretienFilesField} ; files/EntretienFilesDialog ; lib/{fleetStatus, entretienDates, formatPeriodicite, buildHistorySearchParams} ; hooks/{useEntretiensHistory, useHistoryFilterConfig, useEntretienDialogs, useFleetStatus, useCanManageMaintenance} | SearchFilters, data-table, context-menu, Combobox hiérarchique (popover + command), FileDropzone, ImageLightbox, PdfViewerDialog | fait |
| views/maintenance/EntretiensVehicule.vue (1693) | pages/maintenance/EntretiensVehiculePage.tsx ; features/maintenance/components/vehicule/{VehiculeEntretiensHeader, VehicleUpcomingAlerts, UpcomingAlertCard, ValidateEntretienDialog} ; config/{VehiculeConfigsPanel, VehiculeConfigCard} ; + historique, formulaire et fichiers **partagés** avec Entretiens | `TabbedPageHeader` partagé | fait |
| views/maintenance/TypesEntretien.vue (894) | pages/maintenance/TypesEntretienPage.tsx ; features/maintenance/components/types/{DossiersSidebar, DossierNavItem, TypesToolbar, TypesEntretienList, TypeEntretienCard, TypeEntretienFormDialog, DossierFormDialog} ; hooks/{useTypesExplorer, useTypeDragAndDrop} | glisser-déposer (Q-DND), `scroll-area` | fait |
| components/maintenance/ConfigEntretienModal.vue (220) | features/maintenance/components/config/ConfigEntretienDialog.tsx ; schemas/configEntretien.ts | | fait |

Hooks Query : `useFleetUpcomingQuery`, `useVehicleUpcomingQuery`, `useEntretiensHistoryQuery`, `useEntretienFilesQuery`, `useTypesEntretienQuery`, `useDossiersQuery`, `useVehiculeConfigsQuery` + mutations (voir l'annexe).

#### Absences (4.7). Annexe : [absences-acomptes](docs/migration/inventaire-absences-acomptes.md)

| Source Vue | Cible React | Dépendances clés | Statut |
|---|---|---|---|
| views/absences/Absences.vue (971) | pages/absences/AbsencesPage.tsx ; features/absences/components/admin/{absenceColumns, AbsencesDataTable, AbsenceMobileList, absenceRowActions, AbsenceDialogs} ; hooks/useAdminAbsenceFilters.ts | SearchFilters, data-table, context-menu, `?userUuid=` entrant (Users, suivi des présences, Planning) | fait |
| views/absences/AbsenceTypes.vue (323) | pages/absences/AbsenceTypesPage.tsx ; features/absences/components/types/AbsenceTypesTable.tsx | | fait |
| views/myabsences/MyAbsences.vue (543) | pages/myabsences/MyAbsencesPage.tsx ; features/absences/components/my/MyAbsenceFiltersSheet.tsx ; hooks/useMyAbsenceFilters.ts | StatusChips, ResponsiveFilterSheet, `useMediaQuery('(max-width: 639px)')` | fait |
| components/absences/AbsenceEditModal.vue (409) | features/absences/components/admin/AbsenceFormDialog.tsx + components/AbsenceFormFields.tsx (partagé avec la demande employé) ; schemas/absence.ts | Combobox employé (`selectableUsers`), « Approuver directement » | fait |
| components/absences/AbsenceDetailModal.vue (239) | features/absences/components/admin/AbsenceDetailDialog.tsx | | fait |
| components/absences/AbsenceValidateModal.vue (166) | `components/shared/ValidateRequestDialog.tsx` + résumé d'absence | motif obligatoire en cas de refus | fait |
| components/absences/AbsenceDeleteModal.vue (179) | `components/shared/ConfirmDialog.tsx` + résumé d'absence | | fait |
| components/absences/AbsenceTypeEditModal.vue (207) | features/absences/components/types/AbsenceTypeFormDialog.tsx | couleur `#RRGGBB` | fait |
| components/myabsences/MyAbsenceCard.vue (135) | features/absences/components/my/MyAbsenceCard.tsx | | fait |
| components/myabsences/MyAbsenceDetailModal.vue (200) | features/absences/components/my/MyAbsenceDetailDialog.tsx | | fait |
| components/myabsences/MyAbsenceEditModal.vue (271) | features/absences/components/my/MyAbsenceRequestDialog.tsx | AbsenceFormFields | fait |

Hooks Query : `useAdminAbsencesQuery`, `useMyAbsencesQuery`, `useAbsenceTypesQuery` (partagé avec Planning), mutations create (admin et employé), update, validate (partagée avec Planning), delete, cancel, CRUD des types.

#### Acomptes (4.8). Annexe : [absences-acomptes](docs/migration/inventaire-absences-acomptes.md)

| Source Vue | Cible React | Dépendances clés | Statut |
|---|---|---|---|
| views/acomptes/Acomptes.vue (930) | pages/acomptes/AcomptesPage.tsx ; features/acomptes/components/admin/{acompteColumns, AcomptesDataTable, AcompteMobileList, acompteRowActions, AcompteDialogs} ; components/PaymentStatusBadge.tsx ; hooks/useAdminAcompteFilters.ts | bascule « payé » en mise à jour optimiste | fait |
| views/acomptes/MyAcomptes.vue (538) | pages/acomptes/MyAcomptesPage.tsx ; features/acomptes/components/my/MyAcompteFiltersSheet.tsx ; hooks/useMyAcompteFilters.ts | mêmes briques que MyAbsences | fait |
| components/acomptes/AcompteEditModal.vue (232) | features/acomptes/components/admin/AcompteCreateDialog.tsx + components/AcompteFormFields.tsx | Combobox employé, ApproveDirectlyField | fait |
| components/acomptes/AcompteDetailModal.vue (207) | features/acomptes/components/admin/AcompteDetailDialog.tsx | | fait |
| components/acomptes/AcompteValidateModal.vue (155) | `components/shared/ValidateRequestDialog.tsx` | | fait |
| components/acomptes/AcompteDeleteModal.vue (152) | `components/shared/ConfirmDialog.tsx` | | fait |
| components/myacomptes/MyAcompteCard.vue (127) | features/acomptes/components/my/MyAcompteCard.tsx | | fait |
| components/myacomptes/MyAcompteDetailModal.vue (180) | features/acomptes/components/my/MyAcompteDetailDialog.tsx | | fait |
| components/myacomptes/MyAcompteEditModal.vue (149) | features/acomptes/components/my/MyAcompteRequestDialog.tsx | | fait |

Hooks Query : `useAdminAcomptesQuery`, `useMyAcomptesQuery`, mutations create (admin et employé), validate, delete, `useToggleAcomptePaid` (optimiste), cancel.

#### Signatures (4.9). Annexe : [heures-pointage-signatures](docs/migration/inventaire-heures-pointage-signatures.md)

| Source Vue | Cible React | Dépendances clés | Statut |
|---|---|---|---|
| views/signatures/Signatures.vue (441) | pages/signatures/SignaturesPage.tsx ; features/signatures/components/{SignaturesTable, SignatureViewDialog, SignatureHistoryDialog, DeleteSignatureDialog} ; lib/signatureImage.ts | | fait |
| components/signatures/SignatureReminderDialog.vue (121) | features/signatures/components/SignatureReminderDialog.tsx (monté dans GlobalDialogs) | SignaturePad ; dialog **bloquant** (exception assumée, comme dans le Vue) | fait |

Hooks Query : `useAllUsersSignaturesQuery`, `useUserSignaturesQuery`, `useDeleteSignatureMutation`, `useSignatureSummaryQuery`, `useCreateSignatureMutation`.

#### Couchettes (4.10). Annexe : [couchettes-stock-cartes-todos](docs/migration/inventaire-couchettes-stock-cartes-todos.md)

| Source Vue | Cible React | Dépendances clés | Statut |
|---|---|---|---|
| views/couchettes/Couchettes.vue (595) | pages/couchettes/CouchettesPage.tsx ; features/couchettes/components/{CouchettesTable, couchettesColumns, CouchetteMobileList} ; hooks/{useCouchetteSearchParams, useCouchettesFilterConfig} | SearchFilters, pagination serveur, `?userUuid=` | fait |
| views/couchettes/MesCouchettes.vue (477) | pages/couchettes/MesCouchettesPage.tsx ; features/couchettes/components/{TodayCouchetteCard, CouchetteCounters, CouchetteHistory, CouchetteHistoryItem, MyCouchetteDeleteDialog, MesCouchettesSkeleton} ; lib/couchetteDates.ts | | fait |
| components/couchettes/CouchetteCreateModal.vue (185) | features/couchettes/components/CouchetteCreateDialog.tsx | Combobox employé (`selectableUsers`) | fait |
| components/couchettes/CouchetteDeleteModal.vue (131) | features/couchettes/components/CouchetteDeleteDialog.tsx + CouchetteUserSummary.tsx | | fait |
| components/couchettes/CouchetteDetailModal.vue (117) | features/couchettes/components/CouchetteDetailDialog.tsx | | fait |

Hooks Query : `useAdminCouchettesQuery`, `useMyCouchettesQuery`, mutations create / delete (employé et admin).

#### Stock (4.11). Annexe : [couchettes-stock-cartes-todos](docs/migration/inventaire-couchettes-stock-cartes-todos.md)

| Source Vue | Cible React | Dépendances clés | Statut |
|---|---|---|---|
| views/stock/StockItems.vue (1060) | pages/stock/StockItemsPage.tsx ; features/stock/components/{StockCategorySidebar, StockCategoryNavItem, StockToolbar, StockItemList, StockEmptyState, StockItemCard, StockQuantityStepper, StockItemFormDialog, StockCategoryFormDialog, StockItemDeleteDialog, StockCategoryDeleteDialog} ; hooks/{useStockFilters, useFilteredStockItems, useCanManageStock} ; lib/stock.ts ; schemas/{stockItem, stockCategory} | glisser-déposer vers une catégorie (Q-DND), stepper de quantité optimiste, suppression d'article « CONFIRMER » | fait |

Hooks Query : `useStockItemsQuery`, `useStockCategoriesQuery`, CRUD articles et catégories, `useAdjustStockQuantityMutation`, `useMoveStockItemMutation`.

#### Cartes (4.12). Annexe : [couchettes-stock-cartes-todos](docs/migration/inventaire-couchettes-stock-cartes-todos.md)

| Source Vue | Cible React | Dépendances clés | Statut |
|---|---|---|---|
| views/cartes/Cartes.vue (596) | pages/cartes/CartesPage.tsx ; features/cartes/components/{CartesTable, cartesColumns, CarteRowContextMenu, CarteMobileCard, CarteSecretValue, CarteExpirationBadge, CarteDeleteDialog} ; hooks/useRevealedSecrets.ts ; lib/cartes.ts | badge `warning` « Expire bientôt » (< 30 jours) | fait |
| views/cartes/TypesCartes.vue (315) | pages/cartes/TypesCartesPage.tsx ; features/cartes/components/{TypesCartesTable, typesCartesColumns, TypeCarteMobileCard, TypeCarteDeleteDialog} | | fait |
| components/cartes/CarteEditModal.vue (386) | features/cartes/components/{CarteFormDialog, CarteForm, CarteSystemInfo} ; schemas/carteForm.ts ; hooks/useCarteFormDefaults.ts | Combobox type et utilisateur (`selectableUsers`) ; `clearUser` | fait |
| components/cartes/TypeCarteEditModal.vue (236) | features/cartes/components/TypeCarteFormDialog.tsx ; schemas/typeCarteForm.ts | | fait |

Hooks Query : `useCartesQuery`, `useCarteQuery`, `useTypeCartesQuery`, `useTypeCarteQuery`, CRUD cartes et types.

#### Todos (4.13). Annexe : [couchettes-stock-cartes-todos](docs/migration/inventaire-couchettes-stock-cartes-todos.md)

| Source Vue | Cible React | Dépendances clés | Statut |
|---|---|---|---|
| views/todos/Todos.vue (552, dont un `<style>` global) | pages/todos/TodosPage.tsx ; features/todos/components/{TodosToolbar, TodoBoard, TodoColumn, TodoCard, TodoToggleButton, TodoTrashDropZone, TodoDeleteDialog} ; hooks/{useTodoBoard, useTodoDragAndDrop} | kanban, corbeille flottante animée (`tw-animate-css`), glisser-déposer (Q-DND) | fait |
| components/todos/TodoEditModal.vue (216) | features/todos/components/TodoFormDialog.tsx ; schemas/todoForm.ts | | fait |
| components/todos/TodoCategoriesModal.vue (271) | features/todos/components/{TodoCategoriesDialog, TodoCategoryForm, TodoCategoryList, TodoCategoryDeleteDialog} | | fait |

Hooks Query : `useTodosQuery`, `useTodoQuery`, `useTodoCategoriesQuery`, mutations create / update / move (optimiste) / toggle / delete, CRUD des catégories.

#### Versions d'app (4.14). Annexe : [auth-landing-versions](docs/migration/inventaire-auth-landing-versions.md)

| Source Vue | Cible React | Dépendances clés | Statut |
|---|---|---|---|
| views/app-versions/AppVersions.vue (358) | pages/app-versions/AppVersionsPage.tsx ; features/app-versions/components/{AppVersionsTable, appVersionColumns, AppVersionRowActions, DeleteAppVersionDialog} | data-table, context-menu | fait |
| views/app-versions/AppVersionsPublic.vue (369) | pages/app-versions/AppVersionsPublicPage.tsx ; features/app-versions/components/{AndroidDownloadCard, AppVersionHistory, AppVersionHistoryItem, IosTestflightCard} ; data/iosSteps.ts ; lib/format.ts | page publique, `noindex` | fait |
| components/app-versions/AppVersionCreateModal.vue (287) | features/app-versions/components/AppVersionCreateDialog.tsx ; hooks/useApkFileReader.ts ; schemas/createAppVersion.ts | FileDropzone (APK en base64) | fait |
| components/app-versions/AppVersionEditModal.vue (235) | features/app-versions/components/AppVersionEditDialog.tsx | | fait |

Hooks Query : `useAdminAppVersions`, `useActiveAppVersions`, `useAppVersion`, create / update / delete.

#### Notifications et profil (4.15 ; le popover de la navbar est en phase 3). Annexe : [users-profil-notifications](docs/migration/inventaire-users-profil-notifications.md)

| Source Vue | Cible React | Dépendances clés | Statut |
|---|---|---|---|
| views/common/Notifications.vue (440) | pages/common/NotificationsPage.tsx ; features/notifications/components/{NotificationList, NotificationItem} ; hooks/{useOpenNotification, useNotificationSound} ; lib/{notificationMeta, formatRelativeTime} (partagés avec le popover) | `tabs` ; même cache que le popover (le Vue ne les synchronise pas) | fait |
| views/common/Profile.vue (858) | pages/common/ProfilePage.tsx ; features/profile/components/{ProfileInfoCard, ProfileInfoView, ProfileEditForm, AvatarPicker, NotificationPreferencesCard, NotificationPreferencesForm, ChangePasswordCard} ; schemas/{profile, notificationPreferences, changePassword} ; lib/notificationChannels.ts | FileDropzone (2 Mo), InputField avec œil ; boutons « Annuler » en `type="button"` | fait |

Hooks Query : `useNotificationsQuery`, `useUnreadNotificationsQuery`, `useMarkNotificationRead`, `useMarkAllNotificationsRead`, `useProfileQuery`, `useMyNotificationPreferencesQuery`, `useUpdateProfile`, `useChangePassword`, `useUpdateNotificationPreferences`.

#### Landing et pages légales (4.16). Annexe : [auth-landing-versions](docs/migration/inventaire-auth-landing-versions.md)

| Source Vue | Cible React | Dépendances clés | Statut |
|---|---|---|---|
| views/landing/Landing.vue (1233) | pages/landing/LandingPage.tsx ; features/landing/components/{LandingHeader, LandingMobileMenu, HeroSection, ServicesSection, HeavyServiceCard, ServiceCard, AboutSection, FleetSection, VehicleCard, StatsSection, FaqSection, ContactSection, ContactCard, LandingFooter, FloatingCallButton, SectionHeading} ; data/{navLinks, services, about, fleet, stats, faq, footer, contact} ; hooks/{useScrolledPast, useFloatingCtaVisible, useParallax, useCountUp, useRevealOnScroll, useForceLightTheme, useFluidRootScale, useLandingJsonLd} ; lib/{scrollToSection, formatMeters, buildLandingJsonLd} ; landing.css | contraintes du pré-rendu : `#app h1`, `id="services"`, `id="contact"`, `<footer>`, aucun `<script>` dans `#app`, plus de 10 000 caractères, `.reveal`/`.revealed`, `window.__PRERENDERED__` ; JSON-LD WebPage + FAQPage (mêmes `@id`) injecté dans `<head>` | fait |
| components/landing/FleetViewer.vue (161) | — (D1) | code mort | — |
| components/legal/LegalLayout.vue (144) | components/layout/LegalLayout.tsx | `<style scoped>` → variantes Tailwind | fait |
| views/legal/MentionsLegales.vue (83) | pages/legal/MentionsLegalesPage.tsx | `noindex, follow` | fait |
| views/legal/PolitiqueConfidentialite.vue (118) | pages/legal/PolitiqueConfidentialitePage.tsx | `noindex, follow` | fait |

### 5.7 SEO, PWA et build (phase 5)

| Élément | Cible | Statut |
|---|---|---|
| `robots.txt` (liste blanche `/` et `/login`, robots SEO tiers bloqués, sitemap) | `public/robots.txt` (sans `Allow: /models/` si D1) | fait |
| Sitemap (lastmod = dernier commit git des sources de la page) | plugin Vite, sources React | fait |
| `version.json` (`version`, `buildTime`, `commit`) + `__APP_VERSION__` | plugin Vite + `define` | fait |
| Compression gzip + brotli | `vite-plugin-compression2` | fait |
| Pré-rendu de `/` (Edge headless via CDP, `PRERENDER_STRICT=1`) | `scripts/prerender.cjs` adapté | fait |
| JSON-LD site (`index.html`) + page (landing : WebPage, FAQPage) | mêmes `@id` : `#business`, `#website`, `#webpage`, `#faq` | fait |
| Métadonnées par page (title, description, robots, canonical ; `https://pointage.avtrans-concept.com`, jamais `app.`) | D2 | fait |
| Manifest PWA, icônes, `theme-color` `#581c87`, métas iOS | `public/manifest.json` + `index.html` | fait |
| Badge du favicon (nombre de non-lus) + titre `(n) …` | `src/lib/faviconBadge.ts` | fait |
| Script anti-FOUC (pas de `.dark` sur `/`) | `index.html` | fait |
| En-têtes de cache Apache (`index.html`, `version.json` et `manifest.json` jamais servis périmés ; `/assets/` immuable) | `deploy/apache-cache-headers.conf` copié tel quel | fait |

---

## 6. Code mort du Vue : non porté

| Élément | Preuve | Conséquence |
|---|---|---|
| `components/landing/FleetViewer.vue`, `public/models/*.glb`, `three`, `@tresjs/*` | aucun import depuis `751eedd` | D1 |
| `components/layout/AppSidebar.vue` + `components/ui/sidebar/*` (18 fichiers) | aucun import ; `SidebarProvider` jamais monté | pas de `sidebar` shadcn |
| `components/ui/alert-dialog/*`, `dialog/DialogScrollContent`, `table/{TableEmpty, TableCaption, TableFooter, utils.ts}` | 0 import hors `ui/` | non repris (`ConfirmDialog` repose sur `dialog`) |
| `composables/useUserHours.ts` | 0 import | — |
| `views/users/UserServices.styles.css` (957 l.), `views/users/UserServices.vue.b` (sauvegarde) | 0 import | — |
| `src/style.css` | jamais importé | — |
| `config/icons.ts` (90 des 103 icônes) | grep | FontAwesome supprimé |
| `radix-vue`, `@tanstack/vue-table` | 0 import utile | — |
| `public/sounds/notif.{aiff,flac}`, `notif_converted.wav`, `public/vite.svg`, `src/assets/images/fonctions.png` | seul `notif.wav` est joué ; les autres ne sont référencés nulle part | non copiés |
| Branches « lecture seule » de Véhicules, VehiculeDetail et Stock (`isMecanicien` codé par UUID, toujours vrai derrière la garde) | garde `requiresMechanic` | remplacées par `usePermissions` ; comportement identique |
| Mode création de `UserEditModal` (toast de succès sans appel API) | `isCreating` n'est jamais vrai, aucun bouton « Créer » | non porté |
| Modales « Historique » et « Valider » d'`Entretiens.vue` (L875-966 et suivantes) | jamais ouvertes | non portées (« Valider » existe dans EntretiensVehicule) |
| Divers : `ROLE_UUIDS`, `isUser`, `USER_ROLE_COLORS`, `UserRoleLabels`, `PeriodiciteTypeLabels`, `isErrorResponse`, `isPagedResponse`, `config/api.isAuthenticated`, constantes de `config/map.ts`, `navConfig.fullNavLinks`, `timeFormatters.toISOStringWithTimezone`, méthodes de service inutilisées | détail dans les annexes | laissés dans les fichiers copiés « inchangés » (couche agnostique) ; nettoyage éventuel en phase 5 |

## 7. Écarts entre le CLAUDE.md Vue et le code (à ne pas recopier dans le CLAUDE.md React)

- Le token n'est pas un JWT : il est opaque et n'expire pas.
- `useForwardPropsEmits` est utilisé dans la plupart des wrappers shadcn-vue malgré l'interdiction (sans objet en React).
- Il reste des `!` (important) dans Navbar et SearchFilters, et FontAwesome dans Entretiens.
- La police réelle vient de `theme.css` (`--font-sans` système), pas de Tailwind.
- La doc Vue ne mentionne ni les singletons de module (pendingUsers, serviceHistory, signatureReminder, versionCheck, googleRegistration, theme, messages), ni le polling de 5 s des notifications, ni `version.json`, ni les clés de stockage : c'est désormais décrit ici et le sera dans le `CLAUDE.md` React.

---

## 8. Bugs du Vue

Les numéros de ligne renvoient aux fichiers du Vue. Le détail et les bugs mineurs sont dans les annexes. ✔ = revérifié à la main dans le code.

### 8.1 Disparaissent par construction (corrigés sans changer le comportement voulu, si D6 est validé)

| Bug Vue | Pourquoi il disparaît |
|---|---|
| `Notifications` monté deux fois (Navbar.vue:43 et 143) : double polling, double son, titre et favicon réinitialisés à la fermeture du menu mobile, liste sous l'overlay du Sheet | un seul `NotificationsPopover`, effets de bord montés une fois |
| Titre du document réécrit toutes les 5 s par Notifications (conflit avec `usePageMeta`) | titre `(n) …` calculé à partir du titre de la page |
| `id="app"` dupliqué (App.vue:125) | le composant racine ne rend pas d'`id` |
| Carte Mapbox jamais détruite (useMapModal.ts:72), instance Chart.js jamais détruite, double rendu du graphique via `setTimeout` | nettoyage dans l'effet ; Recharts |
| Écouteurs et timers non nettoyés (Pointage:744, ImageLightbox, useTheme, Verify:109, ResetPassword:138, ExportHours:382) | effets avec nettoyage |
| Réponses arrivées dans le désordre ou après un reset (AddressAutocomplete, UserHoursModal, useSignatureReminder, usePendingUsers) | clés TanStack Query, cache vidé au logout |
| Paramètre `:id` lu une seule fois (VehiculeDetail:463, EntretiensVehicule) | `useParams` dans la clé de requête |
| Spinner pleine page après chaque action (rechargement avec `loading = true`) : Véhicule, Stock, Cartes, Types, Pointage… | rafraîchissement en arrière-plan de TanStack Query |
| Erreur d'**action** qui remplace toute la page, parfois sans « Réessayer » | erreurs d'action en toast ; erreurs de chargement en `ErrorState` avec « Réessayer » (exigé par le brief) |
| Double requête sur double clic (suppression, validation) faute d'état « en cours » | bouton désactivé par `isPending` |
| Worker pdf.js chargé d'un CDN à version figée ; clé de cache d'aperçu PDF sur les 100 premiers caractères (aperçu d'un autre PDF possible) ; largeur d'aperçu ignorée | worker local ; `useQuery` avec une clé fondée sur un hash du contenu |
| Icônes FA `file-*` non enregistrées : aucune icône affichée pour PDF, Word, Excel… | icônes lucide |
| Glisser-déposer sans `dataTransfer.setData` : ne démarre pas sous Firefox (StockItems:765) | appel ajouté |
| Tracé de signature légèrement déformé (SignaturePad:70, mesure bordure incluse) | mesure du canvas |
| Labels non reliés aux inputs, `<button>` imbriqué dans `<a>` (Landing, Versions), actions visibles seulement au survol (inaccessibles au tactile et au clavier) | `useId`, `Button asChild`, actions toujours atteignables |
| Boutons « Annuler » sans `type="button"` dans des `<form>` (Profile:188, 298, 418) : sans gravité en Vue, mais en React ils soumettraient le formulaire | `type="button"` |
| Code dupliqué : `getDefaultRoute` ×3, `formatFileSize` ×4, `getInitials` ×8, `getFileUrl` ×2, visionneuse PDF ×2, formatage de dates ×10 | mutualisé |

### 8.2 Bugs à comportement visible : reproduits à l'identique sauf accord (répondre par numéros)

| # | Bug | Où | Correction proposée |
|---|---|---|---|
| B-01 ✔ | **Dates « du jour » calculées en UTC** (`toISOString()` sur un minuit local). Export des heures : le mois courant part du **31 août au 29 septembre** au lieu du 1er au 30 septembre, et les préréglages sont décalés d'un jour (paie). Même cause : date préremplie de la veille entre 0 h et 2 h (UserServices, absences, entretiens) ; navigation jour par jour bloquée ou sautant un jour au changement d'heure (UserHoursModal) | ExportHours:246-257, 339 ; timeFormatters:130-133 ; AbsenceEditModal:343 ; MyAbsenceEditModal:226 ; Entretiens:1771, 1862, 1980 ; EntretiensVehicule:1258, 1513 ; UserHoursModal:316, 440-456 | dates locales (`src/lib/dates.ts`) |
| B-02 ✔ **corrigé** | **XSS** (corrigé en phase 4 : le brief interdit l'injection de HTML non assaini ; valeurs échappées, aucun effet visible pour des noms ordinaires) : l'export PDF du planning injecte prénom, nom et types d'absence dans `innerHTML` sans échappement (le prénom est saisi à l'inscription, l'export tourne en session admin) | Planning:1068-1140 | échapper les valeurs |
| B-03 | Planning : fériés mobiles affichés un jour trop tôt ; clés de date décalées après le passage à l'heure d'été ; mélange année civile / semaine ISO autour du Nouvel An ; semaine 53 inaccessible | Planning:493-503, 566-595, 704-740 | calcul de dates local et ISO correct |
| B-04 ✔ | **Le mécanicien est en lecture seule sur `/entretiens`** : `isMecanicien` y teste l'UUID Administrateur. Pas de création, modification ou suppression, pas de boutons Types ni Stock, alors qu'EntretiensVehicule, TypesEntretien et l'API l'autorisent | Entretiens:1079 | droits admin **ou** mécanicien |
| B-05 | Entretiens : à l'ouverture en édition, le type est vidé si le dossier diffère du formulaire précédent ; `typeEntretienId: ''` est envoyé | Entretiens:1418-1420 | ne pas vider le type à l'ouverture |
| B-06 | Entretiens, section « En retard » : toutes les alertes du véhicule s'affichent « En retard de … », y compris celles à venir (+30 j → « En retard de 30 jours ») | Entretiens:142-153 | libellé selon le signe |
| B-07 | Pointages admin : « Démarrer une pause » fait 3 appels non atomiques et peut transformer le service principal en pause | useUserServices:394-408 | `createService({ isBreak: true })` en un appel |
| B-08 | Notifications d'absence ou d'acompte pour un simple utilisateur : redirection vers `/absences` / `/acomptes` (admin), donc `/unauthorized` ; type `rapport_vehicule` ni affiché ni cliquable | views/common/Notifications:334-361 ; popover | `/myabsences`, `/myacomptes` selon le rôle |
| B-09 | Acomptes admin : le filtre « Annulés » envoie `CANCELLED`, statut inexistant côté API (risque d'erreur 500) | Acomptes:604, 723 | retirer le filtre |
| B-10 | Mes couchettes : « couchette du jour » et compteur « Ce mois » calculés sur la page affichée. Depuis la page 2, on propose de redéclarer (400) | MesCouchettes:316, 320 | requête dédiée à la page 0 |
| B-11 ✔ | Connexion sur mobile : « Voir » du prompt d'écran d'accueil mène à `/quick-login?setup=true`, route inexistante (404) | Login:211 | `/add-to-homescreen` |
| B-12 | Prompt d'écran d'accueil fermé par l'overlay ou Échap : l'utilisateur reste sur `/login`, connecté, sans redirection | HomeScreenPrompt:2 | traiter comme « Plus tard » |
| B-13 | 404 : « Tableau de bord » pointe en dur vers `/vehicules` (un utilisateur finit sur `/unauthorized`). Bouton retour avec `fallback="/"` : renvoie vers la landing publique (Pointage, MyAbsences, MyAcomptes, MesCouchettes) | NotFound:35, 73 ; Retour ×4 | route par défaut selon le rôle |
| B-14 | Pointage : le chrono du jour retire les pauses, le total par jour de l'historique ne les retire pas (l'un des deux est faux, voir Q-PAUSES) ; le dialog de kilométrage obligatoire est impossible à quitter si les véhicules ne se chargent pas | Pointage:548-588 vs 668-678 ; 314, 1013 | selon Q-PAUSES ; bouton « Annuler » en cas d'erreur |
| B-15 ✔ | `pagesWithoutNavbar` : 6 noms sur 9 ne correspondent à aucune route. La navbar, le polling des notifications et les dialogs globaux apparaissent sur `/verify`, `/password-reset`, `/unauthorized`, les pages légales… (sur `/unauthorized`, le polling d'un compte inactif provoque un 401 puis une déconnexion). Changelog et complétion de profil évalués seulement au montage : jamais juste après la connexion, mais affichés sur la landing. Changelog non marqué comme vu s'il est fermé autrement que par « Fermer » | App.vue:76, 102-116, 154 | Q-NAVBAR, Q-GLOBALDIALOGS |
| B-16 | Suivi des présences : l'entrée « Services » du menu recharge toute l'app (`window.location.href`) ; une erreur initiale n'est jamais effacée malgré les rafraîchissements réussis | ServicesMonitoring:381, 543-550 | navigation interne ; état d'erreur de la requête |
| B-17 | Todos : les tâches d'une catégorie supprimée disparaissent du tableau jusqu'au rechargement ; suppression par la corbeille sans confirmation et échec silencieux | Todos:492-494, 356-379 | colonne de repli ; toast d'erreur |
| B-18 | Heures contrat : différences négatives affichées sans signe moins. Arrondis « 7h60 » (Contrats, UserHoursModal, suivi des présences) | ContractHours:490-500 ; UserHoursModal:654-659 ; ServicesMonitoring:274 | formatage correct |
| B-19 | Tris faux ou partiels : tri client limité à la page courante alors que le serveur pagine (Couchettes, Absences, Acomptes, Entretiens) ; `Date.parse` appliqué aux nombres et immatriculations (tri km des véhicules, Heures, Users) | voir annexes | tri typé par colonne (react-table) ; tri serveur si l'API le permet |
| B-20 | Entretiens : « Total coût HT » et recherche rapide ne portent que sur la page courante | Entretiens:1277, 286-294, 1587-1599 | libellé explicite, ou agrégat API |
| B-21 | EntretiensVehicule : date envoyée avec un décalage `+01:00` codé en dur (faux l'été), alors qu'Entretiens envoie `T12:00:00` | EntretiensVehicule:1546 | format unique `YYYY-MM-DDT12:00:00` |
| B-22 | Suppressions sans confirmation : fichier d'un véhicule ; fichier existant en édition d'entretien (irréversible même si l'on clique ensuite « Annuler ») | VehiculeDetail:1010-1017 ; EntretiensVehicule:568 | ConfirmDialog |
| B-23 | Profil : badge du rôle invisible quand le rôle n'a pas de couleur (repli `hsl(var(--primary))` invalide avec des tokens oklch) | Profile:55, 179 | repli sur `bg-primary` |
| B-24 | E-mail d'un utilisateur : toute erreur 400 est présentée comme « e-mail déjà utilisé » | UserEmailModal:173 | message de l'API |
| B-25 | Users : après enregistrement, l'objet est remplacé sans fusion (la présence retombe à « Absent ») ; badge « en attente » périmé après suppression | Users:948, 969, 914-931 | fusion et invalidation |
| B-26 | Pointages d'un employé : total d'un jour faux s'il chevauche deux pages ; stats non rafraîchies après une action ; bouton de localisation rouge inerte pour 0,0 ; durée du service en cours figée | UserServices:32, 261, 900-905 ; groupServicesByDay | invalidations, `useNow` |
| B-27 | Configuration d'entretien : valeur envoyée en texte, décimales refusées par l'API (400), valeur conservée en passant de km à jours (30 000 km → 30 000 jours) | ConfigEntretienModal:34-57 | entier, reset au changement de type |
| B-28 | Planning : l'état du dialog d'absence (formulaire de refus, motif) persiste d'une absence à l'autre ; erreurs d'approbation et de refus avalées | Planning:253, 867, 890 | reset à l'ouverture ; toasts |
| B-29 | Absences : « 3 jours · Matin · Matin » pour une demi-journée sur plusieurs jours ; « Validé par » affiché pour un refus | Absences:147, 226 ; AbsenceDetailModal:88 | libellés corrects |
| B-30 | Cartes : état « révélé » indexé par numéro (deux cartes au même numéro) ; numéro de 4 caractères ou moins affiché en clair | Cartes:498, 503 | indexer par uuid |
| B-31 | Erreurs avalées sans retour à l'utilisateur (déplacement ou toggle de todo, fichiers, km, commentaires ou équipements d'un véhicule, préférences, marquage de notifications, suppression d'un pointage…) | voir annexes | toast d'erreur |
| B-32 | Frise de Pointage : une pause en cours s'affiche en vert (couleur « service ») | ServiceTimeline:71 | couleur « pause » |
| B-33 | Instructions d'ajout à l'écran d'accueil : Chrome sur ordinateur reçoit les instructions Android | useBrowserDetection:136-138 | détection corrigée |
| B-34 | Messages d'erreur réseau en anglais (« Network error », « Request timeout ») sur les pages d'auth | Login, Register, Forgot, Reset, Verify | messages français centralisés |
| B-35 | Accents manquants dans de nombreux libellés (« vehicule », « kilometrage », « Telecharger », « Annee », « Fevrier »…) | VehiculeDetail, VehiculeInfoCard, UserHoursModal, FileDropzone, ImageLightbox, Heures… | corriger (Q-ACCENTS) |

### 8.3 Limites de l'API (non corrigeables côté front sans toucher `api_avtrans`)

- **Impossible d'effacer un champ en modification** : l'API ignore les champs absents ou `null`. Confirmé dans le code backend pour `updateEntretien` et `updateTypeEntretien` ; probable ailleurs d'après les modèles. Cas concernés : catégorie d'une tâche ou d'un article de stock, dossier et description d'un type d'entretien, coût et description d'un entretien, description / numéro / expiration d'une carte, commentaire d'équipement, fin d'un pointage (rouvrir un service), notes d'une version d'app, photo d'un véhicule. **Aujourd'hui, l'interface affiche un succès alors que rien ne change** (déposer un article sur « Non classés », une tâche sur « Sans catégorie », un type sur « Non classés », bouton « Supprimer la photo »). Question Q-PUT-NULL.
- **Envois en base64 dans du JSON avec un timeout de 30 s** : fichiers de véhicule annoncés jusqu'à 500 Mo, APK, photos. Timeout 408 quasi certain pour les gros fichiers. Question Q-UPLOAD.
- **Statut `CANCELLED`** affiché et filtrable partout alors qu'il n'existe pas : l'annulation par l'employé est une suppression.
- **Fenêtre par défaut de 30 jours** sur plusieurs recherches (absences, acomptes, couchettes, pointages admin) alors que l'interface annonce « Toutes vos demandes ».
- **Téléchargement cross-origin** : l'attribut `download` est ignoré ; l'onglet navigue vers le fichier et sort de l'app.
- **Aucune validation serveur du kilométrage** (km inférieur au dernier relevé accepté).

---

## 9. Points d'ombre et questions (hors D1 à D6)

Les recommandations entre parenthèses s'appliquent si vous ne tranchez pas autrement.

**Avant la phase 3 (coquille)**
- **Q-NAVBAR** : sur quelles pages afficher la navbar pour un utilisateur connecté ? (*Recommandé* : uniquement les pages protégées. Pas sur `/`, `/download`, les pages d'auth, `/unauthorized`, les pages légales ni la 404, ce qui correspond à l'intention de `pagesWithoutNavbar`.)
- **Q-GLOBALDIALOGS** : changelog et complétion de profil. (*Recommandé* : ouverture automatique dans `AppLayout` dès qu'on y entre, y compris juste après la connexion ; changelog marqué comme vu quelle que soit la façon de le fermer.)
- **Q-USEREDIT** : `/users/:uuid` est cassée et orpheline. (*Recommandé* : rediriger vers `/users`.)
- **Q-APPVERSIONS** : `/app-versions` est ouverte à tout admin par l'URL, seul le lien de nav est limité à un e-mail. (*Recommandé* : parité, garde admin et lien filtré par e-mail.)
- **Q-UNAUTHORIZED** : le texte actuel (« Seuls les Administrateurs et Mécaniciens… », « utilisez l'application mobile ») est obsolète, et la page sert aussi aux comptes inactifs. (*Recommandé* : parité du texte, sauf si vous fournissez un nouveau texte.)
- **Q-NOTIF-POLL** : suspendre le polling de 5 s quand l'onglet est masqué ? C'est le comportement par défaut de TanStack Query. (*Recommandé* : oui.)
- **Q-REDIRECT** : ajouter `?redirect=` après connexion ? (*Recommandé* : non, parité.)

**Transverses, avant la phase 4**
- **Q-VALIDATION** : le Vue ne montre presque aucun message de validation (bouton désactivé, `required` natif). Avec react-hook-form + zod, afficher des messages en français sous les champs ? (*Recommandé* : oui, messages courts ; les règles restent celles du Vue.)
- **Q-DATES** : garder les `<input type="date|time|datetime-local">` natifs, ou passer à Calendar + Popover ? (*Recommandé* : natifs, pour la parité et le confort sur téléphone.)
- **Q-DND** : glisser-déposer du stock, des todos et des types d'entretien : HTML5 natif comme aujourd'hui (inopérant au tactile), ou `@dnd-kit` ? (*Recommandé* : natif pour la parité, `@dnd-kit` plus tard si besoin.)
- **Q-URL** : mettre onglets, filtres et pagination dans l'URL ? (*Recommandé* : non, parité, en gardant les `?userUuid=` existants.)
- **Q-ACCENTS** : corriger les accents manquants (B-35) ? (*Recommandé* : oui.)
- **Q-TOKENS** : garder les tokens `success` / `warning` / `info` en extension de shadcn ? (*Recommandé* : oui.)
- **Q-PUT-NULL** et **Q-UPLOAD** : voir 8.3. Faut-il prévoir une évolution de l'API (hors de cette migration) ? D'ici là : parité, avec éventuellement le retrait des toasts de succès trompeurs.

**Par domaine** (détail dans les annexes, section « Points d'ombre »)
- *Pointage* : **Q-PAUSES**. La pause est-elle incluse dans un service qui reste ouvert, ou les deux se succèdent-ils ? Cela détermine lequel des deux calculs est juste (B-14). Le kilométrage doit-il être obligatoire en « vue utilisateur » ? Le mécanicien doit-il avoir accès à `/pointage` (route ouverte, sans lien de nav) ?
- *Entretiens* : dans le dialog des fichiers de `/entretiens`, cliquer un PDF ne fait rien (comme le Vue ; l'annexe prévoyait d'ouvrir la visionneuse partout, comme sur `/entretiens/vehicule/:id`) : l'activer ? Droits du mécanicien (B-04) ; seuils « à venir » (10 000 km / 90 j) aussi dans EntretiensVehicule ; conserver l'approximation « mois = 30 j » ?
- *Planning* : garder l'export en capture d'image, ou générer un PDF tabulaire qui ne coupe pas les lignes ?
- *Signatures* : autoriser la suppression depuis l'historique (aujourd'hui, seule la dernière est supprimable) ?
- *Cartes* : PIN et numéro complet transmis en clair par l'API : acceptable ? Règle du PIN : exactement 4 chiffres, ou au moins 4 caractères comme aujourd'hui ?
- *Stock* : seuil de stock bas (5) et liste d'unités en dur : à conserver ? Garder la saisie « CONFIRMER » ?
- *Todos* : garder la suppression par corbeille sans confirmation ?
- *Suivi des présences* : garder les animations de liste ?
- *Profil / notifications* : ajouter la modification de l'e-mail, de l'adresse et du permis (l'API le permet) ? Destinations des notifications selon le rôle (B-08) ?

---

## 10. Journal

| Date | Session | Fait | Commit |
|---|---|---|---|
| 2026-09-25 | 1 | Phase 0 : lecture des fichiers de référence ; inventaire complet par 8 sous-agents en lecture seule ; annexes dans `docs/migration/` ; revérification des bugs B-01, B-02, B-04, B-11, B-15 et de la page UserEdit ; vérification de l'environnement (Node, Edge, CORS). Aucun fichier du Vue modifié. | `16d5819` |
| 2026-09-25 | 1 | Phase 1 (socle) : dépôt git (`main`, LF imposé) ; Vite 7 + React 19 + TS 5.9 (create-vite 8.3.0) ; Tailwind v4 et alias `@` ; React Compiler (runtime vérifié dans le bundle) ; shadcn CLI v4 remis en style new-york, `button`, paquet `cn` (parité testée) ; tokens et règles de base du Vue dans `src/index.css` (police système, scrollbar et sélection en sombre) ; Prettier + eslint-config-prettier ; `CLAUDE.md`. Vérifié : build, lint (0 warning), format, rendu clair/sombre à 375 px et en desktop dans le navigateur intégré. | `c0f3c4a` à `4803d46`, puis le commit de documentation |
| 2026-09-25 / 26 | 1 | Phases 2 et 3 : couche agnostique copiée (seules adaptations : icônes lucide, intercepteur 401 découplé, `import type`) ; coquille (store Zustand hydraté depuis les clés du Vue, router data mode et gardes, ThemeProvider, navbar, notifications, bannière de version, changelog, historique d'un pointage) ; composants partagés. Phase 4 par sous-agents parallèles : auth, pointage, heures/planning/journal, véhicules, absences, acomptes, signatures, couchettes, versions, notifications, profil, landing et légal portés ; B-02 corrigé (échappement, règle de sécurité du brief). Phase 5 amorcée : version.json, sitemap, en-tête SEO, pré-rendu porté, deploy/. Vérifié visuellement contre la prod Vue : login (360 px clair et sombre), landing (desktop identique, même hauteur à 360 px). Utilisateurs, entretiens, stock, cartes et todos : reprise en cours après une coupure de l'API. | `9161c08` à `8e593ca` |
| 2026-09-26 | 1 | Fin de la phase 4 : utilisateurs (liste, pointages d'un employé, suivi des présences), entretiens (flotte, véhicule, types), stock, cartes et todos portés et relus ; bugs du Vue reproduits (B-01, B-04 à B-07, B-16 à B-27, B-30, B-31, 8.3). Phase 5 : compression gzip + brotli, `AppLayout` chargé à la demande et chunk `react-vendor` (bundle initial de la landing : 505 ko au lieu de 805 ko + coquille), limite de taille relevée pour mapbox-gl seul ; `MigrationPlaceholder` et 6 composants shadcn inutilisés retirés ; aucun module orphelin ni `any` ; libellés d'`InputField` alignés sur le Vue (login identique au pixel près). Vérifié : `npm run build` avec `PRERENDER_STRICT=1`, lint, format, parité des 43 routes et des gardes. Reste : contrôle visuel des écrans connectés (session requise). | `c534637` à ce commit |

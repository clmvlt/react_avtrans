# CLAUDE.md : React Pointage AVTRANS

Plateforme de gestion du personnel et de la flotte d'AVTRANS (livraisons pharmaceutiques) : pointage, absences, acomptes, véhicules et entretiens, signatures, couchettes, stock, cartes, todos, versions d'app (APK), notifications, landing publique indexée. Trois rôles : Utilisateur, Administrateur, Mécanicien.

Ce projet est la **migration de l'app Vue 3** `D:\3_PROJET\AVTRANS\pointage2026\vue_avtrans`. Le Vue est la **référence, en lecture seule : ne jamais le modifier**. L'API Spring Boot `../api_avtrans` est hors périmètre : ne pas la modifier.

**`MIGRATION.md` fait foi** pour l'avancement (table de correspondance, statuts, décisions, bugs, questions). L'inventaire détaillé par domaine est dans `docs/migration/`. Mettre `MIGRATION.md` à jour à chaque étape validée.

**Objectif** : parité fonctionnelle stricte. Mêmes routes et URL, mêmes écrans, mêmes appels API, même rendu en clair et en sombre, même comportement par rôle. Pas de refonte. Le code doit cependant être du React idiomatique, pas du Vue transcrit ligne à ligne. Un bug repéré dans le Vue est noté dans `MIGRATION.md` et **reproduit à l'identique** tant que le propriétaire n'a pas autorisé sa correction (section 8 de `MIGRATION.md`).

## Commandes
- Dev : `npm run dev` (port 5173, `host 0.0.0.0`). Pour lancer le Vue à côté : `npx vite --port 5174` depuis `vue_avtrans` (le CORS de l'API accepte toutes les origines).
- Build : `npm run build` (`tsc -b && vite build && node scripts/prerender.cjs` : type-check, bundle compressé gzip + brotli, puis pré-rendu de la landing ; `PRERENDER_STRICT=1` pour échouer si le pré-rendu échoue)
- Type-check : `npm run typecheck`
- Lint : `npm run lint` (échoue au moindre warning)
- Format : `npm run format` / `npm run format:check`
- Preview : `npm run preview`
- Déploiement : `python deploy/deploy.py` (git-ignoré, contient les accès SSH). **Claude ne l'exécute jamais** : c'est le propriétaire qui le lance.

## Stack (versions épinglées volontairement)
Les majeures sont fixées par le brief même si des versions plus récentes existent : **ne pas monter de majeure sans accord**.

| Domaine | Choix |
|---|---|
| Base | React 19, TypeScript 5.9 strict (TS 7 incompatible avec typescript-eslint), Vite 7 (`@vitejs/plugin-react` 5) |
| Compilation | React Compiler (`babel-plugin-react-compiler`) : **pas de `useMemo`/`useCallback` défensifs** |
| Styles | Tailwind CSS v4 (`@tailwindcss/vite`) + `tw-animate-css` |
| UI | shadcn/ui (CLI v4, primitives Radix via le paquet `radix-ui`, style **new-york**, icônes **lucide-react exclusivement**) |
| `cn()` | paquet officiel `cn` (remplace clsx + tailwind-merge, le registre shadcn l'importe dans chaque composant), réexporté par `@/lib/utils` |
| Routing | React Router **v7** en mode data (`createBrowserRouter`, routes `lazy`). SPA statique servie par Apache : pas de framework mode, pas de Next.js |
| État serveur | TanStack Query v5, qui enveloppe les services existants |
| État client | Zustand : **un seul store**, `auth` |
| Formulaires | react-hook-form + zod + composants **`field`** de shadcn (`Field`, `FieldLabel`, `FieldError`… avec `Controller`), selon la doc shadcn à jour ; pas l'ancien `form` |
| Tables | `@tanstack/react-table` selon le pattern data-table de shadcn |
| Graphiques | composant `chart` de shadcn (Recharts) |
| Toasts | `sonner` (composant shadcn) |
| Conservés du Vue | `mapbox-gl`, `pdfjs-dist` (worker local via `?url`), `jspdf`, `html2canvas-pro`, `class-variance-authority` |
| Hors stack | pas de FontAwesome, pas de 3D (FleetViewer est du code mort dans le Vue), pas de `@vueuse` (hooks maison dans `src/hooks/`) |

## Architecture
```
src/
├── api/            # ApiClient + instance (copiés du Vue ; seul l'intercepteur 401 est adapté)
├── services/       # un service par domaine, copiés INCHANGÉS
├── models/ enums/ types/ utils/     # copiés INCHANGÉS (utils/serviceModificationFormatters : icônes lucide-react)
├── lib/            # utils.ts (cn) + helpers purs transverses (dates locales, fichiers, favicon…)
├── config/         # api, map, seo, version, navConfig (icônes lucide-react)
├── stores/         # auth-store.ts (Zustand, seul store)
├── hooks/          # hooks génériques (useMediaQuery, useDebouncedValue, useNow, usePermissions…)
├── features/<domaine>/
│   ├── api/        # hooks TanStack Query (useVehicles, useCreateAbsence…) + queryKeys.ts
│   ├── components/ # composants propres au domaine
│   ├── hooks/      # logique métier du domaine
│   ├── lib/        # fonctions pures du domaine (calculs, regroupements, formatage)
│   └── schemas/    # schémas zod
├── components/
│   ├── ui/         # UNIQUEMENT les composants générés par le CLI shadcn
│   ├── shared/     # composants maison réutilisables (InputField, Combobox, FileDropzone, SignaturePad, ConfirmDialog…)
│   └── layout/     # RootLayout, AppLayout, Navbar, UpdateBanner, LegalLayout…
├── pages/<domaine>/<Nom>Page.tsx     # une page par route, mêmes sous-dossiers que src/views du Vue
├── router/         # routes + composants de garde
├── providers/      # QueryClientProvider, ThemeProvider, Toaster…
└── index.css       # Tailwind + tokens du thème
```
- Alias `@/*` → `./src/*` (tsconfig.json, tsconfig.app.json, vite.config.ts).
- Features prévues : auth, pointage, hours, planning, service-history, signatures, users, user-services, monitoring, profile, notifications, changelog, vehicles, maintenance, absences, acomptes, couchettes, stock, cartes, todos, app-versions, landing.
- Les composants maison rangés dans `components/ui` du Vue (navbar, notifications, messages, changelog, retour, update-banner, profile-completion, file-dropzone, select maison…) vont dans `shared/`, `layout/` ou la feature, **jamais dans `ui/`**. La cible exacte de chaque fichier Vue est dans `MIGRATION.md` section 5.
- Une requête partagée vit dans **une seule** feature et est importée ailleurs : `useUsersQuery` (features/users), `useVehiclesQuery` / `useVehicleQuery` (features/vehicles), `useAbsenceTypesQuery` / `useValidateAbsenceMutation` (features/absences).

## Conventions de composants
- Composants fonctions uniquement, **un composant exporté par fichier**, props typées avec `type XxxProps = {...}`. Fichiers en PascalCase, sauf `components/ui` (kebab-case du CLI).
- `components/ui` : **on n'écrit pas ces fichiers à la main**, on les ajoute avec `npx shadcn@latest add <composant> -y`. On ne les modifie que si c'est indispensable, en expliquant pourquoi dans un commentaire en tête du fichier (personnalisations prévues : `MIGRATION.md` section 4.2, par exemple la variante `warning` du badge).
- Composant maison réutilisable = modèle shadcn : `cn()`, variantes via `cva` si besoin, `className` accepté et fusionné, props natives transmises (`...props`), `ref` en prop (React 19, pas de `forwardRef`).
- **Une page orchestre**, elle ne contient pas de logique lourde. Au-delà d'environ 250 lignes : découper en sous-composants et hooks. Les fichiers Vue géants (Entretiens 2089 l., EntretiensVehicule 1693, VehiculeDetail 1242, Landing 1233, Planning 1221, Pointage 1117, StockItems 1060) sont **découpés**, pas transcrits d'un bloc (découpages proposés dans les annexes).
- **Jamais de `fetch` dans un composant** : composant → hook TanStack Query → service → ApiClient.
- Chaque écran gère : chargement (`Skeleton`), erreur (`Alert` avec message et bouton « Réessayer »), succès, **état vide explicite** (`Empty`). Prévoir `null`, listes vides et erreurs API partout. Une erreur d'**action** passe par un toast et ne remplace jamais la page.
- Pas de `useEffect` pour une valeur dérivée ou pour réagir à un événement : il est réservé à la synchronisation avec l'extérieur (DOM, mapbox, timers, listeners, `document.title`…).
- `dangerouslySetInnerHTML` interdit sans DOMPurify. Le HTML construit à la main (export PDF du planning) échappe ses valeurs.
- Boutons dans un `<form>` qui ne soumettent pas : **`type="button"`** (piège : les « Annuler » du Profil Vue n'en avaient pas).

## Conventions fixées par la coquille (phase 3)
- **Pages** : `src/pages/<domaine>/<Nom>Page.tsx` avec `export default function <Nom>Page()`. `src/router/routes.tsx` les charge en `lazy` ; une nouvelle page = un fichier + une entrée dans `routes.tsx`.
- **Métadonnées** : `components/shared/PageMeta` (`title`, `description`, `robots`, `canonicalPath` ; valeurs par défaut = celles de la landing, comme le Vue). Une seule instance par écran : chaque page **publique** rend la sienne, `AppLayout` rend celle des pages protégées. Pas de `document.title` impératif.
- **Store** : `useAuthStore(selectIsAdmin)` etc. (sélecteurs exportés par `src/stores/auth-store.ts`) ; `usePermissions()` pour `canAccess` / `hasRole` (navigation). Route par défaut : `getDefaultRoute(roleUuid)` (`src/lib/getDefaultRoute.ts`).
- **Hooks de requêtes partagés déjà créés** (à compléter, pas à dupliquer) :
  - `features/users/api` : `usersKeys`, `useUsersQuery` ;
  - `features/vehicles/api` : `vehiclesKeys`, `useVehiclesQuery`, `useVehicleQuery`, `useAddKilometrageMutation` ;
  - `features/absences/api` : `absenceKeys`, `absenceTypeKeys`, `useAbsenceTypesQuery`, `useValidateAbsenceMutation`.
- **Toasts** : `import { toast } from 'sonner'`. Le Toaster est déjà monté dans `AppProviders`.
- **401** : `setUnauthorizedHandler` (api) est branché dans `RootLayout` (déconnexion + `/login`). Ne pas le gérer dans les pages.

## Données (TanStack Query)
- Un `queryKeys.ts` par feature, avec une racine par domaine (`['vehicles']`, `['absences']`…).
- Les services renvoient des formes hétérogènes (voir « Contrat d'API ») : la normalisation se fait dans `select` du hook, jamais en modifiant le service.
- Mutations : invalider les clés concernées ; mises à jour optimistes seulement là où le Vue le fait déjà (todos, stock, paiement d'acompte).
- Bouton d'action désactivé pendant `isPending` : pas de double requête.
- Déconnexion : `queryClient.clear()` en plus du reset du store.

## État client
- **Zustand : uniquement `src/stores/auth-store.ts`**. Le state ne se modifie que via les actions du store.
- Le store s'hydrate **manuellement** depuis localStorage `auth_token` (texte brut) et `user` (JSON). Pas de middleware `persist` : il changerait le format et déconnecterait tout le monde à la bascule Vue → React.
- Autres états globaux (modale d'historique d'un pointage, vérification de version, relais de l'inscription Google) : contexte React ou petit module + `useSyncExternalStore`. Jamais un second store Zustand.

## Correspondances Vue → React
- `ref`/`reactive` → `useState`/`useReducer` ; `computed` → valeur calculée au rendu ; `watch` → gestionnaire d'événement, clé de query ou, en dernier recours, `useEffect`.
- `onMounted` + chargement → `useQuery` ; actions → `useMutation` + invalidation.
- `v-model` → props contrôlées `value` + `onChange` ; `emit('x')` → prop `onX` ; slots → `children` ou props de rendu ; `provide/inject` → Context ; `<Teleport>` → portails Radix ou `createPortal` ; `<Transition>` → `tw-animate-css` et attributs `data-state`.
- `useRoute()`/params → `useParams`/`useSearchParams` encapsulés dans les hooks de feature.
- `useMessages().success(texte, titre?)` → `toast.success(titre ?? texte, { description: titre ? texte : undefined })` (succès 5 s, erreur 7 s).
- `useContextMenu` + `ContextMenuPopover` → `context-menu` shadcn. Select maison du Vue (recherche par défaut) → `components/shared/Combobox` (popover + command), ou `select` shadcn sans recherche.
- **Ne pas reproduire les contournements shadcn-vue / reka-ui** du CLAUDE.md Vue (`:teleport="false"` sur Select, mapping `checked`/`modelValue`, interdiction de `useForwardPropsEmits`). En React : `checked` + `onCheckedChange`, `Select` dans un `Dialog` tel quel (vérifier que ça marche).

## Routes et gardes
- 43 routes, **chemins identiques au Vue** (liste : `MIGRATION.md` 5.1). Routes layout : `RequireAuth` (connecté, puis e-mail vérifié sinon `logout()` + `/login`, puis compte actif sinon `/unauthorized`), `RequireRole` admin ou mécanicien (mécanicien = admin **ou** mécanicien), `RequireCouchette` (`user.isCouchette === true`), `redirectIfAuthenticatedLoader` (loader, vérifié à la navigation comme le `beforeEach` du Vue) pour `/login` et `/register`.
- Route par défaut : admin → `/users`, mécanicien → `/vehicules`, sinon → `/pointage` (`src/lib/getDefaultRoute.ts`, une seule définition).
- Entrer dans la zone admin désactive la « vue utilisateur » (`setViewMode(false)`).
- Défilement : `<ScrollRestoration />`.
- Rôles comparés par **UUID** (`USER_ROLE_UUIDS`), jamais par nom.

## Règles UI (Dialogs, formulaires)
- Fermeture au clic sur l'overlay conservée : **jamais** `onInteractOutside={e => e.preventDefault()}`. Seules exceptions, reprises du Vue : le rappel de signature (bloquant, sans croix) et le kilométrage obligatoire de Pointage.
- `max-h-[90dvh] overflow-y-auto` sur `DialogContent` pour les formulaires.
- `Select` shadcn ou `Combobox`, **jamais `<select>` natif**. Champs avec label, icône ou hint : `components/shared/InputField` (label relié à l'input via `useId`).
- Dates : `<input type="date|time|datetime-local">` natifs conservés (parité, confort mobile).
- Checkboxes de formulaire modal : dans un `<label>` en carte cliquable :
  ```tsx
  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 has-[[data-state=checked]]:border-primary/30 has-[[data-state=checked]]:bg-primary/5">
    <Checkbox checked={value} onCheckedChange={(checked) => onChange(checked === true)} />
    <div className="flex flex-col gap-0.5">
      <span className="text-sm leading-none font-medium">Label</span>
      <span className="text-xs text-muted-foreground">Description</span>
    </div>
  </label>
  ```
- Confirmation « taper CONFIRMER » (Users, Véhicules, Stock) : `components/shared/ConfirmDialog` avec `confirmText`.
- Icônes lucide partout (correspondances FontAwesome : `MIGRATION.md` 4.3).

## Styles
- Classes Tailwind uniquement, `cn()` pour le conditionnel. Pas de `!important` ni de modificateur `!`. Pas de style inline, sauf valeur dynamique (couleur d'un type d'absence, position…).
- Les `<style scoped>` du Vue deviennent des classes Tailwind (CSS Modules en dernier recours ; `features/landing/landing.css` prévu pour les animations de la landing).
- **Tokens shadcn uniquement** (`bg-background`, `text-foreground`, `border-border`, `bg-primary`…), plus les tokens AVTRANS `success`, `warning`, `info`, `destructive-foreground`. Jamais les variables legacy de `theme.css` du Vue (`--color-bg-primary`…).
- Syntaxe Tailwind v4 : `bg-linear-to-*` (et non `bg-gradient-to-*`), `shadow-xs`, etc.
- Police : pile système reprise du Vue (`--font-sans` dans `index.css`), pas de police web.

## Contrat d'API (services copiés tels quels : ne pas les « corriger »)
- Token **opaque** (pas un JWT), qui n'expire pas ; pas de route logout. 401 → déconnexion, **sauf** si le message commence par `Access denied: Required role` (problème d'autorisation, pas d'authentification).
- « Introuvable » = HTTP **400** presque partout (pas 404) : se baser sur `success === false` + `message`. UUID mal formé → 500.
- Formes de réponse non uniformes : DTO nu (`/profile`, `/services/*` sauf active/history, `/users/me/*`…), tableau nu (`/services/user/daily`, `/services/month`), ou enveloppe `success` + clé variable (`acompte`, `absence`, `data`, `content`…). Les hooks consomment ce que le service retourne, rien de plus.
- `POST /services/history` : `endDate` exclusive, le service ajoute +1 jour. Ne pas le retirer.
- `GET /users` est la seule liste qui contient les utilisateurs masqués (`isVisible`) : filtrer avec `selectableUsers()` (`utils/userVisibility.ts`) **dans les sélecteurs**, avec `keepUuids` = valeur courante. **Jamais** dans l'admin des comptes (Users, comptes en attente).
- Les PUT ignorent les champs absents ou `null` : impossible d'effacer un champ (limite connue, `MIGRATION.md` 8.3).
- Fichiers envoyés en base64 dans du JSON (pas de multipart), timeout du client : 30 s.

## Stockage navigateur (clés identiques au Vue : l'app React remplace la Vue sur le même domaine)
- localStorage : `auth_token`, `user`, `theme-preference`, `changelog_last_seen_version`, `notifications_sound_enabled`.
- sessionStorage : `version_check_reloaded_for`, `version_check_dismissed`.

## Thème
- `ThemeProvider` maison (guide dark mode Vite de shadcn) branché sur `theme-preference` (`light` | `dark` | `system`), classe `.dark` sur `<html>`.
- Script anti-FOUC d'`index.html` conservé : il **n'applique pas `.dark` sur `/`** (la landing et son HTML pré-rendu sont toujours en clair).

## Pointage (mobile-first)
`/pointage` est surtout utilisé sur téléphone par les chauffeurs. Barre d'actions fixe en bas sur mobile (safe-area), frise, historique en accordéon, filtres dans un Sheet. **Vérifier d'abord à 360 px** (zone du pouce), puis le desktop.

## SEO (landing et login uniquement), pré-rendu, PWA, version
- URL publique : `https://pointage.avtrans-concept.com` (constantes dans `src/config/seo.ts`). **Jamais `app.avtrans-concept.com`** (hôte mort).
- Métadonnées par page : balises natives React 19 (`<title>`, `<meta>`, `<link rel="canonical">`). Les balises propres à chaque page sont retirées d'`index.html` et le pré-rendu les recopie (décision D2). Pages non indexables : `robots: noindex, follow`.
- `robots.txt` = liste blanche (`/` et `/login`). Ajouter une page publique = l'ajouter dans `robots.txt` ET dans les pages du sitemap (vite.config, lastmod git).
- JSON-LD : LocalBusiness + WebSite dans `index.html` ; WebPage + FAQPage injectés par la landing dans `<head>` (mêmes `@id`), jamais en `<script>` dans `#app`.
- Pré-rendu `scripts/prerender.cjs` : Edge/Chrome headless piloté en CDP, sans dépendance npm, `PRERENDER_STRICT=1`. Il attend `<div id="app"></div>` (**garder l'id `app`**), `#app h1`, `id="services"`, `id="contact"`, `<footer>`, et `window.__PRERENDERED__`. Montage par `createRoot` (pas `hydrateRoot`). FAQ en `<details>` (pas l'`accordion` Radix, qui démonte le contenu).
- Pas de Playwright ni de Puppeteer sur la machine : pour des captures, réutiliser le client CDP du script (Edge : `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` ; faire défiler la page pour déclencher les `.reveal`), ou le navigateur intégré de Claude.
- Version : `__APP_VERSION__` injecté depuis `package.json` ; `dist/version.json` comparé par le client, qui affiche alors la bannière de mise à jour. Au premier déploiement de React, monter au moins la mineure (`deploy.py --minor`) pour que les clients Vue détectent le changement.
- PWA : `manifest.json`, icônes, `theme-color` `#581c87`, favicon avec badge du nombre de notifications non lues.

## Pièges connus (issus de l'inventaire)
- `erasableSyntaxOnly` est **désactivé** dans `tsconfig.app.json` : les `enum` et `ApiError` copiés du Vue en ont besoin.
- `toISOString()` pour « aujourd'hui » donne la date UTC (la veille entre 0 h et 2 h, période d'export décalée) : utiliser les helpers de date locale de `src/lib/dates.ts` (bug B-01 du Vue, à reproduire ou corriger selon la décision).
- Polling des notifications : **une seule** instance (le Vue en montait deux).
- StrictMode monte les effets deux fois : effets idempotents avec nettoyage (script Google, mapbox, timers).
- Bash sous Windows : l'outil réduit les doubles antislashs dans les heredocs ; pour écrire un fichier, utiliser Write plutôt qu'un heredoc.
- Fins de ligne LF imposées par `.gitattributes` (Prettier vérifie `endOfLine: lf`).

## Méthode
- Plan Mode pour chaque phase ; si ça déraille : stop, re-planifier.
- Phases et points d'arrêt : `MIGRATION.md` (phase 3 à faire valider : connexion avec chaque rôle, navigation, thème).
- Pour chaque domaine :
  1. lire les fichiers Vue concernés **en entier** (et l'annexe du domaine) ;
  2. porter ;
  3. `npm run build` + `npm run lint` ;
  4. vérifier dans le navigateur (mobile 360 px et desktop, clair et sombre, rôles concernés) ;
  5. mettre à jour `MIGRATION.md` ;
  6. commiter.
- Commits atomiques en français, format conventional commits (`feat(auth): …`, `chore(setup): …`), un commit par étape validée. Pas de push sans demande.
- Sous-agents : ils suivent ce fichier ; relire leur travail avant de commiter.
- Définition de « terminé » : build (type-check + build + pré-rendu) et lint sans erreur ni warning ; toutes les lignes de `MIGRATION.md` à `vérifié` ; chaque route du Vue présente avec le même chemin, les mêmes gardes et le même rendu ; aucun fichier de `vue_avtrans` modifié.

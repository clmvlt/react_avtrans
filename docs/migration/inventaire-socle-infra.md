# Inventaire socle / infrastructure : vue_avtrans → React

Tout le périmètre a été lu en entier : socle, 19 composables, composants maison, shadcn-vue, sidebar et CSS. Chaque « Utilisé par » a été vérifié par grep. Aucun fichier n'a été modifié.

## Constats majeurs

1. **Noms de routes de `pagesWithoutNavbar` faux** (App.vue:76).
   - 6 noms sur 9 ne correspondent à aucun `name` du router : `login`, `register`, `verify`, `forgot-password`, `reset-password`, `unauthorized`.
   - Seuls `Landing`, `AppDownload` et `NotFound` correspondent.
   - Conséquence : une personne connectée voit la Navbar sur `/verify`, `/forgot-password`, `/password-reset`, `/unauthorized`, `/register/google`, `/mentions-legales` et `/politique-confidentialite`, avec le polling des notifications et les dialogs globaux.
2. **Évaluation au montage d'App.vue avant la fin de la 1ʳᵉ navigation** (App.vue:102-116).
   - `route.name` vaut encore `undefined` au montage, donc le changelog s'ouvre aussi sur les pages publiques.
   - La complétion de profil n'est pas conditionnée à `showNavbar`.
   - Ni l'un ni l'autre n'est réévalué après un login : rien ne s'affiche avant un rechargement.
3. **`<Notifications />` est monté deux fois** (Navbar.vue:43 et 143).
   - Double polling toutes les 5 s et double son.
   - À la fermeture du Sheet, le 2ᵉ exemplaire se démonte : il remet le titre d'origine et efface le badge du favicon.
   - Sur mobile, la liste déroulante est en z-50, sous l'overlay du Sheet en z-[1040]. Elle est probablement invisible (à confirmer manuellement).
4. **Clé de cache de `usePdfPreview` = 100 premiers caractères base64 + largeur** (L21). Les PDF générés par le même outil ont souvent le même en-tête : risque réel d'afficher l'aperçu d'un autre PDF.
5. **Icônes FontAwesome** : 103 sont enregistrées, 13 réellement utilisées. En plus, 9 icônes utilisées ne sont pas enregistrées (`file-pdf`, `file-word`…) et ne s'affichent pas dans Entretiens et EntretiensVehicule.
6. **Code mort important** :
   - `AppSidebar.vue` et tout `ui/sidebar/*` (18 fichiers).
   - `alert-dialog/*` (0 import) et `useUserHours.ts`.
   - `style.css`, qui n'est importé nulle part.
   - Dépendances inutiles : `radix-vue` n'est jamais importé ; `@tanstack/vue-table` ne sert qu'au `table/utils.ts` mort, donc aucun data-table n'existe aujourd'hui.
7. **`theme.css` a encore des effets globaux cachés** :
   - Ses variables non placées dans un layer écrasent le thème Tailwind v4 : `--font-sans`/`--font-mono` (la police réelle de l'app vient de là), `--color-gray-*`, `--color-white`/`--color-black`.
   - La scrollbar et `::selection` n'ont pas de variante sombre.
   - Les variables legacy ne servent plus qu'à `UserEdit.vue`, qui utilise en plus beaucoup de variables inexistantes.
8. **Piège TypeScript côté cible** : le template Vite 7 React-TS active `erasableSyntaxOnly`. Les 4 fichiers `enums/*` (TS `enum`) et `ApiError` (propriétés déclarées dans le constructeur, ApiClient.ts:7-12) ne compileront pas « copiés inchangés ». Il faut soit désactiver ce flag, soit les convertir en objets `as const`.
9. **Stockage de session** : les clés `auth_token` (texte brut) et `user` (JSON) sont lues directement par `config/api.ts` et `services/export.ts`. Le middleware `persist` de Zustand utiliserait une autre forme de stockage et déconnecterait tout le monde à la bascule. Il faut une hydratation manuelle depuis ces deux clés.

---

## Socle

### src/main.ts (21 l.)
- **Rôle** : bootstrap. Importe `styles/theme.css` puis `styles/tailwind.css`, appelle `registerIcons()` (FontAwesome), enregistre `font-awesome-icon` globalement, puis `pinia`, `router`, `mount('#app')`.
- **API** : aucune.
- **Dépendances** : `@fortawesome/vue-fontawesome`, `config/icons`, pinia, router.
- **Utilisé par** : `index.html`.
- **Points notables** : le store auth est créé au premier `useAuthStore()`, c'est-à-dire dans App.vue ou le premier guard. Il lance alors `loadFromStorage` et `refreshUser(false)`.
- **Bugs** : aucun.
- **Cible React** : `src/main.tsx`.
  - `createRoot`, `<StrictMode><AppProviders><RouterProvider router={router}/></AppProviders>`.
  - Import `./index.css` (le CSS de `shadcn init`, porté depuis `tailwind.css`).
  - Suppression de FontAwesome.
  - Le refresh du profil au démarrage se lance hors composant (dans main.tsx ou dans l'initialisation du store), pour éviter le double effet de StrictMode.

### src/App.vue (178 l.)
- **Rôle** : coquille globale. Navbar conditionnelle, `<router-view>`, Messages (toasts), UpdateBanner, ChangelogDialog, ProfileCompletionDialog, ServiceHistoryDialog, SignatureReminderDialog.
- **État local** : `messagesRef`, `showChangelog`, `showProfileCompletion`.
- **Computed** : `needsProfileCompletion` (adresse rue + ville + CP, et numéro de permis), `showNavbar`, `userName`. Fonction `getUserInitials()`.
- **Dépendances** : `useAuthStore`, `usePendingUsers`, `useSignatureReminder`, `useServiceHistory`, `useChangelog`, `setMessagesInstance`, `useVersionCheck`, `usePermissions`, Navbar, `components/signatures/SignatureReminderDialog.vue`, `components/hours/ServiceHistoryDialog.vue`.
- **Utilisé par** : `main.ts`.

**Comportements globaux montés ici :**

| Comportement | Lignes | Détail |
|---|---|---|
| pendingUsers | 28-41 | Watch immédiat sur `isAuthenticated && isAdmin`. Si vrai : `loadPendingUsers()` (GET /users, liste complète). Sinon : `resetPendingUsers()` et `resetServiceHistory()`. |
| serviceHistory | 30, 168 | Modale globale `v-if="showNavbar && authStore.isAdmin"`. Ouverte depuis Notifications (dropdown et page), JournalPointages, UserServices. |
| signatureReminder | 46-54, 171-176 | Watch immédiat sur `isAuthenticated && isActive && isEmailVerified`. Si vrai : `checkSignature()` (une fois par session). Sinon : `reset()`. Dialog bloquant (sans bouton de fermeture) si `showSignatureReminder && showNavbar` ; `@signed` → `markSigned`. |
| versionCheck | 57, 146-151 | `useVersionCheck()` (actif en PROD uniquement) alimente UpdateBanner (`show`, `version`, `@update`, `@later`). |
| changelog | 60-61, 107-110, 118-121, 154-158 | Ouverture automatique **uniquement dans `onMounted`** si `hasUnseenChanges && isAuthenticated && route pas dans pagesWithoutNavbar`. Ouverture manuelle via `@show-changelog` de la Navbar. `markAsSeen` seulement via `@close`. |
| profileCompletion | 63-73, 112-115, 161-165 | Ouverture automatique uniquement dans `onMounted`. Le dialog est rendu si `isAuthenticated && needsProfileCompletion`, sans condition sur `showNavbar`. |
| pagesWithoutNavbar | 76-81 | `['Landing','AppDownload','login','register','verify','forgot-password','reset-password','unauthorized','NotFound']`. Noms réels du router : `Login`, `Register`, `Verify`, `ForgotPassword`, `PasswordReset`, `Unauthorized`, `GoogleRegister`, `MentionsLegales`, `PolitiqueConfidentialite`, `AddToHomescreen`. Correspondent : Landing, AppDownload, NotFound. Ne correspondent pas : les 6 autres de la liste, et 3 routes publiques absentes de la liste. |
| Messages | 102-105 | `setMessagesInstance(messagesRef.value)` dans `onMounted`. |
| Logout | 97-100 | `authStore.logout()` puis `router.push('/login')`. |

- **Points notables pour React** :
  - Plusieurs états sont des singletons de module partagés (pendingUsers, serviceHistory, signatureReminder, versionCheck), réinitialisés par les watchers d'App.
  - En React il faudra aussi vider le cache TanStack Query au logout, sinon les données de l'utilisateur précédent restent visibles.
- **Bugs suspectés** :
  - L76 : noms de routes faux (cf. tableau).
  - L108 : `route.name` vaut `undefined` au montage (navigation initiale asynchrone et routes lazy), donc la condition est toujours vraie. Le changelog s'ouvre sur Landing, `/download` et 404 pour une personne connectée.
  - L113 et L161 : la complétion de profil s'affiche aussi sur Landing.
  - L102-116 : rien n'est réévalué après login ; il faut recharger la page.
  - L154 avec ChangelogDialog:62-65 : fermer par l'overlay, Échap ou la croix n'émet pas `close`, donc pas de `markAsSeen`. Le changelog revient au chargement suivant.
  - L125 : `id="app"` dupliqué avec le point de montage d'index.html.
  - L97 : `async` sans `await` (cosmétique).
- **Cible React** :
  - `src/components/layout/RootLayout.tsx` : `<Outlet/>` + UpdateBanner + `<ScrollRestoration/>`, pour toutes les routes.
  - `src/components/layout/AppLayout.tsx` : Navbar + `<Outlet/>` + `GlobalDialogs`, uniquement pour les routes authentifiées. Le découpage par layouts remplace `pagesWithoutNavbar`.
  - `src/components/layout/GlobalDialogs.tsx` : Changelog, ProfileCompletion, ServiceHistory, SignatureReminder, avec leur logique d'ouverture recalculée par effet sur `isAuthenticated`.
  - `src/providers/AppProviders.tsx` (QueryClientProvider, ThemeProvider, `<Toaster/>` sonner).

### src/router/index.ts (395 l.)
- **Rôle** : 43 routes lazy + un guard global.
- **API** :
  - `RouteMeta { requiresAuth, requiresAdmin, requiresMechanic, requiresCouchette }`.
  - `getDefaultRoute()` : admin → `/users`, mécanicien → `/vehicules`, sinon `/pointage`.
  - `scrollBehavior` : restaure la position sauvegardée, sinon remonte en haut.
  - Guard, dans l'ordre :
    1. `requiresAuth` sans session → `/login`.
    2. Email non vérifié → `logout()` puis `/login`.
    3. Compte inactif → `/unauthorized`.
    4. `requiresAdmin` sans être admin → `/unauthorized` ; si admin en `viewAsUser`, `setViewMode(false)`.
    5. `requiresMechanic` : il faut être admin ou mécanicien.
    6. `requiresCouchette` : il faut `hasCouchettePermission`.
    7. Personne connectée vers Login ou Register → `getDefaultRoute()`.
- **Dépendances** : `useAuthStore`.
- **Utilisé par** : `main.ts`, `api/index.ts` (import dynamique), `useVersionCheck` (`afterEach`).
- **Points notables** :
  - Le guard modifie le store (`logout`, `setViewMode`).
  - `getDefaultRoute` est dupliqué dans Navbar.vue:301-305.
- **Bugs / incohérences** :
  - L386-390 : seules Login et Register redirigent une personne connectée (pas GoogleRegister ni ForgotPassword).
  - L275-280 : `/app-versions` est seulement `requiresAdmin`, alors que le lien de nav est limité à un email (navConfig:328). N'importe quel admin y accède par l'URL.
- **Cible React** :
  - `src/router/index.tsx` : `createBrowserRouter` avec `lazy`, arbre RootLayout → (routes publiques | AppLayout → routes protégées).
  - `src/router/guards.ts` : loaders `requireAuth`, `requireAdmin`, `requireMechanic`, `requireCouchette`, `redirectIfAuthenticated`, basés sur `useAuthStore.getState()` et `redirect()`.
  - `src/router/getDefaultRoute.ts`, partagé avec le logo de la Navbar.
  - `<ScrollRestoration/>`.

### src/stores/auth.ts (219 l.)
- **Rôle** : store Pinia de la session.
- **API** :
  - State : `user: UserDTO|null`, `token`, `loading`, `error`, `viewAsUser`.
  - Getters : `isAuthenticated` (token et user présents), `isEmailVerified` (`user.isMailVerified`), `isActive`, `userRole` (`role.nom`), `userRoleUuid`, `isAdmin`/`isMechanic`/`isUser` (comparaison d'UUID), `canToggleViewMode` (admin ou mécanicien), `hasCouchettePermission` (`user.isCouchette === true`).
  - Actions : `login(credentials)`, `loginWithGoogle(idToken)` (applique la session si `status === 'AUTHENTICATED'`), `logout()`, `loadFromStorage()`, `refreshUser(showLoading=true)` (GET /profile ; 401 → logout ; erreurs réseau et timeout ignorées), `toggleViewMode()`, `setViewMode(bool)`.
  - Export `ROLE_UUIDS` : alias mort.
- **Dépendances** : `authService`, `profileService`, `ApiError`, `USER_ROLE_UUIDS`, localStorage `auth_token` (écrit par le service) et `user` (écrit par le store).
- **Utilisé par** (24 fichiers) : App, `api/index`, AppSidebar, Navbar, Notifications (composant), ProfileCompletionDialog, useChangelog, useGoogleSignIn, usePermissions, router, views auth/Login, auth/Register, common/NotFound, common/Notifications, common/Profile, common/Unauthorized, hours/Pointage, maintenance/Entretiens, maintenance/EntretiensVehicule, maintenance/TypesEntretien, stock/StockItems, users/UserEdit, vehicles/VehiculeDetail, vehicles/Vehicules.
- **Membres non utilisés à l'extérieur** : `loading`, `error`, `isUser`, `loadFromStorage`, `ROLE_UUIDS`.
- **Points notables** :
  - Le chargement et le refresh sont lancés à la création du store (L184-190).
  - `viewAsUser` n'est pas persisté.
  - Le token est opaque et n'expire jamais (commentaire L151).
- **Bugs / incohérences** :
  - L38-50 : si l'API renvoie un token sans `user`, le service a déjà stocké le token, mais le store ne le prend pas. Token orphelin.
  - L23 et `usePermissions:35` : les rôles sont testés par *nom* pour la nav et par *UUID* pour les guards. Deux sources de vérité, et le nom est sensible aux accents (« Mécanicien »).
- **Cible React** : `src/stores/auth-store.ts` (Zustand).
  - State `{ user, token, viewAsUser }`, hydraté **manuellement** depuis `auth_token` et `user` (pas de `persist`, cf. constat 9).
  - Sélecteurs exportés (`selectIsAdmin`…) plutôt que des getters.
  - Actions `applySession`, `logout` (+ `queryClient.clear()`), `refreshUser`, `toggleViewMode`, `setViewMode`.
  - `login` et `loginWithGoogle` deviennent des `useMutation` dans `features/auth/api/`, pour gérer `loading` et `error`.

### src/api/ApiClient.ts (294 l.)
- **Rôle** : client fetch générique.
- **API** :
  - `class ApiError(message, status?, code?, details?)` avec `static fromErrorResponse`.
  - Types `RequestInterceptor`, `ResponseInterceptor`, `ApiClientConfig`.
  - `class ApiClient { addRequestInterceptor, addResponseInterceptor, request<T>, get, post, put, patch, delete }`.
  - Timeout par défaut 30 s via AbortController. 204/205 → `{success:true}`.
  - Parsing JSON, text/plain, ou fallback.
  - Une erreur 400 concatène `errors[]` dans le message.
  - Codes d'erreur : `TIMEOUT` (408), `NETWORK_ERROR` (0), `UNKNOWN_ERROR` (500).
- **Dépendances** : `@/types`.
- **Utilisé par** : `api/index.ts`.
- **Points notables** : aucune dépendance Vue, copiable tel quel.
- **Bugs suspectés** :
  - L175 : `Content-Type: application/json` forcé, et L188 fait `JSON.stringify` d'un FormData, qui donne `"{}"`. Les uploads ne peuvent pas passer par ce client (`services/export.ts` refait un fetch).
  - L94-96 : un paramètre `undefined` est sérialisé en `"undefined"`. Les services contournent déjà ce cas.
  - L198-206 : `clearTimeout` n'est pas appelé si fetch rejette (sans effet réel).
  - L7-12 : les propriétés déclarées dans le constructeur cassent `erasableSyntaxOnly`.
- **Cible React** : `src/api/ApiClient.ts`, copié. Réécrire `ApiError` avec des champs explicites si `erasableSyntaxOnly` reste actif.

### src/api/index.ts (66 l.)
- **Rôle** : instance `apiClient` (baseURL `API_URL`, timeout 30 s).
  - Intercepteur de requête : ajoute `Authorization: Bearer` depuis localStorage.
  - Intercepteur de réponse sur 401 : si le message ne commence pas par `"Access denied: Required role"`, supprime `auth_token` et `user`, puis `import('@/stores/auth')` → `logout()`, puis `import('@/router')` → `push('/login')` (sauf si on est déjà sur /login).
- **API** : `apiClient`, réexporte `ApiClient`, `ApiError` et les types.
- **Dépendances** : `config/api`, store (dynamique), router (dynamique), `window.location`.
- **Utilisé par** : les 24 services, `stores/auth`, `useGoogleSignIn`, `views/auth/GoogleRegister`.
- **Points notables** : les imports dynamiques évitent un cycle api → store → services → api.
- **Bugs** : un 401 reçu sur une page publique autre que /login (Register…) redirige vers /login.
- **Cible React** : `src/api/index.ts`. Remplacer par `useAuthStore.getState().logout()` et `(await import('@/router')).router.navigate('/login')`, plus `queryClient.clear()`. Garder l'import dynamique du router (cycle api → router → pages → api).

### src/config/api.ts (37 l.)
- **Rôle** : `API_URL` (`VITE_API_URL`, sinon `http://192.168.1.120:8081/`), `TOKEN_STORAGE_KEY='auth_token'`, `getAuthToken`, `setAuthToken`, `clearAuthToken`, `isAuthenticated()`.
- **Utilisé par** : `api/index`, `services/auth`, `services/appVersions`.
- **Code mort** : `isAuthenticated()`. La clé est codée en dur ailleurs (`stores/auth:133`, `services/export.ts:26`).
- **Cible React** : `src/config/api.ts`, copié.

### src/config/icons.ts (240 l.)
- **Rôle** : enregistre 101 icônes FA solid et 2 brands (android, apple) dans `registerIcons()`.
- **Utilisé par** : `main.ts`.
- **Bugs** : 90 icônes inutiles ; les icônes `file-*` utilisées ne sont pas enregistrées (cf. section 2). Le commentaire parle de « ~75 ».
- **Cible React** : supprimer (lucide-react uniquement).

### src/config/map.ts (29 l.)
- **Rôle** : `MAPBOX_TOKEN` (`VITE_MAPBOX_TOKEN`), `MAPBOX_STYLE` (outdoors-v12), `MAPBOX_STYLE_SATELLITE`, `DEFAULT_CENTER`, `DEFAULT_ZOOM`.
- **Utilisé par** : `useMapModal`, pour `MAPBOX_TOKEN` seulement.
- **Incohérence** : les 4 autres constantes sont mortes ; `useMapModal:74` code en dur `streets-v12` et un zoom de 14.
- **Cible React** : `src/config/map.ts`, copié.

### src/config/navConfig.ts (344 l.)
- **Rôle** : navigation.
  - `NavLinkConfig { to, label, icon?, lucideIcon?: Component, requiredRoles?, requiredPermissions?, requiredEmails? }`.
  - `NavSectionConfig { title, lucideIcon, links, group? }`.
  - `mainNavLinks` (15 liens), `fullNavSections` (6 sections), `fullNavLinks` (déprécié).
- **Dépendances** : `import type { Component } from 'vue'` et `lucide-vue-next` (**dépend de Vue**). Icônes : Car, Wrench, Users, CalendarX2, CalendarDays, Coins, BedDouble, Clock, Building2, CreditCard, BarChart3, UserCircle, ListChecks, Smartphone, Package, FileUp, PenLine, Download, Scale, History.
- **Utilisé par** : Navbar, AppSidebar (mort).
- **Code mort** : `icon?: string` (L32), `fullNavLinks` (L344).
- **Incohérence** : email personnel codé en dur (L328), qui ne protège que l'affichage du lien.
- **Cible React** : `src/config/navConfig.ts`, en remplaçant `Component` par `LucideIcon` et l'import par `lucide-react` (mêmes noms ; `BarChart3` et `UserCircle` sont des alias encore exportés).

### src/config/seo.ts (16 l.)
- **Rôle** : `SITE_URL`, `SITE_NAME`, `DEFAULT_TITLE`, `DEFAULT_DESCRIPTION`, `JSONLD_BUSINESS_ID`, `JSONLD_WEBSITE_ID`.
- **Utilisé par** : `usePageMeta`, `Landing.vue`.
- **Cible React** : copié.

### src/config/version.ts (8 l.)
- **Rôle** : `APP_VERSION = __APP_VERSION__` (constante `define` de Vite, lue dans package.json).
- **Utilisé par** : Navbar (affichage), `useVersionCheck`.
- **Cible React** : copié. Porter dans `vite.config.ts` le `define`, le plugin `version.json` et le plugin sitemap (vite.config.js:27-90).

### src/data/changelog.ts (73 l.)
- **Rôle** : types `ChangeRole`, `ChangeType`, `Change`, `ChangelogEntry` et tableau `changelog` (dernière entrée 0.0.31).
- **Utilisé par** : `useChangelog`, ChangelogDialog.
- **Points notables** : versions indépendantes de `APP_VERSION` (0.1.6). Coquille « moible » (L67).
- **Cible React** : `src/features/changelog/data/changelog.ts`, copié.

### src/vite-env.d.ts (21 l.)
- **Rôle** : `declare module '*.vue'` (Vue), `ImportMetaEnv` (`VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_GEOCODING_API_URL`), `__APP_VERSION__`.
- **Incohérence** : `VITE_MAPBOX_TOKEN` n'est pas déclaré.
- **Cible React** : `src/vite-env.d.ts` sans le module `*.vue`, en ajoutant `VITE_MAPBOX_TOKEN`.

### src/types/api.ts (156 l.)
- **Rôle** : `ErrorResponse`, `SuccessMessageResponse`, `PagedResponse<T>`, `ApiResponse<T>` (avec des champs spécifiques aux endpoints), `HttpMethod`, `ApiRequestConfig`, `PaginationParams`, `DateRange`, `isErrorResponse`, `isPagedResponse`.
- **Code mort** : `isErrorResponse`, `isPagedResponse`, `DateRange`.
- **Cible React** : copié.

### src/types/file.ts (13 l.)
- **Rôle** : `FileData`.
- **Utilisé par** : `fileUtils`, FileCard.
- **Cible React** : copié.

### src/types/geocoding.ts (38 l.)
- **Rôle** : `AddressResult`, `GeocodingStatus`.
- **Utilisé par** : AddressAutocomplete, `services/geocoding`.
- **Cible React** : copié.

### src/types/google-identity.d.ts (74 l.)
- **Rôle** : types GIS et `declare global Window.google`.
- **Utilisé par** : `useGoogleIdentity`, GoogleSignInButton.
- **Cible React** : copié.

### src/types/index.ts (20 l.)
- **Rôle** : barrel (`export type` corrects, compatibles `verbatimModuleSyntax`).
- **Cible React** : copié.

### src/lib/utils.ts (7 l.)
- **Rôle** : `cn()` (clsx + tailwind-merge), identique à shadcn. 73 importeurs.
- **Cible React** : régénéré par `shadcn init`.

### src/enums/UserRole.ts (38 l.)
- **Rôle** : `enum UserRole` (noms en base, avec accents), `USER_ROLE_UUIDS`, `USER_ROLE_COLORS` (mort), `UserRoleLabels` (mort).
- **Cible React** : copié ; `enum` → `as const` si `erasableSyntaxOnly`.

### src/enums/UserStatus.ts (17 l.)
- **Rôle** : `enum UserStatus` et labels.
- **Cible React** : même remarque sur `enum`.

### src/enums/PeriodiciteType.ts (14 l.)
- **Rôle** : `enum PeriodiciteType` et labels (`PeriodiciteTypeLabels` mort).
- **Cible React** : même remarque sur `enum`.

### src/enums/AbsencePeriod.ts (17 l.)
- **Rôle** : `enum AbsencePeriod` et labels.
- **Cible React** : même remarque sur `enum`.

### src/enums/index.ts (7 l.)
- **Rôle** : barrel.
- **Cible React** : copié.

### src/utils/* : dépendances à Vue
- **utils/serviceModificationFormatters.ts (164 l.)** : **seul utilitaire qui dépend de Vue** (`import type { Component } from 'vue'`, icônes `lucide-vue-next` Pencil, Plus, Trash2). Cible : `LucideIcon` et `lucide-react`.
- **utils/timeFormatters.ts (271 l.)**
  - Pur.
  - Bug L130-133 : `getTodayDate()` utilise `toISOString()`, donc une date UTC. Entre 00:00 et 01:00/02:00 à Paris, elle renvoie la veille. Utilisé pour préremplir le formulaire de UserServices.vue:767 et 786.
  - `toISOStringWithTimezone` est mort.
- **utils/absenceFormatters.ts (72 l.)** : pur.
- **utils/acompteFormatters.ts (42 l.)** : pur.
- **utils/fileUtils.ts (52 l.)** : pur.
- **utils/userVisibility.ts (33 l.)** : pur.
- **Cible React** : copiés dans `src/utils/`.

### src/services/index.ts (107 l.)
- **Rôle** : barrel des 25 services (tous les fichiers de `services/` sont exportés).
- **Cible React** : copié. Aucune dépendance Vue dans `services/`.

---

## Composables (19)

### composables/useBrowserDetection.ts (181 l.)
- **API** : `useBrowserDetection() → { detectBrowser(): BrowserType, getInstructions(b), getBrowserName(b), getAllBrowserTypes(), isMobileDevice() }`.
  - Types `BrowserType` : `chrome-android | chrome-ios | safari | firefox | edge | samsung | unknown`.
  - `BrowserInstructions { steps, icon: [string, string] }`.
- **Dépendances** : `navigator.userAgent`.
- **Utilisé par** : `views/auth/AddToHomescreen.vue`.
- **Points notables** : rien de réactif (fonctions pures).
- **Bugs / code mort** :
  - Le champ `icon` n'est jamais rendu. 4 de ses icônes ne sont pas enregistrées dans FA (compass L35, fire L53, window-maximize L62, question-circle L80).
  - `isMobileDevice` est mort.
  - L136-138 : Chrome sur ordinateur est classé `chrome-android` (instructions Android affichées).
- **Cible React** : `src/features/pwa/lib/browserDetection.ts` (fonctions pures), sans le champ `icon`.

### composables/useChangelog.ts (109 l.)
- **API** : `useChangelog() → { latestEntry: ChangelogEntry|null (filtrée par rôle), latestVersion, hasUnseenChanges, markAsSeen() }`.
  - Hiérarchie : admin ⊃ mécanicien ⊃ utilisateur ⊃ all.
- **Dépendances** : store auth (`userRoleUuid`, `isAuthenticated`), localStorage `changelog_last_seen_version`.
- **Utilisé par** : App.vue (la Navbar reçoit `hasUnseenChanges` en prop).
- **Points notables** : `lastSeenVersion` est un ref propre à chaque appel, sans partage.
- **Bugs** : aucun ici (voir App.vue et ChangelogDialog).
- **Cible React** : `src/features/changelog/hooks/useChangelog.ts`, avec `src/hooks/useLocalStorage.ts` (basé sur `useSyncExternalStore`, pour que la Navbar et les dialogs restent synchronisés).

### composables/useContextMenu.ts (102 l.)
- **API** : `useContextMenu<T>({ viewportMargin=8 }) → { state: Ref<{ show, x, y, entity }>, menuRef, open(event, entity), close(), handleAction(action, cb) }`.
  - `open` fait `preventDefault` puis repositionne dans le viewport après `nextTick`.
  - Échap ferme (listener sur `document`).
- **Utilisé par** : `views/absences/Absences`, `acomptes/Acomptes`, `app-versions/AppVersions`, `cartes/Cartes`, `maintenance/Entretiens`, `users/Users`, `vehicles/Vehicules`.
- **Points notables** : chaque vue recopie un `watch(contextMenuRef.menuElement → menuRef)` (7 duplications).
- **Cible React** : **`npx shadcn add context-menu`** (Radix gère la position, les collisions, Échap et le clic extérieur). `useContextMenu` et ContextMenuPopover disparaissent.

### composables/useFaviconBadge.ts (211 l.)
- **API** :
  - `useFaviconBadge() → { setBadgeCount(n): Promise<void>, clearBadge(), getCurrentCount() }` (`getCurrentCount` mort).
  - `getFaviconBadgeInstance()` : singleton.
- **Dépendances** : `document`, `link[rel=icon]`, canvas, Image.
- **Utilisé par** : `components/ui/notifications/Notifications.vue`.
- **Points notables** : état global au niveau du module (canvas, image, URL d'origine).
- **Bugs** :
  - L39 : ne modifie que le premier `link[rel=icon]` (favicon-32x32) ; les icônes 16x16 et .ico restent sans badge.
  - L44 : fallback `/src/assets/favicon.png`, valable en dev uniquement.
  - L20-67 : deux appels concurrents avant le chargement créent deux canvas.
  - Si l'image échoue, un `console.error` est émis toutes les 5 s (à chaque poll).
- **Cible React** : `src/lib/faviconBadge.ts` (module simple, pas un hook), appelé par `features/notifications/hooks/useNotificationSideEffects.ts`.

### composables/useGoogleIdentity.ts (72 l.)
- **API** : `loadGoogleIdentity(): Promise<GoogleAccountsId>` (script GIS injecté une seule fois, promesse mémorisée), `GOOGLE_CLIENT_ID`.
- **Utilisé par** : `components/auth/GoogleSignInButton.vue`.
- **Cible React** : `src/features/auth/lib/googleIdentity.ts`, copié (pas un hook).

### composables/useGoogleRegistration.ts (39 l.)
- **API** : `useGoogleRegistration() → { idToken (readonly), profile (readonly), setRegistration(token, profile), clearRegistration(), hasRegistration() }`.
- **Points notables** : état **singleton de module en mémoire**, volontairement non persisté. Il n'est jamais réinitialisé au logout.
- **Utilisé par** : `useGoogleSignIn`, `views/auth/GoogleRegister.vue`.
- **Cible React** : `src/features/auth/lib/googleRegistrationStore.ts` (variables de module).
  - **Ne pas** passer par `navigate(..., { state })` : `history.state` survit au rechargement, ce qui contredit l'exigence de non-persistance.

### composables/useGoogleSignIn.ts (72 l.)
- **API** : `useGoogleSignIn() → { submitting: Ref<boolean>, signIn(idToken): Promise<GoogleSignInResult> }`.
  - `GoogleSignInResult` : `authenticated | redirected | error{message}`.
  - `NEEDS_REGISTRATION` → `setRegistration` puis `router.push('/register/google')`.
- **Dépendances** : router, store, `useGoogleRegistration`, `ApiError`.
- **Utilisé par** : `views/auth/Login.vue`, `views/auth/Register.vue`.
- **Cible React** : `src/features/auth/api/useGoogleSignIn.ts` (`useMutation` + `useNavigate`).

### composables/useMapModal.ts (145 l.)
- **API** : `useMapModal() → { showMapModal, mapContainer (ref DOM), mapServiceTime, mapCoords, mapCoordsEnd, mapHasEndLocation, showLocationMap(service: any, formatTimeFn), closeMapModal() }`.
  - Mapbox est importé dynamiquement (CSS compris).
  - Marqueurs vert (début) et violet (fin) avec popups ; `fitBounds` s'il y a 2 points.
- **Dépendances** : mapbox-gl, `MAPBOX_TOKEN`, `nextTick`, `onUnmounted`.
- **Utilisé par** : `views/users/UserServices.vue`.
- **Bugs** :
  - L72 : un 2ᵉ `showLocationMap` sans fermeture recrée une carte sans supprimer la précédente (fuite).
  - L74 : style codé en dur.
  - L31-35 : types `any`.
  - `setHTML` (L86, L98) est sans risque ici (heures formatées).
- **Cible React** : `src/features/users/components/LocationMapDialog.tsx` + `src/features/users/hooks/useMapbox.ts` (ref callback et nettoyage dans l'effet ; import dynamique conservé).

### composables/useMessages.ts (93 l.)
- **API** :
  - `setMessagesInstance(instance)`.
  - `useMessages() → { showMessage({ id?, title?, text, variant?, duration?, action? }): string|null, success(text, title?, duration=5000, action?), error(…, 7000), warning(…, 6000), info(…, 5000), primary(…, 5000), removeMessage(id), clearAll() }`.
- **Points notables** :
  - Singleton de module qui pointe vers le composant Messages (`as any`).
  - Signature **(text, title)** : attention à l'inversion titre/description avec sonner.
  - Usage : ~84 `error` et ~74 `success` ; `showMessage` avec `id` et `action` et `removeMessage` seulement dans Pointage.vue:772 et 803. `warning`, `info`, `primary`, `clearAll` ne sont jamais appelés à l'extérieur.
- **Utilisé par** : 40 fichiers (App, ProfileCompletionDialog, SignatureReminderDialog, ~17 modals de `components/*`, ~21 vues).
- **Cible React** : sonner. Adaptateur `src/lib/notify.ts` : `notify.success(text, title?)` → `toast.success(title ?? text, { description: title ? text : undefined, duration })`. `id` → `toast(…, { id })`, `action` → `{ action: { label, onClick } }`, `removeMessage` → `toast.dismiss(id)`, `clearAll` → `toast.dismiss()`.

### composables/usePageMeta.ts (81 l.)
- **API** : `usePageMeta({ title?, description?, robots?, canonicalPath? }): void`. Applique au montage, restaure au démontage dans l'ordre inverse. Crée la balise si elle est absente.
- **Utilisé par** : AppVersionsPublic, ForgotPassword, GoogleRegister, Login, Register, ResetPassword, Verify, NotFound, Unauthorized, MentionsLegales, PolitiqueConfidentialite (toutes les vues publiques sauf Landing, qui garde index.html).
- **Bugs** : conflit avec Notifications.vue:213-223, qui réécrit `document.title` toutes les 5 s avec un titre capturé au montage de la Navbar.
- **Cible React** : `src/hooks/usePageMeta.ts` (même logique dans `useEffect`). Les balises `<title>`/`<meta>` natives de React 19 dupliqueraient celles d'index.html (pas de dédoublonnage) : garder le hook.

### composables/usePdfPreview.ts (175 l.)
- **API** : `generatePdfPreview(base64, width=200): Promise<dataURL>`, `generatePdfPreviewFromUrl(url, width=200)`, `clearPreviewCache()` (mort). Rendu de la page 1 en JPEG 0.85 sur fond blanc.
- **Dépendances** : pdfjs-dist ; worker **CDN cdnjs codé en dur 4.0.379** (L5-6) ; cache `Map` de module non borné.
- **Utilisé par** : PdfPreview.vue.
- **Bugs** :
  - L21 : clé de cache = 100 premiers caractères base64 + largeur. **Collision probable** entre PDF au même en-tête, donc mauvais aperçu.
  - L5 : worker figé alors que package.json a `^4.0.379` ; un `npm update` casse le pdf.js (versions incompatibles).
  - Code dupliqué entre les deux fonctions.
- **Cible React** : `src/lib/pdfPreview.ts` (worker via `import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'`) + `src/hooks/usePdfPreview.ts` = `useQuery(['pdf-preview', hash|url, width])`, avec une clé basée sur un hash (SHA-1 ou longueur + fin du contenu).

### composables/usePendingUsers.ts (96 l.)
- **API** :
  - `isPendingActivation(user)` : `isActive === false` et créé il y a 7 jours ou moins.
  - `usePendingUsers() → { pendingUsers, pendingCount, loading, loadPendingUsers(force=false), setFromUsers(list), removePending(uuid), reset() }`.
- **Points notables** : **singleton de module**. Charge la liste complète via `usersService.getUsers()` à chaque session admin.
- **Utilisé par** : App (load/reset), Navbar (`pendingCount` → badge « Utilisateurs »), `views/users/Users.vue` (`setFromUsers`, `removePending`, `isPendingActivation`).
- **Bugs** :
  - L50-64 : pas de protection contre un `reset()` pendant une requête (données périmées après changement de compte).
  - L51 : `force` est ignoré si un chargement est en cours.
- **Cible React** : `src/features/users/api/usePendingUsers.ts` = `useQuery(usersKeys.list(), usersService.getUsers, { enabled: isAdmin, select: r => r.data.filter(isPendingActivation) })`, en partageant le cache avec la page Utilisateurs.
  - `setFromUsers` et `removePending` → `setQueryData` ou `invalidateQueries`.
  - `reset` → cache vidé au logout.
  - `isPendingActivation` → `src/features/users/lib/pendingActivation.ts`.

### composables/usePermissions.ts (88 l.)
- **API** : `usePermissions() → { isAdmin, isMechanic, isUser, userRole, isViewingAsUser, canToggleViewMode, ROLE_UUIDS, hasRole(roles?), hasPermission('couchette'), canAccess(roles?, perms?), toggleViewMode(), setViewMode(b) }`.
  - En `viewAsUser`, un admin ou mécanicien est simulé comme UTILISATEUR.
- **Utilisé par** : App (`canToggleViewMode`, `toggleViewMode`), Navbar (`canAccess`), AppSidebar (mort). Les autres membres ne servent qu'en interne.
- **Incohérence** : L35 compare `role.nom` au lieu de l'UUID (voir store).
- **Cible React** : `src/hooks/usePermissions.ts` (sélecteurs Zustand), `canAccess` basé sur les UUID.

### composables/useServiceHistory.ts (86 l.)
- **API** : `useServiceHistory() → { isOpen, serviceUuid, modifications, loading, error, open(uuid), close(), reload(), retry, reset() }`.
  - GET `/services/admin/{uuid}/modifications`, avec `requestId` contre les réponses obsolètes.
- **Points notables** : **singleton de module** qui pilote une modale globale.
- **Utilisé par** : App, `components/hours/ServiceHistoryDialog`, Navbar (ferme le Sheet à l'ouverture), Notifications (composant), `useUserServices` (reload), `views/common/Notifications`, `views/hours/JournalPointages`, `views/users/UserServices`.
- **Bugs** : aucun.
- **Cible React** :
  - `src/features/hours/hooks/useServiceHistoryDialog.ts` : petit store de module `{ isOpen, serviceUuid }` + `useSyncExternalStore` (Zustand est réservé à auth).
  - `src/features/hours/api/useServiceModifications.ts` = `useQuery(['services', uuid, 'modifications'], { enabled: !!uuid })`.
  - `reload` → `invalidateQueries` ; `retry` → `refetch`.

### composables/useSignatureReminder.ts (57 l.)
- **API** : `useSignatureReminder() → { showSignatureReminder, heuresLastMonth, checkSignature(force=false), markSigned(), reset() }`.
  - Affiche si `summary.needsToSign && heuresLastMonth > 0`.
- **Points notables** : singleton de module, flag `alreadyChecked`.
- **Utilisé par** : App.
- **Bugs** : L20-36, une réponse arrivée après `reset()` (logout) peut remettre `show=true`. Masqué ensuite par `showNavbar`, mais l'état est incohérent.
- **Cible React** : `src/features/signatures/api/useSignatureSummary.ts` = `useQuery(['signatures', 'last-summary'], { enabled: isAuthenticated && isActive && isEmailVerified, staleTime: Infinity })`.
  - `show` est dérivé des données.
  - `markSigned` → `setQueryData` ou `invalidate`.

### composables/useTheme.ts (92 l.)
- **API** : `useTheme() → { theme: 'light'|'dark'|'system', isDark, setTheme(t), toggleTheme() }`.
  - État global de module ; `initialize()` au premier `onMounted` d'un consommateur.
  - Écoute `matchMedia` (jamais retirée).
- **Dépendances** : localStorage `theme-preference`, `<html>.dark`, script anti-FOUC d'index.html (ignore `/`), `Landing.vue` (force le clair et restaure en sortie).
- **Utilisé par** : Navbar, AppSidebar (mort).
- **Bugs** : L66-70, chaque appel ajoute un `watch` qui réécrit localStorage (N consommateurs = N écritures).
- **Cible React** : `src/providers/ThemeProvider.tsx` + hook `useTheme` (contexte ; même clé et mêmes valeurs ; `system` suivi via `matchMedia`). Prévoir une exception pour `/` (thème clair forcé par Landing) et garder le script d'index.html.

### composables/useUserHours.ts (138 l.)
- **API** : `useUserHours(userUuid)` : heures, modal, périodes.
- **Utilisé par** : **personne**. Code mort.
- **Cible React** : ne pas migrer.

### composables/useUserServices.ts (584 l.)
- **API** : `useUserServices(userUuidSource: MaybeRefOrGetter<string>)` renvoie :
  - État : `services`, `loading`, `error`, `userName`, `userData`, `userStatus`, `activeServiceStart`, `activeServiceUuid`, `actionLoading`, `showFilters`, `searchFilters`, `pagination`.
  - Computed : `hasActiveFilters`, `servicesByDay` (regroupement par jour local, pauses de nuit rattachées au service qui les englobe, libellés « Le lendemain », total en secondes).
  - Méthodes : `loadUserData`, `loadUserStatus`, `loadServices(page)`, `applyFilters`, `clearFilters`, `resetFilters`, `goToPage`, `startService`, `endService`, `startBreak`, `endBreak`, `deleteService`, `createService(form)`, `updateService(uuid, form)`, `getStatusClass`, `getStatusText`, `hasLocationData`, `hasValidLocation`, `hasValidEndLocation`, `isLocationInvalid`.
  - Exports : `typeFilterOptions`, interfaces `ServiceFilters`, `Pagination`, `ServiceFormData`, `UserData`.
- **Dépendances** : `userServicesService`, `usersService`, `useServiceHistory().reload`.
- **Utilisé par** : `views/users/UserServices.vue`. Pointage.vue redéfinit son propre `typeFilterOptions`.
- **Bugs / incohérences** :
  - L314 : `last` vaut `false` quand `totalPages=0`.
  - L353 contre L454 : horodatages en UTC ISO (start/end) contre heures locales naïves `YYYY-MM-DDTHH:mm:00` (create/update).
  - L394-411 : `startBreak` crée un service puis relit « le service actif » pour le passer en pause. Opération non atomique (course), alors que `createService` accepte `isBreak`.
  - L206 : un total négatif donne un affichage aberrant.
  - L456 : `latitude: 0 || undefined` supprime le 0 (probablement voulu).
- **Cible React** :
  - `src/features/users/api/useUserServicesQueries.ts` : `useUser(uuid)`, `useActiveService(uuid)`, `useServicesSearch(uuid, filters, page)` ; mutations start, end, break, delete, create, update qui invalident les clés et `['services', uuid, 'modifications']`.
  - `src/features/users/lib/groupServicesByDay.ts` (pur).
  - `src/features/users/lib/serviceLocation.ts`.
  - Filtres en `useState` ou dans l'URL (`useSearchParams`).

### composables/useVersionCheck.ts (228 l.)
- **API** : `useVersionCheck() → { appVersion, newVersionAvailable, newVersion, checkForUpdate(), performUpdate(), dismissUpdate() }`.
  - `start(router)` n'est appelé qu'en PROD.
  - Écoute `visibilitychange`, `focus`, `online`, `pageshow` (bfcache), `router.afterEach`, et un `setInterval` de 5 min. Au moins 1 min entre deux vérifications ; dédoublonnage `inFlight`.
  - Au chargement initial : rechargement silencieux une fois par version (sessionStorage `version_check_reloaded_for`), après vidage de la Cache API.
  - Ensuite : bandeau ; `dismissUpdate` → `version_check_dismissed`.
  - Nettoie les anciennes clés `app_version` (localStorage) et `dismissed_update_version` (sessionStorage).
- **Points notables** : singleton de module, `fetch('/version.json')` sans cache.
- **Utilisé par** : App.
- **Cible React** : `src/hooks/useVersionCheck.ts` (état de module + `useSyncExternalStore`). `afterEach` → `router.subscribe()` du data router. Les gardes `started`/`stop` rendent StrictMode sans risque.

---

## Composants maison de `components/ui` (à sortir de `ui/`)

### components/ui/select/Select.vue (469 l.) + index.ts (2 l.)
C'est un **composant maison, pas le Select de shadcn-vue** : aucun reka-ui, uniquement `<button>`, `<Teleport>` et une liste ARIA.

**API exacte :**
- **Props** :

| Prop | Type | Défaut |
|---|---|---|
| `modelValue?` | `string` | — |
| `label?` | `string` | — |
| `options` | `{ value: string; label: string; disabled?: boolean }[]` | — |
| `placeholder` | `string` | `''` (affiche « Sélectionner... » si vide) |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` (astérisque seulement) |
| `error?` | `string` | — |
| `hint?` | `string` | — |
| `searchable` | `boolean` | **`true`** |
| `searchPlaceholder` | `string` | `'Rechercher...'` |
| `noResultsText` | `string` | `'Aucun résultat'` |
| `clearable` | `boolean` | `false` |
| `class?` | `string` | — |
| `id?` | `string` | — |
| `teleport` | `boolean \| string` | `true` (`false` = position absolue, pour les dialogs) |

- **Emits** : uniquement `'update:modelValue' [string]` ; `''` quand on efface.
- **Recherche** : sous-chaîne sur `label`, insensible à la casse, `trim` ; **sensible aux accents**. Remise à zéro à la fermeture et à chaque changement d'identité de `options`.
- **Absent** : pas de multi-sélection, pas de groupes, pas de chargement asynchrone, pas de slot de rendu, pas de `name` pour un formulaire natif, valeurs `string` uniquement.
- **Clavier** :
  - Sur le déclencheur : Enter, Espace, ↑, ↓ ouvrent ; Échap ferme.
  - Dans la liste : ↑/↓ cyclent, Home/End, Enter sélectionne, Échap et Tab ferment.
  - Une option désactivée peut être surlignée mais pas sélectionnée.
- **Position** : `fixed` z-9999, calculée depuis le déclencheur ; bascule au-dessus s'il reste moins de 300 px en dessous ; recalcul au scroll (capture) et au resize. Clic extérieur via un listener `document` en capture.
- **Divers** : `data-floating-content` (liste blanche de DialogContent), `@pointerdown.stop`, bouton « Effacer la sélection » en pied si `clearable` et une valeur est présente.
- **Utilisé par** (20 fichiers) : `components/absences/AbsenceEditModal`, `acomptes/AcompteEditModal`, `cartes/CarteEditModal`, `couchettes/CouchetteCreateModal`, `maintenance/ConfigEntretienModal`, `myabsences/MyAbsenceEditModal`, `todos/TodoEditModal`, `ui/search-filters/SearchFilters`, `users/UserEditModal`, `vehicles/VehiculeInfoCard` ; `views/common/Profile`, `hours/ContractHours`, `hours/Pointage`, `maintenance/Entretiens`, `maintenance/EntretiensVehicule`, `maintenance/TypesEntretien`, `myabsences/MyAbsences`, `stock/StockItems`, `users/UserServices`, `vehicles/Vehicules`. `:teleport="false"` apparaît 9 fois.
- **Bugs** :
  - L310-313 : un parent qui passe un tableau `.map()` inline (SearchFilters:131) réinitialise la recherche à chaque re-rendu.
  - L99-100 : `window.innerHeight` n'est pas réactif (compensé par les listeners).
- **Cible React** : `src/components/shared/SearchableSelect.tsx` (shadcn `popover` + `command`, pattern Combobox) avec les mêmes props ; `value`/`onValueChange` remplacent le v-model.
  - Filtre cmdk personnalisé en sous-chaîne sur le label ; normaliser les accents si souhaité.
  - La prop `teleport` disparaît : les couches Radix s'imbriquent correctement dans un Dialog.
  - Quand `searchable=false`, on peut utiliser le `select` shadcn.

### components/ui/input-field/InputField.vue (132 l.) + index.ts
- **API** :
  - Props : `modelValue?: string|number`, `label?`, `type` (`'text'`), `placeholder?`, `disabled`, `required` (visuel), `error?`, `hint?`, `icon?: Component` (Lucide), `autocomplete?`, `showPasswordToggle` (`false`), `class?`.
  - Emits : `update:modelValue`, `blur`, `focus`.
- **Dépendances** : `useVModel` (@vueuse), Input, Label, Button (`size="icon-sm"`).
- **Utilisé par** : ProfileCompletionDialog, `components/users/UserEditModal`, `components/users/UserEmailModal`, `views/auth/ForgotPassword`, `GoogleRegister`, `Login`, `Register`, `ResetPassword`.
- **Bugs** :
  - L59-69 : le Label n'est pas relié à l'input (pas de `id`/`for`).
  - Les attributs hors props (id, name, maxlength…) tombent sur le `div` racine (`inheritAttrs`). Aucun appelant n'en passe aujourd'hui.
- **Cible React** : `src/components/shared/InputField.tsx`, avec `useId` pour relier label et input, `...inputProps` transmis à l'`<Input>` ; à combiner avec `form` shadcn (FormField, FormMessage) pour react-hook-form.

### components/ui/address-autocomplete/AddressAutocomplete.vue (201 l.) + index.ts
- **API** :
  - Props : `modelValue?` (rue), `label?`, `placeholder?`, `disabled`, `required`, `error?`, `hint?`, `icon?`, `limit` (8), `class?`.
  - Emits : `update:modelValue`, `select(AddressDTO { street, city, postalCode, country: 'France' })`.
  - Recherche après 3 caractères, debounce 250 ms ; ↑/↓/Enter/Échap ; sélection au `mousedown`.
- **Dépendances** : `useVModel`, `useDebounceFn`, `onClickOutside` (@vueuse), `geocodingService.search`.
- **Utilisé par** : ProfileCompletionDialog, `components/users/UserEditModal`.
- **Bugs** :
  - L61-71 : pas de `catch` (rejet non géré) et pas de protection contre l'ordre d'arrivée des réponses.
  - L73-77 et L89-91 : si la rue sélectionnée est identique à la valeur courante, le watch ne se déclenche pas et `justSelected` reste vrai. La frappe suivante est ignorée.
  - Label non relié à l'input.
- **Cible React** : `src/components/shared/AddressAutocomplete.tsx`, avec `src/hooks/useDebouncedValue.ts` + `useQuery(['geocoding', q], { enabled: q.length >= 3 })` (règle l'ordre des réponses) + Popover/Command.

### components/ui/changelog/ChangelogDialog.vue (102 l.) + index.ts
- **API** :
  - Props : `open`, `entry: ChangelogEntry|null`.
  - Emits : `update:open`, `close`.
  - Badges : feature → default « Nouveau », fix → destructive « Correction », improvement → outline vert « Amélioration ».
- **Utilisé par** : App.
- **Bugs** :
  - L62-65 et L98-101 : seul le bouton « Fermer » émet `close`.
  - L7 : affiche « Nouveautés v » quand `entry` est null.
- **Cible React** : `src/features/changelog/components/ChangelogDialog.tsx` ; `markAsSeen` dans `onOpenChange(false)`.

### components/ui/context-menu-popover/ContextMenuPopover.vue (60 l.), ContextMenuItem.vue (27 l.), ContextMenuSeparator.vue (3 l.), index.ts (3 l.)
- **API** :
  - Popover : props `show`, `x`, `y`, `title?` ; slot `header` + défaut ; emit `close` ; expose `menuElement`. Téléporté, fixed z-50, clic extérieur via `document`.
  - Item : props `disabled?`, `destructive?` ; slot `icon` + défaut ; emit `click`.
- **Utilisé par** : les 7 vues listées pour `useContextMenu`.
- **Bugs** : pas de navigation clavier.
- **Cible React** : shadcn `context-menu` (ui). Ces trois fichiers ne sont pas portés.

### components/ui/file-card/FileCard.vue (111 l.) + index.ts
- **API** :
  - Props : `file: FileData`, `deletable` (`false`), `showInfo` (`true`).
  - Emits : `view-image(url)`, `view-pdf(file)`, `download(file)`, `delete(fileId)`.
  - Rendu selon le type : image, PdfPreview (largeur 250), Word, Excel, générique.
- **Utilisé par** : `components/vehicles/VehiculeFileCard`, `views/maintenance/Entretiens`, `views/maintenance/EntretiensVehicule`.
- **Cible React** : `src/components/shared/FileCard.tsx`.

### components/ui/file-dropzone/FileDropzone.vue (164 l.) + index.ts
- **API** :
  - Props : `accept` (`'image/*,.pdf,.doc,.docx,.xls,.xlsx'`), `multiple` (`true`), `disabled`, `uploading`, `uploadProgress`, `uploadCurrentFile`, `uploadTotalFiles`, `uploadCurrentIndex`, `placeholderTitle`, `placeholderSubtitle`, `hint`, `maxFileSize?`, `compact`.
  - Emits : `files-selected(FileList)`, `error(msg)`.
  - Expose `triggerFileInput()`.
- **Utilisé par** : `components/app-versions/AppVersionCreateModal`, `components/vehicles/VehiculeFilesTab` (relais vers `views/vehicles/VehiculeDetail`), `views/common/Profile`, `views/maintenance/Entretiens`, `views/maintenance/EntretiensVehicule`.
- **Bugs** :
  - L159 : l'input est vidé juste après l'émission de la `FileList`. Les appelants actuels copient la liste de façon synchrone, donc c'est sans effet aujourd'hui, mais fragile.
  - `div` cliquable non accessible au clavier.
  - `uploading` ne bloque pas le clic.
  - Accents manquants (L97, L130).
- **Cible React** : `src/components/shared/FileDropzone.tsx`, qui émet un `File[]` ; `ref` React 19 + `useImperativeHandle` pour `triggerFileInput`.

### components/ui/image-lightbox/ImageLightbox.vue (305 l.) + index.ts
- **API** :
  - Props : `open`, `src` (`''`), `images: string[]` (`[]`), `initialIndex` (0), `alt`.
  - Emit : `update:open`.
  - Zoom 0,5 à 5 (molette et boutons) ; swipe horizontal pour naviguer, vers le bas pour fermer ; ←/→ ; Échap intercepté en capture pour passer avant le Dialog ; téléchargement via fetch + blob, sinon `window.open`.
  - z-[200].
- **Utilisé par** : `views/maintenance/Entretiens`, `EntretiensVehicule`, `views/vehicles/VehiculeDetail`.
- **Bugs** :
  - Listener `keydown` global permanent, un par instance.
  - Pas de blocage du scroll du body.
  - Libellés sans accents.
- **Cible React** : `src/components/shared/ImageLightbox.tsx` (plus de 250 lignes : sortir `useSwipe` et `useZoom` dans `src/hooks/`).

### components/ui/messages/Messages.vue (281 l.) + index.ts
- **API** : aucune prop. Expose `addMessage(config)` (même `id` = mise à jour sur place, animation relancée via `seq`), `removeMessage(id)`, `clearAll()`.
  - Variantes primary, success, warning, danger, info (icônes Lucide).
  - Barre de progression, bouton « Tout fermer » s'il y a plus d'un message, z-[1070], `top-16`.
- **Utilisé par** : App.
- **Cible React** : `<Toaster position="top-right" richColors closeButton offset={64} />` sonner dans `src/providers/AppProviders.tsx`. Le composant n'est pas porté ; la barre de progression est abandonnée.

### components/ui/navbar/Navbar.vue (448 l.) + index.ts
- **API** :
  - Props : `userName?`, `userEmail?`, `userInitials?`, `userImage?`, `showViewModeToggle`, `isViewingAsUser`, `hasUnseenChanges`.
  - Emits : `logout`, `toggle-view-mode`, `show-changelog`.
  - Logo vers la route par défaut ; liens principaux filtrés (`canAccess` + `requiredEmails`) avec un calcul responsive heuristique (ResizeObserver, `matchMedia` < 640, `CHAR_WIDTH=7.5`) ; badge « Utilisateurs » = `pendingCount`.
  - Menu avatar : profil, thème, vue admin/utilisateur, nouveautés, installer l'app, déconnexion, version.
  - Sheet de droite : sections de navigation, Notifications mobiles, pied de page compact. Le Sheet se ferme au changement de route et à l'ouverture de l'historique de service.
- **Dépendances** : store, `usePermissions`, `useTheme`, `usePendingUsers`, `useServiceHistory`, navConfig, `APP_VERSION`, `assets/favicon.png`, shadcn Button, Sheet, Avatar, DropdownMenu, Notifications.
- **Utilisé par** : App.
- **Bugs** :
  - L43 et L143 : Notifications monté deux fois (cf. constats majeurs).
  - L25 et L158 : modificateurs `!` (important), contraires à CLAUDE.md.
  - L301-305 : `getDefaultRoute` dupliqué.
- **Cible React** (plus de 250 lignes, à découper) :
  - `src/components/layout/Navbar.tsx`.
  - `NavbarLinks.tsx` avec `src/hooks/useElementWidth.ts` et `src/hooks/useMediaQuery.ts`.
  - `UserMenu.tsx`.
  - `MobileNavSheet.tsx`.
  - `src/lib/filterNav.ts` (filtrage partagé).

### components/ui/notifications/Notifications.vue (550 l.) + index.ts
- **Rôle** : cloche, compteur et liste déroulante téléportée (420 px, z-50) avec chargement, erreur et liste vide.
  - Au clic : marque lu puis navigue selon `refType` (entretien → `/entretiens` ; vehicule → `/vehicules/:refId` ; absence, acompte, user, todo, carte_expiration → leurs listes ; `service_modification` → `openServiceHistory(refId)` pour un admin, sinon `/notifications`).
  - « Tout lu », « Voir tout », bouton son (localStorage `notifications_sound_enabled`).
  - Son `/sounds/notif.wav` quand le nombre de non-lus augmente.
  - Titre `(n) …` et badge favicon.
  - **Polling `setInterval` toutes les 5 s**, même onglet masqué.
- **API** : aucune prop, aucun emit.
- **Dépendances** : `notificationsService` (`getUnreadNotifications`, `markAsRead`, `markAllAsRead`), store, `getFaviconBadgeInstance`, `useServiceHistory`, router, Audio, `document.title`, listeners `click` et `resize`.
- **Utilisé par** : Navbar (deux fois), AppSidebar (mort). `views/common/Notifications.vue` (hors périmètre) duplique la logique du son.
- **Bugs** :
  - Double instance.
  - L30 : z-50 sous l'overlay du Sheet (z-[1040]) sur mobile.
  - L496 : sélecteur global `.fixed.z-50.w-\[420px\]` fragile.
  - L213-228 et L537-549 : titre et badge écrasés au démontage de l'instance du Sheet ; conflit avec `usePageMeta`.
  - L507 : polling non suspendu quand l'onglet est masqué.
  - L282-284 : une erreur non réseau remet le compteur à 0 toutes les 5 s.
- **Cible React** (plus de 250 lignes, à découper) :
  - `src/features/notifications/api/useUnreadNotifications.ts` (`useQuery`, `refetchInterval: 5000`, `refetchIntervalInBackground: false`) ; `useMarkNotificationRead.ts` et `useMarkAllRead.ts` (mutations).
  - `src/features/notifications/hooks/useNotificationSideEffects.ts` (titre, favicon, son), **monté une seule fois** dans AppLayout.
  - `src/features/notifications/components/NotificationsPopover.tsx` (shadcn `popover`) et `NotificationItem.tsx`.
  - `src/features/notifications/lib/notificationRefs.ts` (refType → icône, libellé, route).

### components/ui/pdf-preview/PdfPreview.vue (73 l.) + index.ts
- **API** : props `base64?`, `url?`, `width` (200), `alt`, `class?`. États chargement, image, fallback « PDF ».
- **Utilisé par** : FileCard.
- **Bugs** :
  - L30-32 : `width` n'est pas transmis à la génération (toujours 200 px, flou à 250).
  - Pas de protection contre un résultat périmé.
- **Cible React** : `src/components/shared/PdfPreview.tsx` avec `usePdfPreview` (useQuery).

### components/ui/profile-completion/ProfileCompletionDialog.vue (193 l.) + index.ts
- **API** : prop `open` ; emit `update:open`.
  - Champs permis et/ou adresse selon ce qui manque (AddressAutocomplete remplit ville, CP, pays).
  - `profileService.updateProfile`, puis `authStore.refreshUser()`, puis toast.
  - Pas de fermeture pendant l'enregistrement.
- **Utilisé par** : App.
- **Bugs** : L151-182, aucune validation : des valeurs vides peuvent être enregistrées et le dialog réapparaît au chargement suivant.
- **Cible React** : `src/features/profile/components/ProfileCompletionDialog.tsx` (react-hook-form + schéma zod, mutation `useUpdateProfile` dans `features/profile/api`).

### components/ui/retour/Retour.vue (47 l.) + index.ts
- **API** : props `fallback` (`'/'`), `size` (`'sm'|'default'|'lg'|'icon'`), `class?` ; emit `click`. `history.state.position > 0` → `router.back()`, sinon `push(fallback)`.
- **Utilisé par** : `views/hours/Pointage`, `absences/AbsenceTypes`, `acomptes/MyAcomptes`, `couchettes/MesCouchettes`, `myabsences/MyAbsences`.
- **Incohérence** : 4 pages utilisent `fallback="/"`, ce qui renvoie une personne connectée vers la Landing publique.
- **Cible React** : `src/components/shared/BackButton.tsx`. `window.history.state?.idx > 0` (clé de React Router) → `navigate(-1)`, sinon `navigate(fallback ?? getDefaultRoute())`.

### components/ui/search-filters/SearchFilters.vue (196 l.) + index.ts (2 l.)
- **API** :
  - Props : `modelValue: Record<string, unknown>`, `filters: FilterConfig[]` (`{ key, label, type: 'select'|'date'|'text'|'number'|'checkbox', placeholder?, options?: { value: string|number, label }[], fullWidth?, checkboxLabel?, min?, max? }`), `loading`, `columns` (4), `defaultExpanded`, `hint`.
  - Emits : `update:modelValue`, `search`, `reset`.
  - Slot `count`. Expose `toggleFilters`, `showFilters`. Select recherchable si plus de 5 options.
- **Utilisé par** : `views/absences/Absences`, `acomptes/Acomptes`, `couchettes/Couchettes`, `hours/JournalPointages`, `maintenance/Entretiens`, `maintenance/EntretiensVehicule`.
- **Bugs** :
  - L130, 143, 152, 163 : `String(v || '')` fait disparaître `0`.
  - L135 : les valeurs numériques des selects reviennent en `string`.
  - L115 : `!` important.
- **Cible React** : `src/components/shared/SearchFilters.tsx`, contrôlé (`value`/`onChange`).

### components/ui/signature-pad/SignaturePad.vue (182 l.) + index.ts
- **API** : props `disabled`, `strokeColor` (`#111827`), `lineWidth` (2.5). Expose `clear()`, `toDataURL(): string|null` (PNG sur fond blanc), `isEmpty`. Pointer events avec capture, prise en compte du DPR, ResizeObserver qui conserve le tracé.
- **Utilisé par** : `components/signatures/SignatureReminderDialog`.
- **Bugs** : L70 mesure le conteneur, bordure de 2 px incluse, au lieu du canvas. Légère déformation verticale (~2 %).
- **Cible React** : `src/components/shared/SignaturePad.tsx` (prop `ref` React 19 + `useImperativeHandle`).

### components/ui/update-banner/UpdateBanner.vue (69 l.) + index.ts
- **API** : props `show`, `version: string|null` ; emits `update`, `later`. Téléporté, fixed top z-50 ; `isUpdating` n'est jamais remis à false (normal, la page recharge).
- **Utilisé par** : App.
- **Cible React** : `src/components/layout/UpdateBanner.tsx`.

## Layout et sidebar

### components/layout/AppSidebar.vue (247 l.)
- **Utilisé par** : **personne** (grep « AppSidebar » ne trouve que son propre fichier). De plus, `SidebarProvider` n'est jamais monté : `useSidebar()` lèverait une exception.
- **Cible React** : **mort, ne pas migrer**.

### components/ui/sidebar/* (18 fichiers, 582 l.)
- Fichiers : Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger, index.ts, utils.ts (`provideSidebar` / `useSidebar`, `useMediaQuery`, localStorage `sidebar:state`, raccourci Ctrl+B).
- **Utilisé par** : AppSidebar uniquement (mort).
- **Points notables** : syntaxe Tailwind v3 (`w-[--sidebar-width]`, `theme(spacing.4)`), incorrecte en v4.
- **Cible React** : **mort, ne pas ajouter** `sidebar`.

## CSS

### src/styles/tailwind.css (214 l.)
- **Rôle** : `@import tailwindcss`, `tw-animate-css`, `@custom-variant dark`, `@theme` (couleurs mappées sur les variables), palette violette oklch pour le clair et le sombre.
  - Tokens personnalisés : `--destructive-foreground`, `--success(-foreground)`, `--warning(-foreground)`, `--info(-foreground)`, `--radius: 0.625rem`.
  - Base : bordures, `outline-ring/50`, `body` (fond, texte, padding safe-area), `cursor: pointer` sur `button:not(:disabled)`, `[role=button]` et les `label` contenant une case ou un radio ; `not-allowed` sur les désactivés ; correctif de largeur pour les inputs date/time (iOS).
- **Utilisation réelle** :
  - `success`/`warning`/`info` utilisés (~33 occurrences, par exemple `text-warning`, `bg-success/10`).
  - `destructive-foreground` utilisé (Navbar, Notifications).
  - Tokens `sidebar-*` : seulement par la sidebar morte.
  - Tokens `chart-*` : inutilisés aujourd'hui (utiles au composant chart shadcn).
  - Règles `::view-transition-*` (L201-214) : **mortes**, aucun `startViewTransition`.
- **Cible React** : fusionner dans `src/index.css` après `shadcn init` : palette, tokens personnalisés, règles de base, `@custom-variant dark`.

### src/styles/theme.css (203 l.)
- **Rôle** : variables legacy : couleurs `-hover/-light/-dark/-rgb/-bg`, danger, gris, bg/text/border, espacements, polices, tailles, graisses, interlignes, transitions, z-index. Plus des styles globaux : lissage des polices sur `html`, scrollbar WebKit, `::selection`.
- **Utilisation réelle** :
  - Variables consommées uniquement par `views/users/UserEdit.vue` (31 références, qui utilise aussi des variables **inexistantes** : `--bg-primary`, `--text-secondary`, `--primary-alpha`, `--error`, `--transition-normal`, `--text-sm`… donc styles cassés).
  - Également référencées par deux fichiers morts : `views/users/UserServices.styles.css` (957 l., importé nulle part) et `views/users/UserServices.vue.b` (2977 l., sauvegarde).
- **Effets globaux encore actifs** (déclarations non placées dans un layer, qui l'emportent sur `@layer theme` de Tailwind v4) :
  - `--font-sans` et `--font-mono` (L129-130) : **la police réelle de l'app** (pile système sans polices emoji).
  - `--color-gray-50…900`, `--color-white`, `--color-black` : palette hex v3 à la place d'oklch (7 utilitaires gray, tous dans Landing.vue).
  - `--shadow-*` : probablement sans effet (v4 recopie directement les valeurs d'ombre dans les utilitaires).
- **Bugs** : scrollbar (L186-197) et `::selection` (L200-203) sans variante sombre : piste claire et texte `#111827` en mode sombre.
- **Cible React** : ne pas porter. Si l'on veut garder le rendu actuel, reporter uniquement `--font-sans` (dans `@theme`), le lissage des polices et une scrollbar adaptée au thème dans `index.css`.

### src/style.css (6 l.)
- **Rôle** : restes du template Vite (`#app { max-width: 1280px; padding: 2rem; text-align: center }`).
- **Utilisé par** : **personne** (non importé).
- **Cible React** : supprimer.

---

## 1. Personnalisations des composants shadcn-vue à reporter après `npx shadcn add`

1. **button**
   - Ajout de `cursor-pointer` dans la classe de base (redondant avec la règle de base de `tailwind.css`, à garder dans l'une ou l'autre).
   - Tailles `icon-sm` (size-8) et `icon-lg` (size-10) : déjà présentes dans le shadcn v4 récent, à vérifier dans le fichier généré. `icon-sm` est très utilisé (~110 occurrences).
2. **badge**
   - **Variante `warning` ajoutée** : `"border-transparent bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 [a&]:hover:bg-orange-200"` (utilisée par Cartes.vue:435).
   - Forme `rounded-full` : comparer avec la version générée, qui peut être `rounded-md`.
3. **dialog**
   - Overlay `bg-black/80` au lieu de `/50`.
   - `DialogContent` : on ne ferme **que** sur un clic sur l'overlay (`pointer-down-outside` et `interact-outside` font `preventDefault` si la cible n'est pas l'overlay) ; liste blanche `[data-floating-content]` ; `focus-outside` toujours bloqué.
   - En React : `onInteractOutside` qui ignore `[data-sonner-toaster]`, la lightbox (z-[200]) et tout portail maison restant. Sinon un clic sur un toast ferme la modale.
   - Prop `showCloseButton` (existe en v4 React) utilisée par SignatureReminderDialog et Pointage.
4. **dialog / DialogScrollContent** : spécifique à Vue et inutilisé. Ne pas porter.
5. **sheet**
   - `SheetContent` en `z-[1050]` (sans `gap-4`) ; `SheetOverlay` en `z-[1040] bg-black/80` (standard : z-50 et `/50`).
   - Définir une échelle de z-index cohérente : toasts au-dessus du sheet, popovers ouverts depuis le sheet au-dessus de l'overlay.
6. **dropdown-menu** : `cursor-pointer` au lieu de `cursor-default` sur Item, CheckboxItem, RadioItem et SubTrigger. Seuls Root, Trigger, Content, Item, Label, Separator et Group sont utilisés.
7. **tabs** : `cursor-pointer` ajouté sur `TabsTrigger`.
8. **skeleton** : `bg-primary/10` (teinte violette) au lieu de `bg-accent`.
9. **table**
   - Conteneur en `overflow-auto` (standard : `overflow-x-auto`).
   - `TableEmpty` (propre à Vue, prop `colspan`) et `table/utils.ts` (`valueUpdater`, vue-table) sont **inutilisés**. À recréer seulement si le pattern data-table en a besoin (`components/shared/DataTableEmpty.tsx`).
10. **checkbox** : l'API `checked`/`update:checked` est un contournement propre à reka-ui ; Radix React a `checked`/`onCheckedChange` nativement. Il manque `dark:bg-input/30` dans la version Vue : la version générée est correcte.
11. **alert-dialog** (overlay `/80`) : inutilisé, rien à reporter.
12. **input, textarea, label, separator, avatar, tooltip** : standard. `tooltip` n'est utilisé que dans UserServices.vue et `separator` que dans Planning.vue.
13. **Global** : tokens `--destructive-foreground`, `success`, `warning`, `info` et les règles `@layer base` de `tailwind.css` (cf. section CSS). `components.json` : new-york, baseColor neutral, icônes lucide.

## 2. Icônes FontAwesome : enregistrées contre réellement utilisées

- **103 enregistrées** (101 solid + android et apple).
- **13 utilisées** via `<font-awesome-icon>`, dans 8 fichiers : Login, Register, ForgotPassword, Verify, ResetPassword, GoogleRegister, Entretiens, EntretiensVehicule.
- **9 utilisées mais non enregistrées**, donc rien ne s'affiche (bug).

| Icône FA | Où | Enregistrée ? | lucide-react proposé |
|---|---|---|---|
| exclamation-circle | Login:12, Register:75, ForgotPassword:23, ResetPassword:27, GoogleRegister:43 | oui | `CircleAlert` |
| key | Login:69 | oui | `KeyRound` |
| check-circle | Register:16, ForgotPassword:15, Verify:18, ResetPassword:15 | oui | `CircleCheck` |
| envelope | Register:25 | oui | `Mail` |
| mouse-pointer | Register:38 | oui | `MousePointerClick` |
| user-shield | Register:51, Verify:25, GoogleRegister:7 | oui | `ShieldUser` (ou `ShieldCheck`) |
| info-circle | Register:62, GoogleRegister:12 | oui | `Info` |
| arrow-left | ForgotPassword:51, ResetPassword:74 | oui | `ArrowLeft` |
| spinner (`spin`) | Verify:7 | oui | `LoaderCircle` + `animate-spin` |
| clock | Verify:39, ResetPassword:20 | oui | `Clock` |
| times-circle | Verify:53 | oui | `CircleX` |
| exclamation-triangle | ResetPassword:32 | oui | `TriangleAlert` |
| file | Entretiens:1898/1903, EntretiensVehicule:1473/1483 (`getFileIcon`) | oui | `File` |
| file-image | idem | **non** | `FileImage` |
| file-pdf | idem | **non** | `FileText` |
| file-word | idem | **non** | `FileText` |
| file-excel | idem | **non** | `FileSpreadsheet` |
| file-powerpoint | EntretiensVehicule:1478 | **non** | `Presentation` |
| file-video | EntretiensVehicule:1479 | **non** | `FileVideo` |
| file-audio | EntretiensVehicule:1480 | **non** | `FileAudio` |
| file-archive | EntretiensVehicule:1481 | **non** | `FileArchive` |
| file-alt | EntretiensVehicule:1482 | **non** | `FileText` |

- **Recommandation** : mutualiser `getFileIcon` dans `src/utils/fileIcons.ts` (en s'appuyant sur `getFileTypeCategory` de `fileUtils`).
- Les icônes FA de `useBrowserDetection` (globe, compass, fire, window-maximize, mobile-alt, question-circle) ne sont jamais rendues.
- **Les 90 autres icônes enregistrées sont inutilisées**, dont android et apple.

## 3. Code mort

- **Composants**
  - `components/layout/AppSidebar.vue` et `components/ui/sidebar/*` (18 fichiers).
  - `components/ui/alert-dialog/*` (10 fichiers, 0 import).
  - `dialog/DialogScrollContent.vue` ; wrappers `DialogTrigger` et `DialogClose` (aucun usage hors `ui`).
  - `table/TableEmpty.vue`, `TableCaption.vue`, `TableFooter.vue`, `table/utils.ts`.
  - Dans `dropdown-menu` : CheckboxItem, RadioGroup, RadioItem, Shortcut, Sub, SubContent, SubTrigger, et la réexportation de `DropdownMenuPortal`.
- **Composables**
  - `useUserHours.ts` (entier).
  - `clearPreviewCache`, `getCurrentCount` (favicon), `isMobileDevice` et le champ `icon` (useBrowserDetection).
  - Dans `usePermissions`, tout sauf `canAccess`, `canToggleViewMode` et `toggleViewMode` n'est pas utilisé à l'extérieur.
- **Store** : `ROLE_UUIDS`, `isUser`, `loading`/`error` (non lus à l'extérieur).
- **Configuration**
  - `config/icons.ts` (90 des 103 icônes), `config/api.ts` `isAuthenticated()`.
  - `config/map.ts` : `MAPBOX_STYLE*`, `DEFAULT_CENTER`, `DEFAULT_ZOOM`.
  - `navConfig` : `fullNavLinks` et `NavLinkConfig.icon`.
- **Types, enums, utils**
  - `types/api.ts` : `isErrorResponse`, `isPagedResponse`, `DateRange`.
  - Enums : `USER_ROLE_COLORS`, `UserRoleLabels`, `PeriodiciteTypeLabels`.
  - `timeFormatters.toISOStringWithTimezone`.
- **CSS**
  - `src/style.css`.
  - Règles view-transition et tokens `sidebar-*` de `tailwind.css`.
  - Quasi tout `theme.css` (seul UserEdit.vue l'utilise).
  - Fichiers morts hors périmètre repérés : `views/users/UserServices.styles.css` et `views/users/UserServices.vue.b`.
- **Dépendances et assets** : `radix-vue` (0 import) ; `@tanstack/vue-table` (seulement le `table/utils.ts` mort) ; `public/sounds/notif.aiff`, `notif.flac`, `notif_converted.wav` (seul `notif.wav` est joué).

## 4. Bugs suspectés (fichier:ligne, description, impact)

1. **App.vue:76** : noms de routes minuscules ou kebab-case dans `pagesWithoutNavbar`. Navbar, polling des notifications et dialogs globaux sur 7 pages publiques pour une personne connectée ; sur `/unauthorized`, le polling d'un compte inactif provoque un 401, donc un logout et une redirection vers /login.
2. **App.vue:102-116 et 161-165** : `route.name` indéfini au montage et aucune réévaluation après login. Le changelog et la complétion de profil apparaissent sur Landing, `/download` et 404, mais jamais juste après une connexion.
3. **App.vue:154 et ChangelogDialog.vue:62-65** : fermer par l'overlay, Échap ou la croix ne marque pas le changelog comme vu. Il réapparaît à chaque chargement.
4. **ChangelogDialog.vue:7** : titre « Nouveautés v » quand `entry` est null. Cosmétique.
5. **App.vue:125** : `id="app"` dupliqué. HTML invalide.
6. **Navbar.vue:43 et 143** : double instance de Notifications. Double requête toutes les 5 s, double son, badge et titre qui clignotent à la fermeture du Sheet.
7. **Notifications.vue:30** : liste déroulante z-50 sous l'overlay du Sheet (z-1040) et pointer-down hors du SheetContent. Notifications probablement inutilisables depuis le menu mobile (à confirmer).
8. **Notifications.vue:496** : sélecteur global fragile pour le clic extérieur. Mauvais élément visé avec 2 instances.
9. **Notifications.vue:213-228 et 528** : titre du document réécrit toutes les 5 s. Écrase les titres posés par `usePageMeta`.
10. **Notifications.vue:507** : polling continu même onglet masqué, sans backoff. Charge réseau et batterie.
11. **usePdfPreview.ts:21** : clé de cache sur les 100 premiers caractères base64. Mauvais aperçu PDF possible.
12. **usePdfPreview.ts:5-6** : worker CDN figé en 4.0.379 alors que la dépendance est en `^`. Casse après une mise à jour mineure.
13. **PdfPreview.vue:30-32** : `width` ignoré. Aperçu toujours en 200 px, flou dans FileCard (250).
14. **config/icons.ts avec Entretiens.vue:1899-1902 et EntretiensVehicule.vue:1474-1482** : icônes `file-*` non enregistrées. Icônes vides dans les listes de fichiers.
15. **timeFormatters.ts:130-133** : `getTodayDate()` en UTC. Mauvaise date préremplie dans UserServices entre minuit et 1 h/2 h.
16. **useUserServices.ts:394-411** : pause créée en deux appels non atomiques. Risque de marquer le mauvais service comme pause.
17. **useUserServices.ts:353 contre 454** : format horaire incohérent (UTC ISO contre local naïf). Décalages potentiels selon l'interprétation du backend.
18. **useUserServices.ts:314** : `last` faux quand `totalPages=0`. Pagination incohérente sur une liste vide.
19. **AddressAutocomplete.vue:61-71** : pas de `catch` ni d'ordre des réponses. Rejet non géré, suggestions périmées.
20. **AddressAutocomplete.vue:73-77 et 89-91** : `justSelected` reste vrai si la valeur ne change pas. La frappe suivante est ignorée.
21. **InputField.vue:59-69 et AddressAutocomplete.vue:130-140** : labels non reliés aux inputs. Accessibilité.
22. **Select.vue:310-313** : recherche réinitialisée à chaque nouvelle référence d'`options` (SearchFilters:131). Saisie perdue si le parent se re-rend.
23. **SearchFilters.vue:130, 143, 152, 163 et 135** : `0` affiché comme vide ; valeurs numériques converties en chaîne. Filtres numériques faussés.
24. **ProfileCompletionDialog.vue:151-182** : aucune validation. Profil enregistré vide, le dialog revient.
25. **useMapModal.ts:72** : carte recréée sans `remove()` de la précédente. Fuite mémoire et WebGL.
26. **useFaviconBadge.ts:39 et 44** : un seul `link[rel=icon]` modifié ; fallback valable en dev uniquement. Badge absent selon le navigateur.
27. **useSignatureReminder.ts:20-36 et usePendingUsers.ts:50-64** : pas de protection contre une réponse arrivée après `reset()`. État d'un compte précédent après un changement de compte.
28. **SignaturePad.vue:70** : mesure du conteneur, bordure incluse. Légère déformation du tracé.
29. **ApiClient.ts:175 et 188** : JSON forcé, `FormData` sérialisé en `"{}"`. Uploads impossibles via `apiClient`.
30. **ApiClient.ts:94-96** : `undefined` envoyé en `"undefined"` dans les paramètres. Filtres erronés si un service ne nettoie pas ses paramètres.
31. **stores/auth.ts:23 et usePermissions.ts:35** : rôles par nom (nav) contre UUID (guards). Nav vide ou incohérente si le libellé du rôle change.
32. **router/index.ts:275-280 et navConfig.ts:328** : `/app-versions` accessible à tout admin par l'URL. Restriction d'accès seulement visuelle.
33. **Retour (4 vues, `fallback="/"`)** : renvoie une personne connectée vers la Landing publique. Mauvaise UX.
34. **useBrowserDetection.ts:136-138** : Chrome sur ordinateur classé Android. Mauvaises instructions affichées.
35. **theme.css:186-203** : scrollbar et sélection non adaptées au mode sombre. Visuel.

## 5. Écarts avec CLAUDE.md (Vue)

- « Token JWT » : le token est **opaque** et n'expire jamais (`stores/auth.ts:151`).
- Arborescence incomplète :
  - `config/` contient aussi `seo.ts` et `version.ts`.
  - `enums/` contient aussi `AbsencePeriod`.
  - `types/` contient aussi `file`, `geocoding`, `google-identity`.
  - `src/data/` (changelog) n'est pas décrit.
  - `src/style.css` est orphelin.
  - `components/layout/` existe, mais il est mort.
- « Ne JAMAIS utiliser `useForwardPropsEmits` dans les wrappers shadcn » : il est utilisé dans Dialog, DialogContent, Sheet, SheetContent, AlertDialog*, DropdownMenu*, Tabs et Tooltip*. Seule Checkbox respecte la règle.
- « Pas de `!important` » : modificateurs `!` dans Navbar.vue:25 et 158, SearchFilters.vue:115, sidebar (mort), DropdownMenuItem (shadcn).
- « Ne pas utiliser les variables legacy de theme.css » : UserEdit.vue les utilise, avec en plus des variables inexistantes.
- « Icônes Lucide dans les modals, pas font-awesome » : Entretiens et EntretiensVehicule utilisent encore FontAwesome (`getFileIcon`), avec des icônes non enregistrées.
- « Select : `:teleport="false"` dans un Dialog » : seulement 9 usages. En pratique la liste blanche `[data-floating-content]` de DialogContent rend la règle facultative ; la doc n'en parle pas.
- « Toute vue publique doit appeler `usePageMeta` » : respecté, sauf Landing, qui garde volontairement les valeurs d'index.html.
- « Toujours gérer loading / error / success » : Notifications, `usePendingUsers` et `useSignatureReminder` échouent en silence (volontaire pour certains) ; AddressAutocomplete ne gère pas l'erreur.
- La doc ne mentionne ni les singletons de module (pendingUsers, serviceHistory, signatureReminder, versionCheck, googleRegistration, theme, messages), ni le polling de 5 s, ni `version.json`, ni les clés de stockage.

**Clés de stockage à conserver telles quelles en React** :
- localStorage : `auth_token`, `user`, `theme-preference`, `changelog_last_seen_version`, `notifications_sound_enabled` ; `sidebar:state` est mort.
- sessionStorage : `version_check_reloaded_for`, `version_check_dismissed`.

**Remplacements @vueuse → `src/hooks/`** :
- `useMediaQuery` : `(max-width: 639px)` dans Pointage, MyAcomptes, MyAbsences.
- `useDebounceFn` → `useDebouncedValue` ou `useDebouncedCallback`.
- `onClickOutside` → `useClickOutside`, ou rendu inutile par Popover.
- `useVModel` et `reactiveOmit` : sans équivalent nécessaire en React.

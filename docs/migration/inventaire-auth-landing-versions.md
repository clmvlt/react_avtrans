# Inventaire : auth, pages publiques, landing, légal, versions d'app

Tout a été lu en entier, en lecture seule. J'ai aussi lu, pour le contexte : `stores/auth.ts` (l.1-120), `api/index.ts`, `api/ApiClient.ts` (l.180-295), `App.vue`, `main.ts`, `components/ui/input-field/InputField.vue`, `components/ui/file-dropzone/FileDropzone.vue`, `composables/useMessages.ts`, `composables/useTheme.ts`, `models/AuthDTO.ts`, `scripts/prerender.cjs` et les extraits utiles de `vite.config.js`.

## Contexte transverse (utile pour toutes les pages)

**Garde du routeur (`router/index.ts:329-393`), dans l'ordre :**
- `requiresAuth` sans session → `/login`.
- Email non vérifié → `logout()` puis `/login`.
- Compte inactif → `/unauthorized`.
- `requiresAdmin` sans être admin → `/unauthorized`. Si admin, le mode « vue utilisateur » est désactivé (`setViewMode(false)`).
- `requiresMechanic` sans être admin ni mécanicien → `/unauthorized`.
- `requiresCouchette` sans la permission → `/unauthorized`.
- Utilisateur connecté qui ouvre `Login` ou `Register` → `getDefaultRoute()` : `/users` (admin), `/vehicules` (mécanicien), `/pointage` (sinon).
- Aucun paramètre `?redirect` : l'URL demandée est perdue après connexion.
- Défilement : position restaurée au retour arrière, sinon haut de page → `<ScrollRestoration/>` en React.

**Store (`stores/auth.ts`) :**
- `applySession` écrit `user` dans localStorage (`'user'`). Le service écrit le token (`'auth_token'`).
- `isAuthenticated` = token ET user présents. `isEmailVerified` = `user.isMailVerified`. `isActive` = `user.isActive`.
- `isAdmin` / `isMechanic` se basent sur `role.uuid`.

**Intercepteur 401 (`api/index.ts:28-58`) :**
- Sauf si le message commence par `Access denied: Required role` : vide localStorage, fait `logout()`, puis `router.push('/login')` si on n'est pas déjà sur /login.
- En React, il faudra un adaptateur de navigation (le routeur ne peut pas être importé dynamiquement de la même façon).

**Erreurs `ApiClient` :**
- `ApiError extends Error`. Le message vient de `errorData.message`, complété par `errors[]` sur une 400 de validation.
- Timeout → `'Request timeout'` (code `TIMEOUT`). Réseau → `'Network error'` (code `NETWORK_ERROR`). Timeout par défaut : 30 s.

**`App.vue` :**
- La navbar s'affiche si l'utilisateur est connecté et que le nom de route n'est pas dans `pagesWithoutNavbar` (voir bug B15).
- L'élément racine porte `<div id="app">` alors que le montage se fait déjà sur `#app` d'index.html : l'id est dupliqué.

---

## AUTH

### src/views/auth/Login.vue (220 l.)
- **Rôle / route :** `/login`, nom `Login`, `requiresAuth:false`. Un utilisateur connecté est redirigé par la garde vers la route par défaut.
  - Après succès : `redirectAfterLogin()`. Sur mobile (UA `/android|iphone|ipad|ipod/i`), ouvre `HomeScreenPrompt`. Sinon, redirige vers `getDefaultRoute()` (copie locale, l.118).
  - « Voir » dans le prompt → `/quick-login?setup=true`. « Plus tard » → route par défaut.
- **Comportement par état :**
  - Login email : si `!isEmailVerified` → message « Veuillez vérifier votre email avant de vous connecter » + `logout()`. Si `!isActive` → « Votre compte est désactivé. Veuillez contacter un administrateur. » + `logout()`.
  - Login Google : aucune de ces deux vérifications.
- **Appels API :**
  - `authStore.login` → `authService.login` → **POST `auth/login`**. Stocke `user.token || token`.
  - Google : `useGoogleSignIn().signIn(idToken)` → `authStore.loginWithGoogle` → **POST `auth/google`** `{idToken}`.
- **Formulaire (`name="login"`) :**
  - Champs : `email` (type email, autocomplete `username email`, `required` non transmis, cf. B6) et `password` (bouton afficher/masquer, autocomplete `current-password`).
  - Aucune validation JS.
  - Erreur : `error.message` de l'API, ou « Identifiants invalides » si l'erreur n'est pas une `Error`. En pratique, « Network error » / « Request timeout » s'affichent en anglais.
  - Chargement : champs et bouton désactivés, `LoaderCircle`. Pendant l'appel Google, le bouton est couvert d'un spinner.
  - Succès : redirection.
- **UI → shadcn :** `Button`→button ; `InputField` (maison)→`components/shared/InputField` (Input + Label + icône + bouton mot de passe) ; séparateur « ou »→`Separator` ; bloc d'erreur→`Alert variant="destructive"` ; `HomeScreenPrompt`→Dialog ; `GoogleSignInButton` (maison).
- **Navigateur :** `navigator.userAgent`.
- **Icônes :** FA `exclamation-circle`→`CircleAlert`, `key`→`KeyRound`. Lucide déjà utilisés : `LoaderCircle`, `Mail`, `Lock`.
- **Styles :** Tailwind uniquement, sans `<style>`. Carte `max-w-[440px]`. Logo `<img src="/src/assets/favicon.png">`, compilé par plugin-vue. En JSX ce chemin ne sera pas réécrit par Vite : il faut `import faviconUrl from '@/assets/favicon.png'`.
- **SEO :**
  - `usePageMeta({ title: "Connexion à l'espace employé — AVTRANS Concept", description: "Connectez-vous à l'espace employé AVTRANS Concept : pointage, planning, absences et acomptes.", canonicalPath: '/login' })`.
  - Robots non modifié (hérite de `index, follow, max-snippet:-1…`). Seule page indexable avec `/` (robots.txt, sitemap priorité 0.3).
- **Bugs :** l.211 (route inexistante, B1) ; l.158 (`success:false` silencieux, B3) ; l.118 (`getDefaultRoute` dupliqué, B10) ; l.191-200 (Google sans vérification vérifié/actif, B8).
- **Cible React :**
  - `pages/auth/LoginPage.tsx`
  - `features/auth/components/{AuthCard.tsx, AuthAlert.tsx, OrDivider.tsx, LoginForm.tsx, GoogleSignInButton.tsx, HomeScreenPromptDialog.tsx}`
  - `features/auth/hooks/{usePostLoginRedirect.ts, useGoogleSignIn.ts}`
  - `features/auth/api/useLoginMutation.ts`
  - `features/auth/schemas/login.ts`
  - `features/auth/lib/getDefaultRoute.ts` (partagé avec le loader de garde)
  - Métadonnées React 19 (voir le point SEO en fin de rapport).

### src/views/auth/Register.vue (278 l., au-dessus du seuil : à découper)
- **Rôle / route :** `/register`, nom `Register`, public. Un utilisateur connecté est redirigé. Après succès : écran « Inscription réussie ! » en 3 étapes, sans redirection automatique ; bouton « Retour à la connexion » → `/login`.
- **Google :** `signIn` → si `authenticated`, `router.push(getDefaultRoute())` (sans prompt écran d'accueil, contrairement à Login) ; si `redirected`, la navigation vers `/register/google` est déjà faite.
- **Appels API :** `authService.register` → **POST `auth/register`** `{email,password,firstName,lastName}`. Google : POST `auth/google`.
- **Formulaire (`name="register"`) :**
  - Champs : `firstName` (`given-name`), `lastName` (`family-name`), `email`, `password` (`new-password`, afficher/masquer), `confirmPassword`.
  - Validation en direct : `passwordTooShort` (1 à 5 caractères) → erreur « Le mot de passe doit contenir au moins 6 caractères ». Sinon, le même texte s'affiche en hint. `passwordMismatch` (confirmation non vide et différente) → « Les mots de passe ne correspondent pas ».
  - À la soumission, dans cet ordre : écart entre les deux mots de passe (même message), puis longueur < 6 (même message).
  - Erreur API : `error.message`, sinon « Une erreur s'est produite lors de l'inscription ».
  - `successMessage = response.message || 'Inscription réussie ! Veuillez vérifier votre email.'` n'est jamais affiché (sert seulement de drapeau).
  - Prénom et nom vides peuvent partir au backend (`required` non transmis).
- **UI :** Button (outline) ; InputField ; blocs succès/info/erreur → Alert ; séparateur.
- **Icônes FA :** `check-circle`→`CircleCheck`, `envelope`→`Mail`, `mouse-pointer`→`MousePointerClick`, `user-shield`→`ShieldUser` (repli `ShieldCheck`), `info-circle`→`Info`, `exclamation-circle`→`CircleAlert`. Lucide : `User`, `Mail`, `Lock`, `Shield`, `LoaderCircle`.
- **Styles :** Tailwind ; couleurs `success`/`info` du thème (vérifier que les tokens `--success`, `--info`, `--warning` existent dans le thème React).
- **SEO :** `{ title: 'Inscription — AVTRANS Concept', robots: 'noindex, follow' }`.
- **Bugs :** l.268 (B3), l.269 (message API ignoré), l.207 (B10), l.217-226 (B8).
- **Cible React :**
  - `pages/auth/RegisterPage.tsx` (moins de 80 l.)
  - `features/auth/components/{RegisterForm.tsx, RegisterSuccess.tsx}` (les 3 étapes en tableau statique)
  - `features/auth/schemas/register.ts` (zod `.refine` sur la confirmation, RHF `mode:'onChange'` + `deps:['confirmPassword']`)
  - `features/auth/api/useRegisterMutation.ts`

### src/views/auth/GoogleRegister.vue (190 l.)
- **Rôle / route :**
  - `/register/google`, nom `GoogleRegister`, public (pas de redirection si déjà connecté).
  - `onMounted` : sans `idToken` + profil en mémoire → `router.replace('/login')`. Le formulaire s'affiche un instant avant (flash).
  - Si l'`idToken` est absent au submit → `/login`. « Annuler » / « Aller à la connexion » → `clearRegistration()` puis `/login`.
- **Appels API :** `authService.registerWithGoogle` → **POST `auth/google/register`** `{idToken, firstName, lastName}` (le backend lit email et photo dans le token). Succès attendu : `success && status==='PENDING_ACTIVATION'`.
- **Formulaire (`name="google-register"`) :**
  - `email` : désactivé, hint « Vérifiée par Google — non modifiable ».
  - `firstName` / `lastName` pré-remplis depuis `googleProfile`.
  - Validation : trim ; vide → « Le prénom et le nom sont obligatoires. ».
  - Succès : écran « Compte créé ! » avec `response.message ||` « Votre compte a été créé via Google. Il doit être activé par un administrateur avant la première connexion. ».
  - Sinon : `response.message ||` « La création du compte a échoué. ».
  - Erreurs : `NETWORK_ERROR`/`TIMEOUT` → « Problème de connexion au serveur. Vérifiez votre réseau et réessayez. » ; sinon `err.message` ; sinon « Une erreur est survenue lors de la création du compte. ».
  - Avatar : `pictureUrl` avec `referrerpolicy="no-referrer"`, repli sur les initiales (`?` si vides).
- **UI :** Button (default/outline), InputField, Alert. Avatar → shadcn `Avatar` (+ `AvatarImage`/`AvatarFallback`).
- **Icônes FA :** `user-shield`→`ShieldUser`, `info-circle`→`Info`, `exclamation-circle`→`CircleAlert`.
- **SEO :** `{ title: 'Inscription avec Google — AVTRANS Concept', robots: 'noindex, follow' }`.
- **Bugs :** l.133 (flash avant redirection).
- **Cible React :**
  - `pages/auth/GoogleRegisterPage.tsx`, avec un loader React Router qui redirige vers `/login` si le store de handoff est vide (supprime le flash).
  - `features/auth/components/{GoogleRegisterForm.tsx, GoogleRegisterPending.tsx}`
  - `features/auth/stores/useGoogleRegistrationStore.ts` (Zustand non persisté)
  - `features/auth/api/useGoogleRegisterMutation.ts`
  - `features/auth/schemas/googleRegister.ts`

### src/views/auth/Verify.vue (119 l.)
- **Rôle / route :** `/verify?token=…`, public. Lit `route.query.token` (chaîne). Après succès, `setTimeout(3000)` → `/login` (non nettoyé). Boutons : « Retour à la connexion », « Retour à l'inscription » (`/register`), « Se connecter ».
- **Appels API :** `authService.verifyEmail(token)` → **GET `auth/verify?token=`**, timeout 60 s.
- **États :**
  - Chargement : spinner FA.
  - Succès : `response.message ||` « Votre email a été vérifié avec succès. », encart « Activation du compte requise », « Redirection automatique dans quelques secondes... ».
  - Erreur : token absent → « Token de vérification manquant » ; API → `error.message ||` « Token invalide ou expiré ».
  - Si `success:false` sans exception, aucune branche ne s'affiche et la carte reste vide.
- **UI :** Button, Alert/encart warning.
- **Icônes FA :** `spinner` (spin)→`LoaderCircle` + `animate-spin`, `check-circle`→`CircleCheck`, `user-shield`→`ShieldUser`, `clock`→`Clock`, `times-circle`→`CircleX`.
- **SEO :** `{ title: "Vérification de l'email — AVTRANS Concept", robots: 'noindex, follow' }`.
- **Bugs :** l.105 (carte vide), l.109 (timer non nettoyé).
- **Piège React :** en StrictMode, un `useEffect` appellerait l'API deux fois, et le token est à usage unique : le second appel échouerait.
- **Cible React :**
  - `pages/auth/VerifyPage.tsx`
  - `features/auth/components/VerifyEmailStatus.tsx`
  - `features/auth/api/useVerifyEmailQuery.ts` : `useQuery` dédoublonné (`retry:false`, `staleTime:Infinity`, `refetchOnWindowFocus:false`)
  - hook `useRedirectAfter(ms, to)` avec nettoyage.

### src/views/auth/ForgotPassword.vue (98 l.)
- **Route :** `/forgot-password`, public.
- **API :** `authService.requestPasswordReset(email)` → **POST `auth/password-reset/request`** `{email}`.
- **Formulaire :**
  - `email` (autocomplete `email`). Vide → « Veuillez entrer votre adresse email ».
  - Succès : message fixe « Un email de réinitialisation a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception. », le formulaire est masqué et l'email vidé.
  - Erreur : `error.message ||` « Une erreur s'est produite. Veuillez réessayer. ».
- **Icônes FA :** `check-circle`, `exclamation-circle`, `arrow-left`→`ArrowLeft`. Lucide : `Mail`, `LoaderCircle`.
- **SEO :** `{ title: 'Mot de passe oublié — AVTRANS Concept', robots: 'noindex, follow' }`.
- **Bugs :** l.88 (B3).
- **Cible React :** `pages/auth/ForgotPasswordPage.tsx`, `features/auth/components/ForgotPasswordForm.tsx`, `api/useRequestPasswordResetMutation.ts`, `schemas/forgotPassword.ts`.

### src/views/auth/ResetPassword.vue (148 l.)
- **Route :** `/password-reset?token=…` (nom `PasswordReset`), public. Lit le token en `onMounted`. Après succès, `setTimeout(3000)` → `/login` (non nettoyé).
- **API :** `authService.confirmPasswordReset({token,newPassword})` → **POST `auth/password-reset/confirm`**.
- **Formulaire :**
  - `password` (hint « Le mot de passe doit contenir au moins 6 caractères », placeholder « Minimum 6 caractères ») et `confirmPassword`.
  - Au submit, dans cet ordre : longueur < 6 → « Le mot de passe doit contenir au moins 6 caractères », puis écart → « Les mots de passe ne correspondent pas ». Pas de validation en direct, contrairement à Register.
  - Succès : « Votre mot de passe a été réinitialisé avec succès ! » + « Redirection vers la page de connexion... ».
  - Erreur : `error.message ||` « Le token est invalide, expiré ou a déjà été utilisé ».
  - Token absent : `errorMessage` « Token de réinitialisation manquant » ET un bloc statique « Token de réinitialisation manquant ou invalide. » (doublon). Le formulaire est masqué.
- **Icônes FA :** `check-circle`, `clock`, `exclamation-circle`, `exclamation-triangle`→`TriangleAlert`, `arrow-left`.
- **SEO :** `{ title: 'Réinitialisation du mot de passe — AVTRANS Concept', robots: 'noindex, follow' }`.
- **Bugs :** l.26-34 + 107-109 (double message), l.138 (timer), l.134 (B3).
- **Cible React :** `pages/auth/ResetPasswordPage.tsx`, `features/auth/components/ResetPasswordForm.tsx`, `api/useConfirmPasswordResetMutation.ts`, `schemas/resetPassword.ts`.

### src/views/auth/AddToHomescreen.vue (122 l.)
- **Route :** `/add-to-homescreen`, `requiresAuth:true`. Liens depuis `Navbar.vue` (l.95, 206) et `AppSidebar.vue:229`. « Aller au Pointage » → `/pointage`. « Retour » → `router.back()`.
- **Comportement :** onglets navigateur (tous sauf `unknown`), présélection par `detectBrowser()` au montage. Étape 1 fixe, puis les étapes du navigateur numérotées à partir de 2.
- **API :** aucune.
- **UI :** `Tabs`/`TabsList`/`TabsTrigger` sans `TabsContent`, utilisés comme sélecteur → shadcn `Tabs` (`onValueChange`) ou `ToggleGroup`. Button `size="lg"`.
- **Navigateur :** `navigator.userAgent`. Pas de `beforeinstallprompt`, pas de service worker dans le projet.
- **Icônes Lucide :** `Smartphone`, `Clock`, `ArrowLeft`, `Info`, `Globe`, `Compass`, `Flame`, `Monitor`.
- **Styles :** `violet-*` codé en dur avec variantes `dark:`.
- **SEO :** aucun `usePageMeta` : l'onglet garde le titre de la landing.
- **Bugs :** l.29 (onglets icône seule sous `sm` sans `aria-label`) ; l.91-92 (Chrome Android et Chrome iOS ont la même icône `Globe`).
- **Cible React :** `pages/auth/AddToHomescreenPage.tsx`, `features/auth/components/BrowserInstructionsTabs.tsx`, `features/auth/lib/browserDetection.ts` (fonctions pures + données).

### src/components/auth/GoogleSignInButton.vue (100 l.)
- **Rôle :** rend le bouton officiel Google (GIS) dans un conteneur.
- **Props :** `text` (`signin_with|signup_with|continue_with`, défaut `continue_with`), `oneTap` (défaut `false`, jamais activé), `loading`.
- **Émissions :** `credential(idToken)`, `error(message)`.
- **Libs / navigateur :**
  - Script `https://accounts.google.com/gsi/client` chargé à la demande.
  - `initialize({client_id, callback, cancel_on_tap_outside:true, ux_mode:'popup'})`.
  - `renderButton(container, {type:'standard', theme: html.dark ? 'filled_blue' : 'outline', size:'large', text, shape:'rectangular', logo_alignment:'center', width: min(offsetWidth||360, 400)})`.
  - `prompt()` si `oneTap`.
- **Messages :**
  - « Aucun identifiant Google reçu. Veuillez réessayer. ».
  - « Connexion Google indisponible pour le moment. » si `VITE_GOOGLE_CLIENT_ID` est absent (avec `console.warn('VITE_GOOGLE_CLIENT_ID manquant — bouton Google désactivé.')`) ou si le script ne charge pas.
- **Icônes :** `LoaderCircle`.
- **Bugs :** l.78-79 (thème et largeur figés au montage) ; aucun nettoyage ; `initialize()` rappelé à chaque montage.
- **Piège React :** en StrictMode, l'effet s'exécute deux fois, donc `renderButton` aussi. Il faut vider le conteneur dans le cleanup.
- **Cible React :** `features/auth/components/GoogleSignInButton.tsx` (ref + `useEffect` avec cleanup `container.replaceChildren()`) et `features/auth/lib/googleIdentity.ts` (loader mémoïsé, sans hook).

### src/components/home-screen/HomeScreenPrompt.vue (63 l.)
- **Rôle :** dialog « Raccourci écran d'accueil ». Le texte promet « Connexion instantanée », « Pas besoin de mot de passe », « Accès rapide au pointage ».
- **API :** `modelValue` ; émissions `update:modelValue`, `navigate` (« Voir »), `dismiss` (« Plus tard »).
- **UI :** Dialog, DialogContent `sm:max-w-md`, Header, Title, Footer ; Button.
- **Icônes :** `Smartphone`, `Zap`, `Fingerprint`, `Clock`.
- **Bugs :** l.2, fermeture par overlay ou Échap (B2).
- **Cible React :** `features/auth/components/HomeScreenPromptDialog.tsx` (`onOpenChange(false)` ⇒ traiter comme « Plus tard »).

### src/composables/useGoogleIdentity.ts (72 l.)
- `loadGoogleIdentity()` : promesse mémoïsée au niveau du module. Réutilise un `<script>` existant (`data-loaded`). En cas d'erreur, remet la promesse à null et supprime le script. `GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''`.
- **Cible React :** `features/auth/lib/googleIdentity.ts`, copié presque tel quel (ce n'est pas un hook).

### src/composables/useGoogleSignIn.ts (72 l.)
- Orchestration de l'étape 1, qui renvoie `authenticated | redirected | error` :
  - `AUTHENTICATED` → `{kind:'authenticated'}`.
  - `NEEDS_REGISTRATION` + `googleProfile` → `setRegistration`, `router.push('/register/google')`.
  - Sinon → `response.message ||` « Réponse inattendue du serveur Google. ».
  - Erreurs : réseau/timeout → « Problème de connexion au serveur. Vérifiez votre réseau et réessayez. » ; sinon `err.message` ; sinon « Erreur lors de la connexion avec Google. ».
  - `submitting` pilote le spinner.
- **Cible React :** `features/auth/api/useGoogleSignInMutation.ts` (mutationFn = `authService.loginWithGoogle` + `applySession`) et `features/auth/hooks/useGoogleSignIn.ts` (branchement + `useNavigate`).

### src/composables/useGoogleRegistration.ts (39 l.)
- Handoff en mémoire (singleton de module), volontairement non persisté (idToken sensible, valide moins d'une heure). Fonctions : `setRegistration`, `clearRegistration`, `hasRegistration`.
- **Cible React :** `features/auth/stores/useGoogleRegistrationStore.ts` (Zustand sans `persist`).

### src/composables/useBrowserDetection.ts (181 l.)
- **Données :** `BROWSER_NAMES` (7 entrées) ; `BROWSER_INSTRUCTIONS` (4 étapes par navigateur, textes exacts à copier).
- **Détection UA :**
  - iOS : `crios` → `chrome-ios`, sinon `safari` (y compris `fxios`).
  - Android : `samsungbrowser` → `samsung`, `edg` → `edge`, `firefox` → `firefox`, `chrome` → `chrome-android`.
  - Desktop : `edg`, `firefox`, `chrome` → `chrome-android`, `safari`.
- `getAllBrowserTypes()` : ordre `chrome-android, safari, chrome-ios, firefox, edge, samsung, unknown`.
- **Code mort :** champ `icon` (tuples FA `globe`, `compass`, `fire`, `window-maximize`, `mobile-alt`, `question-circle`) et `isMobileDevice()`.
- **Bugs :** l.136-137, Chrome desktop reçoit les instructions Android.
- **Cible React :** `features/auth/lib/browserDetection.ts` (fonctions pures ; supprimer `icon`).

### src/composables/usePageMeta.ts (81 l.)
- En `onMounted`, écrase `document.title`, `meta[name=description]`, `meta[name=robots]` et `link[rel=canonical]` (`SITE_URL + canonicalPath`), en créant la balise si elle manque. En `onUnmounted`, restaure dans l'ordre inverse.
- **Utilisé dans mon périmètre par :** Login, Register, GoogleRegister, Verify, ForgotPassword, ResetPassword, NotFound, Unauthorized, MentionsLegales, PolitiqueConfidentialite, AppVersionsPublic. **Pas** par Landing (valeurs d'index.html), AddToHomescreen ni AppVersions.
- **Cible React :** balises natives React 19 (`<title>`, `<meta>`, `<link rel="canonical">`). Attention à la cohabitation avec les balises statiques d'index.html (point d'ombre 7).

### src/services/auth.ts (131 l.)
Service copié tel quel. Endpoints :

| Méthode | Appel |
|---|---|
| `register` | POST `auth/register` |
| `verifyEmail` | GET `auth/verify` `{params:{token}, timeout:60000}` |
| `login` | POST `auth/login`, puis `setAuthToken(user.token\|\|token)` |
| `loginWithGoogle` | POST `auth/google` `{idToken}`, token stocké si `AUTHENTICATED` |
| `registerWithGoogle` | POST `auth/google/register` |
| `getMe` | GET `auth/me` (inutilisé ici) |
| `logout` | `clearAuthToken()` |
| `requestPasswordReset` | POST `auth/password-reset/request` `{email}` |
| `confirmPasswordReset` | POST `auth/password-reset/confirm` `{token,newPassword}` |
| `exportData` | POST `auth/export` (hors périmètre) |

DTO (`models/AuthDTO.ts`) :
- `GoogleAuthResponse{success,message?,status:'AUTHENTICATED'|'NEEDS_REGISTRATION',user?,googleProfile?,token?,expiresIn?}`
- `GoogleRegisterResponse{success,status:'PENDING_ACTIVATION',message?}`
- `GoogleProfile{email?,firstName?,lastName?,pictureUrl?}`

### src/types/google-identity.d.ts (74 l.)
Types GIS minimaux et `Window.google?`. À copier dans `src/types/`.

### src/config/seo.ts (16 l.)
- `SITE_URL='https://pointage.avtrans-concept.com'`, `SITE_NAME='AVTRANS Concept'`.
- `DEFAULT_TITLE='Coursier & Transport Bretagne – Saint-Brieuc | AVTRANS Concept'`.
- `DEFAULT_DESCRIPTION='Coursier, messagerie express, fret, poids lourd et température dirigée à Saint-Brieuc, Lamballe et dans tout le Grand Ouest. Devis gratuit : 02 57 77 07 77.'`
- `JSONLD_BUSINESS_ID=${SITE_URL}/#business`, `JSONLD_WEBSITE_ID=${SITE_URL}/#website`.
- À copier tel quel.

---

## COMMUN

### src/views/common/NotFound.vue (76 l.)
- **Route :** `/:pathMatch(.*)*`, public.
- **Par état d'auth :**
  - Suggestions : « Accédez au tableau de bord » (connecté) ou « Connectez-vous à votre compte ».
  - Bouton « Tableau de bord » → `/vehicules` en dur (connecté), sinon « Se connecter » → `/login`.
  - « Retour » : `history.length > 1` ? `router.back()` : `/vehicules` ou `/login`.
- **UI :** Button (default/secondary). **Icônes :** `ArrowLeft`, `Home` (lucide-react : `House`), `LogIn`.
- **Styles :** puces via `before:content-['•']`.
- **SEO :** `{ title: 'Page non trouvée — AVTRANS Concept', robots: 'noindex, nofollow' }`.
- **Bugs :** l.35 et l.73 (B16).
- **Cible React :** `pages/common/NotFoundPage.tsx`, utilisée aussi comme `errorElement` / `path:'*'`, avec `getDefaultRoute(user)`.

### src/views/common/Unauthorized.vue (56 l.)
- **Route :** `/unauthorized`, `requiresAuth:false`. Destination de la garde pour un compte inactif ou un rôle/permission insuffisant.
- **Contenu :** affiche `authStore.userRole` (nom du rôle) s'il existe. Seule action : « Se déconnecter » (`logout()` + `/login`).
- **Icônes :** emoji 🚫 → proposition `ShieldBan`.
- **SEO :** `{ title: 'Accès non autorisé — AVTRANS Concept', robots: 'noindex, nofollow' }`.
- **Bugs :** l.21-24 (B17).
- **Cible React :** `pages/common/UnauthorizedPage.tsx`.

---

## LÉGAL

### src/components/legal/LegalLayout.vue (144 l.)
- **Props :** `title`, `subtitle?`, `lastUpdated?`.
- **Structure :** en-tête (logo `@/assets/logo.png` + « AVTRANS / Solutions Transport » → `/`, lien « Retour à l'accueil » masqué sous `sm`), bandeau titre, `<main>` avec `.legal-content` et slot, pied de page (© année courante + liens Accueil / Mentions / Politique).
- **`<style scoped>` :** `:deep()` sur h2 (mt 2.5rem, 1.25rem, 700 ; premier enfant mt 0), h3, p (couleur `--muted-foreground`, interligne 1.7), ul (disc), li, a (`--primary`, souligné), strong, address (non italique).
- **Bugs :** l.136-143, classe `.todo` morte (aucun placeholder restant).
- **Cible React :** `components/layout/LegalLayout.tsx` (prop `children`). Styles en variantes arbitraires Tailwind (`[&_h2]:mt-10 …`) ou dans un petit `legal.css`. Logo commun → `components/shared/BrandLogo.tsx`.

### src/views/legal/MentionsLegales.vue (83 l.)
- **Route :** `/mentions-legales`, public.
- **Contenu statique** (8 sections), `last-updated="24 juin 2026"` : éditeur AVTRANS CONCEPT (EURL au capital de 3 000 €), siège ZA de Pommeret, Route de Quenhoet, 22120 Hillion, SIREN/SIRET/RCS/TVA/APE, tél. `tel:+33257770777`, `mailto:contact@avtrans-concept.com`, directeur de publication, hébergeur OVH (lien externe `noopener`), et `RouterLink` vers la politique de confidentialité ×2.
- **SEO :** `{ title: 'Mentions légales — AVTRANS Concept', robots: 'noindex, follow' }`.
- **Cible React :** `pages/legal/MentionsLegalesPage.tsx` (JSX statique, `<Link>`).

### src/views/legal/PolitiqueConfidentialite.vue (118 l.)
- **Route :** `/politique-confidentialite`, public.
- **Contenu :** 9 sections statiques, sous-titre « Comment AVTRANS Concept collecte, utilise et protège vos données personnelles. », date « 24 juin 2026 ». Liens `mailto`/`tel`, CNIL (externe), RouterLink vers les mentions.
- **SEO :** `{ title: 'Politique de confidentialité — AVTRANS Concept', robots: 'noindex, follow' }`.
- **Cible React :** `pages/legal/PolitiqueConfidentialitePage.tsx`.

---

## LANDING

### src/views/landing/Landing.vue (1233 l.)
- **Route :** `/`, public, sans garde ni query param. La navbar n'est pas affichée (`Landing` figure dans la liste d'exclusion).

**Liens :**
- Logo → `/`.
- Navigation ancres `#services`, `#about`, `#fleet`, `#faq`, `#contact` : vrais `<a href>`, avec défilement doux en JS (`scrollIntoView`, et fermeture du menu mobile).
- « Espace Employé » → `/login`. « Espace Client » → `https://avtrans.ypsium.com` (`_blank noopener`).
- Pied de page : `/login`, `/register` (nofollow), `/download` (nofollow), `https://avtrans-concept.com`, Espace client, `/mentions-legales`, `/politique-confidentialite`.
- Contact : `tel:+33257770777`, `tel:+33666581321`, `mailto:contact@avtrans-concept.com`.

**Aucun appel API.**

**API navigateur (dans `onMounted`) :**
1. Lit `localStorage['theme-preference']` (try/catch) et `matchMedia('(prefers-color-scheme: dark)')` pour mémoriser `wasDark`, retire `.dark` de `<html>`, ajoute `html.landing-fluid`.
2. Écouteur `scroll` passif :
   - `isScrolled` (> 50 px).
   - `showFloatingCta` : `scrollY > innerHeight` et `#contact.top > 0.5 × innerHeight`.
   - Parallaxe limitée par rAF : `scrollY` plafonné à `innerHeight`.
3. Injecte le JSON-LD dans `<head>`.
4. `parallaxEnabled = !prefers-reduced-motion && innerWidth >= 1024`. Transformations : fond `0.3`, badge `-0.15`, titre `0.1`, CTA `0.05` × scrollY.
5. IntersectionObserver `.reveal` (`threshold 0.1`, `rootMargin '0px 0px -40px 0px'`) → ajoute `revealed`. Si `window.__PRERENDERED__`, les éléments déjà visibles sont révélés tout de suite.
6. IntersectionObserver `[data-stats-section]` (`threshold 0.3`) → compteur animé sur 2000 ms, ease-out cubique, via rAF.

En `onUnmounted` : restaure `.dark` si `wasDark`, retire `landing-fluid`, retire les écouteurs et observers, annule le rAF, supprime le script JSON-LD.

**Icônes :** Lucide uniquement (`Truck`, `Snowflake`, `MapPin`, `Warehouse`, `Phone`, `Mail`, `ChevronDown`, `ArrowRight`, `Menu`, `X`, `Shield`, `Zap`, `Globe`, `Package`, `Locate`, `Smartphone`, `Container`, `Weight`, `Boxes`, `ArrowUpFromLine`, `CircleHelp`), mêmes noms en lucide-react.

**Images :**
- `locaux.webp` + `locaux-800.webp` : héro, élément LCP, `srcset 800w/1600w`, `fetchpriority="high"`, 1600×1200.
- `expertise-image.webp` (1200×899), `master.webp` (1200×676), `porteur.webp` (1200×900) : `loading="lazy"`.
- `logo.png`.

**`<style scoped>` :**
- `:global(html.landing-fluid){font-size:clamp(100%,0.8333vw,162.5%)}` : mise à l'échelle au-delà de 1920 px.
- `.hero-bg` : animation `hero-zoom` 25 s, `scale(1.08)` → `1`.
- `.reveal` (opacité 0, translateY 24px, transition 0.7 s `cubic-bezier(0.16,1,0.3,1)`) et `.revealed`.
- Micro-interactions au survol `.group:hover .anim-{bounce,spin,wiggle,ping,lift,rotate} :deep(svg)` et leurs 6 keyframes. Seuls `bounce`, `spin`, `ping` et `lift` sont utilisés.
- Transitions Vue : menu mobile (fondu + translate-y-2) et CTA flottant (translate-y-full).
- Classes Tailwind `animate-ping`, `animate-bounce`, `animate-pulse`.
- Responsive : `lg` (navigation desktop, parallaxe), `sm`/`md` pour les grilles.
- Aucune variable CSS legacy.

**SEO :**
- Pas de `usePageMeta` : title, description, robots et canonical viennent d'index.html.
- JSON-LD injecté : `@graph` = WebPage (`@id ${SITE_URL}/#webpage`, `url ${SITE_URL}/`, `name DEFAULT_TITLE`, `description DEFAULT_DESCRIPTION`, `isPartOf #website`, `about #business`, `primaryImageOfPage` = `og-image.jpg` 1200×630, `inLanguage fr-FR`) + FAQPage (`@id #faq`, 5 Question/Answer tirées de `faq`).
- Dépendances de `prerender.cjs` :
  - le conteneur doit être exactement `<div id="app"></div>` (l.39) ;
  - attente de `#app h1` (l.266) ;
  - le HTML capturé doit contenir `<h1`, `id="services"`, `id="contact"` et `<footer` (l.324), ne contenir aucun `<script` (l.327) et dépasser 10 000 caractères ;
  - `window.__PRERENDERED__` est posé par le BOOT_SCRIPT ;
  - le rendu se fait en thème clair et `prefers-reduced-motion: reduce` (donc sans parallaxe inline) ;
  - le script fait défiler toute la page pour déclencher `.reveal` et le compteur, puis force `.reveal:not(.revealed)`.
- Le JSON-LD de la page est dans `<head>`, donc **absent du HTML pré-rendu** (seul `#app.innerHTML` est capturé).

**Bugs :**
- l.448-467, 508-517, 965-976 : `<button>` imbriqué dans `<a>` / `RouterLink` (HTML invalide, double arrêt de tabulation).
- l.152 : `onScroll` n'est pas appelé au montage ; le header reste transparent si la page est restaurée déjà défilée.
- l.44-49 : `getElementById` + `getBoundingClientRect` à chaque événement scroll, sans throttle.
- l.159 : `parallaxEnabled` calculé une seule fois (pas de resize).
- l.69-84, 1150, 1165 : compteur, zoom du héro, reveal, bounce/ping/pulse ignorent `prefers-reduced-motion`.
- l.692 : classe `service-card` sans CSS ; l.1185-1196 et 1209-1231 : keyframes `wiggle` et `rotate` mortes.
- l.475 et 495 : `aria-controls="mobile-menu"` pointe vers un élément absent quand le menu est fermé ; le menu ne se ferme ni par Échap ni par clic extérieur.

**Cible React : découpage de Landing**
- `pages/landing/LandingPage.tsx` (environ 60 l.) : compose les sections et appelle `useForceLightTheme()`, `useFluidRootScale()`, `useLandingJsonLd()` et `useRevealOnScroll(rootRef)`.
- `features/landing/data/` (données statiques extraites) :
  - `navLinks.ts` (5)
  - `services.ts` : `services[4]` {icon, title, description, animation} + `heavyService` {badge, title, description, points[3]}
  - `about.ts` : `aboutFeatures[4]`
  - `fleet.ts` : `fleet[2]` {image importée, width, height, alt, lengthM, heightM, volume, badge, badgeIcon, title, description, specs[2]}
  - `stats.ts` : `[{target:7,suffix:'+',label:"Années d'expérience"},{60,'m³','Capacité véhicule max'},{100,'%','Traçabilité des envois'}]`
  - `faq.ts` : 5 {question, answer}, textes exacts
  - `footer.ts` : `footerServices[6]`, `serviceAreas[8]` (Saint-Brieuc, Lamballe, Pommeret, Dinan, Guingamp, « Lannion & Loudéac », « Rennes & Grand Ouest », « National & International »), `quickLinks[5]`
  - `contact.ts` : `PHONE_MAIN {href:'tel:+33257770777', label:'02 57 77 07 77'}`, `PHONE_MOBILE {'tel:+33666581321','06 66 58 13 21'}`, `EMAIL 'contact@avtrans-concept.com'`, `CLIENT_SPACE_URL 'https://avtrans.ypsium.com'`, `SHOWCASE_URL 'https://avtrans-concept.com'`, adresse, mentions légales du bas de page (EURL 3 000 €, SIREN 845 350 347, siège Hillion).
- `features/landing/components/` :
  - `LandingHeader.tsx` + `LandingMobileMenu.tsx`
  - `HeroSection.tsx` (image LCP, badge, h1 « Coursier & transport en Bretagne », tags, 2 CTA, indicateur de défilement)
  - `ServicesSection.tsx` + `HeavyServiceCard.tsx` + `ServiceCard.tsx`
  - `AboutSection.tsx`
  - `FleetSection.tsx` + `VehicleCard.tsx` (cotes en `<dl>`)
  - `StatsSection.tsx`
  - `FaqSection.tsx` (garder `<details>` natif)
  - `ContactSection.tsx` + `ContactCard.tsx`
  - `LandingFooter.tsx`
  - `FloatingCallButton.tsx`
  - `SectionHeading.tsx` (pastille + h2 + intro, répétée 4 fois)
- `features/landing/hooks/` :
  - `useScrolledPast(px)` et `useFloatingCtaVisible()` : état booléen isolé dans le header ou le CTA.
  - `useParallax()` : écrit des variables CSS via une ref, **sans** setState à chaque frame (sinon toute la page se re-rendrait à 60 fps).
  - `useCountUp(targets, durationMs)`.
  - `useRevealOnScroll`, `useForceLightTheme`, `useFluidRootScale`.
  - `useLandingJsonLd` : injection dans `<head>` via effet, **pas** de `<script>` JSX dans l'arbre, sinon `prerender.cjs:327` échoue.
- `features/landing/lib/{scrollToSection.ts, formatMeters.ts, buildLandingJsonLd.ts}`.
- `features/landing/landing.css` : `hero-zoom`, `.reveal`/`.revealed`, 4 animations d'icône, `html.landing-fluid`.
- CTA en `<Button asChild><a|Link/></Button>` pour corriger l'imbrication.
- Monter avec `createRoot` (pas `hydrateRoot`), car le DOM pré-rendu diffère (classes `revealed`, compteurs à leur valeur finale).

### src/components/landing/FleetViewer.vue (161 l.) — CODE MORT
- **Non importé nulle part.** Grep : seules références dans `vite.config.js:128-129` (`manualChunks.threejs`) et `package.json` (`three`, `@tresjs/core`, `@tresjs/cientos`).
- **Historique :** un seul commit, `a4438b7 feat: landing page — page vitrine publique avec viewer 3D de la flotte`. Retiré de Landing par `751eedd refactor: landing — SEO épuré, nouvelle adresse Hillion et retrait du viewer 3D` (24 juin 2026).
- **Contenu :**
  - `TresCanvas` avec GLTFModel Draco (décodeur CDN `https://www.gstatic.com/draco/versioned/decoders/1.5.6/`), `OrbitControls` (rotation automatique, sans pan), `ContactShadows`, `GridHelper`.
  - 2 modèles : `/models/fourgon.glb` (Renault Master, environ 0,9 Mo) et `/models/porteur.glb` (Renault Premium DXI, environ 3 Mo), toujours dans `public/models`.
  - Onglets avec transitions de 300/100 ms par `setTimeout`.
  - Styles scoped : halo `.dark`.
- **Icônes :** `RotateCw`, `Loader2`.
- **Cible React :** aucune par défaut (point d'ombre 1). Si on le garde : `features/landing/components/FleetViewer3D.tsx` avec `@react-three/fiber` + `drei` (`useGLTF` + Draco, `OrbitControls`, `ContactShadows`, `Grid`), en `React.lazy`.

### public/robots.txt (62 l.)
- Liste blanche : `Allow: /$`, `/?`, `/login$`, `/login?`.
- Ressources autorisées : `/assets/`, `/icons/`, `/models/` (inutile si FleetViewer est abandonné), `/.well-known/`, `manifest.json`, `version.json`, `sitemap.xml`, favicons, `og-image.jpg`, et `*.js|css|webp|png|jpg|svg|woff2`.
- `Disallow: /`. AhrefsBot, SemrushBot, MJ12bot et DotBot bloqués.
- `Sitemap: https://pointage.avtrans-concept.com/sitemap.xml`.
- À copier tel quel. Les chemins sources du sitemap dans `vite.config.js:47-48` (`src/views/landing`, `src/components/landing`, `src/views/auth/Login.vue`) devront pointer vers `src/pages/landing`, `src/features/landing` et `src/pages/auth/LoginPage.tsx`.

### index.html (195 l.)
- `lang="fr"`, `theme-color #581c87`, favicons, apple-touch-icon, manifest.
- Preconnect et dns-prefetch vers `https://api.avtrans-concept.com`.
- `<title>` = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION, `robots "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"`, `author`, canonical `https://pointage.avtrans-concept.com/`.
- Open Graph (`og:title "Coursier & Transport en Bretagne – AVTRANS Concept"`, image 1200×630 + alt), Twitter card, `geo.*` / `ICBM` (48.4614, -2.6989).
- JSON-LD `@graph` : LocalBusiness `#business` (adresse Hillion, téléphone, `vatID`, `areaServed` ×15, `hasOfferCatalog` ×5, `sameAs`) + WebSite `#website`.
- Métas PWA iOS.
- Script anti-FOUC : applique `.dark` selon `theme-preference` ou la préférence système, **sauf si `pathname === '/'`**.
- `<div id="app"></div>` et `<script type="module" src="/src/main.ts">`.
- **Cible React :** garder `id="app"` (et non `root`), sinon adapter `prerender.cjs` (`EMPTY_ROOT`, `#app h1`, `BOOT_SCRIPT`). Entrée `/src/main.tsx`.

---

## VERSIONS D'APP

### src/views/app-versions/AppVersions.vue (358 l., au-dessus du seuil)
- **Route :** `/app-versions`, `requiresAuth + requiresAdmin`. Le lien du menu est limité à `requiredEmails:['clementveillet@gmail.com']` (`navConfig.ts:328`), mais la route est ouverte à tout admin.
- **API :**
  - `getAllVersions()` → **GET `app-versions/admin`**, trié côté client par `versionCode` décroissant.
  - `deleteVersion(id)` → **DELETE `app-versions/{id}`**.
  - Téléchargement : `getDownloadUrl(id)` = `${API_URL}app-versions/{id}/download` (lien `<a download>` ou `location.href` depuis le menu contextuel).
- **UI :**
  - Recherche `Input type=search` (filtre sur versionName, originalFileName, changelog, insensible à la casse).
  - `Table` à 7 colonnes : Version (compteur), Fichier (`md+`), Notes (`lg+`, tronquées à 50), Statut (`Badge` outline vert « Actif » / destructive « Inactif »), Téléch. (`sm+`), Date (`sm+`, `fr-FR` jour 2 chiffres / mois court / année), Actions.
  - Menu contextuel au clic droit (`ContextMenuPopover` maison + `useContextMenu`) : Télécharger / Modifier / Supprimer.
  - Dialog de confirmation « Supprimer la version » / « Cette action est irréversible. ».
  - Modales de création et d'édition.
- **États :**
  - Chargement : « Chargement des versions... ».
  - Erreur : message seul, qui masque tout (y compris le bouton de création), sans bouton de réessai. Toast `messages.error(msg,'Erreur')`.
  - Liste vide : « Aucune version trouvée ».
- **Toasts :** « Version supprimée avec succès » / « Succès » ; « Erreur lors de la suppression ». Fallback de chargement : « Erreur lors du chargement des versions ».
- **Icônes :** `Plus`, `Search`, `Download`, `LoaderCircle`, `Pencil`, `Trash2`.
- **SEO :** aucun `usePageMeta` (page authentifiée).
- **Bugs :** l.337-353 (pas d'état de chargement sur Supprimer, double DELETE possible) ; l.90-94 (`<Button>` dans `<a>`) ; l.12-14 (erreur bloquante) ; l.265 (`formatFileSize` en unités anglaises, dupliqué).
- **Cible React :**
  - `pages/app-versions/AppVersionsPage.tsx`
  - `features/app-versions/components/{AppVersionsTable.tsx, appVersionColumns.tsx, AppVersionRowActions.tsx, DeleteAppVersionDialog.tsx}` : data-table avec `getFilteredRowModel` (filtre global), tri par défaut `versionCode desc`, colonnes responsives via `meta.className`, shadcn `ContextMenu` autour de `TableRow`, `AlertDialog` avec `isPending`.
  - `api/{queryKeys.ts, useAdminAppVersions.ts, useDeleteAppVersion.ts}`.

### src/views/app-versions/AppVersionsPublic.vue (369 l., au-dessus du seuil)
- **Route :** `/download` (nom `AppDownload`), public, sans navbar.
- **Comportement :** détection UA (`iphone|ipad|ipod` → ios, `android`, sinon desktop). Sur iOS, la carte iOS passe en premier (`order-*`).
- **API :**
  - `getActiveVersions()` → **GET `app-versions`**. Dernière version = max `versionCode` calculé côté client.
  - Bouton principal → `getLatestDownloadUrl()` = `${API_URL}app-versions/latest/download`.
  - Historique → `getDownloadUrl(id)`.
- **Carte Android :**
  - États chargement / erreur / vide (« Aucune version disponible »).
  - Méta : taille, date `fr-FR` longue, téléchargements (« Aucun téléchargement », « 1 téléchargement », « {n/1000}k téléchargements », « {n} téléchargements »).
  - Changelog « Nouveautés » (`whitespace-pre-line`).
  - « Télécharger l'APK ».
  - Historique repliable « Versions précédentes (n) » ; « Notes de version » dépliables une par une (Set).
  - Note : « Autorisez l'installation depuis des sources inconnues si nécessaire. ».
- **Carte iOS :**
  - Badge « Programme TestFlight », 4 étapes statiques (lien `https://apps.apple.com/app/testflight/id899247664`).
  - Bouton « Rejoindre sur TestFlight » → `https://testflight.apple.com/join/cGHBQbTh`.
  - Note : « TestFlight doit être installé depuis l'App Store. ».
- **UI :** Button, Badge. SVG de marque Android et Apple inline (absents de Lucide) → `components/shared/icons/{AndroidIcon,AppleIcon}.tsx`. Déplier/replier → shadcn `Collapsible`.
- **Icônes :** `FileText`, `Calendar`, `Download`, `AlertCircle`→`CircleAlert`, `PackageOpen`, `ChevronUp`, `ChevronDown`, `ExternalLink`, `Plane`, `LoaderCircle`, `Info`, `Sparkles`.
- **SEO :** `{ title: 'Application mobile AVTRANS — Téléchargement', robots: 'noindex, follow' }`.
- **Bugs :**
  - l.342-349 : `formatDate` sans garde (affiche « Invalid Date » si la date est vide).
  - l.81 : le fichier « latest » est choisi par le serveur alors que la carte affiche la version calculée côté client (divergence possible).
  - l.80-89, 142-151, 223-235 : `<Button>` dans `<a>`.
- **Cible React :**
  - `pages/app-versions/AppVersionsPublicPage.tsx`
  - `features/app-versions/components/{AndroidDownloadCard.tsx, AppVersionHistory.tsx, AppVersionHistoryItem.tsx, IosTestflightCard.tsx}`
  - `features/app-versions/data/iosSteps.ts`
  - `features/app-versions/lib/format.ts` (`formatDownloadCount`, dates)
  - `hooks/useDeviceType.ts` (partagé, UA)
  - `api/useActiveAppVersions.ts` (`select` → `{latest, older}`).

### src/components/app-versions/AppVersionCreateModal.vue (287 l.)
- **Rôle :** dialog « Nouvelle version » / « Uploadez un fichier APK et renseignez les informations de la version. ». Émissions `saved(version)`, `close`. Le formulaire est remis à zéro à chaque ouverture.
- **Champs :**
  - Fichier APK obligatoire via `FileDropzone` (`accept=".apk"`, fichier unique ; textes « Glissez-deposez votre fichier APK ici » / « ou cliquez pour parcourir » / « Fichiers .apk uniquement » / « Lecture du fichier... »). Un fichier sans `.apk` (sensible à la casse) → « Veuillez sélectionner un fichier APK ». Lecture en base64 via `FileReader.readAsDataURL` avec progression ; échec → « Erreur lors de la lecture du fichier ». Une fois choisi : carte fichier (nom, taille) + bouton retirer.
  - `versionCode` (number, défaut 1, hint « Numéro incrémental unique (ex: 10, 11, 12...) »).
  - `versionName` (hint « Format sémantique (ex: 1.2.3) », non validé).
  - `changelog` (Textarea 4 lignes).
- **Validation :** bouton désactivé tant que fichier + base64 + `versionCode > 0` + `versionName.trim()` ne sont pas réunis.
- **Soumission :** `createVersion({apkB64, versionCode, versionName, originalFileName, changelog||undefined})` → **POST `app-versions`**.
  - Succès (`success && version`) : toast « Version créée avec succès ! » / « Succès ».
  - Sinon : `response.message ||` « Erreur lors de la création » ; fallback « Erreur lors de la création de la version ». Erreur à la fois dans l'encart et en toast.
  - Fermeture bloquée pendant l'enregistrement ou la lecture.
- **UI :** Dialog `max-h-[90dvh] overflow-y-auto sm:max-w-lg`, Input, Textarea, Button (ghost `icon-sm`), FileDropzone (maison). **Icônes :** `AlertCircle`, `FileIcon` (lucide-react : `File`), `X`, `LoaderCircle`.
- **Bugs :** l.235 (base64 dans du JSON, environ +33 %, avec le timeout de 30 s de l'ApiClient : risque de TIMEOUT sur un gros APK, tout le fichier en mémoire) ; l.159 (sensibilité à la casse) ; FileDropzone affiche « Envoi en cours... » pendant une lecture locale.
- **Cible React :** `features/app-versions/components/AppVersionCreateDialog.tsx`, `hooks/useApkFileReader.ts`, `schemas/createAppVersion.ts` (zod : `file` instanceof File + `.apk`, `versionCode` `z.coerce.number().int().positive()`, `versionName` trim min 1, `changelog` optionnel), `api/useCreateAppVersion.ts`.

### src/components/app-versions/AppVersionEditModal.vue (235 l.)
- **Rôle :** props `modelValue`, `versionId`. À l'ouverture (`watch immediate`), `getVersionById` → **GET `app-versions/{id}`**. Si `!success` → « Version non trouvée » ; fallback « Erreur lors du chargement de la version ».
- **Lecture seule :** Version (Build), Fichier, Taille, Téléchargements, « Créé le » (`fr-FR` avec heure), « Créé par ».
- **Champs :** `isActive` (Checkbox en carte-label, « Version active » / « Les versions inactives ne sont pas visibles publiquement ») et `changelog`.
- **Soumission :** `updateVersion(id,{changelog||undefined, isActive})` → **PUT `app-versions/{id}`**. Toast « Version modifiée avec succès ! » ; sinon « Erreur lors de la modification » / « Erreur lors de la modification de la version ».
- **UI :** Dialog, Textarea, Checkbox, Button.
- **Bugs :** l.200 (impossible de vider les notes) ; l.9-14 et 150-160 (après un échec de chargement, formulaire vide avec « Enregistrer » actif).
- **Cible React :** `features/app-versions/components/AppVersionEditDialog.tsx` (`useAppVersion(id,{enabled:open})` + `useUpdateAppVersion`, RHF + zod `{changelog:string, isActive:boolean}`).

### src/services/appVersions.ts (112 l.)
Copié tel quel.
- Public : `getActiveVersions` (GET `app-versions`), `getLatestVersion` (GET `app-versions/latest`), `checkForUpdate` (GET `app-versions/check?currentVersion=`), `getVersionById` (GET `app-versions/{id}`), `getDownloadUrl(id)`, `getLatestDownloadUrl()`.
- Admin : `getAllVersions` (GET `app-versions/admin`), `createVersion` (POST), `updateVersion` (PUT), `deleteVersion` (DELETE).
- `getLatestVersion` et `checkForUpdate` ne sont pas utilisés côté web (`useVersionCheck` a son propre `checkForUpdate`).

### src/models/AppVersionDTO.ts (74 l.)
- `AppVersionDTO{id:string, versionCode, versionName, originalFileName, fileSize, changelog?, isActive, downloadCount, downloadUrl, createdAt:string, createdByUuid?, createdByName?}`.
- Réponses : `ListResponse{success, versions}`, `Response{success, message?, version}`, `CheckResponse`, `CreateAppVersionRequest`, `UpdateAppVersionRequest{changelog?, isActive?}`, `SuccessResponse`.
- Copié tel quel.

---

## 1. Composants shadcn nécessaires (périmètre)
`button`, `input`, `label`, `form`, `textarea`, `checkbox`, `alert` (ajouter des classes success/info/warning), `dialog`, `alert-dialog`, `tabs` (ou `toggle-group`), `badge`, `table` (+ recette data-table), `context-menu`, `collapsible`, `separator`, `avatar`, `sonner`, `card` (optionnel : cartes auth et téléchargement), `sheet` (optionnel : menu mobile de la landing).
**Ne pas utiliser `accordion` pour la FAQ** : Radix démonte le contenu fermé, donc les réponses disparaîtraient du HTML pré-rendu. Garder `<details>`.

**Composants maison (`components/shared`) :**
- `InputField` : label lié par `htmlFor`/`id`, icône, hint, erreur, bouton afficher/masquer le mot de passe, **`required` transmis** à l'input, intégration `FormField`.
- `FileDropzone` (ajouter `role="button"`, `tabIndex` et gestion clavier).
- `BrandLogo`.
- `icons/AndroidIcon`, `icons/AppleIcon`.

**Layouts :** `components/layout/LegalLayout`, `features/auth/components/AuthCard` (coquille commune des 6 pages auth).

## 2. Hooks TanStack Query / mutations

| Hook | Service | Query key / mutationKey | Invalidations / effets |
|---|---|---|---|
| `useLoginMutation` | `authService.login` via l'action Zustand `login` | `['auth','login']` | onSuccess : contrôles vérifié/actif (sinon `logout` + erreur) ; `queryClient.clear()` au changement d'utilisateur |
| `useGoogleSignInMutation` | `authService.loginWithGoogle` | `['auth','google']` | `AUTHENTICATED` → `applySession` ; `NEEDS_REGISTRATION` → store de handoff + navigation |
| `useRegisterMutation` | `authService.register` | `['auth','register']` | aucune |
| `useGoogleRegisterMutation` | `authService.registerWithGoogle` | `['auth','google-register']` | onSuccess : `clearRegistration()` |
| `useVerifyEmailQuery(token)` | `authService.verifyEmail` | `authKeys.verifyEmail(token)` = `['auth','verify-email',token]` | `enabled:!!token`, `retry:false`, `staleTime:Infinity`, `refetchOnWindowFocus:false` |
| `useRequestPasswordResetMutation` | `authService.requestPasswordReset` | `['auth','password-reset','request']` | aucune |
| `useConfirmPasswordResetMutation` | `authService.confirmPasswordReset` | `['auth','password-reset','confirm']` | aucune |
| `useAdminAppVersions` | `appVersionsService.getAllVersions` | `appVersionKeys.admin()` = `['app-versions','admin']` | `select` : `versions ?? []` trié par `versionCode` décroissant |
| `useActiveAppVersions` | `getActiveVersions` | `['app-versions','active']` | `select` → `{latest, older}` |
| `useAppVersion(id)` | `getVersionById` | `['app-versions','detail',id]` | `enabled: open && !!id` ; lève une erreur si `!success` |
| `useCreateAppVersion` | `createVersion` | `['app-versions','create']` | invalide `['app-versions']` ; toast sonner |
| `useUpdateAppVersion` | `updateVersion` | `['app-versions','update']` | `setQueryData(detail)` + invalide `['app-versions']` |
| `useDeleteAppVersion` | `deleteVersion` | `['app-versions','delete']` | invalide `['app-versions']` (option : retrait optimiste de la liste admin) |

Fichiers : `features/auth/api/queryKeys.ts` (`authKeys`), `features/app-versions/api/queryKeys.ts` (`appVersionKeys.all = ['app-versions']`). Les URL de téléchargement restent des fonctions pures du service (pas de query).

## 3. Bugs suspectés

**Auth**
- **B1** `Login.vue:211` : « Voir » du prompt mobile → `/quick-login?setup=true`, route inexistante, donc 404 juste après la connexion. La cible voulue est probablement `/add-to-homescreen`.
- **B2** `HomeScreenPrompt.vue:2` : une fermeture par overlay ou Échap n'émet ni `navigate` ni `dismiss`. L'utilisateur reste connecté sur `/login`, sans redirection. Le prompt réapparaît à chaque connexion mobile (rien n'est mémorisé).
- **B3** `Login.vue:158`, `Register.vue:268`, `ForgotPassword.vue:88`, `ResetPassword.vue:134` : une réponse `success:false` sans exception ne produit aucun retour visible. `Verify.vue:105` : la carte reste vide.
- **B4** `Verify.vue:109`, `ResetPassword.vue:138` : `setTimeout` non nettoyé, donc retour forcé à `/login` même après avoir quitté la page.
- **B5** `ResetPassword.vue:26-34` et `107-109` : deux messages d'erreur quand le token manque.
- **B6** `components/ui/input-field/InputField.vue:11-31,84-97` : la prop `required` sert seulement à l'astérisque, elle n'est pas transmise à `<input>`. Pas de validation native : Login et Register peuvent envoyer des champs vides. Le `<Label>` n'est pas lié à l'input (a11y).
- **B7** Login, Register, Forgot, Reset, Verify : « Network error » / « Request timeout » s'affichent en anglais. Seuls les parcours Google traduisent `NETWORK_ERROR`/`TIMEOUT`.
- **B8** `Login.vue:191-200`, `Register.vue:217-226`, `useGoogleSignIn.ts:37` : Google ne vérifie pas vérifié/actif côté client, contrairement à `Login.vue:160-171`. Register Google saute le prompt écran d'accueil.
- **B9** `GoogleRegister.vue:133` : flash du formulaire avant la redirection vers `/login`.
- **B10** `getDefaultRoute` copié trois fois : `router/index.ts:16`, `Login.vue:118`, `Register.vue:207`.
- **B11** `GoogleSignInButton.vue:78-79` : thème et largeur figés au montage ; pas de nettoyage ; `initialize()` rappelé à chaque montage.
- **B12** `useBrowserDetection.ts:136-137` : Chrome desktop reçoit les instructions Android. `AddToHomescreen.vue:29,91-92` : onglets en icône seule sans `aria-label`, même icône pour les deux Chrome. AddToHomescreen n'a pas de titre de page.
- **B13** `api/index.ts:51` : un 401 sur `auth/google` ou `auth/google/register` redirige vers `/login` depuis une page publique, et le message d'erreur est perdu.

**App.vue**
- **B15** `App.vue:76` : `pagesWithoutNavbar` contient `'login','register','verify','forgot-password','reset-password','unauthorized'`, alors que les routes s'appellent `Login`, `Register`, `Verify`, `ForgotPassword`, `PasswordReset`, `Unauthorized`. Résultat : un utilisateur connecté voit la navbar sur `/unauthorized` et les pages auth secondaires. `App.vue:125` : `id="app"` dupliqué.

**Commun**
- **B16** `NotFound.vue:35,73` : « Tableau de bord » pointe vers `/vehicules` en dur. Un UTILISATEUR tombe sur `/unauthorized`. La condition `history.length > 1` n'est pas fiable.
- **B17** `Unauthorized.vue:21-24` : texte obsolète (« Seuls les Administrateurs et Mécaniciens… », « utilisez l'application mobile ») alors que les utilisateurs ont des routes web. La page sert aussi aux comptes inactifs, sans autre action que la déconnexion.

**Légal**
- **B18** `LegalLayout.vue:136-143` : style `.todo` mort.

**Landing**
- **B19** `Landing.vue:448-467,508-517,965-976` : `<button>` dans `<a>` (HTML invalide).
- **B20** `Landing.vue:152` : état du header non initialisé au montage.
- **B21** `Landing.vue:44-49` : travail DOM à chaque scroll, sans throttle. `l.159` : pas de réaction au resize.
- **B22** `Landing.vue:69-84,1150,1165` : les animations ignorent `prefers-reduced-motion`.
- **B23** `Landing.vue:692,1185-1196,1209-1231` : CSS et classes mortes.
- **B24** `Landing.vue:475,495` : `aria-controls` vers un élément absent ; pas de fermeture par Échap ni clic extérieur.
- **B25** `FleetViewer.vue` : code mort qui laisse `three` et `@tresjs/*` en dépendances, un `manualChunks.threejs` (`vite.config.js:129`), 4 Mo de `.glb` publics et `Allow: /models/` dans robots.txt.

**Versions d'app**
- **B26** `AppVersionEditModal.vue:200` : `changelog || undefined`, donc impossible de vider les notes de version.
- **B27** `AppVersionCreateModal.vue:235` : APK en base64 dans du JSON avec le timeout de 30 s (`api/index.ts:9`), risque de TIMEOUT et forte consommation mémoire. `l.159` : `.apk` sensible à la casse. `versionName` n'est pas validé.
- **B28** `AppVersions.vue:337-353` : pas d'état de chargement sur Supprimer (double DELETE possible). `l.12-14` : une erreur masque toute la page, sans réessai.
- **B29** `AppVersions.vue:90-94`, `AppVersionsPublic.vue:80-89,142-151,223-235` : `<Button>` dans `<a>`.
- **B30** `router/index.ts:276-280` vs `navConfig.ts:328` : route ouverte à tout admin, lien limité à un email.
- **B31** `AppVersionsPublic.vue:342-349` : `formatDate` sans garde. `l.81` : « latest » serveur et dernière version client peuvent diverger.
- **B32** `formatFileSize` copié trois fois en B/KB/MB (`AppVersions.vue:265`, `AppVersionsPublic.vue:336`, `AppVersionCreateModal.vue:220` ; aussi `AppVersionEditModal.vue:165`), alors que `utils/fileUtils.ts:12` produit o/Ko/Mo.
- **B33** `AppVersionEditModal.vue:9-14,150-160` : après un échec de chargement, formulaire vide et enregistrable.

**Pièges de migration (pas des bugs actuels)**
- `<img src="/src/assets/favicon.png">` : ce chemin fonctionne en Vue grâce à plugin-vue, mais en JSX il faut un import.
- Le JSON-LD ne doit pas être rendu dans `#app`, à cause de `prerender.cjs:327`.
- Garder `<div id="app"></div>` et `createRoot`, pas `hydrateRoot`.
- Mettre à jour les chemins sources du sitemap (`vite.config.js:47-48`).
- StrictMode : double appel de `verifyEmail` et double `renderButton` GIS.

## 4. Points d'ombre à trancher avec le propriétaire
1. **FleetViewer mort depuis `751eedd`** : abandonner `@react-three/fiber` et `drei`, qui n'auraient aucun autre consommateur, et supprimer `public/models/*.glb` ainsi que `Allow: /models/` ? Ou réintégrer un viewer 3D sur la landing ?
2. **Google :**
   - activer le One Tap (prop existante, jamais utilisée) ?
   - le bouton doit-il suivre le thème en direct ?
   - faut-il ajouter les contrôles vérifié/actif côté client après `AUTHENTICATED` ?
   - Register Google doit-il proposer le prompt écran d'accueil comme Login ?
   - que faire quand un 401 est intercepté pendant ce parcours ?
   - confirmer le nom de variable `VITE_GOOGLE_CLIENT_ID`.
3. **Prompt écran d'accueil :** cible de « Voir » (`/add-to-homescreen` ?), fréquence (à chaque connexion ou une seule fois, mémorisé en localStorage ?), comportement à la fermeture par overlay. Faut-il exploiter `beforeinstallprompt`, aujourd'hui absent ?
4. **Unauthorized :** réécrire le texte, distinguer « compte inactif » et « droits insuffisants », ajouter un bouton « Retour » vers la route par défaut ?
5. **NotFound :** le lien « Tableau de bord » doit-il pointer vers la route par défaut selon le rôle ?
6. **`/app-versions` :** garde « admin » ou « email autorisé » ? Faut-il aligner la route et le menu ?
7. **Métadonnées React 19 et balises statiques d'index.html :** les balises natives s'ajoutent sans remplacer celles d'index.html, d'où des doublons robots/description/canonical. Sur `/login`, cela donnerait **deux canonical en conflit** (`/` statique et `/login`). Le comportement exact avec le `<title>` existant reste aussi à vérifier. Options :
   - garder un petit hook `usePageMeta` qui modifie les balises existantes, comme aujourd'hui ;
   - retirer ces balises d'index.html et adapter `prerender.cjs` pour capturer aussi `<head>`.
8. **Upload APK :** garder base64 JSON (et augmenter le timeout pour cet appel) ou passer en multipart côté backend ?
9. **Notes de version vides :** le backend accepte-t-il `changelog: ""` ou `null` pour les effacer ?
10. **Landing :** respecter `prefers-reduced-motion` partout ? Conserver la mise à l'échelle au-delà de 1920 px et le mode clair forcé ? Le futur ThemeProvider React devra exempter `/`, comme le script anti-FOUC.
11. **Redirection post-login :** ajouter `?redirect=` (absent aujourd'hui) ou garder la parité ?
12. **Messages d'erreur :** centraliser une fonction `getErrorMessage(err)` en français (réseau/timeout) pour toutes les pages auth ?
13. **Pages légales :** la date « 24 juin 2026 » est codée en dur. Les passer en données ?

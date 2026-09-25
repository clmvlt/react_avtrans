# Inventaire : utilisateurs, services (monitoring), profil, notifications

Tout a été lu en entier, sauf `UserServices.vue.b` : c'est une sauvegarde, je l'ai seulement signalée. Aucun fichier n'a été modifié.

**Routes de ce périmètre** (`router/index.ts`) :

| Route | Vue | Garde |
|---|---|---|
| `/users` | Users.vue | `requiresAuth` et `requiresAdmin` |
| `/users/:uuid` | UserEdit.vue | idem |
| `/users/:uuid/services` | UserServices.vue | idem |
| `/services` | ServicesMonitoring.vue | idem |
| `/profile` | Profile.vue | `requiresAuth` |
| `/notifications` | Notifications.vue | `requiresAuth` |

Toutes ces routes passent aussi par le garde global : email vérifié, sinon logout puis `/login` ; compte actif, sinon `/unauthorized`. Sur une page admin, le garde désactive le mode `viewAsUser`.

Dans le menu (`navConfig`) : « Utilisateurs » pointe vers `/users` et « Services » vers `/services`, admin uniquement. Aucun lien de l'application ne mène à `/users/:uuid`.

**Règle `isVisible` / `selectableUsers()` : elle est respectée partout dans ce périmètre.**
- `Users.vue` est l'administration des comptes : il utilise GET /users sans filtre, avec une case « Afficher les masqués » cochée par défaut. C'est correct.
- `usePendingUsers` utilise GET /users sans filtre. C'est correct, car l'activation relève de l'administration des comptes.
- `ServicesMonitoring` utilise GET /users/status. D'après le contrat, cette liste exclut déjà les masqués, donc pas de filtre à ajouter.
- Aucun sélecteur d'utilisateur n'existe dans `UserServices`, `UserEditModal`, `UserEmailModal`, `UserHoursModal`, `Profile` ou `Notifications`.
- Côté React, il ne faudra pas ajouter `selectableUsers()` dans ces écrans.

---

### src/views/users/Users.vue (987 l.)
- **Rôle / route** : `/users`, admin. C'est la liste de tous les comptes.
  - Aucun paramètre lu.
  - Écrit `/absences?userUuid=<uuid>` via `goToUserAbsences`.
  - Navigue vers `/users/:uuid/services` et `/vehicules/:vehiculeId`.
- **Par rôle** : admin uniquement. Le mode « vue utilisateur » est coupé par le garde.
- **Appels API** :
  - `usersService.getUsers()` : GET `users`, réponse `ApiResponse<UserDTO[]>` (clé `data`). Un tableau nu est aussi toléré (l.834-840).
  - `usersService.getUsersLastVehicles()` : GET `users/last-vehicles`, réponse `UserLastVehicleDTO[]` nu (`{userUuid, vehiculeId, vehiculeImmat, date}`). Les erreurs sont avalées en silence (l.891).
  - Les deux appels partent en `Promise.all`.
  - `usersService.updateUser(uuid, {isActive:true})` : PUT `users/{uuid}`, réponse `{success, message, user}`. Sert au bouton « Activer ».
  - `usersService.deleteUser(uuid)` : DELETE `users/{uuid}`.
- **Données dérivées / état** :
  - `filteredUsers` ajoute des clés de tri à plat : `fullName`, `roleName`, `isMailVerifiedSort`, `isActiveSort`, `statusSort`. Filtre sur les masqués, puis recherche sur nom ou email, sans tenir compte de la casse.
  - `sortedData` : tri générique `getValue` avec essai de parsing en date, puis nombre, puis `localeCompare('fr')`.
  - `hiddenUsersCount` : nombre de masqués.
  - `pendingActivationUsers` : `isPendingActivation` (inactif et créé il y a 7 jours ou moins).
  - `lastVehiclesMap` : Map uuid → dernier véhicule.
  - Watcher `contextMenuRef.menuElement` → `contextMenu.menuRef` (calcul de débordement du viewport).
  - `setFromUsers(users)` synchronise le badge de la navbar.
  - Pas de timer, pas de localStorage.
- **Formulaires & dialogs** :
  - Suppression (Dialog) :
    - Encadré « Attention : Cette action est irréversible ! », qui liste les pointages, l'historique des services et les données personnelles.
    - Saisie obligatoire de `CONFIRMER` : le bouton « Supprimer définitivement » reste désactivé tant que le texte diffère ; Entrée valide si le texte correspond.
  - `UserEditModal`, `UserEmailModal`, `UserHoursModal` (appelé par `ref.open(uuid, name)`).
  - Toasts :
    - chargement : `err.message || 'Erreur lors du chargement des utilisateurs'` ;
    - activation réussie : `Le compte de X Y a été activé`, titre « Compte activé » ;
    - activation échouée : `"Erreur lors de l'activation du compte"` ;
    - suppression réussie : `'Utilisateur supprimé avec succès'`, titre « Succès » ;
    - suppression échouée : `'Erreur lors de la suppression'`.
- **Tables** :
  - Colonnes du tableau desktop :
    - Utilisateurs (N) : avatar ou initiales, nom, email, liens `tel:` perso et pro. Tri sur `fullName`.
    - Email : badge Vérifié / Non vérifié et bouton crayon qui ouvre la modale email. Tri.
    - Rôle : pastille colorée `role.color`, ou « Aucun rôle ». Tri sur le nom.
    - Présence : En service / En pause / Absent. Tri.
    - Compte : Actif / Inactif, plus badge « Masqué ». Tri.
    - Dernier véhicule : immatriculation, « Aujourd'hui » / « Hier » / date, lien vers le véhicule. Pas de tri.
    - Actions (5 boutons) : Services, Heures, Absences, Modifier, Supprimer.
  - Pas de pagination (tout est côté client).
  - Les lignes masquées ont `bg-muted/40`.
  - Clic droit (`useContextMenu` + `ContextMenuPopover`) : Services, Heures, Absences | Modifier l'email, Modifier | Supprimer (en destructive).
  - Mobile (< md) : cartes, avec un DropdownMenu qui porte les mêmes actions que le clic droit.
  - État vide : « Aucun utilisateur trouvé ».
- **ui → shadcn** :
  - Button, Input, Badge, Checkbox, Table → Table + `@tanstack/react-table` ;
  - Dialog → AlertDialog ;
  - DropdownMenu ;
  - ContextMenuPopover maison → shadcn **ContextMenu** ;
  - `useMessages` → sonner.
- **Styles** : Tailwind uniquement, tokens shadcn. Les couleurs des badges sont en dur (green-500, amber-500). Bascule mobile / desktop à `md`.
- **Bugs suspectés** :
  - l.464-470 : `deleting` est déclaré (l.639) mais pas branché sur le bouton → double suppression possible.
  - l.926 : un échec de suppression écrit dans `error`, ce qui remplace toute la page par le bloc d'erreur (l.13) pendant que le dialog reste ouvert.
  - l.914-931 : `removePending` n'est pas appelé après suppression → le badge de la navbar reste faux si on supprime un compte en attente.
  - l.948 et l.969 : `handleUserSaved` / `handleEmailSaved` remplacent l'objet entier par la réponse du PUT (sans fusion), alors que `activateUser` fusionne (l.870). Si le PUT ne renvoie pas `status`, la présence retombe à « Absent ».
  - l.760-764 : `Date.parse(1)` est valide sous V8 (année 2001) → les clés numériques passent par la branche « date ». Sans effet aujourd'hui, mais fragile.
  - l.645 et l.933-937 : `isCreating` ne vaut jamais true et il n'existe aucun bouton « Créer » → code mort.
  - l.491-493 : les props de `UserEmailModal` et le nom dans le dialog de suppression sont remis à null pendant l'animation de fermeture → le texte clignote.
- **Cible React** : voir la section « Découpage » plus bas.

### src/views/users/UserEdit.vue (465 l., dont 230 l. de `<style scoped>`)
- **Rôle / route** : `/users/:uuid`, admin. Lit `route.params.uuid`. **Page orpheline** : rien ne pointe vers elle dans l'application. Elle doublonne `UserEditModal`.
- **Appels API** : `usersService.getOne(uuid, token)` (l.162) et `usersService.update(uuid, data, token)` (l.200). **Ces deux méthodes n'existent pas** : `UsersService` a `getUserById` et `updateUser`. La page affiche donc toujours l'erreur « usersService.getOne is not a function ».
- **État / timers** : `setTimeout(router.push('/users'), 2000)` après enregistrement (l.210), sans nettoyage.
- **Formulaire** :
  - Champs : prénom, nom, email (tous `required` en HTML natif), rôle en `<select>` natif avec les UUID en dur (l.74-76), case « Compte actif ».
  - Envoie `email`, qui ne fait pas partie d'`UpdateUserRequest` (l.191).
  - Message de succès : « Utilisateur modifié avec succès ! ».
- **Styles** : variables legacy inexistantes ou sans version dark (`--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--text-primary`, `--text-secondary`, `--border-primary`, `--space-*`, `--radius-*`, `--primary-alpha`, `--primary-light`, `--success`, `--error`, `--color-text-primary`…), emojis 📊 ✓ ✗, `<script setup>` sans TypeScript.
- **Cible React** : **ne pas migrer**. Supprimer la route, ou rediriger `/users/:uuid` vers `/users` (voir points à trancher).

### src/views/users/UserServices.vue (919 l.) et src/composables/useUserServices.ts (584 l.)
- **Rôle / route** : `/users/:uuid/services`, admin. C'est la gestion des pointages d'un employé.
  - Lit `route.params.uuid` (computed `userUuid`).
  - Un watcher recharge la page si l'uuid change sans démontage, uniquement si `route.name === 'UserServices'` ; il vide aussi les filtres.
  - Aucun query param : les filtres ne sont pas dans l'URL.
- **Appels API** :
  - `usersService.getUserById` : GET `users/{uuid}`, réponse `ApiResponse` ou DTO nu, pour le nom d'en-tête.
  - `userServicesService.getActiveService` : GET `services/admin/{uuid}/active`, réponse `{success, service|null}`.
  - `searchServices` : POST `services/admin/user/{uuid}`.
    - Corps : `{page, size:20, sortBy:'debut', sortDirection:'desc', startDate?:'YYYY-MM-DDT00:00:00', endDate?:'YYYY-MM-DDT23:59:59', isBreak?}`.
    - Réponse `PagedResponse<ServiceDTO>`.
    - D'après le modèle `AdminServiceSearchRequest`, l'API ne renvoie par défaut que les 30 derniers jours.
  - `getUserWorkedHours(uuid, {})` : GET `services/admin/hours/{uuid}`, réponse `ApiResponse<WorkedHoursDTO>` en heures décimales. Erreurs ignorées.
  - `createService` : POST `services/admin/create`.
  - `validateService` : PUT `services/admin/{serviceUuid}`.
  - `deleteService` : DELETE `services/admin/{serviceUuid}`.
  - `useServiceHistory().open` / `reload` : GET `services/admin/{uuid}/modifications`. La modale globale est montée dans App.vue.
  - Boutons d'action :

    | Bouton | Appels |
    |---|---|
    | Démarrer le service | `createService({userUuid, debut: new Date().toISOString()})` |
    | Démarrer une pause | `createService`, puis `getActiveService`, puis `validateService({isBreak:true})` |
    | Terminer le service / la pause | `validateService(activeUuid, {fin: now ISO})` |

  - Après chaque action : `loadUserStatus`, puis `loadServices()` (retour page 0), puis `reloadHistory`.
- **Données dérivées / état** :
  - `servicesByDay` (dans le composable) :
    - groupe par date locale ;
    - rattache une pause de nuit au service qui la contient ;
    - trie chaque jour par ordre chronologique et les jours du plus récent au plus ancien ;
    - pose les badges `startDayLabel` / `endDayLabel` avec l'infobulle « Le lendemain · … » ;
    - calcule `totalHours` = durée des services moins durée des pauses.
  - `hasActiveFilters` ; dans la page : `durationMinutes`, `durationInvalid`, `durationLabel` et `showServiceModal`, un computed en lecture/écriture.
  - Pas de timer.
- **Formulaires & dialogs** :
  - Service (création ou édition) :
    - Choix Service / Pause : deux boutons en création, lecture seule en édition.
    - Début : date et heure, `required`.
    - Case « Service terminé » / « Pause terminée », qui préremplit la fin.
    - Fin : date et heure, `required` si la case est cochée.
    - Si la fin précède le début : avertissement « La fin précède le début. » avec le lien « Terminer le lendemain ». Ce n'est pas bloquant.
    - Erreur : `err.message || 'Une erreur est survenue'`.
    - Titres : « Nouveau service », « Modifier le service », « Modifier la pause ».
  - Suppression : « Supprimer ce {pause|service} ? » / « Cette action est irreversible. ».
  - Carte (Mapbox) : heures, coordonnées début et fin, « Position non disponible » si 0,0.
  - Filtres : date de début, date de fin, type (Tous / Services / Pauses), avec « Reinitialiser » et « Appliquer ».
  - Messages d'erreur du composable :
    - « Erreur lors du chargement des services » ;
    - « Erreur lors du démarrage du service » ;
    - « Erreur lors de la fin du service » ;
    - « Erreur lors du démarrage de la pause » ;
    - « Erreur lors de la fin de la pause ».
- **Liste** :
  - Cartes par jour : nom du jour, date, total, bouton « Ajouter un service » (préremplit la date du jour concerné).
  - Chaque ligne affiche : barre de couleur, badge Pause, heure début → fin, badges de décalage de jour, « En cours », badge « Modifié » (infobulle `Modifié par X le …`, clic → historique), durée.
  - Actions desktop (icônes) : Localisation (en rouge si 0,0), Historique, Modifier, Supprimer. Sur mobile : DropdownMenu.
  - Pagination serveur : 20 par page, boutons première / précédente / suivante / dernière, affichage « Page x/y (total) ».
  - Carte de statut (En service / En pause / Absent, avec la durée depuis le début) et 4 cartes de stats (Aujourd'hui, Semaine, Mois, Mois dernier).
- **ui → shadcn** :
  - Button, Input (type date / time), Badge, Checkbox ;
  - Select maison → shadcn Select ;
  - Dialog, AlertDialog pour la suppression ;
  - Tooltip, DropdownMenu ;
  - ToggleGroup pour Service / Pause ;
  - Collapsible pour le panneau de filtres ;
  - Pagination.
- **Libs tierces** : mapbox-gl, via `useMapModal` (voir plus bas).
- **Styles** : Tailwind et tokens shadcn, plus couleurs en dur (green, amber, sky, violet, purple-800). Grille des stats : 2 colonnes, puis 4 à partir de `lg`.
- **Bugs suspectés** :
  - l.508 avec `useMapModal` l.72 et l.115 : fermer la carte par l'overlay ou Échap ne passe pas par `closeMapModal` → `map.remove()` n'est jamais appelé. L'ouverture suivante écrase `map` → **fuite de contextes WebGL**.
  - l.261-269 avec `useMapModal` l.37-40 : le bouton Localisation (rouge) s'affiche pour des coordonnées 0,0, mais `showLocationMap` sort aussitôt → le clic ne fait rien.
  - l.32 : `calculateDuration(activeServiceStart)` n'a pas de timer → la durée reste figée.
  - l.900-905 : `loadHours` n'est pas relancé après une création, modification, suppression ou action → cartes de stats périmées.
  - Composable l.364, 383, 410, 427, 443, 465, 482 : `loadServices()` sans numéro de page → retour à la page 0 après chaque action.
  - Composable l.369, 388, 414, 433 : les erreurs d'action remplacent toute la liste par le bloc d'erreur, sans toast.
  - Composable l.394-408 : `startBreak` fait 3 appels non atomiques. Si `getActiveService` renvoie le service principal plutôt que le nouveau, **c'est le service principal qui devient une pause**. Or `createService` accepte déjà `isBreak` (l.460), et l'endpoint `services/break/start {userUuid}` existe.
  - Composable l.362 contre l.454 : l'heure de début part en UTC `…Z` dans un cas, en heure locale naïve `YYYY-MM-DDTHH:mm:00` dans l'autre.
  - Composable l.297-301 : les dates de filtre sont envoyées au format datetime, alors que le type du service documente `yyyy-MM-dd` et que l'astuce « +1 jour » n'est appliquée qu'à `/services/history` → à vérifier.
  - l.857-860 et composable l.472 : en édition, décocher « terminé » envoie `fin: undefined` (champ omis) → l'API conserve probablement l'ancienne fin, **impossible de rouvrir un service**. Même chose pour effacer des coordonnées (`|| undefined`).
  - l.893-895 : un échec de suppression est avalé sans message.
  - `servicesByDay` travaille sur une page de 20 pointages → **le total d'un jour à cheval sur deux pages est faux**.
  - l.786 avec `timeFormatters.getTodayDate` l.130-133 (`toISOString`, donc UTC) : entre 0 h et 1-2 h, heure de Paris, la date proposée par défaut est la veille.
  - l.485 : « Supprimer ce pause ».
  - Composable l.500-511 : `getStatusText` contient des emojis (🟢🟡⚫) alors qu'une pastille de couleur est déjà affichée.
  - Typage `any` partout.
- **Cible React** : voir « Découpage ».

### src/views/users/UserServices.styles.css (957 l.)
- **Aucun import dans tout le projet** (recherche de `UserServices.styles` : zéro résultat) → **code mort**.
- Contenu : variables legacy (`--color-bg-*`, `--color-*-rgb`…), `!important` (l.527), et des classes (`.page-header`, `.modal-overlay`…) qui correspondent à l'ancienne version sauvegardée.
- À supprimer.

### src/views/users/UserServices.vue.b (≥ 2 588 lignes non vides, 80 Ko, 03/12/2025)
- Sauvegarde de l'ancienne version : import direct de mapbox-gl, `<style scoped>` à la l.1460. Rien ne la référence.
- Ignorée comme demandé. À supprimer, ne pas migrer.

### src/components/users/UserEditModal.vue (564 l.)
- **Rôle** : dialog d'édition d'un compte, ouvert depuis Users.vue.
  - Props : `modelValue`, `userUuid`, `initialUser`, `isCreating`.
  - Emits : `update:modelValue`, `saved(UserDTO)`, `close`.
- **Appels API** :
  - `getUserById` en secours, si `initialUser` est absent ; la réponse est normalisée par `extractUser` (`user`, `data` ou objet nu).
  - `updateUser` : PUT `users/{uuid}`.
  - Corps envoyé :
    - `{firstName, lastName, isActive, isCouchette, address{street, city, postalCode, country}, driverLicenseNumber, telPersonnel.trim(), telPro.trim(), heureContrat}` ;
    - `roleUuid`, seulement s'il est renseigné ;
    - `isVisible`, seulement s'il a changé.
- **État / watchers** : watcher `modelValue` (immediate) → `resetForm` puis `populateForm`. Les champs sont des refs séparées. `roleUuidSelect` est un computed en lecture/écriture.
- **Formulaire** :
  - Prénom et Nom (`required` natif) ;
  - Email : désactivé en édition, avec l'indice « L'email ne peut pas être modifié » ;
  - Mot de passe : création seulement, indice « Minimum 8 caractères » ;
  - Rôle : Select maison `clearable`, `:teleport=false`, UUID en dur (l.355-359) ;
  - 3 cases en carte : « Compte actif », « Permission couchette », « Visible dans les services et le planning » (édition seulement, avec un long texte d'aide) ;
  - Heures mensuelles du contrat (type number, indice « ex: 151.67h ») ;
  - Téléphone perso et pro ;
  - Numéro de permis ;
  - Rue en `AddressAutocomplete`, qui remplit ville, code postal et pays ;
  - Ville, Code postal, Pays (« France » par défaut) ;
  - Bloc « Informations système » : email vérifié, UUID, créé le, modifié le.
  - Toasts : « Utilisateur modifié avec succès ! » / « Erreur lors de la modification ».
  - Fermeture bloquée pendant l'enregistrement.
- **ui → shadcn** :
  - Dialog, Button, Checkbox, Select ;
  - InputField et AddressAutocomplete → `components/shared` ;
  - Form avec react-hook-form et zod.
- **Styles** : Tailwind ; tokens personnalisés `success`, `warning`, `info` (définis dans `tailwind.css`, absents de shadcn par défaut).
- **Bugs suspectés** :
  - l.468-488 : le mode création est **factice** (TODO) : aucun appel API, mais le toast « Utilisateur créé avec succès ! » s'affiche. Branche morte.
  - l.29-32 : `success` n'est jamais renseigné → bannière morte.
  - l.508-510 : vider le rôle ne l'envoie pas → le rôle reste inchangé sans prévenir.
  - l.506 : `heureContrat` n'est pas validé (valeurs négatives acceptées) et 0 devient `null`.
  - l.495-501 : l'adresse et le permis sont toujours envoyés, même vides.
  - Seul le `required` natif protège prénom et nom : une saisie d'espaces passe.
  - `USER_ROLE_UUIDS` existe dans `enums` mais n'est pas utilisé.
- **Cible React** : voir « Découpage ».

### src/components/users/UserEmailModal.vue (191 l.)
- **Rôle** : changer l'email ou renvoyer la vérification.
  - Props : `userUuid`, `userName`, `currentEmail`. Emits : `saved`, `close`.
- **API** : `usersService.resendVerificationEmail(uuid, email)` : POST `users/{uuid}/resend-verification` `{email}`, timeout 60 s, réponse `{success, message, user}`.
- **Formulaire** :
  - Un champ « Nouvel email », prérempli à l'ouverture.
  - Validation `^[^\s@]+@[^\s@]+\.[^\s@]+$`, sans message affiché : le bouton reste désactivé.
  - Si l'email est identique : texte « Cette action va renvoyer un email de vérification… », bouton « Renvoyer la vérification ».
  - Sinon : liste des 3 conséquences, bouton « Modifier l'email ».
  - Erreurs : 400 → « Cet email est déjà utilisé par un autre utilisateur » ; 404 → « Utilisateur non trouvé » ; sinon message par défaut.
  - Succès : « Email de vérification renvoyé avec succès ! » ou « Email modifié avec succès ! Un email de vérification a été envoyé. ».
- **ui → shadcn** : Dialog, Button, InputField (maison), Alert pour l'encadré « Important » (token `info`).
- **Bug suspecté** : l.173-174 : toute erreur 400 est présentée comme « email déjà utilisé ».
- **Cible React** : `features/users/components/UserEmailDialog.tsx` (environ 120 l.) et `features/users/schemas/userEmailSchema.ts`.

### src/components/users/UserHoursModal.vue (669 l.)
- **Rôle** : heures travaillées d'un employé par période. Ouvert via `defineExpose({open(uuid, name)})` depuis Users.vue et ServicesMonitoring.vue.
- **API** : `userServicesService.getUserWorkedHours(uuid, params)` : GET `services/admin/hours/{uuid}?period=&year=&month=&week=&day=`, réponse `WorkedHoursDTO` (day, week, month, year, lastMonth en heures décimales).
- **État / watchers** :
  - Période : `all`, `day`, `week`, `month` ou `year`.
  - `dateParams` = {year, month, week, dateString, monthString, yearString}.
  - **4 watchers** synchronisent les versions texte et numériques (anti-pattern).
  - 1 watcher recharge à chaque changement de date.
  - Calculs de semaine ISO (`getISOWeek`, `getISOWeekYear`, `getDateFromISOWeek`, `getISOWeeksInYear`).
- **UI** :
  - Boutons de période : Toutes, Jour, Semaine, Mois, Année.
  - Navigateur précédent / suivant, avec retour « Aujourd'hui », « Semaine actuelle », « Mois actuel » ou « Année actuelle ».
  - Sélecteurs : `input type=week` et `type=date` invisibles, `<select>` natifs dans une liste déroulante maison.
  - Cartes : Jour, Semaine, Mois, Année, Mois dernier.
  - Textes : « Aucune donnee disponible pour cette periode », « Erreur lors du chargement des heures ».
- **ui → shadcn** : Dialog, ToggleGroup (période), Button, Select et Popover (mois / année), Popover et Calendar (jour, optionnel), Card.
- **Bugs suspectés** :
  - l.316, 440, 446, 452, 456, 577 : `toISOString()` (UTC) → « aujourd'hui » est faux entre 0 h et 2 h. **Le jour précédent / suivant se bloque ou saute un jour au changement d'heure** : par exemple, le jour suivant après le 29/03/2026 reste le 29/03, et le jour précédent après le 26/10/2026 saute le 25/10.
  - l.305 : `now` est figé au montage de la page.
  - l.312 contre l.461 : l'année ISO sert aussi pour les périodes mois et année → fausse fin décembre et début janvier.
  - l.407-416 : la semaine suivante n'a pas de limite (on peut aller dans le futur), contrairement au jour, au mois et à l'année.
  - l.488-490 : l'année précédente descend sous le `min=2020`.
  - l.654-659 : l'arrondi peut produire « 7h 60m ».
  - l.301 : `showYearInput` est inutilisé.
  - l.616-652 : pas d'annulation de requête → une réponse ancienne peut écraser la plus récente.
  - l.71-86 : `<select>` natif, contraire aux règles du CLAUDE.md.
  - Accents manquants : « travaillees », « Annee », « Fevrier », « Aout ».
- **Cible React** : voir « Découpage ».

### src/views/common/ServicesMonitoring.vue (583 l.)
- **Rôle / route** : `/services`, admin, titre « Suivi des présences ».
  - Écrit `/absences?userUuid=`, `/acomptes?userUuid=` et `/users/{uuid}/services`.
- **API** : `usersService.getUsersWithStatus()` : GET `users/status`, `UserWithStatusDTO[]` nu (status, activeService.debut, hoursToday).
- **État / timers** :
  - `setInterval(refreshUsers, 10000)` et un écouteur `keydown` pour Échap, nettoyés au démontage.
  - Données dérivées : `presentUsers`, `onBreakUsers`, `absentUsers` (statut absent ou manquant), filtrés par recherche sur le nom.
  - `showAbsent` : section repliée par défaut.
  - Menu contextuel **maison dans la page** (sans `useContextMenu`), avec recalage dans le viewport.
- **UI** :
  - En-tête sticky avec 3 compteurs (présents, en pause, absents).
  - Recherche « Rechercher un employé... ».
  - 3 sections en grilles de 2 à 6 colonnes.
  - `UserCard` défini en ligne avec `defineComponent` et `h()` :
    - la carte est un RouterLink ;
    - avatar et pastille de statut, prénom / nom, statut · heure de début, heures du jour ;
    - DropdownMenu au survol (Services, Heures | Absences, Acomptes).
  - Clic droit : Gérer les services, Heures | Absences, Acomptes.
  - État vide avec « Effacer la recherche ».
  - Animations `TransitionGroup` via un `<style>` **global**.
- **ui → shadcn** : Input, Button, DropdownMenu, ContextMenu, Collapsible (Absents), Avatar, Badge. Animations via `tw-animate-css` ou supprimées.
- **Bugs suspectés** :
  - l.381 : l'entrée « Services » du menu fait `window.location.href` → rechargement complet de l'application.
  - l.370 : le déclencheur du menu est en `opacity-0 group-hover` → invisible sur tactile.
  - l.543-550 : `refreshUsers` ne remet pas `error` à zéro → si le premier chargement a échoué, la page reste en erreur malgré les rafraîchissements réussis.
  - l.555 : le rafraîchissement continue quand l'onglet est caché.
  - l.274 : arrondi « 7h60 ».
  - Section Absents repliée : les résultats de recherche y sont cachés.
- **Cible React** :
  - `pages/common/ServicesMonitoringPage.tsx` (environ 90 l.) ;
  - `features/monitoring/components/` : `PresenceStatsPills.tsx`, `PresenceSection.tsx` (variante repliable avec Collapsible), `PresenceUserCard.tsx` (Link + ContextMenu + DropdownMenu toujours visible sur mobile), `UserActionsMenuItems.tsx` ;
  - `features/monitoring/lib/groupByPresence.ts` (fonction pure) ;
  - requête `useUsersWithStatusQuery` avec `refetchInterval: 10_000` ;
  - réutiliser `UserHoursDialog`.

### src/views/common/Profile.vue (858 l.)
- **Rôle / route** : `/profile`, tout utilisateur connecté. Bouton « Retour » via `$router.back()`.
- **Par rôle** : la préférence « Modifications de pointage par un autre admin » (`serviceModification`) n'est affichée et modifiable que si `authStore.isAdmin`. Le reste est identique pour tous.
- **API** :
  - `profileService.getProfile` : GET `profile`, `UserDTO` nu.
  - `profileService.updateProfile` : PUT `profile` `{firstName, lastName, picture?}`. `picture` : base64 pour une nouvelle photo, `""` pour la supprimer, `undefined` pour ne rien changer.
  - `profileService.changePassword` : PUT `profile/password` `{currentPassword, newPassword}`.
  - `usersService.getMyNotificationPreferences` : GET `users/me/notification-preferences`, DTO nu. Appelé seulement si le profil ne contient pas les préférences.
  - `usersService.updateMyNotificationPreferences` : PUT, même endpoint, avec les 6 clés.
  - `authStore.refreshUser()` après la mise à jour du profil.
- **État** :
  - 3 sections, chacune en mode lecture ou édition : `isEditingProfile`, `isEditingNotifications`, `isEditingPassword`.
  - Deux copies des préférences : `notificationForm` (lecture) et `notificationFormEdit` (édition). Valeur par défaut 'SITE'.
  - Photo : lue avec FileReader en data URL.
  - Pas de watcher.
- **Formulaires** :
  - Profil :
    - Photo : FileDropzone `image/*`, 2 Mo maximum (2 097 152 octets), aperçu, bouton × pour retirer ; texte « Formats acceptés : JPG, PNG, GIF. Taille max : 2 Mo ».
    - Prénom : « Le prénom est requis ».
    - Nom : « Le nom est requis ».
    - Email et rôle en lecture seule : « L'adresse email ne peut pas être modifiée », « Le rôle ne peut pas être modifié ».
    - Toasts : « Profil mis à jour avec succès » / « Erreur lors de la mise à jour du profil ». Image invalide : « Veuillez selectionner une image valide ».
  - Notifications :
    - 6 Select avec les options SITE « Notification », EMAIL « Notification et Email », NONE « Aucune notification », chacun avec son indice.
    - Toast : « Préférences de notifications mises à jour ».
  - Mot de passe :
    - Champ actuel : « Le mot de passe actuel est requis ».
    - Nouveau : « Le nouveau mot de passe est requis » ; « Le mot de passe doit contenir au moins 8 caractères ».
    - Confirmation : « La confirmation est requise » ; « Les mots de passe ne correspondent pas ».
    - 3 boutons œil pour afficher le mot de passe.
    - Toast : « Mot de passe modifié avec succès ».
- **ui → shadcn** :
  - Card, Button, Input ;
  - Select maison, `searchable` par défaut → shadcn Select ;
  - Avatar, Badge ;
  - FileDropzone (shared) ;
  - Form ;
  - InputGroup ou `PasswordInput` maison.
- **Styles** : Tailwind (`max-sm:`).
- **Bugs suspectés** :
  - l.55 et l.179 : la couleur de repli `hsl(var(--primary))` est invalide, car les tokens sont en oklch → le badge de rôle sans couleur est invisible (texte blanc sur fond transparent).
  - l.188, l.298, l.418 : les boutons « Annuler » dans un `<form>` n'ont pas `type="button"`, et le Button ne fixe pas de type par défaut.
    - Aujourd'hui, cela fonctionne seulement parce que Vue démonte le formulaire avant l'envoi.
    - **En React, il faut impérativement `type="button"`**, sinon « Annuler » enregistre ou change le mot de passe.
  - l.490-491, 602, 619-626, 635-637 : code mort (`fileInputRef` jamais lié, `selectedFileName` jamais affiché, `profileErrors.picture` inutilisé).
  - l.134 : le texte « JPG, PNG, GIF » ne correspond pas à `accept="image/*"`.
  - l.803-804 : pour un non-admin, `serviceModification` est envoyé à 'SITE' par défaut si la valeur était absente.
- **Cible React** : voir « Découpage ».

### src/views/common/Notifications.vue (440 l.)
- **Rôle / route** : `/notifications`, tout utilisateur connecté.
- **API** :
  - `notificationsService.getNotifications` : GET `notifications`, avec la liste sous la clé `notifications` de la réponse.
  - `markAsRead` : PATCH `notifications/{uuid}/read`.
  - `markAllAsRead` : PATCH `notifications/read-all`.
- **État** :
  - `unreadCount`, `readCount`, `unreadNotifications`, `readNotifications` sont calculés côté client.
  - Le marquage « lu » se fait en modifiant directement l'objet.
  - Bouton « Test son » en développement seulement (`/sounds/notif.wav`, volume 0,5).
  - **Aucune synchronisation avec le popover de la navbar**, qui a son propre état et son propre rafraîchissement.
- **UI** :
  - Onglets Toutes / Non lues / Lues avec compteurs : trois listes presque identiques.
  - Chaque élément : icône et couleur selon `refType`, titre, description, date relative (« À l'instant », « Il y a X min », « Il y a Xh », « Hier », « Il y a X jours », sinon date longue), badge de type, bouton ✓ « Marquer comme lu ».
  - « Tout marquer comme lu ».
  - Clic : marque comme lu, puis navigue selon le type :

    | Type | Destination |
    |---|---|
    | entretien | `/entretiens` |
    | vehicule | `/vehicules/{refId}` |
    | absence | `/absences` |
    | acompte | `/acomptes` |
    | user | `/users` |
    | todo | `/todos` |
    | carte_expiration | `/cartes` |
    | service_modification | modale d'historique (admin seulement) |

- **ui → shadcn** : Tabs, Badge, Button, Card, Empty ou état vide maison.
- **Bugs suspectés** :
  - l.334-361 : `rapport_vehicule`, pourtant déclaré dans le modèle, n'a ni navigation, ni icône, ni libellé (affiché « Général »). La navigation exige aussi `refId`, même quand la destination est une liste.
  - l.342-346 : pour un simple utilisateur, les types absence et acompte mènent à `/absences` ou `/acomptes`, réservés aux admins → **renvoi vers `/unauthorized`** au lieu de `/myabsences` ou `/myacomptes` (à confirmer).
  - l.319-320 : un échec de « tout marquer » remplace la liste par l'erreur.
  - l.308-310 : les erreurs de marquage sont avalées.
  - La logique (icône, couleur, libellé, destination, date relative) est dupliquée avec `components/ui/notifications/Notifications.vue`.
  - « Hier » est calculé sur 24 h et non sur le jour calendaire.
- **Cible React** :
  - `pages/common/NotificationsPage.tsx` (environ 90 l.) ;
  - `features/notifications/components/NotificationList.tsx` et `NotificationItem.tsx` (une seule liste filtrée par l'onglet) ;
  - `features/notifications/lib/notificationMeta.ts` (icône, couleur, libellé, destination selon le rôle) et `lib/formatRelativeTime.ts`, partagés avec le popover ;
  - `features/notifications/hooks/useOpenNotification.ts` (marquer lu, naviguer, ouvrir l'historique) et `hooks/useNotificationSound.ts`.

### src/composables/useMapModal.ts (145 l.)
- **Rôle** : charge mapbox-gl à la demande (import dynamique du module et de son CSS), style `streets-v12`, zoom 14.
  - Contrôle de navigation.
  - Marqueurs début (vert `#16a34a`) et fin (violet `#581c87`), avec popups `setHTML` (contenu non utilisateur, donc sans risque).
  - `fitBounds` (padding 80, zoom maximum 16) quand il y a 2 points.
  - Token `MAPBOX_TOKEN` issu de `config/map`.
- **Bugs** :
  - l.72 : une nouvelle `Map` écrase l'ancienne sans `remove()` (voir la fuite décrite pour UserServices).
  - Pas de `map.resize()` après l'animation du dialog → taille possiblement fausse.
  - Rien ne se passe quand seules des positions 0,0 existent.
- **Cible** : `src/hooks/useMapboxMap.ts` (import dynamique, nettoyage dans le retour de l'effet) et `components/shared/MapboxMap.tsx`, puis `features/user-services/components/ServiceLocationDialog.tsx`. Aujourd'hui, c'est le seul usage de mapbox dans `src/`.

### src/composables/usePendingUsers.ts (96 l.)
- **Rôle** : singleton de module. Liste des comptes « en attente » : `isActive === false` et création il y a 7 jours ou moins.
  - Chargé dans App.vue dès qu'un admin est connecté ; remis à zéro sinon.
  - Sert au badge de la navbar (`pendingCount` sur `/users`) et à la section « en attente » de Users.vue.
  - `setFromUsers` évite un deuxième appel ; `removePending` retire un compte après activation.
  - API : GET `users`, en silence.
- **Cible** : `features/users/hooks/usePendingUsers.ts` = `useUsersQuery({ select: u => u.filter(isPendingActivation), enabled: isAdmin })`. Même clé de cache que la page Utilisateurs, donc plus besoin de `setFromUsers` ni de `removePending` : il suffit d'invalider. Garder `isPendingActivation` dans `features/users/lib/pendingActivation.ts`.

### src/composables/usePermissions.ts (88 l.)
- **Rôle** :
  - `isAdmin`, `isMechanic`, `isUser` comparent l'UUID de rôle à `USER_ROLE_UUIDS`.
  - `hasRole` simule UTILISATEUR en mode `viewAsUser`.
  - `hasPermission('couchette')` lit `user.isCouchette`.
  - `canAccess(roles, perms)`, `toggleViewMode`, `setViewMode`.
  - Utilisé par App.vue, AppSidebar et Navbar, pas par les pages de ce périmètre.
- **Cible** : `src/hooks/usePermissions.ts` à base de sélecteurs sur le store Zustand d'auth. Vérifier la cohérence avec `authStore.isAdmin`, qui constitue une deuxième source de vérité.

### src/utils/userVisibility.ts (33 l.)
- `isUserVisible` (absent ⇒ visible) et `selectableUsers(users, keepUuids)`. À copier tel quel.

### Services
- **users.ts (172 l.)** : les méthodes et endpoints utilisés sont listés ci-dessus. Formes de réponse hétérogènes : `getUsers` est enveloppé (`data`), `getUsersWithStatus` et `getUsersLastVehicles` renvoient un tableau nu, `updateUser` et `resendVerificationEmail` renvoient `{user}`. À copier sans changement ; la normalisation se fait dans les fonctions de requête.
- **userServices.ts (338 l.)** :
  - Méthodes utilisées ici : `getActiveService`, `searchServices`, `createService`, `validateService`, `deleteService`, `getUserWorkedHours`, `getServiceModifications`.
  - Les types locaux `ServiceCreateRequest` / `ServiceUpdateRequest` n'ont ni `isBreak` ni `latitudeEnd` / `longitudeEnd`, alors que les versions de `models/ServiceDTO.ts` les ont → doublon incohérent.
- **profile.ts (44 l.)** et **notifications.ts (103 l.)** : endpoints ci-dessus. Pas encore utilisés dans ce périmètre : `getUnreadNotifications` (utilisé par le popover), `getUnreadCount`, `sendNotificationToRole`.

### Modèles
- **UserDTO (54 l.)** : les champs utiles sont `isVisible`, `status`, `address`, `telPersonnel`, `telPro`, `heureContrat`, `notificationPreferences` et `createdAt`.
- **UserWithStatusDTO (52 l.)** : pas de `isVisible`.
- **UpdateUserRequest (33 l.)** : pas d'`email`.
- **UpdateProfileRequest (20 l.)** : accepte `email`, `address` et `driverLicenseNumber`, que l'interface actuelle n'utilise pas.
- **ChangePasswordRequest (7 l.)**, **RoleDTO (10 l.)**, **AddressDTO (6 l.)** : rien de particulier.
- **NotificationDTO (31 l.)** : `refType` contient `rapport_vehicule` (non géré). Le modèle ne déclare pas entretien, vehicule et carte_expiration, pourtant gérés par l'interface.
- **NotificationPreferencesDTO (34 l.)** : type `NotificationChannel` = 'SITE' | 'EMAIL' | 'NONE', 6 clés.
- Tous sont à copier tels quels.

---

## Découpage détaillé des fichiers de plus de 250 lignes

**Users.vue** →
- `pages/users/UsersPage.tsx` (environ 130 l.) : requêtes, état des dialogs, mise en page.
- `features/users/components/` :
  - `PendingActivationSection.tsx`
  - `UsersToolbar.tsx` (SearchInput et case « Afficher les masqués » avec compteur)
  - `UsersDataTable.tsx` et `users-columns.tsx` (react-table, tri, filtre global)
  - `UserRowContextMenu.tsx`
  - `UserActionsDropdown.tsx`
  - `UserMobileList.tsx` et `UserMobileCard.tsx`
  - `UserIdentityCell.tsx`
  - `UserAvatar.tsx`
  - `RoleBadge.tsx`
  - `PresenceBadge.tsx`
  - `AccountStatusBadges.tsx`
  - `LastVehicleInfo.tsx`
  - `DeleteUserDialog.tsx` (AlertDialog avec saisie « CONFIRMER »)
- `features/users/hooks/` :
  - `useUserActions.ts` : actions communes au menu déroulant, au clic droit et aux boutons
  - `useUserDialogs.ts` : quel dialog est ouvert et pour quel utilisateur
  - `useUsersFilters.ts` : recherche et masqués, éventuellement dans l'URL
- `features/users/lib/userPresence.ts` et `lib/formatters.ts` (initiales, date du véhicule, date de création).

**UserEditModal** →
- `UserEditDialog.tsx` (environ 120 l.)
- `UserEditForm.tsx`
- Sections du formulaire :
  - `IdentityFields`
  - `AccessFields` (rôle, actif, couchette, visible)
  - `ContractField`
  - `ContactFields`
  - `AddressFields`
  - `UserSystemInfo`
- `schemas/userEditSchema.ts`
- Rôles depuis `USER_ROLE_UUIDS`.

**UserHoursModal** →
- `UserHoursDialog.tsx` (contrôlé par `open` et `user`, plus de ref)
- `HoursPeriodTabs.tsx`
- `PeriodNavigator.tsx` (variantes jour, semaine, mois, année)
- `HoursStatsGrid.tsx`
- `hooks/useHoursPeriod.ts` : état minimal, les paramètres de requête en sont dérivés
- `lib/isoWeek.ts` et `lib/dateKeys.ts` (dates locales sans `toISOString`)

**UserServices et useUserServices** →
- `pages/users/UserServicesPage.tsx` (environ 110 l.)
- `features/user-services/components/` :
  - `UserStatusCard.tsx` (avec `useNow` pour la durée en direct)
  - `WorkedHoursStats.tsx`
  - `ServicesFiltersPanel.tsx`
  - `ServicesDayList.tsx`
  - `ServiceDayCard.tsx`
  - `ServiceRow.tsx`
  - `ServiceRowActions.tsx`
  - `ModifiedBadge.tsx`
  - `DayOffsetBadge.tsx`
  - `ServiceFormDialog.tsx` et `schemas/serviceFormSchema.ts` (avec `ServiceTypeToggle`, `DateTimeFields`, `NightShiftHint`)
  - `DeleteServiceDialog.tsx`
  - `ServiceLocationDialog.tsx`
  - `ServicesPagination.tsx`
- `features/user-services/hooks/` : `useServiceFilters.ts`, `useAdminServiceActions.ts`
- `features/user-services/lib/` : `groupServicesByDay.ts` (fonction pure), `serviceLocation.ts`, `serviceStatus.ts`
- `src/hooks/` : `useNow.ts`, `useMapboxMap.ts`

**Profile** →
- `pages/common/ProfilePage.tsx` (environ 60 l.)
- `features/profile/components/` :
  - `ProfileInfoCard.tsx` (bascule lecture / édition)
  - `ProfileInfoView.tsx`
  - `ProfileEditForm.tsx`
  - `AvatarPicker.tsx` (avec le hook `useAvatarPicker`)
  - `NotificationPreferencesCard.tsx`
  - `NotificationPreferencesForm.tsx`
  - `ChangePasswordCard.tsx`
- `features/profile/schemas/` : `profileSchema`, `notificationPreferencesSchema`, `changePasswordSchema`
- `features/profile/lib/notificationChannels.ts`
- `components/shared/PasswordInput.tsx`

---

## 1. Composants shadcn nécessaires (consolidé)
- `button`, `input`, `label`, `badge`, `checkbox`, `card`, `avatar`, `separator`
- `table`, avec le modèle data-table
- `dialog`, `alert-dialog`
- `dropdown-menu`, `context-menu`, `tooltip`, `tabs`, `select`
- `toggle-group` (Service / Pause, périodes), `collapsible` (Absents, filtres)
- `popover` ; `calendar` en option, pour remplacer les champs natifs date / week / time
- `form`, `sonner`, `alert` (bandeaux d'erreur), `skeleton` ou `spinner`
- `pagination`, `input-group` (recherche avec icône, mot de passe), `empty` (états vides)

**Composants maison (`components/shared`)** : InputField, AddressAutocomplete, FileDropzone, PasswordInput, SearchInput, MapboxMap, LoadingState, ErrorState.

**Tokens** : `success`, `warning` et `info` ne font pas partie de shadcn ; aujourd'hui ils sont dans `tailwind.css`.

## 2. Hooks TanStack Query et mutations

**Clés de cache** :
- `usersKeys` = {all `['users']`, list `['users','list']`, detail `(u)=>['users','detail',u]`, status `['users','status']`, lastVehicles `['users','last-vehicles']`}
- `adminServicesKeys` = {all `['services','admin']`, history `(u,f,p)=>['services','admin','user',u,{...f,page:p}]`, active `(u)=>['services','admin','active',u]`, hours `(u,params)=>['services','admin','hours',u,params]`, modifications `(s)=>['services','modifications',s]`}
- `profileKeys` = {me `['profile']`, notificationPreferences `['profile','notification-preferences']`}
- `notificationsKeys` = {all `['notifications']`, list `['notifications','list']`, unread `['notifications','unread']`}

**Requêtes** :

| Hook | Appel | Clé | Remarques |
|---|---|---|---|
| `useUsersQuery` | `usersService.getUsers` | `usersKeys.list` | `select` normalise `data` ; sert aussi à `usePendingUsers` ; `enabled` si admin |
| `useUsersLastVehiclesQuery` | `usersService.getUsersLastVehicles` | `usersKeys.lastVehicles` | `retry: false`, `select` → Map, échec silencieux |
| `useUserQuery(uuid)` | `usersService.getUserById` | `usersKeys.detail` | — |
| `useUsersWithStatusQuery` | `usersService.getUsersWithStatus` | `usersKeys.status` | `refetchInterval: 10_000` |
| `useUserActiveServiceQuery(uuid)` | `userServicesService.getActiveService` | `adminServicesKeys.active` | — |
| `useUserServicesHistoryQuery(uuid, filters, page)` | `userServicesService.searchServices` | `adminServicesKeys.history` | `placeholderData: keepPreviousData` |
| `useUserWorkedHoursQuery(uuid, params)` | `userServicesService.getUserWorkedHours` | `adminServicesKeys.hours` | utilisé par UserHoursDialog et les stats ; `keepPreviousData` |
| `useServiceModificationsQuery(serviceUuid)` | `userServicesService.getServiceModifications` | `adminServicesKeys.modifications` | partagé avec la modale d'historique globale |
| `useProfileQuery` | `profileService.getProfile` | `profileKeys.me` | — |
| `useMyNotificationPreferencesQuery` | `usersService.getMyNotificationPreferences` | `profileKeys.notificationPreferences` | — |
| `useNotificationsQuery` | `notificationsService.getNotifications` | `notificationsKeys.list` | `select` → `notifications ?? []` |

**Mutations** :

| Hook | Appel | Invalidations / mises à jour |
|---|---|---|
| `useUpdateUserMutation` | `usersService.updateUser` | `setQueryData` en fusion dans `users.list`, puis invalide `['users']` (liste, détail, badge « en attente ») ; sert aussi à « Activer » |
| `useDeleteUserMutation` | `usersService.deleteUser` | invalide `['users']` |
| `useResendVerificationMutation` | `usersService.resendVerificationEmail` | invalide `['users']` |
| `useCreateAdminServiceMutation` | `userServicesService.createService` | voir liste ci-dessous |
| `useUpdateAdminServiceMutation` | `userServicesService.validateService` | idem |
| `useDeleteAdminServiceMutation` | `userServicesService.deleteService` | idem |
| `useAdminServiceActions` (start, end, startBreak, endBreak) | create / validate, ou `startService` / `startBreak` / `endService` / `endBreak` avec `userUuid` (à trancher) | idem |
| `useUpdateProfileMutation` | `profileService.updateProfile` | invalide `profileKeys.me`, rafraîchit le store d'auth (équivalent de `refreshUser`) |
| `useChangePasswordMutation` | `profileService.changePassword` | aucune |
| `useUpdateNotificationPreferencesMutation` | `usersService.updateMyNotificationPreferences` | `setQueryData(profileKeys.notificationPreferences)` et invalide `profileKeys.me` |
| `useMarkNotificationReadMutation` | `notificationsService.markAsRead` | mise à jour optimiste de `notificationsKeys.list`, puis invalide `['notifications']` → le badge de la navbar se met à jour |
| `useMarkAllNotificationsReadMutation` | `notificationsService.markAllAsRead` | idem |

Invalidations communes aux mutations de pointage admin : `adminServicesKeys.history(uuid…)`, `active(uuid)`, `hours(uuid)`, `usersKeys.status`, `['services','modifications']`.

## 3. Bugs suspectés (récapitulatif)

**Critiques** :
- **UserEdit.vue:162 et :200** : méthodes inexistantes → la page est inutilisable (et orpheline).
- **useUserServices.ts:394-408** : pause en 3 appels non atomiques → le service principal peut être transformé en pause.
- **UserServices.vue:508 et useMapModal.ts:72, :115** : carte Mapbox jamais détruite quand on ferme par l'overlay ou Échap → fuite WebGL.
- **UserHoursModal.vue:443-456** : jour précédent / suivant bloqué ou sautant un jour aux changements d'heure ; « aujourd'hui » en UTC (l.316, l.440).
- **Profile.vue:188, :298, :418** : « Annuler » sans `type="button"`. Fonctionne en Vue par hasard ; en React, ce serait un envoi du formulaire (enregistrement ou changement de mot de passe).
- **Notifications.vue:342-346** : un utilisateur simple est renvoyé vers des routes admin → `/unauthorized`.

**Moyens** :
- `UserEditModal.vue:468-488` : création factice avec toast de succès.
- `Users.vue:464` : pas de protection contre le double clic sur « Supprimer ».
- `Users.vue:926` : erreur de suppression affichée en pleine page.
- `Users.vue:914-931` : badge « en attente » périmé après suppression.
- `Users.vue:948` et `:969` : remplacement sans fusion → perte de `status`.
- `UserServices.vue:900-905` : stats non rafraîchies.
- `useUserServices.ts:364…482` : retour à la page 0 après chaque action.
- `useUserServices.ts:369, :388, :414, :433` : erreur d'action = liste remplacée.
- `useUserServices.ts:472` : impossible de retirer la fin d'un service.
- `useUserServices.ts:362` contre `:454` : formats de date / fuseau incohérents.
- `useUserServices.ts:297-301` : format des dates de filtre à vérifier.
- `groupServicesByDay` : total du jour faux à cheval sur deux pages.
- `UserServices.vue:261` : bouton de localisation inerte pour 0,0.
- `UserServices.vue:32` : durée figée.
- `ServicesMonitoring.vue:381` : `window.location.href`.
- `ServicesMonitoring.vue:543-550` : erreur jamais effacée.
- `ServicesMonitoring.vue:370` : menu invisible sur tactile.
- `Notifications.vue:334-361` : `rapport_vehicule` non géré.
- `Notifications.vue:319` : erreur en pleine page.
- Pas de synchronisation du badge des notifications.
- `Profile.vue:55` et `:179` : `hsl(var(--primary))` invalide → badge invisible.
- `UserHoursModal.vue:312` contre `:461` : année ISO utilisée comme année civile.
- `UserEmailModal.vue:173` : toute erreur 400 = « email déjà utilisé ».
- `timeFormatters.ts:130-133` : `getTodayDate` en UTC.

**Mineurs** :
- `UserEditModal.vue:506` (heures de contrat non validées, 0 → null) et `:508-510` (effacer le rôle ne fait rien).
- `UserHoursModal.vue:658` et `ServicesMonitoring.vue:274` : « 60m ».
- `UserHoursModal.vue:407` : semaine suivante sans limite.
- `UserHoursModal.vue:488` : pas de minimum pour l'année.
- `UserHoursModal.vue:616` : pas d'annulation de requête.
- `Users.vue:760` : tri par `Date.parse` fragile.
- `UserServices.vue:485` : « ce pause ».
- Textes sans accents dans UserHoursModal.
- Code mort : `UserEditModal.vue:29`, `UserHoursModal.vue:301`, `Profile.vue:490-491`.
- Fichiers morts : `UserServices.styles.css` et `UserServices.vue.b`.

## 4. Points à trancher avec le propriétaire
1. `/users/:uuid` (UserEdit) : supprimer la route ou rediriger vers `/users` en ouvrant le dialog d'édition ?
2. Création d'utilisateur par un admin : la retirer (inscription + activation seulement) ou prévoir un endpoint ?
3. Pointage admin : garder `admin/create` + `validateService`, ou utiliser `services/start|end|break/start|break/end` avec `userUuid` ? Quel format de date l'API attend-elle : ISO UTC ou heure locale naïve ?
4. Rouvrir un service en édition : l'API accepte-t-elle `fin: null` ?
5. POST `services/admin/user/{uuid}` : format de `startDate` / `endDate` (date ou datetime) ; limite par défaut de 30 jours ; faut-il paginer par jour plutôt que par pointage pour des totaux exacts ?
6. GET /users/status exclut-il bien les masqués ? (Je l'ai supposé d'après le contrat.)
7. Notifications :
   - destinations pour un utilisateur simple (`/myabsences`, `/myacomptes`) ;
   - destination pour `rapport_vehicule` ;
   - usage de `refId` pour un lien direct vers l'élément ;
   - quelles préférences afficher selon le rôle (userCreated, rapportVehicule, todo pour un utilisateur simple ?).
8. Profil : ajouter la modification de l'email (l'API la supporte), de l'adresse, du permis et du téléphone ? Formats d'image acceptés ?
9. Tokens `success` / `warning` / `info` : les garder en extension des tokens shadcn ou les remplacer par des couleurs Tailwind ?
10. Filtres de UserServices et de Users (recherche, masqués) : les persister dans l'URL ?
11. Animations de ServicesMonitoring (TransitionGroup) : les conserver (tw-animate-css) ou les supprimer ?
12. Supprimer définitivement `UserServices.styles.css` et `UserServices.vue.b` ?
13. `useServiceHistory` (store global de la modale d'historique) : quel agent le migre ? Ce périmètre en dépend (`open` / `reload`).

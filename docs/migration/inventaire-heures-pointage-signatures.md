# Inventaire : heures, pointage, planning, export, signatures (vue_avtrans)

Lecture seule, aucun fichier modifié. J'ai lu en entier chaque fichier du périmètre, plus le contexte : CLAUDE.md, router, navConfig, App.vue, ApiClient, useMessages, usePermissions, Select.vue, SearchFilters.vue, Retour.vue et userVisibility.ts.

**Contexte commun**
- Toutes les routes de ce périmètre ont `requiresAdmin`, sauf `/pointage` qui n'a que `requiresAuth`.
- Le garde admin (`router/index.ts:364`) remet `viewAsUser` à false quand on entre sur une page admin.
- `index.html` contient bien `viewport-fit=cover`, donc `env(safe-area-inset-*)` fonctionne.
- Toasts : `useMessages` correspond à sonner.
  - `success/error(text, title)` devient `toast.success/error(title ?? text, { description })`.
  - `showMessage({ id, action, duration })` devient `toast.error(..., { id, action: { label, onClick }, duration })`.
  - `removeMessage(id)` devient `toast.dismiss(id)`.
- L'ApiClient ne prend pas d'`AbortSignal` extérieur. Comme les services sont copiés tels quels, les requêtes TanStack Query ne seront pas annulables.

---

### src/views/hours/Pointage.vue (1117 l.)

**Rôle / route**
- `/pointage`, garde `requiresAuth`. Aucun param ni query param.
- Présent dans la navbar principale pour UTILISATEUR, et dans « Mon espace » (full-nav) pour UTILISATEUR et ADMIN.

**Comportement par rôle**
- `isUserRole` (l.407) compare `userRoleUuid` au rôle UTILISATEUR.
- Utilisateur :
  - `checkKilometrage` (l.977) lit `hasEnteredToday`.
  - Si le km du jour n'est pas saisi, « Démarrer » ouvre le dialog km **obligatoire**. Le service démarre ensuite automatiquement après l'enregistrement (l.1050).
  - Une puce « Kilométrage du jour à saisir » s'affiche.
- Admin et Mécanicien : `hasEnteredKmToday` est forcé à true, sans obligation de km. Le Mécanicien n'a pas l'entrée dans la nav mais la route est accessible par URL.
- `viewAsUser` n'a **aucun effet** sur cette page, car le test porte sur le rôle réel.

**Appels API**
- Chargement (`loadData`, trois appels **séquentiels**, l.692) :
  - `userServicesService.getCurrentService` : GET `services/active` → `{ success, service: ServiceDTO|null }`
  - `getWorkedHours()` : GET `services/hours` → `{ day, week, month, year, lastMonth }` en heures décimales
  - `getDailyServices` : GET `services/user/daily` → `ServiceDTO[]`
- Historique :
  - `getServiceHistory({ startDate, endDate, isBreak, page, size: 20 })` : POST `services/history` → `PagedResponse<ServiceDTO>`.
  - Le service ajoute +1 jour à `endDate` pour rendre la borne inclusive.
- Actions : `startService`, `endService`, `startBreak`, `endBreak` → POST `services/start`, `services/end`, `services/break/start`, `services/break/end`.
  - Corps `{ latitude|null, longitude|null }`, réponse `ServiceDTO`.
  - Chaque action rappelle `loadData()` ; `endService` rappelle aussi `loadHistory()`.
- Kilométrage :
  - `usersService.getMyLastKilometrage` : GET `users/me/kilometrage` → `{ lastKilometrage, hasEnteredToday }`
  - `vehiclesService.getVehicles` : GET `vehicules` → `{ success, vehicules }`
  - `vehiclesService.addKilometrage({ vehiculeId, km })` : POST `vehicules/kilometrages`

**État, données dérivées, timers, géolocalisation**
- Dérivés :
  - `pointageStatus` : `off`, `working` ou `break` selon `activeService.isBreak`.
  - `statusText`, `heroClass`, `statusPillClass`, `heroSubtitle` (« En service depuis HH:mm · durée », « Dernier service terminé à … »).
  - `todayWorkedTime` (l.548) : services terminés moins les pauses **terminées**. Le service en cours ajoute `elapsedTime` ; pendant une pause, le travail est figé au début de la pause.
  - `todayClock` au format HH:MM:SS, `stats` (Semaine, Mois, Mois dernier via `formatHours`), `activeFilterCount`.
  - `historyByDay` : regroupement par clé de date **locale**, total = somme des `duree` des services hors pauses, tri décroissant.
- Timer : `setInterval` 1 s (l.1105) qui met à jour `elapsedTime = now - activeService.debut`, nettoyé dans `onUnmounted`.
- Géolocalisation :
  - `checkLocationPermission` passe par `navigator.permissions.query` et ajoute un listener `change` qui n'est jamais retiré.
  - Au montage, si la permission est à `prompt`, appel `requestLocation({ silent: true })`.
  - `requestLocation` mutualise les appels via une promesse partagée `pendingLocation`, avec `enableHighAccuracy: true`, `timeout: 15000`, `maximumAge: 0`.
  - En cas d'échec, envoi de `{ latitude: null, longitude: null }`.
  - Toasts d'erreur avec l'id `pointage-geolocation` :
    - message refus spécifique Android, iOS ou desktop, titre « Localisation bloquée », 12 s, action « Réessayer la localisation » ;
    - timeout : « Impossible d'obtenir la position (délai dépassé) », action « Réessayer » ;
    - autre erreur : « Erreur de géolocalisation » ;
    - API absente : « La géolocalisation n'est pas disponible sur cet appareil ».
- Accordéon : `openDays` est un `Set`. Après chaque `loadHistory`, seul le jour le plus récent est ouvert (l.936).
- Pas de localStorage.

**Formulaires et dialogs**
- Sheet « Filtrer l'historique » (description « Limitez l'historique à une période ou à un type. »).
  - Champs Du et Au (`input type=date`), Type (Tous, Services, Pauses).
  - Aucune validation.
  - Boutons « Réinitialiser » (ghost) et « Appliquer ». Les deux remettent la page à 0 et ferment le Sheet.
- Dialog « Saisie du kilométrage » :
  - Select véhicule avec recherche : libellé `immat - brand model`, placeholder « Sélectionner un véhicule... », recherche « Rechercher par immat, marque... », « Aucun véhicule trouvé ».
  - Champ « Kilométrage actuel * » : `type=number`, `inputmode=numeric`, `min=0`, placeholder « Ex: 125000 », focus via `setTimeout` de 100 ms.
  - Validations :
    - « Veuillez sélectionner un véhicule »
    - « Veuillez entrer un kilométrage valide » (valeur ≤ 0)
    - chargement des véhicules : « Erreur lors du chargement des véhicules »
    - erreur API : message de l'API, sinon « Erreur lors de l'enregistrement du kilométrage »
  - Succès : toast « Kilométrage enregistré avec succès ».
  - Mode obligatoire : pas de bouton fermer, et `update:open` bloqué à la fermeture.
  - Descriptions : « Avant de commencer votre journée, veuillez renseigner le kilométrage de votre véhicule. » (obligatoire) ou « Renseignez le kilométrage actuel d'un véhicule. ».
- Messages d'erreur des actions : « Erreur lors du démarrage du service », « …de l'arrêt du service », « …du démarrage de la pause », « …de la fin de la pause », « …du chargement de l'historique », « …du chargement des données ».

**UI Vue → shadcn React**
- `Retour` → maison `components/shared/BackButton`
- Button, Input, Skeleton, Dialog → shadcn équivalents
- Sheet (`side` bottom ou right) → shadcn Sheet
- Select maison sans recherche → shadcn `select`
- Select maison avec recherche (véhicules) → Combobox (`popover` + `command`)
- Accordéon fait main → shadcn `accordion type="multiple"`
- Composants maison : `PointageActions`, `ServiceTimeline`

**Libs** : `@vueuse/core` `useMediaQuery('(max-width: 639px)')` → hook `useIsMobile`.

**Mise en page mobile vs desktop**
- Racine : `min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8`. Réserve la place de la barre fixe en mobile.
- Header `sticky top-0 z-40 border-b bg-background`, conteneur `max-w-[1100px] px-3 py-3 sm:px-6 sm:py-4`.
  - Titre `text-lg sm:text-xl`.
  - Bouton « Kilométrage » en `variant=outline size=sm`, libellé en `max-sm:sr-only` (icône seule sur téléphone).
- `main` : `max-w-[1100px] px-3 py-3 sm:px-6 sm:py-6`.
- Grille : une colonne sous `lg` ; à partir de `lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:items-start lg:gap-6`. Gauche : carte d'état, compteurs, services du jour. Droite : historique.
- Carte d'état : `rounded-2xl p-5 sm:p-6`.
  - Dégradé selon l'état : `bg-linear-to-br from-green-500/10 via-card to-card`, ou version ambre en pause.
  - Chrono `font-mono text-4xl sm:text-5xl tabular-nums`.
  - Pastille d'état avec point `animate-ping`.
  - Puces de rappel en `rounded-full text-xs`.
  - Actions affichées **en md et plus seulement** (`hidden md:block`).
- Compteurs : `grid-cols-3 gap-2 sm:gap-3`, icône `hidden sm:flex`, libellé `text-[11px] uppercase truncate`, valeur `text-base sm:text-lg`.
- Historique :
  - Cartes jour `rounded-xl border`.
  - Déclencheur : « lundi 12 septembre 2026 », libellé de compte, badge total `bg-primary/10 font-mono`, chevron qui tourne de 180°.
  - Pagination Précédent / « Page x / y (total) » / Suivant.
- **Barre d'actions mobile** : `fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 pt-2.5 pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden`.
  - Conteneur interne `max-w-[1100px]`.
  - Masquée pendant le chargement initial et en cas d'erreur.
- Sheet filtres :
  - sous 640 px : `side=bottom` avec `rounded-t-2xl pb-[env(safe-area-inset-bottom)]` ;
  - sinon : `side=right` ;
  - footer `flex-row`, boutons `flex-1 sm:flex-none`.
- Dialog km : `sm:max-w-md max-h-[90dvh] overflow-y-auto`.

**Bugs ou incohérences suspectés**
- l.17 et l.259 : `loading && !activeService`. Après `endService`, `activeService` passe à null (l.870) puis `loadData` remet `loading` à true. Toute la page repasse en squelette et la barre mobile disparaît : clignotement.
- l.849–858 et l.39 : une erreur d'action (par exemple « service déjà démarré ») remplit `error`. Toute la page est alors remplacée par le bloc d'erreur, barre mobile comprise (l.259), et un toast s'affiche en plus.
- l.692–719 : les trois appels sont séquentiels. Un échec de `getWorkedHours` fait tomber toute la page.
- l.548–588 comparé à l.668–678 : le chrono du jour soustrait les pauses (modèle « pause incluse dans le service »), alors que le total par jour de l'historique additionne les `duree` des services **sans** soustraire les pauses. Un des deux calculs est faux selon le modèle réel du backend.
- l.404 comparé à l.260 : `isMobile` se base sur 639 px (sm) alors que la barre utilise `md:hidden` (768 px). Entre 640 et 767 px, barre en bas mais Sheet à droite.
- l.314 et l.1013 : le dialog km obligatoire ne se ferme pas. Si le chargement des véhicules échoue ou si aucun véhicule n'existe, l'utilisateur est bloqué.
- l.1027 : aucune vérification que le km ≥ `latestKm` du véhicule. Le backend ne valide pas non plus (`vehicles.ts:233`).
- l.744 : listener de permission jamais retiré.
- l.6 : `Retour fallback="/"` renvoie vers la landing publique.
- l.447–454 : les champs `filters.isBreak` et `filters.page` ne servent à rien.
- l.525 : suppose `todayServices` trié par ordre croissant.
- Pas de rafraîchissement au retour au premier plan : l'état devient faux si l'utilisateur a pointé depuis un autre appareil.

**Cible React**
- `pages/hours/PointagePage.tsx` (~130 l.) : compose `PointageHeader`, la grille, `StatusHeroCard`, `WorkedHoursStats`, `TodayServicesCard`, `ServiceHistorySection`, `MobileActionBar`, `HistoryFiltersSheet`, `KilometrageDialog`, et l'état de chargement/erreur **de lecture seulement** (les erreurs d'action passent en toast).
- `features/pointage/components/` :
  - `PointageHeader.tsx` (~35) : BackButton, titre, bouton Kilométrage
  - `PointageSkeleton.tsx` (~40)
  - `StatusHeroCard.tsx` (~120) : chrono, sous-titre, pastille, puces `LocationDeniedChip` et `KmReminderChip`, actions desktop
  - `StatusPill.tsx` (~35)
  - `PointageActions.tsx` (~75)
  - `WorkedHoursStats.tsx` (~50)
  - `TodayServicesCard.tsx` (~40)
  - `ServiceTimeline.tsx` (~75)
  - `ServiceHistorySection.tsx` (~110) : en-tête, bouton Filtres avec badge, états, Accordion contrôlé
  - `HistoryDayItem.tsx` (~50)
  - `HistoryPagination.tsx` (~40)
  - `HistoryFiltersSheet.tsx` (~120) : react-hook-form + zod `{ startDate, endDate, type: 'all'|'service'|'pause' }`, `side` issu de `useIsMobile`
  - `MobileActionBar.tsx` (~35)
  - `KilometrageDialog.tsx` (~150) : react-hook-form + zod, `required` qui bloque `onOpenChange`, `onEscapeKeyDown` et `onPointerDownOutside`
  - `VehicleCombobox.tsx` (~80), plutôt dans `features/vehicles/components` ou `components/shared`
- `features/pointage/hooks/` :
  - `usePointageStatus.ts` (~60) : statut, textes, classes dérivées
  - `useGeolocation.ts` (~120) : permission via `useSyncExternalStore` ou `useEffect` d'abonnement avec nettoyage, `requestLocation({ silent })`, promesse partagée, toasts sonner id `pointage-geolocation`
  - `usePointageActions.ts` (~110) : obligation km, géolocalisation puis mutation, et ouverture du dialog km en mode requis avec démarrage en attente
  - `useKilometrageDialog.ts` (~60)
- `features/pointage/lib/` :
  - `workedTime.ts` (~70) : `computeTodayWorkedMs(services, active, now)`, `formatClock`
  - `groupHistoryByDay.ts` (~70) : `localDateKey`, `countLabel`, `toTime`
- `src/hooks/useNow.ts` (~30) : tick d'une seconde via `useSyncExternalStore`, activable. `elapsedMs` est calculé pendant le rendu, pas de `useEffect`.
- `src/hooks/use-mobile.ts` : hook shadcn, breakpoint 768 recommandé pour être cohérent avec `md`.
- Accordion : l'état `openDays: string[] | null` vaut null pour « premier jour ouvert ». Il est remis à null dans les handlers de page et de filtres, pas dans un effet.
- `features/pointage/api/` : `queryKeys.ts`, `useActiveServiceQuery.ts`, `useWorkedHoursQuery.ts`, `useDailyServicesQuery.ts`, `useServiceHistoryQuery.ts`, `usePointageMutations.ts`, `useMyLastKilometrageQuery.ts`. `useVehiclesQuery` et `useAddKilometrageMutation` vont dans `features/vehicles/api`.

---

### src/views/hours/Planning.vue (1221 l.)

**Rôle / route**
- `/planning`, admin. Aucun param.
- Lien sortant `/absences?userUuid=<uuid>`, lu par `Absences.vue` (l.954).

**Rôles** : admin uniquement.

**Appels API**
- `absencesService.getAbsencePlanning(params)` : GET `absences/admin/planning?periodType=week|month|custom&year&week|month` ou `&startDate&endDate` → `{ success, startDate, endDate, periodType, users: PlanningUserDTO[] }`. Chaque utilisateur porte `absences: AbsenceDTO[]` (`period` FULL_DAY, MORNING ou AFTERNOON ; `status` PENDING, APPROVED ou REJECTED).
- `absenceTypesService.getAbsenceTypes` : GET `absence-types` → `{ success, types }`. Erreur ignorée.
- `absencesService.validateAbsence(uuid, { approved, rejectionReason? })` : POST `absences/admin/{uuid}/validate`, puis `loadPlanning()`.

**État, données dérivées, watchers**
- État : `periodType` (défaut `month`), `currentYear`, `currentMonth`, `currentWeek` (ISO via `getWeekNumber`), `customStartDate` et `customEndDate`.
- `dates` (l.562) : liste des jours avec jour abrégé, numéro, `isToday`, `isWeekend`, `isHoliday` et `holidayName`. Les fériés viennent de `getFrenchHolidays` (Pâques par Meeus).
- `gridColumns` : `200px repeat(n, minmax(minCol,1fr))`, avec `minCol` = 44 (≤ 31 jours), 32 (> 31), 28 (> 45), 24 (> 60).
- `isCompactGrid` : plus de 31 jours.
- `currentPeriodLabel` : plage de dates en semaine, sinon « Mois Année ».
- Pas de watcher : chaque action appelle `loadPlanning()`. Pas de timer ni de localStorage.

**Formulaires et dialogs**
- Mode personnalisé :
  - deux `input type=date` natifs, bouton « Afficher » désactivé si la plage est invalide ;
  - erreurs « Les deux dates sont requises. » et « La date de début doit être avant la date de fin. » ;
  - préréglages 2, 3 et 6 mois (du 1er du mois courant à la fin du mois +N−1).
- En passant en mode personnalisé, initialisation au mois courant et au suivant.
- Dialog « Détails de l'absence » (ouvert au clic sur une cellule qui porte une absence) :
  - employé (avatar, email), type (badge couleur ou `customType`), Début, Fin, Durée (jours calendaires +1), Statut (badge) ;
  - Motif, Validation (validé par, date, motif du refus) ;
  - si PENDING : « Approuver » et « Refuser ». Refuser affiche un `textarea` « Motif du refus (optionnel) », placeholder « Indiquez la raison du refus... », puis « Confirmer le refus » ou « Annuler » ;
  - lien « Gérer les absences » vers `/absences`.
- Export : DropdownMenu « Format d'export » avec « PDF (A4 paysage) » et « Image PNG ».

**UI Vue → shadcn React**
- Tabs, Button (`size` `icon-sm`), DropdownMenu, Dialog, Badge, Avatar, Separator (vertical) → shadcn équivalents
- `textarea` natif → shadcn Textarea
- `input date` natif → Input `type=date` ou Popover + Calendar (mode range)
- `router-link` → `Link`

**Libs**
- `html2canvas-pro`, en import dynamique : rendu d'un tableau HTML construit en chaîne (`buildExportHtml`) dans un conteneur hors écran (`left:-9999px`), `scale: 2`, fond blanc.
- `jspdf`, en import dynamique : A4 paysage en mm, marges 8, en-tête texte 14 mm (« Planning des absences — période », « Page x/y », « Généré le »).
  - Si la hauteur dépasse, découpage du canvas en tranches.
  - Fichier `planning-absences_{start}_{end}.pdf` ou `.png`.
- L'HTML d'export contient : abréviations uniques par type, bandeau des mois (`colspan`), couleurs rgba, `darkenHex`, bordure pointillée pour PENDING, flèches ↑ et ↓ pour les demi-journées, lignes alternées, légende.

**Mise en page mobile vs desktop**
- Header `sticky top-0 z-40 border-b`, conteneur `max-w-[1400px] flex-col gap-3 px-4 py-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:px-6 md:py-4`.
- Libellé de période en `min-w-[140px] md:min-w-[180px]`. Bouton « Aujourd'hui » en md et plus, « Auj. » en mobile.
- Mode personnalisé en `flex-wrap`, texte « Afficher » en `hidden sm:inline`, séparateur `hidden md:block`, préréglages `h-7 px-2 text-xs`.
- `main` : `px-4 py-4 md:px-6 md:py-6`, sans largeur maximale.
- Grille : `overflow-x-auto` puis `min-w-[800px]`.
  - En-tête du jour : aujourd'hui en `bg-primary text-primary-foreground`, férié en `bg-destructive/10` avec point ●, week-end en `bg-muted/80`.
  - Mode compact : initiale du jour, `text-[9px]`, `min-h-[40px]` (en-tête) et `min-h-[36px]` (cellules), sans AM/PM.
  - Couleur des cellules en style inline : rgba du type (0,25 si approuvée, 0,15 sinon), demi-journée en `linear-gradient` haut ou bas. Sans couleur de type : classes par statut (`bg-emerald-500/15`, `bg-amber-500/15`, `bg-muted`). Icônes ✓, ? ou ✗.
  - La colonne des noms **n'est pas sticky** : en mobile, le défilement horizontal masque les noms.
- Légende `border-t bg-muted/50`.
- Le dialog n'a pas `max-h-[90dvh] overflow-y-auto`, contrairement à la règle du CLAUDE.md.

**Bugs suspectés**
- l.493, l.498, l.503 : les fériés mobiles passent par `toISOString()` sur une date à minuit local. En France (UTC+1 ou +2), ils sont **décalés d'un jour avant** : Lundi de Pâques affiché le dimanche, Ascension le mercredi, Lundi de Pentecôte le dimanche.
- l.566–595 : `new Date('YYYY-MM-DD')` (minuit UTC) combiné à `setDate` local et `toISOString`. Pour une plage qui démarre en heure d'hiver et traverse le passage à l'heure d'été de fin mars, `dateStr` retarde d'un jour sur `dayNumber`. Exemple, mars 2026 : les 30 et 31 ont `dateStr` 29 et 30. Conséquences : clés dupliquées (l.210), absences et « aujourd'hui » sur le mauvais jour.
- l.704–708 et l.721–725 : la navigation par semaine suppose 52 semaines. La semaine 53 des années ISO longues (2026, 2032) est inaccessible.
- l.736–740 : `goToToday` combine année civile et semaine ISO. Du 29 au 31/12/2025, la requête part en `year=2025&week=1` (janvier 2025). Du 1er au 3/01/2027, elle part en `year=2027&week=53`.
- l.253 : `@close="closeModal"` ne se déclenche jamais, car le DialogContent de reka n'émet pas `close`. `selectedAbsence`, `showRejectInput` et `rejectionReason` ne sont pas remis à zéro : l'absence suivante peut afficher le formulaire de refus avec le texte précédent.
- l.867 et l.890 : erreurs d'approbation et de refus avalées, sans aucun retour à l'utilisateur.
- **Sécurité**, l.1073, l.1091, l.1122 : prénom et nom de l'utilisateur, nom du type et `customType` sont injectés dans `innerHTML` sans échappement. Le prénom est saisi par l'utilisateur à l'inscription, d'où un risque de XSS dans la session admin au moment de l'export.
- l.1211 : une erreur d'export remplace toute la grille par le bloc d'erreur, et « Réessayer » recharge le planning au lieu de relancer l'export.
- l.1141–1150 : le conteneur hors écran n'est pas retiré si `html2canvas` échoue (pas de `finally`).
- l.751–759 et template l.212–231 : `getAbsenceForDate` est appelé jusqu'à six fois par cellule, avec création de `Date` à chaque fois. Coût O(utilisateurs × jours × absences), lourd sur 6 mois.
- l.939–946 : la durée compte les jours calendaires et ignore les demi-journées.
- l.661 : si `success` vaut false, rien ne se passe.
- l.676–690 : branches identiques.
- l.1183–1206 : les tranches du PDF coupent des lignes en deux et n'ont pas d'en-tête de tableau.

**Cible React**
- `pages/hours/PlanningPage.tsx` (~120 l.) : `usePlanningPeriod`, toolbar, barre d'export, états, `PlanningGrid`, `PlanningLegend`, `AbsenceDetailDialog`.
- `features/planning/lib/` :
  - `frenchHolidays.ts` (~60) : clés `yyyy-MM-dd` construites à partir des composantes locales
  - `planningDates.ts` (~100) : `buildPlanningDates(start, end)` en arithmétique UTC pure, `isoWeek`, `isoWeekYear`, `weeksInIsoYear`, `shiftPeriod`
  - `absenceIndex.ts` (~60) : `Map<userUuid, Map<dateStr, AbsenceDTO>>` en `useMemo` ou calcul pur
  - `absenceCellStyle.ts` (~80) : classe, style, icône, `hexToRgba`
  - `planningExportHtml.ts` (~160) : avec `escapeHtml`
  - `exportPlanningFile.ts` (~90) : html2canvas-pro et jspdf, nettoyage dans un `finally`
- `features/planning/hooks/` :
  - `usePlanningPeriod.ts` (~140) : type de période, année, mois, semaine ISO, plage personnalisée, validation, précédent/suivant/aujourd'hui, préréglages, construction des params. État dans `useSearchParams` si possible.
  - `usePlanningExport.ts` (~50) : `isExporting`, toast en cas d'erreur
- `features/planning/components/` :
  - `PlanningToolbar.tsx` (~70)
  - `PeriodNavigator.tsx` (~50)
  - `CustomRangeControls.tsx` (~90)
  - `PlanningExportMenu.tsx` (~50)
  - `PlanningGrid.tsx` (~100) : colonne des noms à rendre `sticky left-0`
  - `PlanningDayHeaderCell.tsx` (~50)
  - `PlanningUserRow.tsx` (~70)
  - `PlanningDayCell.tsx` (~50)
  - `PlanningLegend.tsx` (~30)
  - `AbsenceDetailDialog.tsx` (~150)
  - `AbsenceValidationActions.tsx` (~80), à réutiliser par la feature absences
- `features/planning/api/` : `queryKeys.ts`, `usePlanningQuery.ts`. `useAbsenceTypesQuery` et `useValidateAbsenceMutation` sont partagés dans `features/absences/api`.

---

### src/views/hours/Heures.vue (509 l.)

**Rôle / route** : `/heures`, admin, sans param.

**Appel API** : `usersService.getUsersWithHours` : GET `users/hours` → `{ success, message, users: [{ user, hours: { hoursDay, hoursWeek, hoursMonth, hoursLastMonth, hoursYear } }] }`.

**Données dérivées**
- `filteredUsers` : exclut `user` null, aplatit les champs de tri, recherche sur nom et email.
- `totalHours` : somme sur **tous** les utilisateurs, sans tenir compte de la recherche.
- `sortedData` : tri générique avec `Date.parse` puis nombre puis `localeCompare('fr')`.
- Tri au clic sur l'en-tête (asc puis desc).

**Formulaires** : recherche uniquement ; bouton « Actualiser ».

**Affichage**
- `formatHours` local : décimal, par exemple « 7.5h ». Diffère de « 7h 30m » ailleurs.
- `getHoursClass` : 0 en muted, moins de 4 en ambre, sinon violet.
- Badge de présence selon `user.status` : En service (vert), En pause (ambre), Absent.

**UI Vue → shadcn React** : Table → pattern data-table (`@tanstack/react-table`) ; Input, Badge, Button → shadcn. Cartes de statistiques → maison `StatCard`.

**Mise en page**
- Stats : `grid-cols-2 lg:grid-cols-5`.
- Mobile : liste de cartes `md:hidden` (grilles de 3 puis 2).
- Desktop : tableau `hidden md:block`, colonnes triables.
- Aucun header de page.

**Bugs**
- l.489–493 : `Date.parse` appliqué à des nombres d'heures. Chrome interprète « 8 » ou « 12 » comme des dates, donc le tri numérique est incohérent selon le navigateur.
- l.6 et l.20–21 : « Actualiser » remplace tout le contenu par un spinner, et l'`animate-spin` n'est jamais visible.
- l.108 et l.189 : clé de secours `Math.random()`.
- Accents manquants : l.78 « Cette annee », l.90 « Rechercher un employe... », l.262 « Aucun employe trouve », l.455 « Employes », l.461 « Annee ».
- Utilisateurs masqués (`isVisible=false`) non filtrés côté client (à trancher).

**Cible React**
- `pages/hours/HeuresPage.tsx` (~90)
- `features/hours/components/HoursStatsGrid.tsx` (~60)
- `features/hours/components/UsersHoursTable.tsx` (~120) : columns et data-table avec `sortingFn` numérique
- `features/hours/components/UserHoursCard.tsx` (~70)
- `features/hours/lib/hoursFormat.ts` (~30)
- `features/hours/api/useUsersWithHoursQuery.ts`
- Composants partagés : `components/shared/{StatCard, SearchInput, UserCell, UserAvatar, PresenceBadge}`

---

### src/views/hours/ExportHours.vue (395 l.)

**Rôle / route** : `/export-hours`, admin.

**Appels API**
- `usersService.getUsers` : GET `users` → `ApiResponse<UserDTO[]>`. La vue gère aussi un tableau nu.
- `exportService.exportHours({ userUuids, startDate, endDate })` : `fetch` brut POST `export/hours`, `Accept` xlsx, Bearer depuis localStorage `auth_token` → Blob.
- Téléchargement par `createObjectURL` en `heures_{start}_{end}.xlsx`.

**État**
- `selectedUsers` (uuids), `exportParams` (par défaut le mois courant), recherche.
- `filteredUsers` = `selectableUsers(users)` (masqués exclus) puis recherche.
- Message de succès effacé par un `setTimeout` de 5 s.

**Formulaire**
- Dates « Date de début * » et « Date de fin * » : `required`, `max` = fin, `min` = début (validation native).
- Préréglages : Ce mois, Mois dernier, Cette année, 30 derniers jours.
- « Tout sélectionner » et « Tout désélectionner » agissent sur la liste filtrée.
- Cases à cocher natives.
- Messages : « Veuillez sélectionner au moins un utilisateur », « Export réussi ! Le fichier a été téléchargé. », « Erreur lors de l'export », « Erreur lors du chargement des utilisateurs ».
- Bouton désactivé tant que la sélection est vide. Libellé « Exporter en Excel », ou « Export en cours... » pendant l'export.

**UI Vue → shadcn React**
- Form (react-hook-form + zod : `startDate`, `endDate` avec refine début ≤ fin, `userUuids` min 1)
- Input date, Checkbox, Badge, Button, ScrollArea (liste `max-h-[400px]`) → shadcn
- Messages en bandeau → Alert shadcn ou toast

**Mise en page** : carte unique `max-w-[1200px] p-6`, dates en `grid-cols-1 sm:grid-cols-2`, barre de sélection en `flex-col sm:flex-row`.

**Bugs**
- l.246–248, l.256–257, l.339–340 : `formatDateToISO` utilise `toISOString()` sur une date à minuit local. En France, **toutes les dates sont décalées d'un jour avant**. Par défaut on obtient 31/08 → 29/09 au lieu de 01/09 → 30/09 ; les préréglages sont faux eux aussi. Impact paie fort.
- `export.ts` l.21–33 : le `fetch` contourne l'ApiClient (pas de timeout, pas d'intercepteurs, 401 non géré), et l'erreur affichée est le texte brut, éventuellement du JSON.
- l.382 : `setTimeout` non nettoyé au démontage.
- l.298 : « Tout sélectionner » écrase la sélection existante qui ne correspond pas à la recherche.

**Cible React**
- `pages/hours/ExportHoursPage.tsx` (~80)
- `features/hours/components/ExportHoursForm.tsx` (~150)
- `features/hours/components/PeriodPresets.tsx` (~50)
- `features/hours/components/UserMultiSelectList.tsx` (~110), réutilisable
- `features/hours/lib/periodPresets.ts` (~40) : dates locales sûres
- `src/lib/downloadBlob.ts` (~15)
- `features/hours/api/useExportHoursMutation.ts`
- `features/users/api/useUsersQuery` (partagé)

---

### src/views/hours/ContractHours.vue (593 l.)

**Rôle / route** : `/contract-hours`, admin.

**Appel API** : `usersService.getContractComparison(year, month)` : GET `users/contract-hours?year&month` → `{ success, message, year, month, users: UserContractComparisonDTO[] }`.

**État et watchers**
- `selectedMonth` et `selectedYear` : un watcher relance `loadData()`.
- Sélecteurs en chaîne via `computed` get/set.
- Années proposées : de l'année courante −2 à +1.
- Dérivés : totaux effectués et contrat, `joursOuvresMois` (pris sur la première ligne), `usersWithContract`.
- Filtre, tri, `formatHours` (h + minutes), `formatDifference`, `formatPercentage`.
- Classes : pourcentage ≥ 100 vert, ≥ 80 ambre, sinon rouge.

**UI Vue → shadcn React**
- Select maison → shadcn Select
- Barres de progression faites main → shadcn Progress, ou div (la couleur varie selon le seuil)
- Table → data-table ; cartes → `StatCard`

**Mise en page**
- Toolbar `flex-wrap` : ◀, mois `w-[140px]`, année `w-[100px]`, ▶, « Mois actuel », « Actualiser ».
- Stats : `grid-cols-2 lg:grid-cols-4`.
- Mobile : cartes `md:hidden`, grilles de 2 puis 3 plus barre de progression.
- Desktop : tableau de 8 colonnes triables.

**Bugs**
- l.496–500 : `formatDifference` perd le signe moins (`formatHours(Math.abs(diff))` avec un signe vide) : −5,5 s'affiche « 5h30 », seule la couleur rouge distingue.
- l.490–493 : l'arrondi des minutes peut donner « 7h60 ».
- l.5–17 : le chargement et l'erreur remplacent aussi la navigation de mois. Après une erreur, impossible de changer de mois et pas de bouton Réessayer.
- l.413–420 : les flèches peuvent sortir de la plage d'années proposées ; le Select s'affiche alors vide.

**Cible React**
- `pages/hours/ContractHoursPage.tsx` (~90)
- `features/hours/components/MonthYearPicker.tsx` (~70)
- `features/hours/components/ContractStatsGrid.tsx` (~60)
- `features/hours/components/ContractComparisonTable.tsx` (~140)
- `features/hours/components/ContractComparisonCard.tsx` (~80)
- `features/hours/lib/contractFormat.ts` (~50)
- `features/hours/api/useContractComparisonQuery.ts` (année et mois dans la clé, `keepPreviousData`)

---

### src/views/hours/JournalPointages.vue (419 l.)

**Rôle / route** : `/journal-pointages`, admin. Les filtres sont locaux, pas dans l'URL.

**Appels API**
- `userServicesService.searchServiceModifications({ page, size: 20, userUuid?, modifiedByUuid?, action?, startDate?, endDate? })` : POST `services/admin/modifications` → `PagedResponse<ServiceModificationDTO>`. Peut renvoyer `success: false` avec un `message`.
- `usersService.getUsers` : GET `users`, pour alimenter les options.
- Un clic sur une ligne ouvre `useServiceHistory().open(serviceUuid)` (dialog global).

**État**
- `loading` au premier chargement, `searchLoading` ensuite (opacité 60 %), pagination `{ page, totalPages, totalElements, first, last }`.
- Options :
  - Employé : `selectableUsers(users, [selected])` ;
  - Administrateur : tous les utilisateurs ayant le rôle ADMIN, masqués compris ;
  - Type d'action : Ajout, Modification, Suppression.
- `activeFiltersText` et `emptyText` sont dérivés des filtres **non appliqués**.

**Validation** : si début > fin, toast « La date de début doit précéder la date de fin » (titre « Filtres »). Erreur de chargement : « Erreur lors du chargement du journal » avec « Réessayer ».

**UI Vue → shadcn React**
- `SearchFilters` (maison, panneau repliable, grille de 5 colonnes, 2 sous lg, 1 sous sm, Select `clearable` avec recherche au-delà de 5 options) → maison `components/shared/SearchFilters` sur base Collapsible, avec Combobox ou Select
- Table, Badge → shadcn
- Composants maison `ModificationUser`, `ServiceModificationSummary`

**Mise en page**
- Mobile : cartes cliquables (`role=button`, Entrée et Espace).
- Desktop : tableau de 6 colonnes avec bouton icône Historique.
- Pagination centrée.

**Bugs**
- l.250 et l.312 : l'indice et le texte vide reflètent des filtres saisis mais non appliqués.
- l.37 : Réessayer relance avec les filtres courants, qui peuvent différer.
- l.389–401 : un échec du chargement des utilisateurs n'est signalé que dans la console.

**Cible React**
- `pages/hours/JournalPointagesPage.tsx` (~110)
- `features/service-history/components/ServiceModificationsTable.tsx` (~110)
- `features/service-history/components/ServiceModificationCard.tsx` (~60)
- `features/service-history/components/JournalFilters.tsx` (~90, react-hook-form + zod avec refine sur les dates)
- `features/service-history/hooks/useJournalFilters.ts` (~70)
- `features/service-history/api/useServiceModificationsSearchQuery.ts`

---

### src/components/hours/PointageActions.vue (74 l.)

- Props : `status` (`off`, `working` ou `break`), `loading`, `layout` (`row` ou `column`, défaut `column`).
- Événements : `start`, `pause`, `resume`, `end`.
- Boutons `h-14 flex-1 rounded-xl text-base font-semibold` :
  - Démarrer : `bg-green-600` ;
  - Pause : outline ambre ;
  - Terminer : `bg-rose-600` ;
  - Reprendre : vert.
- Spinner `LoaderCircle` pendant le chargement.
- Libellés courts (« Pause », « Terminer ») en `row`, longs en `column`.
- **Incohérence** : les deux usages passent `layout="row"`. Les libellés longs ne s'affichent jamais, même sur PC.
- Cible : `features/pointage/components/PointageActions.tsx` (props `onStart`, `onPause`, `onResume`, `onEnd`).

### src/components/hours/ServiceTimeline.vue (78 l.)

- Props : `services`, `activeUuid?`, `elapsedMs?`, `emptyText?`.
- Frise verticale `ol ml-1.5 border-l pl-5`, point `absolute left-[calc(-1.25rem_-_5.5px)] top-[1.05rem] size-2.5 ring-4 ring-card`, vert pour un service, ambre pour une pause, `animate-pulse` si actif.
- Heures début → fin, ou « en cours ». Durée : `duree` si terminé, `elapsed` si actif, « -- » sinon.
- Bug mineur l.71 : une pause en cours s'affiche en vert.
- Cible : `features/pointage/components/ServiceTimeline.tsx`.

### src/components/hours/ModificationUser.vue (48 l.)

- Avatar (`size-6` ou `size-8`), initiales, nom complet. Si l'utilisateur est null : icône `UserX` et `missingLabel` (« Utilisateur supprimé »).
- Cible : `features/service-history/components/ModificationUser.tsx`, construit sur un `components/shared/UserAvatar`.

### src/components/hours/ServiceHistoryDialog.vue (193 l.)

**Rôle** : dialog **global** monté dans `App.vue:168` (`showNavbar && isAdmin`). L'état vient du singleton `useServiceHistory`. Ouvert depuis UserServices, le journal et les notifications.

**Contenu**
- Titre « Historique du pointage », badge « Supprimé » si la première entrée est un DELETE, spinner de rafraîchissement.
- Employé, avec « Voir ses pointages » qui ferme le dialog et navigue vers `/users/{uuid}/services` (masqué si on y est déjà).
- États chargement, erreur (Réessayer), vide (« Aucune modification enregistrée » plus une note sur l'antériorité du journal).
- Frise : pastille d'action, date `formatParisDateTime`, auteur, puis :
  - UPDATE : grille Avant / Après, lignes modifiées barrées puis surlignées `sky` ;
  - CREATE ou DELETE : liste de valeurs.
- Dialog `max-h-[90dvh] overflow-y-auto sm:max-w-xl`.

**Cible**
- `features/service-history/components/ServiceHistoryDialog.tsx` (~110) + `ModificationTimelineEntry.tsx` (~90)
- Monté dans `components/layout/AppLayout.tsx`
- État via le store Zustand `features/service-history/store/useServiceHistoryStore.ts` (`isOpen`, `serviceUuid`, `open`, `close`, `reset`)
- Données via `useServiceModificationsQuery(serviceUuid)` avec `enabled: isOpen`

### src/components/hours/ServiceModificationSummary.vue (70 l.)

- Résumé compact : date de référence, type (barré puis surligné s'il a changé), « début – fin » avant → après (ou « (inchangé) »). Pour un DELETE, barré en `decoration-destructive/60`.
- Cible : `features/service-history/components/ServiceModificationSummary.tsx`.

### src/views/signatures/Signatures.vue (441 l.)

**Rôle / route** : `/signatures`, admin.

**Appels API**
- `signaturesService.getAllSignatures` : GET `signatures/all-users` → en réalité `{ success, users: [{ user, lastSignature }] }`. Le type TS déclaré est faux, d'où un cast par `unknown`.
- `getUserSignatures(uuid)` : GET `signatures/user/{uuid}` → `{ success, signatures }`.
- `deleteSignature(uuid)` : DELETE `signatures/{uuid}`.

**Dialogs**
- Voir : date, heures signées, image base64 (préfixe `data:image/png;base64,` ajouté s'il manque).
- Historique : chargé à l'ouverture, liste `max-h-[400px]` scrollable, images `max-h-[120px]`.
- Supprimer : « Cette action est irréversible. », « Êtes-vous sûr de vouloir supprimer cette signature ? », récapitulatif, erreur dans le dialog.
- Toasts : « Signature supprimée avec succès » (titre « Succès »), « Erreur lors du chargement des signatures » (titre « Erreur »).

**UI Vue → shadcn React** : Table, Dialog, Input → shadcn ; confirmation de suppression → **AlertDialog** conseillé.

**Mise en page**
- Un seul tableau responsive : Rôle `hidden md:table-cell` ; Date et Heures `hidden sm:table-cell`.
- En mobile, date et heures s'affichent sous le nom.
- Boutons `icon-sm` en mobile, `sm:size-auto sm:px-3` avec libellé à partir de sm.

**Bugs**
- l.344 et l.397 : types de service faux (casts).
- l.388–404 : concurrence si on ouvre vite l'historique de deux utilisateurs.
- l.426 : `uuid!`.
- l.150 et l.229 : dialogs sans `max-h-[90dvh]`.
- l.430 : la page entière se recharge après une suppression.
- Masqués non filtrés (à trancher).
- Réponse potentiellement lourde, avec le base64 de chaque dernière signature.

**Cible React**
- `pages/signatures/SignaturesPage.tsx` (~90)
- `features/signatures/components/SignaturesTable.tsx` (~120)
- `SignatureViewDialog.tsx` (~60), `SignatureHistoryDialog.tsx` (~80), `DeleteSignatureDialog.tsx` (~70)
- `features/signatures/lib/signatureImage.ts` (~10)
- `features/signatures/api/{queryKeys, useAllUsersSignaturesQuery, useUserSignaturesQuery, useDeleteSignatureMutation}.ts`

### src/components/signatures/SignatureReminderDialog.vue (121 l.)

**Rôle** : dialog **bloquant** monté dans `App.vue:171` quand `showSignatureReminder && showNavbar`. Tous les rôles sont concernés.
- Pas de bouton fermer ; `update:open` est ignoré (Échap et clic extérieur n'ont pas d'effet).
- Heures du mois dernier au format « Xh MMm ».

**Formulaire**
- SignaturePad, puis `createSignature({ signatureBase64: dataURL PNG sur fond blanc, date: new Date().toISOString(), heuresSignees })` : POST `signatures`.
- Messages : « Veuillez dessiner votre signature avant de valider. », succès « Signature enregistrée avec succès » (titre « Merci ! »), erreur « Erreur lors de l'enregistrement de la signature ».
- Émet `signed`, ce qui appelle `markSigned`.

**Cible**
- `features/signatures/components/SignatureReminderDialog.tsx` (~100) :
  - Radix `open` contrôlé, `onOpenChange` sans effet, `onEscapeKeyDown` et `onPointerDownOutside` en `preventDefault`, `showCloseButton={false}`.
  - Exception assumée à la règle du CLAUDE.md sur la fermeture par clic extérieur.
- `features/signatures/hooks/useSignatureReminder.ts` et `useCreateSignatureMutation`.

### src/components/ui/signature-pad/SignaturePad.vue (182 l.) et index.ts (1 l.)

**Fonctionnement**
- Canvas `h-44 w-full touch-none` dans un conteneur `border-2 border-dashed bg-white`.
- Pointer events avec `setPointerCapture`.
- DPR géré (`ctx.scale`). `ResizeObserver` redimensionne et restaure le tracé via une Image.
- Placeholder « Signez ici avec votre doigt ou la souris », bouton « Effacer ».
- Expose `clear()`, `toDataURL()` (fond blanc, null si vide) et `isEmpty`.

**Bugs suspects**
- l.70, l.76–77 : la taille interne est prise sur le conteneur, bordures de 2 px comprises, alors que les points sont calculés sur le canvas. Léger décalage.
- l.70 : `getBoundingClientRect` subit les transformations CSS. Pendant l'animation `zoom-in-95` du Dialog, la mesure initiale fait 95 %, et le `ResizeObserver` ne se redéclenche pas en fin de transformation. Le tracé dériverait alors vers le bas et la droite. À vérifier sur appareil ; correctif : utiliser `clientWidth` ou `entry.contentRect`.

**Cible** : `components/shared/SignaturePad.tsx` (~150), pas dans `ui/` puisque ce n'est pas un composant shadcn CLI, avec `forwardRef` et `useImperativeHandle`. Ne pas ajouter de dépendance.

### src/composables/useServiceHistory.ts (86 l.)

- Singleton au niveau du module : `isOpen`, `serviceUuid`, `modifications`, `loading`, `error`.
- Protection contre les réponses obsolètes via `requestId`.
- `open(uuid)`, `close`, `reload` (appelé par `useUserServices` après une mutation), `retry`, `reset` (appelé à la déconnexion ou à la perte des droits admin).
- Si `success` vaut false, une erreur est levée.
- Cible :
  - store Zustand pour l'ouverture ;
  - `useServiceModificationsQuery` pour les données (le `requestId` devient inutile grâce aux clés) ;
  - `reload` remplacé par `invalidateQueries(['services','admin','modifications'])` ;
  - `reset` : `store.reset()` plus `removeQueries` à la déconnexion.

### src/composables/useSignatureReminder.ts (57 l.)

- Singleton : `showSignatureReminder`, `heuresLastMonth`, drapeau `alreadyChecked`.
- `checkSignature(force)` : GET `signatures/last/summary`. Ouvre le rappel si `needsToSign` est vrai et `heuresLastMonth > 0`, silencieux en cas d'erreur.
- `markSigned`, `reset`.
- Déclenché dans `App.vue` par un watcher sur `isAuthenticated && isActive && isEmailVerified`.
- Cible :
  - `useLastSignatureSummaryQuery` : `enabled` sur cette condition, `staleTime: Infinity`, `retry: false` ;
  - ouverture dérivée : `data.needsToSign && data.heuresLastMonth > 0` ;
  - la mutation met à jour le cache avec `needsToSign: false`.

### src/composables/useUserHours.ts (138 l.)

- **Code mort** : importé nulle part.
- Contient aussi des défauts : calcul de semaine non ISO (l.32), `toISOString` en UTC (l.42), types `any`.
- **Ne pas migrer.**

### src/services/userServices.ts (338 l.)

Méthodes et endpoints :

| Méthode | Endpoint |
|---|---|
| `startService` | POST `services/start` |
| `endService` | POST `services/end` |
| `startBreak` | POST `services/break/start` |
| `endBreak` | POST `services/break/end` |
| `getCurrentService` | GET `services/active` |
| `getWorkedHours(params)` | GET `services/hours` (clés vides filtrées) |
| `getMonthlyServices` | GET `services/month` |
| `getServiceHistory` | POST `services/history` (`endDate` +1 jour) |
| `getDailyServices` | GET `services/user/daily` |
| `createService` (admin) | POST `services/admin/create` |
| `searchServices` (admin) | POST `services/admin/user/{uuid}` |
| `getUserWorkedHours` (admin) | GET `services/admin/hours/{uuid}` |
| `validateService` (admin) | PUT `services/admin/{uuid}` |
| `deleteService` (admin) | DELETE `services/admin/{uuid}` |
| `getActiveService` (admin) | GET `services/admin/{uuid}/active` |
| `getServiceModifications` (admin) | GET `services/admin/{uuid}/modifications` → `{ success, data }` |
| `searchServiceModifications` (admin) | POST `services/admin/modifications` |

À copier inchangé. Plusieurs types sont dupliqués entre ce fichier et `models/ServiceDTO.ts` (`ServiceStartRequest`, etc.).

### src/services/export.ts (43 l.)

`exportHours` : POST `export/hours` via `fetch` brut, retourne un Blob. Voir le bug décrit dans ExportHours. Si le service est copié inchangé, prévoir la gestion du 401 dans la mutation.

### src/services/signatures.ts (106 l.)

- `createSignature` : POST `signatures`
- `getSignatures` : GET `signatures`
- `getLastSignature` : GET `signatures/last`
- `getLastSignatureSummary` : GET `signatures/last/summary`
- `getAllSignatures` : GET `signatures/all-users` (**type faux**)
- `getUserSignatures` : GET `signatures/user/{uuid}` (**type faux**)
- `deleteSignature` : DELETE `signatures/{uuid}`

### Méthodes appelées dans users.ts, absences.ts, absenceTypes.ts et vehicles.ts

- users : `getUsers` (GET `users`), `getUsersWithHours` (GET `users/hours`), `getMyLastKilometrage` (GET `users/me/kilometrage`), `getContractComparison` (GET `users/contract-hours`).
- absences : `getAbsencePlanning` (GET `absences/admin/planning`, via `URLSearchParams` : ne pas passer `undefined`), `validateAbsence` (POST `absences/admin/{uuid}/validate`). `PlanningUserDTO` existe en double, dans `services/absences.ts` et dans `models/AbsenceDTO.ts`.
- absenceTypes : `getAbsenceTypes` (GET `absence-types` → `{ success, types }`).
- vehicles : `getVehicles` (GET `vehicules` → `{ success, vehicules }`), `addKilometrage` (POST `vehicules/kilometrages`, sans validation serveur).

### Modèles

- `ServiceDTO.ts` (138 l.) : `duree` en **secondes**, `debut` et `fin` en `Date|string`, champs de dernière modification admin, plus des types de requête en double.
- `ServiceModificationDTO.ts` (52 l.) : `action` CREATE, UPDATE ou DELETE ; `old*` null pour un CREATE, `new*` null pour un DELETE ; dates ISO au fuseau de Paris ; `ServiceModificationSearchRequest`.
- `SignatureDTO.ts` (44 l.) : `SignatureCreateRequest` (trois champs obligatoires non validés par le serveur, donc à valider côté client), `LastSignatureSummaryDTO`, `UserWithLastSignatureDTO`.
- `UserHoursDTO.ts` (34 l.) : `UserHoursDTO` et `UserWithHoursDTO` (heures décimales).
- `UserContractComparisonDTO.ts` (46 l.).

À copier inchangés.

### src/utils/timeFormatters.ts (271 l.)

- Pur TypeScript, à copier inchangé dans `src/utils` ou `src/lib`.
- Fonctions utilisées ici : `formatDuration` (secondes), `formatHours` (heures décimales ; 0 donne « 0 s », ce qui s'affiche tel quel dans les compteurs de Pointage), `formatParisDateTime` et les helpers Paris (`Intl` avec `Europe/Paris`).
- Défauts à signaler hors périmètre :
  - `getTodayDate` (l.130–133) : `toISOString`, donc le jour UTC entre 0 h et 2 h ;
  - `toISOStringWithTimezone` (l.121) : renvoie en réalité de l'UTC.

### src/utils/serviceModificationFormatters.ts (164 l.)

- Seule dépendance au framework : `import type { Component } from 'vue'` et les icônes `Pencil`, `Plus`, `Trash2` de `lucide-vue-next`.
- **Adaptation** : `import type { LucideIcon } from 'lucide-react'` avec les mêmes icônes depuis `lucide-react`, et `icon: LucideIcon`.
- À l'usage : `const Icon = meta.icon; <Icon className="size-3.5" />`. Pas de `<component :is>`.
- Le reste (`buildServiceModificationView`, `serviceModificationActionOptions`, `formatServiceKind`) reste pur. Emplacement : `features/service-history/lib/`.

---

## 1. Composants shadcn nécessaires

**Composants**

| Composant | Usages |
|---|---|
| button | partout |
| input | partout |
| label | formulaires |
| form | react-hook-form |
| select | filtres Type, mois, année |
| popover + command | Combobox véhicule, sélecteurs utilisateur avec recherche |
| calendar | optionnel, si on remplace les `input type=date` natifs (à trancher) |
| skeleton | chargements |
| dialog | détails, dialogs d'affichage |
| alert-dialog | suppression de signature |
| sheet | filtres de l'historique Pointage |
| accordion | historique Pointage |
| tabs | Planning |
| dropdown-menu | export Planning |
| avatar | listes d'utilisateurs |
| badge | statuts, actions |
| separator | Planning |
| table | data-tables |
| textarea | motif de refus |
| checkbox | ExportHours |
| scroll-area | liste d'export, historique des signatures |
| progress | ContractHours |
| collapsible | panneau de filtres du journal |
| sonner | toasts |
| tooltip | optionnel, pour remplacer les `title` |
| alert | optionnel, bandeaux d'erreur ou de succès |

**Pas de `chart`** dans ce périmètre.

**Hooks shadcn** : `use-mobile`.

**Composants maison (`components/shared`)** : BackButton, UserAvatar et UserCell (avec `getInitials`), SearchInput, StatCard, SortableHeader, `DataTable` générique, SearchFilters (Collapsible), SignaturePad, et un ensemble états chargement / erreur / vide.

## 2. Hooks TanStack Query et mutations

| Hook | service.méthode | Query key | Invalidations / options |
|---|---|---|---|
| `useActiveServiceQuery` | `userServicesService.getCurrentService` | `['services','me','active']` | `select: r => r.service`, `refetchOnWindowFocus` ; `refetchInterval` 60 s optionnel (à trancher) |
| `useMyWorkedHoursQuery` | `getWorkedHours()` | `['services','me','hours']` | — |
| `useDailyServicesQuery` | `getDailyServices` | `['services','me','daily']` | — |
| `useServiceHistoryQuery(filters, page)` | `getServiceHistory` | `['services','me','history',{startDate,endDate,isBreak,page,size}]` | `placeholderData: keepPreviousData` |
| `useStartServiceMutation`, `useEndServiceMutation`, `useStartBreakMutation`, `useEndBreakMutation` (ou `usePointageActionMutation(action)`) | `startService`, `endService`, `startBreak`, `endBreak` | — | `onSuccess` : `setQueryData(active)` (null après `end`), puis invalidation de `['services','me']` |
| `useMyLastKilometrageQuery` | `usersService.getMyLastKilometrage` | `['users','me','kilometrage']` | `enabled` pour le rôle UTILISATEUR, ou à l'ouverture du dialog |
| `useVehiclesQuery` (partagé avec la feature vehicles) | `vehiclesService.getVehicles` | `['vehicles','list']` | `select: r => r.vehicules` |
| `useAddKilometrageMutation` | `addKilometrage` | — | invalide `['users','me','kilometrage']` et `['vehicles']` |
| `usePlanningQuery(params)` | `absencesService.getAbsencePlanning` | `['absences','planning',params]` | `keepPreviousData` ; `enabled` si la plage personnalisée est valide |
| `useAbsenceTypesQuery` (partagé) | `absenceTypesService.getAbsenceTypes` | `['absence-types','list']` | `select: r => r.types`, `staleTime` long |
| `useValidateAbsenceMutation` (partagé) | `absencesService.validateAbsence` | — | invalide `['absences']` (planning et recherche admin) ; toast en cas d'erreur |
| `useUsersWithHoursQuery` | `usersService.getUsersWithHours` | `['users','hours']` | `select: r => r.users` |
| `useContractComparisonQuery(year, month)` | `usersService.getContractComparison` | `['users','contract-hours',{year,month}]` | `keepPreviousData` |
| `useUsersQuery` (partagé) | `usersService.getUsers` | `['users','list']` | `select` qui normalise `data` ou un tableau |
| `useExportHoursMutation` | `exportService.exportHours` | — | `onSuccess` : `downloadBlob` et toast |
| `useServiceModificationsSearchQuery(filters, page)` | `searchServiceModifications` | `['services','admin','modifications','search',{...filters,page,size:20}]` | lève une erreur si `success === false` ; `keepPreviousData` |
| `useServiceModificationsQuery(serviceUuid)` | `getServiceModifications` | `['services','admin','modifications',serviceUuid]` | `enabled: isOpen && !!uuid` ; `select: r => r.data ?? []` ; lève si `success === false`. Les mutations de UserServices (autre périmètre) invalident `['services','admin','modifications']` |
| `useAllUsersSignaturesQuery` | `getAllSignatures` | `['signatures','all-users']` | `select: r => r.users` |
| `useUserSignaturesQuery(uuid)` | `getUserSignatures` | `['signatures','user',uuid]` | `enabled` quand le dialog est ouvert ; `select: r => r.signatures` |
| `useDeleteSignatureMutation` | `deleteSignature` | — | invalide `['signatures']` |
| `useLastSignatureSummaryQuery` | `getLastSignatureSummary` | `['signatures','me','summary']` | `enabled` si authentifié, actif et email vérifié ; `staleTime: Infinity` ; `retry: false` |
| `useCreateSignatureMutation` | `createSignature` | — | `setQueryData(summary, { needsToSign: false })` et invalidation de `['signatures']` |

Seul timer ailleurs que dans les requêtes : le tick d'une seconde de Pointage, via `src/hooks/useNow.ts`. Pas de polling aujourd'hui.

## 3. Bugs suspectés (fichier:ligne et impact)

**Impact fort**
1. `ExportHours.vue:246-248, 256-257, 339-340` : `toISOString()` sur minuit local. Toutes les périodes d'export (par défaut et préréglages) sont décalées d'un jour avant en France. **Fort** (paie).
2. `Planning.vue:493, 498, 503` : fériés mobiles affichés un jour trop tôt (Lundi de Pâques, Ascension, Pentecôte).
3. `Planning.vue:566-595` : mélange UTC et local lors du passage à l'heure d'été. `dateStr` est décalé après fin mars (clés dupliquées, absences et « aujourd'hui » sur le mauvais jour).
4. `Planning.vue:736-740` avec `613` : année civile combinée à la semaine ISO. Autour du Nouvel An, requête pour la mauvaise période (jusqu'à un an d'écart).
5. `Planning.vue:704-708, 721-725` : semaine 53 inaccessible (2026, 2032).
6. `Planning.vue:1073, 1091, 1122` : **XSS**. Noms et types injectés dans `innerHTML` sans échappement pendant l'export (session admin).

**Impact moyen**
7. `Planning.vue:253` : `@close` jamais émis. État du dialog (formulaire de refus, motif) conservé entre deux absences.
8. `Planning.vue:867, 890` : erreurs d'approbation et de refus avalées.
9. `Pointage.vue:849-858` avec `39, 259` : une erreur d'action masque toute la page et la barre d'actions mobile.
10. `Pointage.vue:17, 259` avec `870` : squelette et disparition de la barre après « Terminer ».
11. `Pointage.vue:548-588` contre `668-678` : total par jour de l'historique contre chrono du jour, calculs incompatibles selon le modèle des pauses.
12. `ContractHours.vue:496-500` : différences négatives affichées sans signe moins.
13. `ContractHours.vue:5-17` : après une erreur, plus de navigation de mois ni de Réessayer.

**Impact faible**
14. `Planning.vue:1211` : l'erreur d'export remplace la grille, et Réessayer recharge le planning.
15. `Planning.vue:1141-1150` : conteneur hors écran non retiré en cas d'échec.
16. `Planning.vue:751-759` : recherche d'absence répétée par cellule (performance sur 6 mois).
17. `Planning.vue:939-946` : durée d'absence sans tenir compte des demi-journées ni des jours ouvrés.
18. `Heures.vue:489-493` : tri numérique cassé par `Date.parse` (dépend du navigateur).
19. `Heures.vue:6, 20-21` : Actualiser vide la page ; l.108 et l.189 clé `Math.random()` ; l.78, 90, 262, 455, 461 accents manquants.
20. `ContractHours.vue:490-493` : « 7h60 » possible ; l.413-420 année hors options.
21. `Pointage.vue:314, 1013` : dialog km obligatoire impossible à quitter si le chargement des véhicules échoue.
22. `Pointage.vue:1027` : pas de contrôle km ≥ `latestKm`.
23. `Pointage.vue:404` : breakpoint 639 contre `md` 768 pour la barre.
24. `Pointage.vue:744` : listener de permission non retiré.
25. `Pointage.vue:6` : retour vers la landing `/`.
26. `PointageActions.vue:49, 58` contre `Pointage.vue:114` : libellés longs jamais affichés.
27. `ServiceTimeline.vue:71` : pause active affichée en vert.
28. `SignaturePad.vue:70, 76-77` : mesure incluant les bordures et sensible au `transform` du Dialog, donc décalage probable du tracé.
29. `Signatures.vue:344, 397` et `signatures.ts:80, 89` : types de réponse faux.
30. `Signatures.vue:388-404` : concurrence sur l'historique ; l.150 et l.229 dialogs sans `max-h` ; `Planning.vue:252` idem.
31. `export.ts:21-33` : `fetch` hors ApiClient (pas de timeout, 401 non géré, message brut).
32. `ExportHours.vue:382` : `setTimeout` non nettoyé.
33. `JournalPointages.vue:250, 312` : indice et texte vide calés sur des filtres non appliqués.
34. `App.vue:76` (hors périmètre, mais conditionne le montage des deux dialogs globaux) : `pagesWithoutNavbar` en minuscules (`'login'`, `'unauthorized'`, …) alors que les noms de route sont `Login`, `Unauthorized`, `PasswordReset`… La liste est donc inopérante.
35. `useUserHours.ts` : code mort (défauts l.32 et l.42).

## 4. Points à trancher avec le propriétaire

1. **Modèle des pauses** : la pause est-elle incluse dans un service qui reste ouvert, ou les deux se succèdent-ils ? Cela décide lequel des deux calculs de Pointage est juste. L'historique doit-il retrancher les pauses ?
2. `/pointage` pour Admin, Mécanicien et `viewAsUser` : le kilométrage doit-il être obligatoire en mode « vue utilisateur » ? Le Mécanicien doit-il accéder à `/pointage` ? La route n'a pas de garde de rôle et le lien n'apparaît pas dans sa nav.
3. Filtres de l'historique Pointage, période du Planning, filtres du journal : faut-il les garder dans l'URL (`useSearchParams`) ?
4. Dates : garder les `input type=date` natifs (préférables sur téléphone) ou passer à Popover + Calendar de shadcn ?
5. Breakpoint mobile unique à 768 (`md`) pour la barre d'actions et le côté du Sheet ?
6. Pointage : `refetchInterval` sur le service actif, ou seulement `refetchOnWindowFocus` (pointage possible depuis un autre appareil) ?
7. Kilométrage : bloquer ou avertir si km < dernier km du véhicule ? Prévoir un « Annuler » dans le dialog obligatoire ?
8. Heures, Signatures, Planning : filtrer les utilisateurs masqués (`isVisible=false`) côté client, ou le backend s'en charge-t-il ?
9. Export Planning : garder l'export en capture d'image, ou générer un PDF tabulaire (texte) avec des pages qui ne coupent pas les lignes ?
10. Signatures : seule la dernière signature est supprimable. Faut-il autoriser la suppression depuis l'historique ? La liste `all-users` renvoie-t-elle le base64 complet (poids) ?
11. Heures : format décimal « 7.5h » à conserver, ou aligner sur « 7h 30m » comme ailleurs ?
12. `getDailyServices` et services de nuit (qui commencent la veille) : comportement attendu dans « Services du jour » ? Ordre de tri renvoyé par l'API (croissant supposé en l.525) ?
13. Le PDF garde-t-il le nom de fichier `planning-absences_{start}_{end}` ? Faut-il ajouter une colonne des noms sticky dans la grille mobile ?

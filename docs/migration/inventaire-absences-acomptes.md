# Inventaire : absences et acomptes (Vue 3 → React)

J'ai lu en entier les 20 fichiers `.vue` du périmètre, les 3 services, les 3 modèles, l'enum, les 3 utils et les composants maison (SearchFilters, Select, ContextMenuPopover/Item, Retour, useContextMenu, useMessages). Je n'ai modifié aucun fichier.

## Contexte commun (routes, rôles, entrées)
- **Routes admin** : `/absences`, `/absence-types`, `/acomptes` ont `meta { requiresAuth, requiresAdmin }`. Le garde renvoie vers `/unauthorized` si l'utilisateur n'est pas admin. Si `viewAsUser` est actif, le garde appelle `authStore.setViewMode(false)`.
- **Routes employé** : `/myabsences`, `/myacomptes` ont seulement `requiresAuth`. Elles sont ouvertes à tout rôle actif dont l'email est vérifié.
- **Navigation** :
  - Navbar principale : lien « Mes … » pour UTILISATEUR seulement.
  - Full-nav, section « Mon espace » : UTILISATEUR et ADMIN.
  - Le MECANICIEN n'a aucun lien, mais la route lui est accessible par URL.
  - Admin : Absences et Acomptes sont dans la navbar et dans la section « Gestion ».
- **Liens entrants avec `?userUuid=`** :
  - `/absences` : Users.vue:979, ServicesMonitoring.vue:508, Planning.vue:199.
  - `/acomptes` : ServicesMonitoring.vue:512.
  - Notifications (views/common et components/ui/notifications) poussent `/absences` et `/acomptes` sans query.
- **Utilisation hors périmètre** : Planning.vue utilise `absencesService.getAbsencePlanning`, `validateAbsence` (l.862 et 884) et `absenceTypesService.getAbsenceTypes`. Les hooks Query de validation et de types devront donc être partagés avec Planning.
- **Toasts** : `useMessages().success(text,'Succès')` et `.error(text,'Erreur')` deviennent `toast.success` / `toast.error` de sonner.
- **Erreurs** : `ApiError extends Error`, avec `status`, `code` et `details`. Le message serveur arrive dans `err.message`.

---

### src/views/absences/Absences.vue (971 l.)
- **Rôle / route** : `/absences`, admin.
  - Lit `route.query.userUuid` au montage (l.954) et le surveille (l.965, uniquement si la valeur est truthy).
  - N'écrit jamais dans l'URL.
  - Le bouton « Types » fait `push('/absence-types')`.
- **Comportement par rôle** : admin uniquement, aucune variation interne.
- **Appels API** :
  - `absencesService.searchAbsences` → `POST absences/admin/search`.
    - Corps : `{page,size:20,sortBy:'createdAt',sortDirection:'desc', startDate?,endDate?,status?,absenceTypeUuid?,userUuid?}`.
    - Réponse `AbsenceListResponse {success, absences[], totalPages, totalElements, currentPage}`.
  - `usersService.getUsers` → `GET users` → `ApiResponse<UserDTO[]>`. Le code gère défensivement `.data` ou un tableau nu.
  - `absenceTypesService.getAbsenceTypes` → `GET absence-types` → `{success, types[]}`.
  - `absencesService.deleteAbsence` → `DELETE absences/admin/{uuid}`.
- **État local** :
  - `absences`, `users`, `absenceTypes`.
  - `loading` (chargement initial), `searchLoading`, `error`, `pagination {currentPage,totalPages,totalElements}`.
  - `searchFilters {status,absenceTypeUuid,userUuid,startDate,endDate}`, `sortKey` / `sortDirection`.
  - 5 booléens de modales, plus `selectedAbsence` et `isApproving`.
  - Données dérivées : `activeFiltersText` (texte d'aide), `tableColumns`, `filterConfig`, `sortedData` (tri client).
  - Un watcher recopie `contextMenuRef.menuElement` dans `useContextMenu`.
  - La fermeture en chaîne des modales détail et validation conserve `selectedAbsence` si l'autre modale est ouverte (l.883-901).
- **Formulaires / dialogs** : délégués aux 4 modales. Enchaînements depuis la modale détail :
  - approuver ou refuser ouvre la modale de validation ;
  - modifier ouvre la modale d'édition.
  - Suppression : le parent exécute le DELETE, puis le toast « Absence supprimée avec succès ». En cas d'échec : `err.message` ou « Erreur lors de la suppression ».
- **Table desktop (md+)** :
  - Colonnes :
    - `Absences (N)` : avatar ou initiales, puis prénom et nom.
    - `Type` : badge couleur en style inline `color+'20'` / `color` / bordure `color`. Pour un `customType`, badge `secondary`. Sinon « - ».
    - `Période` : « date longue → date longue », puis la durée et « · Matin/Après-midi » si demi-journée.
    - `Statut` : badge, plus « par {validatedBy} » si le statut n'est pas PENDING.
    - `Demandé le` : date et heure.
    - `Actions` : aligné à droite.
  - Tri client sur les 5 premières colonnes : icônes ArrowUpDown / ArrowUp / ArrowDown, en-tête actif en `text-primary`.
  - Actions par ligne :
    - si PENDING : [Approuver] en outline vert, [Refuser] en destructive ;
    - toujours : [Détails] ;
    - si statut ≠ APPROVED : [Modifier] ;
    - toujours : [Supprimer] en destructive.
  - Le clic droit ouvre un `ContextMenuPopover` titré avec le nom de l'employé, avec les mêmes actions (Approuver/Refuser si PENDING, Détails, Modifier si éditable, Supprimer).
  - Pagination serveur : « Précédent / Page x sur y / Suivant », affichée si plus d'une page.
  - État vide : icône `CalendarX` et « Aucune absence trouvée ».
- **Filtres (SearchFilters, `columns=5`, repliés par défaut, appliqués par « Rechercher », « Réinitialiser » dans le panneau)** :
  - Employé : `selectableUsers(users,[userUuid courant])`.
  - Statut : En attente / Approuvées / Refusées.
  - Type d'absence.
  - Date de début, date de fin.
  - Texte d'aide : « Nom · Statut · Type · du X au Y ». Sans filtre : « 30 derniers jours affichés ».
- **Couleurs de statut** :

  | Statut | Variante | Classes / couleur |
  |---|---|---|
  | PENDING | outline | `border-amber-500/50 text-amber-600 dark:text-amber-400` |
  | APPROVED | outline | vert |
  | REJECTED | destructive | – |
  | CANCELLED | secondary | – |
  | autre | outline | libellé « Inconnu » |

- **Mobile (<md)** :
  - Compteur « N absence(s) ».
  - Cartes : avatar, nom, date de création, puis un DropdownMenu (MoreVertical) avec les mêmes actions.
  - Ligne de badges type et statut, puis la période et la durée.
  - Mêmes filtres SearchFilters, sans Sheet.
- **Composants UI → React** :
  - Button, Badge, Table* : shadcn.
  - DropdownMenu : shadcn.
  - ContextMenuPopover, ContextMenuItem, ContextMenuSeparator et `useContextMenu` : shadcn `context-menu` (ContextMenuTrigger `asChild` sur la TableRow), ou le ContextMenuPopover maison dans components/shared.
  - SearchFilters : `components/shared/SearchFilters`.
  - Icônes lucide.
- **Bugs suspectés** :
  - **l.12-15 et l.777-779** : toute erreur de chargement (recherche, pagination, rechargement après action) remplace tout le contenu par un bandeau. Les filtres, la table et la pagination disparaissent, et il n'y a pas de bouton « Réessayer ».
  - **l.695-721** : le tri est fait côté client sur la seule page courante (20 lignes), alors que le serveur trie par `createdAt desc`. Le tri « Statut » compare les codes, pas les libellés. Le tri générique tente `Date.parse` sur toute valeur, ce qui est fragile.
  - **l.147 et l.226-227** : pour une demi-journée sur plusieurs jours, `calculateAbsenceDuration` renvoie déjà « 3 jours · Matin », et le template ajoute encore « · Matin ». Résultat affiché : « 3 jours · Matin · Matin ».
  - **l.938-950** : aucun état « en cours » pendant la suppression, et `loading` de la modale n'est jamais activé. Un double-clic envoie deux DELETE.
  - **l.965-970** : le watcher ne réagit que si `userUuid` est truthy. En revenant sur `/absences` sans query, le filtre employé reste actif. Les filtres ne sont pas persistés dans l'URL.
  - **l.563** : le texte « 30 derniers jours affichés » n'est pas vérifié. Le défaut de 30 jours n'est documenté que pour `/absences/my`, pas pour `admin/search`.
  - **l.945** : supprimer le dernier élément d'une page recharge une page vide. On obtient « Page 3 sur 2 » avec un état vide.
  - **l.332-344** : deux instances d'`AbsenceEditModal`. Chacune recharge GET users et GET types à chaque ouverture (performance).
- **Cible React** (le fichier fait 971 l., donc découpage) :
  - `pages/absences/AbsencesPage.tsx` (~120 l.) : barre d'actions, SearchFilters, table ou cartes, pagination, `<AbsenceDialogs/>`.
  - `features/absences/hooks/useAdminAbsenceFilters.ts` : filtres et `page` dans `useSearchParams` (compatibles `?userUuid=`), brouillon local pour SearchFilters, `toApiParams()`, texte d'aide.
  - `features/absences/components/admin/absenceColumns.tsx` : ColumnDef avec `DataTableColumnHeader` et des `sortingFn` explicites.
  - `features/absences/components/admin/AbsencesDataTable.tsx` : `@tanstack/react-table` et shadcn ContextMenu par ligne.
  - `features/absences/components/admin/AbsenceMobileList.tsx` : les cartes.
  - `features/absences/components/admin/absenceRowActions.ts` : `getAbsenceRowActions(item, handlers)`, une seule définition pour le menu déroulant, les boutons en ligne et le menu contextuel.
  - `features/absences/components/admin/AbsenceDialogs.tsx` : orchestre formulaire, détail, validation et suppression à partir de `useDialogState`.
  - `features/absences/api/*` : voir la section 2.

### src/views/absences/AbsenceTypes.vue (323 l.)
- **Rôle / route** : `/absence-types`, admin. Header sticky : `Retour fallback="/absences"`, h1 « Types d'absence », bouton « Nouveau type » (le texte est masqué sur mobile). Aucun paramètre lu.
- **Appels API** :
  - `absenceTypesService.getAbsenceTypes` → `GET absence-types` → `{success, types[]}`.
  - `deleteType` → `DELETE absence-types/{uuid}` → `AbsenceTypeResponse`.
- **État local** : `absenceTypes`, `loading`, `error`, `showEditModal`, `showDeleteModal`, `selectedType`.
- **Dialogs** :
  - `AbsenceTypeEditModal` pour la création et l'édition.
  - Suppression dans un Dialog en ligne :
    - titre « Supprimer le type » avec une icône Trash2 ;
    - textes « Êtes-vous sûr de vouloir supprimer ce type d'absence ? » et « Cette action est irréversible. » ;
    - aperçu pastille et nom ;
    - boutons Annuler / Supprimer.
  - Toasts : « Type d'absence supprimé avec succès » ; en erreur, `err.message` ou « Erreur lors de la suppression ».
- **Table desktop** :
  - Colonnes : `Types d'absence (N)` (carré de couleur et nom), `Couleur` (pastille et code hexa), `Créé le`, `Actions` ([Modifier] default, [Supprimer] destructive).
  - Pas de tri, pas de filtre, pas de pagination.
  - État vide : « Aucun type d'absence configuré ».
- **Mobile** : compteur « N type(s) » ; cartes avec pastille, nom, code, « Créé le » et un DropdownMenu Modifier / Supprimer.
- **Composants UI → React** : Button, Table, Dialog (à passer en AlertDialog pour la confirmation), DropdownMenu. Retour devient `components/shared/BackButton`.
- **Bugs suspectés** :
  - **l.249-252** : `loading=true` à chaque rechargement (après enregistrement ou suppression). Toute la page repasse sur le spinner.
  - **l.305-317** : pas d'état « en cours » pendant la suppression, d'où un risque de double DELETE.
  - **l.9-12** : sur mobile, le bouton n'a qu'une icône et son texte est en `hidden`, donc pas de nom accessible.
  - Pas de « Réessayer » en cas d'erreur.
  - Le comportement serveur quand on supprime un type encore utilisé est inconnu.
- **Cible React** :
  - `pages/absences/AbsenceTypesPage.tsx`.
  - `features/absences/components/types/AbsenceTypesTable.tsx` (table et cartes mobiles).
  - `features/absences/components/types/AbsenceTypeFormDialog.tsx`.
  - `components/shared/ConfirmDeleteDialog.tsx`.
  - Hooks `useAbsenceTypesQuery`, `useCreateAbsenceType`, `useUpdateAbsenceType`, `useDeleteAbsenceType`.

### src/views/myabsences/MyAbsences.vue (543 l.)
- **Rôle / route** : `/myabsences`, tout utilisateur authentifié. Header sticky :
  - `Retour fallback="/"` ;
  - h1 « Mes absences » ;
  - bouton « Nouvelle demande », avec `aria-label` et le texte en `sr-only` sur mobile.
  - Aucun paramètre d'URL.
- **Appels API** :
  - `absencesService.getAbsences` → `POST absences/my`.
    - Corps après `stripEmpty` : `{page,size:20,sortBy:'createdAt',sortDirection:'desc', startDate?,endDate?,status?,absenceTypeUuid?}`.
    - Filtre serveur : l'absence doit être entièrement comprise dans [start ; end]. Sans dates, le serveur prend [aujourd'hui − 30 j ; + 10 ans].
  - `getAbsenceTypes` → `GET absence-types`.
  - `cancelAbsence` → `DELETE absences/{uuid}` → `{success,message,absence:null}`.
- **État local et dérivés** :
  - `absences`, `absenceTypes`, `loading`, `searchLoading`, `error`, `cancelling`, `showFilters`, `pagination`, `searchFilters {status,absenceTypeUuid,startDate,endDate}`.
  - Dérivés : `currentStatus`, `absenceTypeOptions`, `activeFilterCount` (type et dates, hors statut), `hasAnyFilter`, `activeFiltersText` (par défaut « Toutes vos demandes d'absence »), `countLabel` (« N demande(s) »).
  - `isMobile = useMediaQuery('(max-width: 639px)')`.
- **Formulaires / dialogs** :
  - `MyAbsenceEditModal` (création).
  - `MyAbsenceDetailModal`, qui peut enchaîner vers l'annulation.
  - Dialog d'annulation :
    - « Annuler la demande » / « Cette action est irréversible. » ;
    - résumé : Type, Période, Durée, Moment si demi-journée ;
    - boutons « Retour » et « Confirmer l'annulation » (spinner, désactivé pendant l'envoi) ;
    - toasts : « Demande annulée avec succès » ; en erreur, `err.message` ou « Erreur lors de l'annulation ».
- **Liste** :
  - Puces de statut (`role=tablist`) : Toutes / En attente / Approuvées / Refusées. Un clic recharge la page 0 ; les puces sont désactivées pendant le chargement.
  - Bouton « Filtres » : variante `default` et badge de compteur si des filtres sont actifs.
  - Ligne d'aide : texte des filtres, puis « · N demandes ».
  - Chargement : 4 Skeleton `h-[84px]`.
  - Erreur : bloc avec « Réessayer ».
  - État vide filtré : « Aucune demande ne correspond » / « Essayez d'élargir vos filtres. » et le bouton « Réinitialiser les filtres ».
  - État vide sans filtre : « Aucune demande d'absence » / « Commencez par créer votre première demande. » et le bouton « Faire une demande ».
  - Grille `lg:grid-cols-2` de `MyAbsenceCard`, pagination « Page x / y ».
- **Mobile / desktop** :
  - Sheet de filtres en bas sous 640 px (`rounded-t-2xl` et safe-area), à droite au-dessus.
  - Contenu : « Filtrer mes absences » / « Limitez la liste à un type d'absence ou à une période. ».
  - Champs : Type d'absence (Select maison, recherche si plus de 5 options, effaçable), Du, Au.
  - Pied : Réinitialiser / Appliquer.
- **Composants UI → React** :
  - Button, Input, Skeleton, Dialog (AlertDialog pour l'annulation), Sheet : shadcn.
  - Select maison : `components/shared/Combobox`.
  - Retour : `BackButton`.
  - `@vueuse` `useMediaQuery` : `src/hooks/useMediaQuery`.
- **Bugs suspectés** :
  - **l.6** : le repli `"/"` mène à la landing publique quand il n'y a pas d'historique (PWA ouverte directement). Il faudrait `/pointage` ou `getDefaultRoute`.
  - **l.387** : « Toutes vos demandes d'absence » est trompeur. Par défaut le serveur n'affiche que les absences de moins de 30 jours.
  - **l.158-186** : le Sheet modifie `searchFilters` directement, sans brouillon. Si on ferme sans « Appliquer », le badge et le texte d'aide montrent des filtres non appliqués.
  - **l.61** : le compteur reste affiché pendant `searchLoading`, donc périmé.
  - Aucun contrôle Du ≤ Au.
  - **l.530** : même cas de page vide après annulation que sur la page admin.
- **Cible React** :
  - `pages/myabsences/MyAbsencesPage.tsx` (~130 l.).
  - `features/absences/hooks/useMyAbsenceFilters.ts` : statut, filtres et page, en URL ou en state.
  - `features/absences/components/my/MyAbsenceFiltersSheet.tsx`, construit sur `components/shared/ResponsiveFilterSheet`.
  - `components/shared/StatusChips.tsx`, `SimplePagination.tsx`, `EmptyState.tsx`, `ErrorState.tsx`.
  - `components/shared/CancelRequestDialog.tsx`, alimenté par un résumé d'absence.
  - `useMyAbsencesQuery`, `useCancelAbsence`.

### src/views/acomptes/Acomptes.vue (930 l.)
- **Rôle / route** : `/acomptes`, admin. Lit et surveille `route.query.userUuid` (l.914 et 924, même logique que pour les absences). Pas d'écriture dans l'URL.
- **Appels API** :
  - `acomptesService.searchAcomptes` → `POST acomptes/admin/search`.
    - Corps : `{page,size:20,sortBy:'createdAt',sortDirection:'DESC', startDate?,endDate?,status?,userUuid?,montantMin?,montantMax?}`.
    - Réponse `{success, acomptes[], totalPages, totalElements, currentPage}`.
  - `usersService.getUsers`.
  - `deleteAcompte` → `DELETE acomptes/admin/{uuid}` → `SuccessMessageResponse`.
  - `updateAcompte(uuid,{isPaid})` → `PUT acomptes/admin/{uuid}` → `ApiResponse<AcompteDTO>`.
- **État local** : identique aux absences, avec en plus `montantMin` et `montantMax`, mais sans types. Mise à jour optimiste de `isPaid` / `paidDate` par mutation directe de l'objet, avec rollback (l.888-910).
- **Dialogs** :
  - `AcompteEditModal` (création seulement).
  - `AcompteDetailModal`, qui enchaîne vers la validation.
  - `AcompteValidateModal`.
  - `AcompteDeleteModal`, dont la confirmation est exécutée par le parent. Toast « Acompte supprimé avec succès ».
- **Table desktop** :
  - Colonnes, toutes triables côté client : `Acomptes (N)`, `Montant` (vert, semi-gras), `Raison`, `Statut` (+ « par X »), `Paiement` (badge Payé vert ou Non payé ambre, plus `paidDate` en italique), `Demandé le`, `Actions`.
  - Actions par ligne :
    - si PENDING : [Approuver] / [Refuser] ;
    - si APPROVED : bascule de paiement. Libellé « Payé » en variante `default` si non payé, « Non payé » en `outline` si payé ; le `title` dit « Marquer comme (non) payé » ;
    - toujours : [Détails], [Supprimer].
    - Pas de « Modifier ».
  - Le menu contextuel reprend ces actions, avec « Marquer payé » / « Marquer non payé ».
  - Couleurs de statut identiques à celles des absences, au masculin (« Approuvé », « Refusé », « Annulé »).
- **Filtres (SearchFilters, `columns=5` pour 6 filtres)** :
  - Employé : `selectableUsers` en conservant l'employé déjà sélectionné.
  - Statut : En attente / Approuvés / Refusés / **Annulés**.
  - Montant min, Montant max (nombres).
  - Date de début, date de fin.
  - Texte d'aide : « min€ - max€ », « > min€ », « < max€ ». Sans filtre : « 30 derniers jours affichés ».
- **Mobile** :
  - Cartes : avatar, nom, montant en grand et en vert, Dropdown avec les mêmes actions (« Marquer payé » / « Non payé »).
  - Badges statut et paiement, raison en `line-clamp-2`, date de création.
- **Composants UI → React** : identiques à Absences.vue.
- **Bugs suspectés** :
  - **l.604 et 723** : le filtre « Annulés » envoie `status='CANCELLED'`. Cette valeur n'existe pas côté API (`AcompteStatus` = PENDING|APPROVED|REJECTED). Le service documente un 500 sur valeur inconnue pour `/acomptes/my`, et il est probable que ce soit pareil en admin.
  - **l.907** : un échec de la bascule de paiement renseigne `error.value`. Toute la page est alors remplacée par le bandeau d'erreur et ne se récupère qu'en rechargeant (bug grave).
  - **l.888-910** : pas de garde contre les requêtes concurrentes, d'où une course possible sur des clics rapides. La mutation « optimiste » modifie l'objet en place.
  - **l.784-790** : `formatMontant` local (2 décimales, « 0,00 € ») diffère de `utils/acompteFormatters` (0 à 2 décimales, « 0 € »). L'affichage admin et employé n'est pas le même.
  - **l.505-507** : le texte d'aide utilise « > / < » alors que le filtre est inclusif (MyAcomptes affiche « ≥ / ≤ »). Pas de contrôle min ≤ max, ni de montant négatif.
  - **l.652-678** : même tri client limité à la page, avec le `Date.parse` fragile (par exemple sur la raison).
  - **l.115 et l.200** : ternaire redondant `'outline' : 'outline'`.
  - **l.866 / l.880** : après création on recharge la page 0 (les absences rechargent la page courante). Même cas de page vide après suppression.
  - **l.521** : le texte « 30 derniers jours affichés » n'est pas vérifié.
- **Cible React** (930 l., donc découpage) :
  - `pages/acomptes/AcomptesPage.tsx`.
  - `features/acomptes/hooks/useAdminAcompteFilters.ts`.
  - `features/acomptes/components/admin/acompteColumns.tsx` et `AcomptesDataTable.tsx`.
  - `features/acomptes/components/admin/AcompteMobileList.tsx`.
  - `features/acomptes/components/admin/acompteRowActions.ts`.
  - `features/acomptes/components/admin/AcompteDialogs.tsx`.
  - `features/acomptes/components/PaymentStatusBadge.tsx`.
  - `useToggleAcomptePaid`, avec `onMutate` / `onError` / `onSettled` sur le cache Query.

### src/views/acomptes/MyAcomptes.vue (538 l.)
- **Rôle / route** : `/myacomptes`, tout utilisateur authentifié. Header « Mes acomptes », `Retour fallback="/"`, bouton « Nouvelle demande ». Pas de paramètre d'URL.
- **Appels API** :
  - `acomptesService.getAcomptes` → `POST acomptes/my`, avec `stripEmpty`.
    - Corps : `{page,size:20,sortBy:'createdAt',sortDirection:'DESC',…}`.
    - Le statut est filtré sur une liste blanche PENDING|APPROVED|REJECTED (l.430).
    - Les montants passent par `parseFloat` (NaN ignoré).
    - Sans dates, le serveur prend `createdAt` dans [aujourd'hui − 30 j ; + 10 ans].
  - `cancelAcompte` → `DELETE acomptes/{uuid}` → `SuccessMessageResponse`.
    - 400 : « Vous ne pouvez annuler que vos propres demandes » ou « Seules les demandes en attente peuvent être annulées ».
    - 500 si l'UUID est inconnu.
- **État et UI** : même structure que MyAbsences.
  - Puces : Tous / En attente / Approuvés / Refusés.
  - Sheet : « Filtrer mes acomptes » / « Limitez la liste à un montant ou à une période. ».
  - Champs : Montant min (€), Montant max (€) (number, `inputmode=decimal`, `min=0`), Du, Au.
  - Texte d'aide « X € à Y € », « ≥ », « ≤ ». Par défaut : « Toutes vos demandes d'acompte ».
  - Vides : « Aucune demande d'acompte ».
  - Dialog d'annulation : résumé Montant / Raison / Demandé le.
- **Bugs suspectés** :
  - **l.6** : repli `"/"`, comme MyAbsences.
  - **l.386** : texte d'aide trompeur, puisque le serveur limite à 30 jours par défaut.
  - **l.161-200** : filtres du Sheet sans brouillon.
  - **l.61** : compteur périmé pendant `searchLoading`.
  - **l.526** : page vide possible après annulation.
- **Cible React** :
  - `pages/acomptes/MyAcomptesPage.tsx`.
  - `features/acomptes/hooks/useMyAcompteFilters.ts`.
  - `features/acomptes/components/my/MyAcompteFiltersSheet.tsx`.
  - Composants partagés identiques à ceux de MyAbsences.
  - `useMyAcomptesQuery`, `useCancelAcompte`.

---

### src/components/absences/AbsenceEditModal.vue (409 l.)
- **Rôle** : création et édition admin. Le mode édition est actif si `absence?.uuid` existe.
- **Appels API** :
  - À l'ouverture, `watch(modelValue, immediate)` enchaîne `resetForm()` puis `loadData()`.
    - Création : `usersService.getUsers` et `absenceTypesService.getAbsenceTypes` en parallèle.
    - Édition : les types seulement.
  - Création : `createAbsenceForUser` → `POST absences/admin/create`.
    - Corps : `{userUuid,startDate,endDate,period,absenceTypeUuid|customType,reason?,approved}`.
    - Réponse `{absence}`.
  - Édition : `updateAbsenceByAdmin` → `PUT absences/admin/{uuid}`.
    - Mise à jour partielle.
    - `absenceTypeUuid` vaut `null` si le type est personnalisé.
    - `customType` vaut `null` sinon.
    - `reason` : `trim() || null`.
- **Champs du formulaire** :
  - Édition : carte employé en lecture seule (avatar, nom, email).
  - Création : « Employé * » (Select maison avec recherche, `selectableUsers(users)`, `teleport=false`).
  - « Date de début * », « Date de fin * » : `type=date`, par défaut aujourd'hui.
  - « Période » : 3 boutons Journée entière / Matin / Après-midi (FULL_DAY par défaut).
  - « Type d'absence * » : Select avec recherche, plus l'option « Autre (personnalisé) » (valeur `custom`).
  - « Type personnalisé * » : affiché si `custom`, placeholder « Ex: Formation, Événement familial... ».
  - « Motif » : Textarea.
  - Création : case « Approuver directement » (« L'absence sera validée sans attente »).
  - Édition d'une absence REJECTED : alerte ambre « La modification repassera cette absence en statut « En attente » ».
- **Validation** : `isFormValid` = employé (en création) + dates + type (ou `customType.trim()`). Le bouton est désactivé tant que le formulaire est invalide. Il n'y a aucun message d'erreur.
- **Messages** :
  - Titres : « Modifier l'absence » / « Nouvelle absence ».
  - Boutons : « Enregistrer » / « Créer l'absence ».
  - Toasts : « Absence modifiée avec succès » / « Absence créée avec succès ».
  - En erreur : `err.message` ou « Erreur lors de la modification » / « Erreur lors de la création ». Le message s'affiche en ligne et en toast.
- **Contrainte `selectableUsers`** : respectée.
- **Bugs suspectés** :
  - **l.265-274** : pas de contrôle fin ≥ début (MyAbsenceEditModal le fait, l.197).
  - **l.343** : `new Date().toISOString().split('T')[0]` donne la date UTC. Entre minuit et 1 h ou 2 h (heure de Paris), la date par défaut est celle de la veille.
  - **l.336** : si le type de l'absence a été supprimé, le Select est vide mais le formulaire reste « valide » et renvoie l'ancien UUID.
  - **l.388** : `reason` n'est pas « trimé » en création, alors qu'il l'est en édition (l.374).
- **Cible React** :
  - `features/absences/components/admin/AbsenceFormDialog.tsx` : react-hook-form et zod, mode `create | edit`, contenu monté seulement à l'ouverture avec une `key` égale à l'uuid, donc sans useEffect de réinitialisation.
  - `features/absences/components/AbsenceFormFields.tsx` : dates, période, type, type personnalisé et motif, partagé avec la demande employé.
  - `components/shared/EmployeeComboboxField.tsx` et `ApproveDirectlyField.tsx`.
  - `features/absences/schemas.ts`.

### src/components/absences/AbsenceDetailModal.vue (239 l.)
- **Rôle** : lecture seule, admin. Émet `approve`, `reject`, `edit`, `close`. Aucun appel API.
- **Contenu** :
  - Employé : avatar 14, nom, email.
  - Type : badge couleur ou personnalisé.
  - Date de début, date de fin, Durée, Période (si demi-journée), Statut.
  - Motif.
  - Section Validation si `validatedBy` : « Validé par », « Date de validation », « Motif du refus » en rouge italique.
  - Créé le, Modifié le.
- **Pied** : Fermer ; Modifier si statut ≠ APPROVED ; Approuver / Refuser si PENDING.
- **Incohérences** :
  - l.88 : « Validé par » s'affiche aussi pour un refus (côté employé : « Traité par »).
  - l.209 : un statut inconnu reçoit les classes ambre, contrairement à la page.
- **Cible React** : `features/absences/components/admin/AbsenceDetailDialog.tsx`, construit sur `components/shared/DetailField`, `UserIdentity` et `RequestStatusBadge`.

### src/components/absences/AbsenceValidateModal.vue (166 l.)
- **Rôle** : approuver ou refuser selon `isApproving`. Appelle `validateAbsence` → `POST absences/admin/{uuid}/validate` avec `{approved, rejectionReason?}`.
- **Contenu** :
  - Résumé : Employé, Période (dates), Période (demi-journée), Motif.
  - Refus : Textarea natif « Motif du refus * », placeholder « Indiquez le motif du refus... ».
- **Validation** :
  - Le bouton est désactivé tant que le motif est vide.
  - Message « Veuillez indiquer le motif du refus » (pratiquement inatteignable puisque le bouton est désactivé).
- **Toasts** : « Absence approuvée avec succès » / « Absence refusée » ; en erreur, « Erreur lors de la validation ». Réinitialisation du motif à l'ouverture.
- **Titres** : « Approuver l'absence » / « Refuser l'absence » ; descriptions « Confirmer l'approbation de cette absence » / « Indiquer le motif du refus ».
- **Bugs suspectés** : l.21 et l.30, deux lignes libellées « Période ». Le type d'absence n'apparaît pas dans le résumé.
- **Cible React** : `components/shared/ValidateRequestDialog.tsx` (générique, résumé en `children`, `onConfirm(reason)`, `isPending`), branché sur `useValidateAbsence`. Réutilisable dans Planning.

### src/components/absences/AbsenceDeleteModal.vue (179 l.)
- **Rôle** : confirmation seulement ; émet `confirm`. Aucun appel API.
- **Contenu** : alerte « Êtes-vous sûr de vouloir supprimer cette absence ? » / « Cette action est irréversible. », employé, dates, type, période, statut. Boutons Annuler / Supprimer.
- **Bug** : l.117, `loading` n'est jamais passé à `true`, donc le bouton n'est jamais désactivé.
- **Cible React** : `components/shared/ConfirmDeleteDialog.tsx` (AlertDialog, `isPending` fourni par la mutation), avec un résumé propre à l'absence en `children`.

### src/components/absences/AbsenceTypeEditModal.vue (207 l.)
- **Appels API** : `createType` → `POST absence-types` ; `updateType` → `PUT absence-types/{uuid}`. Corps `{name,color}`, réponse `{absenceType}`.
- **Champs** :
  - « Nom du type * » : placeholder « Ex: Congés payés, Maladie... ».
  - « Couleur * » : `input type=color`, champ texte `pattern ^#[0-9A-Fa-f]{6}$` et aperçu.
  - 16 couleurs prédéfinies. Défaut `#3B82F6`.
- **Validation** : nom « trimé » non vide et couleur non vide. Le format hexa n'est contrôlé que par le `pattern` HTML natif.
- **Messages** : « Type d'absence créé/modifié avec succès » ; en erreur, « Erreur lors de l'enregistrement ». Titres « Nouveau type d'absence » / « Modifier le type ».
- **Bug** : l.147-149, pas de contrôle de format hexa dans le JS. Or `color + '20'` est utilisé partout et suppose `#RRGGBB`.
- **Cible React** :
  - `features/absences/components/types/AbsenceTypeFormDialog.tsx`, avec zod `z.string().regex(/^#[0-9A-Fa-f]{6}$/)`.
  - `features/absences/components/types/ColorPickerField.tsx` (ou dans `components/shared`).

### src/components/acomptes/AcompteEditModal.vue (232 l.)
- **Rôle** : création admin uniquement (le nom « Edit » est trompeur).
  - GET users à chaque ouverture.
  - `createAcompteForUser` → `POST acomptes/admin/new`, corps `{userUuid,montant,raison?,approved}`, réponse `ApiResponse<AcompteDTO>`.
- **Champs** :
  - « Employé * » : Select avec recherche, `selectableUsers`.
  - « Montant (€) * » : number, `min=0`, `step=0.01`, placeholder « Ex: 500 ».
  - « Raison » : Textarea.
  - « Approuver directement » (« L'acompte sera validé sans attente »).
- **Validation** : employé renseigné et montant > 0 (bouton désactivé).
- **Messages** : « Acompte créé avec succès » ; en erreur, « Erreur lors de la création ».
- **Contrainte `selectableUsers`** : respectée.
- **Bugs suspectés** :
  - **l.23-31** : le Select n'a pas `:teleport="false"` dans un Dialog, contrairement à la règle du CLAUDE.md. Risque de focus bloqué ou de z-index dans le menu de recherche.
  - **l.138** : le montant initial à 0 affiche « 0 » au lieu du placeholder.
  - **l.217** : cast erroné `response as unknown as AcompteDTO`. Sans effet, le parent ignore la valeur.
  - `min=0` ici, alors que la modale employé a `min=1`.
- **Cible React** :
  - `features/acomptes/components/admin/AcompteCreateDialog.tsx`, qui réutilise `EmployeeComboboxField`, `ApproveDirectlyField` et `features/acomptes/components/AcompteFormFields.tsx` (montant et raison).

### src/components/acomptes/AcompteDetailModal.vue (207 l.)
- **Contenu** : employé, Montant (vert), Statut, Paiement, Date de paiement (si payé), Raison, Validation (Validé par, date, Motif du refus), Créé / Modifié. Pied : Fermer, puis Approuver / Refuser si PENDING. Aucun appel API.
- **Bugs suspectés** : l.150-156, `formatMontant` local dupliqué avec 2 décimales. Pas d'action « Marquer payé » ni « Supprimer » dans le détail (à décider).
- **Cible React** : `features/acomptes/components/admin/AcompteDetailDialog.tsx`, sur les mêmes briques partagées.

### src/components/acomptes/AcompteValidateModal.vue (155 l.)
- **Appel API** : `validateAcompte` → `POST acomptes/admin/{uuid}/validate`.
- **Contenu** : résumé Employé / Montant / Raison ; même mécanique de motif de refus que pour les absences.
- **Messages** : « Acompte approuvé avec succès » / « Acompte refusé » ; titres « Approuver/Refuser l'acompte ».
- **Cible React** : `ValidateRequestDialog` partagé, avec `useValidateAcompte`.

### src/components/acomptes/AcompteDeleteModal.vue (152 l.)
- **Contenu** : alerte « Êtes-vous sûr de vouloir supprimer cet acompte ? », employé, montant, statut, raison.
- **Bug** : l.95, `loading` n'est jamais passé à `true`.
- **Cible React** : `ConfirmDeleteDialog` partagé.

### src/components/myabsences/MyAbsenceCard.vue (135 l.)
- **Carte** :
  - Bouton cliquable qui émet `open`.
  - Tuile date : jour et mois abrégé, colorée `${color}1f`. Repli `bg-primary/10`.
  - Nom du type (ou `customType`, ou « Absence »).
  - Pastille de statut via `getAbsenceStatusLabel` / `getAbsenceStatusClasses`.
  - Plage de dates : date longue avec le jour de la semaine si un seul jour, sinon « court → court ». Puis la durée.
  - Motif (`line-clamp-1`), « Refus : … » si REJECTED.
- **Pied si PENDING** : « Demandé le X » et le bouton ghost « Annuler » (`@click.stop` émet `cancel`).
- **Remarque** : `new Date('YYYY-MM-DD')` est interprété en UTC, ce qui convient en France mais se décale dans les fuseaux négatifs.
- **Cible React** : `features/absences/components/my/MyAbsenceCard.tsx`. Éventuellement une coque commune `components/shared/RequestCard.tsx` (tuile, titre, pastille, lignes, pied d'annulation) partagée avec MyAcompteCard.

### src/components/myabsences/MyAbsenceDetailModal.vue (200 l.)
- **Contenu** : Type (badge), Début, Fin, Durée (`text-primary`), Période, Statut, Motif, bloc « Validation » (« Traité par », « Date de traitement », motif du refus avec bordure gauche rouge).
  - Si PENDING : encart ambre « Votre demande est en attente de validation. ».
  - « Demandé le … ».
- **Pied** : Fermer, et « Annuler la demande » si PENDING (émet `cancel`).
- **Remarque** : les fonctions de statut sont redéfinies localement (Badge), alors que la carte utilise les utils. Deux styles de statut coexistent.
- **Cible React** : `features/absences/components/my/MyAbsenceDetailDialog.tsx`.

### src/components/myabsences/MyAbsenceEditModal.vue (271 l.)
- **Appels API** :
  - GET `absence-types` à chaque ouverture.
  - `createAbsenceRequest` → `POST absences`, corps `{startDate,endDate,period,absenceTypeUuid|customType,reason?}`, réponse `{absence}`.
- **Champs** : identiques à la version admin, sans employé ni « Approuver ».
  - Boutons de période : « Journée », « Matin », « Après-midi ».
  - Placeholder du motif : « Décrivez la raison de votre absence... ».
- **Validation** : dates, type (ou type personnalisé) et `end >= start`. Le bouton est désactivé sans message.
- **Messages** : « Demande d'absence envoyée avec succès » ; en erreur, « Erreur lors de l'envoi de la demande ». Titre « Nouvelle demande d'absence », bouton « Envoyer la demande ».
- **Bugs suspectés** :
  - **l.226** : date par défaut en UTC (voir AbsenceEditModal).
  - **l.197-198** : la règle de dates ne produit aucun message visible.
- **Cible React** : `features/absences/components/my/MyAbsenceRequestDialog.tsx`, sur `AbsenceFormFields` et `absenceRequestSchema`.

### src/components/myacomptes/MyAcompteCard.vue (127 l.)
- **Carte** :
  - Tuile date de création teintée selon le statut (APPROVED vert, REJECTED rouge, CANCELLED muted, sinon ambre).
  - Montant en grand, pastille de statut via les utils.
  - Raison, ou « Sans motif ».
  - Ligne de paiement si APPROVED : « Payé le X » ou « Payé » (icône CheckCircle2, vert), ou « En attente de paiement » (Hourglass, ambre).
  - « Refus : … ».
- **Pied si PENDING** : « En attente de validation » et « Annuler ».
- **Cible React** : `features/acomptes/components/my/MyAcompteCard.tsx`, éventuellement sur la coque `RequestCard`.

### src/components/myacomptes/MyAcompteDetailModal.vue (180 l.)
- **Contenu** : bloc « Montant demandé » (`text-3xl`, vert), Statut, Paiement (si APPROVED), « Payé le » (si payé), Raison, « Traitement » (Traité par, date, motif du refus), encart d'attente, « Demandé le ».
- **Pied** : Fermer, et « Annuler la demande » si PENDING.
- **Remarque** : `formatMontant` local, identique à l'util.
- **Cible React** : `features/acomptes/components/my/MyAcompteDetailDialog.tsx`.

### src/components/myacomptes/MyAcompteEditModal.vue (149 l.)
- **Appel API** : `createAcompteRequest` → `POST acomptes`, corps `{montant,raison?}`, réponse `{success,message?,acompte}`.
- **Champs** :
  - « Montant (€) * » : `min=1`, `step=0.01`, placeholder « 500 ».
  - « Raison » : textarea natif, placeholder « Motif de la demande (optionnel)... ».
- **Validation** : montant > 0.
- **Messages** : « Demande d'acompte envoyée avec succès » ; en erreur, « Erreur lors de l'envoi de la demande ».
- **Bugs suspectés** :
  - **l.22 et l.103-105** : `min="1"` contredit `montant > 0`. Pour 0,5 le bouton est actif mais la validation native du navigateur bloque l'envoi avec une infobulle.
  - **l.98** : affiche « 0 » au départ.
  - **l.33** : textarea natif au lieu du composant Textarea.
- **Cible React** : `features/acomptes/components/my/MyAcompteRequestDialog.tsx`, sur `AcompteFormFields` et un schéma zod.

---

### src/services/absences.ts (270 l.)
- **Méthodes et endpoints** :

  | Méthode | HTTP + endpoint | Réponse / remarque |
  |---|---|---|
  | `createAbsenceRequest` | POST `absences` | `{absence}` |
  | `getAbsences` | POST `absences/my` | `stripEmpty` ; `userUuid` et `includePast` ignorés ; `sortBy` sûrs : startDate, endDate, createdAt, status |
  | `cancelAbsence` | DELETE `absences/{uuid}` | `absence:null` |
  | `createAbsenceForUser` | POST `absences/admin/create` | |
  | `searchAbsences` | POST `absences/admin/search` | **sans** `stripEmpty` |
  | `getAbsenceById` | GET `absences/admin/{uuid}` | non utilisé |
  | `validateAbsence` | POST `absences/admin/{uuid}/validate` | |
  | `rejectAbsence` | (appelle `validateAbsence`) | |
  | `updateAbsenceByAdmin` | PUT `absences/admin/{uuid}` | |
  | `deleteAbsence` | DELETE `absences/admin/{uuid}` | |
  | `getAbsencePlanning` | GET `absences/admin/planning?…` | |

- **Types** : `AbsenceStatus` = PENDING|APPROVED|REJECTED (sans CANCELLED). `PlanningUserDTO` est dupliqué dans `models/AbsenceDTO.ts` avec une optionalité différente.
- **Cible React** : copié tel quel dans `src/services/`. Les hooks Query dans `features/absences/api` appliquent `stripEmpty` avant `searchAbsences`.

### src/services/absenceTypes.ts (83 l.)
- `getAbsenceTypes` : GET `absence-types` → `{types}`.
- `getTypeById` : GET `absence-types/{uuid}`, non utilisé.
- `createType` : POST ; `updateType` : PUT `absence-types/{uuid}` ; `deleteType` : DELETE, réponse `{absenceType}`.
- **Cible** : copié tel quel.

### src/services/acomptes.ts (211 l.)
- **Méthodes et endpoints** :

  | Méthode | HTTP + endpoint | Réponse / remarque |
  |---|---|---|
  | `createAcompteRequest` | POST `acomptes` | `{acompte}` |
  | `getAcomptes` | POST `acomptes/my` | `stripEmpty` |
  | `cancelAcompte` | DELETE `acomptes/{uuid}` | |
  | `createAcompteForUser` | POST `acomptes/admin/new` | `ApiResponse<AcompteDTO>`, forme différente de `createAcompteRequest` |
  | `searchAcomptes` | POST `acomptes/admin/search` | sans `stripEmpty` |
  | `getAcompteById` | GET | non utilisé |
  | `updateAcompte` | PUT `acomptes/admin/{uuid}` | `{montant?,raison?,isPaid?}` |
  | `validateAcompte` | POST `…/validate` | |
  | `deleteAcompte` | DELETE `acomptes/admin/{uuid}` | |

- **Types** : `AcompteStatus` = PENDING|APPROVED|REJECTED, avec une mise en garde sur le 500. Le filtre `isPaid` est supporté mais pas exposé dans l'interface. `sortDirection` accepte les deux casses.
- **Cible** : copié tel quel.

### src/models/AbsenceDTO.ts (39 l.), AbsenceTypeDTO.ts (9 l.), AcompteDTO.ts (63 l.)
- **AbsenceDTO** : tous les champs sont optionnels. `period` et `status` sont typés `string`, et les dates `Date | string`.
- **AbsenceTypeDTO** : `{uuid,name,color,createdAt}`.
- **AcompteDTO** : duplique `AcompteCreateRequest`, `AcompteUpdateRequest` et `AcompteValidationRequest` déjà définis dans le service. Ce sont des doublons morts.
- **Cible** : copiés tels quels. Recommandation : ajouter des unions littérales (`RequestStatus`) dans les hooks et composants, sans toucher aux DTO.

### src/enums/AbsencePeriod.ts (17 l.)
- Enum FULL_DAY / MORNING / AFTERNOON, avec les libellés « Journée entière », « Matin », « Après-midi ».
- **Cible** : copié tel quel. Il alimente le ToggleGroup de période.

### src/utils/absenceFormatters.ts (72 l.)
- `getPeriodLabel` : repli sur « Journée entière ».
- `isHalfDay`.
- `calculateAbsenceDuration` : jours calendaires `ceil(|Δ|)+1`, « ½ journée » si un seul jour en demi-journée, sinon « N jours · Matin ».
- `getAbsenceStatusLabel` : féminin.
- `getAbsenceStatusClasses` : pastilles avec fond.
- **Bugs / incohérences** :
  - **l.35-36** : on compte les jours calendaires, week-ends et fériés compris. `Math.abs` masque les dates inversées.
  - **l.42** : le suffixe « · période » provoque le doublon sur la page admin.
- **Cible** : copié. En React, un seul composant `AbsenceDateRange` affiche la durée.

### src/utils/acompteFormatters.ts (42 l.)
- `formatMontant` : 0 à 2 décimales, « 0 € ».
- `getAcompteStatusLabel` : masculin.
- `getAcompteStatusClasses`.
- **Cible** : copié, et utilisé partout, y compris côté admin, pour supprimer les 3 copies locales.

### src/utils/userVisibility.ts (33 l.)
- `isUserVisible` : `isVisible !== false`.
- `selectableUsers(users, keepUuids)`.
- **Respect de la contrainte, sélecteur par sélecteur** :

  | Sélecteur | Fichier:ligne | Appel |
  |---|---|---|
  | Filtre Employé, absences | Absences.vue:632 | `selectableUsers(users, [userUuid])` |
  | Filtre Employé, acomptes | Acomptes.vue:588 | `selectableUsers(users, [userUuid])` |
  | Création absence admin | AbsenceEditModal.vue:244 | `selectableUsers(users)` |
  | Création acompte admin | AcompteEditModal.vue:147 | `selectableUsers(users)` |

  Le texte d'aide cherche le libellé dans la liste complète, ce qui est correct. Aucun autre sélecteur d'employé dans le périmètre.
- **Cible** : copié. Appliqué dans `EmployeeComboboxField` (`keepUuids` = valeur courante). Pas de `select` Query, puisque la liste dépend de la valeur sélectionnée.

### Composants maison, pour information
- **SearchFilters** (196 l.) :
  - Panneau replié par défaut, bouton « Afficher/Masquer les filtres », bouton « Rechercher » (spinner, libellé « Recherche... »), « Réinitialiser » dans le panneau.
  - Grille de `columns` colonnes, 2 sous `lg`, 1 sous `sm`.
  - Types de champ : select (recherche si plus de 5 options, effaçable), date, text (Entrée lance la recherche), number, checkbox.
  - Émet `update:modelValue`, `search`, `reset`.
  - En React : `components/shared/SearchFilters.tsx`, avec un brouillon interne et `onApply(values)`.
- **Select maison** (469 l.) : combobox avec recherche, effaçable (« Effacer la sélection »), navigation clavier, option `teleport`. En React : `components/shared/Combobox.tsx` (shadcn Popover + Command). Le problème de téléportation disparaît avec Radix.
- **ContextMenuPopover / useContextMenu** : position fixe recalée dans le viewport, Échap, clic extérieur. En React : shadcn `context-menu` par ligne, ce qui supprime aussi le `@click` racine.
- **Retour** : `router.back()` si `history.state.position > 0`, sinon `push(fallback)`. En React : `BackButton`, avec `window.history.state?.idx > 0` et `navigate(-1)`, sinon `navigate(fallback)`.
- **useMessages** : devient sonner.

---

## 1. Composants shadcn nécessaires (CLI, style new-york)
- **Base** : `button`, `badge`, `input`, `textarea`, `label`, `checkbox`, `form`, `select`.
- **Recherche** : `popover` et `command` pour le combobox avec recherche.
- **Choix exclusifs** : `toggle-group` (période, et éventuellement les puces de statut).
- **Overlays** : `dialog`, `alert-dialog` (suppression, annulation), `sheet`, `dropdown-menu`, `context-menu`.
- **Liste** : `table`, `skeleton`, `avatar`, `separator`, `alert` (bandeaux d'erreur dans les formulaires et les pages).
- **Toasts** : `sonner`.
- **Optionnels** : `tooltip` (remplace les `title`), `pagination` (sinon une `SimplePagination` maison sur Button), `scroll-area` (défilement horizontal des puces), `calendar` (seulement si on abandonne les `input type=date` natifs ; je conseille de les garder par parité).

## 2. Hooks TanStack Query et mutations
**Query keys**
- `absenceKeys` :
  - `all = ['absences']`
  - `adminList(p) = ['absences','admin','list',p]`
  - `myList(p) = ['absences','my','list',p]`
  - `planning(p) = ['absences','planning',p]` (pour Planning.vue)
- `absenceTypeKeys` : `all = ['absence-types']`, `list() = [...all,'list']`
- `acompteKeys` :
  - `all = ['acomptes']`
  - `adminList(p) = ['acomptes','admin','list',p]`
  - `myList(p) = ['acomptes','my','list',p]`
- `userKeys.list() = ['users','list']` : hook partagé du domaine users.

**Queries**

| Hook | Service.méthode | Clé | Options |
|---|---|---|---|
| `useAdminAbsencesQuery(params)` | `absencesService.searchAbsences` (params passés par `stripEmpty`) | `absenceKeys.adminList(params)` | `placeholderData: keepPreviousData` (remplace `searchLoading`) |
| `useMyAbsencesQuery(params)` | `absencesService.getAbsences` | `absenceKeys.myList(params)` | `keepPreviousData` |
| `useAbsenceTypesQuery()` | `absenceTypesService.getAbsenceTypes` | `absenceTypeKeys.list()` | `select: r => r.types ?? []`, `staleTime` ~5 min ; partagé avec Planning et les formulaires |
| `useAdminAcomptesQuery(params)` | `acomptesService.searchAcomptes` | `acompteKeys.adminList(params)` | `keepPreviousData` |
| `useMyAcomptesQuery(params)` | `acomptesService.getAcomptes` | `acompteKeys.myList(params)` | `keepPreviousData` |
| `useUsersQuery()` (features/users) | `usersService.getUsers` | `userKeys.list()` | `select` : normalise `data` / tableau ; `staleTime` ~5 min (évite le GET users à chaque ouverture de modale) |

**Mutations**

| Mutation | Service.méthode | Invalidations / remarques |
|---|---|---|
| `useCreateAbsenceForUser` | `createAbsenceForUser` | `absenceKeys.all` |
| `useUpdateAbsenceByAdmin` | `updateAbsenceByAdmin` | `absenceKeys.all` |
| `useValidateAbsence` | `validateAbsence` | `absenceKeys.all` (listes et planning) ; réutilisé par Planning |
| `useDeleteAbsence` | `deleteAbsence` | `absenceKeys.all` |
| `useCreateAbsenceRequest` | `createAbsenceRequest` | `absenceKeys.all` |
| `useCancelAbsence` | `cancelAbsence` | `absenceKeys.all` |
| `useCreateAbsenceType` / `useUpdateAbsenceType` / `useDeleteAbsenceType` | `createType` / `updateType` / `deleteType` | `absenceTypeKeys.all` et `absenceKeys.all` (les absences embarquent nom et couleur du type) |
| `useCreateAcompteForUser` | `createAcompteForUser` | `acompteKeys.all` |
| `useValidateAcompte` | `validateAcompte` | `acompteKeys.all` |
| `useDeleteAcompte` | `deleteAcompte` | `acompteKeys.all` |
| `useToggleAcomptePaid` | `updateAcompte(uuid,{isPaid})` | voir ci-dessous |
| `useCreateAcompteRequest` | `createAcompteRequest` | `acompteKeys.all` |
| `useCancelAcompte` | `cancelAcompte` | `acompteKeys.all` |

`useToggleAcomptePaid`, mise à jour optimiste :
- `onMutate` : `cancelQueries(acompteKeys.adminList(params))`, sauvegarde de l'état, `setQueryData` immuable (`isPaid`, `paidDate`).
- `onError` : rollback et `toast.error`. On ne touche jamais à l'état d'erreur de la page.
- `onSettled` : invalidation de `acompteKeys.all`.
- Désactiver le bouton de la ligne tant que `isPending` et que `variables.uuid` correspond à la ligne.

Si les notifications ont une query (hors périmètre), il faudra peut-être aussi invalider les notifications sur les mutations de validation.

## 3. Mutualisation absences / acomptes, sans sur-abstraction
1. **`useDialogState<T>()`** (src/hooks) : union discriminée `{type:'detail'|'edit'|'create'|'validate'|'delete'|'cancel', item?, approve?} | null`. Elle remplace les 5 booléens et la logique de fermeture en chaîne (Absences.vue l.873-911, Acomptes.vue l.818-851, My*). Le passage de détail à validation devient un simple `open({type:'validate', item, approve})`.
2. **Dialogs génériques** (`components/shared`) :
   - `ValidateRequestDialog` : titre, résumé en `children`, motif du refus obligatoire, `onConfirm(reason)`, `isPending`. Sert aux absences, aux acomptes et à Planning.
   - `ConfirmDeleteDialog` : AlertDialog, texte « irréversible », résumé en `children`, `isPending`.
   - `CancelRequestDialog` : employé, « Annuler la demande », boutons « Retour » / « Confirmer l'annulation ».
3. **Briques d'affichage** :
   - `UserAvatar` (shadcn Avatar et utilitaire `getInitials`, dupliqué 8 fois aujourd'hui) et `UserIdentity` (avatar, nom, email).
   - `DetailField` (libellé en majuscules et valeur).
   - `SummaryRow` (paire clé/valeur des résumés).
   - `RequestStatusBadge({status, labels})` : les libellés viennent de `getAbsenceStatusLabel` ou `getAcompteStatusLabel` (accord du participe), avec une seule table de classes. Cela unifie les 3 styles de statut coexistants.
4. **Actions de ligne définies une fois** : `getAbsenceRowActions` / `getAcompteRowActions` renvoient `RowAction[] {key,label,icon,variant,onSelect,hidden}`. Trois rendus partagés : `RowActionsDropdown` (mobile), `RowActionsInline` (desktop) et `RowActionsContextMenuItems`. Cela supprime la triple duplication dans chaque page admin.
5. **Page admin** :
   - `DataTable` et `DataTableColumnHeader` partagés (pattern shadcn).
   - `SimplePagination`, `EmptyState`, `ErrorState` (avec « Réessayer ») partagés.
   - Hook `useUrlFilters(schema)` (useSearchParams, valeurs brouillon et appliquées, `page`), utilisé par `useAdminAbsenceFilters` et `useAdminAcompteFilters` qui ne gardent que leur propre `toApiParams` et leur texte d'aide.
   - Util `dateRangeHint(start,end)` partagé : « du X au Y », « à partir du », « jusqu'au ».
6. **Page « mes »** :
   - `StatusChips`, `ResponsiveFilterSheet` (bas ou droite via `useMediaQuery('(max-width:639px)')`, brouillon, Réinitialiser / Appliquer), `ListSkeleton` et le même `EmptyState` (variantes « filtré » et « vide »).
   - Coque éventuelle `RequestCard` (tuile, titre, pastille, contenu, pied d'annulation si PENDING).
   - Chaque page reste explicite, sans générique `<RequestsPage<T>>`.
7. **Formulaires** :
   - `EmployeeComboboxField` (useUsersQuery et `selectableUsers`) et `ApproveDirectlyField`, partagés par les deux créations admin.
   - `AbsenceFormFields` partagé entre la création/édition admin et la demande employé ; `AcompteFormFields` (montant, raison) de même.
8. **Utils** : `utils/dateFormatters.ts` (`formatDateLong`, `formatDateTime`, `formatDateShort`, `todayLocalISO()` qui corrige le bug UTC). Ces fonctions sont redéfinies dans plus de 10 fichiers aujourd'hui.

À ne pas mutualiser : les colonnes de table, les schémas zod et les hooks Query, qui restent propres à chaque domaine.

## 4. Bugs suspectés (fichier:ligne → impact)

**Impact élevé**
1. `Acomptes.vue:907` : un échec de la bascule de paiement renseigne `error`. Toute la page est remplacée par le bandeau, sans retour possible sans recharger.
2. `Acomptes.vue:604` et `:723` : le filtre « Annulés » envoie `CANCELLED`, statut qui n'existe pas dans l'API. Risque de 500, documenté pour `/acomptes/my`.
3. `Absences.vue:12-15` et `:777-779`, `Acomptes.vue:11-14` et `:736-738` : toute erreur de chargement masque filtres, table et pagination, sans bouton « Réessayer ».

**Impact moyen**
4. `Absences.vue:147` et `:226-227` (avec `absenceFormatters.ts:42`) : affichage « 3 jours · Matin · Matin » pour une demi-journée sur plusieurs jours.
5. `Absences.vue:695-721`, `Acomptes.vue:652-678` : tri client sur la page courante seulement ; le statut est trié par code ; `Date.parse` est appliqué à toute valeur, ce qui est fragile.
6. `AbsenceEditModal.vue:265-274` : pas de contrôle fin ≥ début côté admin.
7. `AbsenceEditModal.vue:343`, `MyAbsenceEditModal.vue:226` : date par défaut en UTC, donc la veille entre minuit et 1 h ou 2 h (heure de Paris).
8. `AbsenceDeleteModal.vue:117`, `AcompteDeleteModal.vue:95`, `Absences.vue:938`, `Acomptes.vue:873`, `AbsenceTypes.vue:305` : `loading` jamais activé à la suppression, d'où des DELETE en double.
9. `Acomptes.vue:888-910` : bascule de paiement sans garde, course possible, objet modifié en place.
10. `MyAbsences.vue:387`, `MyAcomptes.vue:386` : « Toutes vos demandes » alors que le serveur n'affiche que 30 jours par défaut.
11. `MyAbsences.vue:158-186`, `MyAcomptes.vue:161-200` : filtres du Sheet sans brouillon. Le badge et le texte d'aide affichent des filtres non appliqués.
12. `MyAbsences.vue:6`, `MyAcomptes.vue:6` : le repli de Retour `"/"` mène à la landing publique.
13. `Absences.vue:965-970`, `Acomptes.vue:924-929` : le filtre `userUuid` persiste quand on revient sans query ; les filtres ne sont pas dans l'URL.
14. `AcompteEditModal.vue:23-31` : Select sans `teleport=false` dans un Dialog. Risque de focus bloqué ou de z-index (règle du CLAUDE.md).
15. `AbsenceTypeEditModal.vue:147-149` : pas de validation JS du format `#RRGGBB`, alors que `color+'20'` en dépend partout.
16. `MyAcompteEditModal.vue:22` et `:104` : `min=1` natif contre `> 0` en JS, validation incohérente. `AcompteEditModal.vue:40` a `min=0`, également incohérent avec la version employé.

**Impact faible**
17. `Acomptes.vue:784`, `AcompteDetailModal.vue:150`, `AcompteValidateModal.vue:112`, `AcompteDeleteModal.vue:110` : `formatMontant` local en 2 décimales, alors que l'util va de 0 à 2 décimales. Affichages admin et employé différents.
18. `AbsenceTypes.vue:249-252` : spinner plein écran à chaque rechargement après une mutation.
19. `Absences.vue:945`, `Acomptes.vue:880`, `MyAbsences.vue:530`, `MyAcomptes.vue:526` : page vide (« Page 3 sur 2 ») après suppression ou annulation du dernier élément.
20. `AbsenceValidateModal.vue:21` et `:30` : deux lignes « Période ».
21. `AbsenceDetailModal.vue:88` : « Validé par » affiché pour un refus.
22. `AbsenceDetailModal.vue:209` et les modales My* : un statut inconnu s'affiche en ambre.
23. `AbsenceTypes.vue:9-12` : bouton icône seul sans nom accessible sur mobile.
24. `AbsenceEditModal.vue:336` : type supprimé → Select vide mais formulaire « valide ».
25. `AbsenceEditModal.vue:388` : `reason` non « trimé » en création.
26. `MyAbsences.vue:61`, `MyAcomptes.vue:61` : compteur périmé pendant le chargement.
27. `Acomptes.vue:505-507` : texte d'aide « > / < » alors que le filtre est inclusif.
28. `Acomptes.vue:115` et `:200` : ternaire inutile.
29. `AcompteEditModal.vue:217` : cast erroné sans effet.
30. Formulaires : aucun message de validation, seulement un bouton désactivé. Chaque erreur est affichée deux fois (en ligne et en toast).

**Code mort / doublons**
- Statut `CANCELLED` géré partout dans l'interface alors qu'il est absent des deux APIs (l'annulation fait un DELETE qui renvoie `absence:null`).
- Requêtes dupliquées dans `AcompteDTO.ts`.
- `PlanningUserDTO` défini deux fois.
- `getAbsenceById` et `getAcompteById` non utilisés.

## 5. Points d'ombre à trancher avec le propriétaire
1. **Fenêtre par défaut des listes.** `admin/search` applique-t-il aussi 30 jours ? Faut-il afficher « 30 derniers jours » côté employé, ou envoyer des dates explicites pour voir tout l'historique ?
2. **Statut CANCELLED.** Existe-t-il ? L'annulation employé est-elle une suppression définitive ? Faut-il retirer les libellés, couleurs et le filtre « Annulé(e)s » ?
3. **Acomptes admin.** Faut-il exposer la modification du montant et de la raison (`updateAcompte` le permet) ? Et un filtre « Payé / Non payé » (`isPaid` est supporté par l'API) ? Faut-il pouvoir marquer payé depuis le détail ?
4. **Tri.** Passer à un tri serveur (`manualSorting`, `sortBy` : startDate, endDate, createdAt, status…), ou garder le tri client limité à la page ? Les colonnes utilisateur, type et montant sont-elles triables côté serveur ?
5. **Durée d'absence.** Jours calendaires ou ouvrés ? Que signifie « 3 jours · Matin » : trois matinées ?
6. **Règles métier des dates.** Fin ≥ début obligatoire côté admin ? Un employé peut-il demander une absence passée ? Chevauchements ?
7. **Montants.** Minimum 0,01 € ou 1 € ? Plafond ? Deux décimales ?
8. **Types d'absence.** Que se passe-t-il quand on supprime un type utilisé (refus serveur, cascade, perte de la couleur) ? Unicité du nom ?
9. **Repli du bouton Retour** pour /myabsences et /myacomptes : `/pointage` ou la route par défaut selon le rôle ?
10. **Accès MECANICIEN** aux pages « mes » (aucun lien, mais la route est ouverte) : voulu ?
11. **Filtres dans l'URL** (partageables, conservés au rechargement), y compris pour les pages « mes » ? Garder la compatibilité `?userUuid=` pour les liens entrants.
12. **Forme de réponse** de `POST acomptes/admin/new` (`ApiResponse.data`) comparée à `POST acomptes` (`{acompte}`).
13. **Faut-il masquer aussi les utilisateurs inactifs** (`isActif=false`) dans les sélecteurs, en plus de `isVisible` ?
14. **Invalider les notifications ou le badge** après validation, création ou annulation ?
15. **Arborescence des pages.** `MyAcomptes` est dans `views/acomptes` mais `MyAbsences` dans `views/myabsences`. Faut-il garder cette asymétrie dans `pages/`, puisque la consigne dit « mêmes sous-dossiers » ?
16. **Page admin sans h1** (Absences et Acomptes, contrairement à AbsenceTypes et aux pages « mes ») : ajouter un en-tête en React ?
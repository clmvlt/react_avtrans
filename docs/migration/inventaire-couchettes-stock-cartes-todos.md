# Inventaire : couchettes, stock, cartes, todos (Vue 3 → React)

Lecture seule, aucun fichier modifié. J'ai lu en entier les 13 vues et composants du périmètre, les 6 services, les 6 modèles, `useContextMenu.ts` et `userVisibility.ts`. Pour le contexte, j'ai aussi lu les composants maison `SearchFilters`, `Select`, `ContextMenuPopover`, `ContextMenuItem`, `ContextMenuSeparator`, `Retour` ainsi que `useMessages`. J'ai vérifié quelques points par grep : `authStore`, `ApiClient` (sérialisation JSON et 204) et les variantes de `Badge`.

## Contexte transverse

**Gardes (router/index.ts)**
- `/couchettes`, `/cartes`, `/types-cartes` : `requiresAdmin`.
- `/stock`, `/todos` : `requiresMechanic` (Admin OU Mécanicien).
- `/mycouchettes` : `requiresCouchette`, via `authStore.hasCouchettePermission = user.isCouchette === true` (l.29 du store). **Conforme.**

**Navigation**
- Liens nav : `/todos` « À faire » (section sans titre), `/stock` (section Véhicules), `/cartes` et `/couchettes` (Gestion + navbar admin).
- `/mycouchettes` a `requiredPermissions: ['couchette']`, résolu par `usePermissions.hasPermission` (même règle `isCouchette`).
- `/types-cartes` n'est **pas** dans la nav : on n'y accède que par le bouton de `Cartes.vue`.
- Autres points d'entrée :
  - `Entretiens.vue` pousse vers `/stock`.
  - Les notifications de type `todo` mènent à `/todos`, celles de type `carte_expiration` à `/cartes` (sans refId exploité).

**Toasts**
- `useMessages().success(text, title?)` / `.error(text, title?)` (durées 5 s et 7 s) se traduit par `toast.success(title ?? text, { description })` avec sonner.

**Modals**
- Pattern Vue : `v-model` + `@close` + `@saved`, avec un `localOpen` calculé.
- En React : `open` / `onOpenChange` + `onSuccess`.

**Utilisateurs masqués (contrainte `selectableUsers`)**

| Sélecteur | Respecte `selectableUsers` ? |
|---|---|
| `Couchettes.vue` l.364 (filtre Employé) | ✅ `selectableUsers(users, [userUuid sélectionné])` |
| `CouchetteCreateModal.vue` l.110 | ✅ `selectableUsers(users)` (pas de keep, correct pour une création) |
| `CarteEditModal.vue` l.214 | ✅ `selectableUsers(users, [formData.userUuid])` (garde le titulaire masqué) |
| `Cartes.vue` l.475-486 | Charge GET /users **sans l'utiliser** (aucun sélecteur) : appel inutile |
| Stock, Todos | Pas de sélecteur d'employé |

**ApiClient**
- Le body passe par `JSON.stringify` : les champs `undefined` sont **omis**.
- Un 204 renvoie `{ success: true }`.
- Conséquence : tous les « vider un champ » envoyés en `undefined` sont des no-op côté serveur si le PUT suit la sémantique « absent = inchangé » (documentée pour Todo). Voir les bugs.

---

## Services & modèles

### src/services/couchettes.ts (112 l.)
- `createCouchette(data?)` → **POST** `couchettes`, body `{date?}` ou `{}`. Renvoie le `CouchetteDTO` **nu**. Erreurs 400 : "L'utilisateur n'a pas la permission couchette" | "Une couchette existe déjà pour cette date".
- `getMyCouchettes({page,size})` → **GET** `couchettes/me?page&size`, renvoie `PagedResponse<CouchetteDTO>` (`content, page, size, totalElements, totalPages, first, last`).
- `deleteMyCouchette(uuid)` → **DELETE** `couchettes/{uuid}` (204). Condition : la couchette m'appartient ET est datée d'aujourd'hui.
- `getAllCouchettes(params)` → **POST** `couchettes/admin/search`.
  - Body : `{page=0,size=20,sortBy='date',sortDirection='desc', userUuid?, startDate?, endDate?}`.
  - Réponse : `PagedResponse`.
- `createCouchetteForUser({userUuid,date?})` → **POST** `couchettes/admin`, typé `ApiResponse<CouchetteDTO>` (forme réelle inconnue).
- `deleteCouchette(uuid)` → **DELETE** `couchettes/admin/{uuid}`.
- Cible : copié tel quel ; hooks Query dans `features/couchettes/api`.

### src/services/stockItems.ts (102 l.)
- `getStockItems()` → **GET** `stock-items`, renvoie `{success, stockItems[]}`.
- `getStockItemById` → GET `stock-items/{uuid}` (**inutilisé**).
- `createStockItem(req)` → **POST** `stock-items`, renvoie `{success,message?,stockItem}`.
- `updateStockItem(uuid, partial)` → **PUT** `stock-items/{uuid}`. Partiel : `{quantite}` seul ou `{categoryId}` seul sont utilisés.
- `deleteStockItem` → **DELETE** `stock-items/{uuid}`.
- Forme de la requête : `reference, nom, description?, quantite, prixUnitaire?, categoryId?, unite`.

### src/services/stockCategories.ts (92 l.)
- `getCategories()` → **GET** `stock-categories`, renvoie `{success, categories[]}`.
- `getCategoryById` : inutilisé.
- `createCategory({nom,description?})` → **POST**, renvoie `{success,message?,category}`.
- `updateCategory` → **PUT** `stock-categories/{uuid}`.
- `deleteCategory` → **DELETE**.

### src/services/cartes.ts (77 l.)
- `getCartes()` → **GET** `cartes`, renvoie `CarteDTO[]` **nu**.
- `getCarteById` → GET `cartes/{uuid}`, renvoie `CarteDTO` nu.
- `createCarte` → **POST** `cartes`, renvoie `CarteResponse {success,message,carte}`.
- `updateCarte` → **PUT** `cartes/{uuid}`, renvoie `CarteResponse`.
- `deleteCarte` → **DELETE**.
- `getCartesByType` (`cartes/type/{uuid}`) et `getCartesByUser` (`cartes/user/{uuid}`) : **inutilisés**.

### src/services/typeCartes.ts (59 l.)
- GET `type-cartes` renvoie `TypeCarteDTO[]` nu.
- GET `type-cartes/{uuid}`.
- POST et PUT renvoient `TypeCarteDTO` **nu**.
- DELETE.

### src/services/todos.ts (127 l.)
- Catégories :
  - GET `todo-categories` renvoie `{success,categories[]}`.
  - GET `todo-categories/{uuid}` (inutilisé).
  - POST / PUT / DELETE renvoient `{success,message?,category}`.
- Todos :
  - `searchTodos` → **POST** `todos/search` avec body `TodoSearchParams`, renvoie `{success,todos[],totalPages,totalElements,currentPage}`.
  - GET `todos/{uuid}` renvoie `{todo}`.
  - POST `todos`, PUT `todos/{uuid}`, DELETE `todos/{uuid}`.
  - **POST** `todos/{uuid}/toggle` (body `{}`) renvoie `{todo}`.

### Modèles
- **src/models/CouchetteDTO.ts (33 l.)** : `CouchetteDTO{uuid?,date?(YYYY-MM-DD),user?:UserDTO,createdAt?}`, `CouchetteCreateRequest{date?}`, `AdminCouchetteCreateRequest{userUuid?,date?}`.
- **src/models/StockItemDTO.ts (14 l.)** : `{id?,reference?,nom?,description?,quantite?,prixUnitaire?,category?:StockCategoryDTO,unite?,createdAt?,updatedAt?}`. Identifiant `id` (et non `uuid`).
- **src/models/StockCategoryDTO.ts (7 l.)** : `{id?,nom?,description?,createdAt?,updatedAt?}`.
- **src/models/CarteDTO.ts (56 l.)** :
  - `CarteDTO{uuid,nom,description,code,numero,userUuid,user,typeCarteUuid,typeCarte,dateExpiration,createdAt,updatedAt}`.
  - Create : `nom, code, typeCarteUuid` requis.
  - Update : tout optionnel + `clearUser?: boolean`.
  - `CarteResponse`.
- **src/models/TypeCarteDTO.ts (26 l.)** : `{uuid,nom,description,createdAt,updatedAt}` + create/update.
- **src/models/TodoDTO.ts (114 l.)** :
  - `TodoCategoryDTO{uuid,name,color}`.
  - `TodoDTO{uuid,title,description,category,isDone,completedAt,completedBy,createdBy,createdAt,updatedAt}`.
  - `UpdateTodoCategoryRequest{name requis, color? absent=inchangée}`.
  - `UpdateTodoRequest` : tout optionnel. Commentaire du modèle : « null = inchangé. **Impossible de retirer la catégorie** ».
  - `TodoSearchParams`, réponses.
- Cible : tous copiés inchangés.

### src/utils/userVisibility.ts (33 l.)
- `isUserVisible(u)` renvoie `u?.isVisible !== false`.
- `selectableUsers(users, keepUuids=[])` filtre les visibles en gardant les UUID de `keepUuids`.
- Copié tel quel dans `src/utils`.

### src/composables/useContextMenu.ts (102 l.)
- État `{show,x,y,entity}`.
- `open(event, entity)` : fait `preventDefault`, puis réajuste la position dans le viewport (marge 8) après `nextTick`.
- `close`, `handleAction(action, cb)`, fermeture sur Échap.
- Utilisé seulement par `Cartes.vue` (dans ce périmètre).
- Cible : **supprimé**, remplacé par shadcn `context-menu` (Radix gère position, Échap et clic extérieur).

---

## Couchettes

### src/views/couchettes/Couchettes.vue (595 l.)

**Rôle / route**
- `/couchettes`, garde `requiresAuth + requiresAdmin`. Vue admin de toutes les couchettes.
- Query param **lu** : `route.query.userUuid`, au montage (l.579) puis via un watch (l.589 : recharge seulement si la valeur est truthy). Aucun query param n'est écrit.

**Comportement par rôle** : admin seul, pas de variation.

**Appels API**
- `couchettesService.getAllCouchettes` (POST `couchettes/admin/search`) avec `{page,size:20,sortBy:'date',sortDirection:'desc',startDate?,endDate?,userUuid?}`. Réponse `PagedResponse` : `content, page, totalPages (||1), totalElements`.
- `usersService.getUsers` (GET `users`). Réponse `ApiResponse<UserDTO[]>` lue en `.data`, avec repli sur un tableau nu. Une erreur est seulement loguée.
- `couchettesService.deleteCouchette` (DELETE `couchettes/admin/{uuid}`).

**Données dérivées / état**
- `activeFiltersText` (hint de `SearchFilters`) : « Prénom Nom · du 1 sept. au 3 sept. » / « à partir du … » / « jusqu'au … ». Sans filtre : **« 30 derniers jours affichés »**.
- `tableColumns` : le libellé de la 1re colonne inclut `Couchettes (totalElements)`.
- `filterConfig` : Employé (select), Date de début, Date de fin (date).
- `sortedData` : tri **client** sur la page courante (userName, date, createdAt). Comparaison Date.parse, puis nombre, puis `localeCompare('fr')` ; les null vont à la fin en asc.
- `loading` (initial), `searchLoading` (recherche), `pagination`, `searchFilters` (Record).

**Formulaires & dialogs**
- `SearchFilters` en 3 colonnes :
  - « Rechercher » : `loadCouchettes(0)`.
  - « Réinitialiser » : vide les filtres, puis `loadCouchettes(0)`.
- Modals : `CouchetteCreateModal`, `CouchetteDetailModal` (son bouton Supprimer ferme le détail et ouvre la suppression) et `CouchetteDeleteModal` (confirme, puis `handleDelete`).
- Toasts : succès « Couchette supprimée avec succès » (titre « Succès »), erreur `err.message` ou « Erreur lors de la suppression » (titre « Erreur »). En chargement : « Erreur lors du chargement des couchettes » en toast ET en bloc.

**Table / liste**
- Colonnes desktop :
  - Couchettes (N) : avatar (photo ou initiales `bg-primary`) + « Prénom Nom ».
  - Date : `toLocaleDateString` « 25 septembre 2026 ».
  - Créée le : « 25 sept. 2026, 14:03 ».
  - Actions (droite) : « Détails » (outline) + « Supprimer » (destructive).
- Tri : clic sur l'en-tête, icônes ArrowUpDown / ArrowUp / ArrowDown, colonne active en `text-primary`.
- Pagination serveur : Précédent / « Page x sur y » / Suivant, affichée si `totalPages > 1`.
- Vide : icône BedDouble + « Aucune couchette trouvée ».

**Mobile vs desktop**
- `md:hidden` : cartes avec avatar, nom, date, « Créée le … », menu ⋮ (Détails / séparateur / Supprimer en destructive) et le compteur « N couchette(s) ».
- `hidden md:block` : table.

**Composants ui → shadcn**
- Button, Table → `table` + DataTable (@tanstack/react-table).
- DropdownMenu → `dropdown-menu`.
- `SearchFilters` (maison) → `components/shared/SearchFilters`, avec Combobox (popover+command) pour l'employé et un champ date.
- Icônes lucide.

**Styles** : Tailwind uniquement, pas de `<style>`.

**Bugs suspectés**
- l.13 : `v-else-if="error"` remplace **toute** la page (filtres compris) après un échec de recherche, sans bouton réessayer. Impasse jusqu'au rechargement.
- l.400-426 : le tri client ne porte que sur les 20 lignes de la page, alors que le serveur trie par date desc. Incohérent dès 2 pages.
- l.307-331 : le hint reflète la saisie en cours, pas les filtres réellement appliqués.
- l.589 : le watch ignore la suppression du query param (le filtre reste) ; rien n'écrit l'URL.
- l.570 : après la suppression du dernier élément de la dernière page, on recharge une page vide.
- l.29 : `ref="searchFiltersRef"` n'est déclaré nulle part (inoffensif).

**Cible React (page > 250 l., à découper)**
- `pages/couchettes/CouchettesPage.tsx` (~90 l.) : orchestration.
- `features/couchettes/hooks/useCouchetteSearchParams.ts` : filtres et page dans l'URL (`useSearchParams`), avec compat `?userUuid=`.
- `features/couchettes/hooks/useCouchettesFilterConfig.ts` : options employé via `selectableUsers(users,[userUuid])` et texte du hint.
- `features/couchettes/components/CouchettesTable.tsx` + `couchettesColumns.tsx` (ColumnDef, tri).
- `features/couchettes/components/CouchetteMobileList.tsx`.
- `components/shared/UserAvatar.tsx`, `SimplePagination.tsx`, `SearchFilters.tsx`, `ErrorState.tsx` (avec retry), `EmptyState.tsx`.
- Hooks Query : `useAdminCouchettesQuery` (avec `placeholderData: keepPreviousData`), `useUsersQuery` (domaine users), `useDeleteCouchetteMutation`.

### src/views/couchettes/MesCouchettes.vue (477 l.)

**Rôle / route** : `/mycouchettes`, garde `requiresCouchette`. L'employé déclare ou annule sa couchette du jour et consulte son historique. Pas de query param.

**Comportement par rôle** : tout utilisateur avec `isCouchette === true` (admin compris, via la nav « Mon espace »).

**Appels API**
- `getMyCouchettes({page,size:20})` (GET `couchettes/me`).
- `createCouchette()` (POST `couchettes`, sans date, donc aujourd'hui côté serveur).
- `deleteMyCouchette(uuid)` (DELETE `couchettes/{uuid}`).

**Données dérivées**
- `localDateKey(new Date())` donne `todayKey` (YYYY-MM-DD local) ; `todayDateFormatted` : « jeudi 25 septembre ».
- `todayCouchette` = élément de la **page chargée** dont `date === todayKey` ; `hasTodayCouchette`.
- `monthCount` : couchettes du mois courant **parmi la page chargée**.
- `countLabel` : « N nuit(s) » (totalElements).
- `couchettesByMonth` : groupes par `YYYY-MM` (libellé « septembre 2026 »), triés desc, éléments triés par date desc.
- État local : `loading`, `hasLoadedOnce` (squelette complet au premier chargement), `creating`, `deleting`, `error`, `showDeleteModal`, `couchetteToDelete`.

**Formulaires & dialogs**
- Aucun formulaire.
- Dialog « Supprimer la couchette » :
  - Description « Cette action est irréversible. »
  - Récapitulatif : Date et « Déclarée le ».
  - Boutons « Retour » / « Supprimer » (spinner pendant la suppression).
- Toasts : « Couchette déclarée avec succès », « Couchette supprimée » ; erreurs `err.message` ou « Erreur lors de la déclaration » / « Erreur lors de la suppression ».
- Erreur de chargement : bloc avec bouton « Réessayer ».

**Listes / statuts**
- Carte hero :
  - Déclarée : bordure et dégradé verts, pastille « Déclarée », bouton outline destructif « Annuler ma couchette du jour ».
  - Non déclarée : pastille grise « Non déclarée », gros bouton h-14 « Déclarer ma couchette du jour ».
- Compteurs : « Ce mois » et « Total ».
- Historique groupé par mois, avec une tuile de date (jour et abréviation). Le jour même est en vert, sinon `bg-primary/10`.
- Corbeille visible **uniquement** sur l'élément du jour (contrainte API).
- Pagination « Page x / y ».

**Mobile vs desktop** : une colonne sur mobile ; au-delà de `lg`, grille `minmax(0,5fr)_minmax(0,4fr)`. En-tête sticky avec `Retour fallback="/"`.

**Composants ui → shadcn** : Button, Skeleton, Dialog → `alert-dialog` (confirmation). `Retour` → `components/shared/BackButton`. Lucide.

**Bugs suspectés**
- l.316 et l.320 : `todayCouchette` et `monthCount` sont calculés sur la **page courante**. Sur la page 2, le hero affiche « Non déclarée » et propose de déclarer, ce qui donne un 400 « existe déjà ». « Ce mois » est faux hors page 0 ou au-delà de 20 nuits.
- l.309 : `todayKey` est figé au montage : faux si la page reste ouverte après minuit.
- l.438 : `new Date('YYYY-MM-DD')` est interprété en UTC, avec décalage d'un jour possible en fuseau négatif (sans effet en France).
- l.34 : « Réessayer » recharge `currentPage` (l'ancienne page), pas celle qui a échoué.

**Cible React (> 250 l.)**
- `pages/couchettes/MesCouchettesPage.tsx` (~80 l.).
- `features/couchettes/components/TodayCouchetteCard.tsx`, `CouchetteCounters.tsx`, `CouchetteHistory.tsx` (groupes + pagination), `CouchetteHistoryItem.tsx`, `MyCouchetteDeleteDialog.tsx`, `MesCouchettesSkeleton.tsx`.
- `features/couchettes/lib/couchetteDates.ts` : `localDateKey`, `groupByMonth`, formateurs ; valeurs dérivées calculées au rendu, sans useEffect.
- Hooks Query : `useMyCouchettesQuery({page,size})`. Pour corriger le bug du hero, prévoir une requête dédiée page 0 (`useMyCouchettesQuery({page:0,size:20})`), séparée de l'historique paginé.
- Mutations : `useCreateMyCouchetteMutation`, `useDeleteMyCouchetteMutation`.

### src/components/couchettes/CouchetteCreateModal.vue (185 l.)

**Rôle** : dialog admin « Nouvelle couchette », description « Créer une nouvelle couchette pour un employé ». Émet `saved` et `close`.

**Appels API**
- À chaque ouverture (watch immediate) : `usersService.getUsers()`.
- Envoi : `createCouchetteForUser({userUuid, date: date || undefined})` (POST `couchettes/admin`). Émet `saved(response.data)`.

**Formulaire**
- « Employé * » : Select maison, searchable, placeholder « Sélectionner un employé », recherche « Rechercher un employé... ». Options : `selectableUsers(users)` ✅.
- « Date » : input `type=date` optionnel, hint « Laisser vide pour aujourd'hui ».
- Validation : `!!userUuid` seulement ; « Créer la couchette » est désactivé sinon, sans message.
- Erreur : bloc inline (AlertCircle) + toast « Erreur ». Succès : toast « Couchette créée avec succès » / « Succès ».
- Chargement : spinner « Chargement... » à la place du formulaire.

**shadcn** : Dialog, Button, Input, Form (RHF+zod), Combobox (popover+command).

**Bugs suspectés**
- l.170 : `response.data` alors que la forme réelle de la réponse admin est inconnue (le POST utilisateur renvoie un DTO nu). Sans impact : le parent ignore le payload.
- l.174-175 : erreur affichée deux fois (inline + toast).
- l.23 : Select dans un Dialog sans `:teleport="false"` (règle CLAUDE.md).

**Cible**
- `features/couchettes/components/CouchetteCreateDialog.tsx` (RHF + zod : `userUuid: z.string().min(1, "Sélectionnez un employé")` (message à définir), `date: z.string().optional()`).
- `useUsersQuery` + `useCreateCouchetteForUserMutation`.

### src/components/couchettes/CouchetteDeleteModal.vue (131 l.)
- **Rôle** : confirmation de suppression, en lecture seule.
- Contenu :
  - Bandeau « Êtes-vous sûr de vouloir supprimer cette couchette ? » / « Cette action est irréversible. »
  - Bloc employé : avatar 14, nom, email.
  - Grille : « Date de la couchette » (primary) et « Créée le ».
- Boutons « Annuler » / « Supprimer ». Émet `confirm` (le parent appelle l'API).
- **Bug** l.88 et l.60 : `loading` n'est jamais passé à `true`, et le parent n'a pas d'état pending. Un double clic envoie deux DELETE.
- **Cible** : `CouchetteDeleteDialog.tsx` (AlertDialog, `isPending` de la mutation) et `CouchetteUserSummary.tsx`, partagé avec le détail.

### src/components/couchettes/CouchetteDetailModal.vue (117 l.)
- **Rôle** : détails en lecture seule (mêmes blocs employé et dates que la suppression). Boutons « Fermer » / « Supprimer » ; ce dernier émet `delete(couchette)`.
- Utilise `props.couchette!` (l.115).
- **Cible** : `CouchetteDetailDialog.tsx` (Dialog) + `CouchetteUserSummary.tsx`.

---

## Stock

### src/views/stock/StockItems.vue (1060 l.)

**Rôle / route**
- `/stock`, garde `requiresMechanic`. Inventaire des pièces avec une barre latérale de catégories.
- Pas de query param : catégorie sélectionnée et recherche sont en état local.
- Bouton retour maison (ArrowLeft) : `router.back()` si historique, sinon `/entretiens`.

**Comportement par rôle**
- `isMecanicien` (l.636) compare `authStore.userRoleUuid` à des **UUID codés en dur** (admin et mécanicien, doublon de `USER_ROLE_UUIDS`).
- S'il est vrai : CRUD complet, drag & drop, stepper de quantité.
- S'il est faux : affichage en lecture seule (« N unité »). En pratique c'est du **code mort**, puisque la garde de route impose déjà admin ou mécanicien.

**Appels API**
- Montage **séquentiel** : `stockCategoriesService.getCategories()` (erreur seulement loguée) puis `stockItemsService.getStockItems()`.
- Stepper : `updateStockItem(id,{quantite})`, puis mise à jour locale.
- Drag & drop : `updateStockItem(id,{categoryId})`, puis `loadStockItems()`.
- Formulaire article : `createStockItem` (ajout local, `push`) ou `updateStockItem` (remplacement local par `response.stockItem`).
- Formulaire catégorie :
  - `createCategory` (ajout local).
  - `updateCategory` : remplacement local, puis `loadStockItems()`.
- Suppressions :
  - `deleteStockItem` : retrait local.
  - `deleteCategory` : retrait local, retour à « Tous » si la catégorie était sélectionnée, puis `loadStockItems()`.

**Données dérivées / état**
- `unclassifiedItems` (`!item.category`), `categoryOptionsForForm`, `getItemCountForCategory(id)`.
- `filteredItems` : filtre catégorie (`null` = tous, `'unclassified'`, ou un id), puis recherche insensible à la casse sur référence, nom et description.
- État local :
  - Sélection et recherche : `selectedCategoryId`, `searchQuery`.
  - Drag & drop : `draggedItem`, `dragOverCategoryId`.
  - Stepper : `updatingQuantity` (un seul id).
  - Modales : 4 modales, leurs flags `saving*` / `deleting*`, les messages `*FormError` et le `confirmText`.
- Constante `uniteOptions` : pièce/Pièce, litre/Litre, kg/Kilogramme, mètre/Mètre, boîte/Boîte, lot/Lot, unité/Unité.

**Formulaires & dialogs**
1. **Article** (« Nouvel article » / « Modifier l'article ») :

   | Champ | Contrôle | Règles |
   |---|---|---|
   | Référence * | text, placeholder `FRN-PAD-001` | `required` HTML5 |
   | Nom * | text, placeholder `Plaquettes de frein` | `required` HTML5 |
   | Description | textarea, 2 lignes | optionnel |
   | Quantité * | number, `v-model.number` | `required`, **sans min** |
   | Prix unitaire HT (€) | number, step 0.01, min 0 | optionnel |
   | Unité * | Select maison, défaut « pièce » | non effaçable |
   | Catégorie | Select searchable + clearable, placeholder « Aucune catégorie » | présélection = catégorie courante si ce n'est pas « Non classés » |

   - Messages : validation native du navigateur seulement. Erreur API inline (`err.message` ou « Erreur lors de l'enregistrement »).
   - Toasts : « Article créé avec succès ! » / « Article modifié avec succès ! » (titre « Succès »).
   - Bouton : « Enregistrer » / « Enregistrement... ».
2. **Catégorie** (« Nouvelle catégorie » / « Modifier la catégorie ») :
   - Champs : Nom * (`required`, placeholder « Freins ») et Description (textarea, placeholder « Pièces liées au système de freinage »).
   - Toasts : « Catégorie créée avec succès ! » / « Catégorie modifiée avec succès ! ».
3. **Suppression d'article** :
   - Texte « Êtes-vous sûr de vouloir supprimer l'article **nom** ? » + encart référence / quantité / unité.
   - L'utilisateur doit **taper exactement `CONFIRMER`** (placeholder « Tapez CONFIRMER »).
   - Bouton « Supprimer » / « Suppression... ». Toast « Article supprimé avec succès ! », erreur « Erreur lors de la suppression ».
4. **Suppression de catégorie** :
   - Textes : « Êtes-vous sûr de vouloir supprimer la catégorie **nom** ? » et « Les articles de cette catégorie seront déplacés vers "Non classés". »
   - Toast « Catégorie supprimée avec succès ! ».

**Listes / cartes**
- **Barre latérale** :
  - « Tous » (icône List, compteur = nombre total d'articles).
  - Une entrée par catégorie (Tag ambre, compteur). Actions au survol en desktop (crayon, corbeille) ; menu ⋮ en mobile (Modifier / Supprimer).
  - « Non classés » (Inbox, compteur).
  - Élément sélectionné ou survolé en drag : `bg-primary`. Bouton « + » pour créer une catégorie.
- **Liste d'articles** (cartes) :
  - Poignée Grip (desktop), icône Package, référence en mono (primary) et nom.
  - Badge catégorie affiché seulement dans la vue « Tous ».
  - Description tronquée à 100 caractères.
  - **Stepper** −/+ : − désactivé si ≤ 0 ; la quantité passe en **ambre si ≤ 5** (seuil de stock bas codé en dur) ; unité affichée.
  - Si `prixUnitaire > 0` : « 12,50 € / pièce » et « Total : 125,00 € » (`toFixed(2)` avec virgule).
  - Actions : crayon et corbeille en desktop, menu ⋮ en mobile.
- **Drag & drop** (HTML5 natif) : un article glissé sur une catégorie ou « Non classés » change sa catégorie, avec le toast `Article déplacé vers "X"` ou « Erreur lors du déplacement ». Info-bulle CSS « Glissez-déposez les articles vers une catégorie ».
- **État vide** (4 cas) : « Aucun article trouvé pour "q" », « Aucun article non classé », « Cette catégorie est vide », « Aucun article en stock ».
- Pas de tri, pas de pagination.

**Mobile vs desktop**
- Grille `md:grid-cols-[280px_1fr]`.
- Desktop : barre latérale sticky pleine hauteur, avec bordure droite.
- Mobile : catégories en puces qui passent à la ligne au-dessus de la liste. Le drag & drop est **inutilisable au tactile**.

**Composants ui → shadcn**
- Button, Input, Badge, Dialog.
- DropdownMenu.
- Select maison → shadcn `select` (unité) et Combobox (catégorie).
- Textarea HTML brut → shadcn `textarea`.
- Info-bulle CSS → `tooltip`.
- Suppression → `alert-dialog`.
- Formulaires → `form` (RHF+zod).

**Styles** : Tailwind seulement.

**Bugs suspectés**
- l.636-640 : UUID de rôles codés en dur au lieu de `isAdmin || isMechanic`. La branche lecture seule (l.248-250) est morte.
- l.747 : `loadStockItems` repasse `loading=true`, et **toute la page** (barre latérale comprise) est remplacée par un spinner à chaque drop (l.801), modification de catégorie (l.979) ou suppression de catégorie (l.1044). Clignotement et perte du scroll.
- l.765 : `dragstart` sans `dataTransfer.setData`. Le drag ne démarre pas sous Firefox.
- l.788 et l.798 : glisser vers « Non classés » envoie `{categoryId: undefined}`, donc un body `{}` et probablement un **no-op serveur**. Le toast annonce pourtant un succès, puis le rechargement montre l'article toujours classé.
- l.909 : même problème quand on vide la catégorie dans le formulaire d'édition.
- l.907 : `v-model.number` sur un prix vidé donne `''` (et non `undefined`), envoyé tel quel dans le JSON. Risque d'erreur 400 ou de désérialisation.
- l.368 : quantité négative acceptée par le formulaire, alors que le stepper l'interdit.
- l.719 : la requête de recherche n'est pas `trim()`ée. Un espace final fait échouer la correspondance.
- l.780 : `dragleave` se déclenche sur les enfants, d'où un surlignage qui clignote.
- l.834 et l.846 : `updatingQuantity` ne mémorise qu'un id. Deux articles modifiés en parallèle : le premier `finally` réactive le second avant sa fin.
- l.317, l.431, l.480, l.527 : DialogContent sans `max-h-[90dvh] overflow-y-auto` (règle CLAUDE.md). l.317 et l.431 sans DialogDescription (avertissement a11y).
- l.395 et l.405 : Select sans `:teleport="false"` dans un Dialog.
- l.740 : échec des catégories silencieux ; l.1056 : chargements séquentiels.

**Cible React (1060 l., découpage détaillé)**
- `pages/stock/StockItemsPage.tsx` (~100 l.) : mise en page grille, états chargement / erreur, état des dialogs (lequel est ouvert, entité ciblée).
- `features/stock/api/`
  - `queryKeys.ts`
  - `useStockItemsQuery.ts`, `useStockCategoriesQuery.ts`
  - `useCreateStockItemMutation.ts`, `useUpdateStockItemMutation.ts`
  - `useAdjustStockQuantityMutation.ts` (optimiste + rollback)
  - `useMoveStockItemMutation.ts` (optimiste)
  - `useDeleteStockItemMutation.ts`
  - `useCreateStockCategoryMutation.ts`, `useUpdateStockCategoryMutation.ts`, `useDeleteStockCategoryMutation.ts`
- `features/stock/hooks/`
  - `useStockFilters.ts` : catégorie + recherche, idéalement dans l'URL (`?categorie=&q=`).
  - `useFilteredStockItems.ts` : dérivation pure (filtre, compteurs par catégorie, non classés).
  - `useCanManageStock.ts` : `isAdmin || isMechanic` depuis le store auth.
- `features/stock/lib/stock.ts` : `UNITE_OPTIONS`, `LOW_STOCK_THRESHOLD = 5`, `formatPrice`, `truncateText`.
- `features/stock/components/`
  - `StockCategorySidebar.tsx` : liste, cibles de dépôt, bouton de création.
  - `StockCategoryNavItem.tsx` : ligne, compteur, actions survol / menu ⋮.
  - `StockToolbar.tsx` : recherche, info-bulle drag & drop, « Ajouter un article ».
  - `StockItemList.tsx` et `StockEmptyState.tsx`.
  - `StockItemCard.tsx` (draggable) et `StockQuantityStepper.tsx`.
  - `StockItemFormDialog.tsx` + `stockItemSchema.ts`.
  - `StockCategoryFormDialog.tsx` + `stockCategorySchema.ts`.
  - `StockItemDeleteDialog.tsx` : AlertDialog avec saisie `CONFIRMER`.
  - `StockCategoryDeleteDialog.tsx`.
- Générique : `src/hooks/useDragAndDrop.ts` (élément glissé et cible survolée), partagé avec Todos, ou @dnd-kit (à trancher).
- `components/shared/BackButton.tsx` avec `fallback="/entretiens"`.

---

## Cartes

### src/views/cartes/Cartes.vue (596 l.)

**Rôle / route** : `/cartes`, `requiresAdmin`. Liste des cartes (carburant, bancaires…). Pas de query param. Bouton « Types de cartes » vers `/types-cartes`.

**Appels API**
- `Promise.all` de `cartesService.getCartes()` (GET `cartes`, tableau nu), `typeCartesService.getTypeCartes()` et `usersService.getUsers()`.
- Ni `typeCartes` ni `users` ne sont **utilisés** dans le template.
- `deleteCarte(uuid)` (DELETE `cartes/{uuid}`), puis `loadData()`.

**Données dérivées / état**
- `filteredCartes` : recherche sur nom, description, numéro, nom du type, prénom, nom et email du titulaire.
- `showNumeros` et `showCodes` : `Set<uuid>` des secrets révélés, recréés à chaque changement pour la réactivité.
- `getExpirationStatus(date)`, `deleteMessage`, `contextMenu` (`useContextMenu<CarteDTO>`).

**Dialogs**
- `CarteEditModal` (création / édition).
- Suppression : « Supprimer la carte », description « Cette action est irréversible. », texte « Êtes-vous sûr de vouloir supprimer la carte "nom" ? Cette action est irréversible. », boutons Annuler / Supprimer.
- Toasts : « Carte supprimée avec succès » (Succès) ; erreurs `err.message` ou « Erreur lors de la suppression ». En chargement : « Erreur lors du chargement des cartes ».

**Table**
- Colonnes :
  - Cartes (N) : icône + nom + description.
  - Numéro : `**** **** **** 1234` + œil / œil barré (Afficher / Masquer).
  - Code : `****` + œil (seulement si un code existe).
  - Type : Badge secondary, ou `-`.
  - Expiration : icône CalendarClock et statut :
    - date passée : Badge **destructive** « Expirée » ;
    - moins de 30 jours : Badge **warning** (orange) « Expire bientôt » ;
    - sinon : date « 25 sept. 2026 » en muted.
  - Utilisateur : « Prénom Nom », ou « Non assignée » en italique.
  - Actions : « Modifier » (default) et « Supprimer » (destructive).
- Pas de tri, pas de pagination. Vide : « Aucune carte configurée ».
- **Menu contextuel** (clic droit sur une ligne desktop) : titre = nom de la carte ; Afficher/Masquer le numéro ; Afficher/Masquer le code (si code) ; séparateur ; Modifier ; séparateur ; Supprimer (destructif).

**Mobile vs desktop** : cartes empilées sur mobile (Numéro, Code, Expiration, badge du type, titulaire, menu ⋮ Modifier / Supprimer, compteur « N carte(s) ») ; table en desktop.

**shadcn** : Button, Input, Table (DataTable), Badge (variante `warning` à ajouter), Dialog → `alert-dialog`, DropdownMenu, ContextMenuPopover + `useContextMenu` → `context-menu`.

**Bugs suspectés**
- l.475-486 : GET /users et GET /type-cartes inutiles à chaque chargement.
- l.498 : `maskCardNumber` retrouve la carte **par numéro**. Deux cartes au même numéro partagent l'état révélé ; la seconde ne peut pas être révélée.
- l.503 : un numéro de 4 caractères ou moins s'affiche en clair.
- l.301 : suppression sans état pending (double DELETE possible).
- l.575 et l.585 : `loadData` repasse toute la page en spinner après chaque enregistrement ou suppression.
- l.13 : erreur sans réessayer.
- l.296 et l.466 : « irréversible » répété deux fois.
- Sécurité (point d'ombre) : le code PIN et le numéro complet arrivent **en clair** de l'API. Le masquage est purement cosmétique.

**Cible React (> 250 l.)**
- `pages/cartes/CartesPage.tsx` (~90 l.).
- `features/cartes/components/`
  - `CartesTable.tsx` + `cartesColumns.tsx`, lignes enveloppées dans un `ContextMenu`.
  - `CarteRowContextMenu.tsx`, `CarteMobileCard.tsx`.
  - `CarteSecretValue.tsx` : valeur masquée + bouton œil, pour numéro et code.
  - `CarteExpirationBadge.tsx`, `CarteDeleteDialog.tsx`.
- `features/cartes/hooks/useRevealedSecrets.ts` : `Set` de numéros et codes révélés, indexé par **uuid**.
- `features/cartes/lib/cartes.ts` : `maskCardNumber`, `maskCode`, `getExpirationStatus`, `filterCartes`.
- Hooks Query : `useCartesQuery`, `useDeleteCarteMutation`.

### src/views/cartes/TypesCartes.vue (315 l.)
- **Rôle** : `/types-cartes`, `requiresAdmin`. CRUD des types de carte. **Aucun bouton retour** vers `/cartes`, et absent de la nav.
- **API** : `getTypeCartes()`, `deleteTypeCarte(uuid)`, puis rechargement.
- **Données** : `filteredTypes` (recherche sur nom et description), `deleteMessage` (« Êtes-vous sûr de vouloir supprimer le type "nom" ? Cette action est irréversible. »).
- **Table** :
  - Colonnes : Types de cartes (N) (icône Tag + nom), Description (ou `-`), Créé le (« 25 septembre 2026 »), Actions (Modifier / Supprimer).
  - Vide : « Aucun type de carte configuré ».
- **Mobile** : cartes avec « Créé le … » et menu ⋮. Le bouton « Nouveau type » n'est qu'une icône sur mobile, **sans aria-label** (l.21-24).
- Toasts : « Type de carte supprimé avec succès » ; « Erreur lors du chargement des types de cartes ».
- **Bugs** :
  - l.176 : suppression sans pending.
  - Suppression d'un type utilisé par des cartes : comportement backend inconnu.
  - l.294 et l.304 : spinner pleine page après chaque action.
- **Cible** (315 l., léger découpage) :
  - `pages/cartes/TypesCartesPage.tsx`.
  - `features/cartes/components/TypesCartesTable.tsx` + `typesCartesColumns.tsx`, `TypeCarteMobileCard.tsx`, `TypeCarteDeleteDialog.tsx`.
  - `useTypeCartesQuery`, `useDeleteTypeCarteMutation`, `BackButton` (fallback `/cartes`).

### src/components/cartes/CarteEditModal.vue (386 l.)

**Rôle** : dialog « Créer une carte » / « Modifier la carte », avec description. Props `carteUuid`, `isCreating`.

**API**
- À chaque ouverture : `Promise.all(getTypeCartes, getUsers)`. Les erreurs sont **ignorées silencieusement** et aucun spinner n'est affiché.
- En édition : `getCarteById(uuid)` (spinner « Chargement... »).
- Création : `createCarte`. Édition : `updateCarte`. Les deux renvoient `{carte}`.

**Formulaire**

| Champ | Contrôle | Règle / hint |
|---|---|---|
| Nom de la carte * | text, placeholder « Ex: Carte entreprise principale » | `required` + **trim ≥ 2** |
| Description | text | optionnel |
| Numéro de carte | text, placeholder « 4111 1111 1111 1111 » | hint « Numéro complet de la carte (optionnel) » |
| Code PIN * | **password**, placeholder « **** » | `required` + **trim ≥ 4** ; hint « Code à 4 chiffres », sans contrôle chiffres ni longueur max |
| Date d'expiration | date | hint « Date d'expiration de la carte (optionnel) » |
| Type de carte * | Select, recherche « Rechercher un type... », vide « Aucun type trouvé » | requis |
| Utilisateur associé | Select clearable, placeholder « Sélectionner un utilisateur (optionnel) » | options `selectableUsers(users,[userUuid])` ✅ ; libellé repli sur email puis « Utilisateur inconnu » |

- Pas de message de validation : le bouton « Créer » / « Enregistrer » est simplement désactivé.
- En édition : en l'absence d'utilisateur, envoie `clearUser: true`.
- Bloc « Informations système » en édition : UUID, Créé le, Modifié le.
- Toasts : « Carte créée avec succès ! » / « Carte modifiée avec succès ! ». Erreurs : « Le type de carte est obligatoire », « Carte non trouvée », « Erreur lors du chargement de la carte », « Erreur lors de la création » / « … de la modification » (inline + toast).

**Bugs suspectés**
- l.337-339 : en édition, vider description, numéro ou date d'expiration envoie `undefined`, donc un champ absent : **impossible de les effacer** (seul l'utilisateur a `clearUser`).
- l.242-244 : si GET /users échoue, le sélecteur est vide sans aucun message.
- l.248-256 : pendant le chargement des référentiels, le formulaire vide est affiché et modifiable ; les saisies sont écrasées ensuite.
- l.330 et l.353 : `saved` puis `close` appellent deux fois `closeEditModal` côté parent (sans conséquence).
- l.85 et l.99 : Select sans `:teleport="false"`.

**Cible (> 250 l.)**
- `features/cartes/components/CarteFormDialog.tsx` : coquille, états chargement / erreur, `useCarteQuery(uuid, {enabled: open && !isCreating})`.
- `CarteForm.tsx` : champs RHF.
- `carteFormSchema.ts` (zod) : `nom.trim().min(2)`, `code.trim().min(4)` (ou `regex(/^\d{4}$/)`, à trancher), `typeCarteUuid.min(1)`, autres champs optionnels.
- `CarteSystemInfo.tsx`.
- `features/cartes/hooks/useCarteFormDefaults.ts` : DTO vers valeurs du formulaire, et mapping vers la requête create / update avec `clearUser`.
- Réutilise `useTypeCartesQuery`, `useUsersQuery`, `useCreateCarteMutation`, `useUpdateCarteMutation`.

### src/components/cartes/TypeCarteEditModal.vue (236 l.)
- **Rôle** : « Créer un type de carte » / « Modifier le type de carte ».
- **API** : en édition, `getTypeCarteById` (alors que la liste a déjà la donnée) ; puis `createTypeCarte` / `updateTypeCarte` (DTO nu).
- **Formulaire** :
  - Nom * : `required`, trim ≥ 2 (bouton désactivé), placeholder « Ex: Bancaire, Carburant... ».
  - Description : optionnelle.
  - Bloc « Informations système ».
  - Toasts : « Type de carte créé avec succès ! » / « modifié avec succès ! » ; erreurs « Type de carte non trouvé », « Erreur lors du chargement du type de carte ».
- **Bug** l.190 : description vidée → `undefined`, donc impossible à effacer en édition.
- **Cible** : `TypeCarteFormDialog.tsx` + `typeCarteFormSchema.ts`, `useTypeCarteQuery` (ou valeurs initiales passées depuis la liste), mutations create / update.

---

## Todos

### src/views/todos/Todos.vue (552 l., dont un `<style>` **non scoped** l.521-551)

**Rôle / route** : `/todos`, `requiresMechanic`. Kanban des tâches par catégorie. Pas de query param.

**Comportement par rôle** : identique pour admin et mécanicien.

**Appels API**
- En parallèle au montage :
  - `todosService.searchTodos({size:1000, sortBy:'createdAt', sortDirection:'desc'})` (POST `todos/search`), qui charge **aussi les tâches terminées**.
  - `getCategories()` : erreur seulement loguée.
- `toggleTodo(uuid)` (POST `todos/{uuid}/toggle`) : remplace la tâche dans la liste.
- Drag & drop vers une colonne : `updateTodo(uuid,{title,description,categoryUuid})`, **optimiste** avec rollback.
- Drag & drop vers la corbeille : `deleteTodo(uuid)`, **optimiste sans confirmation**, rollback silencieux.
- Suppression via dialog : `deleteTodo`, puis retrait local.
- Après un changement de catégories (`updated`) : seulement `loadCategories()`.

**Données dérivées / état**
- `filteredTodos` : masque les tâches `isDone` sauf si « Afficher terminées ».
- `getTodosByCategory(uuid|null)`.
- État local : `toggling` (verrou global), `draggingTodo`, `dragOverCategory` (`'none'` | uuid | `'trash'`), modales, `selectedTodo`, `isCreating`.

**Dialogs**
- `TodoCategoriesModal`, `TodoEditModal` (émet `openCategories`, qui ferme l'édition et ouvre les catégories).
- Suppression : « Supprimer la tâche », « Voulez-vous vraiment supprimer la tâche **titre** ? », Annuler / Supprimer, **sans pending ni toast**.

**Kanban**
- Colonne « Sans catégorie » (bordure basse de 3 px grise), puis une colonne par catégorie (bordure basse 3 px de la **couleur de la catégorie**, style inline). Badge compteur, « Aucune tâche » si vide.
- Carte tâche :
  - Bouton rond de toggle : vert plein avec coche si terminée, sinon bordure grise et survol primary.
  - Titre, barré et atténué (`opacity-60`) si terminée.
  - Description tronquée à 80 caractères.
  - Pied : prénom de `createdBy`, crayon et corbeille (visibles au survol en desktop, toujours visibles en mobile).
- Carte en cours de drag : `opacity-50`. Colonne survolée : `border-primary ring-2`.
- Corbeille flottante fixe en bas au centre, visible pendant un drag : « Déposer pour supprimer », passe en rouge plein avec icône qui rebondit au survol.

**Mobile vs desktop**
- Mobile : colonnes empilées pleine largeur (`flex-col`).
- Desktop : colonnes en ligne, `min-w-[250px]`, `max-h-[calc(100vh-180px)]` avec défilement interne ; `main` en `overflow-x-auto`.
- En-tête sticky : case « Afficher terminées », « Catégories », « Nouvelle tâche ».
- Drag & drop HTML5 **inopérant au tactile**.

**Styles (`<style>` global)**
- Transition `trash-slide` : keyframes `trashSlideIn` (0,4 s, `cubic-bezier(0.34,1.56,0.64,1)`, `translateY(150%)` vers 0) et `trashSlideOut` (0,3 s).
- Cible : classes tw-animate-css (`animate-in slide-in-from-bottom fade-in`) ou `@keyframes` dans le CSS Tailwind (`@theme`).

**shadcn** : Button, Badge, Checkbox, Dialog → `alert-dialog`, éventuellement `scroll-area` pour les colonnes.

**Bugs suspectés**
- l.187 + l.533-548 : Tailwind v4 applique `-translate-x-1/2` via la propriété CSS `translate`, et les keyframes animent `transform: translateX(-50%)`. Les deux se cumulent : la corbeille est décalée de −100 % pendant l'animation, puis saute.
- l.384 et l.415 : déposer dans « Sans catégorie » envoie `categoryUuid: undefined` (absent). Le modèle précise « impossible de retirer la catégorie » : l'UI optimiste montre le déplacement, le serveur l'ignore, et la tâche **revient** au rechargement.
- l.356-379 : suppression par corbeille sans confirmation ; erreur avalée sans toast (le rollback est silencieux).
- l.370, l.417, l.440, l.509 : erreurs silencieuses (move, toggle, suppression).
- l.492-494 : après suppression d'une catégorie, les todos ne sont pas rechargés. Les tâches qui y étaient **disparaissent** du board, car aucune colonne ne correspond et leur `category.uuid` n'est pas null.
- l.284-289 : même disparition si le chargement des catégories échoue.
- l.305 : limite en dur de 1000, sans pagination.
- l.429 : verrou de toggle global ; impossible de cocher deux tâches rapidement.
- l.243 : double clic sur « Supprimer » : deux DELETE.
- l.39 : ternaire aux deux branches identiques (code mort).
- l.92 et l.165 : actions en `opacity-0` hors survol, invisibles au clavier (a11y).
- l.348 : `categoryUuid || 'none'` : une catégorie sans uuid se confond avec « Sans catégorie » (cas limite).

**Cible React (> 250 l.)**
- `pages/todos/TodosPage.tsx` (~80 l.).
- `features/todos/components/`
  - `TodosToolbar.tsx` : Checkbox « Afficher terminées » (état dans l'URL `?terminees=1` ou state), boutons.
  - `TodoBoard.tsx`, `TodoColumn.tsx` (cible de dépôt, couleur, compteur, état vide).
  - `TodoCard.tsx`, `TodoToggleButton.tsx`.
  - `TodoTrashDropZone.tsx`, `TodoDeleteDialog.tsx`.
- `features/todos/hooks/`
  - `useTodoBoard.ts` : dérivation pure des colonnes avec filtre des terminées, et une colonne ou un repli « catégorie inconnue » pour les orphelines.
  - `useTodoDragAndDrop.ts` : ou le générique `src/hooks/useDragAndDrop.ts`.
- Hooks Query : `useTodosQuery`, `useTodoCategoriesQuery`, `useToggleTodoMutation`, `useMoveTodoMutation`, `useDeleteTodoMutation`.

### src/components/todos/TodoEditModal.vue (216 l.)
- **Rôle** : « Nouvelle tâche » / « Modifier la tâche » (description sr-only). Props `todoUuid`, `isCreating`, `categories`.
- **API** : en édition, `getTodoByUuid` (GET `todos/{uuid}`) ; puis `createTodo` / `updateTodo`. Émet `saved(response.todo)`.
- **Formulaire** :
  - Titre * : `required`, trim non vide (bouton désactivé).
  - Description : Textarea `min-h-20`.
  - Catégorie : Select maison avec label « Catégorie », non searchable, **clearable**, placeholder « Sans catégorie ».
  - Lien « Créer une catégorie » affiché seulement s'il n'existe aucune catégorie.
  - Toasts : « Tâche créée » / « Tâche modifiée » (Succès) ; erreurs « Erreur lors de l'enregistrement » (inline + toast) et « Erreur lors du chargement ».
- **Bugs** :
  - l.186-187 : en édition, vider la description ou la catégorie envoie `undefined`. Rien ne change côté serveur, alors que le Select « clearable » laisse croire le contraire.
  - l.2 : la fermeture par l'overlay n'émet que `update:modelValue`, pas `close`. Le parent garde `selectedTodo` et le formulaire n'est pas réinitialisé.
  - l.48 : Select sans `:teleport="false"`.
- **Cible** : `features/todos/components/TodoFormDialog.tsx` + `todoFormSchema.ts` (`title.trim().min(1)`), `useTodoQuery(uuid,{enabled})` (ou valeurs initiales depuis la liste), `useCreateTodoMutation`, `useUpdateTodoMutation`, shadcn `select` pour la catégorie.

### src/components/todos/TodoCategoriesModal.vue (271 l.)
- **Rôle** : « Gestion des catégories » (icône Tags). Formulaire en ligne pour ajouter ou modifier, liste des catégories, et un second Dialog frère pour confirmer la suppression.
- **API** : `getCategories` à chaque ouverture (doublon du parent) ; `createCategory` / `updateCategory` `{name: trim, color}` ; `deleteCategory`. Après chaque action : rechargement de la liste et `emit('updated')`.
- **Formulaire** :
  - « Nom de la catégorie » : `required`, trim non vide, placeholder « Ex: Urgent, En attente... ».
  - « Couleur » : `input type=color`, défaut `#581c87`.
  - Boutons « Annuler » (en édition) et « Ajouter » / « Modifier ». La ligne en cours d'édition est surlignée (`border-primary bg-primary/5`).
- **Liste** : pastille de couleur, nom, crayon, corbeille. Vide : « Aucune catégorie » / « Créez votre première catégorie ci-dessus ».
- **Suppression** : « Voulez-vous vraiment supprimer la catégorie **nom** ? », sans avertissement sur les tâches rattachées.
- Toasts : « Catégorie créée » / « modifiée » / « supprimée » ; erreurs « Erreur lors du chargement » / « de l'enregistrement » / « de la suppression ».
- **Bugs** :
  - l.158 : `close` déclaré mais jamais émis (le `@close` du parent est mort).
  - l.131 : `saving` partagé entre le formulaire et la suppression.
  - Pas d'invalidation des todos après suppression (voir Todos l.492).
- **Cible** (271 l., léger découpage) :
  - `TodoCategoriesDialog.tsx`, `TodoCategoryForm.tsx` (RHF+zod, `name.trim().min(1)`, `color` regex hex), `TodoCategoryList.tsx`, `TodoCategoryDeleteDialog.tsx` (AlertDialog).
  - Hooks : `useTodoCategoriesQuery` (partagé avec la page), `useCreateTodoCategoryMutation`, `useUpdateTodoCategoryMutation`, `useDeleteTodoCategoryMutation`.

---

## 1. Composants shadcn nécessaires (CLI)

**Composants**
- `button` : taille `icon-sm` utilisée partout.
- `input`, `textarea`, `label`, `form`.
- `badge` : la variante **`warning`** est à ajouter (fond orange-100, texte orange-700) pour « Expire bientôt ».
- `dialog`, `alert-dialog`, `dropdown-menu`, `context-menu`.
- `table` (+ @tanstack/react-table), `checkbox`, `select`.
- `popover` + `command` : Combobox searchable et clearable pour employé, type de carte, utilisateur, catégorie de stock.
- `skeleton`, `tooltip`, `sonner`, `avatar`, `separator`.
- Optionnels : `scroll-area` (colonnes kanban, barre latérale stock), `pagination`, `calendar` + `popover` (si on remplace l'input date natif).

**Maison, dans `components/shared`**
- `SearchFilters`, `Combobox`, `BackButton`.
- `LoadingState`, `ErrorState` (avec retry), `EmptyState`.
- `UserAvatar`, `SimplePagination`.
- `DataTable` + `DataTableColumnHeader` (tri).
- `ConfirmDeleteDialog` : AlertDialog générique avec `isPending` et option « taper CONFIRMER ».

**Dans `src/hooks`** : `useDragAndDrop` (générique, partagé stock et todos).

## 2. Hooks TanStack Query / mutations

| Hook | Service.méthode (HTTP) | Query key | Invalidations / cache |
|---|---|---|---|
| useUsersQuery *(domaine users, dépendance)* | usersService.getUsers (GET users) | `['users','list']` | — ; `select` : `.data ?? []` |
| useAdminCouchettesQuery(params) | couchettesService.getAllCouchettes (POST couchettes/admin/search) | `['couchettes','admin',params]` | `placeholderData: keepPreviousData` |
| useMyCouchettesQuery({page,size}) | getMyCouchettes (GET couchettes/me) | `['couchettes','me',{page,size}]` | — |
| useCreateMyCouchetteMutation | createCouchette (POST couchettes) | — | `['couchettes']` |
| useDeleteMyCouchetteMutation | deleteMyCouchette (DELETE couchettes/{uuid}) | — | `['couchettes']` |
| useCreateCouchetteForUserMutation | createCouchetteForUser (POST couchettes/admin) | — | `['couchettes']` |
| useDeleteCouchetteMutation | deleteCouchette (DELETE couchettes/admin/{uuid}) | — | `['couchettes']` |
| useStockItemsQuery | stockItemsService.getStockItems (GET stock-items) | `['stock','items']` | `select` : `.stockItems` |
| useStockCategoriesQuery | stockCategoriesService.getCategories (GET stock-categories) | `['stock','categories']` | `select` : `.categories` |
| useCreateStockItemMutation | createStockItem (POST) | — | `['stock','items']` |
| useUpdateStockItemMutation | updateStockItem (PUT stock-items/{id}) | — | `['stock','items']` |
| useAdjustStockQuantityMutation | updateStockItem `{quantite}` | — | optimiste sur `['stock','items']`, rollback, invalidation onSettled |
| useMoveStockItemMutation | updateStockItem `{categoryId}` | — | optimiste + `['stock','items']` |
| useDeleteStockItemMutation | deleteStockItem (DELETE) | — | `['stock','items']` |
| useCreateStockCategoryMutation | createCategory (POST) | — | `['stock','categories']` |
| useUpdateStockCategoryMutation | updateCategory (PUT) | — | `['stock','categories']` + `['stock','items']` |
| useDeleteStockCategoryMutation | deleteCategory (DELETE) | — | `['stock']` (catégories + articles) |
| useCartesQuery | cartesService.getCartes (GET cartes) | `['cartes','list']` | — |
| useCarteQuery(uuid) | getCarteById (GET cartes/{uuid}) | `['cartes','detail',uuid]` | `enabled` si dialog ouvert en édition |
| useCreateCarteMutation | createCarte (POST cartes) | — | `['cartes']` |
| useUpdateCarteMutation | updateCarte (PUT cartes/{uuid}) | — | `['cartes']` |
| useDeleteCarteMutation | deleteCarte (DELETE) | — | `['cartes']` + `removeQueries` du détail |
| useTypeCartesQuery | typeCartesService.getTypeCartes (GET type-cartes) | `['type-cartes','list']` | — |
| useTypeCarteQuery(uuid) | getTypeCarteById | `['type-cartes','detail',uuid]` | `enabled` |
| useCreateTypeCarteMutation | createTypeCarte (POST) | — | `['type-cartes']` |
| useUpdateTypeCarteMutation | updateTypeCarte (PUT) | — | `['type-cartes']` + `['cartes']` (nom du type embarqué) |
| useDeleteTypeCarteMutation | deleteTypeCarte (DELETE) | — | `['type-cartes']` + `['cartes']` |
| useTodosQuery(params) | todosService.searchTodos (POST todos/search) | `['todos','list',params]` | `select` : `.todos` |
| useTodoQuery(uuid) | getTodoByUuid (GET todos/{uuid}) | `['todos','detail',uuid]` | `enabled` |
| useTodoCategoriesQuery | getCategories (GET todo-categories) | `['todo-categories']` | `select` : `.categories` |
| useCreateTodoMutation | createTodo (POST todos) | — | `['todos']` |
| useUpdateTodoMutation | updateTodo (PUT todos/{uuid}) | — | `['todos']` |
| useMoveTodoMutation | updateTodo `{title,description,categoryUuid}` | — | optimiste sur `['todos','list']` + rollback + toast |
| useToggleTodoMutation | toggleTodo (POST todos/{uuid}/toggle) | — | `setQueryData` avec `response.todo` (verrou par uuid via les variables) |
| useDeleteTodoMutation | deleteTodo (DELETE todos/{uuid}) | — | optimiste (corbeille) + `['todos']` |
| useCreateTodoCategoryMutation | createCategory (POST todo-categories) | — | `['todo-categories']` |
| useUpdateTodoCategoryMutation | updateCategory (PUT) | — | `['todo-categories']` + `['todos']` |
| useDeleteTodoCategoryMutation | deleteCategory (DELETE) | — | `['todo-categories']` + `['todos']` |

Méthodes de service non utilisées : `getStockItemById`, `getCategoryById` (stock), `getCartesByType`, `getCartesByUser`, `todosService.getCategoryByUuid`.

## 3. Bugs suspectés (consolidé)

**Impact fonctionnel élevé**
1. `StockItems.vue:788/798` et `:909` : impossible de déclasser un article (drop sur « Non classés » ou champ catégorie vidé), car `categoryId: undefined` est omis du JSON. Toast de succès trompeur.
2. `Todos.vue:384/415` et `TodoEditModal.vue:187` : retirer la catégorie d'une tâche est impossible (confirmé par le modèle). L'UI optimiste se désynchronise ; le Select « clearable » est trompeur.
3. `TodoEditModal.vue:186`, `CarteEditModal.vue:337-339`, `TypeCarteEditModal.vue:190` : impossible d'effacer description, numéro ou date d'expiration en édition (`undefined` = inchangé).
4. `MesCouchettes.vue:316/320` : hero « Couchette du jour » et compteur « Ce mois » calculés sur la page paginée. Hors page 0 : proposition de redéclarer (400) et compteur faux.
5. `Todos.vue:492-494` (+ `:284`) : les tâches d'une catégorie supprimée (ou quand les catégories ne se chargent pas) disparaissent du board jusqu'au rechargement.
6. `Todos.vue:356-379` : suppression par corbeille sans confirmation, échec silencieux (rollback sans toast). Erreurs silencieuses aussi l.417, l.440, l.509.
7. `StockItems.vue:765` : drag & drop sans `setData`, donc KO sous Firefox. Et drag & drop HTML5 KO au tactile (stock + todos).

**Impact moyen**

8. `StockItems.vue:747` : spinner pleine page à chaque rechargement (drop, édition ou suppression de catégorie). Même chose `Cartes.vue:575/585` et `TypesCartes.vue:294/304`.
9. `Couchettes.vue:13` : une erreur de recherche remplace la page, filtres compris, sans retry. Même problème `Cartes.vue:13`, `TypesCartes.vue:13`, `Todos.vue:34`.
10. `Couchettes.vue:400-426` : tri client limité à la page courante (20 lignes).
11. `CouchetteDeleteModal.vue:88/60`, `Cartes.vue:301`, `TypesCartes.vue:176`, `Todos.vue:243` : pas d'état pending, double DELETE possible.
12. `StockItems.vue:907` : prix vidé envoyé en `''`. `:368` : quantité négative acceptée par le formulaire.
13. `Cartes.vue:498` : état révélé indexé par numéro (collision entre cartes au même numéro). `:503` : numéro ≤ 4 caractères affiché en clair.
14. `Cartes.vue:475-486` : GET /users et GET /type-cartes inutiles.
15. `CarteEditModal.vue:242-244` : erreurs des référentiels avalées (sélecteur vide sans message). `:248-256` : formulaire éditable pendant un chargement qui l'écrase ensuite.
16. `Todos.vue:187` + `:533-548` : animation de la corbeille décalée (conflit Tailwind v4 `translate` / `transform`).

**Impact faible**

17. `StockItems.vue:636-640` : UUID de rôles codés en dur ; branche lecture seule morte (l.248).
18. `StockItems.vue:719` : recherche non trimée. `:780` et `Todos.vue:352` : `dragleave` qui clignote. `:834/846` : verrou de quantité à un seul id.
19. `StockItems.vue:317/431/480/527` : dialogs sans `max-h-[90dvh] overflow-y-auto` ; l.317 et l.431 sans DialogDescription. Selects dans des Dialogs sans `teleport=false` (`StockItems.vue:395/405`, `CouchetteCreateModal.vue:23`, `CarteEditModal.vue:85/99`, `TodoEditModal.vue:48`).
20. `MesCouchettes.vue:309` : `todayKey` figé au montage. `:438` : parsing UTC de `YYYY-MM-DD`. `:34` : « Réessayer » recharge l'ancienne page.
21. `Couchettes.vue:307-331` : hint calculé sur la saisie, pas sur les filtres appliqués. `:589` : watch ignorant la suppression du query param. `:570` : page vide après suppression du dernier élément.
22. `CouchetteCreateModal.vue:170` : `response.data` sur une forme de réponse incertaine. `:174-175` : erreur affichée deux fois.
23. `Todos.vue:429` : verrou de toggle global. `:39` : ternaire mort. `:92/165` : actions invisibles au clavier. `:305` : plafond de 1000 tâches.
24. `TodoEditModal.vue:2` : la fermeture par l'overlay n'émet pas `close`. `TodoCategoriesModal.vue:158` : `close` jamais émis. `TypesCartes.vue:21-24` : bouton icône sans aria-label. `Cartes.vue:296/466` : texte « irréversible » en double.

## 4. Points d'ombre à trancher avec le propriétaire

1. **Sémantique des PUT (backend)** : absent ou null = inchangé ? Comment effacer la catégorie d'un article ou d'une tâche, et la description, le numéro ou l'expiration d'une carte ? Faut-il des drapeaux `clearX` comme `clearUser`, ou un `null` explicite accepté ? Conditionne les bugs 1 à 3.
2. **Couchettes admin** : sans dates, le backend limite-t-il à 30 jours (le hint l'affirme) ? Quels `sortBy` acceptés (pour passer au tri serveur) ? Forme réelle de la réponse de POST `couchettes/admin` (`{data}` ou DTO nu) ?
3. **Mes couchettes** : acceptez-vous une requête dédiée page 0 (ou un endpoint « aujourd'hui / mois ») pour fiabiliser le hero et « Ce mois » ?
4. **URL** : mettre les filtres (couchettes : `userUuid`, dates, page ; stock : catégorie et recherche ; todos : `terminees`) dans les search params ? La compat `?userUuid=` de `/couchettes` est-elle encore utile (aucun lien interne ne l'utilise) ?
5. **Drag & drop** : garder HTML5 natif (desktop seulement) ou adopter `@dnd-kit` (support tactile) pour le stock et le kanban ?
6. **Todos** : garder la suppression par corbeille sans confirmation ? Ajouter des toasts d'erreur ? Que fait le backend à la suppression d'une catégorie contenant des tâches ? Plafond de 1000 tâches acceptable ? L'ordre des colonnes est celui de l'API.
7. **Stock** : seuil de stock bas (5) et liste d'unités en dur, à conserver ou configurer ? Interdire les quantités négatives dans le formulaire ? Supprimer le mode lecture seule mort ? Garder la saisie « CONFIRMER » pour la suppression d'un article ?
8. **Cartes** :
   - PIN et numéro complet transmis en clair par l'API : acceptable ?
   - Règle du code : exactement 4 chiffres, ou au moins 4 caractères comme aujourd'hui ?
   - Seuil « Expire bientôt » à 30 jours.
   - Suppression d'un type utilisé par des cartes.
   - Ajouter un retour vers `/cartes` et/ou une entrée de nav pour `/types-cartes` ?
9. **Dates** : `input type="date"` natif ou DatePicker shadcn (Calendar + Popover) ?
10. **Composants CLI** : peut-on éditer `components/ui/badge.tsx` généré par la CLI pour ajouter la variante `warning` ?
11. **Architecture** : où placer les helpers purs et les schémas zod (`features/<d>/lib/`, `features/<d>/schemas/` ou à côté des composants) ? La structure imposée ne liste que `api`, `components` et `hooks`.
12. **Messages de validation** : la version Vue n'en a aucun (validation native HTML5 ou bouton désactivé). Faut-il définir des messages zod en français ? Par exemple « Le nom doit contenir au moins 2 caractères », « Le code PIN doit contenir 4 chiffres », « Sélectionnez un employé ».
13. **Toasts** : correspondance entre titre et texte de `useMessages` et sonner (le titre « Succès » / « Erreur » est-il conservé ?).
14. **Styles des catégories de tâches** : couleur hex libre utilisée en style inline. Contrôler le contraste en thème sombre ?
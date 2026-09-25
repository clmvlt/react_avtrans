# Inventaire : Entretiens / Maintenance (vue_avtrans → React)

**Contexte commun**
- **Routes** (`router/index.ts` L233-250) : `/types-entretien`, `/entretiens` et `/entretiens/vehicule/:id`. Toutes ont `requiresAuth + requiresMechanic`, ce qui veut dire Admin **ou** Mécanicien (garde L370-375). La garde ne tient pas compte de `viewAsUser`.
- **Navigation** : `/entretiens` (icône Wrench) figure dans `mainNavLinks` et dans la section « Véhicules » du full-nav. `/types-entretien` n'y est pas : on y accède seulement par un bouton de `/entretiens`.
- **Liens entrants** : `Vehicules.vue:822` et `VehiculeDetail.vue:466` → `/entretiens/vehicule/:id`.
- **UUID des rôles** (`enums/UserRole.ts`) : Admin `c10523af-…`, Mécanicien `ccbd448a-…`. Le store expose `isAdmin` / `isMechanic`, mais les 3 vues recodent les UUID en dur.
- **Backend** (lu en lecture seule pour vérifier les bugs, hors périmètre) :
  - Tous les endpoints entretiens / types / dossiers / configs sont `@RequireRole("Mécanicien")`.
  - Les dates sont des `ZonedDateTime` passant par un deserializer custom : une chaîne sans offset est interprétée en Europe/Paris.
  - L'`EntretienDTO` backend contient `files[]` avec `fileUrl` mais sans base64. `GET /entretiens/{id}/files`, lui, renvoie le `fileB64`.
  - `updateTypeEntretien` et `updateEntretien` ignorent tous les champs `null` : impossible de retirer un dossier, ni d'effacer une description ou un coût.

---

### src/views/maintenance/Entretiens.vue (2089 l.)

**Rôle / route**
- `/entretiens`, garde requiresMechanic. Aucun param ni query param lu ou écrit.
- Onglets (état local `activeTab`, défaut `prochains`) :
  - « Prochains entretiens » : badge = `vehiculesProchains.length`.
  - « Tous les entretiens » : badge = `pagination.totalElements`.
- Libellés mobiles : « Prochains » / « Tous ».
- Retour : `history.state.position > 0` ? `router.back()` : `/vehicules`.
- Header desktop (menu ⋮ sur mobile) :
  - « Types d'entretien » → `/types-entretien`
  - « Stock » → `/stock`
  - « Nouvel entretien »

**Comportement par rôle**
- `isMecanicien` (L1079) teste `=== 'c10523af…'`, c'est-à-dire l'**UUID Admin**.
- Admin : boutons du header, création, clic sur une ligne = édition, colonne Actions, Modifier/Supprimer, ajout et suppression de fichiers.
- Mécanicien : lecture seule (il peut seulement voir les fichiers). Sur mobile, le menu est remplacé par un spacer `w-8`.

**Appels API** (chargement initial en série, 5 `await`)
- `entretiensService.getEntretiensAVenir()` : GET `entretiens/vehicules-prochains-entretiens` → `{success, data: VehiculeProchainEntretienDTO[]}`.
- `vehiclesService.getVehicles()` : GET `vehicules` → `{success, vehicules}`.
- `typesEntretienService.getTypesEntretien()` : GET `types-entretien` → lu comme `(as any).typesEntretien || data`.
- `dossiersTypesEntretienService.getDossiers()` : GET `dossiers-types-entretien` → `{dossiers}`. Une erreur est avalée et donne `[]`.
- `entretiensService.searchHistory(p)` : POST `entretiens/history`.
  - Body : `{page, size:20, sortBy, sortDirection, vehiculeId?, dossierId?, typeEntretienId?, startDate?, endDate?, kmMin?, kmMax?, coutMin?, coutMax?}`.
  - Réponse : `{content, page, size, totalElements, totalPages, first, last}`.
- `getEntretienFiles(id)` : GET `entretiens/{id}/files` → `{files}` (avec base64).
- `addFile(id, {fileB64, originalName, mimeType})` : POST `entretiens/{id}/files`. Upload JSON en base64, 1 fichier via la dropzone.
- `deleteFile(fileId)` : DELETE `entretiens/files/{fileId}`.
- `createEntretien` : POST `entretiens`.
  - Body : `{vehiculeId, typeEntretienId, dateEntretien:'YYYY-MM-DDT12:00:00', kilometrage (??0), cout?, commentaire, files?[]}`.
  - Les fichiers sont embarqués en base64.
- `updateEntretien(id, {typeEntretienId, dateEntretien, kilometrage?, cout?, commentaire})` : PUT `entretiens/{id}`. Pas de fichiers en édition.
- `deleteEntretien(id)` : DELETE `entretiens/{id}`.
- Code mort : `getHistory(vehiculeId)` GET `entretiens/vehicule/{id}`.

**Données dérivées / état / watchers**
- `fleetStatusList` : construit pour **chaque véhicule** de `vehicules`, pas seulement ceux renvoyés par l'API des prochains entretiens.
  - Alertes : `KM` depuis `prochainEntretienKm` (reste = kmRestants) et `DATE` depuis `prochainEntretienDate` (reste = joursRestants).
  - Statut `DANGER` si une alerte est `enRetard`.
  - Sinon `WARNING` si une alerte KM a un reste entre 0 et 10 000 km, ou une alerte DATE un reste entre 0 et 90 j.
  - Sinon `OK`.
  - Tri : alertes en retard en premier ; véhicules DANGER > WARNING > OK.
  - Donne trois groupes : `vehiculesEnRetard`, `vehiculesAVenir`, `vehiculesOK`.
- `filteredEntretiens` : recherche client **sur la page courante** (immat, `type.nom`, « prénom nom » du mécanicien, commentaire).
- `sortedEntretiens` : tri client sur la page courante.
- `totalCoutHT` : somme des coûts de la page filtrée.
- `filteredTypesEntretien` (dépend du dossier filtré), `vehiculeOptions`, `dossierOptions`, `typeEntretienOptions` (dépend du dossier du formulaire), `selectedDossierLabel` / `selectedTypeLabel`.
- Watchers :
  - `filterValues.dossierId` → réinitialise le type s'il n'appartient plus au dossier.
  - `formData.dossierId` → vide `typeEntretienId` (voir bug B2).
  - `contextMenuRef.menuElement` → alimente `useContextMenu.menuRef`.
- Listeners globaux : `click` en capture (clic extérieur du picker), `scroll` en capture et `resize` (repositionnement du picker). La racine a aussi `@click=contextMenu.close`.
- `showAJour` : la section « À jour » est repliée par défaut.

**Formulaires et dialogs**
- **Créer / Modifier** (`sm:max-w-2xl`, titres « Nouvel entretien » / « Modifier l'entretien ») :
  - **Véhicule** : Select maison searchable, « Sélectionner un véhicule », recherche « Rechercher un véhicule... ». Désactivé en édition. Astérisque seul, aucune validation JS.
  - **Type d'entretien \*** : picker hiérarchique maison téléporté dans le body.
    - Niveau dossiers (icône Folder ambre, ChevronRight) puis types du dossier (icône Wrench).
    - Recherche « Rechercher un dossier... » / « Rechercher un type... », bouton « Retour ».
    - Vides : « Aucun dossier trouvé » / « Aucun type trouvé ».
    - Le trigger affiche « Dossier › Type », sinon « Sélectionner un type d'entretien ».
    - Aucune validation.
  - **Date \*** : `type=date` required, défaut = aujourd'hui calculé en UTC.
  - **Kilométrage \*** : number required, placeholder 150000.
  - **Coût HT (€)** : step 0.01, placeholder 0.00.
  - **Commentaire** : textarea natif, 4 lignes, « Détails sur l'entretien... ».
  - **Fichiers** (création seulement) : input natif multiple, accept `image/*,application/pdf,.doc,.docx,.xls,.xlsx`. Aperçu image ou icône FA, bouton X pour retirer.
  - Boutons : Annuler / Créer ou Modifier (« Enregistrement... » + spinner).
  - Seules validations : `required` HTML5 natif sur date et km, donc messages du navigateur.
- **Fichiers** (« Fichiers - {immat|Véhicule} ») :
  - Chargement : « Chargement des fichiers... » ; vide : « Aucun fichier attaché ».
  - Grille de FileCard (2 col., 3 en md), `deletable=isMecanicien`.
  - view-image → lightbox (galerie des images du lot) ; download → lien data-URI.
  - `view-pdf` **n'est pas géré**.
  - FileDropzone compact (1 fichier, « Ajouter un fichier » / « glissez ou cliquez ») si isMecanicien.
- **Confirmer la suppression** : description « Cette action est irréversible. », texte « Êtes-vous sûr de vouloir supprimer cet entretien ? ».
- **Supprimer le fichier** : texte « Voulez-vous vraiment supprimer ce fichier ? ». Aucune de ces confirmations n'a d'état loading.
- **« Valider l'entretien »** et **« Historique - {marque modèle (immat)} »** : **code mort**, jamais ouverts.
- **Toasts** :
  - Succès : « Entretien créé avec succès », « Entretien modifié avec succès », « Entretien supprimé avec succès », « Fichier ajoute avec succes » (sans accents), « Fichier supprimé avec succès ».
  - Erreurs : « Erreur lors du chargement des données », « Erreur lors du chargement de l'historique », « Erreur lors de l'enregistrement de l'entretien », « Erreur lors de la suppression de l'entretien », « Erreur lors de l'ajout du fichier », « Erreur lors de la suppression du fichier ».

**Tables / listes**
- **Onglet Prochains** : 3 sections de cartes (1, 2 puis 3 colonnes).
  - **En retard** :
    - En-tête : pastille rouge AlertCircle, Badge destructive.
    - Carte : icône AlertTriangle rouge ; chaque alerte « En retard de **X km** / **N jours** » en rouge (`Math.abs`).
    - Boutons : « Voir véhicule » → `/vehicules/:id` ; « Entretiens » (destructive) → `/entretiens/vehicule/:id`.
  - **À venir** :
    - En-tête et carte : icône Clock ambre.
    - Alertes : « Dans X km/jours ».
    - Bouton « Entretiens » : outline ambre.
  - **À jour** :
    - En-tête : CheckCircle vert, repliable par ChevronDown.
    - Carte : « Aucun entretien à prévoir » s'il n'y a pas d'alerte.
    - Bouton : vert.
  - Icône Route pour KM, CalendarDays pour DATE ; km en `toLocaleString('fr-FR')`.
  - Skeleton de 6 cartes.
  - Vides : « Aucun véhicule trouvé » (si l'API des prochains est vide) et « Aucun véhicule avec des entretiens configurés » (quasi inatteignable).
- **Onglet Tous** :
  - **Recherche rapide** : placeholder « Recherche rapide par immatriculation, type, mécanicien, commentaire... ». Entrée relance le serveur en page 0, sans envoyer le texte.
  - **SearchFilters** (4 colonnes, hint « N entretien(s) trouvé(s) ») :
    - Véhicule : « Tous les véhicules », libellé « marque modèle (immat) ».
    - Dossier : « Tous les dossiers ».
    - Type d'entretien : « Tous les types », dépend du dossier.
    - Trier par : Date d'entretien / Kilométrage / Coût HT.
    - Ordre : Décroissant / Croissant.
    - Date de début / de fin.
    - Kilométrage min / max : « Ex: 50000 » / « Ex: 100000 ».
    - Coût HT minimum / maximum (€) : « 0.00 » / « 500.00 ».
    - Le reset efface aussi la recherche rapide.
  - **Table desktop (md et plus)** :

    | Colonne | Contenu | Tri |
    |---|---|---|
    | Date | « 12 mars 2025 » | oui |
    | Véhicule | immat | oui |
    | Type | Badge secondary | oui |
    | Km | aligné à droite, mono | oui |
    | Commentaire | tronqué à 200px + title, sinon « - » | non |
    | Mécanicien | icône User + « Prénom N. » | oui |
    | Coût HT | « x € HT », sinon « - » | oui |
    | Fichiers | FolderOpen + nombre, sinon « - » | non |
    | Actions (Admin) | Pencil / Trash2 | non |

    - Tri client à 3 états (asc → desc → aucun), icônes ArrowUp / ArrowDown / ArrowUpDown.
    - Clic sur la ligne = édition (Admin).
    - Clic droit : ContextMenuPopover titré par l'immat, avec « Voir fichiers (n) » si fichiers, puis Modifier / Supprimer (Admin).
  - **Cartes mobiles** :
    - Immat en majuscules + Badge type, date.
    - Menu ⋮ : Voir fichiers (n) / Modifier / Supprimer.
    - Km, coût, mécanicien complet ; commentaire `line-clamp-2` ; bouton « n fichier(s) ».
    - Compteur « N entretien(s) ».
  - Bandeau « Total coût HT : x,xx € » (affiché si > 0).
  - **Pagination serveur** (20 par page) : ⏮ ◀ « Page X sur Y (N entretiens) » ▶ ⏭, affichée si plus d'une page.
  - `files` est lu via `(item as any).files`.

**Composants ui → shadcn React**
- Tabs → `tabs` ; Button (tailles `icon-sm`, `sm`) → `button` ; Badge → `badge` ; Input → `input` ; textarea natif → `textarea`.
- Table → `table` + @tanstack/react-table ; Dialog → `dialog` (les confirmations → `alert-dialog`) ; DropdownMenu → `dropdown-menu` ; Skeleton → `skeleton`.
- Select maison searchable → Combobox (`popover` + `command`) dans `components/shared`.
- Picker hiérarchique → `popover` + `command`, sur deux niveaux ou avec CommandGroup par dossier.
- ContextMenuPopover / Item / Separator + `useContextMenu` → `context-menu` shadcn ; le composable disparaît.
- Composants maison à migrer vers `components/shared` : SearchFilters, FileCard (+ PdfPreview), FileDropzone, ImageLightbox.
- `useMessages` → `sonner`.

**Icônes FontAwesome → lucide** (`font-awesome-icon` L774, via `getFileIcon` L1897)

| FontAwesome | lucide |
|---|---|
| `file` | File |
| `file-image` | FileImage |
| `file-pdf` | FileText |
| `file-word` | FileText (ou FileType) |
| `file-excel` | FileSpreadsheet |

- Icônes lucide déjà utilisées, avec leur nom lucide-react actuel :
  - Inchangées : ArrowLeft, Settings, Package, Plus, Car, Route, CalendarDays, Clock, ChevronDown/Left/Right, ChevronsLeft/Right, Truck, List, Search, ClipboardList, FolderOpen, Folder, Pencil, Trash2, Euro, User, Wrench, X, LoaderCircle, ArrowUp, ArrowDown, ArrowUpDown.
  - À renommer : MoreVertical → EllipsisVertical, AlertCircle → CircleAlert, AlertTriangle → TriangleAlert, CheckCircle → CircleCheck.
  - Ruler n'apparaît que dans le code mort.

**Styles notables, responsive**
- Conteneur `max-w-[1400px]`, bloc bordé et arrondi.
- Header en « onglets-dossier » :
  - Fond `bg-muted`, TabsTrigger en `rounded-t` avec classes `data-[state]`.
  - Variante dark : `border-primary/40 bg-primary/10`.
  - Bouton retour en position absolue à gauche, actions en absolu à droite.
- Header mobile distinct ; sous `md`, le tableau est remplacé par des cartes.
- Codes couleur rouge / ambre / vert avec variantes dark.

**Bugs suspectés** : B1-B20 (voir la liste consolidée).

---

### src/views/maintenance/EntretiensVehicule.vue (1693 l.)

**Rôle / route**
- `/entretiens/vehicule/:id`. Lit `route.params.id`, sans watch. Aucun query param.
- Onglets : « Entretiens » (défaut) et « Configurations » / « Config » en mobile. Le badge compte les configurations, y compris les inactives.
- Header :
  - Retour : toujours `/entretiens`.
  - « marque modèle » + Badge Gauge « X km » (`latestKm || 0`).
  - « Voir le véhicule » → `/vehicules/:id`.
  - « Nouvel entretien ».
  - Menu ⋮ sur mobile.

**Comportement par rôle**
- `isMecanicien` (L853) = Admin **ou** Mécanicien, donc toujours vrai derrière la garde.
- Aucune différence effective : les deux rôles ont l'onglet Configurations, « Valider », l'édition, la suppression et les fichiers.

**Appels API**
- `vehiclesService.getVehicleById(id)` : GET `vehicules/{id}` → `{vehicule}`.
- `entretiensService.getVehicleUpcomingMaintenance(id)` : GET `entretiens/vehicule/{id}/prochains-entretiens` → `{data}`. Une erreur donne `null`.
- `getTypesEntretien`, `getDossiers` : idem Entretiens.
- `searchHistory({…, vehiculeId})` : POST `entretiens/history`.
- `getEntretienFiles` : appelé pour la modale fichiers et pour les fichiers existants en édition.
- `addFile` :
  - Depuis la dropzone de la modale fichiers.
  - En boucle séquentielle après un update pour les nouveaux fichiers.
- `deleteFile` : avec confirmation dans la modale fichiers ; **sans confirmation** en édition.
- `createEntretien` :
  - Date envoyée = `new Date(d).toISOString().replace('Z','+01:00')`, fichiers embarqués.
  - « Valider » (création rapide) envoie `{typeEntretienId, dateEntretien: aujourd'hui (UTC) + 'T12:00:00', kilometrage: latestKm||0, commentaire:''}`.
- `updateEntretien`, `deleteEntretien`.
- `vehiculesTypesEntretienService` :
  - `getByVehiculeId(id)` : GET `vehicules-types-entretien/vehicule/{id}` → `(as any).vehiculeTypesEntretien || data`.
  - `delete(id)` : DELETE `vehicules-types-entretien/{id}`.
- Après chaque mutation : `loadData()` recharge tout (véhicule, prochains, types, dossiers, historique). Après une modification de configuration : `loadConfigurations()` puis `loadData()`.

**Données dérivées / état / watchers**
- `sortedEntretiens` (tri client), `totalCoutHT` (page courante), `filteredTypesEntretien`.
- `typeEntretienOptions` : **liste plate** de tous les types.
- `typesEntretienDisponibles` : types pas encore configurés pour ce véhicule.
- Watcher `filterValues.dossierId` : idem Entretiens.
- Flags de chargement : `loading`, `loadingEntretiens`, `loadingConfigurations`, `loadingFiles`, `loadingEditModeFiles`.
- État de la visionneuse PDF : `showPdfViewer`, `currentPdfFile`, `currentPdfUrl` (data-URI).

**Formulaires et dialogs**
- **Entretien** (`sm:max-w-lg`, descriptions « Renseignez les informations du nouvel entretien. » / « Modifiez les informations de l'entretien. ») :
  - **Type d'entretien** : Select plat searchable, « Sélectionner un type », « Rechercher un type... ». `required` visuel seulement.
  - **Date \*** : required.
  - **Kilométrage \*** : `<input>` natif `v-model.number`, required.
  - **Coût HT (€)** : natif, step 0.01.
  - **Commentaire** : Textarea shadcn.
  - **Fichiers en édition** :
    - « Fichiers existants : » : icône FA, nom, taille (o / Ko / Mo), bouton Trash2 qui supprime immédiatement.
    - Sinon « Aucun fichier attaché » ou « Chargement des fichiers... ».
  - **Ajout de fichiers** : libellé « Ajouter des fichiers : » en édition. Input natif multiple, vignettes de 100px avec bouton X rond.
- **Fichiers** (`sm:max-w-2xl`, « Fichiers - {type} », « Fichiers attachés à cet entretien. ») :
  - FileCard : view-image → lightbox ; view-pdf → visionneuse interne (iframe, « Télécharger », X) ; download.
  - Dropzone ; pied de dialog « Fermer ».
- **Confirmations** (sans état loading) :
  - « Êtes-vous sûr de vouloir supprimer cet entretien ? »
  - « Êtes-vous sûr de vouloir supprimer ce fichier ? »
  - « Supprimer la configuration » : « Êtes-vous sûr de vouloir supprimer cette configuration d'entretien ? »
  - « Valider l'entretien » : « Confirmation de la validation de l'entretien. » / « Voulez-vous créer un entretien "{nom}" pour ce véhicule avec la date et le kilométrage actuels ? »
- **ConfigEntretienModal** (voir ce fichier).
- **Toasts** : ceux d'Entretiens, plus :
  - « Erreur lors du chargement des entretiens »
  - « Fichier supprimé » (édition)
  - « Informations véhicule ou type d'entretien manquantes »
  - « Configuration supprimée avec succès »
  - « Erreur lors de la suppression de la configuration »

**Tables / listes**
- **Bandeaux d'alerte** (km et date) :
  - Bordure et fond rouges si `enRetard`, **verts sinon** : il n'y a pas de palier « à venir ».
  - KM : « {type} à {prochainKilometrage} km ({kmRestants} km restants) », en rouge si négatif.
  - DATE : « {type} prévu le {date longue} ({joursRestants} jours) ».
  - Badge « EN RETARD » ; bouton vert « Valider » (CheckCircle).
- **Historique** : identique à Entretiens, mais sans colonne ni filtre Véhicule, sans recherche rapide et sans menu contextuel.
- **Configurations** : grille de cartes.
  - Contenu : nom du type ; Badge « Inactif » et `opacity-60` si la configuration est inactive ; icône CalendarDays (TEMPOREL) ou Route (KILOMETRAGE) ; Pencil / Trash2.
  - `formatPeriodicite` :
    - TEMPOREL ≥ 365 j : « N an(s) [et M jour(s)] » ;
    - TEMPOREL ≥ 30 j : « ⌊j/30⌋ mois » ;
    - sinon « N jour(s) » ;
    - KILOMETRAGE : « 30 000 km ».
  - Bouton « Ajouter » désactivé s'il ne reste aucun type disponible.
  - Vide : « Aucune configuration d'entretien définie » ; chargement « Chargement... ».

**Composants ui → shadcn React**
- Les mêmes qu'Entretiens.
- Textarea → `textarea`.
- Visionneuse PDF maison → `dialog` plein écran (`components/shared/PdfViewerDialog`).

**Icônes FontAwesome → lucide** (L564 et L600, via `getFileIcon` L1472-1484)

| FontAwesome | lucide |
|---|---|
| `file` | File |
| `file-image` | FileImage |
| `file-pdf` | FileText |
| `file-word` | FileText |
| `file-excel` | FileSpreadsheet |
| `file-powerpoint` | Presentation |
| `file-video` | FileVideo (FileVideoCamera selon la version de lucide) |
| `file-audio` | FileAudio (FileMusic selon la version) |
| `file-archive` | FileArchive |
| `file-alt` | FileText |

- lucide déjà utilisés : ArrowLeft, ArrowUp/Down/UpDown, Plus, Pencil, Trash2, LoaderCircle, AlertCircle, CheckCircle, Route, CalendarDays, Settings, Truck, Gauge, Chevrons*, ClipboardList, FolderOpen, User, X, Download, MoreVertical, Euro.

**Styles**
- Même header en onglets-dossier : le bloc véhicule s'ajoute à côté du bouton retour.
- Padding `p-4 md:p-6` ; bandeaux d'alerte en `md:flex-row`.

**Bugs suspectés** : B5, B7, B9, B10, B13, B17-B32.

---

### src/views/maintenance/TypesEntretien.vue (894 l.)

**Rôle / route**
- `/types-entretien`. Pas de params, pas d'onglets.
- Filtrage par dossier : état local `selectedFolderId` (`null` = Tous, un id de dossier, ou `'unclassified'`).
- Retour : history back, sinon `/entretiens`.

**Comportement par rôle**
- `isMecanicien` = Admin **ou** Mécanicien, donc toujours vrai.
- Tout le monde peut créer, modifier, supprimer et déplacer.

**Appels API**
- `getDossiers()` : GET `dossiers-types-entretien`. Une erreur n'est visible qu'en console.
- `getTypesEntretien()` : GET `types-entretien` → `typesEntretien || data`.
- `createType({nom, description?, dossierId?})` : POST `types-entretien` → `typeEntretien || data`.
- `updateType(id, …)` : PUT `types-entretien/{id}`. Utilisé par le formulaire d'édition et par le drag & drop (`{dossierId}`, ou `{}` pour « Non classés »).
- `deleteType(id)` : DELETE `types-entretien/{id}`.
- `createDossier` / `updateDossier({nom, description})` : POST / PUT `dossiers-types-entretien[/{id}]` → `{dossier}`.
- `deleteDossier(id)` : DELETE `dossiers-types-entretien/{id}`.
- Après une mutation, seul le state local est mis à jour (pas de rechargement).

**Données dérivées / état**
- `unclassifiedTypes`, `folderOptionsForForm`.
- `filteredTypes` : filtre par dossier, puis recherche sur nom et description.
- `getTypeCountForFolder`.
- Drag & drop : `draggedType`, `dragOverFolderId`.
- Chargements séquentiels : dossiers, puis types. `loading` et `error` ne couvrent que les types.

**Formulaires et dialogs**
- **Type** (`sm:max-w-lg`, « Nouveau type d'entretien » / « Modifier le type d'entretien ») :
  - Nom \* : Input required, « Changement freins avant ».
  - Description : textarea natif 3 lignes, « Remplacement des plaquettes et disques de frein avant ».
  - Dossier : Select searchable clearable, « Aucun dossier ».
  - À la création, le dossier est pré-rempli avec le dossier sélectionné (sauf « Non classés »).
  - Une erreur API s'affiche en bandeau dans le dialog : `err.message`, sinon « Erreur lors de l'enregistrement ».
  - Boutons « Enregistrer » / « Enregistrement... ».
- **Dossier** (`sm:max-w-md`, « Nouveau dossier » / « Modifier le dossier ») :
  - Nom \* : « Freinage ».
  - Description : textarea 2 lignes, « Tous les entretiens liés au système de freinage ».
- **Suppression d'un type** : « Supprimer le type d'entretien » / « Êtes-vous sûr de vouloir supprimer le type **{nom}** ? », bouton « Suppression... » pendant l'appel.
- **Suppression d'un dossier** : « … le dossier **{nom}** ? » + « Les types d'entretien de ce dossier seront déplacés vers "Non classés". » Si le dossier supprimé était sélectionné, retour à « Tous ».
- **Toasts** (avec titre « Succès » / « Erreur ») :
  - `Type déplacé vers "{dossier|Non classés}"`
  - « Type créé / modifié / supprimé avec succès ! »
  - « Dossier créé / modifié / supprimé avec succès ! »
  - « Erreur lors du déplacement », « Erreur lors de la suppression »

**Listes**
- **Sidebar** (280px en md, sticky, `h-screen`, bordure droite ; sur mobile, bande horizontale en `flex-wrap`) :
  - Titre « DOSSIERS » + bouton + « Créer un dossier ».
  - « Tous » : icône List, compteur global.
  - Dossiers :
    - Icône Folder ambre + compteur.
    - Sélection et survol en drag : `bg-primary`.
    - Actions Pencil / Trash2 au survol en desktop (le compteur disparaît) ; menu ⋮ sur mobile.
  - « Non classés » : icône FolderOpen, zone de dépôt.
- **Zone principale** :
  - Recherche « Rechercher par nom ou description... ».
  - Icône Info avec infobulle CSS « Glissez-déposez les types vers un dossier ».
  - Bouton « Ajouter un type ».
- **Cartes de type** :
  - Poignée GripVertical (desktop), carré Wrench en `bg-primary`, nom.
  - Badge outline du dossier, uniquement en vue « Tous ».
  - Description tronquée à 100 caractères, « Créé le {date longue} ».
  - Actions : Pencil / Trash2 en desktop, menu ⋮ en mobile.
  - La carte entière est draggable (HTML5 natif).
- **Vides** : `Aucun type trouvé pour "{q}"`, « Aucun type non classé », « Ce dossier est vide », « Aucun type d'entretien ».
- **Chargement** plein écran « Chargement... » ; **erreur** en bandeau destructive.

**Composants ui → shadcn React**
- button, input, badge, dialog (+ `alert-dialog` pour les confirmations), dropdown-menu.
- textarea natif → `textarea`.
- Select → Combobox shared (ou `select` + option « Aucun dossier »).
- Infobulle CSS → `tooltip`.
- Sidebar → `scroll-area`.
- Drag & drop : à trancher entre @dnd-kit et HTML5 natif.

**Icônes** : aucune FontAwesome. lucide : ArrowLeft, Plus, Search, LoaderCircle, Pencil, Trash2, Folder, FolderOpen, List, GripVertical, Info, Wrench, MoreVertical.

**Styles** : `max-w-[1600px]`, grille `md:grid-cols-[280px_1fr]`, pas d'en-tête de page.

**Bugs suspectés** : B33-B38.

---

### src/components/maintenance/ConfigEntretienModal.vue (220 l.)

**Rôle**
- Props : `modelValue`, `vehiculeId`, `typesEntretien`, `configurationsExistantes`, `configToEdit?`.
- Emits : `update:modelValue`, `saved`.
- Utilisé uniquement par EntretiensVehicule, où Admin et Mécanicien sont identiques.

**Appels API**
- `vehiculesTypesEntretienService.create({vehiculeId, typeEntretienId, periodiciteType, periodiciteValeur})` : POST `vehicules-types-entretien`.
- `.update(id, {periodiciteType, periodiciteValeur, actif})` : PUT `vehicules-types-entretien/{id}`.

**État**
- `formData` est réinitialisé par un watcher sur `modelValue` à l'ouverture : depuis `configToEdit`, sinon défauts (KILOMETRAGE, valeur `undefined`, actif `true`).
- `typesEntretienOptions` = types pas encore configurés.
- `localOpen` : computed get/set.

**Formulaire** (DialogContent `max-h-[90dvh] overflow-y-auto sm:max-w-md`)
- Titres « Nouvelle configuration » / « Modifier la configuration ».
- Descriptions : « Ajouter une nouvelle configuration d'entretien pour ce véhicule » / « Modifier les paramètres de cette configuration d'entretien ».
- Champs :
  - **Type d'entretien \*** : en création, Select searchable « Rechercher un type... » ; en édition, bloc muted en lecture seule.
  - **Type de périodicité \*** : « Kilométrage (km) » / « Temporel (jours) », non searchable.
  - **Valeur \*** : unité affichée « (jours) » ou « (km) », placeholder 365 / 30000, `min=1`, required.
  - **« Configuration active »** (édition seulement) : Checkbox en carte, « Activer le suivi de cet entretien ».
- Validations JS (messages exacts) :
  - « Veuillez sélectionner un type d'entretien » : création sans type.
  - « Veuillez saisir une valeur de périodicité valide » : valeur absente ou ≤ 0.
- Toasts : « Configuration ajoutée avec succès », « Configuration modifiée avec succès », « Erreur lors de l'enregistrement de la configuration ».
- Boutons : Annuler / Ajouter ou Modifier (spinner).

**Composants et icônes**
- shadcn : dialog, button, input, checkbox, select (non searchable), Combobox (searchable), form.
- Icône : LoaderCircle.

**Bugs** : B39-B41.

**Cible** : `ConfigEntretienDialog.tsx` + zod. Initialisation par `defaultValues` et une `key={config?.id ?? 'new'}` sur le dialog, pas de useEffect.

---

### src/services/entretiens.ts (243 l.)
- Singleton `entretiensService`. Méthodes :
  - `getEntretiensAVenir` : GET `entretiens/vehicules-prochains-entretiens`.
  - `getVehicleUpcomingMaintenance` : GET `entretiens/vehicule/{id}/prochains-entretiens`.
  - `createEntretien` : POST `entretiens` → `{entretien}`.
  - `getEntretienById` : GET `entretiens/{id}` (inutilisé).
  - `updateEntretien` : PUT `entretiens/{id}`.
  - `deleteEntretien` : DELETE `entretiens/{id}`.
  - `getHistory` : GET `entretiens/vehicule/{id}` (utilisé seulement dans du code mort).
  - `searchHistory` : POST `entretiens/history` → PagedResponse.
  - `getEntretienFiles` : GET `entretiens/{id}/files`.
  - `addFile` : POST `entretiens/{id}/files`.
  - `deleteFile` : DELETE `entretiens/files/{fileId}`.
- Types exportés : réponses (`EntretienResponse`, `EntretienFilesResponse`…), `EntretienFileUploadRequest`, `EntretienCreateRequest`, `EntretienUpdateRequest`, `EntretienSearchParams` (**sans `dossierId`**), et `EntretienFileDTO` (**doublon** du modèle, avec `id` et `createdAt` requis).

### src/services/typesEntretien.ts (77 l.)
- `getTypesEntretien` : GET `types-entretien` → `ApiResponse` (`typesEntretien | data`).
- `getTypeById` : inutilisé.
- `createType` : POST ; `updateType` : PUT `/{id}` ; `deleteType` : DELETE.
- Requests redéfinies : doublons de `models/TypeEntretienDTO`.

### src/services/dossiersTypesEntretien.ts (63 l.)
- `getDossiers` : GET → `{dossiers}`.
- `getDossierById` : inutilisé.
- `createDossier` / `updateDossier` → `{dossier}`.
- `deleteDossier` : DELETE → typé `DossierTypeEntretienResponse`.

### src/services/vehiculesTypesEntretien.ts (93 l.)
- `create` : POST ; `getById` : inutilisé ; `update` : PUT ; `delete` : DELETE.
- `getByVehiculeId` : GET `vehicule/{id}` → `vehiculeTypesEntretien | data`.
- `getActiveByVehiculeId` : GET `…/actives`, inutilisé.
- Exporte `type PeriodiciteType = 'KILOMETRAGE'|'TEMPOREL'`, un **doublon** de l'enum. ConfigEntretienModal importe cette union-là.

### src/services/vehicles.ts (méthodes utilisées)
- `getVehicles()` : GET `vehicules` → `{success, vehicules}`.
- `getVehicleById(id)` : GET `vehicules/{id}` → `{success, message?, vehicule}`.
- À partager avec la feature vehicles (clés `vehiclesKeys`).

### models/EntretienDTO.ts (179 l.)
- `EntretienDTO` : `{id?, vehiculeId?, vehiculeImmat?, typeEntretien?, mecanicien?: UserDTO, dateEntretien?, kilometrage?, commentaire?, cout?, createdAt?}`. **Il manque `files`.**
- Requests Create / Update.
- `EntretienPictureDTO` (legacy).
- `EntretienFileDTO` : **il manque `fileUrl`**.
- `EntretienHistoryRequest` : sans `dossierId`.
- `ProchainEntretienDTO` : `{vehicule?, typeEntretien?, dernierEntretien?, prochainKilometrage?, prochaineDateTemporelle?, kmRestants?, joursRestants?, enRetard?, message?}`.
- `VehiculeProchainEntretienDTO` : `{vehicule?, prochainEntretienKm?, prochainEntretienDate?}`.

### models/TypeEntretienDTO.ts (41 l.)
- `{id?, nom?, description?, dossier?: DossierTypeEntretienDTO, createdAt?}` + requests.

### models/DossierTypeEntretienDTO.ts (50 l.)
- DTO `{id?, nom?, description?, createdAt?}`.
- Create / Update requests.
- `DossierTypeEntretienResponse {dossier}`, `DossiersTypeEntretienResponse {dossiers}`.

### models/VehiculeTypeEntretienDTO.ts (50 l.)
- `{id?, vehiculeId?, vehiculeImmat?, typeEntretien?, periodiciteType?, periodiciteValeur? (km ou jours), actif?, createdAt?}` + requests.

### enums/PeriodiciteType.ts (14 l.)
- Enum `KILOMETRAGE` | `TEMPOREL` + `PeriodiciteTypeLabels` (« Kilométrage » / « Temporel »).
- Ces libellés ne sont pas utilisés : le modal a les siens.

### Composants maison (pour info), tous vers `components/shared`
- **SearchFilters** :
  - Props : `modelValue`, `filters: FilterConfig[]` (select / date / text / number / checkbox), `loading`, `columns`, `defaultExpanded`, `hint`, slot `count`.
  - Emits : `update:modelValue`, `search`, `reset`.
  - Boutons « Afficher / Masquer les filtres », « Rechercher » / « Recherche... », « Réinitialiser ».
  - Un select devient searchable au-delà de 5 options ; tous sont clearable.
  - Grille réduite à 2 colonnes sous `lg` et 1 sous `sm`.
- **FileCard** :
  - Props : `file: FileData`, `deletable`, `showInfo`.
  - Emits : `view-image(url)`, `view-pdf(file)`, `download(file)`, `delete(id)`.
  - Aperçus : image, PdfPreview, Word (violet), Excel (vert), générique.
- **FileDropzone** :
  - Props : `accept`, `multiple`, `compact`, `uploading` / `progress` (jamais passés ici), `maxFileSize` (jamais utilisé).
  - Emits : `files-selected(FileList)`, `error`.
- **ImageLightbox** :
  - Galerie ; zoom 0.5 à 5 (boutons et molette) ; swipe ; clavier en capture (←, →, Échap) ; téléchargement.
- **ContextMenuPopover** + `useContextMenu` :
  - Position recalée dans le viewport, Échap, clic extérieur.
  - Remplacés par le `context-menu` shadcn.
- **Select maison** :
  - Label + astérisque (sans validation), searchable par défaut, clearable (« Effacer la sélection »), `teleport`.
  - Clavier complet ; vide « Aucun résultat ».

---

## Cible React proposée (feature unique `maintenance`)

```
src/pages/maintenance/
  EntretiensPage.tsx            (~120 l.) onglets (?tab=prochains|historique), header, <FleetDashboard/>, <EntretiensHistory showVehicle quickSearch/>
  EntretiensVehiculePage.tsx    (~140 l.) useParams id, <VehiculeEntretiensHeader/>, onglet entretiens (<VehicleUpcomingAlerts/> + <EntretiensHistory vehiculeId/>), onglet config (<VehiculeConfigsPanel/>)
  TypesEntretienPage.tsx        (~110 l.) grille sidebar/main, dialogs types/dossiers
src/features/maintenance/
  api/
    queryKeys.ts                        maintenanceKeys (voir liste 2)
    useFleetUpcomingQuery.ts  useVehicleUpcomingQuery.ts  useEntretiensHistoryQuery.ts  useEntretienFilesQuery.ts
    useTypesEntretienQuery.ts  useDossiersQuery.ts  useVehiculeConfigsQuery.ts
    entretiens.mutations.ts  entretienFiles.mutations.ts  typesEntretien.mutations.ts  dossiers.mutations.ts  vehiculeConfigs.mutations.ts
  lib/
    fleetStatus.ts             computeFleetStatus(vehicules, prochains) + FLEET_THRESHOLDS {km:10000, days:90} (fonction pure, pas de useEffect)
    entretienDates.ts          todayLocalISO() (date locale, pas UTC), toApiDateTime(d)=`${d}T12:00:00`, toDateInputValue()
    formatPeriodicite.ts
    buildHistorySearchParams.ts (filtres → EntretienSearchParams, Number() sur km/coût)
  schemas/
    entretienForm.schema.ts  configEntretien.schema.ts  typeEntretien.schema.ts  dossier.schema.ts
  hooks/
    useCanManageMaintenance.ts  (isAdmin || isMechanic, à trancher)
    useEntretiensHistory.ts     (brouillon/appliqué des filtres, page, sorting, recherche rapide, total, dépendance dossier→type gérée dans onChange ; branché sur useEntretiensHistoryQuery + keepPreviousData)
    useHistoryFilterConfig.ts   (construit FilterConfig[] ; option withVehicle)
    useEntretienDialogs.ts      (état unique {kind:'form'|'files'|'delete'|'validate', entretien?})
    useFleetStatus.ts           (useFleetUpcomingQuery + useVehiclesQuery + computeFleetStatus)
    useTypesExplorer.ts         (dossier sélectionné [?dossier=], recherche, filteredTypes, compteurs)
    useTypeDragAndDrop.ts       (draggedType, overTarget, onDrop → useMoveTypeEntretienMutation optimiste)
  components/
    history/  EntretiensHistory.tsx · EntretiensHistoryToolbar.tsx · entretienColumns.tsx (factory ColumnDef, options showVehicle/canManage) · EntretiensDataTable.tsx (+ ContextMenu par ligne) · EntretienMobileCard.tsx · EntretienActionsMenu.tsx (+ useEntretienActions : mêmes items pour DropdownMenu et ContextMenu) · EntretiensTotalCost.tsx · EntretiensHistorySkeleton.tsx
    form/     EntretienFormDialog.tsx (création/édition, vehiculeId verrouillé si fourni) · TypeEntretienPicker.tsx (Popover+Command hiérarchique) · EntretienFilesField.tsx (fichiers en attente + existants avec confirmation)
    files/    EntretienFilesDialog.tsx (FileCard grid, dropzone, confirmation, lightbox, PdfViewerDialog)
    fleet/    FleetDashboard.tsx · FleetStatusSection.tsx (variant late|upcoming|ok, Collapsible pour ok) · FleetVehicleCard.tsx · FleetAlertLine.tsx (utilise alert.isLate) · FleetDashboardSkeleton.tsx
    vehicule/ VehiculeEntretiensHeader.tsx · VehicleUpcomingAlerts.tsx · UpcomingAlertCard.tsx (km|date, palier de couleur) · ValidateEntretienDialog.tsx
    config/   VehiculeConfigsPanel.tsx · VehiculeConfigCard.tsx · ConfigEntretienDialog.tsx
    types/    DossiersSidebar.tsx · DossierNavItem.tsx (zone de dépôt) · TypesToolbar.tsx · TypesEntretienList.tsx · TypeEntretienCard.tsx · TypeEntretienFormDialog.tsx · DossierFormDialog.tsx
src/components/shared/
  SearchFilters.tsx · Combobox.tsx · FileCard.tsx · FileDropzone.tsx · ImageLightbox.tsx · PdfPreview.tsx · PdfViewerDialog.tsx · ConfirmDialog.tsx (AlertDialog, prop pending) · DataTableColumnHeader.tsx (tri 3 états) · DataTablePagination.tsx (⏮◀ Page X sur Y ▶⏭) · TabbedPageHeader.tsx (header onglets-dossier desktop/mobile) · PendingFilesList.tsx · fileIcons.ts (mime → icône lucide)
src/hooks/
  useFilesAsBase64.ts (Promise.all des FileReader, attendue avant submit) · useGoBack.ts (window.history.state.idx > 0 ? navigate(-1) : fallback ; React Router utilise `idx`, pas `position`)
src/router/ : 3 routes derrière requireMechanic, avec loaders qui préchargent les requêtes (queryClient.ensureQueryData : types, dossiers, véhicule(s))
```

**Découpage d'Entretiens.vue**
- La page ne garde que les onglets et le `TabbedPageHeader` avec ses actions : Types / Stock / Nouvel entretien.
- **Dashboard** : `FleetDashboard` → `FleetStatusSection` ×3 → `FleetVehicleCard` → `FleetAlertLine`. Le calcul de statut devient la fonction pure `computeFleetStatus`.
- **Historique** : le composant partagé `EntretiensHistory` en mode `showVehicle` + `quickSearch`.
- **Dialogs** : `EntretienFormDialog`, `EntretienFilesDialog`, `ConfirmDialog`, pilotés par `useEntretienDialogs`.
- **Supprimé** : les modales Historique et Valider (code mort), le picker téléporté (remplacé par `TypeEntretienPicker`), `useContextMenu`.

**Découpage d'EntretiensVehicule.vue**
- La page contient `VehiculeEntretiensHeader`, qui utilise `TabbedPageHeader`.
- **Onglet Entretiens** : `VehicleUpcomingAlerts` (2 `UpcomingAlertCard` + `ValidateEntretienDialog`, lequel réutilise `useCreateEntretienMutation`), puis `EntretiensHistory vehiculeId`.
- **Onglet Config** : `VehiculeConfigsPanel`, qui contient les cartes, `ConfigEntretienDialog` et un `ConfirmDialog`.

**Découpage de TypesEntretien.vue**
- `DossiersSidebar` + `TypesToolbar` + `TypesEntretienList` / `TypeEntretienCard`.
- 2 dialogs de formulaire et 2 `ConfirmDialog`.
- Logique dans `useTypesExplorer` et `useTypeDragAndDrop` ; le déplacement est une mutation optimiste avec rollback.

**Ce qu'Entretiens et EntretiensVehicule ont en commun, et comment le mutualiser**
- **Section historique**, quasi identique : même config de filtres (moins « Véhicule »), mêmes skeletons, même vide, cartes mobiles, total, table, tri, pagination.
  - → `EntretiensHistory` + `useEntretiensHistory({vehiculeId?})` + `entretienColumns({showVehicle})`.
- **Formulaire d'entretien** : un seul `EntretienFormDialog`.
  - `vehiculeId` en prop : si fourni, le véhicule est verrouillé et le champ Combobox masqué.
  - Le picker de type est le **même partout**.
  - Les fichiers se comportent partout comme dans EV : fichiers en attente à la création ; fichiers existants + ajouts en édition, avec confirmation de suppression.
- **Fichiers** : même modale (`EntretienFilesDialog`), avec PDF désormais géré partout ; `downloadFile`, lightbox et `getFileIcon` passent dans `shared`.
- **Confirmations** : `ConfirmDialog` unique.
- **Mutations** : création, modification, suppression et validation sont les mêmes hooks.
- **Utilitaires** : `formatDate`, `formatFileSize` (utiliser `utils/fileUtils`) et la conversion base64 (`useFilesAsBase64`).
- **Actions par ligne** : un seul `useEntretienActions` (Voir fichiers / Modifier / Supprimer), rendu dans le DropdownMenu mobile et dans le ContextMenu desktop.

---

## 1. Composants shadcn nécessaires
- button, badge, tabs, table, dialog, alert-dialog
- dropdown-menu, context-menu
- input, textarea, label, form, select, popover, command, checkbox
- skeleton, sonner, tooltip, collapsible (section « À jour », panneau de filtres), scroll-area (sidebar des dossiers), separator
- Optionnels : sheet (dossiers sur mobile), card.
- Dépendances externes : @tanstack/react-table ; @dnd-kit/core si le drag & drop tactile est retenu.

## 2. Hooks TanStack Query et mutations

**Clés** : `maintenanceKeys` = `['maintenance', …]`

| Hook | Service.méthode | Query key | Remarques |
|---|---|---|---|
| useFleetUpcomingQuery | entretiensService.getEntretiensAVenir | ['maintenance','upcoming','fleet'] | select `data ?? []` |
| useVehicleUpcomingQuery(id) | entretiensService.getVehicleUpcomingMaintenance | ['maintenance','upcoming','vehicule',id] | select `data ?? null` |
| useEntretiensHistoryQuery(params) | entretiensService.searchHistory (POST) | ['maintenance','entretiens','history',params] | placeholderData keepPreviousData |
| useEntretienFilesQuery(id) | entretiensService.getEntretienFiles | ['maintenance','entretiens',id,'files'] | enabled quand le dialog est ouvert ; select `files ?? []` |
| useTypesEntretienQuery | typesEntretienService.getTypesEntretien | ['maintenance','types'] | select `typesEntretien ?? data ?? []` ; staleTime long |
| useDossiersQuery | dossiersTypesEntretienService.getDossiers | ['maintenance','dossiers'] | select `dossiers ?? []` |
| useVehiculeConfigsQuery(id) | vehiculesTypesEntretienService.getByVehiculeId | ['maintenance','configs','vehicule',id] | select `vehiculeTypesEntretien ?? data ?? []` |
| useVehiclesQuery / useVehicleQuery(id) | vehiclesService.getVehicles / getVehicleById | vehiclesKeys.list() / detail(id) | partagés avec la feature vehicles |

| Mutation | Service.méthode | Invalidations |
|---|---|---|
| useCreateEntretienMutation (aussi pour « Valider ») | createEntretien | ['maintenance','entretiens'], ['maintenance','upcoming'] (+ vehiclesKeys.detail si le km est mis à jour côté backend, point 14) |
| useUpdateEntretienMutation | updateEntretien (+ addFile pour les nouveaux fichiers, séquentiel dans mutationFn) | ['maintenance','entretiens'] (inclut files(id)), ['maintenance','upcoming'] |
| useDeleteEntretienMutation | deleteEntretien | ['maintenance','entretiens'], ['maintenance','upcoming'] |
| useAddEntretienFileMutation | addFile | files(id), history (nombre de fichiers) |
| useDeleteEntretienFileMutation | deleteFile | files(id), history |
| useCreate/Update/DeleteVehiculeConfigMutation | vehiculesTypesEntretienService.create/update/delete | configs(vehiculeId), ['maintenance','upcoming'] |
| useCreateTypeEntretienMutation | createType | types |
| useUpdateTypeEntretienMutation | updateType | types, history, upcoming, configs (noms affichés) |
| useMoveTypeEntretienMutation | updateType({dossierId}) | optimiste sur types (onMutate / rollback), invalide types à la fin |
| useDeleteTypeEntretienMutation | deleteType | types, configs |
| useCreate/UpdateDossierMutation | createDossier / updateDossier | dossiers (+ types pour un update, car le nom du dossier est embarqué) |
| useDeleteDossierMutation | deleteDossier | dossiers, types |

## 3. Bugs suspectés

**Entretiens.vue**
- **B1** L1079 : `isMecanicien` teste l'UUID **Admin**. Le Mécanicien est en lecture seule sur `/entretiens` : pas de création, modification, suppression ni gestion des fichiers, pas de boutons Types / Stock. Pourtant EV, TypesEntretien et le backend l'autorisent. **Impact élevé (droits).**
- **B2** L1418-1420 (avec L1797-1805) : le watcher `formData.dossierId` vide `typeEntretienId` juste après `openEditModal` si le dossier diffère du formulaire précédent.
  - En édition, le type apparaît vide.
  - Sans nouvelle sélection, `typeEntretienId: ''` est envoyé : type inchangé ou 400. Impact moyen.
- **B3** L142-153 : dans la section « En retard », toutes les alertes du véhicule s'affichent « En retard de … » (`Math.abs`), y compris celles à venir. Une échéance à +30 j s'affiche ainsi « En retard de 30 jours ». Impact moyen (information fausse).
- **B4** L814-822 : `@view-pdf` n'est pas écouté, un clic sur un PDF ne fait rien.
- **B5** L1277 (et EV L960) : « Total coût HT » ne somme que la page courante (et le filtre rapide). Le chiffre est trompeur.
- **B6** L286-294 et L1587-1599 : la recherche rapide filtre seulement la page courante côté client, et Entrée relance le serveur sans le texte. Compteurs et pagination sont faux.
- **B7** L454-503 et L1601 (EV L336-376 et L894) : le tri par en-tête est client, limité à la page, et entre en conflit avec le tri serveur « Trier par / Ordre ».
- **B8** L1674-1709 : la recherche et la pagination ne passent pas `loading`. Aucun retour visuel, double clic possible.
- **B9** L1771, L1862, L1980 (EV L1258, L1513) : `toISOString().split('T')[0]` donne la date UTC. Entre 0h et 1h/2h heure de Paris, la date par défaut et la date de « Valider » sont celles de la veille.
- **B10** L598-606 et L609-728 (EV L523-530) : Véhicule et Type sont marqués `*` sans validation. Une valeur `''` est envoyée et produit un toast d'erreur générique.
- **B11** L741, L747 : `$event ? Number($event) : null` transforme 0 en `null`. Un coût à 0 est omis.
- **B12** L976-1000 : pour un Mécanicien, sur une ligne sans fichiers, le clic droit ouvre un menu vide (titre seul) et bloque le menu natif.
- **B13** L1905-1949 (EV L1372-1397) : après ajout ou suppression d'un fichier, l'historique n'est pas rechargé et le nombre de fichiers de la ligne reste faux. EV ne recharge qu'à la suppression.
- **B14** L1647-1672 : 5 requêtes en série ; un seul échec interrompt tout le chargement.
- **B15** L17, L113, L277 :
  - Le badge « Prochains » compte les véhicules renvoyés par l'API, pas ceux en retard ou à venir.
  - L'état vide se base sur l'API et non sur la liste des véhicules.
  - Le second état vide est inatteignable.
- **B16** Code mort : L875-966, L1105, L1116-1117, L1429-1438, L1740-1752, L1854-1869, L1974-2008, L2049-2051, L2068-2070 (modales Valider et Historique).
- **B17** L593 (EV L516) : DialogContent de formulaire sans `max-h-[90dvh] overflow-y-auto` (règle CLAUDE.md), donc pas de scroll sur mobile. Les Selects dans les Dialogs n'ont pas `:teleport="false"`.
- **B18** L1872-1891 (EV L1348-1367) :
  - Le FileReader asynchrone n'est pas attendu : une soumission rapide peut partir sans fichiers.
  - L'input n'est jamais réinitialisé, `ref="fileInput"` n'est pas déclaré, et il n'y a aucune limite de taille.
- **B19** L851, L870 (EV L711, L732, L749, L780) : boutons de confirmation sans état pending, double soumission possible.
- **B20** L1924 (EV L1391) : « Fichier ajoute avec succes » sans accents.

**EntretiensVehicule.vue**
- **B21** L1546-1547 : la date envoyée est `T00:00:00.000+01:00`, avec un offset codé en dur qui ignore l'heure d'été, alors qu'Entretiens envoie `T12:00:00`. Une date vide lève une RangeError, qui finit en toast générique.
- **B22** L654-677 : la visionneuse PDF en `fixed inset-0` est rendue dans DialogContent, qui a un `transform`. Elle reste confinée à la boîte du dialog, et Échap ferme tout le dialog.
- **B23** L568 et L1426-1436 : en édition, la suppression d'un fichier existant est immédiate, sans confirmation, et irréversible même si l'utilisateur clique ensuite sur Annuler.
- **B24** L1549-1568 : en édition, si l'upload d'un nouveau fichier échoue, le toast d'erreur s'affiche alors que l'entretien est déjà modifié. Une nouvelle soumission duplique les fichiers déjà envoyés.
- **B25** L540, L546 : `v-model.number` sur un input natif : un champ vidé donne `''`, qui est envoyé tel quel.
- **B26** L99-110 et L143-153 : les bandeaux sont verts dès qu'il n'y a pas de retard. Il n'y a pas de palier « à venir », contrairement au dashboard (10 000 km / 90 j).
- **B27** L120, L163 : les valeurs négatives s'affichent « (-500 km restants) » et « (-12 jours) ».
- **B28** L1131-1167 et L1689 : pas de réaction à un changement de `:id` ; chaque mutation recharge toutes les données.
- **B29** L1519 : « Valider » utilise `latestKm || 0`, d'où un entretien à 0 km si le véhicule n'a pas de relevé.
- **B30** L1669-1686 : approximation de `formatPeriodicite` (45 j donnent « 1 mois »).
- **B31** L27, L87 : le badge Configurations compte aussi les inactives.
- **B32** L853-857 : `isMecanicien` est toujours vrai (conditions inutiles), et incohérent avec B1.

**TypesEntretien.vue**
- **B33** L657 : un drag vers « Non classés » envoie `{}`. Le backend (`TypeEntretienService` L77) ignore un `dossierId` null.
  - Le type reste dans son dossier côté serveur alors que l'UI affiche « Type déplacé vers "Non classés" ».
  - Il y revient au rechargement. **Impact élevé (perte silencieuse).**
- **B34** L742 et L741 : vider le Dossier ou la Description envoie `undefined`, ignoré par le backend. Il est impossible de retirer un type de son dossier ou d'effacer une description.
  - Même problème pour le coût vidé dans les deux vues d'entretiens (backend `EntretienService` L102).
- **B35** L595-602 : une erreur de chargement des dossiers n'apparaît qu'en console.
- **B36** L196-199 : le drag & drop HTML5 ne fonctionne ni au tactile ni au clavier. Sur mobile, seul le formulaire permet de déplacer un type.
- **B37** L18 : sidebar `md:h-screen md:sticky` sous la navbar, dépassement probable à vérifier.
- **B38** L839-840 : la suppression d'un type utilisé renvoie une erreur générique.

**ConfigEntretienModal.vue**
- **B39** L52 : `v-model.number` sur l'Input shadcn, dont `Input.vue` ignore les `modelModifiers`. La valeur envoyée est une string.
- **B40** L51-57 : aucune contrainte d'entier alors que le backend attend un `Integer`. Une valeur décimale produit un 400 et un toast générique.
- **B41** L34-41 : passer de KILOMETRAGE à TEMPOREL (ou l'inverse) en édition conserve la valeur : 30 000 km deviennent 30 000 jours.

**Services / modèles**
- **B42** :
  - `EntretienDTO` n'a pas `files` et `EntretienFileDTO` n'a pas `fileUrl`, d'où des `(item as any).files` partout.
  - `EntretienSearchParams` et `EntretienHistoryRequest` n'ont pas `dossierId`, que le backend supporte.
  - Types en doublon entre services et models : `EntretienFileDTO`, les requests, `PeriodiciteType` (union vs enum).
- **B43** Entretiens L1657, EV L1150 et L1621 : casts `as any` inutiles sur des champs déjà typés dans `ApiResponse`.

## 4. Points d'ombre à trancher avec le propriétaire
1. **Droits.** Le Mécanicien peut-il créer, modifier et supprimer sur `/entretiens` ? Les droits sont-ils identiques à ceux de l'Admin sur les 3 pages ? Faut-il prendre en compte `viewAsUser` ?
2. **Code mort.** Supprimer les modales Historique et Valider d'Entretiens.vue ? (Proposition : oui ; « Valider » n'existe que dans EV.)
3. **Palier « à venir ».** Appliquer les seuils 10 000 km / 90 j aux bandeaux d'EV ? Ces seuils doivent-ils être configurables ? Et le badge « Prochains » doit-il compter retard + à venir ?
4. **Total coût HT.** Total de la page ou de toute la recherche ? La seconde option demande un agrégat backend.
5. **Tri.** Unifier sur un tri serveur piloté par les en-têtes ? Le backend ne trie que date, km et coût, pas véhicule, type ni mécanicien.
6. **Recherche rapide.** La supprimer, ou ajouter un paramètre `q` côté backend ?
7. **Sélecteur de type.** Hiérarchique partout (proposé) ou liste plate ?
8. **Fichiers en édition.** Aligner les deux vues sur le comportement d'EV, avec confirmation de suppression ? Fixer une taille maximale ?
9. **Heure envoyée.** Standardiser sur `YYYY-MM-DDT12:00:00` sans offset, comme Entretiens ?
10. **Effacement de champs.** Impossible aujourd'hui de retirer un dossier ou d'effacer une description ou un coût (le backend ignore les null). Correction backend ou limite acceptée ?
11. **Fichiers de la liste.** Le backend renvoie `fileUrl` dans l'historique et du base64 lourd sur `/files`. Passer aux URL ? L'accès à `/uploads` est-il authentifié ?
12. **État dans l'URL.** Persister l'onglet, les filtres, la page et le dossier sélectionné en query params ?
13. **Kilométrage véhicule.** La création d'un entretien met-elle à jour `latestKm` côté backend ? Si oui, il faut invalider le détail du véhicule.
14. **Suppression d'un type utilisé.** Que fait le backend (cascade, refus) ? Faut-il un message dédié ?
15. **Drag & drop tactile.** Passer à @dnd-kit, ou proposer un menu « Déplacer vers… » sur mobile ?
16. **« Valider ».** Accepter un km à 0 si le véhicule n'a pas de relevé ? Faut-il plutôt demander le km ?
17. **Périodicité.** L'approximation « mois = 30 j » dans l'affichage est-elle acceptable ?
18. **Types en doublon.** Quels types font foi entre services (copiés inchangés) et models ? Ajouter `files`, `fileUrl` et `dossierId` aux modèles React ?
19. **Nom de feature.** `maintenance` couvre-t-il entretiens, types, dossiers et configs ? `TabbedPageHeader` est-il partagé avec les autres pages (à vérifier dans les autres inventaires) ?
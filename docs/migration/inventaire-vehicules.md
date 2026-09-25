# Inventaire du périmètre Véhicules (Vue 3 vers React)

J'ai lu en entier les 24 fichiers du périmètre, ainsi que les composants maison, `ApiClient.ts`, `Select.vue`, `TabsContent.vue` et le store auth. Aucun fichier n'a été modifié.

## Contexte transversal

- **Routes** :
  - `/vehicules` (`Vehicules`) et `/vehicules/:id` (`VehiculeDetail`) ont `meta: { requiresAuth, requiresMechanic }`.
  - La garde laisse passer un admin **ou** un mécanicien, sinon elle redirige vers `/unauthorized`.
  - `/vehicules` est la route par défaut du mécanicien après connexion.
- **`isMecanicien` est toujours vrai sur ces pages.**
  - Il est défini en dur dans les deux vues (UUIDs `c10523af…` et `ccbd448a…`) et fait double emploi avec `authStore.isAdmin || authStore.isMechanic`.
  - Comme la garde garantit déjà admin ou mécanicien, toutes les branches « lecture seule » sont du code mort.
- **La seule vraie différence de rôle est `authStore.isAdmin`** dans le détail : date personnalisée à l'ajout d'un relevé km, et édition des relevés km.
- **Autres consommateurs des services** (les query keys doivent être partagées) :
  - `Pointage.vue` : `getVehicles`, `addKilometrage`
  - `Entretiens.vue` : `getVehicles`
  - `EntretiensVehicule.vue` : `getVehicleById`. Cette vue a aussi son propre visualiseur PDF et une copie de `getFileUrl`.
- **Pas de multipart** : tout part en JSON, les binaires en data-URL base64.
  - `ApiClient` a un timeout global de 30 s (`ApiClient.ts:66`).
  - Une erreur API renvoie une `ApiError` dont le message peut contenir la liste des erreurs de validation.
- **Onglets du détail** : `TabsContent` de reka démonte les onglets inactifs, comme Radix en React. Chaque onglet est donc monté à son activation.

---

### src/views/vehicles/Vehicules.vue (967 l.)

- **Rôle / route** :
  - Liste du parc sur `/vehicules`. Aucun paramètre ni query lu ou écrit ; la recherche et le tri sont en état local et se perdent en quittant la page.
  - Sorties : `/vehicules/:id` (clic sur l'identité ou « Détails ») et `/entretiens/vehicule/:id` (« Entretiens »).
- **Par rôle** : aucune différence entre Admin et Mécanicien. « Ajouter » et toutes les actions « Supprimer » (menu mobile, bouton du tableau, menu contextuel) dépendent de `isMecanicien` (l.668-672), toujours vrai.
- **Appels API** :
  - `vehiclesService.getVehicles()` : GET `vehicules`, renvoie `{success, vehicules: VehiculeDTO[]}`. Appelé au montage.
  - `createVehicle(data)` : POST `vehicules` en JSON, photo en `pictureBase64` (data-URL). Renvoie `{success, message?, vehicule}`, puis ajout (push) dans la liste locale.
  - `deleteVehicle(id)` : DELETE `vehicules/{id}`, renvoie `SuccessMessageResponse`, puis filtrage local.
- **Données dérivées / état** :
  - `filteredVehicules` : recherche insensible à la casse, avec trim, sur `immat`, `relaiImmat`, `brand` et `model`.
  - `tableColumns` : le libellé « Véhicules (N) » suit le nombre filtré.
  - `sortedData` : voir la section tableau.
  - Un watch de plomberie sur `contextMenuRef.menuElement`. Pas de timer.
- **Formulaire « Nouveau véhicule »** (Dialog `sm:max-w-lg max-h-[90dvh] overflow-y-auto`) :
  - Champs :
    - Immatriculation * : forcée en majuscules, placeholder `AB-123-CD`.
    - Immat. véhicule relais : majuscules.
    - Marque * (`Ford`) et Modèle * (`Transit`).
    - Commentaire : `textarea` natif, 3 lignes, placeholder « Informations supplémentaires sur le véhicule... ».
  - Photo :
    - Input `accept=image/*`, aperçu 150×120 avec bouton X.
    - Un fichier non image donne « Veuillez sélectionner une image valide ».
    - Au-delà de 10 Mo : « L'image est trop volumineuse (max 10MB) ».
    - Lecture via FileReader en data-URL.
  - Séparateur « Informations techniques » :
    - VIN : majuscules, `maxlength` 17, police mono, placeholder `WF0XXXGCDX1234567`.
    - N° carte grise : placeholder `2024AB12345`.
    - Mise en circulation (date) ; Carburant (Select maison, clearable, sans recherche : Diesel / Essence / Électrique / Hybride / GNV) ; PTAC (kg), number, `min` 0, placeholder `3500`.
  - Séparateur « Assurance & Contrôle technique » :
    - Assureur (`AXA`), N° contrat assurance (`ASS-2025-123456`).
    - Expiration assurance et Prochain contrôle technique (dates).
  - Validation : uniquement le bouton désactivé si `!immat || !brand || !model || saving`, sans trim. Aucun message par champ.
  - Envoi : les champs vides partent en `undefined`.
  - Succès : fermeture et toast `success('Véhicule créé avec succès !', 'Succès')`.
  - Erreur : bandeau `formError`, par défaut « Erreur lors de l'enregistrement ».
  - Boutons : « Enregistrer » / « Enregistrement... » avec spinner, et « Annuler ».
- **Dialog de suppression** :
  - Texte « Êtes-vous sûr de vouloir supprimer ce véhicule ? » et encart immat + marque/modèle.
  - Encart « Attention : Cette action est irréversible ! » listant photos, historiques de kilométrage et informations d'ajustement.
  - L'utilisateur doit taper `CONFIRMER` (exact, sensible à la casse). Entrée valide.
  - Bouton « Supprimer définitivement » / « Suppression... ». Pas de toast de succès.
- **Tableau desktop (md et plus)** :
  - Colonnes :
    1. « Véhicules (N) », triable sur `immat` : vignette 44 px (photo, ou icône Truck sur `bg-primary`), immat en majuscules, badge relais (icône Repeat), marque et modèle.
    2. Kilométrage, triable : « 125 000 km » (fr-FR) ou « - ».
    3. Date du relevé, triable : « 12 janv. 2025 » ou « - ».
    4. Commentaire : tronqué à 200 px, italique, avec `title`.
    5. Actions (alignées à droite) : Détails, Entretiens, Supprimer.
  - Tri :
    - Clic sur l'en-tête : asc puis desc, sans retour à l'état non trié.
    - Les valeurs nulles vont en fin en asc et en tête en desc. Icônes ArrowUpDown / ArrowUp / ArrowDown, colonne active en `text-primary`.
    - Comparaison : `Date.parse`, sinon nombre, sinon `localeCompare('fr')`.
  - État vide : « Aucun véhicule trouvé ».
  - Menu contextuel (clic droit sur une ligne) : titre = immat, puis Détails, Entretiens, séparateur, Supprimer.
- **Mobile (sous md)** :
  - « N véhicule(s) », puis des cartes : vignette 48 px, immat, badge relais, marque/modèle, menu (MoreVertical) Détails / Entretiens / Supprimer, km + date, commentaire limité à 2 lignes.
  - Aucun contrôle de tri, pas de pagination.
- **Graphiques** : aucun.
- **Composants UI et équivalents shadcn** :
  - Button, Input, Table, Dialog, DropdownMenu se transposent directement.
  - Le Select maison (combobox) devient shadcn Select ; il n'est pas clearable nativement, il faut ajouter un bouton « Effacer ».
  - `textarea` devient Textarea.
  - `ContextMenuPopover` + `useContextMenu` deviennent shadcn ContextMenu, avec la `TableRow` comme trigger.
  - `useMessages` devient sonner.
  - Les séparateurs « texte au milieu » deviennent Separator ou le composant field de shadcn.
- **Styles** :
  - `max-w-[1400px]`, `px-4 md:px-6`, bascule cartes / tableau à md.
  - Le dialog utilise des grilles 2 et 3 colonnes non responsives.
- **Bugs suspectés** :
  - l.749-753 : `Date.parse` est appliqué à toutes les valeurs, y compris `latestKm` (converti en chaîne) et les immats. V8 lit « 125000 » comme une année et renvoie NaN au-delà de 275760 : le comparateur devient incohérent et le tri km peut être faux.
  - l.958 : l'erreur de suppression est écrite dans `error` global. Toute la liste est remplacée par le bandeau d'erreur, et le dialog reste ouvert sans message.
  - l.535 : Entrée dans le champ CONFIRMER ne vérifie pas `deleting`, d'où une double requête possible.
  - l.256 et 479-481 : le bouton Enregistrer est hors du `<form>`. Le `required` HTML n'est jamais évalué, Entrée ne soumet pas, et « » (espaces) est accepté.
  - l.261 et 770 : `formSuccess` n'est jamais alimenté (état mort).
  - l.475 et 540 : `DialogFooter class="gap-2 sm:gap-0"` colle les boutons en desktop.
  - l.386 : `grid-cols-3` fixe, champs écrasés sur mobile.
  - l.414 : un PTAC négatif est accepté.
  - l.516-521 : la liste de ce qui est supprimé en cascade est probablement incomplète (fichiers, rapports, équipements, entretiens ?).
  - l.789-795 : `carburantOptions` est dupliqué dans `VehiculeInfoCard`.
- **Cible React** :
  - `pages/vehicles/VehiculesPage.tsx` (~80 l.) :
    - Appelle `useVehicles()`, gère la recherche (`useState` + `useDeferredValue`) et les états loading / error / empty.
    - Tient l'état des dialogs sous forme d'union `{type:'create'} | {type:'delete', vehicule}` et compose les composants ci-dessous.
  - `features/vehicles/components/list/` :
    - `VehiclesToolbar.tsx` : recherche avec icône + bouton Ajouter.
    - `vehiclesColumns.tsx` : `ColumnDef<VehiculeDTO>[]`. Tri sur `immat` en texte, `latestKm` en `basic` avec `sortUndefined:'last'`, `latestKmDate` en `datetime`.
    - `VehiclesDataTable.tsx` : `useReactTable` avec les row models core, sorted et filtered, un `globalFilterFn` sur les 4 champs, et un ContextMenu par ligne. Le compteur vient de `getFilteredRowModel().rows.length`.
    - `VehiclesMobileList.tsx` + `VehicleMobileCard.tsx` : rendus à partir de `table.getRowModel().rows`, donc même filtre et même tri.
    - `VehicleActionsMenuItems.tsx` : les items Détails / Entretiens / Supprimer, réutilisés dans le DropdownMenu et le ContextMenu.
  - `features/vehicles/components/` :
    - `VehicleIdentity.tsx` (vignette + immat + badge relais + marque/modèle), `VehicleAvatar.tsx`, `RelaiBadge.tsx`.
    - `dialogs/VehicleCreateDialog.tsx` : react-hook-form + zod, `useCreateVehicle`, toast.
    - `forms/VehicleFormFields.tsx` : champs partagés entre création et édition, via `useFormContext`.
    - `forms/VehiclePictureInput.tsx`.
    - `dialogs/VehicleDeleteDialog.tsx`, construit sur `components/shared/TypeToConfirmDialog.tsx` (le motif CONFIRMER existe aussi dans `Users.vue` et `StockItems.vue`).
  - Divers :
    - `features/vehicles/schemas.ts` : `vehicleFormSchema`, `toCreatePayload`, `toUpdatePayload`, `CARBURANT_OPTIONS`.
    - `hooks/useVehiclePermissions.ts` (ou `src/hooks/usePermissions.ts`) : `canEdit`, `isAdmin`.
    - `src/lib/format.ts` : `formatKm`, `formatDateFr`, `formatDateTimeFr`, `formatDateOnly`, `toDatetimeLocal`.

---

### src/views/vehicles/VehiculeDetail.vue (1242 l.)

- **Rôle / route** :
  - `/vehicules/:id`. Le paramètre `id` est lu **une seule fois** (l.463, non réactif). Pas de query.
  - L'onglet actif `activeTab` est local, `'fichiers'` par défaut. Valeurs : `fichiers | kilometrages | adjustInfos | rapports | equipements`. Il n'est pas dans l'URL.
  - Navigation : retour vers `/vehicules`, Entretiens vers `/entretiens/vehicule/:id`.
- **Par rôle** :
  - `isMecanicien` (toujours vrai) : Modifier, crayon du badge km, dropzone et suppression de fichiers, CRUD des équipements.
  - `authStore.isAdmin` : (1) champ « Date du releve (optionnel) » en datetime-local à l'ajout km, qui bascule vers l'endpoint admin s'il est renseigné ; (2) crayon d'édition sur chaque relevé et dialog d'édition.
  - Un mécanicien ajoute uniquement à la date courante et n'édite pas les relevés. Personne ne peut supprimer un relevé.
- **Appels API** (tous en JSON) :
  - Véhicule :
    - `getVehicleById` : GET `vehicules/{id}`, renvoie `{vehicule}`. Au montage et après chaque ajout / édition km.
    - `updateVehicle` : PUT `vehicules/{id}` en remplacement complet (tous les champs, vides à `null`, `comment` tel quel, `pictureBase64` seulement s'il change ou `''`). Renvoie `{vehicule}`.
  - Fichiers :
    - `getVehicleFiles` : GET `vehicules/{id}/files`, renvoie `{files}`.
    - `addFile` : POST `vehicules/{id}/files` avec `{fileB64 (data-URL complète), originalName, mimeType || 'application/octet-stream'}`. Séquentiel, un appel par fichier.
    - `deleteFile` : DELETE `vehicules/files/{fileId}`.
  - Kilométrage :
    - `getKilometrageHistory` : GET `vehicules/{id}/kilometrages?page=&size=` (10, ou -1 pour tout ; `page` et `totalPages` sont alors `null`). Renvoie `{kilometrages, page, size, totalElements, totalPages}`.
    - `addKilometrage` : POST `vehicules/kilometrages` avec `{vehiculeId, km}`.
    - `addKilometrageAdmin` : POST `vehicules/admin/kilometrages` avec `{vehiculeId, km, createdAt ISO}`.
    - `updateKilometrageAdmin` : PUT `vehicules/admin/kilometrages/{kmId}` avec `{km, createdAt?}`.
  - Commentaires (« adjust infos ») :
    - `getAdjustInfo` : GET `vehicules/{id}/adjust-infos?page=&size=10`, renvoie `{adjustInfos, page, size, totalElements, totalPages}`.
    - `createAdjustInfo` : POST `vehicules/adjust-infos` avec `{vehiculeId, comment (trim), picturesB64?: string[]}`.
    - `getAdjustInfoPictures` : GET `vehicules/adjust-infos/{id}/pictures`, renvoie `{pictures}`.
  - Rapports : `rapportsService.getRapports` : GET `rapports/{vehiculeId}?page=&size=` (10 ou -1), renvoie `{data, page, size, totalElements, totalPages}`. Les photos sont incluses dans chaque rapport ; lecture seule.
  - Équipements : `vehiculeEquipementsService.getByVehicule` : GET `vehicules-equipements/vehicule/{id}`, renvoie `{equipements}`.
  - Séquence de chargement :
    - Au montage : le véhicule, puis en parallèle fichiers, km (page 0) et commentaires (page 0).
    - Rapports et équipements sont chargés **à chaque activation** de leur onglet ; les rapports reviennent à la page 0.
- **État / watchers / timers** :
  - Une soixantaine de refs : édition, fichiers + upload (progress, current file, total, index), visualiseur PDF, lightbox, pagination km (taille 10, `showAll`), pagination commentaires, pagination rapports (+ `showAll`), équipements et leurs modals, modals km (ajout et édition), formulaire de commentaire.
  - Watchers : fermeture du modal photos rapport qui remet `selectedRapport` à null ; fermeture du modal photos commentaire qui vide les photos ; `activeTab` (mise à jour du graphique, chargement rapports et équipements).
  - Timers : `setTimeout(100)` après `nextTick` pour `kmTabRef.updateChart()` (l.759-761 et 880-882) et pour le focus du champ km (l.912-914).
- **Formulaires et dialogs** :
  1. **Édition du véhicule** (inline, dans `VehiculeInfoCard`) :
     - Photo : un fichier non image donne « Veuillez selectionner une image valide ». Au-delà de 10 Mo : « L'image est trop volumineuse (max 10MB) ».
     - Erreur de lecture : « Erreur lors de la lecture du fichier ». Erreur API par défaut : « Erreur lors de la sauvegarde ».
     - Pas de toast de succès.
  2. **« Ajouter un kilometrage »** :
     - « Kilométrage actuel * » : number, `inputmode` numeric, `min` 0, placeholder `125000`, autofocus.
     - Pour l'admin, date optionnelle avec l'aide « Laissez vide pour utiliser la date actuelle ».
     - Bouton désactivé si `!kmValue`. Aucune vérification km ≥ dernier km (le service indique qu'il n'y a pas de validation serveur).
     - Erreur par défaut : « Erreur lors de l'ajout du kilometrage ».
  3. **« Modifier le kilometrage »** (admin) :
     - Kilometrage *, Date du releve (datetime-local prérempli en heure locale), bloc en lecture « Enregistre par » (avatar + nom).
     - Erreur par défaut : « Erreur lors de la modification du kilometrage ».
  4. **« Photos de l'ajustement »** (`sm:max-w-2xl`) :
     - Chargement « Chargement des photos... », vide « Aucune photo pour cet ajustement ».
     - Grille 2/3 colonnes en carré avec la date ; un clic ouvre la lightbox en galerie.
  5. **« Ajouter un commentaire »** :
     - Textarea « Commentaire * » (4 lignes, « Entrez votre commentaire... »).
     - « Photos (optionnel) » : bouton « Ajouter des photos », input multiple `image/*`, aperçus en 3 colonnes avec X.
     - Commentaire vide après trim : « Veuillez entrer un commentaire ». Fichier non image : « Veuillez selectionner uniquement des images » (les autres fichiers sont gardés).
     - Aucune limite de taille ni de nombre. Erreur par défaut : « Erreur lors de l'ajout du commentaire ».
  6. **« Photos du rapport »** : même grille, sans appel API. Vide : « Aucune photo pour ce rapport ».
  7. **Visualiseur PDF** :
     - Overlay maison (pas un Dialog), `bg-black/90`, iframe sur `fileUrl` ou une data-URL.
     - En-tête : nom, « Telecharger », X. Se ferme au clic sur le fond ou sur X, pas avec Échap.
  8. **ImageLightbox** : galerie.
  9. **Upload** :
     - Séquentiel. La progression vaut i/n (par fichier, pas par octet).
     - Au-delà de 500 Mo : `Le fichier "x" est trop volumineux (max 500MB)`, puis on passe au suivant.
     - Erreur par défaut : « Erreur lors de l'upload du fichier ».
  10. **Téléchargement** : un `<a download>` créé à la volée.
  11. **Suppression de fichier** : immédiate, **sans confirmation**.
- **Tableaux et graphiques** : délégués aux onglets.
- **Composants UI** :
  - Tabs avec un style « onglets classeur » : fond `bg-muted`, trigger `rounded-t-lg` avec `data-[state=active]:bg-background`, en sombre `border-primary/40 bg-primary/10`, libellés masqués sous sm.
  - Dialog, Button, Input ; `textarea` devient Textarea ; lightbox dans shared.
- **Styles** : `px-6 py-6` fixe, sans variante mobile contrairement à la liste.
- **Bugs suspectés** :
  - l.463 : `id` non réactif. Passer de `/vehicules/A` à `/vehicules/B` sans démontage affiche encore A.
  - l.17 : si la réponse ne contient pas `vehicule`, la page est blanche (ni chargement, ni erreur, ni contenu).
  - l.599, 946 et 999 : `loadVehicule` repasse `loading` à true. Après chaque ajout ou édition km, toute la page est remplacée par le spinner (flash, onglets remontés, scroll perdu).
  - l.814 et 1015 : les erreurs de chargement des rapports et de suppression de fichier vont dans `error` global et **remplacent toute la page**.
  - l.737, 763, 788, 836 et 1026 : erreurs silencieuses pour fichiers, km, commentaires, équipements et photos (pas d'état d'erreur).
  - l.670-673 : la suppression de photo envoie `pictureBase64: ''`. Or le service documente que vide ou null signifie « photo inchangée » (`vehicles.ts:36-37`). Le bouton « Supprimer la photo » est donc sans effet côté serveur.
  - l.1010-1017 : suppression de fichier sans confirmation.
  - l.1135-1171 :
    - Le `try` englobe la boucle : une erreur sur un fichier interrompt les suivants et saute `loadFiles()`. Les fichiers déjà envoyés restent invisibles.
    - Envoyer jusqu'à 500 Mo en base64 JSON avec un timeout de 30 s mène presque sûrement à un timeout 408.
  - l.1193-1201 : `download` est ignoré en cross-origin (l'API est sur une autre origine). L'onglet navigue vers le fichier et sort de la SPA.
  - l.259-263 et 369-373 : l'index vient du tableau non filtré alors que la galerie est filtrée (photos sans URL). L'image initiale peut être la mauvaise.
  - l.575 : typé `VehiculePictureDTO[]` alors que l'API renvoie `VehiculeAdjustInfoPictureDTO[]`.
  - l.876-891 : rapports et équipements rechargés à chaque retour sur l'onglet ; la pagination des rapports est réinitialisée.
  - l.757-761 : le graphique est créé deux fois (parent et watch enfant), avec un `setTimeout`.
  - l.172 : un km égal à 0 est refusé.
  - l.1066-1079 : photos de commentaire sans limite, dans un seul POST.
  - l.1183-1191 : `getFileUrl` duplique celui de `utils/fileUtils.ts`.
  - l.536 : `adjustInfosTotalElements` n'est jamais affiché.
  - l.404-422 : l'overlay PDF n'a ni Échap ni focus trap.
  - Accents manquants dans les libellés : « vehicule », « kilometrage », « releve », « Enregistre par », « Telecharger », « plein ecran ».
- **Cible React (découpage)** :
  - `pages/vehicles/VehiculeDetailPage.tsx` (~100 l.) :
    - `useParams()`, `useVehicle(id)`. États loading (Skeleton), error (Alert) et not found.
    - Rend `<VehicleInfoCard vehicule />` et `<VehicleDetailTabs vehiculeId />`.
  - `features/vehicles/components/detail/` :
    - `VehicleInfoCard.tsx` : contient l'état `isEditing` et bascule entre la vue et le formulaire d'édition.
    - `VehicleInfoHeader.tsx`, `VehicleInfoView.tsx`.
    - `VehicleKmBadge.tsx`, qui embarque `AddKmDialog.tsx` : plus besoin de remonter l'état au parent.
    - `VehicleDetailsGrid.tsx` + `InfoTile.tsx`.
    - `VehicleEditForm.tsx` : react-hook-form, `VehicleFormFields`, `useUpdateVehicle`.
    - `VehicleAvatarEditor.tsx`.
    - `VehicleDetailTabs.tsx` : shadcn Tabs avec les classes du style classeur.
  - `features/vehicles/components/tabs/files/VehicleFilesTab.tsx` :
    - Utilise `useVehicleFiles`, `useVehicleFilesUpload`, `useDeleteVehicleFile` et un AlertDialog de confirmation.
    - Tient l'état local de la lightbox et du visualiseur PDF.
    - S'appuie sur les composants shared FileDropzone, FileCard, ImageLightbox et `PdfViewerDialog`.
  - `tabs/kilometrages/` :
    - `VehicleKmTab.tsx` : état `page` et `showAll`.
    - `KmChart.tsx` (Recharts), `KmTimeline.tsx`, `EditKmDialog.tsx`.
  - `tabs/comments/` : `VehicleCommentsTab.tsx`, `CommentCard.tsx`, `AddCommentDialog.tsx`, `AdjustPicturesDialog.tsx` (requête activée seulement quand le dialog est ouvert).
  - `tabs/rapports/` : `VehicleRapportsTab.tsx`, `RapportCard.tsx`.
  - `tabs/equipements/` : `VehicleEquipementsTab.tsx`, `EquipementCard.tsx`, `EquipementFormDialog.tsx`, `EquipementDeleteDialog.tsx`.
  - `components/PicturesGridDialog.tsx` : commun aux commentaires et aux rapports.
  - `features/vehicles/hooks/` :
    - `useVehicleFilesUpload.ts` : séquentiel, progression, erreurs par fichier, invalidation dans tous les cas.
    - `useDetailTab.ts` : `?tab=` via `useSearchParams`, validé contre la liste des onglets.
    - `useVehiclePermissions.ts`.
  - Shared : `components/shared/{PdfViewerDialog, SimplePagination, UserChip, EmptyState, TypeToConfirmDialog}.tsx`, `src/lib/fileToDataUrl.ts`.

---

### src/components/vehicles/VehiculeInfoCard.vue (570 l.)

- **Rôle** : composant de présentation, affichage ou édition piloté par le parent (`v-model:editFormData` et des emits).
- **Affichage** :
  - En-tête : bouton « Vehicules » (ghost, ArrowLeft), « Cree le {date} » masqué sous sm, « Entretiens » (default), « Modifier » (outline) si `isMecanicien`.
  - Identité : photo 72 px ou icône Truck, immat en h2 `2xl` majuscules, badge relais, marque/modèle.
  - Badge km 88 px : « Kilometre », valeur (**0 si absent**), « km », et un crayon rond qui émet `open-km-modal`.
  - Tuiles `bg-muted/50` sur une grille 2 colonnes (3 en sm) :
    - VIN (Hash, mono), Carte grise (FileText), Mise en circulation (Calendar), Carburant (Fuel), PTAC (Weight, « x kg »). Bloc masqué si tous les champs sont vides.
    - Assureur (Shield), N° contrat, Expiration assurance (CalendarClock), Prochain CT (ClipboardCheck).
    - Couleur des deux dates d'échéance : `text-orange-500` si l'échéance tombe dans les 30 jours, `text-destructive` si elle est passée.
    - Commentaire toujours affiché, « Aucun commentaire » en italique sinon.
- **Édition** :
  - Photo avec overlay caméra au survol (input caché) et bouton X destructif.
  - L'immat devient un Input à la place du h2. Le badge km et les boutons Entretiens / Modifier sont masqués.
  - Champs : Marque *, Modele *, Immatriculation du véhicule relais, Commentaire.
  - Séparateur « Informations techniques » : VIN, N° carte grise, Mise en circulation, Carburant (clearable), PTAC.
  - Séparateur « Assurance & Contrôle technique » : Assureur, N° contrat assurance, Expiration assurance, Prochain contrôle technique.
  - Boutons Annuler / Sauvegarder (« Sauvegarde... »), désactivé si `!immat || !brand || !model`, sans trim. Pas de `<form>`, donc pas de soumission par Entrée.
- **Composants et styles** :
  - Button (`icon-sm`), Input, Select maison vers shadcn Select, `textarea` vers Textarea.
  - Grilles responsives en sm.
- **Bugs** :
  - l.87-96 : suppression de photo inopérante côté serveur (voir le détail).
  - l.133 : affiche « 0 km » quand aucun relevé n'existe.
  - l.551, 560 et 565 : suppose un format `YYYY-MM-DD` (ajoute `'T00:00:00'`). Un datetime renvoyé par l'API donnerait une date invalide.
  - l.558-561 : une échéance tombant aujourd'hui s'affiche en rouge dès minuit.
  - l.73-84 : overlay caméra visible au survol uniquement, aucun indice sur tactile.
  - l.481-487 : options carburant dupliquées.
  - Accents manquants : « Vehicules », « Cree », « Kilometre », « Modele », « supplementaires ».
- **Cible React** :
  - `detail/VehicleInfoCard.tsx` et ses sous-composants (voir le détail).
  - `features/vehicles/hooks/useExpiryStatus.ts`, ou une fonction pure `getExpiryStatus(date): 'expired' | 'soon' | 'ok'`.
  - L'identité est partagée avec la liste.

### src/components/vehicles/VehiculeKilometragesTab.vue (338 l.)

- **Rôle** : onglet « Historique km » : graphique, timeline et pagination.
- **Props / emits** :
  - Props : `kilometrages`, `loading`, `page`, `totalPages`, `totalElements`, `pageSize`, `showAll`, `isAdmin`.
  - Emits : `edit-km`, `load-all`, `update:page`.
  - Expose : `updateChart()`.
- **États** : chargement « Chargement des kilometrages... », vide « Aucun kilometrage enregistre ».
- **Timeline** :
  - En-tête « Historique detaille ({totalElements}) » et « Voir tout » si `!showAll && totalElements > pageSize`.
  - Les éléments suivent l'ordre renvoyé par l'API : point cerclé `border-primary` et trait vertical, « x km », date « 12 janv. 2025, 14:20 », crayon si admin, utilisateur (avatar 20 px et nom).
  - Pagination « Precedent / Page x / y / Suivant » si `!showAll && totalPages > 1`.
- **Graphique Chart.js** :
  - Courbe remplie, données triées par date croissante.
  - Libellés en `dd MMM yyyy` sur un axe catégoriel ; série « Kilometrage ».
  - `tension` 0.3, points de rayon 6 (8 au survol), couleur `rgb(59,130,246)`, remplissage `rgba(...,0.1)`, bordure blanche de 2.
  - Légende masquée ; ratio 2.
  - Tooltip noir : titre = nom de l'utilisateur (ou « Utilisateur inconnu »), libellé « x km » (fr-FR), ligne suivante = date longue avec heure.
  - Axe Y : `beginAtZero` false, graduations « x km », grille `rgba(0,0,0,.05)`. Axe X sans grille.
- **Équivalent Recharts** :
  - `ChartContainer` avec `config={{km:{label:'Kilométrage',color:'var(--chart-1)'}}}` et `className="aspect-[2/1] w-full"`.
  - `AreaChart` sur des données `{label, km, userName, dateLong}`.
  - `CartesianGrid vertical={false}`, `XAxis dataKey="label" tickLine={false} axisLine={false}`, `YAxis domain={['auto','auto']} tickFormatter={v=>`${v.toLocaleString('fr-FR')} km`}`.
  - `Area type="monotone" dataKey="km" stroke="var(--color-km)" fill="var(--color-km)" fillOpacity={0.1} dot={{r:6,strokeWidth:2,stroke:'#fff'}} activeDot={{r:8,strokeWidth:3}}`.
  - `ChartTooltip` avec `ChartTooltipContent hideIndicator labelFormatter` (nom) et un `formatter` (km + date). Pas de légende.
  - Les données sont calculées directement au rendu, sans `useEffect`.
- **Composants UI** : Button, la pagination va dans `SimplePagination`.
- **Bugs** :
  - l.183 et 300 : pas de `destroy()` au démontage (fuite de l'instance Chart).
  - l.304-311 : watch plus appel du parent, donc double rendu avec `setTimeout`.
  - l.223-231, 246-250 et 288 : couleurs en dur. Le bleu ne correspond pas au primaire violet `#581c87` et la grille est invisible en thème sombre.
  - Le graphique ne montre que la page chargée (10 points) tant qu'on n'a pas cliqué « Voir tout ».
  - Après « Voir tout », aucun moyen de revenir à la vue paginée.
  - l.100-122 : pagination dupliquée avec `VehiculePagination`.
  - l.150-160 : Title et Legend enregistrés dans Chart.js mais inutilisés.
- **Cible React** : `tabs/kilometrages/{VehicleKmTab, KmChart, KmTimeline, KmTimelineItem, EditKmDialog}.tsx`.

### src/components/vehicles/VehiculeCommentsTab.vue (100 l.)

- **Rôle** : onglet « Commentaires », c'est-à-dire les « adjust infos ».
- **Contenu** :
  - En-tête avec « Ajouter », sans condition de rôle.
  - États : « Chargement des commentaires... », vide « Aucun commentaire enregistré ».
  - Cartes : utilisateur (avatar 24 px et nom) à gauche, date (CalendarDays) à droite, texte, puis « Voir les photos » affiché sur **toutes** les cartes (émet `view-pictures(id)`).
  - Pagination via `VehiculePagination`. Pas de « Voir tout », pas d'édition ni de suppression.
- **Bugs** :
  - l.50 : pas de `whitespace-pre-line`, les retours à la ligne saisis sont perdus.
  - Le bouton photos apparaît même sans photo, ce qui déclenche une requête pour rien.
- **Cible React** : `tabs/comments/{VehicleCommentsTab, CommentCard, AddCommentDialog, AdjustPicturesDialog}.tsx`.

### src/components/vehicles/VehiculeEquipementsTab.vue (85 l.)

- **Rôle** : onglet « Équipements du véhicule ».
- **Contenu** :
  - « Ajouter » si `isMecanicien`.
  - Chargement « Chargement des équipements... ». Vide : « Aucun équipement » avec « Ajoutez un équipement pour commencer. » ou « Aucun équipement enregistré pour ce véhicule. » selon le rôle.
  - Grille 1 / 2 / 3 colonnes (sm / lg). Chaque carte : icône Wrench, nom, badge « × quantité » (1 par défaut), commentaire sur 2 lignes max, boutons Pencil et Trash2 (ghost `icon-sm`).
  - Ordre de l'API, sans tri.
- **Bug** : l.55, les actions sont en `opacity-0 group-hover:opacity-100`, donc invisibles sur tactile et au clavier.
- **Cible React** : `tabs/equipements/{VehicleEquipementsTab, EquipementCard}.tsx`, avec des actions toujours visibles ou un DropdownMenu.

### src/components/vehicles/VehiculeEquipementModal.vue (142 l.)

- **Rôle** : dialog de création ou d'édition d'un équipement. Un watch sur l'ouverture réinitialise ou préremplit le formulaire.
- **Champs** :
  - Nom * (« Ex: Gilet jaune, Triangle, Extincteur... »).
  - Quantité : number, `min` 1, vide = 1.
  - Commentaire : textarea, « Commentaire optionnel... ».
  - Bouton désactivé si le nom est vide après trim.
- **Appels API** :
  - Création : POST `vehicules-equipements` avec `{vehiculeId, nom (trim), quantite, commentaire (trim) || undefined}`.
  - Édition : PUT `vehicules-equipements/{id}` avec `{nom, quantite, commentaire || undefined}`. Renvoie `{equipement}`.
  - Succès : émet `saved`, puis le parent recharge la liste. Erreur par défaut : « Erreur lors de la sauvegarde ».
  - Titres « Modifier l'équipement » / « Ajouter un équipement » ; bouton « Modifier » / « Ajouter ». Pas de toast.
- **Bugs** :
  - l.36 : une quantité 0 ou négative est acceptée.
  - l.123 : un commentaire vidé part en `undefined`, donc il est omis du JSON. Il devient impossible d'effacer le commentaire si l'API fusionne au lieu de remplacer.
- **Cible React** : `EquipementFormDialog.tsx` avec react-hook-form + zod (`nom` trim min 1, `quantite` entier ≥ 1). Le reset se fait via `values` ou `key`, pas via `useEffect`.

### src/components/vehicles/VehiculeEquipementDeleteModal.vue (79 l.)

- **Rôle** : confirmation « Êtes-vous sûr de vouloir supprimer l'équipement **nom** ? Cette action est irréversible. »
- **Appel API** : DELETE `vehicules-equipements/{id}`. Erreur par défaut « Erreur lors de la suppression », puis émet `deleted`.
- **Cible React** : `EquipementDeleteDialog.tsx` sur shadcn AlertDialog.

### src/components/vehicles/VehiculeFilesTab.vue (78 l.)

- **Rôle** : onglet « Fichiers ».
- **Contenu** :
  - Bandeau d'erreur d'upload.
  - FileDropzone si `isMecanicien` : types acceptés images, pdf, doc(x), xls(x) avec leurs MIME ; indication « Images, PDF, Word, Excel jusqu'a 500MB » ; progression.
  - Chargement « Chargement des fichiers... ». Vide : « Aucun fichier disponible » ou « Aucun fichier pour le moment » selon le rôle.
  - Grille 2 / 3 / 4 / 5 colonnes de cartes. Pas de tri, de recherche ni de pagination.
- **Bug** : l'erreur d'upload persiste jusqu'au prochain upload (pas de fermeture). `maxFileSize` n'est pas passé à la dropzone ; la validation se fait dans le parent.
- **Cible React** : fusionné dans `VehicleFilesTab.tsx`.

### src/components/vehicles/VehiculeFileCard.vue (29 l.)

- **Rôle** : simple passe-plat vers `FileCard` (`deletable = isMecanicien`).
- **Cible React** : à supprimer, utiliser directement `components/shared/FileCard`.

### src/components/vehicles/VehiculePagination.vue (39 l.)

- **Rôle** : pagination indexée à partir de 0, masquée si `totalPages ≤ 1`. Chevrons et « Page x / y ».
- **Cible React** : `components/shared/SimplePagination.tsx`, avec une option `withLabels` pour la variante km. La Pagination shadcn est possible mais surdimensionnée ici.

### src/components/vehicles/VehiculeRapportsTab.vue (110 l.)

- **Rôle** : onglet « Rapports », en lecture seule.
- **Contenu** :
  - En-tête « Rapports ({total}) » et « Voir tout » si `!showAll && total > pageSize`.
  - Cartes : date à gauche, utilisateur à droite (l'inverse des commentaires), commentaire, puis « Voir les photos (n) » s'il y a des photos (émet `view-pictures(rapport)`).
  - Pagination si `!showAll`.
- **Bug** : l.56, retours à la ligne perdus.
- **Cible React** : `tabs/rapports/{VehicleRapportsTab, RapportCard}.tsx` et `PicturesGridDialog`.

---

### src/services/vehicles.ts (363 l.)

- **Méthodes utilisées** : `getVehicles`, `getVehicleById`, `createVehicle`, `updateVehicle`, `deleteVehicle`, `addKilometrage`, `getKilometrageHistory` (taille **-1 par défaut**, max 300), `addKilometrageAdmin`, `updateKilometrageAdmin`, `getVehicleFiles`, `addFile`, `deleteFile`, `createAdjustInfo`, `getAdjustInfo` (max 50), `getAdjustInfoPictures`.
- **Méthodes inutilisées**, sur des « routes absentes du contrat » : `addPicture`, `getVehiclePictures`, `deletePicture`.
- **Incohérences** :
  - `VehiculeCreateRequest`, `VehiculeUpdateRequest` et `VehiculeFileUploadRequest` sont définis ici **et** dans `models`, avec des optionalités différentes.
  - `VehiculeUpdateRequest` n'accepte pas `null`, alors que le détail envoie des `null` (contourné avec `Record<string, unknown>`). À élargir pour le TS strict.
  - Les query strings sont concaténées à la main.

### src/services/vehiculeEquipements.ts (51 l.)

- **Méthodes** : `getByVehicule`, `getById` (inutilisée), `create`, `update`, `delete` sur `vehicules-equipements`. Toutes les réponses ont la forme `{success, equipement(s)}`.

### src/services/rapports.ts (119 l.)

- **Utilisée sur le web** : seulement `getRapports` (taille 10 par défaut, max 50, -1 pour tout).
- **Inutilisées sur le web** (probablement pour l'app mobile) : `createRapport`, `getMyLatestRapport`, `getRapportPictures`, `addPicture`, `deletePicture`.
- **Doublons** : `RapportPictureDTO` double `RapportVehiculePictureDTO`, et `RapportVehiculeCreateRequest` existe aussi dans `models`.

### Modèles

- **src/models/VehiculeDTO.ts (97 l.)** : `VehiculeDTO` a tous ses champs optionnels (`createdAt`, `latestKmDate` en `Date | string` ; les dates métier en `YYYY-MM-DD`). Contient aussi des types Create et Update en double.
- **src/models/VehiculeKilometrageDTO.ts (62 l.)** : `{id, vehiculeId, km, user?: UserDTO, createdAt}`. Le type de page n'y est pas nullable, contrairement au service. Contient aussi des types liés au pointage (`UserLastKilometrageResponse`, `UserLastVehicleDTO`).
- **src/models/VehiculePictureDTO.ts (13 l.)** : lié à des routes non vérifiées ; utilisé à tort pour les photos de commentaire.
- **src/models/VehiculeAdjustInfoDTO.ts (55 l.)** : l'info d'ajustement (sans photos) et `VehiculeAdjustInfoPictureDTO`.
- **src/models/VehiculeFileDTO.ts (33 l.)** : `fileB64` et/ou `fileUrl`, `mimeType`, `fileSize`, `originalName`.
- **src/models/VehiculeEquipementDTO.ts (10 l.)** : `nom`, `quantite`, `commentaire`, `vehiculeImmat`.
- **src/models/RapportVehiculeDTO.ts (57 l.)** : `user`, `vehicule`, `commentaire`, `pictures[]`.
- Pour la migration, tous ces fichiers peuvent être copiés tels quels. Il faudra seulement dédupliquer les types de requête et faire accepter `| null` à ceux de mise à jour.

### src/utils/fileUtils.ts (52 l.) et src/types/file.ts (13 l.)

- **Contenu** : fonctions pures `getFileUrl`, `formatFileSize` (o / Ko / Mo), `isImage`, `isPdf`, `isWord`, `isExcel`, `getFileTypeCategory`. `FileData` est le type commun aux fichiers de véhicule et d'entretien.
- **Bug mineur** : l.30-31 et 40-41, `endsWith` est sensible à la casse, donc `.DOCX` n'est pas reconnu.
- **Cible React** : `src/lib/files.ts` et `src/types/file.ts`.

### Composants maison (pour information)

- **FileCard.vue (111 l.)** :
  - Au clic : une image émet `view-image(url)`, un PDF émet `view-pdf`, le reste émet `download`.
  - Aperçu PDF en 250 px. Bouton supprimer au survol seulement (l.61, inaccessible sur tactile).
  - Cible : `components/shared/FileCard.tsx`.
- **FileDropzone.vue (164 l.)** :
  - Glisser-déposer ou clic, `multiple`, `maxFileSize` optionnel (émet `error`), barre de progression, mode `compact`.
  - Div non accessible au clavier (l.2-16, pas de `tabindex` ni de `role`). Le `dragleave` clignote en présence d'enfants (l.119-123).
  - Cible : `components/shared/FileDropzone.tsx` avec shadcn Progress.
- **ImageLightbox.vue (305 l.)** :
  - Téléporté, `z-[200]`, zoom de 0.5 à 5 par pas de 0.25 (molette).
  - Précédent / suivant avec compteur. Balayage horizontal (plus de 50 px) pour naviguer, vers le bas (plus de 100 px) pour fermer.
  - Clavier en phase capture : Échap bloque le Dialog sous-jacent, flèches pour naviguer.
  - Téléchargement via fetch et blob, avec `window.open` en repli.
  - Cible : `components/shared/ImageLightbox.tsx`, en gardant la capture d'Échap à cause des Dialogs Radix.
- **PdfPreview.vue (73 l.) et usePdfPreview.ts (175 l.)** :
  - PdfPreview.vue:30-32 : la prop `width` n'est pas transmise, le rendu est toujours à 200 px.
  - usePdfPreview.ts:5-6 : le worker vient d'un CDN en version 4.0.379 alors que `package.json` indique `^4.0.379`. Une 4.x plus récente installée provoquera une erreur de version entre API et worker. En React, utiliser `import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'`.
  - usePdfPreview.ts:21 : la clé de cache est faite des 100 premiers caractères base64. Deux PDF à en-tête identique partagent donc le même aperçu.
  - usePdfPreview.ts:30 : `atob` échoue si `fileB64` commence par `data:`.
  - Le cache n'est pas borné.
  - Cible : `components/shared/PdfPreview.tsx`, `src/lib/pdfPreview.ts` (fonctions pures) et un hook `usePdfThumbnail` basé sur `useQuery` (clé `['pdf-thumb', url | hash]`, `staleTime: Infinity`), qui remplace le cache manuel.
- **ContextMenuPopover (60, 27 et 3 l.) et useContextMenu.ts (102 l.)** : entièrement remplacés par le ContextMenu shadcn (Radix) ; à supprimer.

---

## 1. Composants shadcn nécessaires

- `button` (variantes default, outline, ghost, destructive ; tailles sm et `icon-sm`)
- `input`, `textarea`, `label`, `form` (react-hook-form)
- `select`
- `table`
- `dialog`, `alert-dialog`
- `dropdown-menu`, `context-menu`
- `tabs`
- `chart` (Recharts)
- `sonner`
- `separator`
- `badge` (relais, quantité)
- `avatar` (utilisateurs, vignettes)
- `alert` (bandeaux d'erreur)
- `skeleton` (ou `spinner`)
- `progress` (dropzone)
- `tooltip` (remplace les attributs `title`)
- Optionnels : `empty`, `field` (séparateurs titrés), `pagination`, et `calendar` + `popover` si l'on abandonne les dates natives.

## 2. Hooks TanStack Query

Query keys dans `features/vehicles/api/queryKeys.ts` :
- `vehiclesKeys.all = ['vehicles']`
- `list() = ['vehicles','list']`
- `detail(id) = ['vehicles','detail',id]`
- `files(id) = [...detail(id),'files']`
- `kms(id, p) = [...detail(id),'kilometrages',p]`
- `adjustInfos(id, p) = [...detail(id),'adjust-infos',p]`
- `adjustInfoPictures(aid) = ['vehicles','adjust-infos',aid,'pictures']`
- `rapports(id, p) = [...detail(id),'rapports',p]`
- `equipements(id) = [...detail(id),'equipements']`

Requêtes :

| Hook | Service | Clé | Notes |
|---|---|---|---|
| `useVehicles` | `vehiclesService.getVehicles` | `list()` | `select: r => r.vehicules ?? []`. Partagé avec Pointage et Entretiens. |
| `useVehicle(id)` | `getVehicleById` | `detail(id)` | `select: r => r.vehicule`. Partagé avec EntretiensVehicule. |
| `useVehicleFiles(id)` | `getVehicleFiles` | `files(id)` | |
| `useVehicleKilometrages(id,{page,size})` | `getKilometrageHistory` | `kms(id,{page,size})` | `placeholderData: keepPreviousData` |
| `useVehicleAdjustInfos(id,page)` | `getAdjustInfo(id,page,10)` | `adjustInfos(id,{page,size:10})` | `keepPreviousData` |
| `useAdjustInfoPictures(aid,{enabled})` | `getAdjustInfoPictures` | `adjustInfoPictures(aid)` | Activé quand le dialog est ouvert. |
| `useVehicleRapports(id,{page,size},{enabled})` | `rapportsService.getRapports` | `rapports(id,{page,size})` | Activé quand l'onglet est actif. |
| `useVehicleEquipements(id,{enabled})` | `vehiculeEquipementsService.getByVehicule` | `equipements(id)` | |

Mutations :

| Hook | Service | Invalidation |
|---|---|---|
| `useCreateVehicle` | `createVehicle` | `list()` |
| `useUpdateVehicle(id)` | `updateVehicle` | `setQueryData(detail(id))` + `list()` |
| `useDeleteVehicle` | `deleteVehicle` | `removeQueries(detail(id))` + `list()` |
| `useAddKilometrage(id)` | `addKilometrageAdmin` si `createdAt`, sinon `addKilometrage` | `detail(id)` (préfixe, couvre les km), `list()` (`latestKm`). À réutiliser dans Pointage. |
| `useUpdateKilometrage(id)` | `updateKilometrageAdmin` | Mêmes invalidations. |
| `useUploadVehicleFile(id)` | `addFile` | Orchestré par `useVehicleFilesUpload` ; `files(id)` en `onSettled`. |
| `useDeleteVehicleFile(id)` | `deleteFile` | `files(id)` |
| `useCreateAdjustInfo(id)` | `createAdjustInfo` | `[...detail(id),'adjust-infos']`, et retour à la page 0. |
| `useCreateEquipement(id)`, `useUpdateEquipement(id)`, `useDeleteEquipement(id)` | `create`, `update`, `delete` | `equipements(id)` |

## 3. Bugs suspectés, consolidés

| Fichier:ligne | Impact |
|---|---|
| `Vehicules.vue:749-753` | `Date.parse` sur les km et les immats : tri potentiellement faux. |
| `Vehicules.vue:958` | L'erreur de suppression remplace toute la liste ; le dialog reste ouvert sans message. |
| `Vehicules.vue:535` | Double suppression possible via Entrée. |
| `Vehicules.vue:256, 479-481` | Bouton hors du form : pas de `required`, pas de soumission par Entrée, espaces acceptés. |
| `Vehicules.vue:261, 770` | `formSuccess` mort. |
| `Vehicules.vue:475, 540` | `sm:gap-0` : boutons collés. |
| `Vehicules.vue:386` | Grille 3 colonnes non responsive. |
| `Vehicules.vue:414` | PTAC négatif accepté. |
| `Vehicules.vue:516-521` | Liste des suppressions en cascade probablement incomplète. |
| `Vehicules.vue:668-672`, `VehiculeDetail.vue:500-504` | UUIDs de rôle en dur, toujours vrais : branches mortes. |
| `VehiculeDetail.vue:463` | `id` non réactif. |
| `VehiculeDetail.vue:17` | Page blanche si `vehicule` absent. |
| `VehiculeDetail.vue:599, 946, 999` | Toute la page repasse en spinner après chaque action km. |
| `VehiculeDetail.vue:814, 1015` | Erreur rapports ou suppression de fichier : page entière remplacée. |
| `VehiculeDetail.vue:737, 763, 788, 836, 1026` | Erreurs silencieuses. |
| `VehiculeDetail.vue:670-673`, `VehiculeInfoCard.vue:87-96` | Suppression de photo sans effet serveur. |
| `VehiculeDetail.vue:1010-1017` | Suppression de fichier sans confirmation. |
| `VehiculeDetail.vue:1135-1171`, `ApiClient.ts:66` | Une erreur interrompt le lot sans recharger ; 500 Mo en base64 avec timeout de 30 s. |
| `VehiculeDetail.vue:1193-1201` | `download` ignoré en cross-origin : sortie de la SPA. |
| `VehiculeDetail.vue:259-263, 369-373` | Index de galerie décalé. |
| `VehiculeDetail.vue:575` | Mauvais type de DTO. |
| `VehiculeDetail.vue:876-891` | Rechargement et reset à chaque changement d'onglet. |
| `VehiculeDetail.vue:757-761`, `VehiculeKilometragesTab.vue:304-311` | Double rendu du graphique via `setTimeout`. |
| `VehiculeDetail.vue:172` | km 0 refusé ; pas de contrôle km ≥ dernier km. |
| `VehiculeDetail.vue:1066-1079` | Photos de commentaire sans limite. |
| `VehiculeDetail.vue:1183-1191` | `getFileUrl` dupliqué. |
| `VehiculeDetail.vue:404-422` | Overlay PDF sans Échap ni focus trap. |
| `VehiculeKilometragesTab.vue:183, 300` | Pas de `destroy` du Chart. |
| `VehiculeKilometragesTab.vue:223-250, 288` | Couleurs en dur, grille invisible en sombre. |
| `VehiculeKilometragesTab.vue` | Graphique limité à la page affichée ; pas de retour après « Voir tout ». |
| `VehiculeInfoCard.vue:133` | « 0 km » affiché quand aucun relevé. |
| `VehiculeInfoCard.vue:551-565` | Format de date supposé ; échéance du jour affichée « expirée ». |
| `VehiculeInfoCard.vue:73-84` | Overlay photo au survol uniquement. |
| `VehiculeCommentsTab.vue:50`, `VehiculeRapportsTab.vue:56` | Retours à la ligne perdus. |
| `VehiculeCommentsTab.vue:52-57` | Bouton photos affiché même sans photo. |
| `VehiculeEquipementsTab.vue:55`, `FileCard.vue:61` | Actions invisibles sur tactile et au clavier. |
| `VehiculeEquipementModal.vue:36` | Quantité 0 ou négative acceptée. |
| `VehiculeEquipementModal.vue:123` | Commentaire impossible à effacer (selon la sémantique du PUT). |
| `PdfPreview.vue:30-32` | `width` ignorée. |
| `usePdfPreview.ts:5-6` | Worker CDN en version figée : mismatch possible. |
| `usePdfPreview.ts:21` | Collisions de cache. |
| `usePdfPreview.ts:30` | Préfixe `data:` non géré. |
| `FileDropzone.vue:2-16` | Non accessible au clavier. |
| `fileUtils.ts:30-41` | Extensions sensibles à la casse. |
| Libellés | Accents manquants un peu partout. |

## 4. Points d'ombre à trancher avec le propriétaire

1. Faut-il mettre l'onglet actif (`?tab=`) et les pages dans l'URL ? Et la recherche et le tri de la liste ?
2. Suppression de la photo du véhicule : l'API ne la permet pas. Retirer le bouton, ou demander un endpoint ?
3. Kilométrage : imposer km ≥ `latestKm` côté client (le serveur ne valide rien) ? Autoriser 0 ?
4. Graphique km : historique complet (requête dédiée avec size=-1) ou page courante ? Axe temporel réel ? Couleur du thème (`--chart-1`) ?
5. Upload : passer en multipart ? Quelle limite réelle (500 Mo) ? Timeout spécifique pour `addFile` ?
6. Ajouter une confirmation à la suppression de fichier ? Télécharger via fetch et blob pour rester dans l'app ?
7. Quelles données sont réellement supprimées avec un véhicule (texte du dialog) ?
8. Commentaires : l'API peut-elle fournir un nombre de photos ? Faut-il l'édition et la suppression ? Idem pour la suppression d'un relevé km.
9. Équipements : le PUT fusionne-t-il ou remplace-t-il ? Quantité minimale à 1 ?
10. Les branches « lecture seule » sont mortes (seuls admin et mécanicien accèdent) : les supprimer, ou prévoir un rôle lecture ? Quelle interaction avec `viewAsUser` ?
11. Dates : garder les inputs natifs date / datetime-local, ou passer au DatePicker shadcn ?
12. Valider le format de l'immatriculation (regex SIV) et du VIN (17 caractères exactement) ?
13. Carburant : liste figée côté front, ou enum fournie par l'API ?
14. Où ranger les schémas zod et les helpers purs (`features/vehicles/schemas.ts`, `lib/`) ? L'architecture ne prévoit que `api/components/hooks`.
15. Quel `staleTime` pour les rapports et équipements (aujourd'hui rechargés à chaque ouverture d'onglet) ?
16. Faut-il un tri sur mobile (absent aujourd'hui) ?
17. Corriger les accents manquants lors de la migration ?
18. Le motif « taper CONFIRMER » : le mutualiser en `TypeToConfirmDialog` avec Users et StockItems ?

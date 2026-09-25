# Composants, hooks et helpers partagés (phase 3)

Référence rapide pour les portages de la phase 4. Chaque fichier porte un JSDoc avec un exemple : le lire avant usage. **Utiliser ces briques au lieu de les réécrire.** S'il en manque une ou qu'elle a un défaut, créer l'équivalent local dans la feature et le signaler.

## `src/components/shared/`

| Composant | API (props principales) | Remplace (Vue) |
|---|---|---|
| `InputField` | `label`, `icon` (lucide), `hint`, `error`, `required`, `showPasswordToggle`, props natives de l'input, `ref` ; accepte `{...field}` d'un `Controller` | `ui/input-field` |
| `Combobox` | `value`, `onValueChange(v)` (`''` si effacé), `options {value,label,disabled?}[]`, `label`, `placeholder` (« Sélectionner... »), `required`, `error`, `hint`, `searchable` (true), `searchPlaceholder`, `noResultsText`, `clearable`, `disabled`, `id` ; `ref` et props restantes sur le déclencheur (compatible `Controller`). Fonctionne dans un Dialog. | `ui/select/Select.vue` (maison). Sans recherche : `ui/select` shadcn possible |
| `SearchFilters` | `value`, `onChange(obj)`, `filters: FilterConfig[]` (`select`/`date`/`text`/`number`/`checkbox`), `loading`, `columns` (1-6, défaut 4), `defaultExpanded`, `hint`, `count` (ReactNode), `onSearch`, `onReset` ; types `FilterConfig`, `FilterOption`, `FilterValues` | `ui/search-filters` |
| `BackButton` | `fallback` (défaut `'/'`, B-13 conservé), `size`, props de Button | `ui/retour` |
| `ConfirmDialog` | `open`, `onOpenChange`, `title`, `description`, `hideDescription`, `icon` (Trash2 par défaut, `null` = aucune), `children` (résumé), `confirmLabel`, `pendingLabel`, `cancelLabel`, `variant` (`destructive`/`default`), `isPending`, `confirmDisabled`, `confirmText` (ex. `"CONFIRMER"`), `onConfirm`. Ne se ferme pas tout seul : fermer dans le `onSuccess` de la mutation. Construit sur Dialog (`role="alertdialog"`) pour garder la fermeture à l'overlay. | modales de suppression |
| `DataTable<TData>` | `columns`, `data`, `getRowId`, `initialSorting` ou `sorting` + `onSortingChange`, `manualSorting`, `enableSortingRemoval`, `globalFilter`, `globalFilterFn`, `emptyState` ou `emptyIcon` + `emptyMessage`, `getRowClassName`, `onRowClick`, `onRowContextMenu`, `renderRow(row, tr)` (pour envelopper la ligne dans un `ContextMenu`), `className`, `tableClassName` ; classes par colonne : `meta: { headerClassName, cellClassName }` | tables codées à la main |
| `DataTableColumnHeader` | `column`, `title` (bouton, `aria-sort`, icônes ArrowUpDown/ArrowUp/ArrowDown, active en `text-primary`) | en-têtes triables |
| `SimplePagination` | `page` (0-based), `totalPages`, `onPageChange`, `showLabels`, `totalElements`, `disabled`, `variant`: `default` (« Page x sur y », listes admin), `card` (« Page x / y (n) », pages « mes » et Pointage), `compact` (chevrons, VehiculePagination) | paginations |
| `DataTablePagination` | `page`, `totalPages`, `onPageChange`, `totalElements`, `totalLabel`, `hideOnSinglePage`, `disabled`, `variant`: `bar` (UserServices) / `centered` (Entretiens) | paginations à 4 boutons |
| `UserAvatar` | `user {firstName,lastName,pictureUrl}`, `size` (`sm` 32, `md` 36 bordé, `default` 40, `lg` 48, `xl` 56 bordé) | avatars / initiales |
| `UserIdentity` | `user` (+ email), `size`, `showEmail`, `children` | avatar + nom + e-mail |
| `ErrorState` | `error` ou `message`, `title` (« Erreur de chargement »), `onRetry`, `isRetrying`. États vides : `Empty` de `ui/empty` directement | blocs d'erreur |
| `StatCard` | `icon`, `label`, `value`, `iconClassName`, `variant` (`default` Heures/Contrats, `compact` Pointage) | cartes de stats |
| `FileDropzone` | `onFilesSelected(File[])`, `onError`, `accept`, `multiple`, `disabled`, `uploading`, `progress`, `uploadCurrentFile`, `uploadTotalFiles`, `uploadCurrentIndex`, `placeholderTitle`, `placeholderSubtitle`, `hint`, `maxFileSize`, `compact` ; `ref` → `{ open() }` (`FileDropzoneHandle`) | `ui/file-dropzone` |
| `FileCard` | `file: FileData`, `deletable`, `showInfo`, `onViewImage(url)`, `onViewPdf(file)`, `onDownload(file)`, `onDelete(id)` | `ui/file-card` |
| `FileTypeIcon` | `mimeType`, `fileName` + props lucide | `getFileIcon` + FontAwesome |
| `ImageLightbox` | `open`, `onOpenChange`, `src` ou `images[]`, `initialIndex`, `alt` (Dialog z-[200]) | `ui/image-lightbox` |
| `PdfPreview` | `base64` ou `url`, `width` (200), `alt` | `ui/pdf-preview` |
| `PdfViewerDialog` | `open`, `onOpenChange`, `file: FileData \| null`, `url?`, `onDownload?` (défaut `downloadFileData`) | visionneuses PDF de VehiculeDetail / EntretiensVehicule |
| `SignaturePad` | `disabled`, `strokeColor`, `lineWidth`, `onEmptyChange` ; `ref` → `{ clear(), toDataURL(), isEmpty() }` (`SignaturePadHandle`) | `ui/signature-pad` |
| `AddressAutocomplete` | `value`, `onValueChange`, `onSelect(AddressDTO)`, `label`, `placeholder`, `required`, `error`, `hint`, `icon`, `limit` (8), `disabled` | `ui/address-autocomplete` |
| `MapboxMap` | `markers: MapMarker[] {lng,lat,color?,popupTitle?,popupText?}`, `mapStyle`, `zoom`, `fitPadding`, `fitMaxZoom`, `className` (hauteur 350 px par défaut) | carte de `useMapModal` |
| `PageMeta` | `title`, `description`, `robots`, `canonicalPath` (défauts = landing) ; une seule instance par écran, pages publiques uniquement (AppLayout gère les pages protégées) | `usePageMeta` |

## `src/hooks/`
- `useMediaQuery(query)`, `useDebouncedValue(value, ms)`, `useNow(enabled?)` (tick 1 s partagé), `useLocalStorage(key)` → `[value, setValue]`.
- `usePermissions()` : `isAdmin`, `isMechanic`, `isUser`, `isViewingAsUser`, `canToggleViewMode`, `hasRole`, `hasPermission`, `canAccess`, `toggleViewMode`, `setViewMode`.
- `useTheme()` : `theme`, `isDark`, `setTheme`, `toggleTheme`, `setForceLight` (landing).
- `useDialogState<'edit' | 'delete', T>()` → `{ type, item, isOpen(type), open(type, item), close, onOpenChange }` (l'élément reste disponible pendant l'animation de fermeture).
- `useMapboxMap(options)` → `{ containerRef, status }` ; `MAP_MARKER_COLORS` (`start` #16a34a, `end` #581c87), `MAP_DEFAULT_STYLE`.
- `usePdfPreview({ base64, url, width })`, `useZoom`, `useSwipe`, `useVersionCheck`.

## `src/lib/`
- `utils.ts` (`cn`), `getDefaultRoute(roleUuid)`, `userInitials.ts` (`getInitials`), `dates.ts` (`todayLocalISO`, `toLocalDateKey`, `parseLocalDateKey`, `addDaysToKey` : pour le nouveau code ; les pages atteintes par B-01 gardent la logique du Vue), `fileIcons.ts`, `fileToDataUrl.ts` (`fileToDataUrl`, `fileToBase64`), `downloadBlob.ts` (`downloadUrl`, `downloadBlob`, `downloadFileData`), `pdfPreview.ts`, `faviconBadge.ts`, `filterNav.ts`, `queryClient.ts`.

## Hooks de requêtes déjà disponibles
- `features/users/api` : `usersKeys`, `useUsersQuery({ enabled })` (masqués compris), `usePendingUsers` ; `features/users/lib/pendingActivation.ts`.
- `features/vehicles/api` : `vehiclesKeys`, `useVehiclesQuery`, `useVehicleQuery(id)`, `useAddKilometrageMutation`.
- `features/absences/api` : `absenceKeys`, `absenceTypeKeys`, `useAbsenceTypesQuery`, `useValidateAbsenceMutation`.
- `features/notifications/api` : `notificationsKeys`, `useUnreadNotificationsQuery`, `useMarkNotificationReadMutation`, `useMarkAllNotificationsReadMutation` ; `features/notifications/lib/{notificationMeta, formatRelativeTime}` (styles `short` / `long`).
- `features/service-history` : `useServiceHistory()` (`open(uuid)`, `close()`), `serviceHistoryKeys`, `useServiceModificationsQuery`, composants `ModificationUser`, `ModificationTimelineEntry`.
- `features/changelog` : `useChangelog`, `ChangelogDialog`.

## Mise en page globale
- Les pages protégées sont rendues dans `AppLayout` (navbar sticky `h-14`, puis la page). La navbar est déjà là : une page ne rend pas sa propre navbar.
- Dialogs globaux : `components/layout/GlobalDialogs.tsx` (le coordinateur y branche le rappel de signature et la complétion de profil).

import type { ComboboxOption } from '@/components/shared/Combobox'

/** Types de carburant proposés (liste figée, dupliquée dans Vehicules.vue et VehiculeInfoCard.vue). */
export const CARBURANT_OPTIONS: ComboboxOption[] = [
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Essence', label: 'Essence' },
  { value: 'Électrique', label: 'Électrique' },
  { value: 'Hybride', label: 'Hybride' },
  { value: 'GNV', label: 'GNV' },
]

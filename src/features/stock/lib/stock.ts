import type { StockItemDTO } from '@/models'

/** Entrée « Non classés » de la barre latérale (et cible de dépôt correspondante). */
export const UNCLASSIFIED = 'unclassified'

/** Sélection de la barre latérale : `null` = « Tous », `UNCLASSIFIED`, ou l'id d'une catégorie. */
export type StockCategorySelection = string | null

/** Unités proposées dans le formulaire d'article (liste en dur du Vue). */
export const UNITE_OPTIONS = [
  { value: 'pièce', label: 'Pièce' },
  { value: 'litre', label: 'Litre' },
  { value: 'kg', label: 'Kilogramme' },
  { value: 'mètre', label: 'Mètre' },
  { value: 'boîte', label: 'Boîte' },
  { value: 'lot', label: 'Lot' },
  { value: 'unité', label: 'Unité' },
]

export const DEFAULT_UNITE = 'pièce'

/** Seuil de stock bas (en dur dans le Vue) : quantité affichée en ambre à partir de là. */
export const LOW_STOCK_THRESHOLD = 5

export const isLowStock = (quantite: number | undefined) => (quantite || 0) <= LOW_STOCK_THRESHOLD

/** « 12,50 » : deux décimales, virgule. */
export const formatPrice = (value: number) => value.toFixed(2).replace('.', ',')

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/** Nombre d'articles rattachés à une catégorie. */
export const countItemsInCategory = (items: StockItemDTO[], categoryId: string) =>
  items.filter((item) => item.category?.id === categoryId).length

/**
 * Filtre de la liste : catégorie sélectionnée, puis recherche insensible à la casse sur la
 * référence, le nom et la description. Comme le Vue, la recherche n'est appliquée que si elle
 * n'est pas vide une fois trimée, mais c'est le texte **non trimé** qui est cherché.
 */
export function filterStockItems(
  items: StockItemDTO[],
  selection: StockCategorySelection,
  searchQuery: string,
): StockItemDTO[] {
  let result = items

  if (selection === UNCLASSIFIED) {
    result = result.filter((item) => !item.category)
  } else if (selection) {
    result = result.filter((item) => item.category?.id === selection)
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    result = result.filter(
      (item) =>
        item.reference?.toLowerCase().includes(query) ||
        item.nom?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query),
    )
  }

  return result
}

/** Clés TanStack Query du domaine véhicules. Tout ce qui dépend d'un véhicule vit sous `detail(id)`. */
export const vehiclesKeys = {
  all: ['vehicles'] as const,
  list: () => [...vehiclesKeys.all, 'list'] as const,
  detail: (id: string) => [...vehiclesKeys.all, 'detail', id] as const,
  /** Fichiers (images, PDF, documents) d'un véhicule. */
  files: (id: string) => [...vehiclesKeys.detail(id), 'files'] as const,
  /** Toutes les pages de relevés kilométriques d'un véhicule. */
  kilometrages: (id: string) => [...vehiclesKeys.detail(id), 'kilometrages'] as const,
  /** Une page de relevés (`size` = -1 : tout l'historique). */
  kilometragesPage: (id: string, page: number, size: number) =>
    [...vehiclesKeys.kilometrages(id), { page, size }] as const,
  /** Toutes les pages de commentaires (« adjust infos ») d'un véhicule. */
  adjustInfos: (id: string) => [...vehiclesKeys.detail(id), 'adjust-infos'] as const,
  adjustInfosPage: (id: string, page: number, size: number) =>
    [...vehiclesKeys.adjustInfos(id), { page, size }] as const,
  /** Photos d'un commentaire. */
  adjustInfoPictures: (adjustInfoId: string) =>
    [...vehiclesKeys.all, 'adjust-infos', adjustInfoId, 'pictures'] as const,
  /** Toutes les pages de rapports d'un véhicule. */
  rapports: (id: string) => [...vehiclesKeys.detail(id), 'rapports'] as const,
  rapportsPage: (id: string, page: number, size: number) =>
    [...vehiclesKeys.rapports(id), { page, size }] as const,
  /** Équipements d'un véhicule. */
  equipements: (id: string) => [...vehiclesKeys.detail(id), 'equipements'] as const,
  /** Historique des relais d'un véhicule (D9). */
  relais: (id: string) => [...vehiclesKeys.detail(id), 'relais'] as const,
}

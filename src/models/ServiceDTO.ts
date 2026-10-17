/**
 * Service DTO (D12) : un service de travail (`isBreak = false`) porte ses pauses ; une pause
 * (`isBreak = true`) porte son service. Toutes les durées sont calculées par l'API à l'instant
 * `calculeLe` ; l'affichage en direct ajoute le temps écoulé depuis la réception
 * (`src/lib/liveCounter.ts`) : à `duree` si `enCours`, à `dureeTravail` si `enCours && !enPause`,
 * à `dureePauses` si `enPause`.
 */
export interface ServiceDTO {
  uuid?: string;
  debut?: Date | string;
  fin?: Date | string;
  /** Durée BRUTE de la ligne en secondes, à `calculeLe` (en cours : calculeLe - debut) */
  duree?: number;
  /** Instant de calcul des durées (heure serveur) : affichage ou debug, jamais comparé à l'horloge du PC */
  calculeLe?: string;
  /** La ligne n'a pas de fin */
  enCours?: boolean;
  isBreak?: boolean;
  /** Latitude GPS de début */
  latitude?: number;
  /** Longitude GPS de début */
  longitude?: number;
  /** Latitude GPS de fin */
  latitudeEnd?: number;
  /** Longitude GPS de fin */
  longitudeEnd?: number;
  isAdmin?: boolean;
  userUuid?: string;
  /**
   * Date ISO (fuseau Paris) de la dernière modification (PUT) par un administrateur.
   * null si jamais modifié — y compris les pointages modifiés avant la mise en place du journal.
   */
  modifiedAt?: string | null;
  /** UUID de l'administrateur auteur de la dernière modification */
  modifiedByUuid?: string | null;
  /** "Prénom Nom" de l'administrateur auteur de la dernière modification */
  modifiedByName?: string | null;

  /** Service uniquement : pauses du service, par début croissant (une pause après minuit reste dans son service) */
  pauses?: ServiceDTO[];
  /** Service uniquement : durée des pauses en secondes, ramenées dans les bornes du service */
  dureePauses?: number;
  /** Service uniquement : temps de travail net en secondes (duree - dureePauses) */
  dureeTravail?: number;
  /** Service uniquement : service en cours ET une pause en cours */
  enPause?: boolean;

  /** Pause uniquement : UUID du service de travail auquel elle appartient */
  serviceParentUuid?: string;
}

/**
 * Requête pour démarrer un service
 */
export interface ServiceStartRequest {
  /** Latitude GPS */
  latitude?: number;
  /** Longitude GPS */
  longitude?: number;
  /** UUID de l'utilisateur (réservé aux administrateurs). Si non fourni, utilise l'utilisateur authentifié */
  userUuid?: string;
}

/**
 * Requête pour terminer un service
 */
export interface ServiceEndRequest {
  /** Latitude GPS */
  latitude?: number;
  /** Longitude GPS */
  longitude?: number;
  /** UUID de l'utilisateur (réservé aux administrateurs). Si non fourni, utilise l'utilisateur authentifié */
  userUuid?: string;
}

/**
 * Requête pour démarrer une pause
 */
export interface BreakStartRequest {
  /** Latitude GPS */
  latitude?: number;
  /** Longitude GPS */
  longitude?: number;
  /** UUID de l'utilisateur (réservé aux administrateurs). Si non fourni, utilise l'utilisateur authentifié */
  userUuid?: string;
}

/**
 * Requête pour terminer une pause
 */
export interface BreakEndRequest {
  /** Latitude GPS */
  latitude?: number;
  /** Longitude GPS */
  longitude?: number;
  /** UUID de l'utilisateur (réservé aux administrateurs). Si non fourni, utilise l'utilisateur authentifié */
  userUuid?: string;
}

/**
 * Service create request
 */
export interface ServiceCreateRequest {
  userUuid?: string;
  debut?: Date | string;
  fin?: Date | string;
  latitude?: number;
  longitude?: number;
  latitudeEnd?: number;
  longitudeEnd?: number;
  isBreak?: boolean;
  /** Pause uniquement : service de rattachement (absent : service en cours au début de la pause) — D12 */
  serviceParentUuid?: string;
}

/**
 * Service update request
 */
export interface ServiceUpdateRequest {
  debut?: Date | string;
  fin?: Date | string;
  latitude?: number;
  longitude?: number;
  latitudeEnd?: number;
  longitudeEnd?: number;
  isBreak?: boolean;
  /** Pause uniquement : service de rattachement (absent : service en cours au début de la pause) — D12 */
  serviceParentUuid?: string;
}

/**
 * Service history request
 */
export interface ServiceHistoryRequest {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
  startDate?: string;
  endDate?: string;
  isBreak?: boolean;
}

/**
 * Requête pour récupérer les services d'un utilisateur (admin)
 */
export interface AdminServiceSearchRequest {
  /** Numéro de page (commence à 0) */
  page?: number;
  /** Taille de la page */
  size?: number;
  /** Filtrer par type : true = pauses, false = services, null = tous */
  isBreak?: boolean;
  /** Date de début - si seul, recherche depuis cette date jusqu'à maintenant (par défaut : 30 jours avant) */
  startDate?: Date | string;
  /** Date de fin (par défaut : maintenant) */
  endDate?: Date | string;
  /** Champ de tri (debut, fin, duree) */
  sortBy?: string;
  /** Direction du tri (asc, desc) */
  sortDirection?: string;
}

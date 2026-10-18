import type { HeuresPeriodeDTO } from './HeuresPeriodeDTO';

/**
 * User hours DTO — heures nettes de l'utilisateur sur les périodes en cours (D12 : chaque période
 * est un HeuresPeriodeDTO, plus un nombre)
 */
export interface UserHoursDTO {
  /** Journée de travail en cours (la veille pour un service de nuit) */
  hoursDay?: HeuresPeriodeDTO;
  /** Jour (`YYYY-MM-DD`) de rattachement de `hoursDay` */
  jour?: string;
  hoursWeek?: HeuresPeriodeDTO;
  hoursMonth?: HeuresPeriodeDTO;
  hoursYear?: HeuresPeriodeDTO;
  hoursLastMonth?: HeuresPeriodeDTO;
  /** Instant de calcul (heure serveur) */
  calculeLe?: string;
}

/**
 * User with hours DTO
 */
export interface UserWithHoursDTO {
  user?: import('./UserDTO').UserDTO;
  hours?: UserHoursDTO;
}

/**
 * Worked hours DTO - Heures travaillées nettes par période (D12 : HeuresPeriodeDTO). Avec
 * `?period=`, seule cette période est présente.
 */
export interface WorkedHoursDto {
  /** Instant de calcul (heure serveur) */
  calculeLe?: string;
  /** Heures travaillées sur l'année en cours */
  year?: HeuresPeriodeDTO;
  /** Heures travaillées sur le mois en cours */
  month?: HeuresPeriodeDTO;
  /** Heures travaillées sur la semaine en cours */
  week?: HeuresPeriodeDTO;
  /** Heures de la journée de travail en cours (services débutés ce jour-là ; la veille pour un service de nuit) */
  day?: HeuresPeriodeDTO;
  /** Jour (`YYYY-MM-DD`) de la période `day` */
  jour?: string;
  /** Heures travaillées sur le mois dernier */
  lastMonth?: HeuresPeriodeDTO;
}

import type { HeuresPeriodeDTO } from './HeuresPeriodeDTO';

/**
 * User hours DTO — heures nettes de l'utilisateur sur les périodes en cours (D12 : chaque période
 * est un HeuresPeriodeDTO, plus un nombre)
 */
export interface UserHoursDTO {
  hoursDay?: HeuresPeriodeDTO;
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
  /** Heures travaillées aujourd'hui (services débutés ce jour-là) */
  day?: HeuresPeriodeDTO;
  /** Heures travaillées sur le mois dernier */
  lastMonth?: HeuresPeriodeDTO;
}

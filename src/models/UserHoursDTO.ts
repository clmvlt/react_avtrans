/**
 * User hours DTO
 */
export interface UserHoursDTO {
  hoursDay?: number;
  hoursWeek?: number;
  hoursMonth?: number;
  hoursYear?: number;
  hoursLastMonth?: number;
}

/**
 * User with hours DTO
 */
export interface UserWithHoursDTO {
  user?: import('./UserDTO').UserDTO;
  hours?: UserHoursDTO;
}

/**
 * Worked hours DTO - Heures travaillées par période
 */
export interface WorkedHoursDto {
  /** Heures travaillées sur l'année en cours */
  year?: number;
  /** Heures travaillées sur le mois en cours */
  month?: number;
  /** Heures travaillées sur la semaine en cours */
  week?: number;
  /** Heures travaillées aujourd'hui */
  day?: number;
  /** Heures travaillées sur le mois dernier */
  lastMonth?: number;
}

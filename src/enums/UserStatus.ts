/**
 * User presence status
 * - PRESENT: User is currently in service
 * - ON_BREAK: User is on break
 * - ABSENT: User has no active service
 */
export enum UserStatus {
  PRESENT = 'PRESENT',
  ON_BREAK = 'ON_BREAK',
  ABSENT = 'ABSENT'
}

export const UserStatusLabels: Record<UserStatus, string> = {
  [UserStatus.PRESENT]: 'En service',
  [UserStatus.ON_BREAK]: 'En pause',
  [UserStatus.ABSENT]: 'Absent'
}

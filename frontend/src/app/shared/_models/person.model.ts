export const PERSON_ROLES = ['AGENT', 'EMPLOYEE'] as const;
export type PersonRole = (typeof PERSON_ROLES)[number];

export interface PersonDto {
  id: number;
  fullName: string;
  email: string;
  role: PersonRole;
}

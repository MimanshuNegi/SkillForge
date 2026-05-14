export interface User {
  id?: number;
  username: string;
  password?: string;
  email: string;
  contactNumber?: number;
  skills?: string;
  bio?: string;
  role: Role;
}

export type Role = 'USER' | 'ADMIN' | 'CLIENT' | 'FREELANCER';


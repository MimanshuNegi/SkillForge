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

export enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  FREELANCER = 'FREELANCER'
}

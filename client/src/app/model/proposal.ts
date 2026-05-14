import { Job } from './job';
import { User } from './user';

export interface Proposal {
  id?: number;
  title?:string;
  bidAmount?: number;
  status?: string;
  job?: Job;
  freelancer?: User;
  appliedAt?: string;
}

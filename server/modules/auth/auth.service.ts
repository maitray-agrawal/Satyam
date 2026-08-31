import { z } from 'zod';
import { UserRole } from '../../types';
import { createServiceLogger } from '../../observability/logger';

const log = createServiceLogger('AuthService');

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  designation: string;
  department: string;
  organization: string;
}

export const LoginSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'PROCUREMENT_OFFICER', 'AUDITOR', 'REVIEWER']).default('PROCUREMENT_OFFICER'),
});

export const DEMO_USERS: AuthUser[] = [
  {
    id: 'usr-officer-01',
    email: 'officer.rajesh@gem.gov.in',
    name: 'Shri Rajesh Sharma',
    role: 'PROCUREMENT_OFFICER',
    designation: 'Senior Procurement Officer & Tender Inviting Authority (TIA)',
    department: 'Directorate General of Supplies & Disposals',
    organization: 'Government e-Marketplace (GeM)',
  },
  {
    id: 'usr-admin-01',
    email: 'admin.super@gem.gov.in',
    name: 'Dr. Sunita Deshmukh',
    role: 'ADMIN',
    designation: 'Chief Platform Security & Policy Administrator',
    department: 'GeM Technical & Policy Secretariat',
    organization: 'Government e-Marketplace (GeM)',
  },
  {
    id: 'usr-auditor-01',
    email: 'cag.auditor@cag.gov.in',
    name: 'Vikramaditya Rao',
    role: 'AUDITOR',
    designation: 'Principal Auditor (Central Public Procurement)',
    department: 'Comptroller and Auditor General of India (CAG)',
    organization: 'CAG India',
  },
  {
    id: 'usr-reviewer-01',
    email: 'technical.expert@iitd.ac.in',
    name: 'Prof. A. N. Murthy',
    role: 'REVIEWER',
    designation: 'Independent Technical Evaluation Committee Member',
    department: 'Department of Electrical Engineering',
    organization: 'IIT Delhi / Ministry of Heavy Industries',
  },
];

export class AuthService {
  public static getCurrentUser(roleOrId?: string): AuthUser {
    if (roleOrId) {
      const match = DEMO_USERS.find(
        (u) => u.id === roleOrId || u.role.toLowerCase() === roleOrId.toLowerCase()
      );
      if (match) return match;
    }
    return DEMO_USERS[0]; // Default to Procurement Officer
  }

  public static listAllDemoUsers(): AuthUser[] {
    return DEMO_USERS;
  }
}

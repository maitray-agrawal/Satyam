import { z } from 'zod';

export const UserRoleSchema = z.enum([
  'ADMIN',
  'PROCUREMENT_OFFICER',
  'AUDITOR',
  'REVIEWER',
  'TECHNICAL_EVALUATOR',
  'FINANCE_MEMBER',
]);

export const TenderStatusSchema = z.enum([
  'ACTIVE',
  'EVALUATION',
  'TECHNICAL_OPENING',
  'FINANCIAL_OPENING',
  'AWARDED',
  'CANCELLED',
]);

export const RequirementCodeSchema = z.enum([
  'GST',
  'PAN',
  'INCOME_TAX',
  'UDYAM',
  'EPFO',
  'ESIC',
  'STARTUP_INDIA',
  'NSIC',
  'OEM_AUTHORIZATION',
  'BLACKLISTING',
  'EXPERIENCE',
  'TECHNICAL_SPECS',
  'EMD',
  'FINANCIAL_STANDING',
]);

export const CreateTenderSchema = z.object({
  tenderId: z.string().min(3, 'Tender ID must be at least 3 characters'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  organization: z.string().min(2, 'Organization required'),
  department: z.string().min(2, 'Department required'),
  category: z.string().default('Goods & Services'),
  estimatedValue: z.number().positive('Estimated value must be positive'),
  emdAmount: z.number().nonnegative('EMD amount must be non-negative'),
  closingDate: z.string().min(10, 'Closing date required'),
  minExperienceYears: z.number().int().nonnegative().default(3),
  minAnnualTurnover: z.number().nonnegative().default(10.0),
  startupExemptionAllowed: z.boolean().default(true),
  msmeExemptionAllowed: z.boolean().default(true),
  requirements: z.array(
    z.object({
      requirementCode: RequirementCodeSchema,
      requirementName: z.string().min(2),
      isRequired: z.boolean().default(true),
      weight: z.number().min(1).max(100).default(20),
      minThreshold: z.number().optional(),
    })
  ).optional(),
});

export const CreateBidSchema = z.object({
  tenderId: z.string().min(1, 'Tender ID is required'),
  bidderLegalName: z.string().min(2, 'Legal name is required'),
  tradeName: z.string().optional(),
  gstin: z.string().length(15, 'GSTIN must be exactly 15 characters').regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format'),
  pan: z.string().length(10, 'PAN must be exactly 10 characters').regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
  udyamNumber: z.string().optional(),
  startupDpiitNumber: z.string().optional(),
  businessType: z.enum(['PRIVATE_LIMITED', 'PUBLIC_LIMITED', 'PARTNERSHIP', 'PROPRIETORSHIP', 'LLP']).default('PRIVATE_LIMITED'),
  registeredAddress: z.string().min(5, 'Address is required'),
  state: z.string().min(2, 'State is required'),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().min(10, 'Phone must be at least 10 digits'),
  financialQuote: z.number().positive('Financial quote must be greater than 0'),
  isStartupExemptionClaimed: z.boolean().default(false),
  isMsmeExemptionClaimed: z.boolean().default(false),
});

export const OfficerDecisionSchema = z.object({
  decision: z.enum(['ACCEPT', 'REJECT', 'CLARIFICATION_REQUESTED']),
  justification: z.string().min(10, 'A detailed statutory justification is required (min 10 characters)'),
  discrepanciesNoted: z.array(z.string()).optional(),
  clarificationDeadline: z.string().optional(),
});

export const EvidenceSearchSchema = z.object({
  bidId: z.string().min(1, 'Bid ID required'),
  query: z.string().min(2, 'Search query required'),
  topK: z.number().int().min(1).max(20).default(3),
  requirementCode: RequirementCodeSchema.optional(),
});

export const AdapterTestSchema = z.object({
  requirementCode: RequirementCodeSchema.default('GST'),
  bidId: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  legalName: z.string().optional(),
  data: z.record(z.string(), z.any()).optional(),
});

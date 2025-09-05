import { z } from 'zod';

// Company creation schema
export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  slug: z.string().min(1, 'Company slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  website: z.string().url('Invalid website URL').optional(),
  licenseNumber: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().default('US'),
  }).optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  subscription: z.enum(['basic', 'pro', 'enterprise']).default('basic'),
});

// Company update schema
export const updateCompanySchema = createCompanySchema.partial().omit({ slug: true });

// Company response schema
export const companyResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable(),
  website: z.string().nullable(),
  licenseNumber: z.string().nullable(),
  address: z.record(z.string(), z.any()).nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  subscription: z.enum(['basic', 'pro', 'enterprise']),
  subscriptionExpiresAt: z.union([z.string(), z.date()]).transform((val) => 
    val instanceof Date ? val.toISOString() : val
  ).nullable(),
  isActive: z.boolean(),
  settings: z.record(z.string(), z.any()),
  createdAt: z.union([z.string(), z.date()]).transform((val) => 
    val instanceof Date ? val.toISOString() : val
  ),
  updatedAt: z.union([z.string(), z.date()]).transform((val) => 
    val instanceof Date ? val.toISOString() : val
  ),
});

// User-Company relationship schema
export const createUserCompanySchema = z.object({
  userId: z.string().uuid(),
  companyId: z.string().uuid(),
  role: z.enum(['owner', 'admin', 'employee']).default('employee'),
  permissions: z.array(z.string()).default([]),
});

export const updateUserCompanySchema = z.object({
  role: z.enum(['owner', 'admin', 'employee']).optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const userCompanyResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  companyId: z.string().uuid(),
  role: z.enum(['owner', 'admin', 'employee']),
  permissions: z.array(z.string()),
  isActive: z.boolean(),
  joinedAt: z.union([z.string(), z.date()]).transform((val) => 
    val instanceof Date ? val.toISOString() : val
  ),
  company: companyResponseSchema.optional(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    avatar: z.string().nullable(),
  }).optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CompanyResponse = z.infer<typeof companyResponseSchema>;
export type CreateUserCompanyInput = z.infer<typeof createUserCompanySchema>;
export type UpdateUserCompanyInput = z.infer<typeof updateUserCompanySchema>;
export type UserCompanyResponse = z.infer<typeof userCompanyResponseSchema>;
import { z } from 'zod';
import type { CarType, FuelType, TransmissionType } from '@/types/types';

const emailRegex = /^\S+@\S+\.\S+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{10,}$/;
const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
const postalCodeRegex = /^[A-Za-z0-9\s\-]{3,10}$/;

const carTypes = [
  'SEDAN',
  'SUV',
  'HATCHBACK',
  'CONVERTIBLE',
  'COUPE',
  'WAGON',
  'VAN',
  'PICKUP',
  'CABRIO',
  'COMBI',
  'OTHER',
] as const satisfies readonly CarType[];

const transmissionTypes = [
  'MANUAL',
  'AUTOMATIC',
  'SEMI_AUTOMATIC',
  'OTHER',
] as const satisfies readonly TransmissionType[];

const fuelTypes = [
  'PETROL',
  'DIESEL',
  'ELECTRICITY',
] as const satisfies readonly FuelType[];

function trimString(value: unknown) {
  return String(value ?? '').trim();
}

function lowerTrimString(value: unknown) {
  return trimString(value).toLowerCase();
}

const requiredString = z.preprocess(trimString, z.string().min(1));
const positiveNumber = z.coerce.number().finite().positive();

export const localeSchema = z.enum(['bg', 'en']).optional();

export const signupSchema = z
  .object({
    firstName: z.preprocess(trimString, z.string().min(2)),
    lastName: z.preprocess(trimString, z.string().min(2)),
    email: z.preprocess(lowerTrimString, z.string().regex(emailRegex)),
    password: z.string().regex(passwordRegex),
    phone: z.preprocess(trimString, z.string().regex(phoneRegex)),
    address: z.preprocess(trimString, z.string().min(5)),
    city: z.preprocess(trimString, z.string().min(2)),
    country: z.preprocess(trimString, z.string().min(2)),
    postalCode: z.preprocess(trimString, z.string().regex(postalCodeRegex)),
    dateOfBirth: z.preprocess(trimString, z.string().min(1)),
    locale: localeSchema,
  })
  .superRefine((data, ctx) => {
    const birthDate = new Date(data.dateOfBirth);

    if (Number.isNaN(birthDate.getTime()) || birthDate >= new Date()) {
      ctx.addIssue({
        code: 'custom',
        path: ['dateOfBirth'],
        message: 'INVALID_DATE_OF_BIRTH',
      });
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age -= 1;
    }

    if (age < 18) {
      ctx.addIssue({
        code: 'custom',
        path: ['dateOfBirth'],
        message: 'USER_MUST_BE_18',
      });
    }
  });

export const adminCompanyPayloadSchema = z.object({
  name: requiredString,
  email: z.preprocess(lowerTrimString, z.string().regex(emailRegex)),
  maintenancePercent: z.coerce.number().finite().min(0).max(100),
  locale: localeSchema,
});

export const adminCompanyUpdateSchema = adminCompanyPayloadSchema.extend({
  id: z.coerce.number().int().positive(),
});

export const adminIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const companyCarCreateSchema = z.object({
  make: requiredString,
  model: requiredString,
  year: z.coerce.number().int().finite(),
  pricePerDay: positiveNumber,
  power: positiveNumber,
  displacement: positiveNumber,
  carType: z.enum(carTypes),
  transmissionType: z.enum(transmissionTypes),
  fuelType: z.enum(fuelTypes),
  officeId: z.coerce.number().int().positive().nullable().optional(),
  images: z.array(z.string()).default([]),
});

export const companyCarUpdateSchema = z
  .object({
    make: requiredString.optional(),
    model: requiredString.optional(),
    year: z.coerce.number().int().finite().optional(),
    pricePerDay: positiveNumber.optional(),
    power: positiveNumber.optional(),
    displacement: positiveNumber.optional(),
    carType: z.enum(carTypes).optional(),
    transmissionType: z.enum(transmissionTypes).optional(),
    fuelType: z.enum(fuelTypes).optional(),
    officeId: z.coerce.number().int().positive().nullable().optional(),
    images: z.array(z.string()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'NO_UPDATE_FIELDS',
  });

export const createReservationSchema = z.object({
  carId: z.coerce.number().int().positive(),
  startDate: requiredString,
  endDate: requiredString,
  firstName: z.preprocess(trimString, z.string()).optional(),
  lastName: z.preprocess(trimString, z.string()).optional(),
  email: z.preprocess(trimString, z.string()).optional(),
  phone: z.preprocess(trimString, z.string()).optional(),
  paymentMethod: z.enum(['CARD', 'ON_SPOT']).optional(),
  locale: localeSchema,
});

export function getZodErrorCode(error: z.ZodError) {
  return error.issues[0]?.message || 'INVALID_PAYLOAD';
}

export function getCompanyCarZodErrorCode(error: z.ZodError) {
  const issue = error.issues[0];
  const field = issue?.path[0];

  if (issue?.message === 'NO_UPDATE_FIELDS') {
    return 'NO_UPDATE_FIELDS';
  }

  switch (field) {
    case 'make':
    case 'model':
      return 'MISSING_MAKE_OR_MODEL';
    case 'year':
      return 'INVALID_YEAR';
    case 'pricePerDay':
      return 'INVALID_PRICE';
    case 'carType':
      return 'INVALID_CAR_TYPE';
    case 'transmissionType':
      return 'INVALID_TRANSMISSION';
    case 'fuelType':
      return 'INVALID_FUEL_TYPE';
    case 'power':
      return 'INVALID_POWER';
    case 'displacement':
      return 'INVALID_DISPLACEMENT';
    case 'officeId':
      return 'INVALID_OFFICE_ID';
    default:
      return 'INVALID_PAYLOAD';
  }
}

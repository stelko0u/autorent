export interface User {
  id: number;
  email: string;
  password: string;
  name?: string;
  role: 'USER' | 'ADMIN' | 'COMPANY';
  createdAt: Date;
  updatedAt?: Date;
  emailVerified: boolean;
  companyId?: number;
}

export interface Company {
  id: number;
  name?: string;
  email: string;
  maintenancePercent: number;
  ownerId: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  pricePerDay: number;
  ownerId: number;
  images: string[];
  companyId?: number;
  officeId?: number;
  createdAt: Date;
  updatedAt?: Date;
  carType: 'SEDAN' | 'HATCHBACK' | 'SUV' | 'COUPE' | 'CONVERTIBLE' | 'CABRIO' | 'WAGON' | 'VAN' | 'PICKUP' | 'COMBI' | 'OTHER';
  transmissionType: 'MANUAL' | 'AUTOMATIC' | 'SEMI_AUTOMATIC' | 'OTHER';
  fuelType: 'PETROL' | 'DIESEL' | 'ELECTRICITY';
}

export interface Reservation {
  id: number;
  userId: number;
  carId: number;
  startDate: Date;
  endDate: Date;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'RETURNED' | 'CANCELLED';
  createdAt: Date;
}

export interface Review {
  id: number;
  userId: number;
  carId: number;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface Office {
  id: number;
  companyId: number;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface PasswordResetToken {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}
import type { Car } from './types';

export type Role = 'user' | 'company' | 'admin' | null;

export type HomeCar = Pick<
  Car,
  | 'id'
  | 'make'
  | 'model'
  | 'year'
  | 'pricePerDay'
  | 'power'
  | 'carType'
  | 'transmissionType'
  | 'fuelType'
  | 'images'
> & {
  name: string;
  location: string;
  companyName?: string | null;
};

export type SearchFilters = {
  query: string;
  make: string;
  location: string;
  bodyType: string;
  transmission: string;
  fuelType: string;
  minPrice: string;
  maxPrice: string;
  minHorsepower: string;
  maxHorsepower: string;
  yearFrom: string;
  yearTo: string;
  startDate: string;
  endDate: string;
};

import type { HomeCar } from '@/types/home';
import type { CarRow } from '@/lib/repository/car/carBrowseRepository';
import type { CarType, FuelType, TransmissionType } from '@/types/types';

function toSafeNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toSafeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function extractLocation(car: CarRow): string {
  return toSafeString(car.officeName) || toSafeString(car.officeAddress);
}

export function mapCarToHomeCar(car: CarRow): HomeCar {
  const make = toSafeString(car.make);
  const model = toSafeString(car.model);

  return {
    id: toSafeNumber(car.id),
    name: `${make} ${model}`.trim(),
    make,
    model,
    carType: car.carType as CarType | undefined,
    year: toSafeNumber(car.year),
    power: toSafeNumber(car.power),
    transmissionType: car.transmissionType as TransmissionType | undefined,
    fuelType: car.fuelType as FuelType | undefined,
    location: extractLocation(car),
    pricePerDay: toSafeNumber(car.pricePerDay),
    images: car.images ?? [],
    companyName: car.companyName ?? null,
  };
}

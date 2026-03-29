import { CarRepository } from '@/lib/repository/CarRepository';

interface CarSearchFilters {
  make?: string;
  minPrice?: number;
  maxPrice?: number;
  transmission?: string;
  fuelType?: string;
  startDate?: string;
  endDate?: string;
}

export class CarService {
  static async getFilteredCars(filters: CarSearchFilters) {
    const hasOnlyOneDate =
      (filters.startDate && !filters.endDate) ||
      (!filters.startDate && filters.endDate);

    if (hasOnlyOneDate) {
      return CarRepository.findFiltered({
        ...filters,
        startDate: undefined,
        endDate: undefined,
      });
    }

    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new Error('Invalid date');
      }

      if (start > end) {
        throw new Error('Start date > End date');
      }
    }

    return CarRepository.findFiltered(filters);
  }
}

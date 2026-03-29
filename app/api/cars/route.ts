import { NextRequest, NextResponse } from 'next/server';
import { CarService } from '@/lib/services/car/carService';

interface CarSearchFilters {
  make?: string;
  minPrice?: number;
  maxPrice?: number;
  transmission?: string;
  fuelType?: string;
  startDate?: string;
  endDate?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: CarSearchFilters = {
      make: searchParams.get('make') ?? undefined,
      transmission: searchParams.get('transmission') ?? undefined,
      fuelType: searchParams.get('fuelType') ?? undefined,
      startDate: searchParams.get('startDate') ?? undefined,
      endDate: searchParams.get('endDate') ?? undefined,
      minPrice: searchParams.get('minPrice')
        ? Number(searchParams.get('minPrice'))
        : undefined,
      maxPrice: searchParams.get('maxPrice')
        ? Number(searchParams.get('maxPrice'))
        : undefined,
    };

    const cars = await CarService.getFilteredCars(filters);

    return NextResponse.json(cars, { status: 200 });
  } catch (error: unknown) {
    console.error('GET /api/cars error:', error);

    return NextResponse.json(
      { message: 'Failed to load cars' },
      { status: 500 },
    );
  }
}

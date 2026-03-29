import { Office } from '@/types/database';
import type { HomeCar } from '@/types/home';

type CarsBrowseApiResponse = {
  ok: boolean;
  cars?: HomeCar[];
  error?: string;
};

function buildCarsBrowseUrl(startDate?: string, endDate?: string): string {
  const params = new URLSearchParams();

  if (startDate && endDate) {
    params.set('startDate', startDate);
    params.set('endDate', endDate);
  }

  const query = params.toString();

  return query ? `/api/cars?${query}` : '/api/cars';
}

export async function fetchOfficeByCarId(carId: number) {
  try {
    const res = await fetch(`/api/cars/${carId}/office`);

    if (!res.ok) {
      throw new Error('Failed to fetch office details');
    }

    const office = await res.json();

    return {
      id: office.id,
      name: office.name,
      latitude: Number(office.latitude),
      longitude: Number(office.longitude),
      address: office.address,
    } as Office;
  } catch (error) {
    console.error('Error fetching office details by car ID:', error);
    throw error;
  }
}

export async function fetchCarById(carId: number | string) {
  const res = await fetch(`/api/cars/${carId}`, {
    credentials: 'include',
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || 'Failed to load car details');
  }

  return data.car;
}

type CarsApiResponse =
  | {
      ok?: boolean;
      cars?: HomeCar[];
      error?: string;
    }
  | HomeCar[];

export async function fetchCarsByDateRange(
  startDate: string,
  endDate: string,
): Promise<HomeCar[]> {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  const response = await fetch(`/api/cars?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  const data = (await response
    .json()
    .catch(() => null)) as CarsApiResponse | null;

  if (!response.ok || !data) {
    throw new Error('Failed to load available cars');
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.cars)) {
    return data.cars;
  }

  return [];
}

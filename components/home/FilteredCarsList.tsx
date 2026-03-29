'use client';

import { useCarSearch } from '@/providers/CarSearchProvider';
import CarCard from '../vehicles/CarCard';

export default function FilteredCarsList() {
  const { filteredCars, isLoading, errorMessage, dateFilterState } =
    useCarSearch();

  if (dateFilterState === 'incomplete') {
    return (
      <div className="rounded-3xl border border-dashed border-amber-300 bg-amber-50 p-10 text-center">
        <h3 className="text-lg font-semibold text-amber-900">
          Избери начална и крайна дата
        </h3>
        <p className="mt-2 text-sm text-amber-700">
          За да покажем само свободните автомобили за периода.
        </p>
      </div>
    );
  }

  if (dateFilterState === 'invalid') {
    return (
      <div className="rounded-3xl border border-dashed border-red-300 bg-red-50 p-10 text-center">
        <h3 className="text-lg font-semibold text-red-900">Невалиден период</h3>
        <p className="mt-2 text-sm text-red-700">
          Крайната дата трябва да е след началната дата.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Зареждаме свободните автомобили...
        </h3>
        <p className="mt-2 text-sm text-gray-500">Моля, изчакай момент.</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-3xl border border-dashed border-red-300 bg-red-50 p-10 text-center">
        <h3 className="text-lg font-semibold text-red-900">Възникна проблем</h3>
        <p className="mt-2 text-sm text-red-700">{errorMessage}</p>
      </div>
    );
  }

  if (!filteredCars.length) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Няма намерени автомобили
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Опитай да промениш филтрите или избери друг период.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3 z-10">
      {filteredCars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
}

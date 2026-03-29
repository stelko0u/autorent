'use client';

import React, { useMemo, useState } from 'react';
import { useCarSearch } from '@/providers/CarSearchProvider';
import { useTranslation } from '@/providers/LanguageProvider';
import { DateRangePicker } from '@/components/home/DateRangePicker';

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-black"
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-black"
    />
  );
}

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function CarSearchBar() {
  const { t } = useTranslation();
  const {
    filters,
    setFilter,
    resetFilters,
    filteredCars,
    cars,
    uniqueMakes,
    uniqueLocations,
    uniqueBodyTypes,
    uniqueTransmissions,
    uniqueFuelTypes,
    isLoading,
  } = useCarSearch();

  const [expanded, setExpanded] = useState(false);

  const activeFilters = useMemo(() => {
    return Object.values(filters).filter(Boolean).length;
  }, [filters]);

  const todayIsoDate = useMemo(() => getTodayIsoDate(), []);

  return (
    <section className="rounded-[28px] border border-white/60 bg-white/85 p-4 shadow-[0_15px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            {t('searchBar.smartSearch')}
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
            {t('searchBar.findExactCar')}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {isLoading
              ? 'Зареждаме свободните автомобили...'
              : t('searchBar.carsCount', {
                  filtered: filteredCars.length,
                  total: cars.length,
                })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            {expanded ? t('searchBar.hideFilters') : t('searchBar.moreFilters')}
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-2xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {t('searchBar.clear')}{' '}
            {activeFilters > 0 ? `(${activeFilters})` : ''}
          </button>
        </div>
      </div>

      <div className="mb-5">
        <DateRangePicker
          startDate={filters.startDate}
          endDate={filters.endDate}
          onChangeStartDate={(value) => setFilter('startDate', value)}
          onChangeEndDate={(value) => setFilter('endDate', value)}
          minDate={todayIsoDate}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <Label>{t('searchBar.query')}</Label>
          <Input
            type="text"
            placeholder={t('searchBar.queryPlaceholder')}
            value={filters.query}
            onChange={(event) => setFilter('query', event.target.value)}
          />
        </div>

        <div>
          <Label>{t('searchBar.make')}</Label>
          <Select
            value={filters.make}
            onChange={(event) => setFilter('make', event.target.value)}
          >
            <option value="">{t('searchBar.allMakes')}</option>
            {uniqueMakes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>{t('searchBar.location')}</Label>
          <Select
            value={filters.location}
            onChange={(event) => setFilter('location', event.target.value)}
          >
            <option value="">{t('searchBar.allLocations')}</option>
            {uniqueLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>{t('searchBar.bodyType')}</Label>
          <Select
            value={filters.bodyType}
            onChange={(event) => setFilter('bodyType', event.target.value)}
          >
            <option value="">{t('common.all')}</option>
            {uniqueBodyTypes.map((bodyType) => (
              <option key={bodyType} value={bodyType}>
                {bodyType}
              </option>
            ))}
          </Select>
        </div>

        {expanded && (
          <>
            <div>
              <Label>{t('searchBar.transmission')}</Label>
              <Select
                value={filters.transmission}
                onChange={(event) =>
                  setFilter('transmission', event.target.value)
                }
              >
                <option value="">{t('common.all')}</option>
                {uniqueTransmissions.map((transmission) => (
                  <option key={transmission} value={transmission}>
                    {transmission}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>{t('searchBar.fuelType')}</Label>
              <Select
                value={filters.fuelType}
                onChange={(event) => setFilter('fuelType', event.target.value)}
              >
                <option value="">{t('common.all')}</option>
                {uniqueFuelTypes.map((fuelType) => (
                  <option key={fuelType} value={fuelType}>
                    {fuelType}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>{t('searchBar.minPrice')}</Label>
              <Input
                type="number"
                min="0"
                placeholder="50"
                value={filters.minPrice}
                onChange={(event) => setFilter('minPrice', event.target.value)}
              />
            </div>

            <div>
              <Label>{t('searchBar.maxPrice')}</Label>
              <Input
                type="number"
                min="0"
                placeholder="250"
                value={filters.maxPrice}
                onChange={(event) => setFilter('maxPrice', event.target.value)}
              />
            </div>

            <div>
              <Label>{t('searchBar.minHorsepower')}</Label>
              <Input
                type="number"
                min="0"
                placeholder="100"
                value={filters.minHorsepower}
                onChange={(event) =>
                  setFilter('minHorsepower', event.target.value)
                }
              />
            </div>

            <div>
              <Label>{t('searchBar.maxHorsepower')}</Label>
              <Input
                type="number"
                min="0"
                placeholder="500"
                value={filters.maxHorsepower}
                onChange={(event) =>
                  setFilter('maxHorsepower', event.target.value)
                }
              />
            </div>

            <div>
              <Label>{t('searchBar.yearFrom')}</Label>
              <Input
                type="number"
                min="1900"
                placeholder="2018"
                value={filters.yearFrom}
                onChange={(event) => setFilter('yearFrom', event.target.value)}
              />
            </div>

            <div>
              <Label>{t('searchBar.yearTo')}</Label>
              <Input
                type="number"
                min="1900"
                placeholder="2026"
                value={filters.yearTo}
                onChange={(event) => setFilter('yearTo', event.target.value)}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

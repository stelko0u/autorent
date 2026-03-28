'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Car } from '@/types/database';
import EditCarModal from '../modals/EditCarModal';
import DeleteCarModal from '../modals/DeleteCarModal';
import {
  BadgeDollar,
  Car as CarIcon,
  Cars,
  CircleInfo,
  PenCircle,
  CircleTrash,
  Plus,
  Transmission,
  GasPump,
} from '../icons';
import {
  CompanyPanelBadge,
  CompanyPanelCard,
  CompanyPanelEmptyState,
  CompanyPanelInfoCard,
  CompanyPanelMetricCard,
  CompanyPanelPageHeader,
  CompanyPanelSearch,
  CompanyPanelTabs,
  CompanyPanelToolbar,
} from './CompanyPanelUI';
import { deleteCompanyCar } from '@/lib/api/companyApi';

type CarsViewMode = 'grid' | 'list';

interface ManageCarsProps {
  cars: Car[];
  onRefresh?: () => void;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function buildCarTitle(car: Car) {
  return `${car.make} ${car.model}`.trim();
}

function buildCarSubtitle(car: Car) {
  return [car.carType, car.fuelType, car.transmissionType]
    .filter(Boolean)
    .join(' • ');
}

export default function ManageCars({ cars, onRefresh }: ManageCarsProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<CarsViewMode>('grid');
  const [search, setSearch] = useState('');
  const [editCarId, setEditCarId] = useState<number | null>(null);
  const [deleteCarId, setDeleteCarId] = useState<number | null>(null);

  const filteredCars = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return cars;
    }

    return cars.filter((car) =>
      [
        car.make,
        car.model,
        car.year.toString(),
        car.carType,
        car.fuelType,
        car.transmissionType,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [cars, search]);

  const selectedCar = cars.find((car) => car.id === editCarId) ?? null;

  async function confirmDelete() {
    if (!deleteCarId) {
      return;
    }

    try {
      await deleteCompanyCar(deleteCarId);
      toast.success('Car deleted successfully');
      setDeleteCarId(null);
      onRefresh?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete car');
      setDeleteCarId(null);
    }
  }

  function handleEditSuccess() {
    toast.success('Car updated successfully');
    setEditCarId(null);
    onRefresh?.();
  }

  function handleAddCar() {
    router.push('?tab=add-car');
  }

  return (
    <div className="space-y-6">
      <CompanyPanelPageHeader
        eyebrow="Manage cars"
        title="Fleet inventory"
        description="Manage all vehicle listings from a cleaner inventory layout with shared company panel components."
        rightSlot={
          <div className="grid gap-3 sm:grid-cols-2">
            <CompanyPanelInfoCard
              label="Visible cars"
              value={String(filteredCars.length)}
              description="Results after the active search filter."
            />
            <CompanyPanelInfoCard
              label="Layout"
              value={viewMode === 'grid' ? 'Compact grid' : 'Detailed list'}
              description="Switch the inventory presentation instantly."
              tone="success"
            />
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CompanyPanelMetricCard
          title="Total vehicles"
          value={cars.length}
          icon={<Cars className="h-5 w-5 text-indigo-600" />}
          accentClassName="bg-indigo-50"
        />
        <CompanyPanelMetricCard
          title="SUV listings"
          value={cars.filter((car) => car.carType === 'SUV').length}
          icon={<CarIcon className="h-5 w-5 text-blue-600" />}
          accentClassName="bg-blue-50"
        />
        <CompanyPanelMetricCard
          title="Automatic"
          value={
            cars.filter((car) => car.transmissionType === 'AUTOMATIC').length
          }
          icon={<Transmission className="h-5 w-5 text-amber-600" />}
          accentClassName="bg-amber-50"
        />
        <CompanyPanelMetricCard
          title="Avg daily price"
          value={
            cars.length > 0
              ? formatPrice(
                  cars.reduce(
                    (sum, car) => sum + Number(car.pricePerDay || 0),
                    0,
                  ) / cars.length,
                )
              : formatPrice(0)
          }
          icon={<BadgeDollar className="h-5 w-5 text-emerald-600" />}
          accentClassName="bg-emerald-50"
        />
      </section>

      <CompanyPanelCard
        title="Car inventory"
        description="Use the compact grid for browsing or the detailed list for richer management controls."
        rightSlot={
          <button
            type="button"
            onClick={handleAddCar}
            className="inline-flex h-11 items-center rounded-2xl bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add car
          </button>
        }
      >
        <CompanyPanelToolbar
          leftSlot={
            <CompanyPanelTabs<CarsViewMode>
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: 'grid', label: 'Compact grid' },
                { value: 'list', label: 'Detailed list' },
              ]}
            />
          }
          rightSlot={
            <CompanyPanelSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by make, model, year, fuel or transmission"
            />
          }
        />

        {filteredCars.length === 0 ? (
          <CompanyPanelEmptyState
            title="No cars found"
            description="Try another search query or add your first vehicle."
          />
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 px-6 pb-6 sm:px-8 xl:grid-cols-3">
            {filteredCars.map((car) => (
              <article
                key={car.id}
                className="group overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                  {car.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={car.images[0]}
                      alt={buildCarTitle(car)}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      No image available
                    </div>
                  )}

                  <div className="absolute left-4 top-4">
                    <CompanyPanelBadge tone="indigo">
                      {car.year}
                    </CompanyPanelBadge>
                  </div>

                  <div className="absolute right-4 top-4 rounded-full bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white shadow-sm">
                    {formatPrice(car.pricePerDay)}
                    <span className="ml-1 text-white/70">/ day</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {buildCarTitle(car)}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {buildCarSubtitle(car) || 'Professional listing overview'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-gray-50 p-3 text-center">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                        <CarIcon className="h-4 w-4" />
                      </div>
                      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                        Type
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {car.carType}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-3 text-center">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                        <Transmission className="h-4 w-4" />
                      </div>
                      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                        Gearbox
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {car.transmissionType}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-3 text-center">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                        <GasPump className="h-4 w-4" />
                      </div>
                      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                        Fuel
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {car.fuelType}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/car/${car.id}`)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      {/* <Eye className="h-4 w-4" /> */}
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditCarId(car.id)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-amber-600"
                    >
                      <PenCircle className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteCarId(car.id)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      <CircleTrash className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="space-y-4 px-6 pb-6 sm:px-8">
            {filteredCars.map((car) => (
              <article
                key={car.id}
                className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
                  <div className="relative h-64 bg-gray-100 lg:h-full">
                    {car.images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={car.images[0]}
                        alt={buildCarTitle(car)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No image available
                      </div>
                    )}

                    <div className="absolute left-4 top-4">
                      <CompanyPanelBadge tone="indigo">
                        {car.year}
                      </CompanyPanelBadge>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-2xl font-semibold text-gray-900">
                            {buildCarTitle(car)}
                          </h3>
                          <CompanyPanelBadge tone="blue">
                            {car.carType}
                          </CompanyPanelBadge>
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                          {buildCarSubtitle(car) ||
                            'Professional listing overview'}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-gray-900 px-4 py-3 text-white shadow-sm">
                        <p className="text-xs uppercase tracking-[0.14em] text-white/70">
                          Daily price
                        </p>
                        <p className="mt-1 text-xl font-semibold">
                          {formatPrice(car.pricePerDay)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center gap-2 text-gray-500">
                          {/* <Calendar className="h-4 w-4" /> */}
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Year
                          </span>
                        </div>
                        <p className="mt-2 text-base font-semibold text-gray-900">
                          {car.year}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Transmission className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Transmission
                          </span>
                        </div>
                        <p className="mt-2 text-base font-semibold text-gray-900">
                          {car.transmissionType}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center gap-2 text-gray-500">
                          <GasPump className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Fuel
                          </span>
                        </div>
                        <p className="mt-2 text-base font-semibold text-gray-900">
                          {car.fuelType}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center gap-2 text-gray-500">
                          <BadgeDollar className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Price / day
                          </span>
                        </div>
                        <p className="mt-2 text-base font-semibold text-gray-900">
                          {formatPrice(car.pricePerDay)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => router.push(`/car/${car.id}`)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        {/* <Eye className="h-4 w-4" /> */}
                        View details
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditCarId(car.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-amber-600"
                      >
                        <PenCircle className="h-4 w-4" />
                        Edit listing
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteCarId(car.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700"
                      >
                        <CircleTrash className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </CompanyPanelCard>

      {editCarId && selectedCar && (
        <EditCarModal
          car={selectedCar}
          onClose={() => setEditCarId(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {deleteCarId && (
        <DeleteCarModal
          isOpen={!!deleteCarId}
          onRequestClose={() => setDeleteCarId(null)}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteCarId(null)}
        />
      )}
    </div>
  );
}

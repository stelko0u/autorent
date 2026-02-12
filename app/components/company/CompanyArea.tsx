'use client';

import React, { useEffect, useState } from 'react';
import CompanySidebar from './CompanySidebar';
import CompanyDashboard from './CompanyDashboard';
import CompanyReservations from './CompanyReservations';
import CompanyPayments from './CompanyPayments';
import ManageCars from './ManageCars';
import AddCarForm from './AddCarForm';
import CompanyOffices from './CompanyOffices';
import EditCarModal from './EditCarModal';
import DeleteCarModal from './DeleteCarModal';
import { useSearchParams, useRouter } from 'next/navigation';
import { Car, CarFormValues } from '../../types/types';

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  if (!ct.includes('application/json'))
    throw new Error(
      `Expected JSON but got ${ct || 'unknown'} (status ${res.status})`,
    );
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON response');
  }
}

export default function CompanyArea() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState<string>('dashboard');
  const [company, setCompany] = useState<any>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<CarFormValues | null>(null);

  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanyData();
  }, []);

  useEffect(() => {
    if (active === 'manage-cars') {
      loadCars();
    }
  }, [active]);

  useEffect(() => {
    const tab = searchParams?.get('tab') ?? searchParams?.get('section');
    if (tab && typeof tab === 'string') {
      setActive(tab);
    }
  }, [searchParams]);

  async function loadCompanyData() {
    setLoading(true);
    try {
      const meRes = await fetch('/api/company/me', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!meRes.ok) throw new Error(`Auth error (${meRes.status})`);
      const me = await parseJsonSafe(meRes);
      setCompany(me.company);
    } catch (err: any) {
      setError(err.message || 'Loading failed');
    } finally {
      setLoading(false);
    }
  }

  async function loadCars() {
    try {
      const carsRes = await fetch('/api/company/cars', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!carsRes.ok) throw new Error(`Cars load error (${carsRes.status})`);
      const carsJson = await parseJsonSafe(carsRes);
      setCars(Array.isArray(carsJson.cars) ? carsJson.cars : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load cars');
    }
  }

  async function handleCarCreated(car: any) {
    setCars((c) => [car, ...c]);
    await loadCars();
  }

  async function handleDelete(id: number) {
    setDeleteId(id);
    setIsDeleteOpen(true);
  }

  function handleEdit(id: number) {
    const car = cars.find((c) => Number(c.id) === id);
    if (!car) return;
    setEditing({
      id: car.id,
      make: car.make ?? '',
      model: car.model ?? '',
      year: car.year ?? new Date().getFullYear(),
      pricePerDay: car.pricePerDay ?? 0,
      officeId: (car as any).officeId ?? '',
    });
    setIsEditOpen(true);
  }

  function handleDetails(id: number) {
    router.push(`/car/${id}`);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/company/cars?id=${deleteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Delete failed (${res.status}) ${txt}`);
      }
      setCars((c) => c.filter((x) => Number(x.id) !== deleteId));
      setIsDeleteOpen(false);
      setDeleteId(null);
    } catch (err: any) {
      setError(err?.message ?? 'Delete failed');
    } finally {
      setLoading(false);
    }
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setFormError(null);
    setFormBusy(true);
    try {
      const payload = {
        id: editing.id,
        make: editing.make,
        model: editing.model,
        year: Number(editing.year),
        pricePerDay: Number(editing.pricePerDay),
        officeId: editing.officeId === '' ? null : editing.officeId,
      };
      const res = await fetch('/api/company/cars', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {}
      if (!res.ok) {
        throw new Error(
          (json && json.error) || text || `Update failed (${res.status})`,
        );
      }
      const updated = json?.car ?? json;
      setCars((list) =>
        list.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
      );
      setIsEditOpen(false);
      setEditing(null);
      await loadCars();
    } catch (err: any) {
      setFormError(err?.message ?? 'Update failed');
    } finally {
      setFormBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CompanySidebar
              company={company}
              activeTab={active}
              onTabChange={setActive}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {active === 'dashboard' && <CompanyDashboard />}
            {active === 'reservations' && <CompanyReservations />}
            {active === 'payments' && <CompanyPayments />}
            {active === 'manage-cars' && (
              <ManageCars
                cars={cars}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDetails={handleDetails}
              />
            )}
            {active === 'add-car' && (
              <AddCarForm onCreated={handleCarCreated} />
            )}
            {active === 'offices' && company && (
              <CompanyOffices companyId={company.id} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isDeleteOpen && (
        <DeleteCarModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setDeleteId(null);
          }}
          onConfirm={confirmDelete}
        />
      )}

      {isEditOpen && editing && (
        <EditCarModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditing(null);
          }}
          editing={editing}
          onChange={setEditing}
          onSubmit={submitEdit}
          busy={formBusy}
          error={formError}
        />
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState, ReactNode, startTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import AdminCompanies from './AdminCompanies';
import AdminAddCompany from './AdminAddCompany';
import AdminCars from './AdminCars';
import AdminUsersPage from './AdminManageUsers';
import { AdminAuditPageClient } from '../audit/AdminAuditPageClient';

type AdminShellProps = {
  me: { name?: string; email?: string; role?: string; id?: number } | null;
  children?: ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  const searchParams = useSearchParams();
  const [active, setActive] = useState<string>('dashboard');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      startTransition(() => setActive(tab));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="flex">
        <AdminSidebar active={active} setActive={setActive} />
        <main className="flex-1 p-6">
          <header className="mb-6">
            {/* <h1 className="text-2xl font-semibold">
              Admin — {me?.name ?? 'User'}
            </h1>
            <p className="text-sm text-gray-500">Use the sidebar to navigate</p> */}
          </header>

          {children ?? (
            <>
              {active === 'dashboard' && <AdminDashboard />}
              {active === 'companies' && <AdminCompanies />}
              {active === 'add-company' && <AdminAddCompany />}
              {active === 'cars' && <AdminCars />}
              {active === 'users' && <AdminUsersPage />}
              {active === 'audit' && <AdminAuditPageClient />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

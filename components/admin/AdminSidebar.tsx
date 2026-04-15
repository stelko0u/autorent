'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building, Cars, ChartLine, Plus, UsersGear } from '../icons';
import { useTranslation } from '@/providers/LanguageProvider';

export default function AdminSidebar({
  active,
  setActive,
}: {
  active: string;
  setActive: (s: string) => void;
}) {
  const router = useRouter();
  const { t } = useTranslation();

  const items = [
    {
      key: 'dashboard',
      label: t('adminSidebar.dashboard'),
      icon: <ChartLine className="w-5 h-5" />,
    },
    {
      key: 'companies',
      label: t('adminSidebar.manageCompanies'),
      icon: <Building className="w-5 h-5" />,
    },
    {
      key: 'add-company',
      label: t('adminSidebar.addCompany'),
      icon: <Plus className="w-5 h-5" />,
    },
    {
      key: 'cars',
      label: t('adminSidebar.manageCars'),
      icon: <Cars className="w-5 h-5" />,
    },
    {
      key: 'users',
      label: t('adminSidebar.manageUsers'),
      icon: <UsersGear className="w-5 h-5" />,
    },
    {
      key: 'audit',
      label: t('adminSidebar.auditLogs'),
      icon: <UsersGear className="w-5 h-5" />,
    }
  ];

  const handleTabChange = (key: string) => {
    setActive(key);
    router.push(`/admin?tab=${key}`);
  };

  return (
    <aside className="w-64 hidden md:flex flex-col bg-white border-r border-gray-200 min-h-screen p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
          AD
        </div>
        <div>
          <h3 className="text-lg font-semibold">{t('adminSidebar.panelTitle')}</h3>
          <p className="text-sm text-gray-500">{t('adminSidebar.panelSubtitle')}</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => handleTabChange(it.key)}
            className={
              'w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 ' +
              (active === it.key ? 'bg-indigo-50 border border-indigo-200' : '')
            }
          >
            <span className="flex items-center gap-3">
              {it.icon}
              {it.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <Link
          href="/"
          className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          {t('adminSidebar.backToSite')}
        </Link>
      </div>
    </aside>
  );
}

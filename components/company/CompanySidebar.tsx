'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeftFromBracket,
  BadgeDollar,
  Building,
  Cars,
  ChartLine,
  Clipboard,
  Plus,
} from '../icons';

type Props = {
  company: { id?: number; name?: string; email?: string } | null;
  activeTab: string;
  onTabChange: React.Dispatch<React.SetStateAction<string>>;
  locked?: boolean;
};

export default function CompanySidebar({ company, locked }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get('tab') || 'dashboard';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <ChartLine className="w-5 h-5" />,
    },
    {
      id: 'reservations',
      label: 'Reservations',
      icon: <Clipboard className="w-5 h-5" />,
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <BadgeDollar className="w-5 h-5" />,
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: <Clipboard className="w-5 h-5" />,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <ChartLine className="w-5 h-5" />,
    },
    {
      id: 'manage-cars',
      label: 'Manage Cars',
      icon: <Cars className="w-5 h-5" />,
    },
    // {
    //   id: 'add-car',
    //   label: 'Add Car',
    //   icon: <Plus className="w-5 h-5" />,
    // },
    {
      id: 'offices',
      label: 'Offices',
      icon: <Building className="w-5 h-5" />,
    },
  ];

  const handleTabChange = (tab: string) => {
    if (locked) {
      return;
    }

    router.push(`?tab=${tab}`);
  };

  return (
    <aside className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-white/10 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/15 shadow-lg backdrop-blur">
            <Building className="h-8 w-8" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Company account
            </p>
            <h3 className="mt-1 truncate text-xl font-semibold">
              {company?.name || 'Company Panel'}
            </h3>
            <p className="mt-1 truncate text-sm text-white/75">
              {company?.email || 'No email available'}
            </p>
          </div>
        </div>
      </div>

      <nav className="p-3">
        {menuItems.map((item) => {
          const isActive = currentTab === item.id && !locked;

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`mb-1.5 flex w-full cursor-pointer hover:bg-gray-100 text-gray-700 hover:pl-0.5 items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200${
                locked
                  ? 'cursor-not-allowed bg-gray-50 text-gray-400 opacity-60'
                  : isActive
                    ? 'bg-linear-to-r from-indigo-100 to-violet-100 text-indigo-700 shadow-sm ring-1 ring-indigo-100 bg-gray-100'
                    : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  locked
                    ? 'bg-gray-100 text-gray-400'
                    : isActive
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <Link
          href="/"
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:pl-0.5 transition-all duration-200"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
            <ArrowLeftFromBracket className="w-5 h-5" />
          </span>
          <span>Back to site</span>
        </Link>
      </div>
    </aside>
  );
}

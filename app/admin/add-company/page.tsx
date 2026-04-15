'use client';

import React, { useState } from 'react';
import { createCompany } from '@/lib/api/companyApi';
import { useTranslation } from '@/providers/LanguageProvider';

export default function AddCompanyPage() {
  const { t } = useTranslation();
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [maintenance, setMaintenance] = useState<number | ''>('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (maintenance === '') {
      setMsg(t('adminAddCompany.maintenanceRequired'));
      return;
    }

    try {
      setLoading(true);
      setMsg(t('adminAddCompany.creating'));

      await createCompany({
        name: companyName,
        email,
        password,
        maintenancePercent: Number(maintenance),
      });

      setMsg(t('adminAddCompany.companyCreated'));
      setCompanyName('');
      setEmail('');
      setPassword('');
      setMaintenance('');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : t('adminAddCompany.failedCreate'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-xl font-semibold mb-4">{t('adminAddCompany.title')}</h2>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm">{t('adminAddCompany.companyName')}</label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            type="text"
            required
            className="w-full border p-2"
          />
        </div>

        <div>
          <label className="block text-sm">{t('adminAddCompany.email')}</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="w-full border p-2"
          />
        </div>

        <div>
          <label className="block text-sm">{t('adminAddCompany.password')}</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="w-full border p-2"
          />
        </div>

        <div>
          <label className="block text-sm">{t('adminAddCompany.maintenancePercent')}</label>
          <input
            value={maintenance}
            onChange={(e) =>
              setMaintenance(
                e.target.value === '' ? '' : Number(e.target.value),
              )
            }
            type="number"
            min={0}
            max={100}
            required
            className="w-full border p-2"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 disabled:opacity-60"
          >
            {loading ? t('adminAddCompany.creating') : t('adminAddCompany.createCompany')}
          </button>
        </div>

        <div className="text-sm text-gray-700">{msg}</div>
      </form>
    </div>
  );
}

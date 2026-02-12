'use client';

import React, { useState } from 'react';

export default function AdminAddCompany() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [maintenancePercent, setMaintenancePercent] = useState<number | ''>(0);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setBusy(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        maintenancePercent:
          maintenancePercent === '' ? 0 : Number(maintenancePercent),
        password: String(password),
      };

      const res = await fetch('/api/admin/companies', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `Failed (${res.status})`);
      }

      setOk('Company and owner user created successfully');
      setName('');
      setEmail('');
      setMaintenancePercent(0);
      setPassword('');

      // Уведомяване на другите компоненти
      window.dispatchEvent(new CustomEvent('company:created'));
    } catch (err: any) {
      setError(err.message || 'Create failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Add Company</h2>
      {error && (
        <div className="mb-3 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {ok && (
        <div className="mb-3 p-3 bg-green-100 text-green-700 rounded">{ok}</div>
      )}
      <form onSubmit={submit} className="max-w-md flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Company Name</label>
          <input
            placeholder="Enter company name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            placeholder="company@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Maintenance Percent (0-100)
          </label>
          <input
            placeholder="0"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={maintenancePercent === '' ? '' : String(maintenancePercent)}
            onChange={(e) =>
              setMaintenancePercent(
                e.target.value === '' ? '' : Number(e.target.value),
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Password for Owner User
          </label>
          <input
            placeholder="Enter password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            minLength={6}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {busy ? 'Creating…' : 'Create Company'}
          </button>
        </div>
      </form>
    </section>
  );
}

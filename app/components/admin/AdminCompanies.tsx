'use client';

import React, { useEffect, useState } from 'react';

type Company = {
  id: number;
  name?: string | null;
  email?: string | null;
  maintenancePercent?: number;
  ownerId?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener('company:created', handler);
    return () => window.removeEventListener('company:created', handler);
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/companies', {
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || `Failed to load (${res.status})`);
      }

      const json = await res.json();
      setCompanies(Array.isArray(json.companies) ? json.companies : []);
    } catch (err: any) {
      console.error('Load companies error:', err);
      setError(err.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(c: Company) {
    setEditingId(c.id);
    setForm({
      name: c.name ?? '',
      email: c.email ?? '',
      maintenancePercent: c.maintenancePercent ?? 0,
    });
  }

  async function saveEdit(id: number) {
    setError(null);
    try {
      const payload = {
        id,
        name: form.name,
        email: form.email,
        maintenancePercent: Number(form.maintenancePercent),
      };
      const res = await fetch('/api/admin/companies', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || `Save failed (${res.status})`);
      }

      await load();
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || 'Save failed');
    }
  }

  async function del(id: number) {
    if (
      !confirm(
        'Are you sure you want to delete this company? This will also delete its owner user and all related data.',
      )
    )
      return;
    setError(null);
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || `Delete failed (${res.status})`);
      }

      await load();
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Manage Companies</h2>
      {error && (
        <div className="mb-3 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {loading ? (
        <div className="text-gray-600">Loading companies…</div>
      ) : companies.length === 0 ? (
        <div className="text-gray-600">No companies found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="px-4 py-3 border-b font-medium">ID</th>
                <th className="px-4 py-3 border-b font-medium">Name</th>
                <th className="px-4 py-3 border-b font-medium">Email</th>
                <th className="px-4 py-3 border-b font-medium">
                  Maintenance %
                </th>
                <th className="px-4 py-3 border-b font-medium">Owner ID</th>
                <th className="px-4 py-3 border-b font-medium">Created</th>
                <th className="px-4 py-3 border-b font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b">{c.id}</td>
                  <td className="px-4 py-3 border-b">
                    {editingId === c.id ? (
                      <input
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className="px-2 py-1 border rounded w-full"
                      />
                    ) : (
                      c.name || '—'
                    )}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {editingId === c.id ? (
                      <input
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="px-2 py-1 border rounded w-full"
                      />
                    ) : (
                      c.email || '—'
                    )}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {editingId === c.id ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={String(form.maintenancePercent)}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            maintenancePercent: e.target.value,
                          })
                        }
                        className="px-2 py-1 border rounded w-24"
                      />
                    ) : (
                      (c.maintenancePercent ?? 0).toFixed(2) + '%'
                    )}
                  </td>
                  <td className="px-4 py-3 border-b">{c.ownerId ?? '—'}</td>
                  <td className="px-4 py-3 border-b">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {editingId === c.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(c.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(c)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => del(c.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

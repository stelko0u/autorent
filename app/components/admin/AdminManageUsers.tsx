'use client';

import React, { useEffect, useState } from 'react';

type User = {
  id: string | number;
  name?: string;
  email?: string;
  role?: string;
  banned?: boolean;
  bannedAt?: string;
  banReason?: string;
  emailVerified?: boolean;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | string | null>(
    null,
  );

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });

      if (res.status === 403) {
        throw new Error('Unauthorized — admin role required');
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || `Request failed: ${res.status}`);
      }

      const data = await res.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleBan(id: number | string, currentlyBanned: boolean) {
    const action = currentlyBanned ? 'unban' : 'ban';
    let reason = null;

    if (!currentlyBanned) {
      reason = prompt('Enter ban reason (optional):');
      if (reason === null) return; // User cancelled
    }

    setActionLoading(id);
    setError(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, reason }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || `Failed to ${action} user`);
      }

      await load();
    } catch (err: any) {
      setError(err.message || `Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: number | string, userName?: string) {
    if (
      !confirm(
        `Are you sure you want to delete user ${userName || id}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setActionLoading(id);
    setError(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to delete user');
      }

      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="p-6 bg-white min-h-full">
      <h1 className="text-2xl font-semibold mb-4">Manage Users</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {loading && <p>Loading users…</p>}

      {!loading && users && (
        <>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white text-black border border-gray-200">
                <thead className="bg-gray-100">
                  <tr className="text-left">
                    <th className="px-4 py-3 border font-medium">ID</th>
                    <th className="px-4 py-3 border font-medium">Name</th>
                    <th className="px-4 py-3 border font-medium">Email</th>
                    <th className="px-4 py-3 border font-medium">Role</th>
                    <th className="px-4 py-3 border font-medium">Status</th>
                    <th className="px-4 py-3 border font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className={`hover:bg-gray-50 ${u.banned ? 'bg-red-50' : ''}`}
                    >
                      <td className="px-4 py-3 border">{u.id}</td>
                      <td className="px-4 py-3 border">{u.name || '—'}</td>
                      <td className="px-4 py-3 border">
                        {u.email || '—'}
                        {u.emailVerified === false && (
                          <span className="ml-2 text-xs text-yellow-600">
                            (unverified)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 border">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'COMPANY'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {u.role || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 border">
                        {u.banned ? (
                          <div>
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                              BANNED
                            </span>
                            {u.banReason && (
                              <div className="text-xs text-gray-600 mt-1">
                                Reason: {u.banReason}
                              </div>
                            )}
                            {u.bannedAt && (
                              <div className="text-xs text-gray-500">
                                {new Date(u.bannedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 border">
                        <div className="flex gap-2">
                          {u.role !== 'ADMIN' && (
                            <>
                              <button
                                onClick={() =>
                                  handleBan(u.id, u.banned || false)
                                }
                                disabled={actionLoading === u.id}
                                className={`px-3 py-1 rounded text-sm font-medium ${
                                  u.banned
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                                } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                              >
                                {actionLoading === u.id
                                  ? '...'
                                  : u.banned
                                    ? 'Unban'
                                    : 'Ban'}
                              </button>
                              <button
                                onClick={() => handleDelete(u.id, u.name)}
                                disabled={actionLoading === u.id}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                {actionLoading === u.id ? '...' : 'Delete'}
                              </button>
                            </>
                          )}
                          {u.role === 'ADMIN' && (
                            <span className="text-xs text-gray-500 italic">
                              Protected
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No users found.</p>
          )}
        </>
      )}
    </div>
  );
}

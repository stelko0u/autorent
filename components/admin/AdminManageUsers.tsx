'use client';

import React, { useEffect, useState } from 'react';
import UserBanModal from '../modals/UserBanModal';
import UserDeleteModal from '../modals/UserDeleteModal';
import { banUser, deleteUser, fetchUsers, unbanUser } from '@/lib/api/adminApi';
import { useTranslation } from '@/providers/LanguageProvider';

type User = {
  id: string | number;
  name?: string;
  email?: string;
  role?: string;
  banned?: boolean;
  bannedAt?: Date;
  banReason?: string;
  emailVerified?: boolean;
};

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | string | null>(
    null,
  );
  const [showBanModal, setShowBanModal] = useState(false);
  const [banUserId, setBanUserId] = useState<number | string | null>(null);
  const [banReason, setBanReason] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | string | null>(
    null,
  );
  const [deleteUserName, setDeleteUserName] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data.users);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('adminUsers.failedLoad'));
    } finally {
      setLoading(false);
    }
  }

  function openBanModal(id: number | string) {
    setBanUserId(id);
    setBanReason('');
    setShowBanModal(true);
  }

  function closeBanModal() {
    setShowBanModal(false);
    setBanUserId(null);
    setBanReason('');
  }

  function openDeleteModal(id: number | string, userName?: string) {
    setDeleteUserId(id);
    setDeleteUserName(userName || null);
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setDeleteUserId(null);
    setDeleteUserName(null);
  }

  async function confirmDelete() {
    if (deleteUserId === null) return;

    setActionLoading(deleteUserId);
    setError(null);
    setShowDeleteModal(false);

    try {
      await deleteUser(deleteUserId);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('adminUsers.failedDelete'));
    } finally {
      setActionLoading(null);
      setDeleteUserId(null);
      setDeleteUserName(null);
    }
  }

  async function confirmBan() {
    if (banReason.length < 0 || banReason.length > 500) {
      setError(t('adminUsers.invalidBanReason'));
      setActionLoading(null);
      return;
    }
    if (banUserId === null) return;
    setShowBanModal(false);
    setActionLoading(banUserId);
    setError(null);

    try {
      await banUser(banUserId, banReason);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('adminUsers.failedBan'));
    } finally {
      setActionLoading(null);
      setBanUserId(null);
      setBanReason('');
    }
  }

  async function handleUnban(id: number | string) {
    setActionLoading(id);
    setError(null);

    try {
      await unbanUser(id);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('adminUsers.failedUnban'));
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="min-h-full bg-linear-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {t('adminUsers.title')}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {t('adminUsers.description')}
              </p>
          </div>

          {!loading && users && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {t('adminUsers.totalUsers')}
              </p>
              <p className="text-2xl font-semibold text-slate-900">
                {users.length}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">{t('adminUsers.loading')}</p>
          </div>
        )}

        {!loading && users && (
          <>
            {users.length > 0 ? (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-slate-700">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-4">{t('common.id')}</th>
                        <th className="px-6 py-4">{t('common.firstName')}</th>
                        <th className="px-6 py-4">{t('common.email')}</th>
                        <th className="px-6 py-4">{t('adminUsers.role')}</th>
                        <th className="px-6 py-4">{t('adminUsers.status')}</th>
                        <th className="px-6 py-4 text-right">{t('adminUsers.actions')}</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr
                          key={u.id}
                          className={`transition ${
                            u.banned
                              ? 'bg-red-50/40 hover:bg-red-50'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                            #{u.id}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                                {(u.name || u.email || '?')
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">
                                  {u.name || t('adminUsers.unnamedUser')}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {t('adminUsers.userAccount')}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-700">
                              {u.email || '—'}
                            </div>
                            {u.emailVerified === false && (
                              <div className="mt-1 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                {t('adminUsers.unverified')}
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                u.role === 'ADMIN'
                                  ? 'bg-violet-100 text-violet-700'
                                  : u.role === 'COMPANY'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {u.role || '—'}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            {u.banned ? (
                              <div className="space-y-1">
                                <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                   {t('adminUsers.banned')}
                                </span>

                                {u.banReason && (
                                  <p className="max-w-xs text-xs text-slate-600">
                                    <span className="font-medium text-slate-700">
                                      {t('bannedPage.reason')}
                                    </span>{' '}
                                    {u.banReason}
                                  </p>
                                )}

                                {u.bannedAt && (
                                  <p className="text-xs text-slate-400">
                                    {new Date(u.bannedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                 {t('adminUsers.active')}
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              {u.role !== 'ADMIN' ? (
                                <>
                                  <button
                                    onClick={() =>
                                      u.banned
                                        ? handleUnban(u.id)
                                        : openBanModal(u.id)
                                    }
                                    disabled={actionLoading === u.id}
                                    className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition ${
                                      u.banned
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        : 'bg-amber-500 text-white hover:bg-amber-600'
                                    } disabled:cursor-not-allowed disabled:bg-slate-300`}
                                  >
                                      {actionLoading === u.id
                                      ? t('adminUsers.processing')
                                      : u.banned
                                        ? t('adminUsers.unban')
                                        : t('adminUsers.ban')}
                                  </button>

                                  <button
                                    onClick={() =>
                                      openDeleteModal(u.id, u.name)
                                    }
                                    disabled={actionLoading === u.id}
                                    className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                  >
                                    {actionLoading === u.id
                                      ? t('adminUsers.processing')
                                      : t('adminUsers.delete')}
                                  </button>
                                </>
                              ) : (
                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium italic text-slate-500">
                                  {t('adminUsers.protected')}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                <p className="text-lg font-medium text-slate-700">
                  {t('adminUsers.noUsers')}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {t('adminUsers.noUsersDescription')}
                </p>
              </div>
            )}
          </>
        )}

        {showDeleteModal && (
          <UserDeleteModal
            isOpen={showDeleteModal}
            onRequestClose={closeDeleteModal}
            onConfirm={confirmDelete}
            deleteUserName={deleteUserName}
            deleteUserId={deleteUserId}
          />
        )}

        {showBanModal && (
          <UserBanModal
            isOpen={showBanModal}
            onRequestClose={closeBanModal}
            onConfirm={confirmBan}
            banReason={banReason}
            setBanReason={setBanReason}
          />
        )}
      </div>
    </div>
  );
}

'use client';

import { fetchDashboardStats } from '@/lib/api/adminApi';
import React, { useEffect, useState } from 'react';
import { DashboardStats } from '@/types/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch {
      setError('Error loading statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="p-6">
        <div className="text-center py-8">Loading...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="p-6">
        <div className="text-red-600 text-center py-8">{error}</div>
      </section>
    );
  }

  if (!stats) return null;

  return (
    <section className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-6">Statistics Overview</h2>

      {/* General statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Companies</div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalCompanies}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Reservations</div>
          <div className="text-3xl font-bold text-green-600">
            {stats.totalReservations}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Platform Revenue</div>
          <div className="text-3xl font-bold text-purple-600">
            {stats.platformRevenue.toFixed(2)} €
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Monthly: {stats.monthlyPlatformRevenue.toFixed(2)} €
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Company Revenue</div>
          <div className="text-3xl font-bold text-orange-600">
            {stats.totalRevenue.toFixed(2)} €
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Monthly: {stats.monthlyRevenue.toFixed(2)} €
          </div>
        </div>
      </div>

      {/* Companies table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Company Statistics</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reservations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Fee
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {stats.companiesStats.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {company.name}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {company.reservationsCount}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      {company.revenue} €
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-purple-600">
                      {company.platformFee} €
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {company.monthlyRevenue} €
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {company.monthlyPlatformFee} €
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

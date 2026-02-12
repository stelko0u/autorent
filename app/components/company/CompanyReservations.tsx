'use client';

import React, { useEffect, useState } from 'react';

interface Reservation {
  id: number;
  carId: number;
  carMake: string;
  carModel: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
}

export default function CompanyReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const res = await fetch('/api/company/reservations', {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to load reservations');
      }

      const data = await res.json();
      setReservations(data.reservations || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
      case 'RETURNED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReservations = reservations.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter.toUpperCase();
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center text-gray-500">Loading reservations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reservations</h2>
        <p className="text-gray-600 mt-1">
          Manage all your vehicle reservations
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {[
            'all',
            'pending',
            'confirmed',
            'in_progress',
            'completed',
            'cancelled',
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.replace('_', ' ').charAt(0).toUpperCase() +
                tab.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Car
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rental Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No reservations found
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{reservation.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {reservation.carMake} {reservation.carModel}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {reservation.customerName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {reservation.customerEmail}
                      </div>
                      <div className="text-xs text-gray-500">
                        {reservation.customerPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div>
                        {new Date(reservation.startDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        to {new Date(reservation.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${reservation.totalPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div
                        className={`font-medium ${
                          reservation.paymentStatus === 'PAID'
                            ? 'text-green-600'
                            : reservation.paymentStatus === 'PENDING'
                              ? 'text-yellow-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {reservation.paymentStatus}
                      </div>
                      <div className="text-xs text-gray-500">
                        {reservation.paymentMethod === 'CARD'
                          ? 'Online'
                          : 'On-Site'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reservation.status)}`}
                      >
                        {reservation.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

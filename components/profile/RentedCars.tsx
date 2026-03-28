'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getUserReservations,
  type UserReservation,
} from '@/lib/api/reservationApi';
import { Clipboard } from '../icons';

interface RentedCarsProps {
  userId: number;
}

export default function RentedCars({ userId }: RentedCarsProps) {
  const router = useRouter();
  const [reservations, setReservations] = useState<UserReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadReservations() {
      try {
        setLoading(true);
        setError(null);

        const data = await getUserReservations();

        if (!isMounted) {
          return;
        }

        setReservations(data);
      } catch (err: unknown) {
        if (!isMounted) {
          return;
        }

        setError(
          err instanceof Error ? err.message : 'Failed to load reservations',
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadReservations();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  function getStatusColor(status: string) {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-8 shadow">
        <div className="text-center text-gray-500">Loading rentals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-white p-8 shadow">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b p-6">
        <h2 className="text-xl font-semibold text-gray-800">My Rentals</h2>
        <p className="mt-1 text-sm text-gray-600">
          View and manage your car reservations
        </p>
      </div>

      <div className="divide-y">
        {reservations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clipboard className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p>No rentals yet</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
            >
              Browse Cars
            </button>
          </div>
        ) : (
          reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="cursor-pointer p-6 transition hover:bg-gray-50"
              onClick={() => router.push(`/reservation/${reservation.id}`)}
            >
              <div className="flex gap-4">
                {reservation.car?.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={reservation.car.images[0]}
                    alt={`${reservation.car.make} ${reservation.car.model}`}
                    className="h-24 w-32 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-32 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
                    No image
                  </div>
                )}

                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {reservation.car
                          ? `${reservation.car.make} ${reservation.car.model}`
                          : `Car #${reservation.carId}`}
                      </h3>
                      {reservation.car?.year ? (
                        <p className="text-sm text-gray-600">
                          {reservation.car.year}
                        </p>
                      ) : null}
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                        reservation.status,
                      )}`}
                    >
                      {reservation.status}
                    </span>
                  </div>

                  <div className="mb-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Pick-up:</span>{' '}
                      {new Date(reservation.startDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Drop-off:</span>{' '}
                      {new Date(reservation.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-indigo-600">
                      ${reservation.totalPrice}
                    </div>

                    {reservation.paymentStatus ? (
                      <span className="text-sm text-gray-500">
                        Payment: {reservation.paymentStatus}
                        <br />
                        Payment Method: {reservation.paymentMethod ?? '-'}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

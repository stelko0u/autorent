'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ImageSlider from '../../components/vehicles/ImageSlider';

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  pricePerDay: number;
  images: string[];
  carType: string;
  transmissionType: string;
  fuelType: string;
  description?: string;
  seats?: number;
  doors?: number;
  luggage?: number;
  airConditioning?: boolean;
  minDriverAge?: number;
  company?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export default function CarDetailPage() {
  const router = useRouter();
  const params = useParams();
  const carId = params?.id as string;
  console.log(carId)
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!carId) return;

    async function loadCar() {
      try {
        const res = await fetch(`/api/cars/${carId}`);
        if (!res.ok) {
          throw new Error('Failed to load car details');
        }
        const data = await res.json();
        setCar(data.car);
      } catch (err: any) {
        setError(err.message || 'Failed to load car');
      } finally {
        setLoading(false);
      }
    }

    loadCar();
  }, [carId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error || 'Car not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div>
            <ImageSlider
              images={car.images}
              carName={`${car.make} ${car.model}`}
            />
          </div>

          {/* Right Column - Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {car.make} {car.model}
            </h1>
            <p className="text-xl text-gray-600 mb-6">{car.year}</p>

            {/* Price */}
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
              <div className="text-3xl font-bold text-indigo-600">
                ${car.pricePerDay}
                <span className="text-lg font-normal text-gray-600">
                  {' '}
                  / day
                </span>
              </div>
            </div>

            {/* Specifications */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {car.carType || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {car.transmissionType || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {car.seats || 'N/A'} Seats
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {car.fuelType || 'N/A'}
                  </span>
                </div>
                {car.doors && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {car.doors} Doors
                    </span>
                  </div>
                )}
                {car.airConditioning && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">
                      Air Conditioning
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {car.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {car.description}
                </p>
              </div>
            )}

            {/* Company Info */}
            {car.company && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Rental Company
                </h3>
                <p className="text-gray-900">{car.company.name}</p>
              </div>
            )}

            {/* Reserve Button */}
            <button
              onClick={() => router.push(`/payment/${car.id}`)}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              Reserve Now
            </button>

            {car.minDriverAge && (
              <p className="mt-4 text-sm text-gray-500 text-center">
                Minimum driver age: {car.minDriverAge} years
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

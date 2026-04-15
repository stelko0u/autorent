'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getFavoriteCars,
  removeFavoriteCar,
  type FavoriteCar,
} from '@/lib/api/userApi';
import { FullHeart, Heart } from '../icons';
import { useTranslation } from '@/providers/LanguageProvider';

interface Props {
  userId: number;
}

export default function LikedCars({ userId }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [cars, setCars] = useState<FavoriteCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadFavorites = async () => {
      try {
        setLoading(true);
        setError(null);

        const favorites = await getFavoriteCars();

        if (!isActive) return;
        setCars(favorites);
      } catch (err) {
        if (!isActive) return;

        const message =
          err instanceof Error ? err.message : t('likedCars.failedToLoad');

        setError(message);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadFavorites();

    return () => {
      isActive = false;
    };
  }, [userId, t]);

  const handleRemoveFavorite = async (carId: number) => {
    if (removingId === carId) return;

    try {
      setRemovingId(carId);
      await removeFavoriteCar(carId);
      setCars((prev) => prev.filter((car) => car.id !== carId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-8 shadow">
        <div className="text-center text-gray-500">{t('likedCars.loading')}</div>
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
        <h2 className="text-xl font-semibold text-gray-800">{t('likedCars.title')}</h2>
        <p className="mt-1 text-sm text-gray-600">
          {t('likedCars.subtitle')}
        </p>
      </div>

      <div className="p-6">
        {cars.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Heart className="mx-auto mb-4 h-10 w-10 text-gray-400" />

            <p>{t('likedCars.noLikedCars')}</p>
            <p className="mt-2 text-sm">{t('likedCars.browseAndSave')}</p>

            <button
              onClick={() => router.push('/')}
              className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
            >
              {t('likedCars.browseCars')}
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {cars.map((car) => (
              <div
                key={car.id}
                className="group overflow-hidden rounded-lg border transition hover:shadow-lg"
              >
                <div className="relative">
                  {car.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={car.images[0]}
                      alt={`${car.make} ${car.model}`}
                      className="h-48 w-full cursor-pointer object-cover"
                      onClick={() => router.push(`/car/${car.id}`)}
                    />
                  )}

                  <button
                    onClick={() => handleRemoveFavorite(car.id)}
                    disabled={removingId === car.id}
                    className="absolute right-3 top-3 rounded-full  p-2 shadow-lg  bg-red-500 hover:bg-red-700 hover:scale-105 transition-all cursor-pointer hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    title={t('likedCars.removeFromFavorites')}
                    type="button"
                  >
                    <FullHeart className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4">
                  <h3
                    className="mb-1 cursor-pointer text-lg font-semibold text-gray-900 hover:text-indigo-600"
                    onClick={() => router.push(`/car/${car.id}`)}
                  >
                    {car.make} {car.model}
                  </h3>

                  <p className="mb-3 text-sm text-gray-600">{car.year}</p>

                  <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
                    <span>{car.carType}</span>
                    <span>•</span>
                    <span>{car.transmissionType}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-indigo-600">
                      ${car.pricePerDay}
                      <span className="text-sm font-normal text-gray-600">
                        {t('likedCars.perDay')}
                      </span>
                    </div>

                    <button
                      onClick={() => router.push(`/reservation/${car.id}`)}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white transition hover:bg-indigo-700"
                      type="button"
                    >
                      {t('likedCars.rentNow')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserReviews, type UserReview } from '@/lib/api/userApi';
import { EmptyStar, FullStar } from '../icons';

interface Props {
  userId: number;
}

export default function UserReviews({ userId }: Props) {
  const router = useRouter();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getUserReviews();

        if (!isActive) return;
        setReviews(data);
      } catch (err) {
        if (!isActive) return;

        const message =
          err instanceof Error ? err.message : 'Failed to load reviews';

        setError(message);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadReviews();

    return () => {
      isActive = false;
    };
  }, [userId]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FullStar
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-8 shadow">
        <div className="text-center text-gray-500">Loading reviews...</div>
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
        <h2 className="text-xl font-semibold text-gray-800">My Reviews</h2>
        <p className="mt-1 text-sm text-gray-600">
          Reviews you&apos;ve written for rented cars
        </p>
      </div>

      <div className="divide-y">
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <EmptyStar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p>No reviews yet</p>
            <p className="mt-2 text-sm">
              Rent a car and share your experience!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-6 transition hover:bg-gray-50">
              <div className="flex gap-4">
                {review.car?.images?.[0] && (
                  <img
                    src={review.car.images[0]}
                    alt={`${review.car.make} ${review.car.model}`}
                    className="h-20 w-24 cursor-pointer rounded-lg object-cover"
                    onClick={() => router.push(`/car/${review.carId}`)}
                  />
                )}

                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3
                        className="cursor-pointer font-semibold text-gray-900 hover:text-indigo-600"
                        onClick={() => router.push(`/car/${review.carId}`)}
                      >
                        {review.car?.make} {review.car?.model}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {renderStars(review.rating)}
                  </div>

                  {review.comment && (
                    <p className="mt-2 text-sm text-gray-700">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

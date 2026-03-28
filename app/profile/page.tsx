'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileSettings from '../../components/profile/ProfileSettings';
import RentedCars from '../../components/profile/RentedCars';
import UserReviews from '../../components/profile/UserReviews';
import LikedCars from '../../components/profile/LikedCars';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import { getLoggedInUser } from '@/lib/api/userApi';

interface User {
  id: number;
  email: string;
  name?: string;
  role: string;
}

type TabType = 'profile' | 'rentals' | 'reviews' | 'favorites';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const loadUser = useCallback(async () => {
    try {
      const data = await getLoggedInUser();
      setUser(data.user);
    } catch {
      router.push('/signin');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-gray-600">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <ProfileSidebar
              user={user}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <ProfileSettings user={user} onUpdate={loadUser} />
            )}
            {activeTab === 'rentals' && <RentedCars userId={user.id} />}
            {activeTab === 'reviews' && <UserReviews userId={user.id} />}
            {activeTab === 'favorites' && <LikedCars userId={user.id} />}
          </div>
        </div>
      </div>
    </div>
  );
}

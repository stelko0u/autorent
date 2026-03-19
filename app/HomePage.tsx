'use client';

import React, { useMemo, useState } from 'react';
import Sidebar from '../components/layouts/Sidebar';
import MobileTopBar from '../components/layouts/MobileTopBar';
import Hero from '../components/Hero/Hero';
import FeaturedGrid from '../components/Featured/Featured';

type Role = 'user' | 'company' | 'admin' | null;

type Car = {
  id: number;
  name: string;
  type: string;
  pricePerDay: number;
  img: string;
  companyName?: string | null;
};

type Props = {
  isLoggedIn: boolean;
  role: Role;
  initialCars: Car[];
};

export default function HomePageClient({
  isLoggedIn,
  role,
  initialCars,
}: Props) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('home');

  const filtered = useMemo(() => {
    return initialCars.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.type.toLowerCase().includes(query.toLowerCase()),
    );
  }, [initialCars, query]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="flex">
        <Sidebar
          active={active}
          setActive={setActive}
          isLoggedIn={isLoggedIn}
          role={role}
        />

        <main className="flex-1 p-6">
          <MobileTopBar
            active={active}
            setActive={setActive}
            isLoggedIn={isLoggedIn}
          />

          <Hero query={query} setQuery={setQuery} setActive={setActive} />

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Featured cars</h2>
              <p className="text-sm text-gray-500">{filtered.length} results</p>
            </div>

            <FeaturedGrid cars={filtered} />
          </section>
        </main>
      </div>
    </div>
  );
}

import { cookies } from 'next/headers';
import HomePageClient from './HomePage';

type Role = 'user' | 'company' | 'admin' | null;

type Car = {
  id: number;
  name: string;
  type: string;
  pricePerDay: number;
  img: string;
  companyName?: string | null;
};

function normalizeRole(rawRole: unknown): Role {
  if (typeof rawRole !== 'string') return null;

  const rl = rawRole.toLowerCase().trim();

  if (rl === 'user' || rl === 'company' || rl === 'admin') {
    return rl;
  }

  if (rl === 'manager') {
    return 'company';
  }

  return null;
}

async function getAuth() {
  const cookieStore = await cookies();

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Cookie: cookieStore.toString(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    return {
      isLoggedIn: false,
      role: null as Role,
    };
  }

  const data = await res.json();

  const logged =
    Boolean(data?.ok) ||
    Boolean(data?.authenticated) ||
    Boolean(data?.success) ||
    Boolean(data?.user) ||
    false;

  const rawRole =
    data?.role ??
    data?.user?.role ??
    data?.data?.role ??
    data?.user?.profile?.role ??
    data?.user?.type ??
    null;

  return {
    isLoggedIn: logged,
    role: normalizeRole(rawRole),
  };
}

async function getCars(): Promise<Car[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cars`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return [];
  }

  const json = await res.json();
  const list = Array.isArray(json.cars) ? json.cars : [];

  return list.map((c: any) => ({
    id: c.id,
    name: `${c.make} ${c.model}`,
    type: String(c.year ?? ''),
    pricePerDay: Number(c.pricePerDay ?? 0),
    img: Array.isArray(c.images) && c.images.length ? c.images[0] : '',
    companyName: c.company?.name ?? null,
  }));
}

export default async function HomePage() {
  const [{ isLoggedIn, role }, cars] = await Promise.all([
    getAuth(),
    getCars(),
  ]);

  return (
    <HomePageClient isLoggedIn={isLoggedIn} role={role} initialCars={cars} />
  );
}

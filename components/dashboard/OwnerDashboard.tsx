import React, { useEffect, useState } from 'react';
// Mock functions for build - replace with actual API calls
const getOwnerVehicles = async () => [];
const getOwnerStatistics = async () => ({ totalVehicles: 0, totalReservations: 0 });
import VehicleCard from '../vehicles/CarCard';
import Button from '../ui/Button';
import type { HomeCar } from '@/types/home';
import { useTranslation } from '@/providers/LanguageProvider';

const OwnerDashboard = () => {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState<HomeCar[]>([]);
  const [statistics, setStatistics] = useState({ totalVehicles: 0, totalReservations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vehiclesData = await getOwnerVehicles();
        const statsData = await getOwnerStatistics();
        setVehicles(vehiclesData);
        setStatistics(statsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t('ownerDashboard.title')}</h1>
      {statistics && (
        <div className="mb-4">
          <h2 className="text-xl">{t('ownerDashboard.statistics')}</h2>
          <p>{t('ownerDashboard.totalVehicles')}: {statistics.totalVehicles}</p>
          <p>{t('ownerDashboard.totalReservations')}: {statistics.totalReservations}</p>
        </div>
      )}
      <h2 className="text-xl mb-2">{t('ownerDashboard.yourVehicles')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} car={vehicle} />
        ))}
      </div>
      <Button className="mt-4">{t('ownerDashboard.addVehicle')}</Button>
    </div>
  );
};

export default OwnerDashboard;

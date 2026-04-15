import React from 'react';
import ReservationList from '../reservations/ReservationList';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/providers/LanguageProvider';

const UserDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) {
    return <div>{t('userDashboard.loginRequired')}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {t('userDashboard.welcome', { name: user.name || t('profileSidebar.userFallback') })}
      </h1>
      <h2 className="text-xl mb-2">{t('rentals.title')}</h2>
      <ReservationList />
    </div>
  );
};

export default UserDashboard;

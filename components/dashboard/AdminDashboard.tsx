import React from 'react';
import { useTranslation } from '@/providers/LanguageProvider';

const AdminDashboard: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{t('adminDashboardLegacy.title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="font-semibold">{t('adminDashboardLegacy.totalRentals')}</h2>
                    <p className="text-xl">150</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="font-semibold">{t('adminDashboardLegacy.totalRevenue')}</h2>
                    <p className="text-xl">$12,000</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="font-semibold">{t('adminDashboardLegacy.activeUsers')}</h2>
                    <p className="text-xl">300</p>
                </div>
            </div>
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">{t('adminDashboardLegacy.recentReservations')}</h2>
            </div>
        </div>
    );
};

export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/providers/LanguageProvider';
// import { Reservation } from '../../types';
// import { fetchReservations } from '../../lib/api';

type Reservation = {
  id: number;
  userId: number;
  carId: number;
  startDate: string;
  endDate: string;
  status: string;
};

const ReservationList: React.FC = () => {
  const { t, locale } = useTranslation();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
        const loadReservations = async () => {
            try {
                // Mock data for now
                const mockData: Reservation[] = [
                    {
                        id: 1,
                        userId: 1,
                        carId: 1,
                        startDate: '2024-01-15',
                        endDate: '2024-01-20',
                        status: 'CONFIRMED'
                    }
                ];
                setReservations(mockData);
            } catch {
                setError(t('rentals.failedToLoad'));
            } finally {
                setLoading(false);
            }
        };

        loadReservations();
    }, []);

    if (loading) {
        return <div>{t('common.loading')}</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="reservation-list">
            <h2 className="text-xl font-bold mb-4">{t('rentals.title')}</h2>
            <ul>
                {reservations.map((reservation) => (
                    <li key={reservation.id} className="border p-4 mb-2 rounded">
<h3 className="font-semibold">{t('paymentPage.reservationId')}: {reservation.carId}</h3>
                        <p>{t('paymentPage.startDate')}: {new Date(reservation.startDate).toLocaleDateString(locale === 'bg' ? 'bg-BG' : 'en-US')}</p>
                        <p>{t('paymentPage.endDate')}: {new Date(reservation.endDate).toLocaleDateString(locale === 'bg' ? 'bg-BG' : 'en-US')}</p>
                        <p>{t('paymentPage.status')}: {reservation.status}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ReservationList;

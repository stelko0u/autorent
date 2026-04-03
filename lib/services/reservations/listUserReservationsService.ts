import { ReservationRepository } from '@/lib/repository/ReservationRepository';

export async function listUserReservations(userId: number) {
  const reservations = await ReservationRepository.findByUser(userId);

  return {
    ok: true,
    reservations,
  };
}

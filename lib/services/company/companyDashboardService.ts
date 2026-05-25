import { CompanyRepository } from '@/lib/repository/CompanyRepository';
import { CarRepository } from '@/lib/repository/CarRepository';
import { PaymentsRepository } from '@/lib/repository/PaymentsRepository';
import { ReservationRepository } from '@/lib/repository/ReservationRepository';
import type { Company } from '@/types/database';

type DashboardReservation = {
  id: number;
  status: string;
  paymentStatus?: string;
  totalPrice?: number | string;
  carMake?: string;
  carModel?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  userEmail?: string;
};

type DashboardUser = {
  role: 'COMPANY' | 'ADMIN' | 'USER';
  companyId?: number | null;
};

export async function getCompanyDashboardData(user: DashboardUser) {
  if (!user.companyId) {
    throw new Error('COMPANY_NOT_FOUND');
  }

  const company = await CompanyRepository.findById(user.companyId);

  if (!company) {
    throw new Error('COMPANY_NOT_FOUND');
  }

  const [reservationStats, recentReservationsData, totalCars] = await Promise.all([
    ReservationRepository.getCompanyDashboardStats(company.id),
    ReservationRepository.getCompanyRecentReservations(company.id, 10),
    CarRepository.countByCompany(company.id),
  ]);

  const maintenancePercent = Number(company.maintenancePercent || 0);

  const money = await getCompanyMoneyStats(
    company,
    maintenancePercent,
  );

  const recentReservations = (recentReservationsData as DashboardReservation[]).map((r) => ({
    id: r.id,
    carMake: r.carMake,
    carModel: r.carModel,
    startDate: r.startDate,
    endDate: r.endDate,
    totalPrice: parseFloat(String(r.totalPrice ?? 0)),
    status: r.status,
    paymentStatus: r.paymentStatus || 'PENDING',
    customerName:
      r.userName ||
      `${r.firstName || ''} ${r.lastName || ''}`.trim() ||
      r.userEmail ||
      'Unknown',
  }));

  return {
    stats: {
      totalRevenue: money.totalRevenue,
      platformFee: money.platformFee,
      companyEarnings: money.companyEarnings,
      totalReservations: reservationStats.totalReservations,
      pendingReservations: reservationStats.pendingReservations,
      completedReservations: reservationStats.completedReservations,
      totalCars,
      maintenancePercent,
      balanceAvailable: money.balanceAvailable,
      balancePending: money.balancePending,
      moneySource: money.moneySource,
    },
    recentReservations,
  };
}

async function getCompanyMoneyStats(
  company: Company,
  maintenancePercent: number,
) {
  const payments = await PaymentsRepository.findByCompany(company.id);

  const paidPayments = payments.filter(
    (payment) => String(payment.paymentStatus).toUpperCase() === 'PAID',
  );
  const pendingPayments = payments.filter(
    (payment) => String(payment.paymentStatus).toUpperCase() === 'PENDING',
  );

  const totalRevenue = Number(
    paidPayments
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
      .toFixed(2),
  );
  let platformFee = Number(
    paidPayments
      .reduce((sum, payment) => sum + Number(payment.platformFee || 0), 0)
      .toFixed(2),
  );
  let companyEarnings = Number(
    paidPayments
      .reduce((sum, payment) => sum + Number(payment.companyEarnings || 0), 0)
      .toFixed(2),
  );

  if (totalRevenue > 0 && platformFee === 0 && companyEarnings === 0) {
    platformFee = Number(((totalRevenue * maintenancePercent) / 100).toFixed(2));
    companyEarnings = Number((totalRevenue - platformFee).toFixed(2));
  }

  const balancePending = Number(
    pendingPayments
      .reduce((sum, payment) => sum + Number(payment.companyEarnings || 0), 0)
      .toFixed(2),
  );

  return {
    moneySource: 'database' as const,
    totalRevenue,
    platformFee,
    companyEarnings,
    balanceAvailable: companyEarnings,
    balancePending,
  };
}

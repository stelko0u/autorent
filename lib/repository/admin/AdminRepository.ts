import { query } from '@/lib/db';

export type AdminUserRoleRow = {
  role: string;
};

export type AdminCompanyRow = {
  id: number;
  name: string;
  maintenance_percent: string | number | null;
};

export type AdminReservationRow = {
  id: number;
  total_price: string | number | null;
  status: string;
  created_at: string | Date;
  company_id: number;
  company_name: string;
  maintenance_percent: string | number | null;
};

export type AdminPaymentRow = {
  id: number;
  company_id: number;
  total_price: string | number | null;
  platform_fee: string | number | null;
  company_earnings: string | number | null;
  paid_at: string | Date | null;
  created_at: string | Date;
};

export type AdminReservationListFilters = {
  companyId?: number;
  dateFrom?: Date;
  dateToExclusive?: Date;
};

export type AdminReservationListRow = {
  id: number;
  company_id: number;
  company_name: string;
  car_id: number;
  car_make: string;
  car_model: string;
  car_year: number | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  start_date: string | Date;
  end_date: string | Date;
  total_price: string | number | null;
  status: string;
  payment_status: string | null;
  payment_method: string | null;
  created_at: string | Date;
};

export async function getAdminUserRoleById(
  userId: number,
): Promise<AdminUserRoleRow[]> {
  return query(`SELECT role FROM "User" WHERE id = $1`, [userId]);
}

export async function getAdminDashboardCompanies(): Promise<AdminCompanyRow[]> {
  return query(`
    SELECT 
      id,
      name,
      "maintenancePercent" as maintenance_percent
    FROM "Company"
    ORDER BY name
  `);
}

export async function getAdminDashboardReservations(): Promise<
  AdminReservationRow[]
> {
  return query(`
    SELECT 
      r.id,
      r."totalPrice" as total_price,
      r.status,
      r."createdAt" as created_at,
      car."companyId" as company_id,
      c.name as company_name,
      c."maintenancePercent" as maintenance_percent
    FROM "Reservation" r
    JOIN "Car" car ON r."carId" = car.id
    JOIN "Company" c ON car."companyId" = c.id
    WHERE r.status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'RETURNED')
    ORDER BY r."createdAt" DESC
  `);
}

export async function getAdminDashboardPayments(): Promise<AdminPaymentRow[]> {
  return query(`
    SELECT
      p.id,
      p."companyId" as company_id,
      p."totalPrice" as total_price,
      p."platformFee" as platform_fee,
      p."companyEarnings" as company_earnings,
      p."paidAt" as paid_at,
      p."createdAt" as created_at
    FROM "Payments" p
    WHERE p."paymentStatus" = 'PAID'
    ORDER BY COALESCE(p."paidAt", p."createdAt") DESC
  `);
}



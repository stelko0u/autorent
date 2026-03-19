import { redirect } from 'next/navigation';
import AdminShell from '../../../components/admin/AdminShell';
import AdminCompanies from '../../../components/admin/AdminCompanies';
import { getAuthUser } from '@/lib/auth';

export default async function ManageCompaniesPage() {
  const authUser = await getAuthUser();

  if (!authUser || authUser.role?.toUpperCase() !== 'ADMIN') {
    redirect('/signin');
  }

  return (
    <AdminShell me={{ id: authUser.id, name: authUser.name, role: authUser.role }}>
      <div className="p-6">
        <AdminCompanies />
      </div>
    </AdminShell>
  );
}

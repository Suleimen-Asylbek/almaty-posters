import { requireAdmin } from '@/lib/supabase/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#F6F6F6] flex flex-col lg:flex-row">
      <AdminSidebar userEmail={user.email ?? ''} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

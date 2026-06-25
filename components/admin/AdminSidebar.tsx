'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, Plus, LogOut, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AdminSidebarProps {
  userEmail: string;
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/admin', label: 'Все постеры', icon: LayoutGrid, exact: true },
    { href: '/admin/products/new', label: 'Добавить постер', icon: Plus, exact: false },
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="lg:w-64 lg:min-h-screen bg-white border-b lg:border-b-0 lg:border-r border-[#E5E5E5] flex flex-col">
      <div className="px-6 py-6 border-b border-[#E5E5E5]">
        <Link href="/admin" className="font-black text-base tracking-tight text-[#111111]">
          ALMATY POSTERS
        </Link>
        <p className="text-xs text-[#999999] mt-1">Админ-панель</p>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#111111] text-white'
                  : 'text-[#666666] hover:bg-[#F6F6F6] hover:text-[#111111]'
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[#E5E5E5] flex flex-col gap-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#666666] hover:bg-[#F6F6F6] hover:text-[#111111] transition-colors"
        >
          <ExternalLink size={16} />
          Открыть сайт
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Выйти
        </button>
        <p className="text-xs text-[#999999] px-3 mt-1 truncate">{userEmail}</p>
      </div>
    </aside>
  );
}

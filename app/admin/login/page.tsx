import type { Metadata } from 'next';
import { LoginForm } from '@/components/admin/LoginForm';

export const metadata: Metadata = {
  title: 'Вход в админ-панель',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-black text-xl tracking-tight text-[#111111]">ALMATY POSTERS</p>
          <p className="text-sm text-[#666666] mt-1">Вход в админ-панель</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

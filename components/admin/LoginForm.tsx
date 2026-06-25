'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get('error') === 'unauthorized';
  const notConfigured = searchParams.get('error') === 'not_configured';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Неверный email или пароль');
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('Supabase не настроен. Проверьте переменные окружения.');
      setLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-[#E5E5E5] p-8 space-y-5"
    >
      {unauthorized && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          У этого аккаунта нет доступа к админ-панели
        </div>
      )}
      {notConfigured && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3">
          Supabase не настроен. Добавьте переменные окружения в .env.local, чтобы включить вход.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="login-email" className="block text-sm font-semibold text-[#111111] mb-1.5">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] text-sm text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#111111] transition-colors"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="block text-sm font-semibold text-[#111111] mb-1.5">
          Пароль
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] text-sm text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#111111] transition-colors"
        />
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.01 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className="w-full bg-[#111111] text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Вход...' : 'Войти'}
      </motion.button>
    </motion.form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="bg-white rounded-2xl border border-[#E5E5E5] p-8 h-80 animate-pulse" />}>
      <LoginFormInner />
    </Suspense>
  );
}

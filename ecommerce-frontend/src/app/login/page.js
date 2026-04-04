'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', username: '', fullname: ''
  });
  const [error, setError] = useState('');
  const submitting = useRef(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      setAlreadyLoggedIn(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting.current) return;
    submitting.current = true;

    setError('');

    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      submitting.current = false;
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await authAPI.login({
          username: form.email,
          password: form.password,
        });
        console.log(res.data);
        localStorage.setItem('token', res.data.access_token);
        const meRes = await authAPI.getMe();
        localStorage.setItem('is_admin', meRes.data.is_admin);
        toast.success('Welcome back!');
        if (meRes.data.is_admin) {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        await authAPI.register({
          email: form.email,
          password: form.password,
          username: form.username,
          fullname: form.fullname,
        });
        toast.success('Account created! Please login.');
        setIsLogin(true);
        setLoading(false);
        submitting.current = false;
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail[0]?.msg?.replace('String should', 'Password should') || 'Validation error'
        : typeof detail === 'string'
        ? detail
        : 'Something went wrong';
      setError(message);
      setLoading(false);
      submitting.current = false;
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] flex">

      <div className="hidden md:flex w-1/2 bg-[#EDE0D4] items-center justify-center relative overflow-hidden">
        <div className="text-center px-12">
          <Link href="/" className="text-3xl font-medium text-[#5C3D2E] tracking-widest block mb-6">
            LUMIÈRE
          </Link>
          <p className="text-[#7A6655] text-sm leading-relaxed">
            Curated pieces that blend modern design with classic craftsmanship.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#D4C4B0] to-transparent" />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">

          <Link href="/" className="text-xl font-medium text-[#5C3D2E] tracking-widest block mb-8 md:hidden">
            LUMIÈRE
          </Link>

          {alreadyLoggedIn && (
            <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              You're already logged in. Please{' '}
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('is_admin');
                  setAlreadyLoggedIn(false);
                }}
                className="underline font-medium"
              >
                log out
              </button>{' '}
              first before signing in to another account.
            </div>
          )}

          <h1 className="text-2xl font-medium text-[#3D2B1F] mb-2">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-[#8C7B6B] mb-8">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-[#5C3D2E] underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="text-xs text-[#8C7B6B] uppercase tracking-wider block mb-2">Full name</label>
                  <input
                    type="text"
                    name="fullname"
                    value={form.fullname}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 bg-white border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] placeholder-[#C4B8A8] focus:outline-none focus:border-[#5C3D2E]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8C7B6B] uppercase tracking-wider block mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    className="w-full px-4 py-3 bg-white border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] placeholder-[#C4B8A8] focus:outline-none focus:border-[#5C3D2E]"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs text-[#8C7B6B] uppercase tracking-wider block mb-2">Email</label>
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-white border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] placeholder-[#C4B8A8] focus:outline-none focus:border-[#5C3D2E]"
              />
            </div>

            <div className="relative">
              <label className="text-xs text-[#8C7B6B] uppercase tracking-wider block mb-2">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] placeholder-[#C4B8A8] focus:outline-none focus:border-[#5C3D2E] pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-9 text-[#8C7B6B]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || alreadyLoggedIn}
              className="w-full bg-[#5C3D2E] text-[#FAF7F2] py-3 rounded-full text-sm font-medium hover:bg-[#3D2B1F] transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
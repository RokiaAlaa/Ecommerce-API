'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { authAPI } from '@/lib/api';
import { User, Mail, Phone, Lock, LogOut, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullname: '', username: '', email: '', mobile: '', password: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    authAPI.getMe()
      .then((res) => {
        setUser(res.data);
        setForm({
          fullname: res.data.fullname || '',
          username: res.data.username || '',
          email: res.data.email || '',
          mobile: res.data.mobile || '',
          password: '',
        });
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      const res = await authAPI.updateMe(data);
      setUser(res.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    localStorage.removeItem('token');
    toast.success('Logged out');
    router.push('/');
  };

  if (loading) return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <Navbar />
      <div className="pt-16 max-w-2xl mx-auto px-6 py-16">
        <div className="h-64 bg-[#EDE0D4] rounded-2xl animate-pulse" />
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <Navbar />
      <div className="pt-16">
        <div className="bg-[#EDE0D4] py-10 px-6">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <div className="w-16 h-16 bg-[#5C3D2E] rounded-full flex items-center justify-center">
              <span className="text-2xl font-medium text-[#FAF7F2]">
                {user?.fullname?.[0] || user?.username?.[0] || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-medium text-[#3D2B1F]">{user?.fullname || user?.username}</h1>
              <p className="text-sm text-[#8C7B6B]">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/orders"
              className="bg-white border border-[#E0D5C5] rounded-2xl p-4 flex items-center gap-3 hover:border-[#C4A98A] transition-colors">
              <Package size={20} className="text-[#5C3D2E]" />
              <span className="text-sm font-medium text-[#3D2B1F]">My Orders</span>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-white border border-[#E0D5C5] rounded-2xl p-4 flex items-center gap-3 hover:border-red-300 transition-colors w-full text-left">
              <LogOut size={20} className="text-red-400" />
              <span className="text-sm font-medium text-[#3D2B1F]">Logout</span>
            </button>
          </div>

          {/* Profile Info */}
          <div className="bg-white border border-[#E0D5C5] rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-medium text-[#3D2B1F]">Profile Information</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm text-[#5C3D2E] underline"
                >
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs text-[#8C7B6B] uppercase tracking-wider block mb-2">Full name</label>
                  <input
                    type="text"
                    value={form.fullname}
                    onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] focus:outline-none focus:border-[#5C3D2E]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8C7B6B] uppercase tracking-wider block mb-2">Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] focus:outline-none focus:border-[#5C3D2E]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8C7B6B] uppercase tracking-wider block mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] focus:outline-none focus:border-[#5C3D2E]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8C7B6B] uppercase tracking-wider block mb-2">Mobile</label>
                  <input
                    type="text"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] focus:outline-none focus:border-[#5C3D2E]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8C7B6B] uppercase tracking-wider block mb-2">New password (optional)</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Leave empty to keep current"
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] focus:outline-none focus:border-[#5C3D2E]"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-[#5C3D2E] text-[#FAF7F2] py-3 rounded-full text-sm font-medium hover:bg-[#3D2B1F] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 border border-[#5C3D2E] text-[#5C3D2E] py-3 rounded-full text-sm hover:bg-[#EDE0D4] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {[
                  { icon: <User size={16} />, label: 'Full name', value: user?.fullname },
                  { icon: <User size={16} />, label: 'Username', value: user?.username },
                  { icon: <Mail size={16} />, label: 'Email', value: user?.email },
                  { icon: <Phone size={16} />, label: 'Mobile', value: user?.mobile || '—' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 border-b border-[#F0E8DC] last:border-0">
                    <span className="text-[#8C7B6B]">{item.icon}</span>
                    <div>
                      <p className="text-xs text-[#8C7B6B]">{item.label}</p>
                      <p className="text-sm text-[#3D2B1F]">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
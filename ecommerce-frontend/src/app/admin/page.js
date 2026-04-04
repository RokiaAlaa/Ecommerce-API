'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { ordersAPI, productsAPI, categoriesAPI, usersAPI, authAPI } from '@/lib/api';
import { Package, ShoppingBag, Users, TrendingUp, Plus, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const TABS = ['Orders', 'Products', 'Categories', 'Users'];

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const [productModal, setProductModal] = useState(null);
  const [categoryModal, setCategoryModal] = useState(null);
  const [userModal, setUserModal] = useState(null);

  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', category_id: '', image_url: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [userForm, setUserForm] = useState({ full_name: '', email: '', is_admin: false });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const fetchData = async () => {
      try {
        const meRes = await authAPI.getMe();
        if (!meRes.data.is_admin) { toast.error('Access denied'); router.push('/'); return; }
        const [ordersRes, productsRes, categoriesRes, usersRes] = await Promise.all([
          ordersAPI.getAllOrders(),
          productsAPI.getAll(),
          categoriesAPI.getAll(),
          usersAPI.getAll(),
        ]);
        setOrders(ordersRes.data);
        setProducts(productsRes.data.results ?? productsRes.data);
        setCategories(categoriesRes.data);
        setUsers(usersRes.data);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total_amount, 0);

  const openProductModal = (product = null) => {
    setProductForm(product
      ? { name: product.name, description: product.description, price: product.price, stock: product.stock, category_id: product.category_id, image_url: product.image_url ?? '' }
      : { name: '', description: '', price: '', stock: '', category_id: '', image_url: '' }
    );
    setProductModal(product?.id ?? 'new');
  };

  const saveProduct = async () => {
    try {
      const data = { ...productForm, price: parseFloat(productForm.price), stock: parseInt(productForm.stock), category_id: parseInt(productForm.category_id) };
      if (productModal === 'new') {
        const res = await productsAPI.create(data);
        setProducts([...products, res.data]);
        toast.success('Product created');
      } else {
        const res = await productsAPI.update(productModal, data);
        setProducts(products.map(p => p.id === productModal ? res.data : p));
        toast.success('Product updated');
      }
      setProductModal(null);
    } catch {
      toast.error('Failed to save product');
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productsAPI.delete(id);
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const openCategoryModal = (cat = null) => {
    setCategoryForm(cat ? { name: cat.name, description: cat.description ?? '' } : { name: '', description: '' });
    setCategoryModal(cat?.id ?? 'new');
  };

  const saveCategory = async () => {
    try {
      if (categoryModal === 'new') {
        const res = await categoriesAPI.create(categoryForm);
        setCategories([...categories, res.data]);
        toast.success('Category created');
      } else {
        const res = await categoriesAPI.update(categoryModal, categoryForm);
        setCategories(categories.map(c => c.id === categoryModal ? res.data : c));
        toast.success('Category updated');
      }
      setCategoryModal(null);
    } catch {
      toast.error('Failed to save category');
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await categoriesAPI.delete(id);
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const openUserModal = (user) => {
    setUserForm({ full_name: user.full_name, email: user.email, is_admin: user.is_admin });
    setUserModal(user.id);
  };

  const saveUser = async () => {
    try {
      const res = await usersAPI.update(userModal, userForm);
      setUsers(users.map(u => u.id === userModal ? res.data : u));
      toast.success('User updated');
      setUserModal(null);
    } catch {
      toast.error('Failed to update user');
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await usersAPI.delete(id);
      setUsers(users.filter(u => u.id !== id));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  if (loading) return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <Navbar />
      <div className="pt-16 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-[#EDE0D4] rounded-2xl animate-pulse" />)}
        </div>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <Navbar />
      <div className="pt-16">
        <div className="bg-[#3D2B1F] py-10 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-medium text-[#FAF7F2]">Admin Dashboard</h1>
            <p className="text-sm text-[#8C7B6B] mt-1">Manage your store</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { icon: <TrendingUp size={20} />, label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}` },
              { icon: <Package size={20} />, label: 'Total Orders', value: orders.length },
              { icon: <ShoppingBag size={20} />, label: 'Products', value: products.length },
              { icon: <Users size={20} />, label: 'Users', value: users.length },
            ].map((stat, i) => (
              <div key={i} className="bg-[#EDE0D4] rounded-2xl p-5">
                <div className="text-[#5C3D2E] mb-3">{stat.icon}</div>
                <p className="text-2xl font-medium text-[#3D2B1F]">{stat.value}</p>
                <p className="text-xs text-[#8C7B6B] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-8">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-sm transition-colors ${activeTab === tab ? 'bg-[#5C3D2E] text-[#FAF7F2]' : 'bg-[#EDE0D4] text-[#5C3D2E] hover:bg-[#D4C4B0]'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Orders' && (
            <div className="bg-white border border-[#E0D5C5] rounded-2xl p-6">
              <h2 className="text-lg font-medium text-[#3D2B1F] mb-6">All Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F0E8DC]">
                      {['Order', 'Date', 'Amount', 'Status', 'Action'].map(h => (
                        <th key={h} className="text-left text-xs text-[#8C7B6B] uppercase tracking-wider pb-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E8DC]">
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td className="py-3 text-sm font-medium text-[#3D2B1F]">#{order.id}</td>
                        <td className="py-3 text-sm text-[#8C7B6B]">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="py-3 text-sm text-[#5C3D2E] font-medium">${order.total_amount.toFixed(2)}</td>
                        <td className="py-3">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>{order.status}</span>
                        </td>
                        <td className="py-3">
                          <select
                            value={order.status}
                            disabled={updatingOrder === order.id}
                            onChange={async (e) => {
                              setUpdatingOrder(order.id);
                              try {
                                await ordersAPI.updateStatus(order.id, { status: e.target.value });
                                setOrders(orders.map(o => o.id === order.id ? { ...o, status: e.target.value } : o));
                                toast.success('Status updated');
                              } catch {
                                toast.error('Failed to update');
                              } finally {
                                setUpdatingOrder(null);
                              }
                            }}
                            className="text-xs border border-[#E0D5C5] rounded-lg px-2 py-1 text-[#3D2B1F] focus:outline-none"
                          >
                            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Products' && (
            <div className="bg-white border border-[#E0D5C5] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-[#3D2B1F]">Products</h2>
                <button onClick={() => openProductModal()} className="flex items-center gap-2 px-4 py-2 bg-[#5C3D2E] text-[#FAF7F2] rounded-full text-sm hover:bg-[#3D2B1F] transition-colors">
                  <Plus size={14} /> Add Product
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F0E8DC]">
                      {['Name', 'Price', 'Stock', 'Category', 'Actions'].map(h => (
                        <th key={h} className="text-left text-xs text-[#8C7B6B] uppercase tracking-wider pb-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E8DC]">
                    {products.map(product => (
                      <tr key={product.id}>
                        <td className="py-3 text-sm font-medium text-[#3D2B1F]">{product.name}</td>
                        <td className="py-3 text-sm text-[#5C3D2E]">${product.price.toFixed(2)}</td>
                        <td className="py-3 text-sm text-[#8C7B6B]">{product.stock}</td>
                        <td className="py-3 text-sm text-[#8C7B6B]">{categories.find(c => c.id === product.category_id)?.name ?? '-'}</td>
                        <td className="py-3 flex gap-2">
                          <button onClick={() => openProductModal(product)} className="p-1.5 rounded-lg bg-[#EDE0D4] text-[#5C3D2E] hover:bg-[#D4C4B0] transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => deleteProduct(product.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Categories' && (
            <div className="bg-white border border-[#E0D5C5] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-[#3D2B1F]">Categories</h2>
                <button onClick={() => openCategoryModal()} className="flex items-center gap-2 px-4 py-2 bg-[#5C3D2E] text-[#FAF7F2] rounded-full text-sm hover:bg-[#3D2B1F] transition-colors">
                  <Plus size={14} /> Add Category
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F0E8DC]">
                      {['Name', 'Description', 'Actions'].map(h => (
                        <th key={h} className="text-left text-xs text-[#8C7B6B] uppercase tracking-wider pb-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E8DC]">
                    {categories.map(cat => (
                      <tr key={cat.id}>
                        <td className="py-3 text-sm font-medium text-[#3D2B1F]">{cat.name}</td>
                        <td className="py-3 text-sm text-[#8C7B6B]">{cat.description ?? '-'}</td>
                        <td className="py-3 flex gap-2">
                          <button onClick={() => openCategoryModal(cat)} className="p-1.5 rounded-lg bg-[#EDE0D4] text-[#5C3D2E] hover:bg-[#D4C4B0] transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => deleteCategory(cat.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Users' && (
            <div className="bg-white border border-[#E0D5C5] rounded-2xl p-6">
              <h2 className="text-lg font-medium text-[#3D2B1F] mb-6">Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F0E8DC]">
                      {['Name', 'Email', 'Admin', 'Actions'].map(h => (
                        <th key={h} className="text-left text-xs text-[#8C7B6B] uppercase tracking-wider pb-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E8DC]">
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className="py-3 text-sm font-medium text-[#3D2B1F]">{user.full_name}</td>
                        <td className="py-3 text-sm text-[#8C7B6B]">{user.email}</td>
                        <td className="py-3">
                          {user.is_admin
                            ? <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Admin</span>
                            : <span className="text-xs px-2 py-1 bg-[#EDE0D4] text-[#8C7B6B] rounded-full">User</span>}
                        </td>
                        <td className="py-3 flex gap-2">
                          <button onClick={() => openUserModal(user)} className="p-1.5 rounded-lg bg-[#EDE0D4] text-[#5C3D2E] hover:bg-[#D4C4B0] transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => deleteUser(user.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {productModal !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-[#3D2B1F]">{productModal === 'new' ? 'Add Product' : 'Edit Product'}</h3>
              <button onClick={() => setProductModal(null)}><X size={20} className="text-[#8C7B6B]" /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Name', key: 'name', type: 'text' },
                { label: 'Price', key: 'price', type: 'number' },
                { label: 'Stock', key: 'stock', type: 'number' },
                { label: 'Image URL', key: 'image_url', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-xs text-[#8C7B6B] uppercase tracking-wider mb-1 block">{label}</label>
                  <input
                    type={type}
                    value={productForm[key]}
                    onChange={(e) => setProductForm({ ...productForm, [key]: e.target.value })}
                    placeholder={key === 'image_url' ? 'https://...' : ''}
                    className="w-full px-4 py-2 border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] focus:outline-none focus:border-[#5C3D2E]"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-[#8C7B6B] uppercase tracking-wider mb-1 block">Category</label>
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] focus:outline-none focus:border-[#5C3D2E]"
                >
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#8C7B6B] uppercase tracking-wider mb-1 block">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] focus:outline-none focus:border-[#5C3D2E] resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setProductModal(null)} className="flex-1 py-2 border border-[#E0D5C5] rounded-full text-sm text-[#8C7B6B] hover:bg-[#FAF7F2] transition-colors">Cancel</button>
              <button onClick={saveProduct} className="flex-1 py-2 bg-[#5C3D2E] text-[#FAF7F2] rounded-full text-sm hover:bg-[#3D2B1F] transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {categoryModal !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-[#3D2B1F]">{categoryModal === 'new' ? 'Add Category' : 'Edit Category'}</h3>
              <button onClick={() => setCategoryModal(null)}><X size={20} className="text-[#8C7B6B]" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#8C7B6B] uppercase tracking-wider mb-1 block">Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] focus:outline-none focus:border-[#5C3D2E]"
                />
              </div>
              <div>
                <label className="text-xs text-[#8C7B6B] uppercase tracking-wider mb-1 block">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] focus:outline-none focus:border-[#5C3D2E] resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setCategoryModal(null)} className="flex-1 py-2 border border-[#E0D5C5] rounded-full text-sm text-[#8C7B6B] hover:bg-[#FAF7F2] transition-colors">Cancel</button>
              <button onClick={saveCategory} className="flex-1 py-2 bg-[#5C3D2E] text-[#FAF7F2] rounded-full text-sm hover:bg-[#3D2B1F] transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {userModal !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-[#3D2B1F]">Edit User</h3>
              <button onClick={() => setUserModal(null)}><X size={20} className="text-[#8C7B6B]" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#8C7B6B] uppercase tracking-wider mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] focus:outline-none focus:border-[#5C3D2E]"
                />
              </div>
              <div>
                <label className="text-xs text-[#8C7B6B] uppercase tracking-wider mb-1 block">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] focus:outline-none focus:border-[#5C3D2E]"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={userForm.is_admin}
                  onChange={(e) => setUserForm({ ...userForm, is_admin: e.target.checked })}
                  className="w-4 h-4 accent-[#5C3D2E]"
                />
                <label htmlFor="is_admin" className="text-sm text-[#3D2B1F]">Admin privileges</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setUserModal(null)} className="flex-1 py-2 border border-[#E0D5C5] rounded-full text-sm text-[#8C7B6B] hover:bg-[#FAF7F2] transition-colors">Cancel</button>
              <button onClick={saveUser} className="flex-1 py-2 bg-[#5C3D2E] text-[#FAF7F2] rounded-full text-sm hover:bg-[#3D2B1F] transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
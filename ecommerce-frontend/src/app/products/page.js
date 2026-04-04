'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PRODUCTS_PER_PAGE = 12;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category_id') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = allProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  useEffect(() => {
    categoriesAPI.getAll().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) setSearch(searchFromUrl);
    const categoryFromUrl = searchParams.get('category_id');
    if (categoryFromUrl) setSelectedCategory(categoryFromUrl);
  }, [searchParams.toString()]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, minPrice, maxPrice]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (selectedCategory) params.category_id = selectedCategory;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;

        const res = await productsAPI.getAll({ ...params, limit: 100 });        const data = res.data.results ?? res.data;
        setAllProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, minPrice, maxPrice]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
  };

  const hasFilters = search || selectedCategory || minPrice || maxPrice;

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <Navbar />
      <div className="pt-16">

        <div className="bg-[#EDE0D4] py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-medium text-[#3D2B1F] mb-2">All Products</h1>
            <p className="text-[#8C7B6B] text-sm">{allProducts.length} products found</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7B6B]" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#E0D5C5] rounded-full text-sm text-[#3D2B1F] placeholder-[#8C7B6B] focus:outline-none focus:border-[#5C3D2E]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-3 bg-[#EDE0D4] text-[#5C3D2E] rounded-full text-sm hover:bg-[#D4C4B0] transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-5 py-3 bg-[#5C3D2E] text-[#FAF7F2] rounded-full text-sm hover:bg-[#3D2B1F] transition-colors"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="bg-[#EDE0D4] rounded-2xl p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-[#8C7B6B] uppercase tracking-wider mb-2 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] focus:outline-none focus:border-[#5C3D2E]"
                >
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#8C7B6B] uppercase tracking-wider mb-2 block">Min price</label>
                <input
                  type="number"
                  placeholder="$0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] focus:outline-none focus:border-[#5C3D2E]"
                />
              </div>
              <div>
                <label className="text-xs text-[#8C7B6B] uppercase tracking-wider mb-2 block">Max price</label>
                <input
                  type="number"
                  placeholder="$999"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] focus:outline-none focus:border-[#5C3D2E]"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap mb-8">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-xs transition-colors ${
                !selectedCategory ? 'bg-[#5C3D2E] text-[#FAF7F2]' : 'bg-[#EDE0D4] text-[#5C3D2E] hover:bg-[#D4C4B0]'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className={`px-4 py-2 rounded-full text-xs transition-colors ${
                  selectedCategory === cat.id.toString() ? 'bg-[#5C3D2E] text-[#FAF7F2]' : 'bg-[#EDE0D4] text-[#5C3D2E] hover:bg-[#D4C4B0]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
                <div key={i} className="h-72 bg-[#EDE0D4] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#8C7B6B] text-lg">No products found</p>
              <button onClick={clearFilters} className="mt-4 text-sm text-[#5C3D2E] underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full bg-[#EDE0D4] text-[#5C3D2E] hover:bg-[#D4C4B0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-full text-sm transition-colors ${
                        currentPage === page
                          ? 'bg-[#5C3D2E] text-[#FAF7F2]'
                          : 'bg-[#EDE0D4] text-[#5C3D2E] hover:bg-[#D4C4B0]'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="text-[#8C7B6B] px-1">…</span>;
                }
                return null;
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full bg-[#EDE0D4] text-[#5C3D2E] hover:bg-[#D4C4B0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </main>
  );
}

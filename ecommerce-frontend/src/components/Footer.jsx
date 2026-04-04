import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#3D2B1F] text-[#D4C4B0]">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div>
          <h3 className="text-xl font-medium text-[#FAF7F2] tracking-widest mb-4">LUMIÈRE</h3>
          <p className="text-sm text-[#8C7B6B] leading-relaxed">
            Curated pieces that blend modern design with classic craftsmanship.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-[#FAF7F2] mb-4 uppercase tracking-wider">Shop</h4>
          <ul className="space-y-2">
            <li><Link href="/products" className="text-sm text-[#8C7B6B] hover:text-[#FAF7F2] transition-colors">All Products</Link></li>
            <li><Link href="/products?category=electronics" className="text-sm text-[#8C7B6B] hover:text-[#FAF7F2] transition-colors">Electronics</Link></li>
            <li><Link href="/products?category=fashion" className="text-sm text-[#8C7B6B] hover:text-[#FAF7F2] transition-colors">Fashion</Link></li>
            <li><Link href="/products?category=home-living" className="text-sm text-[#8C7B6B] hover:text-[#FAF7F2] transition-colors">Home & Living</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium text-[#FAF7F2] mb-4 uppercase tracking-wider">Account</h4>
          <ul className="space-y-2">
            <li><Link href="/login" className="text-sm text-[#8C7B6B] hover:text-[#FAF7F2] transition-colors">Login</Link></li>
            <li><Link href="/register" className="text-sm text-[#8C7B6B] hover:text-[#FAF7F2] transition-colors">Register</Link></li>
            <li><Link href="/profile" className="text-sm text-[#8C7B6B] hover:text-[#FAF7F2] transition-colors">Profile</Link></li>
            <li><Link href="/orders" className="text-sm text-[#8C7B6B] hover:text-[#FAF7F2] transition-colors">Orders</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium text-[#FAF7F2] mb-4 uppercase tracking-wider">Support</h4>
          <ul className="space-y-2">
            <li><Link href="#" className="text-sm text-[#8C7B6B] hover:text-[#FAF7F2] transition-colors">FAQ</Link></li>
            <li><Link href="#" className="text-sm text-[#8C7B6B] hover:text-[#FAF7F2] transition-colors">Shipping</Link></li>
            <li><Link href="#" className="text-sm text-[#8C7B6B] hover:text-[#FAF7F2] transition-colors">Returns</Link></li>
            <li><Link href="#" className="text-sm text-[#8C7B6B] hover:text-[#FAF7F2] transition-colors">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#5C3D2E] py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#8C7B6B]">© 2025 Lumière. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-[#8C7B6B] hover:text-[#FAF7F2] transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-xs text-[#8C7B6B] hover:text-[#FAF7F2] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, Heart, User } from 'lucide-react';
import { RootState } from '../../redux/store';
import { logoutRequest } from '../../redux/auth/auth.action';
import { COMPANY_LOGO, COMPANY_NAME, COMPANY_SHORT, COMPANY_TAGLINE } from '../../utils/brand';

export default function ShopLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const cartCount = useSelector((s: RootState) => s.cart.count);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium ${isActive ? 'text-primary-700' : 'text-slate-600 hover:text-slate-900'}`;

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f7f4ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <Link to="/" className="flex items-center gap-2 font-display text-2xl tracking-tight text-slate-900">
            <img src={COMPANY_LOGO} alt={COMPANY_NAME} className="h-9 w-9 rounded-lg object-cover" />
            {COMPANY_SHORT} <span className="text-teal-700">ShopOS</span>
          </Link>
          <nav className="ml-4 hidden items-center gap-5 md:flex">
            <NavLink to="/shop" className={linkClass}>Shop</NavLink>
            <NavLink to="/shop?category=men" className={linkClass}>Men</NavLink>
            <NavLink to="/shop?category=women" className={linkClass}>Women</NavLink>
            <NavLink to="/shop?category=kids" className={linkClass}>Kids</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/wishlist" className="rounded-full p-2 hover:bg-white"><Heart size={18} /></Link>
                <Link to="/cart" className="relative rounded-full p-2 hover:bg-white">
                  <ShoppingBag size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-amber-700 px-1.5 text-[10px] text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="rounded-full p-2 hover:bg-white"><User size={18} /></Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium text-amber-800">Admin</Link>
                )}
                <button
                  type="button"
                  className="text-sm text-slate-600"
                  onClick={() => {
                    dispatch(logoutRequest());
                    navigate('/login');
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium">Login</Link>
                <Link to="/register" className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="mt-16 border-t border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
          <div>
            <h3 className="font-display text-xl">{COMPANY_NAME}</h3>
            <p className="mt-2 text-sm text-slate-600">{COMPANY_TAGLINE}</p>
          </div>
          <div className="text-sm text-slate-600">
            <p className="font-medium text-slate-900">Shop</p>
            <Link to="/shop?category=men" className="mt-2 block">Men</Link>
            <Link to="/shop?category=women" className="block">Women</Link>
            <Link to="/shop?category=kids" className="block">Kids</Link>
          </div>
          <div className="text-sm text-slate-600">
            <p className="font-medium text-slate-900">Help</p>
            <p className="mt-2">Free shipping above ₹999</p>
            <p>COD available · Track from My Orders</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

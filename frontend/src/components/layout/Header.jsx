import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Building2,
  User,
  CalendarCheck,
  Heart,
  ChevronDown,
} from 'lucide-react';
import logoAtbLand from '../../assets/logo-atb-land.png';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { label: 'Phòng Trọ', to: '/phong-tro' },
  { label: 'Nhà Nghỉ', to: '/nha-nghi' },
  { label: 'Homestay', to: '/homestay' },
  { label: 'Tòa nhà nổi bật', to: '/toa-nha-noi-bat' },
  { label: 'Booking Tự Động', to: '/booking-tu-dong' },
  { label: 'Quy chế & Pháp lý', to: '/quy-che-phap-ly' },
];

export default function Header({ onOpenAuthModal, onOpenPostRoomGuide }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdminOrHost, logout } = useAuth();

  const displayName = user?.fullName || user?.email || 'Người dùng';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  // Tự động đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    if (typeof onOpenAuthModal === 'function') {
      onOpenAuthModal();
    } else {
      navigate('/login');
    }
  };

  const handleHostRegisterClick = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    if (typeof onOpenPostRoomGuide === 'function') {
      onOpenPostRoomGuide();
    } else if (isAdminOrHost) {
      navigate('/admin/accommodations');
    } else {
      navigate('/register-enterprise');
    }
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  const desktopNavClass = ({ isActive }) =>
    `relative py-2 text-base transition ${
      isActive
        ? 'font-bold text-teal-700 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-teal-700'
        : 'font-semibold text-slate-600 hover:text-teal-700'
    }`;

  const mobileNavClass = ({ isActive }) =>
    `block rounded-xl px-3 py-2.5 text-sm transition ${
      isActive
        ? 'bg-teal-50 font-bold text-teal-700'
        : 'font-semibold text-slate-700 hover:bg-slate-100 hover:text-teal-700'
    }`;

  const dropdownItemClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-4 py-2 text-sm transition ${
      isActive
        ? 'bg-teal-50 font-bold text-teal-700'
        : 'text-slate-700 hover:bg-slate-50'
    }`;

  const isLoginActive = location.pathname === '/login';
  const isHostRegisterActive = location.pathname === '/register-enterprise';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo ATB LAND */}
          <Link to="/" className="group flex items-center gap-2.5">
            <img
              src={logoAtbLand}
              alt="Logo ATB LAND"
              className="h-auto w-30 object-cover transition"
            />

          </Link>

          {/* Menu Desktop (tự động sáng mục đang truy cập) */}
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={desktopNavClass}>
                {item.label}
              </NavLink>
            ))}

          </nav>

          {/* Khu vực bên phải (Desktop) */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                {!isAdminOrHost && (
                  <button
                    type="button"
                    onClick={handleHostRegisterClick}
                    className={`inline-flex items-center gap-1.5 rounded-xl border border-teal-700 px-3.5 py-1.5 text-sm font-semibold transition ${
                      isHostRegisterActive
                        ? 'bg-teal-700 text-white'
                        : 'text-teal-700 hover:bg-teal-700 hover:text-white'
                    }`}
                  >
                    <Building2 size={16} />
                    Cho thuê chỗ ở
                  </button>
                )}

                {/* User Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    aria-expanded={userMenuOpen}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 transition hover:border-teal-300 hover:bg-white"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
                      {avatarInitial}
                    </div>
                    <div className="text-left">
                      <span className="block max-w-[140px] truncate text-sm font-semibold text-slate-800">
                        {displayName}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-slate-500 transition-transform duration-200 ${
                        userMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl">
                      {/* Thông tin tóm tắt tài khoản */}
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
                        <p className="truncate text-xs text-slate-500">{user?.email || user?.phone}</p>
                        <span className="mt-1.5 inline-block rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
                          {user?.role === 'ADMIN'
                            ? 'Quản trị viên'
                            : user?.role === 'HOST'
                              ? 'Chủ cơ sở / Doanh nghiệp'
                              : 'Thành viên cá nhân'}
                        </span>
                      </div>

                      {/* Các chức năng trong dropdown */}
                      <div className="py-1">
                        {isAdminOrHost && (
                          <NavLink
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition ${
                                isActive
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'text-teal-700 hover:bg-teal-50'
                              }`
                            }
                          >
                            <LayoutDashboard size={16} />
                            Trang quản trị hệ thống
                          </NavLink>
                        )}

                        <NavLink
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className={dropdownItemClass}
                        >
                          <User size={16} className="shrink-0" />
                          Hồ sơ cá nhân (Profile)
                        </NavLink>

                        <NavLink
                          to="/my-bookings"
                          onClick={() => setUserMenuOpen(false)}
                          className={dropdownItemClass}
                        >
                          <CalendarCheck size={16} className="shrink-0" />
                          Lịch đặt phòng &amp; xem trọ
                        </NavLink>

                        <NavLink
                          to="/saved"
                          onClick={() => setUserMenuOpen(false)}
                          className={dropdownItemClass}
                        >
                          <Heart size={16} className="shrink-0" />
                          Chỗ ở đã lưu
                        </NavLink>
                      </div>

                      {/* Nút Đăng xuất */}
                      <div className="border-t border-slate-100 pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                        >
                          <LogOut size={16} />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleHostRegisterClick}
                  className={`inline-flex items-center gap-1.5 rounded-xl border border-teal-700 px-3.5 py-1.5 text-sm font-semibold transition ${
                    isHostRegisterActive
                      ? 'bg-teal-700 text-white'
                      : 'text-teal-700 hover:bg-teal-700 hover:text-white'
                  }`}
                >
                  <Building2 size={16} />
                  Cho thuê chỗ ở
                </button>

                <button
                  type="button"
                  onClick={handleLoginClick}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition ${
                    isLoginActive ? 'bg-teal-900 ring-2 ring-teal-300' : 'bg-teal-700 hover:bg-teal-800'
                  }`}
                >
                  Đăng nhập
                </button>
              </>
            )}
          </div>

          {/* Nút menu Mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileMenuOpen}
            className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile (tự động sáng mục đang truy cập) */}
      {mobileMenuOpen && (
        <div className="space-y-1.5 border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavClass}
            >
              {item.label}
            </NavLink>
          ))}

          <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
            {isAuthenticated ? (
              <>
                <div className="mb-1 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                    {avatarInitial}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-slate-800">{displayName}</div>
                    <div className="truncate text-xs text-slate-500">{user?.email || user?.role}</div>
                  </div>
                </div>

                {isAdminOrHost && (
                  <NavLink
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                        isActive ? 'bg-teal-100 text-teal-800' : 'text-teal-700 hover:bg-teal-50'
                      }`
                    }
                  >
                    <LayoutDashboard size={16} />
                    Trang quản trị hệ thống
                  </NavLink>
                )}

                <NavLink
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
                      isActive
                        ? 'bg-teal-50 font-bold text-teal-700'
                        : 'font-medium text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <User size={16} />
                  Hồ sơ cá nhân (Profile)
                </NavLink>

                <NavLink
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
                      isActive
                        ? 'bg-teal-50 font-bold text-teal-700'
                        : 'font-medium text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <CalendarCheck size={16} />
                  Lịch đặt phòng &amp; xem trọ
                </NavLink>

                <NavLink
                  to="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
                      isActive
                        ? 'bg-teal-50 font-bold text-teal-700'
                        : 'font-medium text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <Heart size={16} />
                  Chỗ ở đã lưu
                </NavLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800"
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={handleHostRegisterClick}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-teal-700 px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-700 hover:text-white"
                >
                  <Building2 size={16} />
                  Cho thuê chỗ ở
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
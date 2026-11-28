import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Lock, Check, Sparkles, ShieldCheck, PhoneCall } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function getStoredToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function getRedirectByRole(role) {
  if (role === 'ADMIN' || role === 'HOST') return '/admin';
  return '/';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const existingToken = getStoredToken();
  const existingUser = getStoredUser();

  function showToast(message, type = 'success') {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }

  useEffect(() => {
    const prefilledEmail = searchParams.get('email');
    if (prefilledEmail) {
      setIdentifier(prefilledEmail);
    }
  }, [searchParams]);

  // Chỉ tự động chuyển trang nếu đã có sẵn phiên hợp lệ trước khi mở /login (và không đang submit)
  if (!loading && existingToken && existingUser?.role) {
    return <Navigate to={getRedirectByRole(existingUser.role)} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier || !password) {
      showToast('Vui lòng nhập đầy đủ Email/Số điện thoại và mật khẩu.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: trimmedIdentifier,
          email: trimmedIdentifier,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }

      const token = data.token || data.data?.token;
      const user = data.user || data.data?.user;

      if (!token || !user || !user.role) {
        throw new Error('Phản hồi đăng nhập từ máy chủ thiếu thông tin người dùng.');
      }

      // Lưu đồng bộ vào localStorage để ProtectedAdminRoute & api luôn đọc được
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (!rememberMe) {
        sessionStorage.setItem('session_only', '1');
      } else {
        sessionStorage.removeItem('session_only');
      }

      window.dispatchEvent(new Event('auth-changed'));
      navigate(getRedirectByRole(user.role), { replace: true });
    } catch (err) {
      showToast(err.message || 'Không thể kết nối tới máy chủ ATB LAND.', 'error');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-teal-600 selection:text-white">
      {/* Thanh thông báo nổi (Toast) */}
      <div className="pointer-events-none fixed right-4 top-5 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border-l-4 bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl sm:text-sm ${
              toast.type === 'error' ? 'border-rose-500' : 'border-emerald-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Nội dung chính Split-Layout */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl lg:grid-cols-12">
          {/* Cột trái: Branding & Giá trị cốt lõi ATB LAND */}
          <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-teal-700 to-teal-600 p-7 text-white sm:p-9 lg:col-span-5">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-teal-300/15 blur-3xl" />

            <div className="relative space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Hệ sinh thái lưu trú minh bạch
              </span>

              <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">
                Kết nối không gian lưu trú chính chủ tại Việt Nam
              </h1>

              <p className="text-xs leading-relaxed text-teal-50/90 sm:text-sm">
                Quản lý lịch hẹn xem phòng trọ, đặt Homestay &amp; Khách sạn theo giờ hoặc theo đêm, và vận hành quỹ phòng cá nhân hoặc doanh nghiệp.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <div>
                    <div className="font-bold text-white">Không thu cọc trực tuyến</div>
                    <p className="mt-0.5 text-teal-100/80">
                      Đặt lịch xem phòng hoặc giữ phòng miễn phí, thanh toán trực tiếp tại cơ sở.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300">
                    <ShieldCheck size={14} strokeWidth={2.5} />
                  </span>
                  <div>
                    <div className="font-bold text-white">Xác thực chính chủ • Chống tin ảo</div>
                    <p className="mt-0.5 text-teal-100/80">
                      Kiểm duyệt thông tin chủ cơ sở và tự động làm mới quỹ phòng mỗi 21 ngày.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300">
                    <Sparkles size={14} strokeWidth={2.5} />
                  </span>
                  <div>
                    <div className="font-bold text-white">Bảo mật dữ liệu cá nhân</div>
                    <p className="mt-0.5 text-teal-100/80">
                      Tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ thông tin người dùng.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-6 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-teal-100/80">
              <span>Hà Nội • TP. HCM • Huế</span>
              <span className="inline-flex items-center gap-1 font-semibold text-white">
                <PhoneCall size={13} />
                Hotline: 1900 6868
              </span>
            </div>
          </div>

          {/* Cột phải: Form Đăng nhập */}
          <div className="flex flex-col justify-center space-y-5 p-6 sm:p-10 lg:col-span-7">
            <div>
              <span className="mb-2 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                ĐĂNG NHẬP HỆ THỐNG
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                Chào mừng trở lại ATB LAND
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Đăng nhập bằng Email hoặc Số điện thoại cho tài khoản cá nhân hoặc doanh nghiệp.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-identifier"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Email hoặc Số điện thoại *
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User size={16} />
                  </span>
                  <input
                    id="login-identifier"
                    type="text"
                    required
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="nguyenvana@gmail.com hoặc 0912 345 678"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/60 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-xs font-bold text-slate-700">
                    Mật khẩu *
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      showToast('Liên kết đặt lại mật khẩu đã được gửi qua Email/SMS đăng ký!')
                    }
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/60 py-2.5 pl-10 pr-11 text-sm outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="Hiện hoặc ẩn mật khẩu"
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-semibold text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <label className="inline-flex cursor-pointer select-none items-center gap-2 text-slate-600">
                  <input
                    id="login-remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Ghi nhớ phiên đăng nhập</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập vào hệ thống'}
              </button>
            </form>

            {/* Đăng nhập nhanh */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 font-medium text-slate-400">Hoặc tiếp tục với</span>
              </div>
            </div>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => showToast('Đang kết nối đăng nhập nhanh qua Google OAuth...')}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:text-sm"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.3 0 11.6 0 14s.6 4.7 1.6 6.6l3.7-2.8z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 20.4 7.4 23 12 23z"
                  />
                </svg>
                <span>Google</span>
              </button>

            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2 text-center text-xs text-slate-500">
              <span>
                Chưa có tài khoản?{' '}
                <Link to="/register" className="font-bold text-teal-600 hover:underline">
                  Đăng ký cá nhân
                </Link>
              </span>
              <span>
                Là công ty / chuỗi lưu trú?{' '}
                <Link to="/register-enterprise" className="font-bold text-indigo-600 hover:underline">
                  Đăng ký doanh nghiệp
                </Link>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
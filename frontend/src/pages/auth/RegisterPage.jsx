import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Check, Sparkles, ShieldCheck, PhoneCall } from 'lucide-react';
import Button from '../../components/ui/Button';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function getRedirectByRole(role) {
  if (role === 'ADMIN' || role === 'HOST') return '/admin';
  return '/';
}

function persistAuthSession({ token, user, fallbackEmail, fallbackRole = 'GUEST' }) {
  const normalizedUser = {
    ...(user || {}),
    email: user?.email || fallbackEmail,
    role: user?.role || fallbackRole,
  };
  if (token) {
    localStorage.setItem('token', token);
  }
  localStorage.setItem('user', JSON.stringify(normalizedUser));
  window.dispatchEvent(new Event('auth-changed'));
  return normalizedUser;
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const existingToken = localStorage.getItem('token');
  const existingUser = getStoredUser();

  if (!loading && existingToken && existingUser?.role) {
    return <Navigate to={getRedirectByRole(existingUser.role)} replace />;
  }

  function showToast(message, type = 'success') {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }

  async function loginAfterRegister(cleanEmail, rawPassword) {
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: cleanEmail,
        email: cleanEmail,
        password: rawPassword,
      }),
    });
    const loginData = await loginRes.json().catch(() => ({}));
    if (!loginRes.ok || loginData.success === false) {
      throw new Error(loginData.message || 'Tài khoản đã tạo nhưng tự động đăng nhập thất bại.');
    }
    return {
      token: loginData.token || loginData.data?.token,
      user: loginData.user || loginData.data?.user,
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const cleanFullName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    if (!cleanFullName || !cleanPhone || !cleanEmail || !password) {
      showToast('Vui lòng điền đầy đủ các trường bắt buộc.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Mật khẩu xác nhận chưa trùng khớp. Vui lòng kiểm tra lại!', 'error');
      return;
    }

    if (!acceptedTerms) {
      showToast('Vui lòng đồng ý với Quy chế hoạt động và chính sách bảo mật.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cleanFullName,
          email: cleanEmail,
          phone: cleanPhone,
          password,
          role: 'GUEST',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Đăng ký tài khoản thất bại.');
      }

      let token = data.token || data.data?.token;
      let user = data.user || data.data?.user;

      // Nếu API register chưa trả token thì gọi login tự động bằng thông tin vừa đăng ký
      if (!token) {
        const loggedIn = await loginAfterRegister(cleanEmail, password);
        token = loggedIn.token;
        user = loggedIn.user || user;
      }

      const finalUser = persistAuthSession({
        token,
        user,
        fallbackEmail: cleanEmail,
        fallbackRole: 'GUEST',
      });

      showToast(`Đăng ký và đăng nhập thành công cho ${finalUser.fullName || cleanFullName}!`);
      navigate(getRedirectByRole(finalUser.role), { replace: true });
    } catch (err) {
      showToast(err.message || 'Không thể kết nối tới máy chủ ATB LAND.', 'error');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-teal-600 selection:text-white">
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

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl lg:grid-cols-12">
          <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-teal-700 to-teal-600 p-7 text-white sm:p-9 lg:col-span-5">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-teal-300/15 blur-3xl" />

            <div className="relative space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Tài khoản cá nhân ATB LAND
              </span>

              <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">
                Đặt phòng trọ, Homestay &amp; Khách sạn dễ dàng cho cá nhân
              </h1>

              <p className="text-xs leading-relaxed text-teal-50/90 sm:text-sm">
                Dành cho người thuê phòng trọ và du khách đặt phòng theo giờ, qua đêm hoặc theo ngày trên ATB LAND.
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

          <div className="flex flex-col justify-center space-y-4 p-6 sm:p-10 lg:col-span-7">
            <div>
              <span className="mb-2 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                ĐĂNG KÝ TÀI KHOẢN CÁ NHÂN
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                Tạo tài khoản cá nhân ATB LAND
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Nếu bạn đại diện công ty hoặc chuỗi lưu trú, hãy dùng{' '}
                <Link to="/register-enterprise" className="font-bold text-indigo-600 hover:underline">
                  Đăng ký doanh nghiệp
                </Link>
                .
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label htmlFor="reg-fullname" className="mb-1 block text-xs font-bold text-slate-700">
                    Họ và tên *
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Minh Anh"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label htmlFor="reg-phone" className="mb-1 block text-xs font-bold text-slate-700">
                    Số điện thoại *
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    pattern="[0-9\s]{9,13}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="mb-1 block text-xs font-bold text-slate-700">
                  Địa chỉ Email *
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="minhanh@gmail.com"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label htmlFor="reg-password" className="mb-1 block text-xs font-bold text-slate-700">
                    Mật khẩu *
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/60 py-2.5 pl-3.5 pr-11 text-sm outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? 'Ẩn' : 'Hiện'}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reg-confirm-password"
                    className="mb-1 block text-xs font-bold text-slate-700"
                  >
                    Nhập lại mật khẩu *
                  </label>
                  <input
                    id="reg-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer select-none items-start gap-2.5 pt-1 text-xs text-slate-600">
                <input
                  id="reg-terms"
                  type="checkbox"
                  required
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>
                  Tôi đồng ý với{' '}
                  <span className="font-semibold text-slate-800">Quy chế hoạt động ATB LAND</span> và
                  chính sách bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP.
                </span>
              </label>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 py-3 text-sm font-extrabold shadow-lg shadow-teal-600/25 hover:bg-teal-700"
              >
                {loading ? 'Đang đăng ký và đăng nhập...' : 'Hoàn tất đăng ký cá nhân'}
              </Button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1 text-center text-xs text-slate-500">
              <span>
                Đã có tài khoản?{' '}
                <Link to="/login" className="font-bold text-teal-600 hover:underline">
                  Đăng nhập
                </Link>
              </span>
              <span>
                Đăng ký cho công ty?{' '}
                <Link to="/register-enterprise" className="font-bold text-indigo-600 hover:underline">
                  Tài khoản doanh nghiệp
                </Link>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
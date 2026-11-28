import { Link } from 'react-router-dom';
import logoAtbLand from '../../assets/logo-atb-land.png';

export default function Footer({ onOpenPostGuide }) {
  const currentYear = new Date().getFullYear();

  const handlePostRoomGuide = () => {
    if (typeof onOpenPostGuide === 'function') {
      onOpenPostGuide();
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Thương hiệu */}
          <div className="lg:col-span-1">

              <Link to="/" className="flex items-center gap-2.5 group justify-center mb-4 ">
                  <img
                      src={logoAtbLand}
                      alt="Logo ATB LAND"
                      className="w-30 h-auto object-cover  transition"
                  />
              </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Nền tảng kết nối tìm kiếm phòng trọ, căn hộ dịch vụ và chung cư mini chính chủ, hỗ trợ xem bộ sưu tập ảnh thực tế và đặt lịch hẹn xem phòng minh bạch.
            </p>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Liên kết nhanh
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#danh-sach-phong-tro" className="hover:text-white transition">
                  Tìm phòng trọ
                </a>
              </li>
              <li>
                <a href="#thanh-pho-noi-bat" className="hover:text-white transition">
                  Thành phố nổi bật
                </a>
              </li>
              <li>
                <a href="#danh-sach-ks-resort" className="hover:text-white transition">
                  Khách sạn &amp; Resort
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handlePostRoomGuide}
                  className="hover:text-white transition text-left"
                >
                  Đăng tin cho thuê
                </button>
              </li>
            </ul>
          </div>

          {/* Pháp lý & Quy chế */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Quy chế &amp; Pháp lý
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#cam-ket-phap-ly" className="hover:text-white transition">
                  Quy chế hoạt động sàn giao dịch
                </a>
              </li>
              <li>
                <a href="#cam-ket-phap-ly" className="hover:text-white transition">
                  Chính sách bảo vệ dữ liệu cá nhân
                </a>
              </li>
              <li>
                <a href="#cam-ket-phap-ly" className="hover:text-white transition">
                  Điều khoản đặt lịch xem phòng
                </a>
              </li>
              <li>
                <a href="#cam-ket-phap-ly" className="hover:text-white transition">
                  Cơ chế giải quyết khiếu nại
                </a>
              </li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Hỗ trợ ATB LAND
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                Email: <span className="text-slate-200">hotro@atbland.vn</span>
              </li>
              <li>
                Hotline: <span className="text-slate-200">1900 6868 (08:00 - 21:00)</span>
              </li>
              <li>
                Văn phòng: <span className="text-slate-200">Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {currentYear} ATB LAND. Bản demo giao diện &amp; luồng tương tác.</p>
          <p>Tuân thủ quy định TMĐT &amp; bảo vệ dữ liệu cá nhân tại Việt Nam.</p>
        </div>
      </div>
    </footer>
  );
}
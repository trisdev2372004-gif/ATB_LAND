import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SearchFilterForm from '../components/ui/SearchFilterForm';

const GUESTHOUSE_LISTINGS = [
  {
    id: 'gh-1',
    type: 'GUESTHOUSE',
    typeLabel: 'Nhà nghỉ',
    title: 'Nhà Nghỉ Hoàng Gia – Gần Bến Xe Mỹ Đình',
    city: 'Hà Nội',
    district: 'Cầu Giấy',
    address: 'Số 18 Ngõ 20 Mỹ Đình, Cầu Giấy, Hà Nội',
    price: 350000,
    hourlyPrice: '120.000đ / 2 giờ đầu',
    priceLabel: '350.000đ / đêm',
    area: 22,
    amenities: ['Điều hòa', 'Wifi', 'Bãi đỗ xe'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80',
        caption: 'Phòng đôi tiêu chuẩn sạch sẽ, yên tĩnh',
      },
      {
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
        caption: 'Phòng tắm khép kín nước nóng lạnh 24/7',
      },
    ],
    description:
      'Lễ tân trực 24/24, nhận phòng linh hoạt theo giờ hoặc qua đêm, có chỗ để ô tô/xe máy an toàn.',
  },
  {
    id: 'gh-2',
    type: 'GUESTHOUSE',
    typeLabel: 'Nhà nghỉ',
    title: 'Nhà Nghỉ Sông Hương View – Trung Tâm Huế',
    city: 'Huế',
    district: 'Thuận Hóa',
    address: '12 Nguyễn Công Trứ, Thuận Hóa, Huế',
    price: 300000,
    hourlyPrice: '100.000đ / 2 giờ đầu',
    priceLabel: '300.000đ / đêm',
    area: 24,
    amenities: ['Điều hòa', 'Wifi', 'Ban công', 'Bãi đỗ xe'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=900&q=80',
        caption: 'Phòng ban công thoáng mát ngay trung tâm phố đi bộ',
      },
    ],
    description:
      'Cách cầu Trường Tiền 5 phút đi bộ, chủ nhà thân thiện, hỗ trợ thuê xe máy tham quan Huế.',
  },
  {
    id: 'gh-3',
    type: 'GUESTHOUSE',
    typeLabel: 'Nhà nghỉ',
    title: 'Nhà Nghỉ Bình An – Gần Hàng Xanh & Bến Xe Miền Đông',
    city: 'TP. Hồ Chí Minh',
    district: 'Bình Thạnh',
    address: '142 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP. Hồ Chí Minh',
    price: 420000,
    hourlyPrice: '140.000đ / 2 giờ đầu',
    priceLabel: '420.000đ / đêm',
    area: 25,
    amenities: ['Điều hòa', 'Wifi', 'Bãi đỗ xe'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80',
        caption: 'Giường lớn 1m8, ga gối thay mới mỗi lượt khách',
      },
    ],
    description:
      'Thuận tiện di chuyển qua Quận 1, Thủ Đức và sân bay Tân Sơn Nhất. Không thu cọc trước.',
  },
  {
    id: 'gh-4',
    type: 'HOTEL',
    typeLabel: 'Khách sạn',
    title: 'Boutique Hotel Phố Cổ Hoàn Kiếm',
    city: 'Hà Nội',
    district: 'Hoàn Kiếm',
    address: '34 Hàng Bè, Hoàn Kiếm, Hà Nội',
    price: 1150000,
    hourlyPrice: 'Nhận phòng từ 14:00',
    priceLabel: '1.15 triệu / đêm',
    area: 30,
    amenities: ['Điều hòa', 'Wifi', 'Ăn sáng'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
        caption: 'Phòng nghỉ tiêu chuẩn khách sạn',
      },
    ],
    description: 'Vị trí trung tâm phố cổ, nhận phòng linh hoạt, thanh toán trực tiếp tại quầy.',
  },
  {
    id: 'gh-5',
    type: 'GUESTHOUSE',
    typeLabel: 'Nhà nghỉ',
    title: 'Nhà Nghỉ Vỹ Dạ Xanh – Không Gian Yên Tĩnh',
    city: 'Huế',
    district: 'Vỹ Dạ',
    address: '75 Nguyễn Sinh Cung, Vỹ Dạ, Huế',
    price: 280000,
    hourlyPrice: '90.000đ / 2 giờ đầu',
    priceLabel: '280.000đ / đêm',
    area: 20,
    amenities: ['Điều hòa', 'Wifi', 'Ban công'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
        caption: 'Phòng sáng sủa, đầy đủ tiện nghi cơ bản',
      },
    ],
    description: 'Giá bình dân, sạch sẽ, phù hợp khách công tác ngắn ngày và du lịch bụi.',
  },
  {
    id: 'gh-6',
    type: 'RESORT',
    typeLabel: 'Resort',
    title: 'Lagoon & Beach Resort Lăng Cô',
    city: 'Huế',
    district: 'Lăng Cô',
    address: 'Biển Lăng Cô, Huế',
    price: 2400000,
    hourlyPrice: 'Nghỉ dưỡng trọn gói theo đêm',
    priceLabel: '2.4 triệu / đêm',
    area: 54,
    amenities: ['Điều hòa', 'Wifi', 'Bể bơi', 'Bãi đỗ xe', 'Ăn sáng'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
        caption: 'Hồ bơi & không gian nghỉ dưỡng ven biển',
      },
    ],
    description: 'Không gian nghỉ dưỡng ven biển yên bình, phù hợp gia đình và cặp đôi.',
  },
];

function matchPriceRange(price, range) {
  switch (range) {
    case 'UNDER_2M':
      return price < 2000000;
    case '2M_TO_4M':
      return price >= 2000000 && price <= 4000000;
    case '4M_TO_6M':
      return price > 4000000 && price <= 6000000;
    case 'OVER_6M':
      return price > 6000000;
    default:
      return true;
  }
}

export default function GuesthousesPage() {
  const navigate = useNavigate();
  const [listings] = useState(GUESTHOUSE_LISTINGS);
  const [stayType, setStayType] = useState('ALL');
  const [city, setCity] = useState('ALL');
  const [district, setDistrict] = useState('ALL');
  const [priceRange, setPriceRange] = useState('ALL');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('featured');
  const [savedIds, setSavedIds] = useState([]);
  const [onlySaved, setOnlySaved] = useState(false);

  // State Modal chi tiết & đặt giữ phòng
  const [selectedItem, setSelectedItem] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    phone: '',
    checkInDate: '',
    stayMode: 'QUA_DEM',
  });
  const [toasts, setToasts] = useState([]);

  const showToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const toggleAmenity = (am) => {
    setSelectedAmenities((prev) =>
      prev.includes(am) ? prev.filter((item) => item !== am) : [...prev, am]
    );
  };

  const toggleSaved = (id, e) => {
    if (e) e.stopPropagation();
    setSavedIds((prev) => {
      const exists = prev.includes(id);
      showToast(exists ? 'Đã bỏ lưu khỏi danh sách yêu thích' : 'Đã lưu vào danh sách yêu thích');
      return exists ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const resetAllFilters = () => {
    setStayType('ALL');
    setCity('ALL');
    setDistrict('ALL');
    setPriceRange('ALL');
    setSelectedAmenities([]);
    setOnlySaved(false);
    setSortBy('featured');
  };

  const filteredList = useMemo(() => {
    const result = listings.filter((item) => {
      if (stayType !== 'ALL' && item.type !== stayType) return false;
      if (city !== 'ALL' && item.city !== city) return false;
      if (district !== 'ALL' && item.district !== district) return false;
      if (!matchPriceRange(item.price, priceRange)) return false;
      if (onlySaved && !savedIds.includes(item.id)) return false;
      if (
        selectedAmenities.length > 0 &&
        !selectedAmenities.every((am) => item.amenities.includes(am))
      ) {
        return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') return [...result].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return [...result].sort((a, b) => b.price - a.price);
    if (sortBy === 'area-desc') return [...result].sort((a, b) => b.area - a.area);
    return result;
  }, [listings, stayType, city, district, priceRange, onlySaved, savedIds, selectedAmenities, sortBy]);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.fullName.trim() || !bookingForm.phone.trim()) {
      showToast('Vui lòng nhập họ tên và số điện thoại liên hệ');
      return;
    }
    showToast(`Đã gửi yêu cầu giữ phòng tại "${selectedItem.title}"! Chủ cơ sở sẽ gọi xác nhận.`);
    setBookingForm({ fullName: '', phone: '', checkInDate: '', stayMode: 'QUA_DEM' });
    setSelectedItem(null);
  };

  const activePhotos = selectedItem?.images || [];
  const currentPhoto = activePhotos[photoIndex] || activePhotos[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* Toast thông báo */}
      <div className="fixed top-5 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="px-4 py-3 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold shadow-lg"
          >
            {t.message}
          </div>
        ))}
      </div>



      {/* Banner đầu trang Nhà nghỉ */}
      <section className="bg-gradient-to-br from-slate-900 via-teal-900 to-teal-700 pt-10 pb-14 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Khung bộ lọc dùng chung SearchFilterForm */}
          <div className="bg-white text-slate-800 rounded-3xl shadow-xl p-4 sm:p-6 border border-slate-100">
            <div className="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-slate-100">
              {[
                { key: 'ALL', label: `Tất cả (${listings.length})` },
                { key: 'GUESTHOUSE', label: 'Nhà nghỉ' },
                { key: 'HOTEL', label: 'Khách sạn' },
                { key: 'RESORT', label: 'Resort' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStayType(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                    stayType === tab.key
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <SearchFilterForm
              city={city}
              onCityChange={(e) => setCity(e.target.value)}
              district={district}
              onDistrictChange={setDistrict}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              selectedAmenities={selectedAmenities}
              onToggleAmenity={toggleAmenity}
              onResetFilters={resetAllFilters}
              submitLabel="Tìm nhà nghỉ phù hợp"
            />
          </div>
        </div>
      </section>

      {/* Danh sách kết quả */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Quỹ phòng lưu trú ngắn ngày
            </span>
            <p className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
              Tìm thấy {filteredList.length} cơ sở lưu trú phù hợp
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOnlySaved((prev) => !prev)}
              className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                onlySaved
                  ? 'border-rose-300 bg-rose-50 text-rose-600'
                  : 'border-slate-200 bg-slate-50 hover:bg-rose-50 text-slate-700'
              }`}
            >
              <span>Đã lưu ({savedIds.length})</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sắp xếp"
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-teal-600"
            >
              <option value="featured">Đề xuất nổi bật</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="area-desc">Diện tích: Rộng nhất</option>
            </select>
          </div>
        </div>

        {filteredList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((item) => {
              const isSaved = savedIds.includes(item.id);
              const cover = item.images?.[0]?.url;
              return (
                <article
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setPhotoIndex(0);
                  }}
                  className="group cursor-pointer bg-white rounded-2xl border border-slate-200 hover:border-teal-500 shadow-xs hover:shadow-lg transition overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={cover}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-xs font-bold">
                        {item.typeLabel}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => toggleSaved(item.id, e)}
                        aria-label="Lưu yêu thích"
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition"
                      >
                        <svg
                          className={`w-4 h-4 ${isSaved ? 'text-rose-500 fill-current' : 'text-slate-400'}`}
                          viewBox="0 0 24 24"
                          fill={isSaved ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
                        <span>
                          {item.district}, {item.city}
                        </span>
                        <span>{item.area} m²</span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition line-clamp-2">
                        {item.title}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.address}</p>
                      <p className="text-xs font-semibold text-amber-700 bg-amber-50 inline-block px-2 py-0.5 rounded-md mt-2">
                        {item.hourlyPrice}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.amenities.map((am) => (
                          <span
                            key={am}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                          >
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-teal-700">{item.priceLabel}</span>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-teal-700">
                      Giữ phòng ngay →
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-14 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
            <h3 className="text-base font-bold text-slate-900">
              Không tìm thấy nhà nghỉ phù hợp với bộ lọc
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Bạn hãy thử bỏ bớt tiện ích hoặc chọn khu vực khác.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold transition"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </main>

      {/* Modal chi tiết & giữ phòng nhanh */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-5 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto">
            <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-700">
                  {selectedItem.typeLabel}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                  {selectedItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Đóng"
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-200/70"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
              <div className="relative aspect-[16/9] rounded-2xl bg-slate-100 overflow-hidden">
                <img
                  src={currentPhoto?.url}
                  alt={currentPhoto?.caption || selectedItem.title}
                  className="w-full h-full object-cover"
                />
                {activePhotos.length > 1 && (
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoIndex((i) => (i - 1 + activePhotos.length) % activePhotos.length)
                      }
                      className="px-3 py-1.5 rounded-lg bg-white/90 text-xs font-bold shadow"
                    >
                      ← Trước
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoIndex((i) => (i + 1) % activePhotos.length)}
                      className="px-3 py-1.5 rounded-lg bg-white/90 text-xs font-bold shadow"
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xl font-extrabold text-teal-700">{selectedItem.priceLabel}</p>
                  <p className="text-xs font-semibold text-amber-700">{selectedItem.hourlyPrice}</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Không thu cọc trực tuyến
                </span>
              </div>

              <p className="text-sm text-slate-600">{selectedItem.address}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{selectedItem.description}</p>

              {/* Form giữ phòng nhanh */}
              <form
                onSubmit={handleBookingSubmit}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <h4 className="text-sm font-extrabold text-slate-900">
                  Đặt giữ phòng nhanh (Thanh toán khi nhận phòng)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Họ và tên khách hàng *"
                    value={bookingForm.fullName}
                    onChange={(e) =>
                      setBookingForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-600"
                  />
                  <input
                    type="tel"
                    placeholder="Số điện thoại liên hệ *"
                    value={bookingForm.phone}
                    onChange={(e) =>
                      setBookingForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-600"
                  />
                  <input
                    type="date"
                    value={bookingForm.checkInDate}
                    onChange={(e) =>
                      setBookingForm((prev) => ({ ...prev, checkInDate: e.target.value }))
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-600"
                  />
                  <select
                    value={bookingForm.stayMode}
                    onChange={(e) =>
                      setBookingForm((prev) => ({ ...prev, stayMode: e.target.value }))
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-600"
                  >
                    <option value="QUA_DEM">Thuê qua đêm</option>
                    <option value="THEO_GIO">Thuê theo giờ</option>
                    <option value="NHIEU_NGAY">Thuê nhiều ngày</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm transition"
                >
                  Xác nhận giữ phòng
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
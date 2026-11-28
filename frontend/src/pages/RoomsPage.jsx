import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchFilterForm from '../components/ui/SearchFilterForm';

const ROOM_LISTINGS = [
  {
    id: 'room-101',
    type: 'STUDIO',
    typeLabel: 'Căn hộ Studio',
    title: 'Studio Full Nội Thất Ban Công Rộng Gần Công Viên Cầu Giấy',
    city: 'Hà Nội',
    district: 'Cầu Giấy',
    address: 'Ngõ 120 Trần Thái Tông, Cầu Giấy, Hà Nội',
    price: 4200000,
    priceLabel: '4.2 triệu / tháng',
    utilitiesInfo: 'Điện 3.800đ/kWh • Nước 100k/người • Giờ giấc tự do',
    area: 32,
    amenities: ['Điều hòa', 'Wifi', 'Ban công', 'Bãi đỗ xe'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
        caption: 'Không gian phòng ngủ & tiếp khách rộng rãi',
      },
      {
        url: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=900&q=80',
        caption: 'Khu vực bếp riêng tách biệt mùi',
      },
    ],
    description:
      'Phòng mới bàn giao, trang bị sẵn giường tủ, điều hòa, nóng lạnh, tủ lạnh, máy giặt chung. Thang máy thẻ từ, khóa vân tay 2 lớp an ninh.',
  },
  {
    id: 'room-102',
    type: 'APARTMENT',
    typeLabel: 'Căn hộ dịch vụ',
    title: 'Căn Hộ 1 Phòng Ngủ Cửa Sổ Lớn Gần Ngã Tư Hàng Xanh',
    city: 'TP. Hồ Chí Minh',
    district: 'Bình Thạnh',
    address: '215 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh',
    price: 5500000,
    priceLabel: '5.5 triệu / tháng',
    utilitiesInfo: 'Điện 4.000đ/kWh • Nước 100k/người • Miễn phí gửi 2 xe',
    area: 38,
    amenities: ['Điều hòa', 'Wifi', 'Ban công', 'Bãi đỗ xe'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
        caption: 'Phòng khách tràn ngập ánh sáng tự nhiên',
      },
    ],
    description:
      'Vị trí giáp Quận 1, thuận tiện di chuyển sang các trường đại học HUTECH, UEF, Ngoại Thương. Chính chủ cho thuê, không qua trung gian.',
  },
  {
    id: 'room-103',
    type: 'BOARDING',
    typeLabel: 'Phòng trọ khép kín',
    title: 'Phòng Trọ Gác Xép Mới Xây Gần Đại Học Sư Phạm Huế',
    city: 'Huế',
    district: 'Thuận Hóa',
    address: '48 Lê Lợi, Thuận Hóa, Huế',
    price: 1800000,
    priceLabel: '1.8 triệu / tháng',
    utilitiesInfo: 'Điện 3.500đ/kWh • Nước 60k/người • Không chung chủ',
    area: 25,
    amenities: ['Điều hòa', 'Wifi', 'Bãi đỗ xe'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
        caption: 'Phòng sạch sẽ, kệ bếp ốp đá gọn gàng',
      },
    ],
    description:
      'Khu dân cư yên tĩnh, an ninh tốt, phù hợp sinh viên và người đi làm. Có sân phơi đồ rộng rãi và camera giám sát nhà xe.',
  },
  {
    id: 'room-104',
    type: 'BOARDING',
    typeLabel: 'Phòng trọ khép kín',
    title: 'Phòng Trọ Có Gác Lửng Gần Chùa Láng – Đống Đa',
    city: 'Hà Nội',
    district: 'Đống Đa',
    address: 'Ngõ 82 Chùa Láng, Đống Đa, Hà Nội',
    price: 3200000,
    priceLabel: '3.2 triệu / tháng',
    utilitiesInfo: 'Điện 3.800đ/kWh • Nước 90k/người • Khu vực không ngập',
    area: 24,
    amenities: ['Điều hòa', 'Wifi'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=900&q=80',
        caption: 'Không gian gọn gàng tối ưu diện tích',
      },
    ],
    description:
      'Đi bộ 3 phút ra Đại học Ngoại Thương và Học viện Ngoại Giao, xung quanh nhiều hàng quán, siêu thị tiện lợi.',
  },
  {
    id: 'room-105',
    type: 'STUDIO',
    typeLabel: 'Căn hộ Studio',
    title: 'Studio View Thoáng Gần Khu Công Nghệ Cao Thủ Đức',
    city: 'TP. Hồ Chí Minh',
    district: 'TP. Thủ Đức',
    address: '102 Lê Văn Việt, TP. Thủ Đức, TP. Hồ Chí Minh',
    price: 3900000,
    priceLabel: '3.9 triệu / tháng',
    utilitiesInfo: 'Điện 3.800đ/kWh • Nước 80k/người • Ra vào vân tay',
    area: 30,
    amenities: ['Điều hòa', 'Wifi', 'Ban công', 'Bãi đỗ xe'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80',
        caption: 'Nội thất hiện đại, dọn vào ở ngay',
      },
    ],
    description:
      'Tòa nhà mới vận hành, hành lang rộng, có nhân viên vệ sinh khu vực chung hàng tuần.',
  },
  {
    id: 'room-106',
    type: 'APARTMENT',
    typeLabel: 'Căn hộ dịch vụ',
    title: 'Căn Hộ Mini Yên Tĩnh Gần Cồn Hến – Vỹ Dạ',
    city: 'Huế',
    district: 'Vỹ Dạ',
    address: '64 Nguyễn Sinh Cung, Vỹ Dạ, Huế',
    price: 2900000,
    priceLabel: '2.9 triệu / tháng',
    utilitiesInfo: 'Điện 3.500đ/kWh • Nước 70k/người • Miễn phí Wifi',
    area: 34,
    amenities: ['Điều hòa', 'Wifi', 'Ban công'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
        caption: 'Phòng rộng rãi có cửa sổ đón gió sông Hương',
      },
    ],
    description:
      'Đầy đủ nội thất cơ bản, hợp đồng rõ ràng minh bạch, hỗ trợ đăng ký tạm trú đầy đủ.',
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

export default function RoomsPage() {
  const navigate = useNavigate();
  const [listings] = useState(ROOM_LISTINGS);
  const [roomType, setRoomType] = useState('ALL');
  const [city, setCity] = useState('ALL');
  const [district, setDistrict] = useState('ALL');
  const [priceRange, setPriceRange] = useState('ALL');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('featured');
  const [savedIds, setSavedIds] = useState([]);
  const [onlySaved, setOnlySaved] = useState(false);

  // State Modal chi tiết & đặt lịch xem phòng
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [viewingForm, setViewingForm] = useState({
    fullName: '',
    phone: '',
    visitDate: '',
    visitTime: 'SANG',
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
    setRoomType('ALL');
    setCity('ALL');
    setDistrict('ALL');
    setPriceRange('ALL');
    setSelectedAmenities([]);
    setOnlySaved(false);
    setSortBy('featured');
  };

  const filteredRooms = useMemo(() => {
    const result = listings.filter((item) => {
      if (roomType !== 'ALL' && item.type !== roomType) return false;
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
  }, [listings, roomType, city, district, priceRange, onlySaved, savedIds, selectedAmenities, sortBy]);

  const handleViewingSubmit = (e) => {
    e.preventDefault();
    if (!viewingForm.fullName.trim() || !viewingForm.phone.trim()) {
      showToast('Vui lòng nhập họ tên và số điện thoại để hẹn xem phòng');
      return;
    }
    showToast(
      `Đã đặt lịch xem phòng "${selectedRoom.title}"! Chủ trọ sẽ liên hệ xác nhận trong ít phút.`
    );
    setViewingForm({ fullName: '', phone: '', visitDate: '', visitTime: 'SANG' });
    setSelectedRoom(null);
  };

  const activePhotos = selectedRoom?.images || [];
  const currentPhoto = activePhotos[photoIndex] || activePhotos[0];

  return (
    <div class="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* Toast thông báo */}
      <div class="fixed top-5 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            class="px-4 py-3 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold shadow-lg"
          >
            {t.message}
          </div>
        ))}
      </div>


      {/* Banner đầu trang Phòng trọ */}
      <section class="bg-gradient-to-br from-slate-900 via-teal-900 to-teal-700 pt-10 pb-14 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Khung bộ lọc dùng chung SearchFilterForm */}
          <div class="bg-white text-slate-800 rounded-3xl shadow-xl p-4 sm:p-6 border border-slate-100">
            <div class="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-slate-100">
              {[
                { key: 'ALL', label: `Tất cả (${listings.length})` },
                { key: 'BOARDING', label: 'Phòng trọ khép kín' },
                { key: 'STUDIO', label: 'Căn hộ Studio' },
                { key: 'APARTMENT', label: 'Căn hộ dịch vụ' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setRoomType(tab.key)}
                  class={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                    roomType === tab.key
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
              submitLabel="Tìm phòng trọ phù hợp"
            />
          </div>
        </div>
      </section>

      {/* Danh sách kết quả phòng trọ */}
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        <div class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-teal-700">
              Quỹ phòng cho thuê theo tháng
            </span>
            <p class="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
              Tìm thấy {filteredRooms.length} phòng trọ &amp; căn hộ phù hợp
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOnlySaved((prev) => !prev)}
              class={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
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
              class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-teal-600"
            >
              <option value="featured">Đề xuất nổi bật</option>
              <option value="price-asc">Giá thuê: Thấp đến cao</option>
              <option value="price-desc">Giá thuê: Cao đến thấp</option>
              <option value="area-desc">Diện tích: Rộng nhất</option>
            </select>
          </div>
        </div>

        {filteredRooms.length > 0 ? (
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((item) => {
              const isSaved = savedIds.includes(item.id);
              const cover = item.images?.[0]?.url;
              return (
                <article
                  key={item.id}
                  onClick={() => {
                    setSelectedRoom(item);
                    setPhotoIndex(0);
                  }}
                  class="group cursor-pointer bg-white rounded-2xl border border-slate-200 hover:border-teal-500 shadow-xs hover:shadow-lg transition overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div class="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={cover}
                        alt={item.title}
                        class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-xs font-bold">
                        {item.typeLabel}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => toggleSaved(item.id, e)}
                        aria-label="Lưu yêu thích"
                        class="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition"
                      >
                        <svg
                          class={`w-4 h-4 ${isSaved ? 'text-rose-500 fill-current' : 'text-slate-400'}`}
                          viewBox="0 0 24 24"
                          fill={isSaved ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                    </div>

                    <div class="p-4">
                      <div class="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
                        <span>
                          {item.district}, {item.city}
                        </span>
                        <span>{item.area} m²</span>
                      </div>
                      <h2 class="text-base font-bold text-slate-900 group-hover:text-teal-700 transition line-clamp-2">
                        {item.title}
                      </h2>
                      <p class="text-xs text-slate-500 mt-1 line-clamp-2">{item.address}</p>
                      <p class="text-[11px] font-semibold text-teal-800 bg-teal-50 inline-block px-2 py-0.5 rounded-md mt-2">
                        {item.utilitiesInfo}
                      </p>

                      <div class="flex flex-wrap gap-1.5 mt-3">
                        {item.amenities.map((am) => (
                          <span
                            key={am}
                            class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                          >
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div class="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span class="text-sm font-extrabold text-teal-700">{item.priceLabel}</span>
                    <span class="text-xs font-bold text-slate-700 group-hover:text-teal-700">
                      Hẹn xem phòng →
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div class="text-center py-14 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
            <h3 class="text-base font-bold text-slate-900">
              Không tìm thấy phòng trọ phù hợp với bộ lọc
            </h3>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              Bạn hãy thử bỏ bớt tiện ích hoặc chọn khu vực khác.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              class="mt-4 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold transition"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </main>

      {/* Modal chi tiết & đặt lịch xem phòng */}
      {selectedRoom && (
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-5 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div class="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto">
            <div class="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-700">
                  {selectedRoom.typeLabel}
                </span>
                <h3 class="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                  {selectedRoom.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                aria-label="Đóng"
                class="p-2 rounded-xl text-slate-500 hover:bg-slate-200/70"
              >
                ✕
              </button>
            </div>

            <div class="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
              <div class="relative aspect-[16/9] rounded-2xl bg-slate-100 overflow-hidden">
                <img
                  src={currentPhoto?.url}
                  alt={currentPhoto?.caption || selectedRoom.title}
                  class="w-full h-full object-cover"
                />
                {activePhotos.length > 1 && (
                  <div class="absolute bottom-3 right-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoIndex((i) => (i - 1 + activePhotos.length) % activePhotos.length)
                      }
                      class="px-3 py-1.5 rounded-lg bg-white/90 text-xs font-bold shadow"
                    >
                      ← Trước
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoIndex((i) => (i + 1) % activePhotos.length)}
                      class="px-3 py-1.5 rounded-lg bg-white/90 text-xs font-bold shadow"
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </div>

              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p class="text-xl font-extrabold text-teal-700">{selectedRoom.priceLabel}</p>
                  <p class="text-xs font-semibold text-teal-800">{selectedRoom.utilitiesInfo}</p>
                </div>
                <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Xem phòng trực tiếp miễn phí
                </span>
              </div>

              <p class="text-sm text-slate-600">{selectedRoom.address}</p>
              <p class="text-sm text-slate-600 leading-relaxed">{selectedRoom.description}</p>

              {/* Form hẹn lịch xem phòng */}
              <form
                onSubmit={handleViewingSubmit}
                class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <h4 class="text-sm font-extrabold text-slate-900">
                  Đặt lịch hẹn xem phòng trực tiếp
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Họ và tên người thuê *"
                    value={viewingForm.fullName}
                    onChange={(e) =>
                      setViewingForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    class="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-600"
                  />
                  <input
                    type="tel"
                    placeholder="Số điện thoại liên hệ *"
                    value={viewingForm.phone}
                    onChange={(e) =>
                      setViewingForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    class="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-600"
                  />
                  <input
                    type="date"
                    value={viewingForm.visitDate}
                    onChange={(e) =>
                      setViewingForm((prev) => ({ ...prev, visitDate: e.target.value }))
                    }
                    class="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-600"
                  />
                  <select
                    value={viewingForm.visitTime}
                    onChange={(e) =>
                      setViewingForm((prev) => ({ ...prev, visitTime: e.target.value }))
                    }
                    class="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-600"
                  >
                    <option value="SANG">Buổi sáng (08:30 - 11:30)</option>
                    <option value="CHIEU">Buổi chiều (14:00 - 17:30)</option>
                    <option value="TOI">Buổi tối (18:00 - 20:30)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  class="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm transition"
                >
                  Xác nhận lịch hẹn xem phòng
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}
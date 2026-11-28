import { useEffect, useMemo, useState } from 'react';
import HeroSearch from '../components/layout/user/HeroSearch';
import NearbyMapSection from '../components/map/NearbyMapSection';

const DISTRICTS_BY_CITY = {
  'Hà Nội': ['Cầu Giấy', 'Đống Đa', 'Tây Hồ', 'Hoàn Kiếm', 'Ba Đình'],
  'TP. Hồ Chí Minh': ['Bình Thạnh', 'Quận 1', 'TP. Thủ Đức', 'Quận 7', 'Phú Nhuận'],
  'Huế': ['Thuận Hóa', 'Phú Xuân', 'Vỹ Dạ', 'Lăng Cô', 'Thuận An'],
};

const FEATURED_CITIES = [
  {
    name: 'Hà Nội',
    region: 'Miền Bắc',
    available: '128 chỗ ở trống',
    districts: 'Cầu Giấy, Đống Đa, Tây Hồ, Hoàn Kiếm, Ba Đình',
    priceRange: '1.1 – 5.2 triệu',
    image:
      'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'TP. Hồ Chí Minh',
    region: 'Miền Nam',
    available: '154 chỗ ở trống',
    districts: 'Bình Thạnh, Quận 1, Thủ Đức, Quận 7, Phú Nhuận',
    priceRange: '1.4 – 6.8 triệu',
    image:
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Huế',
    region: 'Miền Trung',
    available: '82 chỗ ở trống',
    districts: 'Thuận Hóa, Phú Xuân, Vỹ Dạ, Lăng Cô, Thuận An',
    priceRange: '0.9 – 4.5 triệu',
    image:
      'https://focusasiatravel.vn/wp-content/uploads/2018/09/Kinh-th%C3%A0nh-Hu%E1%BA%BF1.jpg',
  },
  {
    name: 'Đà Nẵng',
    region: 'Miền Trung',
    available: '96 chỗ ở trống',
    districts: 'Hải Châu, Sơn Trà, Ngũ Hành Sơn, Thanh Khê',
    priceRange: '1.2 – 5.8 triệu',
    image:
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Đà Lạt',
    region: 'Tây Nguyên',
    available: '64 chỗ ở trống',
    districts: 'Phường 1, Phường 2, Xuân Hương, Trại Mát',
    priceRange: '0.8 – 4.2 triệu',
    image:
      'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=600&q=80',
  },
];

const INITIAL_LISTINGS = [
  {
    id: 'room-1',
    category: 'ROOM',
    title: 'Studio Full Nội Thất Gần Công Viên Cầu Giấy',
    city: 'Hà Nội',
    district: 'Cầu Giấy',
    address: 'Ngõ 120 Trần Thái Tông, Cầu Giấy, Hà Nội',
    price: 4200000,
    priceLabel: '4.2 triệu / tháng',
    area: 32,
    amenities: ['Điều hòa', 'Wifi', 'Ban công'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
        caption: 'Không gian phòng khách & giường ngủ',
      },
    ],
    description: 'Phòng studio thoáng sáng, giờ giấc tự do, thang máy và camera 24/7.',
  },
  {
    id: 'room-2',
    category: 'ROOM',
    title: 'Căn Hộ Dịch Vụ Ban Công Thoáng Gần Hàng Xanh',
    city: 'TP. Hồ Chí Minh',
    district: 'Bình Thạnh',
    address: '215 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh',
    price: 5500000,
    priceLabel: '5.5 triệu / tháng',
    area: 38,
    amenities: ['Điều hòa', 'Wifi', 'Ban công', 'Bãi đỗ xe'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
        caption: 'Ban công đón nắng & khu bếp nhỏ',
      },
    ],
    description: 'Thuận tiện di chuyển sang Quận 1 và Thủ Đức, hỗ trợ xem phòng trực tiếp.',
  },
  {
    id: 'room-3',
    category: 'ROOM',
    title: 'Phòng Trọ Yên Tĩnh Gần Sông Hương',
    city: 'Huế',
    district: 'Thuận Hóa',
    address: '48 Lê Lợi, Thuận Hóa, Huế',
    price: 1800000,
    priceLabel: '1.8 triệu / tháng',
    area: 25,
    amenities: ['Điều hòa', 'Wifi'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
        caption: 'Phòng gọn gàng, sạch sẽ',
      },
    ],
    description: 'Khu dân cư an ninh, gần trường học và trung tâm thành phố Huế.',
  },
  {
    id: 'stay-1',
    category: 'HOTEL',
    title: 'Boutique Hotel Phố Cổ Hoàn Kiếm',
    city: 'Hà Nội',
    district: 'Hoàn Kiếm',
    address: '34 Hàng Bè, Hoàn Kiếm, Hà Nội',
    price: 1150000,
    priceLabel: '1.15 triệu / đêm',
    area: 30,
    stars: 4,
    amenities: ['Điều hòa', 'Wifi', 'Ăn sáng'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
        caption: 'Phòng nghỉ tiêu chuẩn khách sạn',
      },
    ],
    description: 'Vị trí trung tâm phố cổ, nhận phòng linh hoạt, không thu cọc trước.',
  },
  {
    id: 'stay-2',
    category: 'RESORT',
    title: 'Lagoon & Beach Resort Lăng Cô',
    city: 'Huế',
    district: 'Lăng Cô',
    address: 'Biển Lăng Cô, Huế',
    price: 2400000,
    priceLabel: '2.4 triệu / đêm',
    area: 54,
    stars: 5,
    amenities: ['Điều hòa', 'Wifi', 'Bể bơi', 'Bãi đỗ xe', 'Ăn sáng'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
        caption: 'Hồ bơi & không gian nghỉ dưỡng',
      },
    ],
    description: 'Không gian nghỉ dưỡng ven biển yên bình, phù hợp gia đình và cặp đôi.',
  },
  {
    id: 'stay-3',
    category: 'HOTEL',
    title: 'City Center Suite Quận 1',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    address: '89 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    price: 1650000,
    priceLabel: '1.65 triệu / đêm',
    area: 35,
    stars: 4,
    amenities: ['Điều hòa', 'Wifi', 'Bể bơi', 'Ăn sáng'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80',
        caption: 'Phòng suite hiện đại trung tâm',
      },
    ],
    description: 'Gần các tuyến phố đi bộ, nhà hàng và trung tâm thương mại.',
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

export default function Home() {
  const navigate = useNavigate();
  const cityScrollRef = useRef(null);

  const [listings] = useState(INITIAL_LISTINGS);
  const [category, setCategory] = useState('ALL');
  const [city, setCity] = useState('ALL');
  const [district, setDistrict] = useState('ALL');
  const [priceRange, setPriceRange] = useState('ALL');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('featured');
  const [savedIds, setSavedIds] = useState([]);
  const [onlySaved, setOnlySaved] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [toasts, setToasts] = useState([]);

  const showToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const scrollCities = (direction) => {
    if (!cityScrollRef.current) return;
    const scrollAmount = 300;
    cityScrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const availableDistricts = useMemo(() => {
    if (city === 'ALL') {
      return Object.values(DISTRICTS_BY_CITY).flat();
    }
    return DISTRICTS_BY_CITY[city] || [];
  }, [city]);

  const handleCityChange = (e) => {
    setCity(e.target.value);
    setDistrict('ALL');
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const toggleSaved = (id, e) => {
    if (e) e.stopPropagation();
    setSavedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      showToast(
        exists ? 'Đã bỏ lưu khỏi danh sách yêu thích' : 'Đã lưu vào danh sách yêu thích'
      );
      return next;
    });
  };

  const resetAllFilters = () => {
    setCategory('ALL');
    setCity('ALL');
    setDistrict('ALL');
    setPriceRange('ALL');
    setSelectedAmenities([]);
    setOnlySaved(false);
    setSortBy('featured');
  };

  const filterByFeaturedCity = (selectedCity) => {
    setCity(selectedCity);
    setDistrict('ALL');
    document.getElementById('danh-sach-cho-o')?.scrollIntoView({ behavior: 'smooth' });
    showToast(`Đang lọc chỗ ở tại ${selectedCity}`);
  };

  const filteredListings = useMemo(() => {
    const list = listings.filter((item) => {
      if (category !== 'ALL' && item.category !== category) return false;
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

    if (sortBy === 'price-asc') return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'area-desc') return [...list].sort((a, b) => b.area - a.area);
    return list;
  }, [
    listings,
    category,
    city,
    district,
    priceRange,
    onlySaved,
    savedIds,
    selectedAmenities,
    sortBy,
  ]);

  const rooms = filteredListings.filter((item) => item.category === 'ROOM');
  const stays = filteredListings.filter(
    (item) => item.category === 'HOTEL' || item.category === 'RESORT'
  );

  useEffect(() => {
    if (selectedListing) {
      setPhotoIndex(0);
    }
  }, [selectedListing]);

  const openDetailModal = (item) => {
    setSelectedListing(item);
    setPhotoIndex(0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    document.getElementById('danh-sach-cho-o')?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderCard = (item) => {
    const isSaved = savedIds.includes(item.id);
    const cover = item.images?.[0]?.url || 'https://placehold.co/800x500?text=ATB+LAND';

    return (
      <article
        key={item.id}
        onClick={() => openDetailModal(item)}
        class="group cursor-pointer bg-white rounded-2xl border border-slate-200 hover:border-accent-500 shadow-xs hover:shadow-lg transition overflow-hidden flex flex-col justify-between"
      >
        <div>
          <div class="relative h-48 bg-slate-100 overflow-hidden">
            <img
              src={cover}
              alt={item.title}
              class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
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
            <h3 class="text-base font-bold text-slate-900 group-hover:text-accent-600 transition line-clamp-2">
              {item.title}
            </h3>
            <p class="text-xs text-slate-500 mt-1 line-clamp-2">{item.address}</p>

            <div class="flex flex-wrap gap-1.5 mt-3">
              {item.amenities.slice(0, 3).map((am) => (
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
          <span class="text-sm font-extrabold text-accent-600">{item.priceLabel}</span>
          <span class="text-xs font-bold text-slate-700 group-hover:text-accent-600">
            Xem chi tiết →
          </span>
        </div>
      </article>
    );
  };

  const activePhotos = selectedListing?.images || [];
  const currentPhoto = activePhotos[photoIndex] || activePhotos[0];

  return (
    <div class="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* Toast */}
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


    <HeroSearch
    totalListings={listings.length}
    category={category}
    onCategoryChange={setCategory}
    city={city}
    onCityChange={handleCityChange}
    district={district}
    onDistrictChange={setDistrict}
    availableDistricts={availableDistricts}
    priceRange={priceRange}
    onPriceRangeChange={setPriceRange}
    selectedAmenities={selectedAmenities}
    onToggleAmenity={toggleAmenity}
    onResetFilters={resetAllFilters}
    onSearchSubmit={handleSearchSubmit}
    />

{/* <NearbyMapSection /> */}
      {/* 3. THÀNH PHỐ NỔI BẬT */}
      <section id="thanh-pho-noi-bat" class="bg-white border-b border-slate-200 py-12 sm:py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-accent-600">
                Khám phá theo điểm đến
              </span>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Thành phố nổi bật
              </h2>
            </div>
            <p class="text-sm text-slate-500">
              Bấm vào từng thẻ thành phố để lọc nhanh quỹ phòng trọ, khách sạn &amp; resort
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => filterByFeaturedCity('Hà Nội')}
              role="button"
              tabIndex={0}
              class="group cursor-pointer rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white p-5 hover:border-teal-500 hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <div class="relative h-36 rounded-xl overflow-hidden mb-4 bg-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=800&q=80"
                    alt="Thành phố Hà Nội"
                    class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                  <div class="absolute top-3 left-3">
                    <span class="px-2.5 py-1 rounded-lg bg-white/90 text-teal-800 text-xs font-bold">
                      Miền Bắc
                    </span>
                  </div>
                  <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <h3 class="text-xl font-extrabold">Hà Nội</h3>
                    <span class="text-xs font-bold bg-emerald-500/90 px-2.5 py-1 rounded-lg">
                      128 chỗ ở trống
                    </span>
                  </div>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">
                  <strong class="text-slate-800">Khu vực trọng điểm:</strong> Cầu Giấy, Đống Đa, Tây Hồ, Hoàn Kiếm, Ba Đình.
                </p>
              </div>
              <div class="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span class="text-slate-600">
                  Giá phổ biến: <strong class="text-accent-600 text-sm">1.1 – 5.2 triệu</strong>
                </span>
                <span class="font-bold text-accent-600 group-hover:translate-x-1 transition">
                  Xem phòng →
                </span>
              </div>

            </div>
          </div>

            <div
              onClick={() => filterByFeaturedCity('TP. Hồ Chí Minh')}
              role="button"
              tabIndex={0}
              class="group cursor-pointer rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white p-5 hover:border-teal-500 hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <div class="relative h-36 rounded-xl overflow-hidden mb-4 bg-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80"
                    alt="TP. Hồ Chí Minh"
                    class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                  <div class="absolute top-3 left-3">
                    <span class="px-2.5 py-1 rounded-lg bg-white/90 text-teal-800 text-xs font-bold">
                      Miền Nam
                    </span>
                  </div>
                  <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <h3 class="text-xl font-extrabold">TP. Hồ Chí Minh</h3>
                    <span class="text-xs font-bold bg-emerald-500/90 px-2.5 py-1 rounded-lg">
                      154 chỗ ở trống
                    </span>
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white gap-1">
                      <h3 className="text-base font-extrabold truncate">{cityItem.name}</h3>
                      <span className="shrink-0 text-[10px] font-bold bg-emerald-500/90 px-2 py-0.5 rounded-md">
                        {cityItem.available}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-1">
                    <strong className="text-slate-800">Khu vực:</strong> {cityItem.districts}
                  </p>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">
                  <strong class="text-slate-800">Khu vực trọng điểm:</strong> Bình Thạnh, Quận 1, TP. Thủ Đức, Quận 7, Phú Nhuận.
                </p>
              </div>
              <div class="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span class="text-slate-600">
                  Giá phổ biến: <strong class="text-accent-600 text-sm">1.4 – 6.8 triệu</strong>
                </span>
                <span class="font-bold text-accent-600 group-hover:translate-x-1 transition">
                  Xem phòng →
                </span>
              </div>
            </div>

            <div
              onClick={() => filterByFeaturedCity('Huế')}
              role="button"
              tabIndex={0}
              class="group cursor-pointer rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white p-5 hover:border-teal-500 hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <div class="relative h-36 rounded-xl overflow-hidden mb-4 bg-slate-200">
                  <img
                    src="https://focusasiatravel.vn/wp-content/uploads/2018/09/Kinh-th%C3%A0nh-Hu%E1%BA%BF1.jpg"
                    alt="Thành phố Huế"
                    class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                  <div class="absolute top-3 left-3">
                    <span class="px-2.5 py-1 rounded-lg bg-white/90 text-teal-800 text-xs font-bold">
                      Miền Trung
                    </span>
                  </div>
                  <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <h3 class="text-xl font-extrabold">Huế</h3>
                    <span class="text-xs font-bold bg-emerald-500/90 px-2.5 py-1 rounded-lg">
                      82 chỗ ở trống
                    </span>
                  </div>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">
                  <strong class="text-slate-800">Khu vực trọng điểm:</strong> Thuận Hóa, Phú Xuân, Vỹ Dạ, Lăng Cô, Thuận An.
                </p>
              </div>
              <div class="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span class="text-slate-600">
                  Giá phổ biến: <strong class="text-accent-600 text-sm">0.9 – 4.5 triệu</strong>
                </span>
                <span class="font-bold text-accent-600 group-hover:translate-x-1 transition">
                  Xem phòng →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DANH SÁCH CHỖ Ở */}
      <div id="danh-sach-cho-o" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-accent-600">
              Cập nhật quỹ phòng theo thời gian thực
            </span>
            <p class="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
              Hiển thị {rooms.length} phòng trọ &amp; căn hộ và {stays.length} khách sạn &amp; resort
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOnlySaved((prev) => !prev)}
              class={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                onlySaved
                  ? 'border-rose-300 bg-rose-50 text-rose-600'
                  : 'border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 text-slate-700'
              }`}
            >
              <svg class="w-4 h-4 text-rose-500 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>Đã lưu ({savedIds.length})</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sắp xếp chỗ ở"
              class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-accent-600"
            >
              <option value="featured">Đề xuất nổi bật</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="area-desc">Diện tích: Rộng nhất</option>
            </select>
          </div>
        </div>

        {/* KHU VỰC 1: PHÒNG TRỌ & CĂN HỘ */}
        <section id="danh-sach-phong-tro" class="scroll-mt-24">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 mb-6 border-b-2 border-accent-600/20">
            <div>
              <span class="inline-block px-2.5 py-0.5 rounded-lg bg-teal-100 text-accent-600 text-xs font-bold uppercase tracking-wider">
                Thuê dài hạn theo tháng • Hẹn lịch xem phòng
              </span>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
                Phòng trọ &amp; Căn hộ
              </h2>
              <p class="text-sm font-semibold text-accent-600 mt-1">
                {rooms.length} phòng trọ &amp; căn hộ
              </p>
            </div>
            <p class="text-xs sm:text-sm text-slate-500">
              Minh bạch giá/tháng, điện nước &amp; đặt lịch xem trực tiếp
            </p>
          </div>

          {rooms.length > 0 ? (
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map(renderCard)}
            </div>
          ) : (
            <div class="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-300 mt-4">
              <h3 class="text-base font-bold text-slate-900">
                Không có phòng trọ &amp; căn hộ phù hợp
              </h3>
              <p class="text-xs sm:text-sm text-slate-500 mt-1">
                Thử đổi thành phố, mức giá hoặc đặt lại bộ lọc để xem các phòng trọ &amp; căn hộ khác.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                class="mt-4 px-4 py-2 rounded-xl bg-accent-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold transition"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}
        </section>

        {/* KHU VỰC 2: KHÁCH SẠN & RESORT */}
        <section id="danh-sach-ks-resort" class="scroll-mt-24">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 mb-6 border-b-2 border-accent-600/25">
            <div>
              <span class="inline-block px-2.5 py-0.5 rounded-lg bg-teal-100 text-accent-600 text-xs font-bold uppercase tracking-wider">
                Lưu trú theo đêm • Không thu cọc trước
              </span>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
                Khách sạn &amp; Resort
              </h2>
              <p class="text-sm font-semibold text-accent-600 mt-1">
                {stays.length} khách sạn &amp; resort
              </p>
            </div>
            <p class="text-xs sm:text-sm text-slate-500">
              Hiển thị giá/đêm, hạng sao &amp; thanh toán trực tiếp tại nơi ở
            </p>
          </div>

          {stays.length > 0 ? (
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stays.map(renderCard)}
            </div>
          ) : (
            <div class="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-300 mt-4">
              <h3 class="text-base font-bold text-slate-900">
                Không có khách sạn &amp; resort phù hợp
              </h3>
              <p class="text-xs sm:text-sm text-slate-500 mt-1">
                Thử đổi thành phố, mức giá hoặc đặt lại bộ lọc để xem các khách sạn &amp; resort khác.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                class="mt-4 px-4 py-2 rounded-xl bg-accent-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold transition"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}
        </section>
      </div>

      {/* 5. CAM KẾT PHÁP LÝ & DÀNH CHO CHỦ TRỌ */}
      <section
        id="cam-ket-phap-ly"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14"
      >
        <div
          id="danh-cho-chu-tro"
          className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold mb-3">
                Minh bạch &amp; An toàn
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                Cam kết pháp lý &amp; đồng hành cùng Chủ trọ
              </h2>
              <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
                ATB LAND không thu cọc giữ chỗ qua nền tảng, khuyến khích khách xem phòng thực tế và hỗ trợ chủ cơ sở đăng tin, quản lý lịch hẹn nhanh gọn.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="font-bold text-teal-300">0đ Phí giữ chỗ trước</p>
                <p className="text-slate-300 mt-1">
                  Thanh toán hoặc làm hợp đồng trực tiếp với chủ cơ sở.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="font-bold text-teal-300">Thông tin rõ ràng</p>
                <p className="text-slate-300 mt-1">
                  Giá thuê, khu vực và tiện ích hiển thị minh bạch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MODAL CHI TIẾT */}
      {selectedListing && (
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div class="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto">
            <div class="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
              <div>
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-accent-600">
                    {selectedListing.category}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    ✓ Xác thực chính chủ
                  </span>
                </div>
                <h3 class="text-lg sm:text-xl font-extrabold text-slate-900">
                  {selectedListing.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedListing(null)}
                aria-label="Đóng chi tiết"
                class="p-2 rounded-xl text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 transition"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div class="space-y-3">
                <div class="relative aspect-[16/9] sm:aspect-[16/8] rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                  <img
                    src={currentPhoto?.url}
                    alt={currentPhoto?.caption || selectedListing.title}
                    class="w-full h-full object-cover"
                  />
                  {activePhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setPhotoIndex(
                            (i) => (i - 1 + activePhotos.length) % activePhotos.length
                          )
                        }
                        aria-label="Ảnh trước"
                        class="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md transition"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPhotoIndex((i) => (i + 1) % activePhotos.length)
                        }
                        aria-label="Ảnh tiếp theo"
                        class="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md transition"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                  <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    <span class="px-3 py-1 rounded-full bg-slate-900/75 text-white text-xs font-semibold">
                      {currentPhoto?.caption || selectedListing.title}
                    </span>
                    <span class="px-3 py-1 rounded-full bg-slate-900/75 text-white text-xs font-bold">
                      {photoIndex + 1} / {activePhotos.length}
                    </span>
                  </div>
                </div>

                <div class="grid grid-cols-4 gap-2.5">
                  {activePhotos.map((img, idx) => (
                    <button
                      key={img.url + idx}
                      type="button"
                      onClick={() => setPhotoIndex(idx)}
                      class={`h-16 rounded-xl overflow-hidden border-2 transition ${
                        idx === photoIndex ? 'border-accent-600' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.caption} class="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex flex-wrap items-baseline justify-between gap-2">
                  <div class="text-2xl font-extrabold text-accent-600">
                    {selectedListing.priceLabel}
                  </div>
                  <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Không thu cọc trước
                  </span>
                </div>
                <p class="text-sm text-slate-600 font-medium">{selectedListing.address}</p>
                <p class="text-sm text-slate-600 leading-relaxed">{selectedListing.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <section id="danh-cho-chu-tro" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div class="bg-gray-500 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-12">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-7">
            <span class="inline-block px-3 py-1 rounded-full bg-accent-500/20 text-teal-300 text-xs font-bold border border-accent-500/30 mb-3">
                DÀNH CHO CHỦ TRỌ &amp; NHÀ ĐẦU TƯ
            </span>
            <h2 class="text-2xl sm:text-3xl font-extrabold leading-snug">
                Quản lý phòng trống, bộ sưu tập ảnh &amp; lịch hẹn xem phòng tập trung
            </h2>
            <p class="text-slate-300 text-sm sm:text-base mt-3">
                Đăng tin trực tiếp trên giao diện hiện đại, tải nhiều góc ảnh thực tế, bật/tắt trạng thái phòng chỉ với 1 chạm và tiếp nhận lịch hẹn xem phòng rõ ràng.
            </p>
            <div class="mt-6 flex flex-wrap gap-3">
                <button type="button" onclick="openPostRoomGuide()" class="px-5 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-sm font-bold transition shadow-md">
                Đăng tin cho thuê ngay
                </button>
                <a href="#cam-ket-phap-ly" class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition">
                Xem quy chế vận hành
                </a>
            </div>
            </div>

            <div class="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <div class="text-sm font-bold text-teal-300">Chủ trọ Xác thực</div>
                <p class="text-xs text-slate-200 mt-1">Gắn huy hiệu uy tín khi xác minh thông tin chủ sở hữu hoặc hợp đồng quản lý.</p>
            </div>
            <div class="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <div class="text-sm font-bold text-teal-300">Tự động ẩn sau 21 ngày</div>
                <p class="text-xs text-slate-200 mt-1">Yêu cầu xác nhận còn phòng định kỳ để đảm bảo dữ liệu luôn chính xác.</p>
            </div>
            <div class="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <div class="text-sm font-bold text-teal-300">Ảnh thực tế đa góc nhìn</div>
                <p class="text-xs text-slate-200 mt-1">Hiển thị đầy đủ không gian phòng, khu bếp, nhà vệ sinh và ban công trước khi hẹn xem.</p>
            </div>
            <div class="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <div class="text-sm font-bold text-teal-300">Báo cáo tin sai sự thật</div>
                <p class="text-xs text-slate-200 mt-1">Cơ chế tiếp nhận phản hồi từ người tìm thuê để kiểm duyệt và xử lý kịp thời.</p>
            </div>
            </div>
        </div>
        </div>


        <div id="cam-ket-phap-ly" class="pt-2">
        <div class="text-center max-w-2xl mx-auto mb-8">
            <span class="text-xs font-bold uppercase tracking-wider text-accent-600">Minh bạch &amp; An toàn</span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Cam kết chống tin ảo &amp; Tuân thủ pháp lý
            </h2>
            <p class="text-sm text-slate-600 mt-2">
            ATB LAND xây dựng quy chuẩn vận hành rõ ràng, bảo vệ quyền lợi người thuê, chủ trọ và tuân thủ quy định pháp luật tại Việt Nam.
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">01</div>
            <h3 class="text-base font-bold text-slate-900">Chống tin ảo &amp; Môi giới mạo danh</h3>
            <p class="text-sm text-slate-600 mt-2 leading-relaxed">
                Kiểm duyệt nội dung trước khi đăng, yêu cầu xác thực thông tin chủ cho thuê, tự động ẩn tin sau 21 ngày nếu không xác nhận còn trống và hỗ trợ nút báo cáo tin sai sự thật.
            </p>
            </div>

            <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold mb-4">02</div>
            <h3 class="text-base font-bold text-slate-900">Minh bạch chi phí &amp; Quy chế hoạt động</h3>
            <p class="text-sm text-slate-600 mt-2 leading-relaxed">
                Công khai giá thuê, giá điện/nước và tiện ích ngay trên tin đăng; quy định rõ quy trình hẹn xem phòng trực tiếp, trao đổi trực tiếp với chủ trọ và cơ chế hỗ trợ giải quyết khiếu nại.
            </p>
            </div>

            <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4">03</div>
            <h3 class="text-base font-bold text-slate-900">Tuân thủ TMĐT &amp; Bảo vệ dữ liệu cá nhân</h3>
            <p class="text-sm text-slate-600 mt-2 leading-relaxed">
                Hướng tới đăng ký sàn/website thương mại điện tử theo quy định hiện hành và áp dụng chính sách bảo vệ dữ liệu cá nhân (như họ tên, số điện thoại, lịch hẹn) an toàn, đúng mục đích.
            </p>
            </div>
        </div>
        </div>
    </section>
      
    </div>
  );
}
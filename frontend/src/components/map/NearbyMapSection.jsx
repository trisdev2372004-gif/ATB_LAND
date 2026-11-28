import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed, Building2, Palmtree, Home, Hotel, Navigation } from 'lucide-react';
import { formatVND } from '../../lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DEFAULT_CENTER = { lat: 16.4637, lng: 107.5905 }; // Trung tâm TP Huế

const CATEGORY_META = {
  HOMESTAY: { label: 'Homestay', color: '#0d9488', badgeBg: 'bg-teal-50 text-teal-700' },
  RESORT: { label: 'Resort', color: '#4f46e5', badgeBg: 'bg-indigo-50 text-indigo-700' },
  HOTEL: { label: 'Khách sạn', color: '#0284c7', badgeBg: 'bg-sky-50 text-sky-700' },
  RENTAL_ROOM: { label: 'Phòng trọ', color: '#d97706', badgeBg: 'bg-amber-50 text-amber-700' },
};

function createPricePinIcon(place) {
  const meta = CATEGORY_META[place.category] || CATEGORY_META.HOMESTAY;
  const shortPrice =
    place.price >= 1000000
      ? `${(place.price / 1000000).toFixed(1).replace('.0', '')}tr`
      : `${Math.round(place.price / 1000)}k`;

  return L.divIcon({
    className: 'custom-price-pin',
    html: `<div style="background:${meta.color};color:#fff;padding:4px 8px;border-radius:9999px;font-size:11px;font-weight:800;white-space:nowrap;box-shadow:0 4px 10px rgba(0,0,0,0.22);border:2px solid #fff;">
      ${shortPrice}
    </div>`,
    iconSize: [56, 26],
    iconAnchor: [28, 13],
  });
}

const userLocationIcon = L.divIcon({
  className: 'user-gps-pin',
  html: `<div style="width:18px;height:18px;border-radius:9999px;background:#ef4444;border:3px solid #fff;box-shadow:0 0 0 6px rgba(239,68,68,0.25);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
  }, [center.lat, center.lng, map]);
  return null;
}

export default function NearbyMapSection() {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [radiusKm, setRadiusKm] = useState(5);
  const [selectedType, setSelectedType] = useState('ALL');
  const [summary, setSummary] = useState({
    totalAll: 0,
    HOMESTAY: 0,
    RESORT: 0,
    HOTEL: 0,
    RENTAL_ROOM: 0,
  });
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('Đang dùng vị trí mặc định (TP. Huế)');

  const detectMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('Trình duyệt không hỗ trợ GPS');
      return;
    }
    setGpsStatus('Đang xác định vị trí của bạn...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGpsStatus('Đã cập nhật theo vị trí GPS của bạn');
      },
      () => {
        setGpsStatus('Chưa cấp quyền GPS • Đang xem quanh trung tâm Huế');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    detectMyLocation();
  }, [detectMyLocation]);

  useEffect(() => {
    let cancelled = false;
    async function fetchNearby() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/map/nearby?lat=${center.lat}&lng=${center.lng}&radiusKm=${radiusKm}&type=${selectedType}`
        );
        const json = await res.json();
        if (!cancelled && json.success) {
          setSummary(json.summary);
          setPlaces(json.data || []);
        }
      } catch {
        // Bỏ qua lỗi mạng tạm thời
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchNearby();
    return () => {
      cancelled = true;
    };
  }, [center.lat, center.lng, radiusKm, selectedType]);

  const filterCards = [
    { key: 'ALL', label: 'Tất cả quanh bạn', count: summary.totalAll, icon: Navigation },
    { key: 'HOMESTAY', label: 'Homestay', count: summary.HOMESTAY, icon: Building2 },
    { key: 'RESORT', label: 'Resort', count: summary.RESORT, icon: Palmtree },
    { key: 'HOTEL', label: 'Khách sạn', count: summary.HOTEL, icon: Hotel },
    { key: 'RENTAL_ROOM', label: 'Phòng trọ', count: summary.RENTAL_ROOM, icon: Home },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        {/* Header & Bộ điều khiển bán kính + GPS */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              Bản đồ khám phá chỗ ở quanh bạn
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              {gpsStatus} • Tìm thấy{' '}
              <span className="font-bold text-teal-700">{summary.totalAll} chỗ ở</span> trong bán kính{' '}
              <span className="font-bold text-slate-800">{radiusKm} km</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-teal-600 sm:text-sm"
            >
              <option value={2}>Bán kính 2 km</option>
              <option value={5}>Bán kính 5 km</option>
              <option value={10}>Bán kính 10 km</option>
              <option value={20}>Bán kính 20 km</option>
            </select>

            <button
              type="button"
              onClick={detectMyLocation}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-teal-800 sm:text-sm"
            >
              <LocateFixed size={16} />
              Vị trí của tôi
            </button>
          </div>
        </div>

        {/* Thẻ đếm số lượng từng loại quanh bạn (bấm để lọc trực tiếp trên bản đồ) */}
        <div className="grid grid-cols-2 gap-2.5 border-b border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-5">
          {filterCards.map((item) => {
            const IconComp = item.icon;
            const active = selectedType === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedType(item.key)}
                className={`flex items-center justify-between rounded-2xl border p-3 text-left transition ${
                  active
                    ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300'
                }`}
              >
                <div>
                  <div className={`text-xs font-medium ${active ? 'text-teal-100' : 'text-slate-500'}`}>
                    {item.label}
                  </div>
                  <div className="mt-0.5 text-lg font-extrabold">{item.count}</div>
                </div>
                <IconComp size={20} className={active ? 'text-white' : 'text-teal-700'} />
              </button>
            );
          })}
        </div>

        {/* Khung Bản đồ + Danh sách kết quả bên cạnh */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="relative h-[420px] lg:col-span-8 lg:h-[500px]">
            <MapContainer
              center={[center.lat, center.lng]}
              zoom={13}
              className="h-full w-full z-10"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <RecenterMap center={center} />

              {/* Vị trí hiện tại của người dùng + vòng tròn bán kính */}
              <Marker position={[center.lat, center.lng]} icon={userLocationIcon}>
                <Popup>
                  <div className="text-xs font-bold text-slate-900">Vị trí của bạn</div>
                </Popup>
              </Marker>
              <Circle
                center={[center.lat, center.lng]}
                radius={radiusKm * 1000}
                pathOptions={{ color: '#0d9488', fillColor: '#0d9488', fillOpacity: 0.08 }}
              />

              {/* Ghim các Homestay / Resort / Khách sạn / Phòng trọ */}
              {places.map((place) =>
                place.lat && place.lng ? (
                  <Marker
                    key={`${place.entityType}-${place._id}`}
                    position={[place.lat, place.lng]}
                    icon={createPricePinIcon(place)}
                  >
                    <Popup>
                      <div className="w-52 space-y-1.5">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                            CATEGORY_META[place.category]?.badgeBg || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {CATEGORY_META[place.category]?.label || place.category} • Cách {place.distanceKm} km
                        </span>
                        <div className="font-bold text-slate-900">{place.title}</div>
                        <div className="text-[11px] text-slate-500">{place.address}</div>
                        <div className="font-extrabold text-teal-700">
                          {formatVND(place.price)} / {place.priceLabel}
                        </div>
                        <Link
                          to={
                            place.entityType === 'RENTAL_ROOM'
                              ? `/phong-tro/${place.slug || place._id}`
                              : `/nha-nghi/${place.slug || place._id}`
                          }
                          className="mt-1 inline-block rounded-lg bg-teal-700 px-3 py-1 text-[11px] font-bold text-white"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>
          </div>

          {/* Danh sách bên phải */}
          <div className="max-h-[500px] divide-y divide-slate-100 overflow-y-auto border-t border-slate-200 lg:col-span-4 lg:border-l lg:border-t-0">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-400">Đang quét chỗ ở quanh bạn...</div>
            ) : places.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Không có chỗ ở nào trong bán kính {radiusKm} km. Thử tăng bán kính lên 10–20 km.
              </div>
            ) : (
              places.map((place) => (
                <div
                  key={`${place.entityType}-${place._id}`}
                  onClick={() => place.lat && place.lng && setCenter({ lat: place.lat, lng: place.lng })}
                  className="cursor-pointer p-4 transition hover:bg-teal-50/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        CATEGORY_META[place.category]?.badgeBg || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {CATEGORY_META[place.category]?.label || place.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Cách {place.distanceKm} km
                    </span>
                  </div>
                  <div className="mt-1.5 line-clamp-1 font-bold text-slate-900">{place.title}</div>
                  <div className="mt-0.5 line-clamp-1 text-xs text-slate-500">{place.address}</div>
                  <div className="mt-2 font-extrabold text-teal-700">
                    {formatVND(place.price)}
                    <span className="text-xs font-normal text-slate-500">/{place.priceLabel}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
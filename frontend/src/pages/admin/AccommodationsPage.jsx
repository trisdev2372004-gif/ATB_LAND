import { useState } from 'react';
import {
  Plus,
  Layers,
  DoorOpen,
  PackagePlus,
  CheckCircle,
  EyeOff,
  KeyRound,
  Percent,
  Image as ImageIcon,
  ChevronUp,
  MapPin,
  Sparkles,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import AmenityIcon from '../../components/ui/AmenityIcon';
import MediaUploader from '../../components/ui/MediaUploader';
import { useAsyncData } from '../../hooks/useAsyncData';
import { api } from '../../api';
import { formatVND } from '../../lib/utils';

const CHECK_IN_OPTIONS = [
  { value: 'RECEPTION_24_7', label: 'Sảnh lễ tân 24/7' },
  { value: 'SELF_CHECKIN', label: 'Tự check-in' },
  { value: 'CONTACT_HOST', label: 'Liên hệ chủ nhà' },
  { value: 'EXPRESS_CHECKIN', label: 'Check-in nhanh' },
];

const CHECK_IN_LABELS = {
  RECEPTION_24_7: 'Lễ tân 24/7',
  SELF_CHECKIN: 'Tự check-in',
  CONTACT_HOST: 'Liên hệ chủ nhà',
  EXPRESS_CHECKIN: 'Check-in nhanh',
};

const ROOM_TYPES = ['STANDARD', 'SUPERIOR', 'DELUXE', 'EXECUTIVE', 'SUITE', 'VILLA', 'BUNGALOW'];

const INITIAL_ACC_FORM = {
  title: '',
  category: 'HOTEL',
  description: '',
  city: 'Huế',
  district: '',
  addressDetail: '',
  starRating: 4,
  defaultProfitPercent: 10,
  checkInTime: '14:00',
  checkOutTime: '12:00',
  checkInTypes: ['RECEPTION_24_7'],
  checkInInstruction: '',
  amenityIds: [],
  media: [],
};

const INITIAL_RT_FORM = {
  name: '',
  roomCode: '',
  roomType: 'DELUXE',
  area: 30,
  maxAdults: 2,
  maxChildren: 1,
  bedType: '1 Giường đôi King',
  roomNumber: 'P.201',
  floor: 2,
  packageName: 'Nghỉ theo giờ (2 giờ đầu)',
  bookingMode: 'HOURLY',
  baseHours: 2,
  price: 200000,
  extraHourPrice: 60000,
  profitPercent: '',
  includedServices: 'Wifi miễn phí, Nước suối',
  amenityIds: [],
  media: [],
};

const INITIAL_PKG_FORM = {
  name: '',
  bookingMode: 'OVERNIGHT',
  baseHours: 2,
  price: 550000,
  extraHourPrice: 50000,
  profitPercent: '',
  includedServices: 'Ăn sáng, Dọn phòng hằng ngày',
};

export default function AccommodationsPage() {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [showCreateAcc, setShowCreateAcc] = useState(false);

  // Mở trực tiếp khu vực Hạng & Gói ngay dưới cơ sở được chọn
  const [expandedAccId, setExpandedAccId] = useState(null);
  const [roomTypesByAcc, setRoomTypesByAcc] = useState({});
  const [loadingRoomsAccId, setLoadingRoomsAccId] = useState(null);

  // Sub-form điều khiển gọn ngay trong panel của từng cơ sở
  const [showAddRoomTypeForm, setShowAddRoomTypeForm] = useState(false);
  const [unitFormTargetRtId, setUnitFormTargetRtId] = useState(null);
  const [newUnitForm, setNewUnitForm] = useState({
    roomNumber: '',
    floor: 2,
    packageName: 'Gói Qua Đêm Tiêu Chuẩn',
    bookingMode: 'OVERNIGHT',
    price: 550000,
    includedServices: 'Wifi miễn phí, Nước suối',
  });

  const [pkgTarget, setPkgTarget] = useState(null);
  const [mediaTargetRt, setMediaTargetRt] = useState(null);
  const [rtMediaDraft, setRtMediaDraft] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [accForm, setAccForm] = useState(INITIAL_ACC_FORM);
  const [rtForm, setRtForm] = useState(INITIAL_RT_FORM);
  const [pkgForm, setPkgForm] = useState(INITIAL_PKG_FORM);

  function showToast(message, isError = false) {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  }

  const { data, loading, reload } = useAsyncData(async () => {
    const [accRes, amRes] = await Promise.all([
      api.accommodations.getAll({ category: categoryFilter }),
      api.amenities.getAll(),
    ]);
    return {
      accommodations: accRes.data || [],
      amenities: amRes.data || [],
    };
  }, [categoryFilter]);

  async function refreshRoomTypes(accId) {
    setLoadingRoomsAccId(accId);
    try {
      const res = await api.roomTypes.getByAccommodation(accId);
      const list = res.data || [];
      setRoomTypesByAcc((prev) => ({ ...prev, [accId]: list }));
      return list;
    } finally {
      setLoadingRoomsAccId(null);
    }
  }

  async function handleToggleRoomsUnderName(acc) {
    if (expandedAccId === acc._id) {
      setExpandedAccId(null);
      setPkgTarget(null);
      setMediaTargetRt(null);
      setUnitFormTargetRtId(null);
      return;
    }
    setExpandedAccId(acc._id);
    setPkgTarget(null);
    setMediaTargetRt(null);
    setUnitFormTargetRtId(null);
    await refreshRoomTypes(acc._id);
  }

  function toggleAccCheckIn(typeValue) {
    setAccForm((prev) => {
      const exists = prev.checkInTypes.includes(typeValue);
      const nextTypes = exists
        ? prev.checkInTypes.filter((v) => v !== typeValue)
        : [...prev.checkInTypes, typeValue];
      return {
        ...prev,
        checkInTypes: nextTypes.length > 0 ? nextTypes : ['RECEPTION_24_7'],
      };
    });
  }

  async function handleCreateAcc(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.accommodations.create({
        title: accForm.title.trim(),
        category: accForm.category,
        description: accForm.description.trim(),
        location: {
          city: accForm.city.trim(),
          district: accForm.district.trim(),
          addressDetail: accForm.addressDetail.trim(),
        },
        pricing: {
          minNightlyPrice: 0,
          defaultProfitPercent: Number(accForm.defaultProfitPercent || 0),
          checkInTime: accForm.checkInTime || '14:00',
          checkOutTime: accForm.checkOutTime || '12:00',
        },
        checkInTypes: accForm.checkInTypes,
        checkInInstruction: accForm.checkInInstruction.trim(),
        specs: {
          starRating: Number(accForm.starRating || 4),
          totalRoomsCount: 0,
        },
        amenityIds: accForm.amenityIds,
        media: accForm.media,
      });
      setShowCreateAcc(false);
      setAccForm(INITIAL_ACC_FORM);
      showToast('Đã thêm cơ sở lưu trú mới!');
      reload();
    } catch (err) {
      showToast(err.message || 'Lỗi khi tạo cơ sở', true);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateRoomType(e, accId) {
    e.preventDefault();
    if (!accId) return;
    setSubmitting(true);
    try {
      const mode = rtForm.bookingMode;
      const pkgPayload = {
        name: rtForm.packageName.trim(),
        bookingMode: mode,
        baseHours: mode === 'HOURLY' ? Number(rtForm.baseHours || 2) : 2,
        minHours: mode === 'HOURLY' ? Number(rtForm.baseHours || 2) : 2,
        price: Number(rtForm.price || 0),
        extraHourPrice: mode === 'HOURLY' ? Number(rtForm.extraHourPrice || 0) : 0,
        profitPercent: rtForm.profitPercent !== '' ? Number(rtForm.profitPercent) : null,
        includedServices: rtForm.includedServices
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        isDefault: true,
      };

      await api.roomTypes.create(accId, {
        name: rtForm.name.trim(),
        roomCode: rtForm.roomCode.trim().toUpperCase(),
        roomType: rtForm.roomType,
        area: Number(rtForm.area || 28),
        maxAdults: Number(rtForm.maxAdults || 2),
        maxChildren: Number(rtForm.maxChildren || 1),
        bedType: rtForm.bedType.trim(),
        amenityIds: rtForm.amenityIds,
        media: rtForm.media,
        roomUnits: [
          {
            roomNumber: rtForm.roomNumber.trim(),
            floor: Number(rtForm.floor || 1),
            media: rtForm.media,
            ratePackages: [pkgPayload],
          },
        ],
      });

      setRtForm(INITIAL_RT_FORM);
      setShowAddRoomTypeForm(false);
      await refreshRoomTypes(accId);
      reload();
      showToast('Đã thêm hạng phòng & phòng mẫu thành công!');
    } catch (err) {
      showToast(err.message || 'Lỗi khi thêm hạng phòng', true);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateRoomUnit(e, accId) {
    e.preventDefault();
    if (!unitFormTargetRtId || !newUnitForm.roomNumber.trim()) return;
    setSubmitting(true);
    try {
      await api.roomTypes.addUnit(unitFormTargetRtId, {
        roomNumber: newUnitForm.roomNumber.trim(),
        floor: Number(newUnitForm.floor || 1),
        ratePackages: [
          {
            name: newUnitForm.packageName.trim() || 'Gói Tiêu Chuẩn',
            bookingMode: newUnitForm.bookingMode,
            price: Number(newUnitForm.price || 0),
            includedServices: newUnitForm.includedServices
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
            isDefault: true,
          },
        ],
      });
      setUnitFormTargetRtId(null);
      setNewUnitForm({
        roomNumber: '',
        floor: 2,
        packageName: 'Gói Qua Đêm Tiêu Chuẩn',
        bookingMode: 'OVERNIGHT',
        price: 550000,
        includedServices: 'Wifi miễn phí, Nước suối',
      });
      await refreshRoomTypes(accId);
      reload();
      showToast('Đã thêm phòng mới vào hạng phòng!');
    } catch (err) {
      showToast(err.message || 'Lỗi khi thêm phòng', true);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddPackage(e, accId) {
    e.preventDefault();
    if (!pkgTarget || !accId) return;
    setSubmitting(true);
    try {
      const mode = pkgForm.bookingMode;
      await api.roomTypes.addRatePackage(pkgTarget.roomTypeId, pkgTarget.unitId, {
        name: pkgForm.name.trim(),
        bookingMode: mode,
        baseHours: mode === 'HOURLY' ? Number(pkgForm.baseHours || 2) : 2,
        minHours: mode === 'HOURLY' ? Number(pkgForm.baseHours || 2) : 2,
        price: Number(pkgForm.price || 0),
        extraHourPrice: mode === 'HOURLY' ? Number(pkgForm.extraHourPrice || 0) : 0,
        profitPercent: pkgForm.profitPercent !== '' ? Number(pkgForm.profitPercent) : null,
        includedServices: pkgForm.includedServices
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setPkgTarget(null);
      setPkgForm(INITIAL_PKG_FORM);
      await refreshRoomTypes(accId);
      reload();
      showToast('Đã thêm gói giá mới!');
    } catch (err) {
      showToast(err.message || 'Lỗi khi thêm gói giá', true);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveRoomTypeMedia(e, accId) {
    e.preventDefault();
    if (!mediaTargetRt) return;
    setSubmitting(true);
    try {
      await api.roomTypes.update(mediaTargetRt._id, {
        media: rtMediaDraft,
      });
      setMediaTargetRt(null);
      setRtMediaDraft([]);
      await refreshRoomTypes(accId);
      showToast('Đã cập nhật hình ảnh hạng phòng!');
    } catch (err) {
      showToast(err.message || 'Lỗi lưu ảnh hạng phòng', true);
    } finally {
      setSubmitting(false);
    }
  }

  const filteredAccommodations = (data?.accommodations || []).filter((item) => {
    const q = searchText.trim().toLowerCase();
    if (!q) return true;
    return (
      item.title?.toLowerCase().includes(q) ||
      item.location?.district?.toLowerCase().includes(q) ||
      item.location?.city?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed right-4 top-20 z-50 rounded-2xl border-l-4 bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl ${
            toast.isError ? 'border-rose-500' : 'border-emerald-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header & Thanh tìm kiếm / lọc */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Quản lý Khách sạn, Resort &amp; Homestay
          </h1>
          <p className="text-sm text-slate-500">
            Bấm <b>Hạng &amp; Gói</b> ngay dưới tên cơ sở để xem và quản lý Hạng phòng → Phòng → Gói giá → Ảnh phòng
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm tên cơ sở, quận, thành phố..."
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-teal-600"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-teal-600"
          >
            <option value="ALL">Tất cả loại hình</option>
            <option value="HOTEL">Khách sạn (HOTEL)</option>
            <option value="RESORT">Resort (RESORT)</option>
            <option value="HOMESTAY">Homestay (HOMESTAY)</option>
          </select>
          <Button onClick={() => setShowCreateAcc((v) => !v)}>
            <Plus size={16} /> Thêm cơ sở
          </Button>
        </div>
      </div>

      {/* Form thêm cơ sở lưu trú mới */}
      {showCreateAcc && (
        <form
          onSubmit={handleCreateAcc}
          className="space-y-4 rounded-3xl border border-teal-200 bg-white p-6 shadow-md"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900">Thêm cơ sở lưu trú mới</h2>
            <button
              type="button"
              onClick={() => setShowCreateAcc(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Đóng
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
            <input
              required
              placeholder="Tên khách sạn / resort / homestay *"
              value={accForm.title}
              onChange={(e) => setAccForm({ ...accForm, title: e.target.value })}
              className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
            />
            <select
              value={accForm.category}
              onChange={(e) => setAccForm({ ...accForm, category: e.target.value })}
              className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
            >
              <option value="HOTEL">HOTEL</option>
              <option value="RESORT">RESORT</option>
              <option value="HOMESTAY">HOMESTAY</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="1"
                max="5"
                placeholder="Hạng sao"
                value={accForm.starRating}
                onChange={(e) => setAccForm({ ...accForm, starRating: e.target.value })}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                min="0"
                max="100"
                placeholder="% Lợi nhuận"
                value={accForm.defaultProfitPercent}
                onChange={(e) => setAccForm({ ...accForm, defaultProfitPercent: e.target.value })}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <input
              required
              placeholder="Thành phố *"
              value={accForm.city}
              onChange={(e) => setAccForm({ ...accForm, city: e.target.value })}
              className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
            />
            <input
              required
              placeholder="Quận / Huyện *"
              value={accForm.district}
              onChange={(e) => setAccForm({ ...accForm, district: e.target.value })}
              className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
            />
            <input
              required
              placeholder="Địa chỉ chi tiết *"
              value={accForm.addressDetail}
              onChange={(e) => setAccForm({ ...accForm, addressDetail: e.target.value })}
              className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
            />
          </div>

          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <span className="block text-xs font-bold text-slate-700">
              Kiểu check-in hỗ trợ (chọn nhiều)
            </span>
            <div className="flex flex-wrap gap-2">
              {CHECK_IN_OPTIONS.map((opt) => {
                const active = accForm.checkInTypes.includes(opt.value);
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => toggleAccCheckIn(opt.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? 'border-teal-600 bg-teal-50 text-teal-700'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <input
              placeholder="Hướng dẫn nhận phòng..."
              value={accForm.checkInInstruction}
              onChange={(e) => setAccForm({ ...accForm, checkInInstruction: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(data?.amenities || []).map((am) => {
              const checked = accForm.amenityIds.includes(am._id);
              return (
                <button
                  type="button"
                  key={am._id}
                  onClick={() =>
                    setAccForm({
                      ...accForm,
                      amenityIds: checked
                        ? accForm.amenityIds.filter((id) => id !== am._id)
                        : [...accForm.amenityIds, am._id],
                    })
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    checked
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <AmenityIcon name={am.icon} size={14} />
                  <span>{am.name}</span>
                </button>
              );
            })}
          </div>

          <MediaUploader
            mediaList={accForm.media}
            onChange={(nextMedia) => setAccForm({ ...accForm, media: nextMedia })}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreateAcc(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu cơ sở'}
            </Button>
          </div>
        </form>
      )}

      {/* Danh sách Khách sạn / Resort / Homestay dạng card thân thiện — mở Hạng & Gói ngay dưới tên */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-400">
          Đang tải danh sách cơ sở lưu trú...
        </div>
      ) : filteredAccommodations.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Chưa có cơ sở lưu trú nào phù hợp.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAccommodations.map((acc) => {
            const isExpanded = expandedAccId === acc._id;
            const roomTypes = roomTypesByAcc[acc._id] || [];
            const coverUrl =
              acc.media?.find((m) => m.isCover)?.url ||
              acc.media?.[0]?.url ||
              'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={acc._id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-2xs transition ${
                  isExpanded ? 'border-teal-500 ring-2 ring-teal-100' : 'border-slate-200'
                }`}
              >
                {/* Phần thông tin chính của cơ sở */}
                <div className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <img
                      src={coverUrl}
                      alt={acc.title}
                      className="h-28 w-full shrink-0 rounded-xl object-cover sm:h-24 sm:w-36"
                    />

                    <div className="space-y-1.5">
                      {/* Tên cơ sở & huy hiệu */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-extrabold text-slate-900">{acc.title}</h3>
                        <span className="rounded-lg bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700">
                          {acc.category} • {acc.specs?.starRating || 4}★
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            acc.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : acc.status === 'PENDING'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {acc.status}
                        </span>
                      </div>

                      {/* Khu vực & quỹ phòng */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={13} className="text-slate-400" />
                          {acc.location?.addressDetail ? `${acc.location.addressDetail}, ` : ''}
                          {acc.location?.district}, {acc.location?.city}
                        </span>
                        <span className="font-semibold text-slate-700">
                          {acc.specs?.totalRoomsCount || 0} phòng • Từ{' '}
                          <span className="text-teal-700">
                            {formatVND(acc.pricing?.minNightlyPrice)}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                          <Percent size={12} /> Lợi nhuận +{acc.pricing?.defaultProfitPercent ?? 10}%
                        </span>
                      </div>

                      {/* Kiểu check-in & hạng phòng */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {(acc.checkInTypes || []).map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                          >
                            <KeyRound size={11} />
                            {CHECK_IN_LABELS[t] || t}
                          </span>
                        ))}
                        {(acc.availableRoomTypes || []).length > 0 && (
                          <span className="text-[11px] text-slate-500">
                            • Hạng: {(acc.availableRoomTypes || []).join(', ')}
                          </span>
                        )}
                      </div>

                      {/* Nút Hạng & Gói nằm ngay dưới tên cơ sở */}
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <Button
                          variant={isExpanded ? 'primary' : 'secondary'}
                          className="px-3 py-1.5 text-xs"
                          onClick={() => handleToggleRoomsUnderName(acc)}
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <Layers size={14} />}
                          {isExpanded ? 'Thu gọn Hạng & Gói' : 'Hạng & Gói'}
                        </Button>

                        {acc.status !== 'ACTIVE' ? (
                          <Button
                            variant="success"
                            className="px-3 py-1.5 text-xs"
                            onClick={async () => {
                              await api.accommodations.updateStatus(acc._id, 'ACTIVE');
                              showToast(`Đã duyệt hiển thị "${acc.title}"`);
                              reload();
                            }}
                          >
                            <CheckCircle size={14} /> Duyệt hiển thị
                          </Button>
                        ) : (
                          <Button
                            variant="danger"
                            className="px-3 py-1.5 text-xs"
                            onClick={async () => {
                              await api.accommodations.updateStatus(acc._id, 'INACTIVE');
                              showToast(`Đã tạm ẩn "${acc.title}"`);
                              reload();
                            }}
                          >
                            <EyeOff size={14} /> Tạm ẩn
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PANEL HẠNG PHÒNG, PHÒNG CỤ THỂ, GÓI GIÁ & ẢNH PHÒNG HIỆN NGAY DƯỚI TÊN */}
                {isExpanded && (
                  <div className="space-y-4 border-t border-teal-100 bg-teal-50/35 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-extrabold uppercase tracking-wide text-teal-900">
                          Hạng phòng, Phòng &amp; Gói giá của {acc.title}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Thêm hạng phòng mới, thêm phòng vào từng hạng, thêm gói giá hoặc tải hình ảnh phòng
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => {
                            setShowAddRoomTypeForm((v) => !v);
                            setPkgTarget(null);
                            setMediaTargetRt(null);
                            setUnitFormTargetRtId(null);
                          }}
                        >
                          <Plus size={14} /> Thêm hạng phòng
                        </Button>
                      </div>
                    </div>

                    {/* Form Thêm Hạng Phòng Mới (kèm phòng đầu tiên, gói giá & upload ảnh phòng) */}
                    {showAddRoomTypeForm && (
                      <form
                        onSubmit={(e) => handleCreateRoomType(e, acc._id)}
                        className="space-y-4 rounded-2xl border border-teal-200 bg-white p-4 shadow-xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-sm font-bold text-slate-900">
                            Tạo hạng phòng mới cho {acc.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowAddRoomTypeForm(false)}
                            className="text-xs font-semibold text-slate-400 hover:text-slate-700"
                          >
                            Hủy
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <input
                            required
                            placeholder="Tên hạng phòng (VD: Deluxe Sông Hương) *"
                            value={rtForm.name}
                            onChange={(e) => setRtForm({ ...rtForm, name: e.target.value })}
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          />
                          <select
                            value={rtForm.roomType}
                            onChange={(e) => setRtForm({ ...rtForm, roomType: e.target.value })}
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          >
                            {ROOM_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <input
                            required
                            placeholder="Số phòng đầu tiên (VD: P.201) *"
                            value={rtForm.roomNumber}
                            onChange={(e) => setRtForm({ ...rtForm, roomNumber: e.target.value })}
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Diện tích (m²)"
                            value={rtForm.area}
                            onChange={(e) => setRtForm({ ...rtForm, area: e.target.value })}
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          />

                          <input
                            placeholder="Loại giường (VD: 1 Giường đôi King)"
                            value={rtForm.bedType}
                            onChange={(e) => setRtForm({ ...rtForm, bedType: e.target.value })}
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          />
                          <select
                            value={rtForm.bookingMode}
                            onChange={(e) => setRtForm({ ...rtForm, bookingMode: e.target.value })}
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          >
                            <option value="HOURLY">Theo giờ (HOURLY)</option>
                            <option value="OVERNIGHT">Qua đêm (OVERNIGHT)</option>
                            <option value="DAILY">Theo ngày (DAILY)</option>
                          </select>
                          <input
                            required
                            placeholder="Tên gói giá *"
                            value={rtForm.packageName}
                            onChange={(e) => setRtForm({ ...rtForm, packageName: e.target.value })}
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          />
                          <input
                            type="number"
                            required
                            placeholder="Giá gốc gói (VNĐ) *"
                            value={rtForm.price}
                            onChange={(e) => setRtForm({ ...rtForm, price: e.target.value })}
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          />

                          {rtForm.bookingMode === 'HOURLY' && (
                            <>
                              <input
                                type="number"
                                min="1"
                                placeholder="Số giờ cơ bản (VD: 2)"
                                value={rtForm.baseHours}
                                onChange={(e) =>
                                  setRtForm({ ...rtForm, baseHours: e.target.value })
                                }
                                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                              />
                              <input
                                type="number"
                                min="0"
                                placeholder="Phụ thu mỗi giờ thêm (VNĐ)"
                                value={rtForm.extraHourPrice}
                                onChange={(e) =>
                                  setRtForm({ ...rtForm, extraHourPrice: e.target.value })
                                }
                                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                              />
                            </>
                          )}

                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="% Lợi nhuận riêng (tuỳ chọn)"
                            value={rtForm.profitPercent}
                            onChange={(e) =>
                              setRtForm({ ...rtForm, profitPercent: e.target.value })
                            }
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          />
                          <input
                            placeholder="Dịch vụ kèm theo (cách nhau dấu phẩy)"
                            value={rtForm.includedServices}
                            onChange={(e) =>
                              setRtForm({ ...rtForm, includedServices: e.target.value })
                            }
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          />
                        </div>

                        {/* Tiện ích của hạng phòng */}
                        <div className="space-y-1.5">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700">
                            <Sparkles size={13} className="text-teal-600" /> Tiện ích riêng của hạng phòng
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(data?.amenities || []).map((am) => {
                              const checked = rtForm.amenityIds.includes(am._id);
                              return (
                                <button
                                  type="button"
                                  key={am._id}
                                  onClick={() =>
                                    setRtForm({
                                      ...rtForm,
                                      amenityIds: checked
                                        ? rtForm.amenityIds.filter((id) => id !== am._id)
                                        : [...rtForm.amenityIds, am._id],
                                    })
                                  }
                                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
                                    checked
                                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                                      : 'border-slate-200 bg-white text-slate-600'
                                  }`}
                                >
                                  <AmenityIcon name={am.icon} size={13} />
                                  <span>{am.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Upload hình ảnh phòng */}
                        <MediaUploader
                          mediaList={rtForm.media}
                          onChange={(nextMedia) => setRtForm({ ...rtForm, media: nextMedia })}
                        />

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowAddRoomTypeForm(false)}
                          >
                            Hủy
                          </Button>
                          <Button type="submit" disabled={submitting}>
                            {submitting ? 'Đang lưu...' : 'Lưu hạng phòng'}
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Danh sách các hạng phòng hiện có */}
                    {loadingRoomsAccId === acc._id ? (
                      <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-400">
                        Đang tải hạng phòng &amp; gói giá...
                      </div>
                    ) : roomTypes.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
                        Cơ sở này chưa có hạng phòng nào. Bấm <b>+ Thêm hạng phòng</b> để bắt đầu.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {roomTypes.map((rt) => {
                          const rtCover = rt.media?.find((m) => m.isCover)?.url || rt.media?.[0]?.url;
                          const isAddingUnitHere = unitFormTargetRtId === rt._id;
                          const isEditingMediaHere = mediaTargetRt?._id === rt._id;

                          return (
                            <div
                              key={rt._id}
                              className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"
                            >
                              {/* Tiêu đề hạng phòng + nút Thêm phòng + nút Hình ảnh phòng */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-3">
                                  {rtCover ? (
                                    <img
                                      src={rtCover}
                                      alt={rt.name}
                                      className="h-12 w-16 rounded-lg object-cover border border-slate-200"
                                    />
                                  ) : (
                                    <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                                      <ImageIcon size={18} />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-bold text-slate-900">
                                      {rt.name}{' '}
                                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                        {rt.roomType}
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {rt.area ? `${rt.area}m² • ` : ''}
                                      {rt.bedType || 'Giường tiêu chuẩn'} • {(rt.media || []).length} ảnh phòng
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    className="px-3 py-1.5 text-xs"
                                    onClick={() => {
                                      setUnitFormTargetRtId(isAddingUnitHere ? null : rt._id);
                                      setPkgTarget(null);
                                      setMediaTargetRt(null);
                                    }}
                                  >
                                    <DoorOpen size={14} /> Thêm phòng
                                  </Button>

                                  <Button
                                    type="button"
                                    variant="secondary"
                                    className="px-3 py-1.5 text-xs"
                                    onClick={() => {
                                      if (isEditingMediaHere) {
                                        setMediaTargetRt(null);
                                      } else {
                                        setMediaTargetRt(rt);
                                        setRtMediaDraft(rt.media || []);
                                        setPkgTarget(null);
                                        setUnitFormTargetRtId(null);
                                      }
                                    }}
                                  >
                                    <ImageIcon size={14} /> Hình ảnh phòng ({(rt.media || []).length})
                                  </Button>
                                </div>
                              </div>

                              {/* Form Thêm phòng cụ thể ngay dưới hạng phòng */}
                              {isAddingUnitHere && (
                                <form
                                  onSubmit={(e) => handleCreateRoomUnit(e, acc._id)}
                                  className="grid grid-cols-1 gap-2.5 rounded-xl border border-teal-200 bg-teal-50/40 p-3 sm:grid-cols-5"
                                >
                                  <input
                                    required
                                    placeholder="Số phòng (VD: P.202) *"
                                    value={newUnitForm.roomNumber}
                                    onChange={(e) =>
                                      setNewUnitForm({ ...newUnitForm, roomNumber: e.target.value })
                                    }
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                                  />
                                  <input
                                    type="number"
                                    placeholder="Tầng (VD: 2)"
                                    value={newUnitForm.floor}
                                    onChange={(e) =>
                                      setNewUnitForm({ ...newUnitForm, floor: e.target.value })
                                    }
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                                  />
                                  <select
                                    value={newUnitForm.bookingMode}
                                    onChange={(e) =>
                                      setNewUnitForm({ ...newUnitForm, bookingMode: e.target.value })
                                    }
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                                  >
                                    <option value="OVERNIGHT">Qua đêm (OVERNIGHT)</option>
                                    <option value="HOURLY">Theo giờ (HOURLY)</option>
                                    <option value="DAILY">Theo ngày (DAILY)</option>
                                  </select>
                                  <input
                                    type="number"
                                    required
                                    placeholder="Giá gốc (VNĐ) *"
                                    value={newUnitForm.price}
                                    onChange={(e) =>
                                      setNewUnitForm({ ...newUnitForm, price: e.target.value })
                                    }
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                                  />
                                  <Button type="submit" disabled={submitting} className="text-xs">
                                    {submitting ? 'Đang thêm...' : 'Lưu phòng'}
                                  </Button>
                                </form>
                              )}

                              {/* Khung Upload & quản lý hình ảnh phòng của hạng phòng */}
                              {isEditingMediaHere && (
                                <form
                                  onSubmit={(e) => handleSaveRoomTypeMedia(e, acc._id)}
                                  className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/40 p-3.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-indigo-900">
                                      Hình ảnh phòng cho hạng: {rt.name}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setMediaTargetRt(null)}
                                      className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                                    >
                                      Đóng
                                    </button>
                                  </div>
                                  <MediaUploader
                                    mediaList={rtMediaDraft}
                                    onChange={setRtMediaDraft}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      className="px-3 py-1.5 text-xs"
                                      onClick={() => setMediaTargetRt(null)}
                                    >
                                      Hủy
                                    </Button>
                                    <Button type="submit" disabled={submitting} className="text-xs">
                                      {submitting ? 'Đang lưu ảnh...' : 'Lưu hình ảnh phòng'}
                                    </Button>
                                  </div>
                                </form>
                              )}

                              {/* Danh sách các phòng cụ thể & gói giá */}
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {(rt.roomUnits || []).map((unit) => {
                                  const isAddingPkgHere =
                                    pkgTarget?.roomTypeId === rt._id &&
                                    pkgTarget?.unitId === unit._id;

                                  return (
                                    <div
                                      key={unit._id}
                                      className="rounded-xl border border-slate-200 bg-slate-50/80 p-3"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-800">
                                          Phòng {unit.roomNumber}
                                          {unit.floor ? (
                                            <span className="ml-1.5 text-xs font-normal text-slate-500">
                                              (Tầng {unit.floor})
                                            </span>
                                          ) : null}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPkgTarget(
                                              isAddingPkgHere
                                                ? null
                                                : { roomTypeId: rt._id, unitId: unit._id }
                                            );
                                            setPkgForm(INITIAL_PKG_FORM);
                                          }}
                                          className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100"
                                        >
                                          <PackagePlus size={13} /> Thêm gói
                                        </button>
                                      </div>

                                      <div className="mt-2 space-y-1.5">
                                        {(unit.ratePackages || []).map((pkg) => (
                                          <div
                                            key={pkg._id}
                                            className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                                          >
                                            <div className="flex items-center justify-between gap-2 font-semibold">
                                              <span>
                                                {pkg.name}{' '}
                                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                                                  {pkg.bookingMode}
                                                </span>
                                              </span>
                                              <span className="text-emerald-700">
                                                {formatVND(pkg.customerPrice ?? pkg.price)}
                                              </span>
                                            </div>
                                            <div className="mt-0.5 text-[11px] text-slate-500">
                                              Gốc: {formatVND(pkg.price)} (+
                                              {pkg.effectiveProfitPercent ?? 0}%)
                                              {pkg.bookingMode === 'HOURLY' &&
                                                ` • ${pkg.baseHours || pkg.minHours || 2}h đầu, thêm ${formatVND(
                                                  pkg.extraHourPrice || 0
                                                )}/h`}
                                            </div>
                                            {pkg.includedServices?.length > 0 && (
                                              <div className="mt-0.5 text-[11px] text-slate-500">
                                                {pkg.includedServices.join(' • ')}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>

                                      {/* Form Thêm gói giá mới ngay dưới phòng */}
                                      {isAddingPkgHere && (
                                        <form
                                          onSubmit={(e) => handleAddPackage(e, acc._id)}
                                          className="mt-2.5 space-y-2 rounded-xl border border-teal-200 bg-white p-3"
                                        >
                                          <input
                                            required
                                            placeholder="Tên gói mới (VD: Nghỉ qua đêm)"
                                            value={pkgForm.name}
                                            onChange={(e) =>
                                              setPkgForm({ ...pkgForm, name: e.target.value })
                                            }
                                            className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                                          />
                                          <div className="grid grid-cols-2 gap-2">
                                            <select
                                              value={pkgForm.bookingMode}
                                              onChange={(e) =>
                                                setPkgForm({
                                                  ...pkgForm,
                                                  bookingMode: e.target.value,
                                                })
                                              }
                                              className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                                            >
                                              <option value="HOURLY">HOURLY</option>
                                              <option value="OVERNIGHT">OVERNIGHT</option>
                                              <option value="DAILY">DAILY</option>
                                            </select>
                                            <input
                                              type="number"
                                              required
                                              placeholder="Giá gốc (VNĐ)"
                                              value={pkgForm.price}
                                              onChange={(e) =>
                                                setPkgForm({ ...pkgForm, price: e.target.value })
                                              }
                                              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                                            />
                                          </div>
                                          <input
                                            placeholder="Dịch vụ kèm theo"
                                            value={pkgForm.includedServices}
                                            onChange={(e) =>
                                              setPkgForm({
                                                ...pkgForm,
                                                includedServices: e.target.value,
                                              })
                                            }
                                            className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                                          />
                                          <div className="flex justify-end gap-1.5">
                                            <button
                                              type="button"
                                              onClick={() => setPkgTarget(null)}
                                              className="rounded-lg px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100"
                                            >
                                              Hủy
                                            </button>
                                            <Button
                                              type="submit"
                                              variant="success"
                                              disabled={submitting}
                                              className="px-3 py-1 text-xs"
                                            >
                                              Lưu gói
                                            </Button>
                                          </div>
                                        </form>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

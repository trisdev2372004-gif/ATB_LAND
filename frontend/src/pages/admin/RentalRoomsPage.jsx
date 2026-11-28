import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import AmenityIcon from '../../components/ui/AmenityIcon';
import { useAsyncData } from '../../hooks/useAsyncData';
import { api } from '../../api';
import { formatVND } from '../../lib/utils';

const RENTAL_CATEGORIES = [
  { value: 'BOARDING_ROOM', label: 'Phòng trọ' },
  { value: 'STUDIO', label: 'Căn hộ Studio' },
  { value: 'MINI_APARTMENT', label: 'Căn hộ mini' },
  { value: 'WHOLE_HOUSE', label: 'Nhà nguyên căn' },
  { value: 'SLEEPBOX', label: 'Sleepbox' },
];

const INITIAL_FORM = {
  title: '',
  category: 'STUDIO',
  city: 'Huế',
  district: '',
  addressDetail: '',
  monthlyRent: 3000000,
  electricityPrice: 3500,
  waterPrice: 25000,
  area: 25,
  availableRooms: 1,
  amenityIds: [],
};

export default function RentalRoomsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const { data, loading, reload } = useAsyncData(async () => {
    const [rentalRes, amRes] = await Promise.all([
      api.rentalRooms.getAll(),
      api.amenities.getAll({ target: 'RENTAL_ROOM' }),
    ]);
    return {
      rooms: rentalRes.data || [],
      amenities: amRes.data || [],
    };
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    await api.rentalRooms.create({
      title: form.title.trim(),
      category: form.category,
      location: {
        city: form.city.trim(),
        district: form.district.trim(),
        addressDetail: form.addressDetail.trim(),
      },
      pricing: {
        monthlyRent: Number(form.monthlyRent),
        electricityPrice: Number(form.electricityPrice),
        waterPrice: Number(form.waterPrice),
      },
      specs: {
        area: Number(form.area),
        availableRooms: Number(form.availableRooms),
      },
      amenityIds: form.amenityIds,
    });
    setForm(INITIAL_FORM);
    setShowForm(false);
    reload();
  }

  const columns = [
    {
      header: 'Phòng trọ / Căn hộ',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.title}</div>
          <div className="text-xs text-slate-500">{row.category}</div>
        </div>
      ),
    },
    {
      header: 'Khu vực',
      render: (row) => `${row.location?.district || ''}, ${row.location?.city || ''}`,
    },
    {
      header: 'Giá thuê',
      render: (row) => `${formatVND(row.pricing?.monthlyRent)}/tháng`,
    },
    {
      header: 'Trống',
      render: (row) => `${row.specs?.availableRooms ?? 0} phòng`,
    },
    {
      header: 'Trạng thái',
      render: (row) => (
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {row.status}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      render: (row) => (
        <Button
          variant="secondary"
          className="px-2.5 py-1 text-xs"
          onClick={async () => {
            await api.rentalRooms.update(row._id, {
              status: row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
            });
            reload();
          }}
        >
          {row.status === 'ACTIVE' ? 'Ẩn tin' : 'Kích hoạt'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Phòng trọ &amp; Căn hộ</h1>
          <p className="text-sm text-slate-500">Quản lý tin cho thuê dài hạn, giá điện nước &amp; tiện ích</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} /> Đăng phòng trọ
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-3"
        >
          <input
            required
            placeholder="Tiêu đề"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {RENTAL_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label} ({c.value})
              </option>
            ))}
          </select>
          <input
            type="number"
            required
            placeholder="Giá thuê/tháng"
            value={form.monthlyRent}
            onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Quận / Huyện"
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Địa chỉ chi tiết"
            value={form.addressDetail}
            onChange={(e) => setForm({ ...form, addressDetail: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              required
              placeholder="Diện tích (m²)"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="0"
              required
              placeholder="Số phòng trống"
              value={form.availableRooms}
              onChange={(e) => setForm({ ...form, availableRooms: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 md:col-span-3">
            {(data?.amenities || []).map((am) => {
              const checked = form.amenityIds.includes(am._id);
              return (
                <button
                  type="button"
                  key={am._id}
                  onClick={() =>
                    setForm({
                      ...form,
                      amenityIds: checked
                        ? form.amenityIds.filter((id) => id !== am._id)
                        : [...form.amenityIds, am._id],
                    })
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    checked
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <AmenityIcon name={am.icon} size={14} />
                  <span>{am.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 md:col-span-3">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Hủy
            </Button>
            <Button type="submit">Lưu phòng trọ</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400">
          Đang tải...
        </div>
      ) : (
        <DataTable columns={columns} data={data?.rooms || []} />
      )}
    </div>
  );
}
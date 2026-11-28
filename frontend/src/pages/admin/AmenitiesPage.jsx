import { useState, useMemo } from 'react';
import { Plus, Search, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import AmenityIcon, { ALL_LUCIDE_ICON_NAMES } from '../../components/ui/AmenityIcon';
import { useAsyncData } from '../../hooks/useAsyncData';
import { api } from '../../api';

const PAGE_SIZE = 80;

export default function AmenitiesPage() {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Wifi');
  const [group, setGroup] = useState('BASIC');
  const [iconSearch, setIconSearch] = useState('');
  const [iconPage, setIconPage] = useState(1);
  const [showIconPicker, setShowIconPicker] = useState(true);

  const { data, loading, reload } = useAsyncData(async () => {
    const res = await api.amenities.getAll();
    return res.data || [];
  }, []);

  const filteredIconNames = useMemo(() => {
    const q = iconSearch.trim().toLowerCase().replace(/[\s-_]+/g, '');
    if (!q) return ALL_LUCIDE_ICON_NAMES;
    return ALL_LUCIDE_ICON_NAMES.filter((iconName) => iconName.toLowerCase().includes(q));
  }, [iconSearch]);

  const totalIconPages = Math.max(1, Math.ceil(filteredIconNames.length / PAGE_SIZE));
  const currentIconPage = Math.min(iconPage, totalIconPages);
  const visibleIconNames = useMemo(() => {
    const start = (currentIconPage - 1) * PAGE_SIZE;
    return filteredIconNames.slice(start, start + PAGE_SIZE);
  }, [filteredIconNames, currentIconPage]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await api.amenities.create({
      name: name.trim(),
      icon: icon || 'Sparkles',
      group,
      applicableTo: ['RENTAL_ROOM', 'ACCOMMODATION', 'HOTEL_ROOM', 'RATE_PACKAGE'],
    });
    setName('');
    reload();
  }

  const columns = [
    {
      header: 'Tiện ích & Icon',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <AmenityIcon name={row.icon} size={17} />
          </span>
          <div>
            <div className="font-semibold text-slate-900">{row.name}</div>
            <div className="text-[11px] text-slate-400">Icon: {row.icon}</div>
          </div>
        </div>
      ),
    },
    { header: 'Nhóm', accessor: 'group' },
    {
      header: 'Trạng thái',
      render: (row) => (
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            row.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {row.isActive ? 'Đang bật' : 'Tạm tắt'}
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
            await api.amenities.update(row._id, { isActive: !row.isActive });
            reload();
          }}
        >
          {row.isActive ? 'Tạm tắt' : 'Bật lại'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Tiện ích &amp; Dịch vụ</h1>
        <p className="text-sm text-slate-500">
          Chọn icon Lucide trực quan để lưu sẵn — khi Host đăng phòng chỉ cần tích chọn tiện ích là tự hiển thị icon
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            required
            placeholder="Tên tiện ích (VD: Buffet sáng, Bể bơi...)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
          />

          <button
            type="button"
            onClick={() => setShowIconPicker((prev) => !prev)}
            className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 transition hover:border-teal-600"
          >
            <span className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-600 text-white">
                <AmenityIcon name={icon} size={14} />
              </span>
              <span className="truncate">{icon}</span>
            </span>
            <span className="text-xs font-semibold text-teal-700">
              {showIconPicker ? 'Thu gọn' : 'Chọn icon'}
            </span>
          </button>

          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
          >
            <option value="BASIC">BASIC (Cơ bản)</option>
            <option value="FURNITURE">FURNITURE (Nội thất)</option>
            <option value="RESORT_SERVICE">RESORT_SERVICE (Dịch vụ nghỉ dưỡng)</option>
            <option value="SECURITY">SECURITY (An ninh)</option>
            <option value="ADDON_PACKAGE">ADDON_PACKAGE (Gói kèm theo)</option>
          </select>

          <Button type="submit">
            <Plus size={16} /> Thêm tiện ích
          </Button>
        </div>

        {showIconPicker && (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Toàn bộ biểu tượng Lucide ({filteredIconNames.length} / {ALL_LUCIDE_ICON_NAMES.length} icon)
              </span>
              <div className="relative w-full sm:w-72">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={iconSearch}
                  onChange={(e) => {
                    setIconSearch(e.target.value);
                    setIconPage(1);
                  }}
                  placeholder="Tìm tên icon (VD: wifi, bed, car, bath...)"
                  className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-5 md:grid-cols-8">
              {visibleIconNames.map((iconName) => {
                const isSelected = icon?.toLowerCase() === iconName.toLowerCase();
                return (
                  <button
                    type="button"
                    key={iconName}
                    onClick={() => setIcon(iconName)}
                    title={iconName}
                    className={`relative flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center transition ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-white">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                    <AmenityIcon name={iconName} size={20} />
                    <span className="line-clamp-1 w-full text-[10px] font-medium">{iconName}</span>
                  </button>
                );
              })}
            </div>

            {totalIconPages > 1 && (
              <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
                <button
                  type="button"
                  disabled={currentIconPage <= 1}
                  onClick={() => setIconPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-medium disabled:opacity-40"
                >
                  Trang trước
                </button>
                <span className="font-semibold">
                  Trang {currentIconPage} / {totalIconPages}
                </span>
                <button
                  type="button"
                  disabled={currentIconPage >= totalIconPages}
                  onClick={() => setIconPage((p) => Math.min(totalIconPages, p + 1))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-medium disabled:opacity-40"
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        )}
      </form>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400">
          Đang tải...
        </div>
      ) : (
        <DataTable columns={columns} data={data || []} />
      )}
    </div>
  );
}
import {
  Building2,
  Hotel,
  Palmtree,
  Home,
  DoorOpen,
  Wallet,
  TrendingUp,
  Percent,
  CalendarCheck,
  Star,
  Users,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { api } from '../../api';
import { formatVND } from '../../lib/utils';

export default function DashboardPage() {
  const { data, loading, error } = useAsyncData(async () => {
    const [accRes, rentalRes, amenitiesRes, bookingsRes, ratingsRes] = await Promise.all([
      api.accommodations.getAll(),
      api.rentalRooms.getAll(),
      api.amenities.getAll(),
      api.bookings.getAll(),
      api.ratings.getAll(),
    ]);

    const accommodations = accRes.data || [];
    const rentalRooms = rentalRes.data || [];
    const bookings = bookingsRes.data || [];

    let hotelCount = 0;
    let resortCount = 0;
    let homestayCount = 0;
    let stayRoomsTotal = 0;
    let sumDefaultProfitRate = 0;

    const hostMap = new Map();

    const ensureHostEntry = (hostObj, fallbackId) => {
      const id =
        (typeof hostObj === 'object' && hostObj?._id) ||
        (typeof hostObj === 'string' && hostObj) ||
        fallbackId ||
        'UNKNOWN_HOST';

      if (!hostMap.has(id)) {
        hostMap.set(id, {
          hostId: id,
          fullName: typeof hostObj === 'object' ? hostObj?.fullName || 'Chủ cơ sở' : 'Chủ cơ sở',
          phone: typeof hostObj === 'object' ? hostObj?.phone || '' : '',
          businessType:
            typeof hostObj === 'object'
              ? hostObj?.hostProfile?.businessType || 'INDIVIDUAL'
              : 'INDIVIDUAL',
          accommodationsCount: 0,
          rentalRoomsCount: 0,
          totalRooms: 0,
          profitRates: [],
          bookingsCount: 0,
          grossRevenue: 0,
          hostEarnings: 0,
          platformProfit: 0,
        });
      }
      return hostMap.get(id);
    };

    for (const acc of accommodations) {
      const cat = String(acc.category || '').toUpperCase();
      if (cat === 'HOTEL') hotelCount += 1;
      else if (cat === 'RESORT') resortCount += 1;
      else if (cat === 'HOMESTAY') homestayCount += 1;

      const roomsInAcc = Number(acc.specs?.totalRoomsCount || 0);
      const defaultRate = Number(acc.pricing?.defaultProfitPercent ?? 10);
      stayRoomsTotal += roomsInAcc;
      sumDefaultProfitRate += defaultRate;

      const hostEntry = ensureHostEntry(acc.hostId, acc._id);
      hostEntry.accommodationsCount += 1;
      hostEntry.totalRooms += roomsInAcc;
      hostEntry.profitRates.push(defaultRate);
    }

    let rentalUnitsTotal = 0;
    for (const rental of rentalRooms) {
      const available = Number(rental.specs?.availableRooms ?? 1);
      rentalUnitsTotal += available;

      const hostEntry = ensureHostEntry(rental.hostId, rental._id);
      hostEntry.rentalRoomsCount += 1;
      hostEntry.totalRooms += available;
    }

    let stayBookingsCount = 0;
    let viewingBookingsCount = 0;
    let totalCustomerRevenue = 0;
    let totalHostSubtotal = 0;
    let totalPlatformProfit = 0;

    for (const b of bookings) {
      if (b.bookingType === 'VIEWING') {
        viewingBookingsCount += 1;
        continue;
      }

      stayBookingsCount += 1;
      if (b.status === 'CANCELLED') continue;

      const fallbackCustomerTotal =
        b.stayBookingMode === 'HOURLY'
          ? Number(b.hourlyBooking?.estimatedTotal || 0)
          : Number(b.overnightOrDailyBooking?.estimatedTotal || 0);

      const customerTotal = Number(b.profitSummary?.customerTotal ?? fallbackCustomerTotal);
      const profitPercent = Number(
        b.profitSummary?.profitPercent ?? b.selectedSelection?.profitPercent ?? 0
      );

      const hostSubtotal =
        b.profitSummary?.hostSubtotal !== undefined
          ? Number(b.profitSummary.hostSubtotal)
          : profitPercent > 0
            ? Math.round(customerTotal / (1 + profitPercent / 100))
            : customerTotal;

      const platformProfit =
        b.profitSummary?.platformProfit !== undefined
          ? Number(b.profitSummary.platformProfit)
          : Math.max(0, customerTotal - hostSubtotal);

      totalCustomerRevenue += customerTotal;
      totalHostSubtotal += hostSubtotal;
      totalPlatformProfit += platformProfit;

      const accRef = b.accommodationId;
      const hostObj = typeof accRef === 'object' ? accRef?.hostId : null;
      const hostIdKey =
        (typeof hostObj === 'object' && hostObj?._id) ||
        (typeof hostObj === 'string' && hostObj) ||
        null;

      if (hostIdKey) {
        const hostEntry = ensureHostEntry(hostObj, hostIdKey);
        hostEntry.bookingsCount += 1;
        hostEntry.grossRevenue += customerTotal;
        hostEntry.hostEarnings += hostSubtotal;
        hostEntry.platformProfit += platformProfit;
      }
    }

    const effectiveProfitMarginPercent =
      totalHostSubtotal > 0
        ? Number(((totalPlatformProfit / totalHostSubtotal) * 100).toFixed(1))
        : accommodations.length > 0
          ? Number((sumDefaultProfitRate / accommodations.length).toFixed(1))
          : 0;

    const hostPerformance = Array.from(hostMap.values())
      .map((h) => {
        const avgConfiguredRate =
          h.profitRates.length > 0
            ? Number(
                (h.profitRates.reduce((sum, r) => sum + r, 0) / h.profitRates.length).toFixed(1)
              )
            : 0;

        const actualProfitPercent =
          h.hostEarnings > 0
            ? Number(((h.platformProfit / h.hostEarnings) * 100).toFixed(1))
            : avgConfiguredRate;

        return {
          ...h,
          avgConfiguredRate,
          actualProfitPercent,
        };
      })
      .sort((a, b) => b.platformProfit - a.platformProfit || b.totalRooms - a.totalRooms);

    return {
      totalCustomerRevenue,
      totalHostSubtotal,
      totalPlatformProfit,
      effectiveProfitMarginPercent,
      totalRoomsSystem: stayRoomsTotal + rentalUnitsTotal,
      stayRoomsTotal,
      rentalUnitsTotal,
      accommodationsCount: accommodations.length,
      hotelCount,
      resortCount,
      homestayCount,
      rentalRoomsCount: rentalRooms.length,
      stayBookingsCount,
      viewingBookingsCount,
      amenitiesCount: amenitiesRes.total ?? amenitiesRes.data?.length ?? 0,
      avgRating: ratingsRes.summary?.averageRating ?? 0,
      totalReviews: ratingsRes.summary?.totalReviews ?? 0,
      hostPerformance,
    };
  }, []);

  if (error) {
    return <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống ATB LAND</h1>
        <p className="text-sm text-slate-500">
          Báo cáo doanh thu, tỷ suất % lợi nhuận nền tảng, hiệu suất từng Host và tổng quỹ phòng toàn hệ thống
        </p>
      </div>

      {/* Hàng 1: Báo cáo Doanh thu & Lợi nhuận nền tảng */}
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Báo cáo Doanh thu &amp; Lợi nhuận nền tảng
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tổng doanh thu khách đặt"
            value={loading ? '...' : formatVND(data?.totalCustomerRevenue)}
            subtitle={`${data?.stayBookingsCount ?? 0} đơn lưu trú • ${data?.viewingBookingsCount ?? 0} lịch xem trọ`}
            icon={<Wallet size={20} />}
          />
          <StatCard
            title="Lợi nhuận nền tảng ATB"
            value={loading ? '...' : formatVND(data?.totalPlatformProfit)}
            subtitle={`Tỷ suất lợi nhuận TB: +${data?.effectiveProfitMarginPercent ?? 0}%`}
            icon={<TrendingUp size={20} />}
          />
          <StatCard
            title="Doanh thu trả về Hosts"
            value={loading ? '...' : formatVND(data?.totalHostSubtotal)}
            subtitle={`Từ ${data?.hostPerformance?.length ?? 0} chủ cơ sở / đối tác`}
            icon={<Percent size={20} />}
          />
          <StatCard
            title="Điểm đánh giá trung bình"
            value={loading ? '...' : `${data?.avgRating} ★`}
            subtitle={`${data?.totalReviews ?? 0} đánh giá • ${data?.amenitiesCount ?? 0} tiện ích`}
            icon={<Star size={20} />}
          />
        </div>
      </div>

      {/* Hàng 2: Thống kê Tổng số phòng, Khách sạn, Resort, Homestay & Phòng trọ */}
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Thống kê Quỹ phòng &amp; Loại hình cơ sở
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Tổng số phòng toàn web"
            value={loading ? '...' : data?.totalRoomsSystem}
            subtitle={`${data?.stayRoomsTotal ?? 0} phòng lưu trú + ${data?.rentalUnitsTotal ?? 0} phòng trọ`}
            icon={<DoorOpen size={20} />}
          />
          <StatCard
            title="Khách sạn (Hotel)"
            value={loading ? '...' : data?.hotelCount}
            subtitle="Cơ sở khách sạn"
            icon={<Hotel size={20} />}
          />
          <StatCard
            title="Khu nghỉ dưỡng (Resort)"
            value={loading ? '...' : data?.resortCount}
            subtitle="Cơ sở resort"
            icon={<Palmtree size={20} />}
          />
          <StatCard
            title="Homestay"
            value={loading ? '...' : data?.homestayCount}
            subtitle={`Tổng ${data?.accommodationsCount ?? 0} cơ sở ngắn hạn`}
            icon={<Building2 size={20} />}
          />
          <StatCard
            title="Phòng trọ & Căn hộ"
            value={loading ? '...' : data?.rentalRoomsCount}
            subtitle={`${data?.rentalUnitsTotal ?? 0} phòng đang trống`}
            icon={<Home size={20} />}
          />
        </div>
      </div>

      {/* Hàng 3: Bảng chi tiết Doanh thu & % Lợi nhuận thu được từ từng Host */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Báo cáo Doanh thu &amp; % Lợi nhuận theo từng Host
              </h2>
              <p className="text-xs text-slate-500">
                Tổng hợp số lượng cơ sở, quỹ phòng, tổng tiền khách thanh toán và phần hoa hồng web thu được
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            <CalendarCheck size={14} />
            {data?.hostPerformance?.length ?? 0} đối tác Host
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Chủ cơ sở (Host)</th>
                <th className="px-4 py-3">Loại hình</th>
                <th className="px-4 py-3 text-center">Cơ sở / Trọ</th>
                <th className="px-4 py-3 text-center">Tổng phòng</th>
                <th className="px-4 py-3 text-center">Số đơn</th>
                <th className="px-4 py-3 text-right">Tổng doanh thu</th>
                <th className="px-4 py-3 text-right">Phần trả Host</th>
                <th className="px-4 py-3 text-center">% Lợi nhuận</th>
                <th className="px-4 py-3 text-right">Lợi nhuận ATB thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    Đang tổng hợp số liệu báo cáo...
                  </td>
                </tr>
              ) : (data?.hostPerformance || []).length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    Chưa có dữ liệu Host hoặc đơn đặt phòng.
                  </td>
                </tr>
              ) : (
                data.hostPerformance.map((host) => (
                  <tr key={host.hostId} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{host.fullName}</div>
                      {host.phone && <div className="text-xs text-slate-500">{host.phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          host.businessType === 'ENTERPRISE'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {host.businessType === 'ENTERPRISE' ? 'Doanh nghiệp' : 'Cá nhân'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {host.accommodationsCount} CS • {host.rentalRoomsCount} trọ
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-800">
                      {host.totalRooms}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">{host.bookingsCount}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatVND(host.grossRevenue)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatVND(host.hostEarnings)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        +{host.actualProfitPercent}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-teal-700">
                      {formatVND(host.platformProfit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
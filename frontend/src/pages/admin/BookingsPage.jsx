import { useState } from 'react';
import { Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import { useAsyncData } from '../../hooks/useAsyncData';
import { api } from '../../api';
import { formatDateVN, formatVND } from '../../lib/utils';

function getBookingTimeLabel(row) {
  if (row.bookingType === 'VIEWING') {
    return `${formatDateVN(row.viewingSchedule?.appointmentTime)} ${
      row.viewingSchedule?.timeSlot ? `(${row.viewingSchedule.timeSlot})` : ''
    }`;
  }
  if (row.stayBookingMode === 'HOURLY' && row.hourlyBooking) {
    return `${formatDateVN(row.hourlyBooking.bookingDate)} • ${
      row.hourlyBooking.checkInTime || ''
    } (${row.hourlyBooking.durationHours}h)`;
  }
  return `${formatDateVN(row.overnightOrDailyBooking?.checkInDate)} → ${formatDateVN(
    row.overnightOrDailyBooking?.checkOutDate
  )}`;
}

function getBookingTotal(row) {
  if (row.bookingType !== 'STAY') return 0;
  if (row.profitSummary?.customerTotal !== undefined) return row.profitSummary.customerTotal;
  if (row.stayBookingMode === 'HOURLY') return row.hourlyBooking?.estimatedTotal || 0;
  return row.overnightOrDailyBooking?.estimatedTotal || 0;
}

export default function BookingsPage() {
  const [phone, setPhone] = useState('');
  const [submittedPhone, setSubmittedPhone] = useState('');

  const { data, loading } = useAsyncData(async () => {
    const res = await api.bookings.getAll(submittedPhone ? { phone: submittedPhone } : {});
    return res.data || [];
  }, [submittedPhone]);

  const columns = [
    { header: 'Mã đơn', accessor: 'bookingCode' },
    {
      header: 'Khách hàng',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.guestInfo?.fullName || '—'}</div>
          <div className="text-xs text-slate-500">{row.guestInfo?.phone || ''}</div>
        </div>
      ),
    },
    {
      header: 'Phòng & Gói đã chọn',
      render: (row) =>
        row.bookingType === 'STAY' ? (
          <div>
            <div className="font-medium text-slate-800">
              Phòng {row.selectedSelection?.roomNumber || '—'} •{' '}
              {row.selectedSelection?.packageName || '—'}
            </div>
            <div className="text-xs text-slate-500">
              {row.stayBookingMode} • Lợi nhuận +
              {row.profitSummary?.profitPercent ?? row.selectedSelection?.profitPercent ?? 0}%
            </div>
          </div>
        ) : (
          <span className="text-xs font-semibold text-indigo-700">Lịch hẹn xem phòng trọ</span>
        ),
    },
    {
      header: 'Thời gian',
      render: (row) => <span className="text-xs text-slate-700">{getBookingTimeLabel(row)}</span>,
    },
    {
      header: 'Tổng khách trả / Lợi nhuận',
      render: (row) =>
        row.bookingType === 'STAY' ? (
          <div>
            <div className="font-semibold text-slate-900">{formatVND(getBookingTotal(row))}</div>
            {row.profitSummary?.platformProfit !== undefined && (
              <div className="text-xs font-medium text-emerald-700">
                Lợi nhuận: +{formatVND(row.profitSummary.platformProfit)}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs font-medium text-slate-500">Miễn phí</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Đặt phòng &amp; Lịch hẹn</h1>
          <p className="text-sm text-slate-500">
            Theo dõi đơn theo giờ, qua đêm, theo ngày &amp; lịch xem phòng
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedPhone(phone.trim());
          }}
          className="flex gap-2"
        >
          <input
            placeholder="Tra cứu theo SĐT..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <Button type="submit">
            <Search size={16} /> Tìm
          </Button>
        </form>
      </div>

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
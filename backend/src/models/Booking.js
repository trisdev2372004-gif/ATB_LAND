import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, required: true, unique: true },
    bookingType: {
      type: String,
      enum: ['VIEWING', 'STAY'],
      required: true,
    },
    stayBookingMode: {
      type: String,
      enum: ['HOURLY', 'OVERNIGHT', 'DAILY', null],
      default: null,
    },

    rentalRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalRoom', default: null },
    accommodationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Accommodation', default: null },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
    roomUnitId: { type: mongoose.Schema.Types.ObjectId, default: null },
    ratePackageId: { type: mongoose.Schema.Types.ObjectId, default: null },

    selectedSelection: {
      roomNumber: { type: String, default: '' },
      packageCode: { type: String, default: '' },
      packageName: { type: String, default: '' },
      bookingMode: { type: String, enum: ['HOURLY', 'OVERNIGHT', 'DAILY'], default: 'OVERNIGHT' },
      baseUnitPrice: { type: Number, default: 0 },      // Giá gốc 1 đơn vị trước lợi nhuận
      profitPercent: { type: Number, default: 0 },      // % lợi nhuận áp dụng
      customerUnitPrice: { type: Number, default: 0 },  // Đơn giá hiển thị cho khách (đã gồm % lợi nhuận)
      includedServices: [{ type: String }],
      cancellationPolicy: { type: String, default: '' },
    },

    // Tổng kết lợi nhuận của website trên đơn đặt phòng này
    profitSummary: {
      profitPercent: { type: Number, default: 0 },
      hostSubtotal: { type: Number, default: 0 },     // Tiền phòng gốc (phần của chủ nhà)
      platformProfit: { type: Number, default: 0 },   // Tiền lợi nhuận web ăn được
      customerTotal: { type: Number, default: 0 },    // Tổng tiền khách thanh toán (đã cộng lợi nhuận vào giá phòng)
    },

    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    guestInfo: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
      default: 'CONFIRMED',
    },

    viewingSchedule: {
      appointmentTime: { type: Date, default: null },
      timeSlot: { type: String, default: '' },
      note: { type: String, default: '' },
    },

    hourlyBooking: {
      bookingDate: { type: Date, default: null },
      checkInTime: { type: String, default: '' },
      checkOutTime: { type: String, default: '' },
      baseHours: { type: Number, default: 2, min: 1 },
      basePrice: { type: Number, default: 0 },
      extraHourPrice: { type: Number, default: 0 },
      durationHours: { type: Number, default: 2, min: 1 },
      extraHours: { type: Number, default: 0 },
      roomQuantity: { type: Number, default: 1, min: 1 },
      adults: { type: Number, default: 2 },
      children: { type: Number, default: 0 },
      estimatedTotal: { type: Number, default: 0 },
    },

    overnightOrDailyBooking: {
      stayMode: { type: String, enum: ['OVERNIGHT', 'DAILY'], default: 'OVERNIGHT' },
      checkInDate: { type: Date, default: null },
      checkOutDate: { type: Date, default: null },
      totalUnits: { type: Number, default: 1, min: 1 },
      roomQuantity: { type: Number, default: 1, min: 1 },
      adults: { type: Number, default: 2 },
      children: { type: Number, default: 0 },
      estimatedTotal: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ rentalRoomId: 1, status: 1 });
bookingSchema.index({ accommodationId: 1, roomId: 1, roomUnitId: 1, status: 1 });

export default mongoose.model('Booking', bookingSchema);
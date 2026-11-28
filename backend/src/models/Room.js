import mongoose from 'mongoose';

const ratePackageSchema = new mongoose.Schema(
  {
    code: { type: String, trim: true, uppercase: true, default: '' },
    name: { type: String, required: [true, 'Vui lòng nhập tên gói giá'], trim: true },
    // Hình thức đặt phòng: Đặt theo giờ | Đặt qua đêm | Đặt theo ngày
    bookingMode: {
      type: String,
      enum: ['HOURLY', 'OVERNIGHT', 'DAILY'],
      default: 'OVERNIGHT',
      required: true,
    },
    // Số giờ tối thiểu (nếu bookingMode = HOURLY, VD: 2 giờ đầu)
    minHours: { type: Number, default: 2, min: 1 },
    // Giá phụ thu mỗi giờ tiếp theo (nếu bookingMode = HOURLY)
    extraHourPrice: { type: Number, default: 0, min: 0 },
    price: {
      type: Number,
      required: [true, 'Vui lòng nhập mức giá của gói'],
      min: [0, 'Giá gói không được nhỏ hơn 0'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Giá gốc không được nhỏ hơn 0'],
      default: null,
    },
    includedServices: [{ type: String, trim: true }],
    includedAmenityIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Amenity' }],
    extraCharges: [
      {
        name: { type: String, trim: true, required: true },
        price: { type: Number, required: true, min: 0 },
        unit: { type: String, trim: true, default: '' },
      },
    ],
    cancellationPolicy: {
      type: String,
      trim: true,
      default: 'Miễn phí hủy trước 24 giờ',
    },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const roomUnitSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: [true, 'Vui lòng nhập số/mã phòng'], trim: true },
    floor: { type: Number, default: 1 },
    area: { type: Number, min: 8, default: null },
    viewType: { type: String, trim: true, default: '' },
    extraFeatures: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'INACTIVE'],
      default: 'AVAILABLE',
    },
    ratePackages: {
      type: [ratePackageSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'Mỗi phòng cần có ít nhất 1 gói giá',
      },
      profitPercent: {
        type: Number,
        default: null, // null = kế thừa pricing.defaultProfitPercent của Accommodation; nếu nhập số (VD: 15) thì ưu tiên gói này
        min: [0, '% lợi nhuận không được nhỏ hơn 0'],
        max: [100, '% lợi nhuận không được vượt quá 100%'],
      },
    },
    notes: { type: String, trim: true, default: '' },
  },
  { _id: true }
);

const roomSchema = new mongoose.Schema(
  {
    accommodationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Accommodation',
      required: [true, 'Thiếu liên kết cơ sở lưu trú (accommodationId)'],
      index: true,
    },
    name: { type: String, required: [true, 'Vui lòng nhập tên hạng phòng'], trim: true },
    roomCode: { type: String, trim: true, uppercase: true, default: '' },
    roomType: {
      type: String,
      enum: ['STANDARD', 'SUPERIOR', 'DELUXE', 'EXECUTIVE', 'SUITE', 'VILLA', 'BUNGALOW'],
      default: 'STANDARD',
    },
    description: { type: String, trim: true, default: '' },
    area: { type: Number, required: true, min: 8 },
    maxAdults: { type: Number, default: 2, min: 1 },
    maxChildren: { type: Number, default: 1, min: 0 },
    bedType: { type: String, trim: true, default: '1 Giường đôi King' },
    viewType: { type: String, trim: true, default: 'Hướng thành phố' },
    roomUnits: { type: [roomUnitSchema], default: [] },
    amenityIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Amenity' }],
    images: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: '' },
        isCover: { type: Boolean, default: false },
      },
    ],
    status: {
      type: String,
      enum: ['ACTIVE', 'MAINTENANCE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

roomSchema.index({ accommodationId: 1, status: 1 });
roomSchema.index({ 'roomUnits.roomNumber': 1 });
roomSchema.index({ 'roomUnits.ratePackages.bookingMode': 1, 'roomUnits.ratePackages.price': 1 });

export default mongoose.model('Room', roomSchema);
import mongoose from 'mongoose';

const accommodationSchema = new mongoose.Schema(
  {
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: {
      type: String,
      enum: ['HOTEL', 'RESORT', 'HOMESTAY'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED'],
      default: 'ACTIVE',
    },
    description: { type: String, default: '' },
    location: {
      city: { type: String, required: true },
      district: { type: String, required: true },
      ward: { type: String, default: '' },
      addressDetail: { type: String, required: true },
      geo: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [107.5905, 16.4637] },
      },
    },
    pricing: {
      minNightlyPrice: { type: Number, required: true, min: 0 }, // Giá hiển thị cho khách (đã gồm % lợi nhuận)
      defaultProfitPercent: { type: Number, default: 10, min: 0, max: 100 }, // % lợi nhuận web mặc định (VD: 10%)
      checkInTime: { type: String, default: '14:00' },
      checkOutTime: { type: String, default: '12:00' },
    },
    specs: {
      starRating: { type: Number, min: 1, max: 5, default: 4 },
      totalRoomsCount: { type: Number, default: 1, min: 1 },
    },
    amenityIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Amenity' }],
    media: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: '' },
        isCover: { type: Boolean, default: false },
      },
    ],
    reportCount: { type: Number, default: 0 },
    lastConfirmedAt: { type: Date, default: Date.now },
    checkInTypes: {
      type: [
        {
          type: String,
          enum: [
            'SELF_CHECKIN',     // Tự check-in (khóa thông minh / hộp khóa mật mã)
            'RECEPTION_24_7',   // Sảnh lễ tân 24/7
            'CONTACT_HOST',     // Liên hệ chủ nhà / quản lý trực tiếp
            'EXPRESS_CHECKIN',  // Check-in nhanh / Online trước khi đến
          ],
        },
      ],
      default: ['RECEPTION_24_7'],
    },
    checkInInstruction: {
      type: String,
      trim: true,
      default: '', // VD: "Nhắn Zalo chủ nhà trước 30 phút để nhận mã khóa cửa thông minh"
    },
  },
  { timestamps: true }
);

accommodationSchema.index({ 'location.city': 1, category: 1, status: 1, 'pricing.minNightlyPrice': 1 });
accommodationSchema.index({ amenityIds: 1 });
accommodationSchema.index({ 'location.geo': '2dsphere' });

export default mongoose.model('Accommodation', accommodationSchema);
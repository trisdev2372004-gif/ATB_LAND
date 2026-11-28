import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');

function findAmenityModelPath() {
  const candidates = [
    path.join(backendRoot, 'models', 'Amenity.js'),
    path.join(backendRoot, 'models', 'amenity.js'),
    path.join(backendRoot, 'src', 'models', 'Amenity.js'),
    path.join(backendRoot, 'src', 'models', 'amenity.js'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    `Không tìm thấy file model Amenity. Đã kiểm tra:\n- ${candidates.join('\n- ')}`
  );
}

const modelModule = await import(pathToFileURL(findAmenityModelPath()).href);
const Amenity = modelModule.default;

function toSlug(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const DEFAULT_AMENITIES = [
  { name: 'Wifi miễn phí', icon: 'Wifi', group: 'BASIC' },
  { name: 'Điều hòa', icon: 'AirVent', group: 'BASIC' },
  { name: 'Smart TV', icon: 'Tv', group: 'BASIC' },
  { name: 'Vòi sen nóng lạnh', icon: 'ShowerHead', group: 'BASIC' },
  { name: 'Quạt trần / Thông gió', icon: 'Fan', group: 'BASIC' },
  { name: 'Máy sưởi', icon: 'Heater', group: 'BASIC' },
  { name: 'Tiện ích tiêu chuẩn', icon: 'CheckCircle2', group: 'BASIC' },

  { name: 'Giường đôi', icon: 'BedDouble', group: 'FURNITURE' },
  { name: 'Bồn tắm', icon: 'Bath', group: 'FURNITURE' },
  { name: 'Tủ lạnh / Minibar', icon: 'Refrigerator', group: 'FURNITURE' },
  { name: 'Máy giặt', icon: 'WashingMachine', group: 'FURNITURE' },
  { name: 'Lò vi sóng', icon: 'Microwave', group: 'FURNITURE' },
  { name: 'Bếp nấu ăn', icon: 'ChefHat', group: 'FURNITURE' },
  { name: 'Phòng khách / Sofa', icon: 'Sofa', group: 'FURNITURE' },
  { name: 'Ban công / Sân thượng', icon: 'Sun', group: 'FURNITURE' },
  { name: 'Bàn làm việc', icon: 'Laptop', group: 'FURNITURE' },

  { name: 'Ăn sáng / Nhà hàng', icon: 'Utensils', group: 'RESORT_SERVICE' },
  { name: 'Cà phê / Trà', icon: 'Coffee', group: 'RESORT_SERVICE' },
  { name: 'Quầy bar / Lounge', icon: 'Wine', group: 'RESORT_SERVICE' },
  { name: 'Bể bơi', icon: 'Waves', group: 'RESORT_SERVICE' },
  { name: 'Phòng Gym', icon: 'Dumbbell', group: 'RESORT_SERVICE' },
  { name: 'Spa / Dịch vụ cao cấp', icon: 'Sparkles', group: 'RESORT_SERVICE' },
  { name: 'Đưa đón sân bay', icon: 'Plane', group: 'RESORT_SERVICE' },
  { name: 'Thuê xe đạp / xe máy', icon: 'Bike', group: 'RESORT_SERVICE' },
  { name: 'Sân vườn / Cây xanh', icon: 'Trees', group: 'RESORT_SERVICE' },
  { name: 'View núi / Sông / Biển', icon: 'Mountain', group: 'RESORT_SERVICE' },
  { name: 'Bãi biển riêng', icon: 'Umbrella', group: 'RESORT_SERVICE' },
  { name: 'Lễ tân 24/7', icon: 'Bell', group: 'RESORT_SERVICE' },
  { name: 'Gửi hành lý', icon: 'Luggage', group: 'RESORT_SERVICE' },

  { name: 'Bãi đỗ ô tô', icon: 'Car', group: 'SECURITY' },
  { name: 'Chỗ để xe máy', icon: 'ParkingCircle', group: 'SECURITY' },
  { name: 'Bảo vệ / An ninh', icon: 'ShieldCheck', group: 'SECURITY' },
  { name: 'Khóa từ / Vân tay', icon: 'Lock', group: 'SECURITY' },
  { name: 'Tự check-in / Giờ tự do', icon: 'KeyRound', group: 'SECURITY' },
  { name: 'Camera giám sát', icon: 'Camera', group: 'SECURITY' },
  { name: 'PCCC tiêu chuẩn', icon: 'Flame', group: 'SECURITY' },
  { name: 'Y tế / Sơ cứu', icon: 'BriefcaseMedical', group: 'SECURITY' },

  { name: 'Cho phép thú cưng', icon: 'PawPrint', group: 'ADDON_PACKAGE' },
  { name: 'Không hút thuốc', icon: 'CigaretteOff', group: 'ADDON_PACKAGE' },
  { name: 'Phù hợp trẻ em', icon: 'Baby', group: 'ADDON_PACKAGE' },
  { name: 'Phòng gia đình / Nhóm', icon: 'Users', group: 'ADDON_PACKAGE' },
];

async function seedAmenities() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('Thiếu biến môi trường MONGODB_URI trong .env');
  }

  await mongoose.connect(mongoUri);
  console.log('Đã kết nối MongoDB...');

  const ops = DEFAULT_AMENITIES.map((item) => {
    const slug = toSlug(item.name);
    return {
      updateOne: {
        filter: { slug },
        update: {
          $set: {
            name: item.name,
            slug,
            icon: item.icon,
            group: item.group,
            applicableTo: ['RENTAL_ROOM', 'ACCOMMODATION', 'HOTEL_ROOM', 'RATE_PACKAGE'],
            isActive: true,
          },
        },
        upsert: true,
      },
    };
  });

  const result = await Amenity.bulkWrite(ops);
  console.log(
    `Hoàn tất nạp ${DEFAULT_AMENITIES.length} tiện ích (Tạo mới: ${result.upsertedCount}, Cập nhật: ${result.modifiedCount})`
  );

  await mongoose.disconnect();
}

seedAmenities().catch((err) => {
  console.error('Lỗi nạp dữ liệu tiện ích:', err);
  process.exit(1);
});
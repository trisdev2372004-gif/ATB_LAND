import mongoose from 'mongoose';
import Accommodation from '../models/Accommodation.js';
import Room from '../models/Room.js';
import { applyProfitMarkup, enrichRoomWithCustomerPrices } from '../utils/pricingHelper.js';

function toSlug(text) {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') +
    '-' +
    Date.now().toString().slice(-5)
  );
}

/**
 * Lấy danh sách & Lọc cơ sở lưu trú theo category, roomType (hạng phòng đang có),
 * thành phố, quận/huyện, khoảng giá, amenityIds và sắp xếp
 */
export async function getAccommodations(req, res) {
  try {
    const { category, roomType, city, district, priceRange, amenityIds, checkInType, sortBy } = req.query;
    const filter = { status: 'ACTIVE' };

    if (category && category !== 'ALL') {
      filter.category = category;
    }

    if (city && city !== 'ALL') filter['location.city'] = city;
    if (district && district !== 'ALL') filter['location.district'] = district;

    if (checkInType && checkInType !== 'ALL') {
      const types = String(checkInType)
        .split(',')
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean);
      if (types.length > 0) {
        filter.checkInTypes = { $in: types };
      }
    }
    // Lọc theo khoảng giá đêm (khớp với schema Accommodation: pricing.minNightlyPrice)
    if (priceRange && priceRange !== 'ALL') {
      if (priceRange === 'UNDER_500K') filter['pricing.minNightlyPrice'] = { $lt: 500000 };
      if (priceRange === '500K_TO_1M') filter['pricing.minNightlyPrice'] = { $gte: 500000, $lte: 1000000 };
      if (priceRange === '1M_TO_2M') filter['pricing.minNightlyPrice'] = { $gt: 1000000, $lte: 2000000 };
      if (priceRange === 'OVER_2M') filter['pricing.minNightlyPrice'] = { $gt: 2000000 };
    }

    // Lọc theo danh sách ID tiện ích dùng chung (khớp với schema Accommodation: amenityIds)
    if (amenityIds) {
      const ids = String(amenityIds)
        .split(',')
        .map((id) => id.trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (ids.length > 0) {
        filter.amenityIds = { $all: ids };
      }
    }

    // Lọc theo loại hạng phòng (roomType: STANDARD | SUPERIOR | DELUXE | EXECUTIVE | SUITE | VILLA | BUNGALOW)
    if (roomType && roomType !== 'ALL') {
      const types = String(roomType)
        .split(',')
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean);

      if (types.length > 0) {
        const matchingAccommodationIds = await Room.distinct('accommodationId', {
          roomType: { $in: types },
          status: 'ACTIVE',
        });
        filter._id = { $in: matchingAccommodationIds };
      }
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'price-asc') sortOption = { 'pricing.minNightlyPrice': 1 };
    if (sortBy === 'price-desc') sortOption = { 'pricing.minNightlyPrice': -1 };
    if (sortBy === 'star-desc') sortOption = { 'specs.starRating': -1 };

    const listings = await Accommodation.find(filter)
      .populate('hostId', 'fullName phone hostProfile')
      .populate('amenityIds', 'name slug icon group')
      .sort(sortOption);

    // Gắn thêm danh sách roomType đang có của từng cơ sở để frontend hiển thị badge / bộ lọc
    const accIds = listings.map((item) => item._id);
    const activeRooms = await Room.find({
      accommodationId: { $in: accIds },
      status: 'ACTIVE',
    }).select('accommodationId roomType name');

    const roomTypesByAcc = new Map();
    for (const r of activeRooms) {
      const key = r.accommodationId.toString();
      if (!roomTypesByAcc.has(key)) roomTypesByAcc.set(key, new Set());
      roomTypesByAcc.get(key).add(r.roomType);
    }

    const enrichedListings = listings.map((item) => {
      const obj = item.toObject();
      obj.availableRoomTypes = Array.from(roomTypesByAcc.get(item._id.toString()) || []);
      return obj;
    });

    res.json({ success: true, total: enrichedListings.length, data: enrichedListings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Xem chi tiết 1 cơ sở lưu trú kèm danh sách hạng phòng, phòng cụ thể và các gói giá/dịch vụ
 * Hỗ trợ lọc theo ?roomType=DELUXE
 */
export async function getAccommodationDetail(req, res) {
  try {
    const rawParam = String(req.params.idOrSlug || '').replace(/^:/, '').trim();
    const { roomType } = req.query;

    const query = mongoose.Types.ObjectId.isValid(rawParam)
      ? { _id: rawParam }
      : { slug: rawParam };

    const item = await Accommodation.findOne(query)
      .populate('hostId', 'fullName phone hostProfile')
      .populate('amenityIds', 'name slug icon group');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cơ sở lưu trú.' });
    }

    const roomFilter = { accommodationId: item._id, status: 'ACTIVE' };
    if (roomType && roomType !== 'ALL') {
      roomFilter.roomType = String(roomType).trim().toUpperCase();
    }

    const [rooms, allRoomTypes] = await Promise.all([
      Room.find(roomFilter)
        .populate('amenityIds', 'name slug icon group')
        .populate('roomUnits.ratePackages.includedAmenityIds', 'name slug icon group')
        .sort({ createdAt: 1 }),
      Room.distinct('roomType', {
        accommodationId: item._id,
        status: 'ACTIVE',
      }),
    ]);

    const enrichedRooms = rooms.map((r) => enrichRoomWithCustomerPrices(r, item));

    res.json({
      success: true,
      data: {
        ...item.toObject(),
        availableRoomTypes: allRoomTypes,
        rooms: enrichedRooms,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Host / Admin đăng tin cơ sở lưu trú mới (có thể kèm danh sách hạng phòng `roomTypes` khởi tạo ngay)
 */
export async function createAccommodation(req, res) {
  try {
    const {
      title,
      category,
      description,
      location,
      pricing,
      specs,
      amenityIds,
      media,
      checkInTypes,
      checkInInstruction,
      roomTypes,
    } = req.body;
    const defaultProfit = Number(pricing?.defaultProfitPercent ?? 10);

    const newItem = await Accommodation.create({
      hostId: req.user.userId,
      title,
      slug: toSlug(title),
      category,
      status: req.user.role === 'ADMIN' ? 'ACTIVE' : 'PENDING',
      description,
      location,
      pricing: {
        minNightlyPrice: pricing?.minNightlyPrice ?? 0,
        defaultProfitPercent: Number(pricing?.defaultProfitPercent ?? 10),
        checkInTime: pricing?.checkInTime || '14:00',
        checkOutTime: pricing?.checkOutTime || '12:00',
      },
      checkInTypes:
        Array.isArray(checkInTypes) && checkInTypes.length > 0
          ? checkInTypes.map((t) => String(t).trim().toUpperCase())
          : ['RECEPTION_24_7'],
      checkInInstruction: checkInInstruction || '',
      specs: {
        starRating: specs?.starRating || 4,
        totalRoomsCount: specs?.totalRoomsCount || 1,
      },
      amenityIds: amenityIds || [],
      media: media || [],
    });

    let createdRooms = [];
    if (Array.isArray(roomTypes) && roomTypes.length > 0) {
      const docs = roomTypes.map((rt) => ({
        ...rt,
        accommodationId: newItem._id,
        roomType: (rt.roomType || 'STANDARD').toUpperCase(),
        status: rt.status || 'ACTIVE',
      }));
      createdRooms = await Room.insertMany(docs);

      // Đồng bộ lại minNightlyPrice và totalRoomsCount từ các hạng phòng vừa tạo
      let minPrice = Infinity;
      let totalUnits = 0;
      for (const r of createdRooms) {
        totalUnits += Array.isArray(r.roomUnits) ? r.roomUnits.length : 0;
        for (const u of r.roomUnits || []) {
          for (const pkg of u.ratePackages || []) {
            if (pkg.isActive !== false && typeof pkg.price === 'number' && pkg.price < minPrice) {
              minPrice = pkg.price;
            }
          }
        }
      }

      const updateFields = {};
      if (minPrice !== Infinity) updateFields['pricing.minNightlyPrice'] = minPrice;
      if (totalUnits > 0) updateFields['specs.totalRoomsCount'] = totalUnits;

      if (Object.keys(updateFields).length > 0) {
        await Accommodation.findByIdAndUpdate(newItem._id, updateFields);
      }
    }

    const finalAccommodation = await Accommodation.findById(newItem._id)
      .populate('hostId', 'fullName phone hostProfile')
      .populate('amenityIds', 'name slug icon group');

    res.status(201).json({
      success: true,
      data: {
        ...finalAccommodation.toObject(),
        rooms: createdRooms,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * Báo cáo tin sai sự thật (tự động ẩn tạm thời khi >= 3 báo cáo)
 */
export async function reportAccommodation(req, res) {
  try {
    const item = await Accommodation.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy tin đăng.' });

    item.reportCount += 1;
    if (item.reportCount >= 3) {
      item.status = 'INACTIVE';
    }
    await item.save();

    res.json({
      success: true,
      message: 'Đã ghi nhận báo cáo vi phạm. Hệ thống sẽ tự động ẩn tin nếu vượt ngưỡng kiểm duyệt.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Admin duyệt hoặc thay đổi trạng thái tin đăng
 */
export async function updateAccommodationStatus(req, res) {
  try {
    const { status } = req.body;
    const updated = await Accommodation.findByIdAndUpdate(
      req.params.id,
      { status, lastConfirmedAt: new Date() },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cơ sở lưu trú.' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}
import Accommodation from '../models/Accommodation.js';
import Room from '../models/Room.js';
import {
  applyProfitMarkup,
  resolveProfitPercent,
  enrichRoomWithCustomerPrices,
} from '../utils/pricingHelper.js';

/**
 * Đồng bộ lại giá khởi điểm (pricing.minNightlyPrice) và tổng số phòng (specs.totalRoomsCount)
 */
export async function syncAccommodationMetrics(accommodationId) {
  const [accommodation, activeRooms] = await Promise.all([
    Accommodation.findById(accommodationId),
    Room.find({ accommodationId, status: 'ACTIVE' }),
  ]);
  if (!accommodation) return;

  let minCustomerPrice = Infinity;
  let totalUnits = 0;

  for (const room of activeRooms) {
    const units = Array.isArray(room.roomUnits) ? room.roomUnits : [];
    totalUnits += units.length;

    for (const unit of units) {
      if (unit.status === 'INACTIVE' || unit.status === 'MAINTENANCE') continue;
      for (const pkg of unit.ratePackages || []) {
        if (pkg.isActive !== false && typeof pkg.price === 'number') {
          const rate = resolveProfitPercent(pkg, accommodation);
          const { customerPrice } = applyProfitMarkup(pkg.price, rate);
          if (customerPrice < minCustomerPrice) {
            minCustomerPrice = customerPrice;
          }
        }
      }
    }
  }

  const updatePayload = {};
  if (minCustomerPrice !== Infinity) updatePayload['pricing.minNightlyPrice'] = minCustomerPrice;
  if (totalUnits > 0) updatePayload['specs.totalRoomsCount'] = totalUnits;

  if (Object.keys(updatePayload).length > 0) {
    await Accommodation.findByIdAndUpdate(accommodationId, updatePayload);
  }
}

/**
 * Lấy danh sách các hạng phòng của 1 cơ sở lưu trú (có thể lọc theo ?roomType=)
 */
export async function getRoomTypesByAccommodation(req, res) {
  try {
    const { accommodationId } = req.params;
    const { roomType } = req.query;

    const filter = { accommodationId, status: 'ACTIVE' };
    if (roomType && roomType !== 'ALL') {
      filter.roomType = String(roomType).trim().toUpperCase();
    }

    const [accommodation, list] = await Promise.all([
      Accommodation.findById(accommodationId),
      Room.find(filter)
        .populate('amenityIds', 'name slug icon group')
        .populate('roomUnits.ratePackages.includedAmenityIds', 'name slug icon group')
        .sort({ createdAt: 1 }),
    ]);

    if (!accommodation) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cơ sở lưu trú.' });
    }

    const enriched = list.map((r) => enrichRoomWithCustomerPrices(r, accommodation));
    res.json({ success: true, total: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Tạo hạng phòng mới (kèm danh sách phòng cụ thể `roomUnits` và các `ratePackages` của từng phòng)
 */
export async function createRoomType(req, res) {
  try {
    const { accommodationId } = req.params;
    const accommodation = await Accommodation.findById(accommodationId);

    if (!accommodation) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cơ sở lưu trú.' });
    }

    if (req.user.role !== 'ADMIN' && accommodation.hostId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thêm hạng phòng cho cơ sở này.' });
    }

    const roomTypeDoc = await Room.create({
      ...req.body,
      accommodationId,
      roomType: (req.body.roomType || 'STANDARD').toUpperCase(),
    });

    await syncAccommodationMetrics(accommodationId);

    const populated = await Room.findById(roomTypeDoc._id)
      .populate('amenityIds', 'name slug icon group')
      .populate('roomUnits.ratePackages.includedAmenityIds', 'name slug icon group');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * Cập nhật thông tin hạng phòng
 */
export async function updateRoomType(req, res) {
  try {
    const { roomTypeId } = req.params;
    const roomTypeDoc = await Room.findById(roomTypeId);
    if (!roomTypeDoc) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hạng phòng.' });
    }

    const accommodation = await Accommodation.findById(roomTypeDoc.accommodationId);
    if (req.user.role !== 'ADMIN' && accommodation.hostId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa hạng phòng này.' });
    }

    const payload = { ...req.body };
    if (payload.roomType) payload.roomType = String(payload.roomType).toUpperCase();

    const updated = await Room.findByIdAndUpdate(roomTypeId, payload, { new: true })
      .populate('amenityIds', 'name slug icon group')
      .populate('roomUnits.ratePackages.includedAmenityIds', 'name slug icon group');

    await syncAccommodationMetrics(roomTypeDoc.accommodationId);

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * Thêm 1 phòng cụ thể (ví dụ P.203) vào hạng phòng, kèm danh sách gói giá & dịch vụ
 */
export async function addRoomUnitToRoomType(req, res) {
  try {
    const { roomTypeId } = req.params;
    const roomTypeDoc = await Room.findById(roomTypeId);
    if (!roomTypeDoc) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hạng phòng.' });
    }

    const accommodation = await Accommodation.findById(roomTypeDoc.accommodationId);
    if (req.user.role !== 'ADMIN' && accommodation.hostId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thêm phòng vào hạng phòng này.' });
    }

    roomTypeDoc.roomUnits.push(req.body);
    await roomTypeDoc.save();
    await syncAccommodationMetrics(roomTypeDoc.accommodationId);

    res.status(201).json({ success: true, data: roomTypeDoc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * Thêm 1 gói giá & dịch vụ kèm theo mới cho 1 phòng cụ thể trong hạng phòng
 */
export async function addRatePackageToUnit(req, res) {
  try {
    const { roomTypeId, unitId } = req.params;
    const roomTypeDoc = await Room.findById(roomTypeId);
    if (!roomTypeDoc) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hạng phòng.' });
    }

    const accommodation = await Accommodation.findById(roomTypeDoc.accommodationId);
    if (req.user.role !== 'ADMIN' && accommodation.hostId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền cập nhật gói giá phòng này.' });
    }

    const unit = roomTypeDoc.roomUnits.id(unitId);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng cụ thể trong hạng phòng.' });
    }

    unit.ratePackages.push(req.body);
    await roomTypeDoc.save();
    await syncAccommodationMetrics(roomTypeDoc.accommodationId);

    res.status(201).json({ success: true, data: unit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * Xóa hạng phòng
 */
export async function deleteRoomType(req, res) {
  try {
    const { roomTypeId } = req.params;
    const roomTypeDoc = await Room.findById(roomTypeId);
    if (!roomTypeDoc) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hạng phòng.' });
    }

    const accommodation = await Accommodation.findById(roomTypeDoc.accommodationId);
    if (req.user.role !== 'ADMIN' && accommodation.hostId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa hạng phòng này.' });
    }

    const accId = roomTypeDoc.accommodationId;
    await Room.findByIdAndDelete(roomTypeId);
    await syncAccommodationMetrics(accId);

    res.json({ success: true, message: 'Đã xóa hạng phòng thành công.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
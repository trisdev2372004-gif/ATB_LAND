import Accommodation from '../models/Accommodation.js';
import RentalRoom from '../models/RentalRoom.js';

/**
 * GET /api/map/nearby?lat=16.4637&lng=107.5905&radiusKm=5&type=ALL
 * Trả về tổng số lượng từng loại (HOTEL, RESORT, HOMESTAY, RENTAL_ROOM) + danh sách điểm ghim kèm khoảng cách (km)
 */
export async function getNearbyPlaces(req, res) {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = Math.max(0.5, Math.min(50, Number(req.query.radiusKm || 5)));
    const typeFilter = String(req.query.type || 'ALL').toUpperCase();

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tọa độ hợp lệ (lat, lng).',
      });
    }

    const maxDistanceMeters = radiusKm * 1000;
    const nearPoint = {
      type: 'Point',
      coordinates: [lng, lat], // MongoDB GeoJSON yêu cầu [kinh độ, vĩ độ]
    };

    const [nearbyAccommodations, nearbyRentals] = await Promise.all([
      Accommodation.aggregate([
        {
          $geoNear: {
            near: nearPoint,
            distanceField: 'distanceMeters',
            maxDistance: maxDistanceMeters,
            query: { status: 'ACTIVE', 'location.geo.coordinates.0': { $exists: true } },
            spherical: true,
          },
        },
        {
          $project: {
            title: 1,
            slug: 1,
            category: 1,
            location: 1,
            pricing: 1,
            specs: 1,
            media: 1,
            distanceMeters: 1,
          },
        },
      ]),
      RentalRoom.aggregate([
        {
          $geoNear: {
            near: nearPoint,
            distanceField: 'distanceMeters',
            maxDistance: maxDistanceMeters,
            query: { status: 'ACTIVE', 'location.geo.coordinates.0': { $exists: true } },
            spherical: true,
          },
        },
        {
          $project: {
            title: 1,
            slug: 1,
            category: 1,
            location: 1,
            pricing: 1,
            specs: 1,
            media: 1,
            distanceMeters: 1,
          },
        },
      ]),
    ]);

    const summary = {
      totalAll: 0,
      HOTEL: 0,
      RESORT: 0,
      HOMESTAY: 0,
      RENTAL_ROOM: nearbyRentals.length,
    };

    const mappedAcc = nearbyAccommodations.map((item) => {
      const cat = String(item.category || 'HOTEL').toUpperCase();
      if (summary[cat] !== undefined) summary[cat] += 1;

      const coords = item.location?.geo?.coordinates || [];
      return {
        _id: item._id,
        entityType: 'ACCOMMODATION',
        category: cat,
        title: item.title,
        slug: item.slug,
        address: `${item.location?.addressDetail || ''}, ${item.location?.district || ''}`,
        lat: coords[1],
        lng: coords[0],
        price: item.pricing?.minNightlyPrice ?? item.pricing?.basePrice ?? 0,
        priceLabel: 'đêm',
        distanceKm: Number((item.distanceMeters / 1000).toFixed(2)),
        coverImage: item.media?.find((m) => m.isCover)?.url || item.media?.[0]?.url || '',
      };
    });

    const mappedRentals = nearbyRentals.map((item) => {
      const coords = item.location?.geo?.coordinates || [];
      return {
        _id: item._id,
        entityType: 'RENTAL_ROOM',
        category: 'RENTAL_ROOM',
        subCategory: item.category || 'STUDIO',
        title: item.title,
        slug: item.slug,
        address: `${item.location?.addressDetail || ''}, ${item.location?.district || ''}`,
        lat: coords[1],
        lng: coords[0],
        price: item.pricing?.monthlyRent || 0,
        priceLabel: 'tháng',
        distanceKm: Number((item.distanceMeters / 1000).toFixed(2)),
        coverImage: item.media?.find((m) => m.isCover)?.url || item.media?.[0]?.url || '',
      };
    });

    summary.totalAll = mappedAcc.length + mappedRentals.length;

    let places = [...mappedAcc, ...mappedRentals].sort((a, b) => a.distanceKm - b.distanceKm);
    if (typeFilter !== 'ALL') {
      places = places.filter((p) => p.category === typeFilter);
    }

    res.json({
      success: true,
      center: { lat, lng, radiusKm },
      summary,
      data: places,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
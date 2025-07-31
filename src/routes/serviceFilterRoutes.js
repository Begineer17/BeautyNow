const express = require('express');
const { Op, literal } = require('sequelize');
const Service = require('../models/Service');
const Salon = require('../models/Salon');
const SalonProfile = require('../models/SalonProfile');

const z = 1.96; // 95% confidence

const router = express.Router();

/*
  - category: loại dịch vụ (so sánh với giá trị được lưu trong mảng category của Service)
  - minPrice, maxPrice: khoảng giá của dịch vụ (sử dụng các toán tử >= và <=)
  - location: từ khóa tìm kiếm trong trường address của SalonProfile
*/
router.post('/filter', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, location, isHome } = req.body;
    
    // Điều kiện lọc cho Service
    const serviceWhere = {};
    if(isHome) {
      serviceWhere.isHome = isHome;
    }
    if (category) {
      serviceWhere.category = { [Op.contains]: [category] };
    }
    if (minPrice || maxPrice) {
      serviceWhere.currentPrice = {};
      if (minPrice) serviceWhere.currentPrice[Op.gte] = parseFloat(minPrice);
      if (maxPrice) serviceWhere.currentPrice[Op.lte] = parseFloat(maxPrice);
    }

    // Nếu lọc theo vị trí thì join thêm Salon và SalonProfile
    const include = [];
    if (location) {
        include.push({
            model: Salon,
            required: true, // ép buộc join nội bộ với Salon
            include: [{
                model: SalonProfile,
                required: true, // ép buộc join nội bộ với SalonProfile
                where: { address: { [Op.iLike]: `%${location}%` } },
            }],
        });
    }

    const services = await Service.findAll({
      where: serviceWhere,
      include,
    });

    res.status(200).json({ services });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/*
  API: GET /api/services/top
  Lấy danh sách top services dựa trên rating cao và review count nhiều
  Query params:
  - limit: số lượng kết quả trả về (default: 10)
  - category: filter theo category (optional)
*/
router.get('/top', async (req, res) => {
  try {
    const { limit = 10, category } = req.query;
    
    const whereCondition = {};
    if (category) {
      whereCondition.category = { [Op.contains]: [category] };
    }

    const topServices = await Service.findAll({
      where: whereCondition,
      include: [{
        model: Salon,
        include: [{
          model: SalonProfile,
          attributes: ['name', 'address', 'phone']
        }],
        attributes: ['id', 'email', 'licenseStatus', 'isVerified']
      }],
      order: [
        [literal(`(
            CASE 
              WHEN "Service"."reviewCount" > 0 AND "Service"."rating" IS NOT NULL THEN
                "Service"."rating" * LOG("Service"."reviewCount" + 1)
              ELSE 0
            END
          )`), 'DESC']
      ],
      limit: parseInt(limit),
    });

    res.status(200).json({ 
      success: true,
      data: topServices,
      message: 'Top services retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

/*
  API: GET /api/services/top-salons
  Lấy danh sách top salons dựa trên rating cao và review count nhiều
  Query params:
  - limit: số lượng kết quả trả về (default: 10)
  - location: filter theo địa điểm (optional)
*/
router.get('/top-salons', async (req, res) => {
  try {
    const { limit = 10, location } = req.query;
    
    const whereCondition = {};
    if (location) {
      whereCondition.address = { [Op.iLike]: `%${location}%` };
    }

    const topSalons = await SalonProfile.findAll({
      where: whereCondition,
      include: [{model: Salon, attributes: ['rating', 'reviewCount']}],
      order: [
        // [literal('"Salon"."rating" * LOG("Salon"."reviewCount" + 1)'), 'DESC']
        // [literal(`(
        //     CASE 
        //       WHEN "Salon"."reviewCount" > 0 AND "Salon"."rating" IS NOT NULL THEN
        //         ( (("Salon"."rating") + ${z}*${z}/(2*"Salon"."reviewCount") - ${z} * SQRT((("Salon"."rating")*(1-("Salon"."rating"))+${z}*${z}/(4*"Salon"."reviewCount"))/"Salon"."reviewCount")) 
        //           / (1+${z}*${z}/"Salon"."reviewCount")
        //         )
        //       ELSE 0
        //     END
        //   )`), 'DESC']
          [literal(`(
            CASE 
              WHEN "Salon"."reviewCount" > 0 AND "Salon"."rating" IS NOT NULL THEN
                "Salon"."rating" * LOG("Salon"."reviewCount" + 1)
              ELSE 0
            END
          )`), 'DESC']
      ],
      limit: parseInt(limit),
    });

    res.status(200).json({ 
      success: true,
      data: topSalons,
      message: 'Top salons retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

/*
  API: POST /api/services/search
  Tìm kiếm services và salons cho User
  Body params:
  - query: từ khóa tìm kiếm (tên service, tên salon, mô tả)
  - category: filter theo category service (optional)
  - location: filter theo địa điểm salon (optional)
  - minPrice, maxPrice: khoảng giá service (optional)
  - limit: số lượng kết quả trả về (default: 20)
  - type: 'services' | 'salons' | 'both' (default: 'both')
*/
router.post('/search', async (req, res) => {
  try {
    const { 
      query, 
      category, 
      location, 
      minPrice, 
      maxPrice, 
      // limit = 20, 
      type = 'both' 
    } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Search query is required' 
      });
    }

    const results = { services: [], salons: [] };

    // Tìm kiếm Services
    if (type === 'services' || type === 'both') {
      const serviceWhere = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } }
        ]
      };

      if (category) {
        serviceWhere.category = { [Op.contains]: [category] };
      }

      if (minPrice || maxPrice) {
        serviceWhere.currentPrice = {};
        if (minPrice) serviceWhere.currentPrice[Op.gte] = parseFloat(minPrice);
        if (maxPrice) serviceWhere.currentPrice[Op.lte] = parseFloat(maxPrice);
      }

      const serviceInclude = [{
        model: Salon,
        include: [{
          model: SalonProfile,
          attributes: ['name', 'address', 'phone']
        }],
        attributes: ['id', 'licenseStatus', 'isVerified', 'rating', 'reviewCount']
      }];

      // Nếu có filter theo location thì thêm điều kiện
      if (location) {
        serviceInclude[0].include[0].where = {
          address: { [Op.iLike]: `%${location}%` }
        };
      }

      results.services = await Service.findAll({
        where: serviceWhere,
        include: serviceInclude,
        order: [
          [literal(`(
            CASE 
              WHEN "Service"."reviewCount" > 0 AND "Service"."rating" IS NOT NULL THEN
                "Service"."rating" * LOG("Service"."reviewCount" + 1)
              ELSE 0
            END
          )`), 'DESC']
        ],
        // limit: parseInt(limit),
      });
    }

    // Tìm kiếm Salons
    if (type === 'salons' || type === 'both') {
      const salonWhere = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } }
        ]
      };

      if (location) {
        salonWhere.address = { [Op.iLike]: `%${location}%` };
      }

      results.salons = await SalonProfile.findAll({
        where: salonWhere,
        include: [{
          model: Salon, 
          attributes: ['rating', 'reviewCount']
        }],
        attributes: ['id','name', 'address', 'phone', 'description', 'portfolio', 'priceRange', 'openTime', 'totalStaff'],
        order: [
          [literal(`(
            CASE 
              WHEN "Salon"."reviewCount" > 0 AND "Salon"."rating" IS NOT NULL THEN
                "Salon"."rating" * LOG("Salon"."reviewCount" + 1)
              ELSE 0
            END
          )`), 'DESC']
        ],
      });
    }

    // Tính tổng số kết quả
    const totalResults = results.services.length + results.salons.length;

    res.status(200).json({ 
      success: true,
      data: results,
      totalResults,
      message: 'Search completed successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

router.get('/:salonId', async (req, res) => {
  const { slonId } = req.params;
  try {
    const services = await Service.findAll({
      where: { salonId: req.params.salonId },
    }); 
    
    res.status(200).json({ 
      success: true,
      data: services,
      message: 'Services retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});



router.get('/spa/explore-spa', async (req, res) => {
  try {
    console.log("🔍 Exploring salon profiles with query:", req.query);
    console.log("🔍 Exploring salon profiles with businessType:", req.query.businessType);
    console.log("🔍 Exploring salon profiles with serviceCategory:", req.query.serviceCategory);
    const { query, businessType, serviceCategory, city, district } = req.query;
    const whereClause = {};

    if (query) {
      whereClause.name = { [Op.iLike]: `%${query}%` };
    }

    if (businessType) {
      whereClause.businessType = { [Op.eq]: businessType };
    }

    if (serviceCategory) {
      whereClause[Op.and] = literal(`"tag" @> ARRAY['${serviceCategory}']::text[]`);
    }

    if (city || district) {
      if (city && district) {
        whereClause.address = {
          [Op.and]: [
            { [Op.iLike]: `%${city}%` },
            { [Op.iLike]: `%${district}%` }
          ]
        };
      } else if (city) {
        whereClause.address = { [Op.iLike]: `%${city}%` };
      } else {
        whereClause.address = { [Op.iLike]: `%${district}%` };
      } 
    }
    console.log("🔍 Searching salon profiles with name like:", req.query);

    const salonProfiles = await SalonProfile.findAll({
      where: whereClause,
      attributes: [
        'id',
        'salonId',
        'name',
        'address',
        'phone',
        'description',
        'businessType',
        'portfolio',
        'priceRange',
        'openTime',
        'totalStaff',
        'tag',
        'createdAt'
      ],
      
    });

    res.json({ success: true, length: salonProfiles.length, data: salonProfiles });
  } catch (err) {
    console.error("❌ Error exploring salons:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


router.get('/:salonId', async (req, res) => {
  const { salonId } = req.params;
  try {
    const services = await Service.findAll({
      where: { salonId },
    });
    res.status(200).json({
      success: true,
      data: services,
      message: 'Services retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});
module.exports = router;

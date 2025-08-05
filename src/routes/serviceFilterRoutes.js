const express = require('express');
const { Op, literal } = require('sequelize');
const Service = require('../models/Service');
const Salon = require('../models/Salon');
const SalonProfile = require('../models/SalonProfile');
const Voucher = require('../models/SalonVoucher');

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


router.get('/search', async (req, res) => {
  try {
    const {
      query,
      businessType,
      city,
      district,
      serviceCategory,
      minPrice,
      maxPrice,
      minRating,
      hasPromotion,
      sortBy = 'rating',
      page = '1',
      limit = '20'
    } = req.query;

    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 20;
    const offset = (parsedPage - 1) * parsedLimit;

    const salonWhere = {};

    if (query && query.trim()) {
      salonWhere[Op.or] = [
        { name: { [Op.iLike]: `%${query.trim()}%` } },
        { description: { [Op.iLike]: `%${query.trim()}%` } }
      ];
    }

    if (businessType) {
      const businessTypeMap = {
        'spa': '1',
        'salon': '2',
        'freelancer': '3',
        '1': '1',
        '2': '2',
        '3': '3'
      };
      const mapped = businessTypeMap[businessType.toLowerCase()];
      if (mapped) salonWhere.businessType = mapped;
    }

    if (city || district) {
      const addressConditions = [];
      if (city) addressConditions.push({ [Op.iLike]: `%${city}%` });
      if (district) addressConditions.push({ [Op.iLike]: `%${district}%` });

      salonWhere.address = addressConditions.length > 1
        ? { [Op.and]: addressConditions }
        : addressConditions[0];
    }

    if (serviceCategory) {
      salonWhere[Op.and] = salonWhere[Op.and] || [];
      salonWhere[Op.and].push(
        literal(`"SalonProfile"."tag" @> ARRAY['${serviceCategory}']::text[]`)
      );
    }

    const priceConditions = [];
    if (minPrice && !isNaN(minPrice)) {
      priceConditions.push(
        literal(`CAST(REGEXP_REPLACE(SPLIT_PART("SalonProfile"."priceRange", '-', 1), '[^0-9]', '') AS INTEGER) >= ${parseInt(minPrice)}`)
      );
    }
    if (maxPrice && !isNaN(maxPrice)) {
      priceConditions.push(
        literal(`CAST(REGEXP_REPLACE(SPLIT_PART("SalonProfile"."priceRange", '-', 2), '[^0-9]', '') AS INTEGER) <= ${parseInt(maxPrice)}`)
      );
    }
    if (priceConditions.length > 0) {
      salonWhere[Op.and] = salonWhere[Op.and] || [];
      salonWhere[Op.and].push(...priceConditions);
    }

    const salonModelWhere = {};
    if (minRating && !isNaN(minRating)) {
      salonModelWhere.rating = { [Op.gte]: parseFloat(minRating) };
    }

    const includeArray = [
      {
        model: Salon,
        as: 'Salon',
        where: Object.keys(salonModelWhere).length > 0 ? salonModelWhere : undefined,
        required: true,
        attributes: ['id', 'email', 'rating', 'reviewCount', 'licenseStatus', 'isVerified']
      }
    ];

    if (hasPromotion === 'true') {
      salonWhere[Op.and] = salonWhere[Op.and] || [];
      salonWhere[Op.and].push(
        literal(`EXISTS (
          SELECT 1 FROM "salon_vouchers" AS "SalonVouchers" 
          WHERE "SalonVouchers"."salonId" = "SalonProfile"."salonId" 
          AND "SalonVouchers"."startDate" <= NOW() 
          AND "SalonVouchers"."endDate" >= NOW()
        )`)
      );

      includeArray[0].include = [
        {
          model: Voucher,
          as: 'SalonVouchers',
          where: {
            startDate: { [Op.lte]: new Date() },
            endDate: { [Op.gte]: new Date() }
          },
          required: false
        }
      ];
    }

    let orderBy;
    switch (sortBy) {
      case 'reviews':
        orderBy = [[{ model: Salon, as: 'Salon' }, 'reviewCount', 'DESC']];
        break;
      case 'price_low':
        orderBy = [[
          literal(`CAST(REGEXP_REPLACE(SPLIT_PART("SalonProfile"."priceRange", '-', 1), '[^0-9]', '') AS INTEGER)`),
          'ASC'
        ]];
        break;
      case 'price_high':
        orderBy = [[
          literal(`CAST(REGEXP_REPLACE(SPLIT_PART("SalonProfile"."priceRange", '-', 2), '[^0-9]', '') AS INTEGER)`),
          'DESC'
        ]];
        break;
      case 'distance':
        orderBy = [['createdAt', 'DESC']];
        break;
      case 'rating':
      default:
        orderBy = [[
          literal(`(
            CASE 
              WHEN "Salon"."reviewCount" > 0 AND "Salon"."rating" IS NOT NULL THEN
                "Salon"."rating" * LOG("Salon"."reviewCount" + 1)
              ELSE 0
            END
          )`),
          'DESC'
        ]];
        break;
    }

    const { count, rows: businesses } = await SalonProfile.findAndCountAll({
      where: salonWhere,
      include: includeArray,
      attributes: [
        'id', 'salonId', 'name', 'address', 'phone', 'description',
        'businessType', 'portfolio', 'priceRange', 'openTime', 'totalStaff',
        'tag', 'createdAt'
      ],
      order: orderBy,
      limit: parsedLimit,
      offset,
      distinct: true,
      subQuery: false
    });

    const formattedBusinesses = businesses.map(b => {
      const hasPromo = b.Salon?.SalonVouchers?.length > 0;
      return {
        id: b.id,
        salonId: b.salonId,
        name: b.name,
        address: b.address,
        phone: b.phone,
        description: b.description,
        businessType: b.businessType,
        portfolio: b.portfolio,
        priceRange: b.priceRange,
        openTime: b.openTime,
        totalStaff: b.totalStaff,
        tags: b.tag || [],
        rating: b.Salon?.rating || 0,
        reviewCount: b.Salon?.reviewCount || 0,
        isVerified: b.Salon?.isVerified || false,
        hasPromotion: hasPromo,
        licenseStatus: b.Salon?.licenseStatus,
        createdAt: b.createdAt
      };
    });

    console.log(`✅ Found ${count} businesses, returning ${formattedBusinesses.length}`);

    res.status(200).json({
      success: true,
      data: {
        businesses: formattedBusinesses,
        totalCount: count,
        currentPage: parsedPage,
        totalPages: Math.ceil(count / parsedLimit),
        hasNextPage: parsedPage * parsedLimit < count,
        hasPrevPage: parsedPage > 1
      },
      message: 'Search completed successfully'
    });

  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
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
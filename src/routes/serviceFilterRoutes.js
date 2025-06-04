const express = require('express');
const { Op } = require('sequelize');
const Service = require('../models/Service');
const Salon = require('../models/Salon');
const SalonProfile = require('../models/SalonProfile');

const router = express.Router();

/*
  - category: loại dịch vụ (so sánh với giá trị được lưu trong mảng category của Service)
  - minPrice, maxPrice: khoảng giá của dịch vụ (sử dụng các toán tử >= và <=)
  - location: từ khóa tìm kiếm trong trường address của SalonProfile
*/
router.post('/filter', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, location } = req.body;
    
    // Điều kiện lọc cho Service
    const serviceWhere = {};
    if (category) {
      serviceWhere.category = { [Op.contains]: [category] };
    }
    if (minPrice || maxPrice) {
      serviceWhere.price = {};
      if (minPrice) serviceWhere.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) serviceWhere.price[Op.lte] = parseFloat(maxPrice);
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

module.exports = router;

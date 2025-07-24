const express = require('express');
const jwt = require('jsonwebtoken');
const Advertisement = require('../models/Advertisement');

const router = express.Router();

// Middleware xác thực salon
const authSalon = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'salon') {
      return res.status(403).json({ message: 'Access denied' });
    }
    req.salonId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Mua gói quảng cáo
router.post('/', authSalon, async (req, res) => {
  const { packageType, price, duration, startTime, endTime } = req.body;
  try {
    // Xác định có hiển thị nổi bật hay không dựa trên loại gói
    const isHighlighted = packageType === 'highlight';
    const ad = await Advertisement.create({
      salonId: req.salonId,
      packageType,
      price,
      duration,
      startTime,
      endTime,
      status: 'pending', // Hoặc 'confirmed' nếu muốn tự động xác nhận
      isHighlighted,
    });
    res.status(201).json({ message: 'Advertisement package purchased', ad });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Lấy danh sách quảng cáo của agency (có thể filter theo salon nếu muốn)
router.get('/', async (req, res) => {
  try {
    const ads = await Advertisement.findAll({ where: { salonId: req.salonId } });
    res.status(200).json({ ads });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cập nhật quảng cáo nếu cần (ví dụ gia hạn, cập nhật gói)
// Cập nhật trạng thái quảng cáo
router.put('/:adId', authSalon, async (req, res) => {
  const { adId } = req.params;
//   const { packageType, price, duration } = req.body;
  const { status } = req.body; // Chỉ cập nhật trạng thái nếu cần
  try {
    const ad = await Advertisement.findOne({ where: { id: adId, salonId: req.salonId } });
    if (!ad) return res.status(404).json({ message: 'Advertisement not found' });
    
    await ad.update({ status }); 

//     const isHighlighted = packageType === 'highlight';
//     await ad.update({ packageType, price, duration, isHighlighted });
    res.status(200).json({ message: 'Advertisement updated', ad });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Xóa quảng cáo (hủy quảng cáo)
router.delete('/:adId', authSalon, async (req, res) => {
  const { adId } = req.params;
  try {
    const ad = await Advertisement.findOne({ where: { id: adId, salonId: req.salonId } });
    if (!ad) return res.status(404).json({ message: 'Advertisement not found' });
    await ad.destroy();
    res.status(200).json({ message: 'Advertisement cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
const express = require('express');
const jwt = require('jsonwebtoken');
const SalonVoucher = require('../models/SalonVoucher');

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

// Tạo ưu đãi mới
router.post('/', authSalon, async (req, res) => {
  const { title, discountPercentage, comboDetails, startDate, endDate } = req.body;
  try {
    const salonVoucher = await SalonVoucher.create({
      salonId: req.salonId,
      title,
      discountPercentage,
      comboDetails,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
    res.status(201).json({ message: 'SalonVoucher created', salonVoucher });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Lấy danh sách ưu đãi của salon
router.get('/', authSalon, async (req, res) => {
  try {
    const salonVouchers = await SalonVoucher.findAll({ where: { salonId: req.salonId } });
    res.status(200).json({ salonVouchers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
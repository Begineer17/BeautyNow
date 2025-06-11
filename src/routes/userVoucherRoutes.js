const express = require('express');
const jwt = require('jsonwebtoken');
const UserVoucher = require('../models/UserVoucher');
const User = require('../models/User');

const router = express.Router();

// Middleware xác thực cho user (role: user)
const authUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'user') {
      return res.status(403).json({ message: 'Access denied' });
    }
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware xác thực admin (dùng header admin-key)
const adminAuth = (req, res, next) => {
  if (req.headers['admin-key'] !== 'admin-secret') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// GET /user-vouchers : Lấy danh sách voucher của người dùng đang đăng nhập
router.get('/', authUser, async (req, res) => {
  try {
    const vouchers = await UserVoucher.findAll({ where: { userId: req.userId } });
    res.status(200).json({ vouchers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /user-vouchers : Admin tạo voucher mới và gán cho 1 user cụ thể
router.post('/', adminAuth, async (req, res) => {
  const { userId, title, discountPercentage, comboDetails, startDate, endDate } = req.body;
  if (!userId || !title || !startDate || !endDate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    // Bạn có thể kiểm tra sự tồn tại của user nếu cần
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const voucher = await UserVoucher.create({
      userId,
      title,
      discountPercentage: discountPercentage || null,
      comboDetails: comboDetails || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
    res.status(201).json({ message: 'Voucher created', voucher });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /user-vouchers/:voucherId : Cho phép admin xoá voucher (có thể mở rộng cho người dùng nếu cần)
router.delete('/:voucherId', adminAuth, async (req, res) => {
  const { voucherId } = req.params;
  try {
    const voucher = await UserVoucher.findByPk(voucherId);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    await voucher.destroy();
    res.status(200).json({ message: 'Voucher deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
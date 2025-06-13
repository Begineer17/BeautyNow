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


// GET /user-vouchers : Lấy danh sách voucher của người dùng đang đăng nhập
router.get('/', authUser, async (req, res) => {
  try {
    const vouchers = await UserVoucher.findAll({ where: { userId: req.userId } });
    res.status(200).json({ vouchers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const jwt = require('jsonwebtoken');
const Review = require('../models/Review'); // Sẽ tạo model Review ở bước 3
const multer = require('multer');
const path = require('path');
const { uploadFile } = require('../config/cloudinary'); // Sử dụng Cloudinary để upload ảnh

const router = express.Router();

// Middleware xác thực người dùng
const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'No token provided' });
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

// Cấu hình Multer upload cho ảnh đánh giá
const storage = multer.diskStorage({
  destination: './uploads/reviews/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb('Error: Only images allowed!');
    }
  },
});

// Tạo đánh giá mới (cho salon)
router.post('/salon', auth, upload.array('images', 5), async (req, res) => {
  const { rating, comment, salonId } = req.body;
  if (!salonId) {
    return res.status(400).json({ message: 'salonId is required' });
  }
  try {
    let images = [];
    if (req.files) {
      for (const file of req.files) {
        const imageUrl = await uploadFile(file.path, 'review_images');
        images.push(imageUrl);
      }
    }
    const review = await Review.create({
      userId: req.userId,
      salonId: salonId,
      rating,
      comment,
      images,
    });
    res.status(201).json({ message: 'Review created', review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Xem tất cả đánh giá của 1 salon
router.get('/salon/:salonId', auth, async (req, res) => {
  try {
    const reviews = await Review.findAll({ where: { salonId: req.params.salonId } });
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Tạo đánh giá mới (cho service)
router.post('/service', auth, upload.array('images', 5), async (req, res) => {
  const { rating, comment, serviceId } = req.body;
  if (!serviceId) {
    return res.status(400).json({ message: 'serviceId is required' });
  }
  try {
    let images = [];
    if (req.files) {
      for (const file of req.files) {
        const imageUrl = await uploadFile(file.path, 'review_images');
        images.push(imageUrl);
      }
    }
    const review = await Review.create({
      userId: req.userId,
      serviceId: serviceId,
      rating,
      comment,
      images,
    });
    res.status(201).json({ message: 'Review created', review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Xem tất cả đánh giá của 1 service
router.get('/service/:serviceID', auth, async (req, res) => {
  try {
    const reviews = await Review.findAll({ where: { serviceId: req.params.serviceId } });
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Phản hồi đánh giá (cho admin hoặc salon)
router.post('/:reviewId/reply', auth, async (req, res) => {
  if (req.role !== 'admin' && req.role !== 'salon') {
    return res.status(403).json({ message: 'Access denied' });
  }
  const { reply } = req.body;
  try {
    const review = await Review.findByPk(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    await review.update({ reply });
    res.status(200).json({ message: 'Reply added', review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Báo cáo đánh giá: đánh dấu đánh giá đã bị báo cáo
router.post('/:reviewId/report', auth, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    await review.update({ reported: true });
    res.status(200).json({ message: 'Review reported', review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

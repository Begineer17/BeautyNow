const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

const router = express.Router();

// Cấu hình Multer
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Only images and PDFs allowed!');
    }
  },
});

// Đăng ký với upload giấy phép
router.post('/register', upload.single('businessLicense'), async (req, res) => {
  const { email, password, role } = req.body;
  const businessLicense = req.file ? req.file.path : null;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already exists' });

    if (role === 'salon' && !businessLicense) {
      return res.status(400).json({ message: 'Business license required for salon' });
    }

    user = new User({
      email,
      password: await bcrypt.hash(password, 10),
      role,
      businessLicense,
      isVerified: false,
    });

    await user.save();

    // Gửi OTP qua email
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: 'BeautyNow OTP Verification',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    res.status(201).json({ message: 'User registered. OTP sent to email.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Các route verify-otp và login giữ nguyên như trên
module.exports = router;

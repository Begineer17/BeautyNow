const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

const router = express.Router();

// Cấu hình Multer (giữ nguyên như trước)
const storage = multer.diskStorage({
  destination: './uploads/licenses/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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

// Đăng ký (giữ nguyên như trước)
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
      businessLicense: role === 'salon' ? businessLicense : null,
      licenseStatus: role === 'salon' ? 'pending' : 'verified',
    });

    await user.save();

    res.status(201).json({ message: role === 'salon' ? 'Registration successful. Awaiting license verification.' : 'Registration successful. OTP sent to email.' });

    if (role === 'consumer') {
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
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Xác minh OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.role === 'salon' && user.licenseStatus !== 'verified') {
      return res.status(400).json({ message: 'Business license not verified' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({ token, message: 'OTP verified. User logged in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Đăng nhập (giữ nguyên)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) return res.status(400).json({ message: 'Account not verified' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
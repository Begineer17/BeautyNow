const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Salon = require('../models/Salon');
const UserProfile = require('../models/UserProfile')
const SalonProfile = require('../models/SalonProfile')

const router = express.Router();

// Cấu hình Multer
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

// Đăng ký
router.post('/register', upload.single('businessLicense'), async (req, res) => {
  const { email, password, role } = req.body;
  const businessLicense = req.file ? req.file.path : null;

  try {
    if (role === 'salon') {
      if (!businessLicense) {
        return res.status(400).json({ message: 'Business license required for salon' });
      }
      const existingSalon = await Salon.findOne({ where: { email } });
      if (existingSalon) return res.status(400).json({ message: 'Email already exists' });

      await Salon.create({
        email,
        password: await bcrypt.hash(password, 10),
        businessLicense,
        licenseStatus: 'pending',
      });

      res.status(201).json({ message: 'Salon registered. Awaiting license verification.' });
    } else if (role === 'user') {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) return res.status(400).json({ message: 'Email already exists' });

      const user = await User.create({
        email,
        password: await bcrypt.hash(password, 10),
        otp: Math.floor(100000 + Math.random() * 900000).toString(),
        otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      });

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
        text: `Your OTP is ${user.otp}. It expires in 10 minutes.`,
      });

      res.status(201).json({ message: 'User registered. OTP sent to email.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Xác minh OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp, role } = req.body;
  // console.log('Received OTP verification request:', { email, otp, role });

  try {
    let account;
    if (role === 'salon') {
      account = await Salon.findOne({ where: { email } });
      if (!account) return res.status(400).json({ message: 'Salon not found' });
      if (account.licenseStatus !== 'verified') {
        return res.status(400).json({ message: 'Business license not verified' });
      }
    } else {
      account = await User.findOne({ where: { email } });
      if (!account) return res.status(400).json({ message: 'User not found' });
    }

    if (account.otp !== otp || account.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    account.isVerified = true;
    account.otp = null;
    account.otpExpires = null;
    await account.save();

    const token = jwt.sign({ id: account.id, role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Chỉ secure trong production
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 ngày
    });
    res.status(200).json({ message: 'OTP verified. Account logged in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  let n, i;
  try {
    let account;
    if (role === 'salon') {
      account = await Salon.findOne({ where: { email: email } });
      if (!account) return res.status(400).json({ message: 'Account not exists.' });
      if (account.licenseStatus !== 'verified') {
        return res.status(400).json({ message: 'Business license not verified' });
      }
    } else {
      account = await User.findOne({ where: { email } });
      if (!account) return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!account.isVerified) return res.status(400).json({ message: 'Account not verified' });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials. 123' });

    const token = jwt.sign({ id: account.id, role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // Set token vào cookie httpOnly
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Chỉ secure trong production
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 ngày
    });
    if (role === 'user') {
      const userProfile = await UserProfile.findOne({ where: { userId: account.id } });
      n = userProfile.fullName;
      i = userProfile.faceImage;
    }
    else {
      const salonProfile = await SalonProfile.findOne({where:{salonId: account.id}});
      n = salonProfile.name;
      i = salonProfile.portfolio;
    }
    res.status(200).json({ message: 'Login successful', name: n, image: i });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Đăng xuất
router.post('/logout', (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Chỉ secure trong production
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    });
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
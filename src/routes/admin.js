const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

// Middleware kiểm tra admin (giả lập, sau này thêm JWT)
const isAdmin = (req, res, next) => {
  // Thay bằng kiểm tra JWT admin thực tế
  if (req.headers['admin-key'] !== 'admin-secret') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  next();
};

// Xác nhận giấy phép
router.post('/verify-license/:userId', isAdmin, async (req, res) => {
  const { userId } = req.params;
  const { status, note } = req.body; // status: 'verified' hoặc 'rejected'

  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'salon') {
      return res.status(400).json({ message: 'Invalid salon account' });
    }

    user.licenseStatus = status;
    user.licenseVerificationHistory.push({
      adminId: 'admin1', // Thay bằng ID admin thực tế
      status,
      note,
    });

    await user.save();

    // Gửi OTP nếu giấy phép hợp lệ
    if (status === 'verified') {
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
        to: user.email,
        subject: 'BeautyNow OTP Verification',
        text: `Your business license has been verified. Your OTP is ${otp}. It expires in 10 minutes.`,
      });

      res.status(200).json({ message: 'License verified. OTP sent to salon.' });
    } else {
      // Gửi email từ chối
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        to: user.email,
        subject: 'BeautyNow License Verification Failed',
        text: `Your business license was rejected. Reason: ${note}. Please contact support or re-upload a valid license.`,
      });

      res.status(200).json({ message: 'License rejected. Notification sent to salon.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Lấy danh sách tài khoản pending
router.get('/pending-licenses', isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'salon', licenseStatus: 'pending' }).select('email businessLicense');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
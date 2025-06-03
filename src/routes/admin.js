const express = require('express');
const nodemailer = require('nodemailer');
const Salon = require('../models/Salon');
const LicenseVerificationHistory = require('../models/LicenseVerificationHistory');

const router = express.Router();

// Middleware kiểm tra admin
const isAdmin = (req, res, next) => {
  if (req.headers['admin-key'] !== 'admin-secret') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  next();
};

// Xác nhận giấy phép
router.post('/verify-license/:salonId', isAdmin, async (req, res) => {
  const { salonId } = req.params;
  const { status, note } = req.body;

  try {
    const salon = await Salon.findByPk(salonId);
    if (!salon) return res.status(400).json({ message: 'Salon not found' });

    salon.licenseStatus = status;
    await salon.save();

    await LicenseVerificationHistory.create({
      salonId,
      adminId: 'admin1',
      status,
      note,
    });

    if (status === 'verified') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      salon.otp = otp;
      salon.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await salon.save();

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        to: salon.email,
        subject: 'BeautyNow OTP Verification',
        text: `Your business license has been verified. Your OTP is ${otp}. It expires in 10 minutes.`,
      });

      res.status(200).json({ message: 'License verified. OTP sent to salon.' });
    } else {
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        to: salon.email,
        subject: 'BeautyNow License Verification Failed',
        text: `Your business license was rejected. Reason: ${note}. Please contact support or re-upload a valid license.`,
      });

      res.status(200).json({ message: 'License rejected. Notification sent to salon.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Lấy danh sách salon pending
router.get('/pending-licenses', isAdmin, async (req, res) => {
  try {
    const salons = await Salon.findAll({
      where: { licenseStatus: 'pending' },
      attributes: ['id', 'email', 'businessLicense'],
    });
    res.status(200).json(salons);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
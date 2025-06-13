const express = require('express');
const nodemailer = require('nodemailer');
const Salon = require('../models/Salon');
const LicenseVerificationHistory = require('../models/LicenseVerificationHistory');

const { Op } = require('sequelize');
const UserVoucher = require('../models/UserVoucher');
const SalonVoucher = require('../models/SalonVoucher');
const Advertisement = require('../models/Advertisement');

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

// POST admin/user-vouchers : Admin tạo voucher mới và gán cho 1 user cụ thể
router.post('/user-vouchers', isAdmin, async (req, res) => {
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

// DELETE admin/user-vouchers/:voucherId : Cho phép admin xoá voucher (có thể mở rộng cho người dùng nếu cần)
router.delete('/user-vouchers/:voucherId', isAdmin, async (req, res) => {
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

// DELETE admin/salon-vouchers/:voucherId : Cho phép admin xoá voucher của salon
router.delete('/salon-vouchers/:voucherId', isAdmin, async (req, res) => {
  const { voucherId } = req.params;
  try {
    const voucher = await SalonVoucher.findByPk(voucherId);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    await voucher.destroy();
    res.status(200).json({ message: 'Voucher deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cập nhật trạng thái quảng cáo
router.put('/:adId', isAdmin, async (req, res) => {
  const { adId } = req.params;
//   const { packageType, price, duration } = req.body;
  const { status } = req.body; // Chỉ cập nhật trạng thái nếu cần
  try {
    const ad = await Advertisement.findOne({ where: { id: adId, salonId: req.salonId } });
    if (!ad) return res.status(404).json({ message: 'Advertisement not found' });
    
    await ad.update({ status }); 

//     // Nếu cần cập nhật loại gói, giá và thời gian, có thể thêm vào đây
//     const isHighlighted = packageType === 'highlight';
//     await ad.update({ packageType, price, duration, isHighlighted });

    res.status(200).json({ message: 'Advertisement updated', ad });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Xóa quảng cáo (hủy quảng cáo)
router.delete('/:adId', isAdmin, async (req, res) => {
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

// DELETE all expired UserVoucher, SalonVoucher, and Advertisement
router.delete('/cleanup-expired', isAdmin, async (req, res) => {
    try {
        const now = new Date();

        const userVoucherDeletedCount = await UserVoucher.destroy({
            where: {
                endDate: { [Op.lt]: now }
            }
        });

        const salonVoucherDeletedCount = await SalonVoucher.destroy({
            where: {
                endDate: { [Op.lt]: now }
            }
        });

        const advertisementDeletedCount = await Advertisement.destroy({
            where: {
                endTime: { [Op.lt]: now }
            }
        });

        res.status(200).json({
            message: 'Expired records deleted successfully',
            userVoucherDeletedCount,
            salonVoucherDeletedCount,
            advertisementDeletedCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

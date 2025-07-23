const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const SalonProfile = require('../models/SalonProfile');
const Salon = require('../models/Salon');
const Service = require('../models/Service');
const { uploadFile } = require('../config/cloudinary');

const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads/salons/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
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
const serviceUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb('Error: Only images allowed for service illustration!');
    }
  },
});

const auth = async (req, res, next) => {
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

// Các route cho Salon Profile (giữ nguyên)
router.post('/', auth, upload.array('portfolio', 5), async (req, res) => {
  const { name, address, phone, description, priceRange, openTime, totalStaff } = req.body;
  try {
    const existingProfile = await SalonProfile.findOne({ where: { salonId: req.salonId } });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    let portfolio = [];
    if (req.files) {
      for (const file of req.files) {
        const url = await uploadFile(file.path, 'salon_portfolios');
        portfolio.push({ url, type: file.mimetype.startsWith('image') ? 'image' : 'video' });
      }
    }

    const profile = await SalonProfile.create({
      salonId: req.salonId,
      name,
      address,
      phone,
      description,
      portfolio,
      priceRange,
      openTime,
      totalStaff
    });

    res.status(201).json({ message: 'Profile created', profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const profile = await SalonProfile.findOne({ where: { salonId: req.salonId } });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    const salon = await Salon.findOne({where: {id: req.salonId}});
    res.status(200).json({
      profile, 
      email: salon.email, 
      isVerified: salon.isVerified
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/', auth, upload.array('portfolio', 5), async (req, res) => {
  const { name, address, phone, description, priceRange, openTime, totalStaff } = req.body;
  try {
    const profile = await SalonProfile.findOne({ where: { salonId: req.salonId } });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    let portfolio = profile.portfolio || [];
    if (req.files) {
      portfolio = [];
      for (const file of req.files) {
        const url = await uploadFile(file.path, 'salon_portfolios');
        portfolio.push({ url, type: file.mimetype.startsWith('image') ? 'image' : 'video' });
      }
    }

    await profile.update({ name, address, phone, description, portfolio, priceRange, openTime, totalStaff });
    res.status(200).json({ message: 'Profile updated', profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/', auth, async (req, res) => {
  try {
    const profile = await SalonProfile.findOne({ where: { salonId: req.salonId } });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    await profile.destroy();
    res.status(200).json({ message: 'Profile deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Các route cho Service (cập nhật để hỗ trợ illustrationImage)
router.post('/services', auth, serviceUpload.single('illustrationImage'), async (req, res) => {
  const { name, category, description, originalPrice, currentPrice, duration, isHome } = req.body;
  try {
    let illustrationImage = null;
    if (req.file) {
      illustrationImage = await uploadFile(req.file.path, 'service_images');
    }
    // Nếu category là chuỗi JSON, parse ra mảng
    const categoryArray = typeof category === 'string' ? JSON.parse(category) : category;

    const service = await Service.create({
      salonId: req.salonId,
      name,
      category: categoryArray,
      description,
      originalPrice,
      currentPrice,
      duration,
      isHome,
      illustrationImage,
    });
    res.status(201).json({ message: 'Service created', service });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/services', auth, async (req, res) => {
  try {
    const services = await Service.findAll({ where: { salonId: req.salonId } });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/services/:serviceId', auth, serviceUpload.single('illustrationImage'), async (req, res) => {
  const { name, description, originalPrice, currentPrice, duration, isHome } = req.body;
  try {
    const service = await Service.findOne({
      where: { id: req.params.serviceId, salonId: req.salonId },
    });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    let illustrationImage = service.illustrationImage;
    if (req.file) {
      illustrationImage = await uploadFile(req.file.path, 'service_images');
    }

    await service.update({ name, description, originalPrice, currentPrice, duration, isHome, illustrationImage });
    res.status(200).json({ message: 'Service updated', service });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/services/:serviceId', auth, async (req, res) => {
  try {
    const service = await Service.findOne({
      where: { id: req.params.serviceId, salonId: req.salonId },
    });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    await service.destroy();
    res.status(200).json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

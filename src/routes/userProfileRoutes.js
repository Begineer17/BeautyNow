const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
const { uploadFile } = require('../config/cloudinary');

const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads/profiles/',
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

router.post('/', auth, upload.single('faceImage'), async (req, res) => {
  const { fullName, phone, address } = req.body;
  try {
    const existingProfile = await UserProfile.findOne({ where: { userId: req.userId } });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    let faceImage = null;
    if (req.file) {
      faceImage = await uploadFile(req.file.path, 'user_profiles');
    }

    const profile = await UserProfile.create({
      userId: req.userId,
      fullName,
      phone,
      address,
      faceImage,
    });

    res.status(201).json({ message: 'Profile created', profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ where: { userId: req.userId } });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/', auth, upload.single('faceImage'), async (req, res) => {
  const { fullName, phone, address } = req.body;
  try {
    const profile = await UserProfile.findOne({ where: { userId: req.userId } });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    let faceImage = profile.faceImage;
    if (req.file) {
      faceImage = await uploadFile(req.file.path, 'user_profiles');
    }

    await profile.update({ fullName, phone, address, faceImage });
    res.status(200).json({ message: 'Profile updated', profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/', auth, async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ where: { userId: req.userId } });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    await profile.destroy();
    res.status(200).json({ message: 'Profile deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
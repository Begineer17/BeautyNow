const express = require('express');
const jwt = require('jsonwebtoken');
const Contact = require('../models/Contact');

const router = express.Router();

// Tạo lịch hẹn
router.post('/', async (req, res) => {
  const { salonId, name, phone } = req.body;
  try {
    // Tạo lịch hẹn trong DB
    const contact = await Contact.create({
      salonId,
      customerName: name,
      customerPhone: phone,
      status: 'pending', // hoặc 'confirmed' nếu muốn tự động xác nhận
    });

    // Phát sự kiện realtime qua Socket.io
    req.io && req.io.emit('contact_created', contact);

    res.status(201).json({ message: 'Contact created', contact });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const authSalon = async (req, res, next) => {
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

// Cập nhật trạng thái liên hệ
router.put('/', authSalon, async (req, res) => {
//   const { packageType, price, duration } = req.body;
  const { contactId } = req.body; // Chỉ cập nhật trạng thái nếu cần
  try {
    const con = await Contact.findOne({ where: { id: contactId } });
    if (!con) return res.status(404).json({ message: 'Contact not found' });
    
    await con.update({ status: "confirmed" }); 

    res.status(200).json({ message: 'Contact updated', con });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', authSalon, async (req, res) => {
    try {
        const contacts = await Contact.findAll({
            where: { salonId: req.salonId }
        });

        if (!contacts || contacts.length === 0) {
            return res.status(404).json({ message: 'You have no contact.' });
        }

        res.status(200).json({
            message: 'Success',
            count: contacts.length,
            contacts: contacts
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


module.exports = router;

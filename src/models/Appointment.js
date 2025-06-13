const express = require('express');
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');

const router = express.Router();

// Middleware xác thực (cho cả khách hàng và salon)
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Tạo lịch hẹn
router.post('/', auth, async (req, res) => {
  const { salonId, serviceId, startTime, endTime } = req.body;
  try {
    // Tạo lịch hẹn trong DB
    const appointment = await Appointment.create({
      salonId,
      customerId: req.userId,
      serviceId,
      startTime,
      endTime,
      status: 'pending', // hoặc 'confirmed' nếu muốn tự động xác nhận
    });

    // Phát sự kiện realtime qua Socket.io
    req.io && req.io.emit('appointment_created', appointment);

    res.status(201).json({ message: 'Appointment created', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Hủy lịch hẹn
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Xóa sự kiện trên Nextcloud Calendar
    const calendar = (await client.fetchCalendars()).find(
      (cal) => cal.url === process.env.NEXTCLOUD_CALENDAR_URL
    );
    if (!calendar) throw new Error('Calendar not found');

    await client.deleteCalendarObject({
      calendar,
      objectUrl: `${calendar.url}${appointment.nextcloudEventId}`,
    });

    await appointment.destroy();
    req.io && req.io.emit('appointment_deleted', { id: req.params.id });

    res.status(200).json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const authSalon = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
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

// Cập nhật trạng thái lịch hẹn
router.put('/:apId', authSalon, async (req, res) => {
  const { apId } = req.params;
//   const { packageType, price, duration } = req.body;
  const { status } = req.body; // Chỉ cập nhật trạng thái nếu cần
  try {
    const ap = await Appointment.findOne({ where: { id: apId, salonId: req.salonId } });
    if (!ad) return res.status(404).json({ message: 'Advertisement not found' });
    
    await ad.update({ status }); 

    res.status(200).json({ message: 'Appointment updated', ap });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

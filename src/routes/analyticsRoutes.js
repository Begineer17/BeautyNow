const express = require('express');
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

const router = express.Router();

// Middleware xác thực salon
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

// Phân tích doanh thu và lượt đặt lịch theo khoảng thời gian
router.get('/', authSalon, async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const whereClause = { salonId: req.salonId };
    if (startDate && endDate) {
      whereClause.startTime = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    // Thực hiện join với bảng Service để lấy giá nếu giá không có trong Appointment
    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [{
        model: Service,
        attributes: ['price']
      }]
    });
    const totalAppointments = appointments.length;
    let totalRevenue = 0;
    appointments.forEach(appt => {
      // Nếu Service hợp lệ, lấy giá; nếu không có thì mặc định 0
      totalRevenue += appt.Service ? parseFloat(appt.Service.price) : 0;
    });
    res.status(200).json({ totalAppointments, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
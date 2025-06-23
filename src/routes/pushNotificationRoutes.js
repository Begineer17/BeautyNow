const express = require('express');
const router = express.Router();
const webPush = require('../config/webPush');

/*
  POST /push-notification/send
  Body: {
    subscription: object, // Thông tin đăng ký từ client (endpoint, keys,...)
    title: string,
    body: string,
    data?: object (tùy chọn)
  }
*/
router.post('/send', async (req, res) => {
    const { subscription, title, body, data } = req.body;
    const payload = JSON.stringify({
        title,
        body,
        data: data || {}
    });

    try {
        await webPush.sendNotification(subscription, payload);
        res.status(200).json({ message: 'Notification sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Notification failed', error: error.message });
    }
});

module.exports = router;
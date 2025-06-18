const express = require('express');
const Review = require('../models/Review');
const Service = require('../models/Service');
const Salon = require('../models/Salon');

const router = express.Router();

/*
  POST /update-ratings/service/:serviceId
  - Tính toán rating trung bình và reviewCount cho Service bằng các Rating của Review có trường serviceId trùng khớp.
  - Sau đó, với salonId của Service, tính tổng số lượt Review (reviewCount) của tất cả Service của salon và cập nhật rating của Salon tính theo trung bình cộng theo số Review.
*/
router.post('/service/:serviceId', async (req, res) => {
    try {
        const { serviceId } = req.params;

        // Lấy tất cả review có serviceId nhất định (giả sử Review đã có trường serviceId)
        const reviews = await Review.findAll({ where: { serviceId } });

        // Tính trung bình rating và tổng số review cho Service
        const reviewCount = reviews.length;
        const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = reviewCount > 0 ? totalRatings / reviewCount : 0;

        // Tìm Service cần cập nhật
        const service = await Service.findByPk(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Cập nhật rating và reviewCount cho Service
        await service.update({ rating: avgRating, reviewCount });

        // Lấy tất cả các Service của Salon để tính tổng lượt review và trung bình rating chung
        const services = await Service.findAll({ where: { salonId: service.salonId } });
        let salonTotalReviews = 0;
        let salonRatingSum = 0;
        services.forEach(svc => {
            const svcReviews = svc.reviewCount || 0;
            salonTotalReviews += svcReviews;
            salonRatingSum += (svc.rating || 0) * svcReviews;
        });
        const salonAvgRating = salonTotalReviews > 0 ? salonRatingSum / salonTotalReviews : 0;

        // Cập nhật rating và reviewCount cho Salon
        const salon = await Salon.findByPk(service.salonId);
        if (salon) {
            await salon.update({ rating: salonAvgRating, reviewCount: salonTotalReviews });
        }
 
        res.status(200).json({
            message: 'Ratings updated successfully',
            service: { id: serviceId, rating: avgRating, reviewCount },
            salon: salon ? { id: salon.id, rating: salonAvgRating, reviewCount: salonTotalReviews } : null
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
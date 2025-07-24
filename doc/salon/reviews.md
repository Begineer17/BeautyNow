# Salon Reviews API

## Get Reviews for Salon
- **Endpoint:** `GET /reviews/salon/:salonId`
- **Description:** Retrieve all reviews for the salon.
- **Parameters:**
  - `salonId`: String (UUID, required)
- **Response:** `{ reviews: [ ... ] }`

## Reply to Review
- **Endpoint:** `POST /reviews/:reviewId/reply`
- **Description:** Add a reply to a review (salon only).
- **Headers:** `Authorization: Bearer token` (role: salon)
- **Body (JSON):**
  - `reply`: String (required)
- **Response:** `{ message: "Reply added", review: { ... } }`

## Report Review
- **Endpoint:** `POST /reviews/:reviewId/report`
- **Description:** Report a review as inappropriate.
- **Headers:** `Authorization: Bearer token`
- **Response:** `{ message: "Review reported", review: { ... } }`

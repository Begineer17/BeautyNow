# User Reviews API

## Create Review
- **Endpoint:** `POST /reviews`
- **Description:** Submit a review for a salon or service.
- **Body (form-data):**
  - `rating`: Number (required)
  - `comment`: String (optional)
  - `salonId`: String (UUID, required if reviewing a salon)
  - `serviceID`: String (UUID, required if reviewing a service)
  - `images`: File(s) (optional, up to 5; jpeg/jpg/png)
- **Response:**
  - Success: `{ message: "Review created", review: { ... } }`
  - Error: `{ message: "salonId is required" }` or `{ message: "Server error", error: "Error details" }`

## Get All Reviews
- **Endpoint:** `GET /reviews`
- **Description:** Retrieve all reviews.
- **Response:** `{ reviews: [ ... ] }`

## Get Reviews for Salon
- **Endpoint:** `GET /reviews/salon/:salonId`
- **Description:** Get reviews for a specific salon.
- **Parameters:**
  - `salonId`: String (UUID, required)
- **Response:** `{ reviews: [ ... ] }`

## Reply to Review
- **Endpoint:** `POST /reviews/:reviewId/reply`
- **Description:** Add a reply to a review (admin/salon only).
- **Headers:** `Authorization: Bearer token` (role: admin/salon)
- **Body (JSON):**
  - `reply`: String (required)
- **Response:** `{ message: "Reply added", review: { ... } }`

## Report Review
- **Endpoint:** `POST /reviews/:reviewId/report`
- **Description:** Report a review as inappropriate.
- **Headers:** `Authorization: Bearer token`
- **Response:** `{ message: "Review reported", review: { ... } }`

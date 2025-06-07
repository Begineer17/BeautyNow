# BeautyNow API Documentation (Only allowed image files)

## Authentication Endpoints
 ### POST /auth/register
 - **Description**: Register a new user or salon.
 - **Body (form-data)**:
   - `email`: String (required)
   - `password`: String (required)
   - `role`: String (consumer/salon, required)
   - `businessLicense`: File (required for salon)
 - **Response**: `{ message: "Registration successful. Awaiting license verification." }` (salon) or `{ message: "Registration successful. OTP sent to email." }` (consumer)

 ### POST /auth/verify-otp
 - **Description**: Verify OTP to activate account.
 - **Body (JSON)**:
   - `email`: String
   - `otp`: String
   - `role`: String
 - **Response**: `{ token: "JWT_TOKEN", message: "OTP verified. User logged in." }`

 ### POST /auth/login
 - **Description**: Login user or salon.
 - **Body (JSON)**:
   - `email`: String
   - `password`: String
 - **Response**: `{ token: "JWT_TOKEN" }`

 ## Admin Endpoints

 ### GET /admin/pending-licenses
 - **Description**: Get list of salons with pending licenses.
 - **Headers**: `admin-key: admin-secret`
 - **Response**: Array of `{ email, businessLicense }`

 ### POST /admin/verify-license/:userId
 - **Description**: Verify or reject a salon's business license.
 - **Headers**: `admin-key: admin-secret`
 - **Body (JSON)**:
   - `status`: String (verified/rejected)
   - `note`: String
 - **Response**: `{ message: "License verified. OTP sent to salon." }` or `{ message: "License rejected. Notification sent to salon." }`

### Chạy CLI: node admin-cli.js -> Admin chọn tài khoản từ danh sách, nhập trạng thái (verified hoặc rejected) và ghi chú, sau đó API tự động gửi OTP hoặc thông báo từ chối.

## User Profile Endpoints

### POST /user-profile
- **Description**: Create a user profile.
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Body (form-data)**:
  - `fullName`: String (required)
  - `phone`: String
  - `address`: String
  - `faceImage`: File (jpeg/jpg/png)
- **Response**: `{ message: "Profile created", profile: {...} }`

### GET /user-profile
- **Description**: Get user profile.
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Response**: `{ id, userId, fullName, phone, address, faceImage, createdAt }`

### PUT /user-profile
- **Description**: Update user profile.
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Body (form-data)**:
  - `fullName`: String
  - `phone`: String
  - `address`: String
  - `faceImage`: File (jpeg/jpg/png)
- **Response**: `{ message: "Profile updated", profile: {...} }`

### DELETE /user-profile
- **Description**: Delete user profile.
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Response**: `{ message: "Profile deleted" }`

## Salon Profile Endpoints

### POST /salon-profile
- **Description**: Create a salon profile.
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Body (form-data)**:
  - `name`: String (required)
  - `address`: String (required)
  - `phone`: String (required)
  - `description`: String
  - `portfolio`: Files (jpeg/jpg/png/mp4, max 5)
- **Response**: `{ message: "Profile created", profile: {...} }`

### GET /salon-profile
- **Description**: Get salon profile.
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Response**: `{ id, salonId, name, address, phone, description, portfolio, createdAt }`

### PUT /salon-profile
- **Description**: Update salon profile.
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Body (form-data)**:
  - `name`: String
  - `address`: String
  - `phone`: String
  - `description`: String
  - `portfolio`: Files (jpeg/jpg/png/mp4, max 5)
- **Response**: `{ message: "Profile updated", profile: {...} }`

### DELETE /salon-profile
- **Description**: Delete salon profile.
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Response**: `{ message: "Profile deleted" }`

### POST /salon-profile/services
- **Description**: Create a service.
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Body (form-data)**:
  - `name`: String (required)
  - `category`: String Array (required, e.g: ["Cat1", "Cat2"])
  - `description`: String
  - `price`: Number (required)
  - `duration`: Number (required, minutes)
  - `illustrationImage`: File (jpeg/jpg/png)
- **Response**: `{ message: "Service created", service: {...} }`

### GET /salon-profile/services
- **Description**: Get all services of a salon.
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Response**: Array of `{ id, salonId, name, description, price, duration, illustrationImage, createdAt }`

### PUT /salon-profile/services/:serviceId
- **Description**: Update a service.
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Body (form-data)**:
  - `name`: String
  - `description`: String
  - `price`: Number
  - `duration`: Number (minutes)
  - `illustrationImage`: File (jpeg/jpg/png)
- **Response**: `{ message: "Service updated", service: {...} }`

### DELETE /salon-profile/services/:serviceId
- **Description**: Delete a service.
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Response**: `{ message: "Service deleted" }`

## Filters Endpoints

### POST /services/filter
- **Description**: Filters services based on provided criteria including service category, price range, and salon location provided by all salons.
- **Body (form-data)**:
  - `category`: Array String (null for none)
  - `minPrice`: Number (null for none)
  - `maxPrice`: Number (null for none)
  - `location`: String (null for none)
- **Response**: `{ services:[...] }`

## Appointment Endpoints

### POST /appointments
- **Description**: Create a new appointment.
- **Authentication**: Required (JWT in header)
  - **Header**: `Authorization: Bearer <token>`
- **Body (JSON)**:
  - `salonId`: String or Number (required)
  - `serviceId`: String or Number (required)
  - `startTime`: ISO datetime string (required)
  - `endTime`: ISO datetime string (required)
- **Response**:
  - **201 Created**:  
    ```json
    { "message": "Appointment created", "appointment": { ... } }
    ```
  - **401 Unauthorized**:  
    ```json
    { "message": "Invalid token" }
    ```
  - **500 Internal Server Error**:  
    ```json
    { "message": "Server error", "error": "<error message>" }
    ```
- **Realtime Integration**:
  - Emits `appointment_created` event with the appointment data.

### DELETE /appointments/:id
- **Description**: Cancel an existing appointment.
- **Authentication**: Required (JWT in header)
  - **Header**: `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: Appointment ID (required)
- **Operation Details**:
  - Cancels the appointment in the database.
  - Attempts to remove the corresponding event from the Nextcloud Calendar.
  - Emits `appointment_deleted` event with the appointment ID.
- **Response**:
  - **200 OK**:  
    ```json
    { "message": "Appointment cancelled" }
    ```
  - **404 Not Found**:  
    ```json
    { "message": "Appointment not found" }
    ```
  - **500 Internal Server Error**:  
    ```json
    { "message": "Server error", "error": "<error message>" }
    ```

## Review Endpoints

### POST /reviews
- **Description**: Create a new review for a salon.
- **Headers**:
  - `Authorization`: Bearer token (required)
- **Body (form-data)**:
  - `rating`: Number (required)
  - `comment`: String (optional)
  - `salonId`: String (UUID, required)
  - `images`: File(s) (optional, up to 5 files; allowed types: jpeg, jpg, png)
- **Response**:
  - **201**:  
    ```json
    { "message": "Review created", "review": { ... } }
    ```
  - **400**:  
    ```json
    { "message": "salonId is required" }
    ```
  - **500**:  
    ```json
    { "message": "Server error", "error": "Error details" }
    ```

### GET /reviews/salon/:salonId
- **Description**: Retrieve all reviews for a specific salon.
- **Headers**:
  - `Authorization`: Bearer token (required)
- **URL Parameters**:
  - `salonId`: String (UUID of the salon, required)
- **Response**:
  - **200**:  
    ```json
    { "reviews": [ { ...review object... }, { ... } ] }
    ```
  - **500**:  
    ```json
    { "message": "Server error", "error": "Error details" }
    ```

### POST /reviews/:reviewId/reply
- **Description**: Add a reply to a review. Accessible by admin or salon users.
- **Headers**:
  - `Authorization`: Bearer token (required; token must have role `admin` or `salon`)
- **URL Parameters**:
  - `reviewId`: String (UUID of the review, required)
- **Body (raw JSON)**:
  - `reply`: String (required)
- **Response**:
  - **200**:  
    ```json
    { "message": "Reply added", "review": { ...updated review object... } }
    ```
  - **403**:  
    ```json
    { "message": "Access denied" }
    ```
  - **404**:  
    ```json
    { "message": "Review not found" }
    ```
  - **500**:  
    ```json
    { "message": "Server error", "error": "Error details" }
    ```

### POST /reviews/:reviewId/report
- **Description**: Report a review (marks the review as reported).
- **Headers**:
  - `Authorization`: Bearer token (required)
- **URL Parameters**:
  - `reviewId`: String (UUID of the review, required)
- **Response**:
  - **200**:  
    ```json
    { "message": "Review reported", "review": { ...updated review object... } }
    ```
  - **404**:  
    ```json
    { "message": "Review not found" }
    ```
  - **500**:  
    ```json
    { "message": "Server error", "error": "Error details" }
    ```

--- 


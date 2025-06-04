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

## Filters

### POST /services/filter
- **Description**: Filters services based on provided criteria including service category, price range, and salon location provided by all salons.
- **Body (form-data)**:
  - `category`: Array String (null for none)
  - `minPrice`: Number (null for none)
  - `maxPrice`: Number (null for none)
  - `location`: String (null for none)
- **Response**: `{ services:[...] }`

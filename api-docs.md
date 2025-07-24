# BeautyNow API Documentation

**Note:** This API uses cookie-based authentication. JWT tokens are stored in HTTP-only cookies and automatically sent with requests.

## Authentication Endpoints
 ### POST /auth/register
 - **Description**: Register a new user or salon.
 - **Body (form-data)**:
   - `email`: String (required)
   - `password`: String (required)
   - `role`: String (user/salon, required)
   - `businessLicense`: File (required for salon)
 - **Response**: `{ message: "Registration successful. Awaiting license verification." }` (salon) or `{ message: "Registration successful. OTP sent to email." }` (user)

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
 - **Response**: `{ token: "JWT_TOKEN" }` (token also set as HTTP-only cookie)

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

- **Body (form-data)**:
  - `fullName`: String (required)
  - `phone`: String
  - `address`: String
  - `faceImage`: File (jpeg/jpg/png)
- **Response**: `{ message: "Profile created", profile: {...} }`

### GET /user-profile
- **Description**: Get user profile.

- **Response**: `{ id, userId, fullName, phone, address, faceImage, createdAt }`

### PUT /user-profile
- **Description**: Update user profile.

- **Body (form-data)**:
  - `fullName`: String
  - `phone`: String
  - `address`: String
  - `faceImage`: File (jpeg/jpg/png)
- **Response**: `{ message: "Profile updated", profile: {...} }`

### DELETE /user-profile
- **Description**: Delete user profile.

- **Response**: `{ message: "Profile deleted" }`

## Salon Profile Endpoints

### POST /salon-profile
- **Description**: Create a salon profile.

- **Body (form-data)**:
  - `name`: String (required)
  - `address`: String (required)
  - `phone`: String (required)
  - `description`: String
  - `portfolio`: Files (jpeg/jpg/png, max 5)
  - `priceRange`: String
  - `openTime`: String (required)
  - `totalStaff`: Number (required)
  - `tag`: String
- **Response**: `{ message: "Profile created", profile: {...} }`

### GET /salon-profile
- **Description**: Get salon profile.

- **Response**: `{ id, salonId, name, address, phone, description, portfolio, priceRange, openTime, totalStaff, createdAt }`

### PUT /salon-profile
- **Description**: Update salon profile.

- **Body (form-data)**:
  - `name`: String
  - `address`: String
  - `phone`: String
  - `description`: String
  - `portfolio`: Files (jpeg/jpg/png, max 5)
  - `priceRange`: String
  - `openTime`: String
  - `totalStaff`: Number
- **Response**: `{ message: "Profile updated", profile: {...} }`

### DELETE /salon-profile
- **Description**: Delete salon profile.

- **Response**: `{ message: "Profile deleted" }`

### POST /salon-profile/services
- **Description**: Create a service.

- **Body (form-data)**:
  - `name`: String (required)
  - `category`: String Array (required, e.g: ["Cat1", "Cat2"])
  - `description`: String
  - `originalPrice`: Number (optional)
  - `currentPrice`: Number (required)
  - `duration`: Number (required, minutes)
  - `isHome`: Boolean (required)
  - `illustrationImage`: File (jpeg/jpg/png)
- **Response**: `{ message: "Service created", service: {...} }`

### GET /salon-profile/services
- **Description**: Get all services of a salon.

- **Response**: Array of `{ id, salonId, name, category, description, originalPrice, currentPrice, duration, isHome, illustrationImage, rating, reviewCount, createdAt }`

### PUT /salon-profile/services/:serviceId
- **Description**: Update a service.

- **Body (form-data)**:
  - `name`: String
  - `description`: String
  - `originalPrice`: Number
  - `currentPrice`: Number
  - `duration`: Number (minutes)
  - `isHome`: Boolean
  - `illustrationImage`: File (jpeg/jpg/png)
- **Response**: `{ message: "Service updated", service: {...} }`

### DELETE /salon-profile/services/:serviceId
- **Description**: Delete a service.

- **Response**: `{ message: "Service deleted" }`

## Filters Endpoints

### POST /services/filter
- **Description**: Filters services based on provided criteria including service category, price range, salon location, and home service availability.
- **Body (JSON)**:
  - `category`: String (optional, single category to filter by)
  - `minPrice`: Number (optional)
  - `maxPrice`: Number (optional)
  - `location`: String (optional, searches in salon address)
  - `isHome`: Boolean (optional, filter for home services)
- **Response**: `{ services: [...] }`

### Get Top Services
**Endpoint:** `GET /services/top`

**Mô tả:** Lấy danh sách top services dựa trên rating cao và review count nhiều

**Query Parameters:**
- `limit` (optional): Số lượng kết quả trả về (default: 10)
- `category` (optional): Lọc theo category của service

**Ví dụ request:**
```
GET /services/top?limit=5&category=hair
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Dịch vụ cắt tóc",
      "category": ["hair"],
      "description": "Mô tả dịch vụ",
      "currentPrice": "100000.00",
      "duration": 60,
      "isHome": true,
      "rating": 4.8,
      "reviewCount": 25,
      "Salon": {
        "id": "salon-uuid",
        "email": "salon@example.com",
        "licenseStatus": "verified",
        "isVerified": true,
        "SalonProfile": {
          "name": "Salon ABC",
          "address": "123 Đường ABC, TP.HCM",
          "phone": "0123456789"
        }
      }
    }
  ],
  "message": "Top services retrieved successfully"
}
```

### Get Top Salons
**Endpoint:** `GET /services/top-salons`

**Mô tả:** Lấy danh sách top salons dựa trên rating cao và review count nhiều

**Query Parameters:**
- `limit` (optional): Số lượng kết quả trả về (default: 10)
- `location` (optional): Lọc theo địa điểm (tìm kiếm trong address)

**Ví dụ request:**
```
GET /services/top-salons?limit=5&location=HCM
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Salon XYZ",
      "address": "456 Đường XYZ, TP.HCM",
      "phone": "0987654321",
      "description": "Salon chuyên nghiệp",
      "portfolio": {...},
      "priceRange": "100,000 - 500,000 VND",
      "openTime": "8:00 - 22:00",
      "totalStaff": 10,
      "Salon": {
        "rating": 4.9,
        "reviewCount": 150,
        "credit": 1200
      }
    }
  ],
  "message": "Top salons retrieved successfully"
}
```

### Search Services & Salons
**Endpoint:** `POST /services/search`

**Mô tả:** Tìm kiếm services và salons cho User

**Body Parameters:**
- `query` (required): Từ khóa tìm kiếm (tên service, tên salon, mô tả)
- `category` (optional): Filter theo category service
- `location` (optional): Filter theo địa điểm salon
- `minPrice`, `maxPrice` (optional): Khoảng giá service
- `type` (optional): 'services' | 'salons' | 'both' (default: 'both')

**Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "service-uuid",
        "name": "Dịch vụ cắt tóc nam",
        "category": ["hair"],
        "description": "Cắt tóc chuyên nghiệp",
        "currentPrice": "80000.00",
        "originalPrice": "100000.00",
        "duration": 60,
        "isHome": true,
        "rating": 4.7,
        "reviewCount": 20,
        "illustrationImage": "url_to_image",
        "Salon": {
          "id": "salon-uuid",
          "licenseStatus": "verified",
          "isVerified": true,
          "rating": 4.8,
          "reviewCount": 25,
          "credit": 1000,
          "SalonProfile": {
            "name": "Salon ABC",
            "address": "123 Đường ABC, TP.HCM",
            "phone": "0123456789"
          }
        }
      }
    ],
    "salons": [
      {
        "name": "Salon XYZ",
        "address": "456 Đường XYZ, TP.HCM",
        "phone": "0987654321",
        "description": "Salon chuyên cắt tóc nam",
        "portfolio": {...},
        "priceRange": "50,000 - 200,000 VND",
        "openTime": "8:00 - 20:00",
        "totalStaff": 5,
        "Salon": {
          "rating": 4.8,
          "reviewCount": 100,
          "credit": 1500
        }
      }
    ]
  },
  "totalResults": 2,
  "message": "Search completed successfully"
}
```

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
<!-- - **Headers**:
  - `Authorization`: Bearer token (required) -->
- **Body (form-data)**:
  - `rating`: Number (required)
  - `comment`: String (optional)
  - `salonId`: String (UUID, required if is a review for a specific salon otherwise is null)
  - `serviceID`: String (UUID, required if is a review for a specific service otherwise is null)
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

### GET /reviews
- **Description**: Retrieve all reviews.
- **Response**:
  - **200**:  
    ```json
    { "reviews": [ { ...review object... }, { ... } ] }
    ```
  - **500**:  
    ```json
    { "message": "Server error", "error": "Error details" }
    ```

### GET /reviews/salon/:salonId
- **Description**: Retrieve all reviews for a specific salon.
<!-- - **Headers**:
  - `Authorization`: Bearer token (required) -->
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

## Advertisement

### 1. Update Advertisement Status

**Endpoint:**  
```
PUT /admin/:adId
```

**Description:**  
Cập nhật trạng thái của quảng cáo.

**Headers:**  
- Authorization: Bearer JWT_TOKEN (Admin role)

**Body (JSON):**
```json
{
  "status": "String (required)"
}
```

**Response:**
```json
{
  "message": "Advertisement updated",
  "ad": { ... }
}
```

### 2. Delete (Cancel) Advertisement

**Endpoint:**  
```
DELETE /admin/:adId
```

**Description:**  
Xoá (hủy) quảng cáo.

**Headers:**  
- Authorization: Bearer JWT_TOKEN (Admin role)

**Response:**
```json
{
  "message": "Advertisement cancelled"
}
```

### 3. Purchase Advertisement Package

**Endpoint:**  
```
POST /ads
```

**Description:**  
Mua gói quảng cáo.

**Headers:**  
- Authorization: Bearer JWT_TOKEN (Salon role)

**Body (JSON):**
```json
{
  "packageType": "String (required, ví dụ: 'highlight' để hiển thị nổi bật)",
  "price": "Number (required)",
  "duration": "Number (required)",
  "startTime": "Date (required)",
  "endTime": "Date (required)"
}
```

**Response:**
```json
{
  "message": "Advertisement package purchased",
  "ad": { ... }
}
```

### 4. Get List of Advertisements

**Endpoint:**  
```
GET /ads
```

**Description:**  
Lấy danh sách quảng cáo của salon.

**Headers:**  
- Authorization: Bearer JWT_TOKEN (Salon role)

**Response:**
```json
{
  "ads": [ ... ]
}
```

## UserVoucher

### 1. Create Voucher (Admin)

**Endpoint:**  
```
POST /admin/user-vouchers
```

**Description:**  
Admin tạo voucher mới và gán cho một user cụ thể.

**Headers:**  
- Authorization: Bearer JWT_TOKEN (Admin role)

**Body (JSON):**
```json
{
  "userId": "Number (required)",
  "title": "String (required)",
  "discountPercentage": "Number (optional)",
  "comboDetails": "String (optional)",
  "startDate": "Date (required)",
  "endDate": "Date (required)"
}
```

**Response:**
```json
{
  "message": "Voucher created",
  "voucher": { ... }
}
```

---

### 2. Delete Voucher (Admin)

**Endpoint:**  
```
DELETE /admin/user-vouchers/:voucherId
```

**Description:**  
Admin xoá voucher của user.

**Headers:**  
- Authorization: Bearer JWT_TOKEN (Admin role)

**Response:**
```json
{
  "message": "Voucher deleted"
}
```

---

### 3. Get User's Vouchers

**Endpoint:**  
```
GET /user-vouchers
```

**Description:**  
Lấy danh sách voucher của người dùng đang đăng nhập.

**Headers:**  
- Authorization: Bearer JWT_TOKEN (User role)

**Response:**
```json
{
  "vouchers": [ ... ]
}
```

## SalonVoucher

### 1. Delete Salon Voucher (Admin)

**Endpoint:**  
```
DELETE /admin/salon-vouchers/:voucherId
```

**Description:**  
Admin xoá voucher của salon.

**Headers:**  
- Authorization: Bearer JWT_TOKEN (Admin role)

**Response:**
```json
{
  "message": "Voucher deleted"
}
```

### 2. Create Salon Voucher

**Endpoint:**  
```
POST /salon-vouchers
```

**Description:**  
Tạo ưu đãi (voucher) mới cho salon.

**Headers:**  
- Authorization: Bearer JWT_TOKEN (Salon role)

**Body (JSON):**
```json
{
  "title": "String (required)",
  "discountPercentage": "Number (required)",
  "comboDetails": "String (optional)",
  "startDate": "Date (required)",
  "endDate": "Date (required)"
}
```

**Response:**
```json
{
  "message": "SalonVoucher created",
  "salonVoucher": { ... }
}
```

### 3. Get List of Salon Vouchers

**Endpoint:**  
```
GET /salon-vouchers
```

**Description:**  
Lấy danh sách ưu đãi của salon.

**Headers:**  
- Authorization: Bearer JWT_TOKEN (Salon role)

**Response:**
```json
{
  "salonVouchers": [ ... ]
}
```

## Analytics

### Analyze Revenue and Appointments

**Endpoint:**  
```
GET /analytics
```

**Description:**  
Phân tích doanh thu và lượt đặt lịch theo khoảng thời gian.

**Headers:**  
- Authorization: Bearer JWT_TOKEN (Salon role)

**Query Parameters:**  
- startDate: Date (optional, ví dụ: 2025-06-01)
- endDate: Date (optional, ví dụ: 2025-06-30)

**Response:**
```json
{
  "totalAppointments": "Number",
  "totalRevenue": "Number"
}
```

--- 


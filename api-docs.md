 ## Auth Endpoints

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

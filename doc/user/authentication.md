# User Authentication API

## Register
- **Endpoint:** `POST /auth/register`
- **Description:** Register a new user account.
- **Body (form-data):**
  - `email`: String (required)
  - `password`: String (required)
  - `role`: String (must be 'user')
- **Response:**
  - Success: `{ message: "Registration successful. OTP sent to email." }`

## Verify OTP
- **Endpoint:** `POST /auth/verify-otp`
- **Description:** Verify OTP to activate user account.
- **Body (JSON):**
  - `email`: String
  - `otp`: String
  - `role`: String
- **Response:**
  - Success: `{ token: "JWT_TOKEN", message: "OTP verified. User logged in." }`

## Login
- **Endpoint:** `POST /auth/login`
- **Description:** Login user.
- **Body (JSON):**
  - `email`: String
  - `password`: String
- **Response:**
  - Success: `{ token: "JWT_TOKEN" }` (token also set as HTTP-only cookie)

---

**Note:** All authentication APIs use cookie-based JWT tokens for session management. Tokens are sent automatically with requests.

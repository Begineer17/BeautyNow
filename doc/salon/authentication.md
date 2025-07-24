# Salon Authentication API

## Register Salon
- **Endpoint:** `POST /auth/register`
- **Description:** Register a new salon account.
- **Body (form-data):**
  - `email`: String (required)
  - `password`: String (required)
  - `role`: String (must be 'salon')
  - `businessLicense`: File (required)
- **Response:** `{ message: "Registration successful. Awaiting license verification." }`

## Verify OTP
- **Endpoint:** `POST /auth/verify-otp`
- **Description:** Verify OTP to activate salon account after license approval.
- **Body (JSON):**
  - `email`: String
  - `otp`: String
  - `role`: String
- **Response:** `{ token: "JWT_TOKEN", message: "OTP verified. User logged in." }`

## Login
- **Endpoint:** `POST /auth/login`
- **Description:** Login salon.
- **Body (JSON):**
  - `email`: String
  - `password`: String
- **Response:** `{ token: "JWT_TOKEN" }` (token also set as HTTP-only cookie)

---

**Note:** Salon registration requires license verification by admin before activation.

# Admin Authentication API

## Login
- **Endpoint:** `POST /auth/login`
- **Description:** Login as admin.
- **Body (JSON):**
  - `email`: String
  - `password`: String
- **Response:** `{ token: "JWT_TOKEN" }` (token also set as HTTP-only cookie)

---

**Note:** Admin access is required for all admin APIs. Use the provided admin-key or JWT token as specified.

# Admin License Management API

## Get Pending Licenses
- **Endpoint:** `GET /admin/pending-licenses`
- **Description:** Retrieve list of salons with pending business licenses.
- **Headers:** `admin-key: admin-secret`
- **Response:** Array of `{ email, businessLicense }`

## Verify/Reject License
- **Endpoint:** `POST /admin/verify-license/:userId`
- **Description:** Verify or reject a salon's business license.
- **Headers:** `admin-key: admin-secret`
- **Body (JSON):**
  - `status`: String (verified/rejected)
  - `note`: String
- **Response:** `{ message: "License verified. OTP sent to salon." }` or `{ message: "License rejected. Notification sent to salon." }`

---

**Note:** Admin CLI available for interactive license management.

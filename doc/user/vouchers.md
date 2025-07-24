# User Vouchers API

## Get User Vouchers
- **Endpoint:** `GET /user-vouchers`
- **Description:** Retrieve all vouchers assigned to the logged-in user.
- **Headers:** `Authorization: Bearer JWT_TOKEN (User role)`
- **Response:** `{ vouchers: [ ... ] }`

---

**Note:** Vouchers are created and managed by admin. Users can only view their assigned vouchers.

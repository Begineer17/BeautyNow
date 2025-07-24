# Admin User Voucher Management API

## Create User Voucher
- **Endpoint:** `POST /admin/user-vouchers`
- **Description:** Create a new voucher and assign to a user.
- **Headers:** `Authorization: Bearer JWT_TOKEN (Admin role)`
- **Body (JSON):**
  - `userId`: Number (required)
  - `title`: String (required)
  - `discountPercentage`: Number (optional)
  - `comboDetails`: String (optional)
  - `startDate`: Date (required)
  - `endDate`: Date (required)
- **Response:** `{ message: "Voucher created", voucher: { ... } }`

## Delete User Voucher
- **Endpoint:** `DELETE /admin/user-vouchers/:voucherId`
- **Description:** Delete a user's voucher.
- **Headers:** `Authorization: Bearer JWT_TOKEN (Admin role)`
- **Response:** `{ message: "Voucher deleted" }`

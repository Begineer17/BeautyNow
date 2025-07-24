# Salon Vouchers API

## Create Salon Voucher
- **Endpoint:** `POST /salon-vouchers`
- **Description:** Create a new voucher for the salon.
- **Headers:** `Authorization: Bearer JWT_TOKEN (Salon role)`
- **Body (JSON):**
  - `title`: String (required)
  - `discountPercentage`: Number (required)
  - `comboDetails`: String (optional)
  - `startDate`: Date (required)
  - `endDate`: Date (required)
- **Response:** `{ message: "SalonVoucher created", salonVoucher: { ... } }`

## Get List of Salon Vouchers
- **Endpoint:** `GET /salon-vouchers`
- **Description:** Retrieve all vouchers for the salon.
- **Headers:** `Authorization: Bearer JWT_TOKEN (Salon role)`
- **Response:** `{ salonVouchers: [ ... ] }`

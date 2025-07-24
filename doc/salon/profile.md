# Salon Profile API

## Create Salon Profile
- **Endpoint:** `POST /salon-profile`
- **Description:** Create a salon profile.
- **Body (form-data):**
  - `name`: String (required)
  - `address`: String (required)
  - `phone`: String (required)
  - `description`: String
  - `portfolio`: Files (jpeg/jpg/png, max 5)
  - `priceRange`: String
  - `openTime`: String (required)
  - `totalStaff`: Number (required)
  - `tag`: String
- **Response:** `{ message: "Profile created", profile: {...} }`

## Get Salon Profile
- **Endpoint:** `GET /salon-profile`
- **Description:** Retrieve salon profile.
- **Response:** `{ id, salonId, name, address, phone, description, portfolio, priceRange, openTime, totalStaff, createdAt }`

## Update Salon Profile
- **Endpoint:** `PUT /salon-profile`
- **Description:** Update salon profile.
- **Body (form-data):**
  - `name`: String
  - `address`: String
  - `phone`: String
  - `description`: String
  - `portfolio`: Files (jpeg/jpg/png, max 5)
  - `priceRange`: String
  - `openTime`: String
  - `totalStaff`: Number
- **Response:** `{ message: "Profile updated", profile: {...} }`

## Delete Salon Profile
- **Endpoint:** `DELETE /salon-profile`
- **Description:** Delete salon profile.
- **Response:** `{ message: "Profile deleted" }`

---

**Note:** All profile operations require salon authentication.

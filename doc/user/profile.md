# User Profile API

## Create Profile
- **Endpoint:** `POST /user-profile`
- **Description:** Create a user profile.
- **Body (form-data):**
  - `fullName`: String (required)
  - `phone`: String
  - `address`: String
  - `faceImage`: File (jpeg/jpg/png)
- **Response:** `{ message: "Profile created", profile: {...} }`

## Get Profile
- **Endpoint:** `GET /user-profile`
- **Description:** Retrieve user profile.
- **Response:** `{ id, userId, fullName, phone, address, faceImage, createdAt }`

## Update Profile
- **Endpoint:** `PUT /user-profile`
- **Description:** Update user profile.
- **Body (form-data):**
  - `fullName`: String
  - `phone`: String
  - `address`: String
  - `faceImage`: File (jpeg/jpg/png)
- **Response:** `{ message: "Profile updated", profile: {...} }`

## Delete Profile
- **Endpoint:** `DELETE /user-profile`
- **Description:** Delete user profile.
- **Response:** `{ message: "Profile deleted" }`

---

**Note:** All profile operations require user authentication.

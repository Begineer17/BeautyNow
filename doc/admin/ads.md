# Admin Advertisement Management API

## Update Advertisement Status
- **Endpoint:** `PUT /admin/:adId`
- **Description:** Update status of an advertisement.
- **Headers:** `Authorization: Bearer JWT_TOKEN (Admin role)`
- **Body (JSON):**
  - `status`: String (required)
- **Response:** `{ message: "Advertisement updated", ad: { ... } }`

## Delete Advertisement
- **Endpoint:** `DELETE /admin/:adId`
- **Description:** Delete (cancel) an advertisement.
- **Headers:** `Authorization: Bearer JWT_TOKEN (Admin role)`
- **Response:** `{ message: "Advertisement cancelled" }`

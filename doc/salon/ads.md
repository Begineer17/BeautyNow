# Salon Advertisement API

## Purchase Advertisement Package
- **Endpoint:** `POST /ads`
- **Description:** Purchase an advertisement package for the salon.
- **Headers:** `Authorization: Bearer JWT_TOKEN (Salon role)`
- **Body (JSON):**
  - `packageType`: String (required, e.g. 'highlight')
  - `price`: Number (required)
  - `duration`: Number (required)
  - `startTime`: Date (required)
  - `endTime`: Date (required)
- **Response:** `{ message: "Advertisement package purchased", ad: { ... } }`

## Get List of Advertisements
- **Endpoint:** `GET /ads`
- **Description:** Retrieve all advertisements for the salon.
- **Headers:** `Authorization: Bearer JWT_TOKEN (Salon role)`
- **Response:** `{ ads: [ ... ] }`

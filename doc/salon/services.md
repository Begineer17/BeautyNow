# Salon Services API

## Create Service
- **Endpoint:** `POST /salon-profile/services`
- **Description:** Add a new service to the salon.
- **Body (form-data):**
  - `name`: String (required)
  - `category`: String Array (required)
  - `description`: String
  - `originalPrice`: Number (optional)
  - `currentPrice`: Number (required)
  - `duration`: Number (required, minutes)
  - `isHome`: Boolean (required)
  - `illustrationImage`: File (jpeg/jpg/png)
- **Response:** `{ message: "Service created", service: {...} }`

## Get All Services
- **Endpoint:** `GET /salon-profile/services`
- **Description:** Retrieve all services offered by the salon.
- **Response:** Array of service objects

## Update Service
- **Endpoint:** `PUT /salon-profile/services/:serviceId`
- **Description:** Update details of a service.
- **Body (form-data):**
  - `name`: String
  - `description`: String
  - `originalPrice`: Number
  - `currentPrice`: Number
  - `duration`: Number (minutes)
  - `isHome`: Boolean
  - `illustrationImage`: File (jpeg/jpg/png)
- **Response:** `{ message: "Service updated", service: {...} }`

## Delete Service
- **Endpoint:** `DELETE /salon-profile/services/:serviceId`
- **Description:** Remove a service from the salon.
- **Response:** `{ message: "Service deleted" }`

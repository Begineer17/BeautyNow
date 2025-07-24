# User Appointments API

## Create Appointment
- **Endpoint:** `POST /appointments`
- **Description:** Book a new appointment with a salon.
- **Authentication:** Required (JWT in header)
- **Body (JSON):**
  - `salonId`: String or Number (required)
  - `serviceId`: String or Number (required)
  - `startTime`: ISO datetime string (required)
  - `endTime`: ISO datetime string (required)
- **Response:**
  - Success: `{ message: "Appointment created", appointment: { ... } }`
  - Unauthorized: `{ message: "Invalid token" }`
  - Error: `{ message: "Server error", error: "<error message>" }`
- **Realtime:** Emits `appointment_created` event with appointment data.

## Cancel Appointment
- **Endpoint:** `DELETE /appointments/:id`
- **Description:** Cancel an existing appointment.
- **Authentication:** Required (JWT in header)
- **Parameters:**
  - `id`: Appointment ID (required)
- **Response:**
  - Success: `{ message: "Appointment cancelled" }`
  - Not Found: `{ message: "Appointment not found" }`
  - Error: `{ message: "Server error", error: "<error message>" }`
- **Realtime:** Emits `appointment_deleted` event with appointment ID.

# Salon Appointments API

## View Appointments
- **Endpoint:** `GET /appointments`
- **Description:** Retrieve all appointments for the salon (if implemented).
- **Authentication:** Required (JWT in header)
- **Response:** List of appointment objects

## Cancel Appointment
- **Endpoint:** `DELETE /appointments/:id`
- **Description:** Cancel an appointment (by salon).
- **Authentication:** Required (JWT in header)
- **Parameters:**
  - `id`: Appointment ID (required)
- **Response:**
  - Success: `{ message: "Appointment cancelled" }`
  - Not Found: `{ message: "Appointment not found" }`
  - Error: `{ message: "Server error", error: "<error message>" }`
- **Realtime:** Emits `appointment_deleted` event with appointment ID.

# Salon Analytics API

## Analyze Revenue and Appointments
- **Endpoint:** `GET /analytics`
- **Description:** Analyze salon revenue and appointment count for a given period.
- **Headers:** `Authorization: Bearer JWT_TOKEN (Salon role)`
- **Query Parameters:**
  - `startDate`: Date (optional)
  - `endDate`: Date (optional)
- **Response:**
  - `totalAppointments`: Number
  - `totalRevenue`: Number

# User Search & Filter API

## Search Services & Salons
- **Endpoint:** `POST /services/search`
- **Description:** Search for services and salons using keywords and filters.
- **Body (JSON):**
  - `query`: String (required)
  - `category`: String (optional)
  - `location`: String (optional)
  - `minPrice`, `maxPrice`: Number (optional)
  - `type`: 'services' | 'salons' | 'both' (default: 'both')
- **Response:**
  - Success: `{ success: true, data: { services: [...], salons: [...] }, totalResults, message }`

## Filter Services
- **Endpoint:** `POST /services/filter`
- **Description:** Filter services by category, price, location, and home service availability.
- **Body (JSON):**
  - `category`: String (optional)
  - `minPrice`: Number (optional)
  - `maxPrice`: Number (optional)
  - `location`: String (optional)
  - `isHome`: Boolean (optional)
- **Response:** `{ services: [...] }`

## Get Top Services
- **Endpoint:** `GET /services/top`
- **Description:** Get top-rated services.
- **Query Parameters:**
  - `limit`: Number (optional)
  - `category`: String (optional)
- **Response:** `{ success: true, data: [...], message }`

## Get Top Salons
- **Endpoint:** `GET /services/top-salons`
- **Description:** Get top-rated salons.
- **Query Parameters:**
  - `limit`: Number (optional)
  - `location`: String (optional)
- **Response:** `{ success: true, data: [...], message }`

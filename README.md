# Paris Airbnb API - SQL Server Integration

This project is a Node.js/Express backend that serves a React frontend for exploring Airbnb listings in Paris. It demonstrates how to securely connect to a Microsoft SQL Server database, construct dynamic queries, and structure an application using a layered architecture.

## Architecture

The backend follows a strict 3-tier architecture:
- **Routes (`routes/`):** Define the API endpoints and map them to specific controller functions.
- **Controllers (`controllers/`):** Handle HTTP requests/responses, validate user input (query parameters and URL params), and call the DAL. No SQL logic exists here.
- **Data Access Layer (`dal/`):** The only layer that interacts with the database. It executes SQL queries using parameterized inputs (`@param`) to prevent SQL injection. It has no knowledge of `req` or `res`.

## Features & Endpoints

### 1. `GET /api/listings`
Fetches a list of listing cards.
- **Filtering:** Supports `neighbourhood`, `roomType`, `minPrice`, `maxPrice`, and `minRating` (Bonus).
- **Sorting:** Sorts by `price` (default) or `rating` using dynamic SQL construction.
- **Pagination:** Uses `limit` (default 20, max 50).
- **SQL Functions Used:** `CONCAT`, `UPPER`, `CAST`, `ROUND`.

### 2. `GET /api/listings/:id`
Fetches detailed information for a single listing and its host.
- Returns `400` for invalid IDs and `404` if not found.
- **Data Parsing:** Converts Excel serial dates to standard dates.
- **Bonus:** Parses the raw SQL `amenities` string into a clean JSON array in the controller.
- **SQL Functions Used:** `DATEADD`, `YEAR`, `DATEDIFF`, `GETDATE`, `LEN`, `STR`, `CONCAT`.

### 3. `GET /api/hosts/:hostId/listings`
Fetches all active listings belonging to a specific host, ordered from cheapest to most expensive.

## Getting Started

### Prerequisites
- Node.js (v20 or higher)
- Microsoft SQL Server access credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd sql-12-paris-airbnb
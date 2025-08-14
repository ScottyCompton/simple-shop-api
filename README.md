# Simple Shop API

A REST API for a simple shop application, built with Node.js and Express.

## Getting Started

### Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The server will start on http://localhost:3000.

## Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information and available endpoints |
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get a specific product by ID |
| GET | `/api/products/category/:id` | Get products by category |
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/home` | Get categories with display information |

## Response Format

All responses follow this format:

```json
{
  "data": {
    // Requested data
  }
}
```

## Error Handling

Errors will be returned with appropriate HTTP status codes and a JSON object:

```json
{
  "error": "Error message"
}
```

## Development

For development, the server uses `nodemon` for automatic restarting when files change.

```bash
npm run dev
```

## Production

For production, use:

```bash
npm start
```

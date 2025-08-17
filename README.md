# Simple Shop API

A REST API for a simple shop application, built with Node.js, Express, TypeScript, MySQL, and Prisma ORM.

## Getting Started

### Prerequisites

- Node.js (v16.x or higher)
- npm (v7.x or higher)
- MySQL database server

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up your MySQL database and update the DATABASE_URL in the `.env` file:

```
DATABASE_URL="mysql://username:password@localhost:3306/simple-shop"
```

4. Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

5. Migrate data from JSON to database (if needed):

```bash
npm run migrate:all
```

6. Start the development server:

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

## Database

The API uses MySQL with Prisma ORM for data persistence. The database schema is defined in `prisma/schema.prisma`.

### Models

- **Product**: Store product information (name, price, category, etc.)
- **User**: User data with billing and shipping information
- **State**: US state codes and names

### Migrations

To apply database migrations:

```bash
npx prisma migrate dev
```

To reset the database:

```bash
npx prisma migrate reset
```

## Development

For development, the server uses `nodemon` with `ts-node` for automatic TypeScript compilation and server restarting when files change.

```bash
npm run dev
```

## Production

For production, build the TypeScript code first and then start the server:

```bash
npm run build
npm start
```

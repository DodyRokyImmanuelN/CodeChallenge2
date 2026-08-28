# Q&A Forum API

A RESTful API for a Q&A Forum built with **NestJS**, **PostgreSQL**, and **Prisma ORM**. Users can register, log in, and manage discussion threads. Only the owner of a thread can update or delete it.

## Tech Stack

- **Framework:** NestJS (Express)
- **Database:** PostgreSQL
- **ORM:** Prisma (with `@prisma/adapter-pg` driver adapter)
- **Authentication:** JWT (`@nestjs/jwt`) + bcrypt password hashing
- **Validation:** class-validator / class-transformer
- **Documentation:** Swagger (OpenAPI) via `@nestjs/swagger`

## Features

- User registration and login with hashed passwords (bcrypt)
- JWT-based authentication (stateless, `Authorization: Bearer <token>`)
- CRUD operations on discussion threads (one user → many threads)
- Ownership-based authorization — only a thread's creator can update or delete it
- Global exception filter — consistent JSON error shape for both application errors and unexpected database errors
- Interactive API documentation via Swagger UI

## Prerequisites

- Node.js (v18+ recommended)
- npm
- Docker (for running PostgreSQL locally via `docker-compose`)

## Getting Started

1. **Clone the repository and install dependencies**
   ```bash
   git clone https://github.com/DodyRokyImmanuelN/CodeChallenge2.git
   cd CodeChallenge2
   npm install
   ```

2. **Set up environment variables**

   Copy `.env.example` to `.env` and adjust if needed:
   ```bash
   cp .env.example .env
   ```

   | Variable | Description | Example |
   |---|---|---|
   | `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/qa_forum?schema=public` |
   | `JWT_SECRET` | Secret key used to sign JWT tokens | `change-this-secret` |
   | `PORT` | Port the API server listens on | `3000` |

3. **Start the PostgreSQL database** (via Docker)
   ```bash
   docker compose up -d db
   ```

4. **Run database migrations and generate the Prisma client**
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

5. **Run the application**
   ```bash
   npm run start:dev
   ```

   The API will be available at `http://localhost:3000/api`.

## API Documentation (Swagger)

Once the server is running, interactive API documentation is available at:

```
http://localhost:3000/api-docs
```

To test protected endpoints in Swagger UI:
1. Call `POST /api/auth/login` to obtain an `access_token`.
2. Click the **Authorize** button (top right of the Swagger UI page).
3. Paste the token and confirm.
4. All endpoints marked with a 🔒 icon will now automatically include your token.

## API Endpoints

All routes are prefixed with `/api`.

### Auth

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Log in and receive a JWT access token |
| GET | `/auth/me` | Yes | Get the decoded payload of the current token |

### Users

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| GET | `/users/:id` | No | Get a user's public profile |

### Threads

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| POST | `/threads` | Yes | Create a new thread |
| GET | `/threads` | No | List all threads |
| GET | `/threads/my-threads` | Yes | List threads created by the current user |
| GET | `/threads/:id` | No | Get a single thread's detail |
| PUT | `/threads/:id` | Yes (owner only) | Update a thread |
| DELETE | `/threads/:id` | Yes (owner only) | Delete a thread |

## Authentication

Protected endpoints require a JWT in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

The token is obtained from `POST /api/auth/login` and is valid for 1 day.

## Error Response Format

All errors — whether thrown intentionally (e.g. validation, not found, forbidden) or unexpected — are caught by a global exception filter and returned in a consistent shape:

```json
{
  "statusCode": 404,
  "message": "Thread tidak ditemukan"
}
```

| Status Code | Meaning |
|---|---|
| 400 | Bad Request — invalid input |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — authenticated, but not the resource owner |
| 404 | Not Found — resource does not exist |
| 409 | Conflict — duplicate value (e.g. username/email already taken) |
| 500 | Internal Server Error — unexpected error |

## Design Decisions

A few notes on approach and trade-offs made while building this API:

- **UUID primary keys** instead of auto-increment integers — avoids leaking record counts, and works well if the app is ever scaled to multiple database instances.
- **Ownership checks always resolve existence (404) before permission (403)** — checking whether a user "owns" a resource before confirming it even exists is not meaningful, so a request for a non-existent thread always returns 404, never 403.
- **A global exception filter (`@Catch()`) sits on top of manually-thrown exceptions** — application-level errors (validation, not found, forbidden) already return clean responses via NestJS's built-in `HttpException` handling, but errors from underlying libraries (e.g. a Prisma unique-constraint violation) do not. The global filter normalizes both into one consistent JSON shape and translates recognized database errors (e.g. duplicate username/email) into a proper `409 Conflict` instead of a generic `500`.
- **JWT over sessions** — the API is stateless; no session store is required, which keeps the implementation simple and suitable for horizontal scaling.
- **Prisma with a driver adapter (`@prisma/adapter-pg`)** — required by Prisma 7's new architecture, and keeps the database access layer explicit about which driver it uses.

## Project Structure

```
src/
├── auth/          # Registration, login, JWT issuing
├── users/         # User public profile endpoint
├── threads/       # Thread CRUD + ownership authorization
├── prisma/        # PrismaService (global module)
├── common/
│   ├── guards/    # AuthGuard (JWT verification)
│   └── filters/   # AllExceptionsFilter (global error handling)
├── app.module.ts
└── main.ts
```

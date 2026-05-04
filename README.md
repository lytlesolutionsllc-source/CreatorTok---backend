# CreatorTok Backend

Multi-account TikTok content calendar and scheduling platform — Backend API.

## Tech Stack

- **Runtime:** Node.js + Express.js + TypeScript
- **ORM:** Prisma with PostgreSQL (Neon serverless)
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Deployment:** Vercel serverless functions

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (e.g., [Neon](https://neon.tech))

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Port to run the server on (default: 5000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `TIKTOK_CLIENT_KEY` | TikTok API client key (optional) |
| `TIKTOK_CLIENT_SECRET` | TikTok API client secret (optional) |
| `OPENAI_API_KEY` | OpenAI API key for image generation (optional — required for `/api/images/generate`) |

### Database Setup

```bash
npx prisma migrate deploy
```

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## API Endpoints

### Health Check

```
GET /api/health
```

### Auth

```
POST /api/auth/register   — Create a new account
POST /api/auth/login      — Login and get a JWT
GET  /api/auth/me         — Get current user (requires auth)
```

### TikTok Accounts

```
GET    /api/accounts        — List all linked TikTok accounts
GET    /api/accounts/:id    — Get a single account
POST   /api/accounts        — Link a new TikTok account
PUT    /api/accounts/:id    — Update an account
DELETE /api/accounts/:id    — Remove an account
```

### Posts

```
GET    /api/posts        — List all posts
GET    /api/posts/:id    — Get a single post
POST   /api/posts        — Create a post
PUT    /api/posts/:id    — Update a post
DELETE /api/posts/:id    — Delete a post
```

### Schedules

```
GET    /api/schedules        — List all schedules
GET    /api/schedules/:id    — Get a single schedule
POST   /api/schedules        — Create a schedule
PUT    /api/schedules/:id    — Update a schedule
DELETE /api/schedules/:id    — Delete a schedule
```

All authenticated endpoints require an `Authorization: Bearer <token>` header.

All responses follow the format:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "..." }
```

### Images

```
POST /api/images/generate   — Generate an image from a text prompt using OpenAI (gpt-image-1)
                              Body: { "prompt": "string" }
                              Response: { "imageUrl": "data:image/png;base64,..." }

POST /api/images/upload     — Upload your own image (multipart/form-data, field: "file")
                              Allowed types: jpeg, png, gif, webp  |  Max size: 10 MB
                              Response: { "imageUrl": "data:image/...;base64,..." }
```

> **Note:** No cloud storage is configured yet — both endpoints return a base64 data URL.
> Set `OPENAI_API_KEY` in your environment to enable `/api/images/generate`.
> TODO: Integrate S3/Cloudinary to return hosted URLs.

### Music

```
GET /api/music/trending     — List trending music tracks (static seed list)
GET /api/music/favorites    — List favorite music tracks (static seed list)
```

Track shape:

```json
{
  "id": "string",
  "title": "string",
  "artist": "string",
  "duration": 180,
  "coverUrl": "string"
}
```

> TODO: Replace static lists with a live music provider integration.

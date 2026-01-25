# POC1 - GraphQL API with Prisma ORM

A monorepo project with GraphQL API and shared database package using Prisma ORM.

## Project Structure

```
poc1/
├── .env                    # Centralized environment variables (gitignored)
├── .env.example            # Environment variables template
├── packages/
│   └── db/                 # Shared database package
│       ├── prisma/
│       │   └── schema.prisma
│       ├── index.js
│       └── prisma.config.ts
│
└── apps/
    └── api/                # GraphQL API server
        ├── src/
        │   ├── graphql/
        │   ├── middleware/
        │   └── utils/
        └── server.js
```

## Environment Variables

**All environment variables are managed in a single `.env` file at the project root.**

This ensures consistency across all packages and apps in the monorepo.

### Setup

1. Copy the example file:
```bash
cp .env.example .env
```

2. Update the values in `.env`:
```env
# Database Configuration
DATABASE_URL="mysql://root:password@localhost:3306/ai_app"

# JWT Authentication
JWT_SECRET="your-secret-key-change-in-production"
```

### How it works

- Both `packages/db` and `apps/api` automatically load environment variables from the root `.env` file
- No need for multiple `.env` files in different packages
- Centralized configuration management

## Quick Start

### Prerequisites
- Node.js v24.13.0 (use `nvm use 24`)
- MySQL database running

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Create the database and run migrations:
```bash
cd packages/db
npx prisma migrate dev
```

4. Start the API server:
```bash
cd apps/api
node server.js
```

The server will be available at:
- API: `http://localhost:3000`
- GraphiQL: `http://localhost:3000/graphiql`

## Documentation

- [Setup Summary](./SETUP_SUMMARY.md) - Complete setup documentation
- [API Documentation](./apps/api/README.md) - GraphQL API documentation

## Features

- ✅ GraphQL API with Fastify + Mercurius
- ✅ Prisma ORM with MySQL (MariaDB adapter)
- ✅ JWT Authentication
- ✅ Password hashing with bcrypt
- ✅ Centralized environment configuration
- ✅ Monorepo structure with shared packages
- ✅ Snake_case database naming convention

## Tech Stack

- **Runtime**: Node.js v24.13.0
- **API Framework**: Fastify
- **GraphQL**: Mercurius
- **ORM**: Prisma 7.3.0
- **Database**: MySQL (via MariaDB driver)
- **Authentication**: JWT + bcrypt
- **Package Manager**: npm
- **Monorepo**: Turborepo

# POC1 - GraphQL API with Prisma ORM

A monorepo project with GraphQL API and shared database package using Prisma ORM.

## Project Structure

```
poc1/
├── .env                    # Centralized environment variables (gitignored)
├── .env.example            # Environment variables template
├── packages/
│   ├── db/                 # Shared database package
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── index.js
│   │   └── prisma.config.ts
│   │
│   └── ui/                 # Shared UI components (shadcn + Tailwind)
│       ├── src/
│       │   ├── primitives/     # Raw shadcn components
│       │   ├── components/     # Customized components
│       │   ├── lib/
│       │   └── styles/
│       └── components.json
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

## Database Migrations

### Automatic Migrations (Husky)
When you modify `packages/db/prisma/schema.prisma` and commit, a pre-commit hook automatically:
1. Detects schema changes
2. Creates a new migration with timestamp
3. Adds migration files to your commit

### Manual Migration Commands
```bash
cd packages/db

# Create migration (interactive)
npm run migrate

# Create migration without applying
npm run migrate:create

# Deploy migrations (production)
npm run migrate:deploy

# Open Prisma Studio
npm run studio
```

## Documentation

- [Setup Summary](./SETUP_SUMMARY.md) - Complete setup documentation
- [API Documentation](./apps/api/README.md) - GraphQL API documentation
- [UI Components](./packages/ui/README.md) - UI component library guide
- [Shadcn Quick Reference](./packages/ui/COMPONENTS.md) - Component commands

## Features

- ✅ GraphQL API with Fastify + Mercurius
- ✅ Prisma ORM with MySQL (MariaDB adapter)
- ✅ JWT Authentication
- ✅ Password hashing with bcrypt
- ✅ Centralized environment configuration
- ✅ Monorepo structure with shared packages
- ✅ Snake_case database naming convention
- ✅ Automatic migration creation via Husky pre-commit hooks
- ✅ Port conflict handling (auto-kill on startup)

## Tech Stack

- **Runtime**: Node.js v24.13.0
- **API Framework**: Fastify
- **GraphQL**: Mercurius
- **ORM**: Prisma 7.3.0
- **Database**: MySQL (via MariaDB driver)
- **Authentication**: JWT + bcrypt
- **Package Manager**: npm
- **Monorepo**: Turborepo

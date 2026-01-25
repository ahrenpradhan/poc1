# Project Setup Summary

## ✅ Completed Setup

### 1. Database Schema (packages/db)
- Created Prisma schema with snake_case naming convention
- Tables: `user`, `profile`, `auth_key`, `plan`, `user_plan`
- Configured for MySQL using Prisma 7.3.0 with MariaDB adapter
- Environment: Node.js v24.13.0

**Key Models:**
- **user**: Main user table with email
- **profile**: 1-to-1 relationship with user (first_name, last_name)
- **auth_key**: Password authentication (hashed_password)
- **plan**: Subscription plans with pricing
- **user_plan**: User-to-plan relationship (allows plan changes)

### 2. GraphQL API (apps/api)
Structured GraphQL server with:
- **Authentication**: bcrypt password hashing + JWT tokens
- **Auth Middleware**: Automatic token verification from `Authorization` header
- **Protected Queries**: Easy to add/remove authentication

**Available Operations:**

#### Mutations:
1. **createUser** - Register new user with profile
   - Creates user, profile, and hashed password in transaction
   - Returns JWT token

2. **signIn** - Authenticate user
   - Validates email/password
   - Returns JWT token

#### Queries:
1. **me** - Get current authenticated user (protected)
2. **user(id)** - Get user by ID (protected)

### 3. Project Structure

```
poc1/
├── packages/
│   └── db/
│       ├── prisma/
│       │   └── schema.prisma        # Database schema
│       ├── index.js                  # Prisma client export
│       ├── prisma.config.ts          # Prisma 7 config
│       └── .env                      # Database connection
│
└── apps/
    └── api/
        ├── src/
        │   ├── graphql/
        │   │   ├── schemas/
        │   │   │   ├── user.schema.js
        │   │   │   └── index.js
        │   │   └── resolvers/
        │   │       ├── user.resolver.js
        │   │       └── index.js
        │   ├── middleware/
        │   │   └── auth.js           # JWT authentication
        │   └── utils/
        │       └── auth.js           # bcrypt + JWT utilities
        ├── server.js                 # Fastify + Mercurius server
        ├── .env.example
        └── README.md
```

## 🚀 Running the Application

### Prerequisites
- Node.js v24.13.0 (use `nvm use 24`)
- MySQL database running

### Environment Setup

**All environment variables are managed in a single `.env` file at the project root.**

1. Copy the example file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:
```bash
# Database Configuration
DATABASE_URL="mysql://root:password@localhost:3306/ai_app"

# JWT Authentication
JWT_SECRET="your-secret-key-change-in-production"
```

**Note**: All packages and apps automatically load environment variables from the root `.env` file.

### Start the Server
```bash
# From project root
source ~/.nvm/nvm.sh
nvm use 24
cd apps/api
node server.js
```

Server runs at: `http://localhost:3000`
GraphiQL interface: `http://localhost:3000/graphiql`

## 📝 Example GraphQL Operations

### 1. Create User
```graphql
mutation CreateUser {
  createUser(input: {
    email: "user@example.com"
    password: "securepassword123"
    first_name: "John"
    last_name: "Doe"
  }) {
    token
    user {
      id
      email
      profile {
        first_name
        last_name
      }
    }
  }
}
```

### 2. Sign In
```graphql
mutation SignIn {
  signIn(input: {
    email: "user@example.com"
    password: "securepassword123"
  }) {
    token
    user {
      id
      email
    }
  }
}
```

### 3. Get Current User (Authenticated)
Set HTTP header: `Authorization: Bearer <your-token>`

```graphql
query Me {
  me {
    id
    email
    profile {
      first_name
      last_name
    }
  }
}
```

## 🔐 Adding Authentication to New Queries

To protect any query/mutation:

```javascript
myQuery: async (_, __, context) => {
  // Check authentication
  if (!context.user) {
    throw new Error('Not authenticated');
  }
  
  // Access user ID
  const userId = context.user.userId;
  
  // Use Prisma client
  return context.prisma.someModel.findMany({
    where: { user_id: userId }
  });
}
```

## 📦 Dependencies

### packages/db
- @prisma/adapter-mariadb: ^7.3.0
- @prisma/client: ^7.3.0
- mariadb: ^3.3.2
- prisma: ^7.3.0
- dotenv: ^16.4.7

### apps/api
- fastify: ^5.7.1
- mercurius: ^16.7.0
- @fastify/cors: ^11.2.0
- bcrypt: ^5.1.1
- jsonwebtoken: ^9.0.2

## 🔧 Key Technologies

- **Prisma 7.3.0**: ORM with driver adapters (MariaDB adapter for MySQL)
- **Fastify**: High-performance web framework
- **Mercurius**: GraphQL adapter for Fastify
- **bcrypt**: Password hashing
- **JWT**: Token-based authentication
- **MariaDB Driver**: Connection pooling for MySQL

## 📚 References

For more information about Prisma 7 MySQL setup:
- [MySQL database connector | Prisma Documentation](https://www.prisma.io/docs/orm/overview/databases/mysql)
- [Database drivers | Prisma Documentation](https://www.prisma.io/docs/orm/overview/databases/database-drivers)

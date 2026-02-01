# API Server

GraphQL API server built with Fastify and Mercurius.

## Setup

1. Install dependencies from project root:
```bash
cd /path/to/poc1
npm install
```

2. Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the environment variables in `.env` (see Environment Variables section below)

4. Run database migrations:
```bash
cd packages/db
npx prisma migrate dev
```

5. Run the server:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured `PORT`)

GraphiQL interface: `http://localhost:3000/graphiql`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `HOST` | Server host binding | `0.0.0.0` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key-change-in-production` |
| `JWT_EXPIRATION` | JWT token expiration time | `7d` |
| `BCRYPT_SALT_ROUNDS` | Bcrypt hashing rounds | `10` |
| `OLLAMA_BASE_URL` | Ollama service URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | Ollama model to use | `mistral` |
| `MOCK_RESPONSE_DELAY_MS` | Mock adapter response delay | `1500` |
| `MOCK_STREAM_WORD_DELAY_MS` | Mock adapter streaming delay | `100` |

**Important:** Always set a strong `JWT_SECRET` in production environments.

## GraphQL Operations

### 1. Create New User

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
      profile {
        first_name
        last_name
      }
    }
  }
}
```

### 3. Get Current User (Authenticated)

Add the token to the HTTP headers:
```
Authorization: Bearer <your-token-here>
```

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

### 4. Get User by ID (Authenticated)

```graphql
query GetUser {
  user(id: 1) {
    id
    email
    profile {
      first_name
      last_name
    }
  }
}
```

## Authentication Middleware

The auth middleware automatically extracts and verifies JWT tokens from the `Authorization` header.

For authenticated queries/mutations, include:
```
Authorization: Bearer <token>
```

The middleware adds `user` object to the GraphQL context if authentication is successful. Resolvers can check `context.user` to determine if the request is authenticated.

## Project Structure

```
apps/api/
├── src/
│   ├── graphql/
│   │   ├── schemas/
│   │   │   ├── user.schema.js    # User type definitions
│   │   │   └── index.js           # Combined schemas
│   │   └── resolvers/
│   │       ├── user.resolver.js   # User resolvers
│   │       └── index.js           # Combined resolvers
│   ├── middleware/
│   │   └── auth.js                # Auth middleware
│   └── utils/
│       └── auth.js                # Auth utilities (bcrypt, JWT)
├── server.js                      # Main server file
└── package.json
```

## Adding New Protected Queries/Mutations

To protect any query or mutation with authentication:

1. Check `context.user` in your resolver:
```javascript
if (!context.user) {
  throw new Error('Not authenticated');
}
```

2. Access the authenticated user's ID via `context.user.userId`

3. Use `context.prisma` to query the database

Example:
```javascript
Query: {
  myProtectedQuery: async (_, __, context) => {
    if (!context.user) {
      throw new Error('Not authenticated');
    }

    // Your logic here
    const userId = context.user.userId;
    return context.prisma.someModel.findMany({ where: { user_id: userId } });
  }
}
```

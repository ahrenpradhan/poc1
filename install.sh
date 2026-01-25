#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Required Node version
REQUIRED_NODE_VERSION="24"

print_header() {
  echo ""
  echo -e "${BLUE}============================================${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}============================================${NC}"
  echo ""
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_info() {
  echo -e "${BLUE}→ $1${NC}"
}

# Check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

print_header "POC1 Project Setup"

# ============================================
# Check NVM
# ============================================
print_info "Checking for nvm..."

if [ -f "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
  print_success "nvm found"
elif [ -f "/usr/local/opt/nvm/nvm.sh" ]; then
  source "/usr/local/opt/nvm/nvm.sh"
  print_success "nvm found (Homebrew)"
else
  print_error "nvm is not installed"
  echo ""
  echo "Please install nvm first:"
  echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash"
  echo ""
  echo "Then restart your terminal and run this script again."
  exit 1
fi

# ============================================
# Check/Install Node.js
# ============================================
print_info "Checking for Node.js v${REQUIRED_NODE_VERSION}..."

if nvm ls ${REQUIRED_NODE_VERSION} >/dev/null 2>&1; then
  print_success "Node.js v${REQUIRED_NODE_VERSION} is installed"
else
  print_warning "Node.js v${REQUIRED_NODE_VERSION} is not installed"
  print_info "Installing Node.js v${REQUIRED_NODE_VERSION}..."
  nvm install ${REQUIRED_NODE_VERSION}
  if [ $? -ne 0 ]; then
    print_error "Failed to install Node.js v${REQUIRED_NODE_VERSION}"
    exit 1
  fi
  print_success "Node.js v${REQUIRED_NODE_VERSION} installed successfully"
fi

# Use Node.js 24
nvm use ${REQUIRED_NODE_VERSION}
print_success "Using Node.js $(node --version)"

# ============================================
# Check MySQL
# ============================================
print_info "Checking for MySQL..."

if command_exists mysql; then
  print_success "MySQL client found"

  # Check if MySQL server is running
  if mysql -u root -ppassword -e "SELECT 1" >/dev/null 2>&1; then
    print_success "MySQL server is running and accessible"
  elif mysql -u root -e "SELECT 1" >/dev/null 2>&1; then
    print_warning "MySQL is running but may need password configuration"
    echo ""
    echo "Please update the DATABASE_URL in .env file with correct credentials"
  else
    print_error "MySQL server is not running or not accessible"
    echo ""
    echo "Please ensure MySQL server is running:"
    echo "  macOS:   brew services start mysql"
    echo "  Linux:   sudo systemctl start mysql"
    echo "  Windows: net start mysql"
    echo ""
    echo "After starting MySQL, run this script again."
    exit 1
  fi
else
  print_error "MySQL is not installed"
  echo ""
  echo "Please install MySQL first:"
  echo "  macOS:   brew install mysql && brew services start mysql"
  echo "  Ubuntu:  sudo apt-get install mysql-server"
  echo "  Windows: Download from https://dev.mysql.com/downloads/installer/"
  echo ""
  echo "After installing MySQL, run this script again."
  exit 1
fi

# ============================================
# Setup Environment File
# ============================================
print_info "Checking environment configuration..."

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    print_success "Created .env file from .env.example"
    print_warning "Please review and update .env with your database credentials"
  else
    print_error ".env.example not found"
    exit 1
  fi
else
  print_success ".env file exists"
fi

# Source .env to get DATABASE_URL
source .env 2>/dev/null || true

# ============================================
# Install Dependencies
# ============================================
print_header "Installing Dependencies"

print_info "Running npm install..."
npm install

if [ $? -ne 0 ]; then
  print_error "Failed to install dependencies"
  exit 1
fi

print_success "Dependencies installed successfully"

# ============================================
# Create Database
# ============================================
print_header "Setting Up Database"

# Extract database name from DATABASE_URL
if [ -n "$DATABASE_URL" ]; then
  DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
  DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
  DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

  print_info "Creating database '${DB_NAME}' if it doesn't exist..."

  mysql -u ${DB_USER} -p${DB_PASS} -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null

  if [ $? -eq 0 ]; then
    print_success "Database '${DB_NAME}' is ready"
  else
    print_warning "Could not create database automatically"
    echo "Please create the database manually:"
    echo "  mysql -u root -p -e \"CREATE DATABASE ${DB_NAME};\""
  fi
else
  print_error "DATABASE_URL not found in .env"
  exit 1
fi

# ============================================
# Generate Prisma Client
# ============================================
print_header "Generating Prisma Client"

print_info "Running prisma generate..."
cd packages/db
npx prisma generate

if [ $? -ne 0 ]; then
  print_error "Failed to generate Prisma client"
  exit 1
fi

print_success "Prisma client generated successfully"

# ============================================
# Run Database Migrations
# ============================================
print_header "Running Database Migrations"

print_info "Checking for pending migrations..."

# Check if migrations folder exists and has migrations
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  print_info "Running existing migrations..."
  npx prisma migrate deploy
else
  print_info "Creating initial migration..."
  npx prisma migrate dev --name init
fi

if [ $? -ne 0 ]; then
  print_error "Failed to run migrations"
  echo ""
  echo "Please check your database connection and try again."
  exit 1
fi

print_success "Database migrations completed"

# ============================================
# Seed Free Plan
# ============================================
print_info "Checking for free plan..."

# Check if free plan exists
PLAN_EXISTS=$(npx prisma db execute --stdin <<EOF
SELECT COUNT(*) as count FROM plan WHERE price = 0 AND deleted_at IS NULL;
EOF
)

if echo "$PLAN_EXISTS" | grep -q "count.*0"; then
  print_info "Inserting free plan..."

  npx prisma db execute --stdin <<EOF
INSERT INTO plan (title, description, price, currency, \`interval\`, is_active, created_at, updated_at, deleted_at)
VALUES('Free', 'Free for all to use', 0, 'INR', 'null', 1, NOW(), NOW(), NULL);
EOF

  if [ $? -eq 0 ]; then
    print_success "Free plan inserted successfully"
  else
    print_warning "Could not insert free plan automatically"
    echo "Please insert manually using:"
    echo "  mysql -u ${DB_USER} -p ${DB_NAME} -e \"INSERT INTO plan (title, description, price, currency, \\\`interval\\\`, is_active, created_at, updated_at) VALUES('Free', 'Free for all to use', 0, 'INR', 'null', 1, NOW(), NOW());\""
  fi
else
  print_success "Free plan already exists"
fi

cd ../..

# ============================================
# Setup Complete
# ============================================
print_header "Setup Complete!"

echo -e "${GREEN}Your project is ready to use!${NC}"
echo ""
echo "To start the development server:"
echo -e "  ${BLUE}nvm use ${REQUIRED_NODE_VERSION}${NC}"
echo -e "  ${BLUE}npx turbo run dev --filter=api${NC}"
echo ""
echo "Or run directly:"
echo -e "  ${BLUE}cd apps/api && npm run dev${NC}"
echo ""
echo "GraphQL Playground: http://localhost:3000/graphiql"
echo "Health Check:       http://localhost:3000/health"
echo ""
print_success "Happy coding!"

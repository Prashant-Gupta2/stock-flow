# StockFlow — Inventory Management System

StockFlow is a multi-tenant inventory management application designed to help store owners manage their stores, products, and stock from a centralized dashboard.

Each user can register their own store, add relevant products, and manage inventory securely. Each store's data is associated with its organization to keep different stores' information separate.

## Current Development Progress

- [x] Backend project setup
- [x] Express.js server configuration
- [x] MySQL database connection using Sequelize
- [x] `User` model created
- [x] `Organization` model created
- [x] `Product` model created
- [ ] Model associations and database constraints
- [ ] Authentication and authorization APIs
- [ ] Organization settings APIs
- [ ] Product CRUD APIs
- [ ] Dashboard summary APIs
- [ ] React frontend integration
- [ ] Testing and deployment

*Update the checklist as each feature is implemented and verified.*

## Tech Stack

**Backend**
- Node.js
- Express.js
- Sequelize ORM

**Database**
- MySQL

**Frontend (planned/in progress)**
- React.js
- Vite

## Project Structure

StockFlow/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Organization.js
│   │   └── Product.js
│   ├── controllers/
|   |-- authController.js
|   |-- productController.js
|   |-- dashboardController.js
|   |-- settingsController.js
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    └── React application (in progress)

*Adjust the folder structure to match the actual repository.*

## Database Models

### 1. User Model

The `User` model stores the details of users who access StockFlow.

Typical fields:
- `id` — unique user identifier
- `name` — user's name, if included in the model
- `email` — unique email address
- `password` — password hash, when password hashing is implemented
- `organizationId` — identifies the user's organization
- `createdAt` and `updatedAt` — timestamps managed by Sequelize

**Purpose:** Connect each user to the store they belong to. A store owner creates an organization during signup and is associated with that organization.

### 2. Organization Model

The `Organization` model represents a store or business registered on StockFlow.

Typical fields:
- `id` — unique organization identifier
- `name` — store or organization name
- `createdAt` and `updatedAt` — timestamps managed by Sequelize

**Purpose:** Store each business's identity and provide an organization identifier for separating data between stores.

Example organization names:
- Prashant Electronics
- Sharma Grocery Store
- City Fashion Store

Each organization should have its own users and inventory records.

### 3. Product Model

The `Product` model stores inventory items belonging to an organization.

Typical fields may include:
- `id` — unique product identifier
- `name` — product name
- `organizationId` — organization that owns the product
- `quantity` — available stock
- `price` — product price
- `sku` — stock-keeping unit, if implemented
- `createdAt` and `updatedAt` — timestamps managed by Sequelize

**Purpose:** Allow store owners to maintain their own product catalog and stock quantities.

*The exact fields depend on the current `Product.js` implementation.*

## Database Relationship

Organization
    |
    | 1 : Many
    |
    ├── Users
    |
    └── Products

- One organization can have multiple users.
- One organization can have multiple products.
- Each user belongs to an organization.
- Each product belongs to an organization.

These relationships should be enforced through Sequelize associations and database foreign keys.

## Application Workflow

1. A user registers with their details and store name.
2. The backend creates an organization for the new store.
3. The backend creates the user and associates them with that organization.
4. After authentication, the user can access their store's features.
5. The user adds products and updates stock quantities.
6. The dashboard displays inventory information for that organization only.

The signup workflow should use a database transaction when creating both the organization and the owner account, so partial records are not left behind if creation fails.

## Multi-Tenant Data Isolation

StockFlow is designed to support multiple stores in one application.

For example:

| Organization | Example products |
|---|---|
| Prashant Electronics | Laptop, Mouse, Keyboard |
| Sharma Grocery Store | Rice, Sugar, Flour |

The backend must obtain the authenticated user's `organizationId` and use it when reading, creating, updating, or deleting products. It should never rely only on an organization ID supplied by the frontend.

## Setup Instructions

### Prerequisites

- Node.js and npm
- MySQL Server
- Git

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd StockFlow
```

Replace the placeholder with your actual repository URL.

### 2. Install backend dependencies


cd backend
npm install

### 3. Configure environment variables

Create a `.env` file inside the `backend` directory.


PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stockflow
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password

Use the variable names expected by your actual database configuration. Do not commit `.env` or expose database credentials in GitHub.

Create the `stockflow` database in MySQL if your configuration does not create it automatically.

### 4. Start the backend

Use the script defined in `backend/package.json`. If it contains a `start` script:

npm start


For development, if a `dev` script is configured:

npm run dev


## Development Notes

- Sequelize models define the database structure.
- Database connection settings belong in the configuration layer.
- Controllers contain application logic.
- Routes expose API endpoints.
- Authentication middleware should protect private APIs.
- Passwords must be hashed before storage.
- Database synchronization and migrations should be handled carefully, especially in production.

## Future Enhancements

- JWT-based authentication and authorization
- Organization settings management
- Product CRUD operations
- Search, filtering, and pagination
- Low-stock alerts
- Dashboard analytics
- Employee invitations and role-based access
- Automated tests and deployment

## Project Goal

The goal of StockFlow is to provide a simple and secure inventory management platform where multiple store owners can independently manage their products, stock levels, and business information.

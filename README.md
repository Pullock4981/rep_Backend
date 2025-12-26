# ERP Backend - MERN Stack

Enterprise Resource Planning (ERP) System Backend built with Node.js, Express, MongoDB, and Mongoose.

## Architecture

This project follows a **3-layered architecture**:

1. **Controller Layer** - Handles HTTP requests and responses
2. **Service Layer** - Contains business logic
3. **Repository Layer** - Handles database operations

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## Project Structure

```
BackEnd/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Mongoose models
│   ├── repositories/    # Data access layer
│   ├── services/        # Business logic layer
│   ├── controllers/     # Request/Response handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── validations/     # Input validation
│   ├── utils/           # Utility functions
│   ├── exceptions/      # Custom error classes
│   ├── enums/           # Constants/Enums
│   └── app.js           # Express app setup
├── tests/               # Test files
├── .env                 # Environment variables
├── package.json
└── server.js            # Entry point
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/erp_db
JWT_SECRET=your_secret_key
PORT=5000
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health check

### Test
- `GET /api/v1/test` - Test API endpoint

## Environment Variables

See `.env.example` for all available environment variables.

## Features

- ✅ 3-layered architecture
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Error handling
- ✅ Input validation
- ✅ Rate limiting
- ✅ Security middleware (Helmet)
- ✅ Request logging
- ✅ File upload support
- ✅ Pagination helpers
- ✅ Base classes for reusability

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## License

ISC


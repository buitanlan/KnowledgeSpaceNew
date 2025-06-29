# KnowledgeSpace Backend Server

## Migration from Duende IdentityServer to Microsoft Identity

This project has been migrated from Duende IdentityServer to Microsoft Identity with JWT Bearer authentication.

## Authentication

The application now uses JWT Bearer tokens for authentication instead of IdentityServer.

### Default User Accounts

When the application starts for the first time, it will create two default user accounts:

#### Admin User
- **Username:** `admin`
- **Password:** `Admin@123`
- **Email:** `admin@knowledgespace.com`
- **Role:** Admin (full access to all features)

#### Regular User
- **Username:** `user`
- **Password:** `User@123`
- **Email:** `user@knowledgespace.com`
- **Role:** Member (limited access)

### Authentication Endpoints

- **POST** `/api/auth/login` - Login and get JWT token
- **POST** `/api/auth/logout` - Logout (clears server-side session)
- **GET** `/api/auth/me` - Get current user information

### JWT Configuration

JWT tokens are configured in `appsettings.json` with the following settings:
- **Issuer:** KnowledgeSpace
- **Audience:** KnowledgeSpace
- **Expiry:** 60 minutes (production), 1440 minutes (development)

### Creating New Users

When creating new users through the API:
- If no password is provided in the request, the default password `User@123` will be used
- The password must meet the configured requirements (8 characters, uppercase, digit)

## API Usage

### Login Example
```json
POST /api/auth/login
{
  "username": "admin",
  "password": "Admin@123"
}
```

### Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin",
  "email": "admin@knowledgespace.com",
  "userId": "..."
}
```

### Using the Token
Include the JWT token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
``` 
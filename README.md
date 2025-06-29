# Knowledge Space - Modern Admin Application

A modern knowledge management system with a comprehensive admin portal built using the latest technologies.

## 🚀 Migration Completed Successfully

This project has been successfully migrated from **Duende IdentityServer** to **Microsoft Identity** with **JWT authentication**, and the admin frontend has been modernized with **Angular 19**, **PrimeNG 19**, and **TailwindCSS 4**.

## 📋 Features

### Backend (.NET 8)
- **JWT Authentication** - Secure token-based authentication
- **Microsoft Identity** - ASP.NET Core Identity for user management
- **Entity Framework Core** - Data persistence with SQL Server
- **RESTful APIs** - Clean API architecture
- **Role-based Authorization** - Comprehensive permission system

### Frontend (Angular 19)
- **Modern Angular 19** - Latest Angular with standalone components
- **Angular Signals** - Reactive state management
- **@for/@if Directives** - New control flow syntax
- **inject() Function** - Modern dependency injection
- **PrimeNG 19** - Professional UI components
- **TailwindCSS 4** - Utility-first CSS framework
- **Responsive Design** - Mobile-friendly interface

### Admin Management System
- **User Management** - Create, edit, delete users with role assignment
- **Role Management** - Define and manage system roles
- **Function Management** - Hierarchical system function organization
- **Permission Management** - Granular permission assignment
- **Dashboard** - System overview and quick actions

## 🏗️ Project Structure

```
KnowledgeSpace - Copy/
├── src/
│   ├── KnowledgeSpace.BackendServer/     # .NET 8 Web API
│   │   ├── Controllers/                  # API Controllers
│   │   ├── Services/                     # Business Services
│   │   ├── Data/                         # Entity Framework
│   │   └── Authorization/                # Permission-based authorization
│   ├── KnowledgeSpace.ViewModels/        # Shared DTOs
│   └── KnowledgeSpace.WebPortal/         # Optional web portal
├── admin-app/                            # Angular 19 Admin App
│   ├── src/app/
│   │   ├── login/                        # Authentication
│   │   ├── protected-zone/               # Main admin area
│   │   │   ├── dashboard/                # Dashboard
│   │   │   └── systems/                  # System management
│   │   │       ├── users/                # User management
│   │   │       ├── roles/                # Role management
│   │   │       ├── functions/            # Function management
│   │   │       └── permissions/          # Permission management
│   │   └── shared/                       # Shared services & components
│   └── ...
└── test/                                 # Unit tests
```

## 🛠️ Technologies Used

### Backend
- **.NET 8** - Latest .NET framework
- **ASP.NET Core Identity** - User and role management
- **Entity Framework Core 8** - ORM for database operations
- **SQL Server** - Database
- **JWT Bearer Authentication** - Token-based security
- **AutoMapper** - Object mapping
- **FluentValidation** - Input validation

### Frontend
- **Angular 19** - Modern SPA framework
- **PrimeNG 19** - Professional Angular UI components
- **TailwindCSS 4** - Utility-first CSS framework
- **Angular Signals** - Reactive state management
- **TypeScript 5** - Type-safe JavaScript
- **RxJS** - Reactive programming

## 🚀 Getting Started

### Prerequisites
- **.NET 8 SDK** or later
- **Node.js 18** or later
- **SQL Server** (LocalDB or full instance)
- **Git**

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "KnowledgeSpace - Copy"
   ```

2. **Configure Database**
   ```bash
   cd src/KnowledgeSpace.BackendServer
   # Update connection string in appsettings.json
   dotnet ef database update
   ```

3. **Run Backend API**
   ```bash
   dotnet run
   ```
   API will be available at `https://localhost:7120`

### Frontend Setup

1. **Navigate to admin app**
   ```bash
   cd admin-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   Admin app will be available at `http://localhost:4200`

## 🔐 Default Accounts

The system includes pre-configured accounts for testing:

- **Admin Account**
  - Username: `admin`
  - Password: `Admin@123`
  - Full system access

- **User Account**
  - Username: `user`
  - Password: `User@123`
  - Limited access

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `POST /api/users/{id}/assign-roles` - Assign roles

### Role Management
- `GET /api/roles` - Get all roles
- `POST /api/roles` - Create role
- `PUT /api/roles/{id}` - Update role
- `DELETE /api/roles/{id}` - Delete role

### Function Management
- `GET /api/functions` - Get all functions
- `POST /api/functions` - Create function
- `PUT /api/functions/{id}` - Update function
- `DELETE /api/functions/{id}` - Delete function

### Permission Management
- `GET /api/permissions` - Get permissions
- `POST /api/permissions/assign` - Assign permission
- `DELETE /api/permissions/remove` - Remove permission

## 🔧 Configuration

### Backend Configuration (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=KnowledgeSpace;Trusted_Connection=true"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key-here",
    "Issuer": "KnowledgeSpace",
    "Audience": "KnowledgeSpace",
    "ExpiryMinutes": 60
  }
}
```

### Frontend Configuration (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7120/api'
};
```

## 🧪 Testing

### Backend Tests
```bash
cd test/KnowledgeSpace.BackendServer.UnitTest
dotnet test
```

### Frontend Tests
```bash
cd admin-app
npm test
```

## 📦 Building for Production

### Backend
```bash
cd src/KnowledgeSpace.BackendServer
dotnet publish -c Release
```

### Frontend
```bash
cd admin-app
npm run build
```

## 🎨 Key Features

### Modern Angular Development
- **Standalone Components** - No modules required
- **Control Flow Syntax** - `@if`, `@for`, `@switch` directives
- **Signals** - Reactive state management
- **inject()** - Function-based dependency injection

### Permission System
- **Function-based Permissions** - Organize by system functions
- **Command-level Security** - Granular access control (View, Create, Update, Delete)
- **Role-based Access** - Assign permissions to roles
- **UI Permission Directives** - Hide/show elements based on permissions

### Modern UI/UX
- **Responsive Design** - Works on all devices
- **Dark/Light Theme Support** - User preference
- **Professional Components** - PrimeNG component library
- **Accessibility** - WCAG compliant
- **Loading States** - Proper user feedback

## 🔄 Migration Details

### From Duende IdentityServer to Microsoft Identity
- ✅ Removed Duende IdentityServer dependencies
- ✅ Implemented JWT token authentication
- ✅ Created custom token service
- ✅ Updated authentication flow
- ✅ Maintained existing user/role structure

### Frontend Modernization
- ✅ Upgraded to Angular 19
- ✅ Implemented Angular Signals
- ✅ Used new control flow directives
- ✅ Applied modern dependency injection
- ✅ Integrated PrimeNG 19 and TailwindCSS 4

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ using .NET 8, Angular 19, PrimeNG 19, and TailwindCSS 4**
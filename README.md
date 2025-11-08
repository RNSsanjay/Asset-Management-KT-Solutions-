# Asset Management System

A modern, full-stack web application for managing company assets, built with Node.js, Express, PostgreSQL, and React.

![Asset Management System](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Features

### Core Functionality
- **Employee Management** - Add, edit, delete, and view employee profiles with search and filtering
- **Asset Category Management** - Organize assets into customizable categories
- **Asset Master** - Complete asset lifecycle management with image uploads
- **Stock View** - Dashboard with charts showing asset distribution and value
- **Issue/Return/Scrap Assets** - Track asset assignments and movements
- **Asset History** - Complete timeline of asset lifecycle events
- **PDF Reports** - Generate and download detailed asset reports

### Technical Features
- 🔐 **JWT Authentication** - Secure login with role-based access control
- 🎨 **Modern UI** - Tailwind CSS + ShadCN UI components
- 🌓 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎭 **Smooth Animations** - Framer Motion for delightful user experience
- 📊 **Interactive Charts** - Recharts for data visualization
- 🔍 **Advanced Search** - Filter and search across all modules
- 📄 **Export Data** - Export tables to Excel/CSV
- 🐳 **Docker Support** - Easy deployment with Docker Compose

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **PostgreSQL** - Database
- **Sequelize ORM** - Database modeling
- **JWT** - Authentication
- **Multer** - File uploads
- **PDFKit** - PDF generation
- **Bcrypt** - Password hashing

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **ShadCN UI** - Component library
- **React Router** - Navigation
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **Framer Motion** - Animations
- **Recharts** - Charts
- **Axios** - HTTP client

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository

```powershell
git clone <repository-url>
cd Asset-Management-KT-Solutions-
```

### 2. Setup Backend

```powershell
cd backend
npm install
```

Create `.env` file:
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=asset_management
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
CORS_ORIGIN=http://localhost:3000
```

Setup database:
```powershell
# Create database
psql -U postgres -c "CREATE DATABASE asset_management;"

# Run seed data
node seed.js

# Start server
npm run dev
```

### 3. Setup Frontend

```powershell
cd ../frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

Start development server:
```powershell
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

### Default Credentials

**Admin Account:**
- Email: `admin@assetmanagement.com`
- Password: `admin123`

**Manager Account:**
- Email: `manager@assetmanagement.com`
- Password: `manager123`

## 🐳 Docker Deployment

### Using Docker Compose

```powershell
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:5000/api

### Seed Database in Docker

```powershell
docker-compose exec backend node seed.js
```

## 📁 Project Structure

```
Asset-Management-KT-Solutions-/
├── backend/
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── uploads/         # File uploads directory
│   ├── server.js        # Express server
│   ├── seed.js          # Database seeder
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   │   └── ui/      # UI components (ShadCN)
│   │   ├── lib/         # Utilities and API client
│   │   ├── pages/       # Page components
│   │   ├── store/       # Zustand stores
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── public/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Employees
- `GET /api/employees` - Get all employees (with filters)
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee (Admin/Manager)
- `PUT /api/employees/:id` - Update employee (Admin/Manager)
- `DELETE /api/employees/:id` - Delete employee (Admin)
- `GET /api/employees/departments/list` - Get departments

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (Admin/Manager)
- `PUT /api/categories/:id` - Update category (Admin/Manager)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Assets
- `GET /api/assets` - Get all assets (with filters)
- `GET /api/assets/:id` - Get asset by ID
- `POST /api/assets` - Create asset (Admin/Manager)
- `PUT /api/assets/:id` - Update asset (Admin/Manager)
- `DELETE /api/assets/:id` - Delete asset (Admin)
- `GET /api/assets/stock/summary` - Get stock summary

### Asset History
- `GET /api/asset-history` - Get asset history (with filters)
- `GET /api/asset-history/timeline/:assetId` - Get asset timeline
- `GET /api/asset-history/report/pdf` - Generate PDF report
- `POST /api/asset-history/issue` - Issue asset (Admin/Manager)
- `POST /api/asset-history/return` - Return asset (Admin/Manager)
- `POST /api/asset-history/scrap` - Scrap asset (Admin)

## 👥 User Roles

### Admin
- Full access to all features
- Can create, edit, and delete all records
- Can scrap assets
- Can manage users

### Manager
- Can view all records
- Can create and edit employees, categories, and assets
- Can issue and return assets
- Cannot delete or scrap assets

### Employee
- Can view their own assigned assets
- Limited access to other features

## 🎨 UI Features

- **Clean Modern Design** - Professional card-based layout
- **Dark/Light Theme** - Toggle between themes
- **Responsive Tables** - Advanced filtering and sorting
- **Status Badges** - Color-coded status indicators
- **Loading States** - Skeleton loaders for better UX
- **Toast Notifications** - Success/error messages
- **Smooth Animations** - Page transitions and interactions
- **Form Validation** - Client and server-side validation

## 📊 Database Schema

### Users
- id, name, email, password, role, status

### Employees
- id, employeeId, name, department, designation, contact, email, branch, status

### Categories
- id, name, code, description, status

### Assets
- id, assetTag, serialNumber, categoryId, make, model, specifications, purchaseDate, purchasePrice, warrantyExpiry, vendor, branch, location, status, condition, imageUrl, notes

### AssetHistory
- id, assetId, employeeId, action, actionDate, condition, reason, performedBy, notes

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- HTTP security headers with Helmet
- Rate limiting
- CORS protection
- Input validation and sanitization
- SQL injection prevention (Sequelize ORM)
- File upload restrictions

## 🚢 Production Deployment

### Environment Variables

Update the following for production:

**Backend:**
```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
DB_PASSWORD=<secure-password>
```

**Frontend:**
```env
VITE_API_URL=https://your-api-domain.com/api
```

### Deployment Platforms

- **Backend**: Heroku, AWS, DigitalOcean, Railway
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: AWS RDS, DigitalOcean Managed Databases

## 🧪 Testing

```powershell
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ for efficient asset management

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📞 Support

For support, email support@assetmanagement.com or open an issue in the repository.

---

**Happy Asset Managing! 🎉**
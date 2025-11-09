# Asset Management System

A web application for managing company assets, employees, and tracking asset assignments.

## Features

### Role-Based Access Control
- **Admin**: Full system access - manage users, assets, employees, and view all reports
- **Manager**: Manage assets, employees, assignments - cannot delete critical data
- **Employee**: View personal dashboard and assigned assets only

### Core Functionality
- Asset tracking and management
- Employee management  
- Category organization
- Asset assignment/return workflow
- Complete asset history logging
- Stock view and reports
- Real-time dashboard with statistics

## Quick Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in backend folder:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=asset_management
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_secret_key_here
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

4. Create database in PostgreSQL:
   ```sql
   CREATE DATABASE asset_management;
   ```

5. Initialize and seed database:
   ```bash
   node init-db.js
   node seed.js
   ```

6. Start backend server:
   ```bash
   npm run dev
   ```

   Backend runs on: http://localhost:5000

### Frontend Setup

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in frontend folder:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

   Frontend runs on: http://localhost:3000

## Default Login Credentials

After running seed.js, use these credentials:

### Admin Account
- **Email**: admin@assetmanagement.com
- **Password**: admin123
- **Access**: Full system control

### Manager Account
- **Email**: manager@assetmanagement.com  
- **Password**: manager123
- **Access**: Manage assets and employees


## Usage

### For Admins/Managers:

1. **Add Assets**: 
   - Go to Assets → Add New Asset
   - Fill in details (tag, serial, category, make, model)
   - Upload image (optional)

2. **Add Employees**:
   - Go to Employees → Add New Employee
   - Enter employee details
   - Assign department and designation

3. **Assign Assets**:
   - Go to Asset History → Issue Asset
   - Select employee and available asset
   - Confirm assignment

4. **Return Assets**:
   - Go to Asset History → Return Asset
   - Select assigned asset
   - Add condition and notes

5. **View Reports**:
   - Dashboard: Overview statistics
   - Stock View: Detailed inventory reports
   - Asset History: Complete audit trail

### For Employees:

1. **View Dashboard**:
   - See all assets assigned to you
   - Check asset details and conditions

2. **Click on Employee Name**:
   - View asset assignment history
   - See past and current assets

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL (Database)
- Sequelize (ORM)
- JWT (Authentication)
- Bcrypt (Password hashing)
- Multer (File uploads)

### Frontend
- React 18
- Vite (Build tool)
- Tailwind CSS (Styling)
- TanStack Query (Data fetching)
- Zustand (State management)
- React Router (Navigation)
- Framer Motion (Animations)

## Project Structure

```
Asset-Management-KT-Solutions-/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── uploads/         # Asset images
│   ├── init-db.js      # Database initialization
│   ├── seed.js         # Sample data
│   └── server.js       # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── store/       # State management
│   │   ├── lib/         # Utilities and API
│   │   └── App.jsx      # Main app component
│   └── index.html
│
└── README.md

```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### Assets
- GET `/api/assets` - Get all assets (paginated)
- GET `/api/assets/my-assets` - Get employee's assigned assets
- GET `/api/assets/:id` - Get asset details
- POST `/api/assets` - Create asset (Admin/Manager)
- PUT `/api/assets/:id` - Update asset (Admin/Manager)
- DELETE `/api/assets/:id` - Delete asset (Admin only)

### Employees
- GET `/api/employees` - Get all employees
- GET `/api/employees/:id` - Get employee details
- GET `/api/employees/:id/assets` - Get employee's assets
- POST `/api/employees` - Create employee (Admin/Manager)
- PUT `/api/employees/:id` - Update employee (Admin/Manager)
- DELETE `/api/employees/:id` - Delete employee (Admin only)

### Asset History
- GET `/api/asset-history` - Get history records
- POST `/api/asset-history/issue` - Assign asset to employee
- POST `/api/asset-history/return` - Return asset from employee
- POST `/api/asset-history/scrap` - Mark asset as scrapped

## Troubleshooting

### Backend won't start
- Check if PostgreSQL is running
- Verify database credentials in `.env`
- Ensure database exists: `CREATE DATABASE asset_management;`
- Run `node init-db.js` to create tables

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check VITE_API_URL in frontend `.env`
- Ensure CORS_ORIGIN in backend `.env` matches frontend URL

### Login fails
- Run `node seed.js` to create default users
- Check if JWT_SECRET is set in backend `.env`
- Clear browser localStorage and try again

## Support

For issues or questions, check the code comments or contact the development team.


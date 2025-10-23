# MongoDB Setup for Business AI

## Overview
This guide explains how to set up MongoDB for the Business AI system.

## Prerequisites
1. MongoDB Atlas account (free tier available)
2. Node.js and npm installed
3. Business AI project cloned

## Setup Steps

### 1. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free account or sign in
3. Create a new cluster (free tier recommended)
4. Create a database user with username `vinay` and a secure password
5. Get your connection string from the cluster

### 2. Update Configuration
Edit `server/config.ts` and update the following:

```typescript
export const config = {
  // Set to true to use MongoDB
  USE_MONGODB: true,
  
  // Update with your actual MongoDB password
  MONGODB_PASSWORD: 'your_actual_password_here',
  
  // Other settings remain the same
  MONGODB_URI: 'mongodb+srv://vinay:<db_password>@cluster0.5hfxub2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  DB_NAME: 'business_ai',
};
```

### 3. Environment Variables (Optional)
You can also set environment variables:

```bash
# Windows
set USE_MONGODB=true
set MONGODB_PASSWORD=your_actual_password_here

# Linux/Mac
export USE_MONGODB=true
export MONGODB_PASSWORD=your_actual_password_here
```

### 4. Install Dependencies
```bash
npm install mongodb mongoose
```

### 5. Start the Application
```bash
npm run dev
```

## Features

### MongoDB Storage Features
- ✅ User management (authentication, roles)
- ✅ Customer management (CRUD operations)
- ✅ Lead management with discussions
- ✅ Quotation management
- ✅ Order management
- ✅ Inventory management
- ✅ Task management
- ✅ Dashboard statistics

### JSON File Storage (Fallback)
- ✅ All the same features as MongoDB
- ✅ No external database required
- ✅ Data stored in local JSON files

## Switching Between Storage Types

### To Use MongoDB:
```typescript
// In server/config.ts
USE_MONGODB: true
```

### To Use JSON Files:
```typescript
// In server/config.ts
USE_MONGODB: false
```

## Database Collections
The system creates the following collections in MongoDB:
- `users` - User accounts and authentication
- `customers` - Customer information
- `leads` - Lead management
- `leadDiscussions` - Lead discussion history
- `quotations` - Quotation documents
- `orders` - Sales orders
- `inventory` - Inventory items
- `tasks` - Task management
- `payments` - Payment records
- `invoices` - Invoice documents
- `purchaseOrders` - Purchase orders
- `manufacturingJobs` - Manufacturing jobs
- `employeeActivities` - Employee activity tracking
- `salesTargets` - Sales targets
- `manufacturingForecasts` - Manufacturing forecasts
- `supportTickets` - Support tickets
- `contracts` - Contract management

## Indexes
The system automatically creates indexes for:
- Username (unique)
- Customer email
- Lead email
- Order number (unique)
- Inventory SKU (unique)
- Lead discussions by lead ID

## Default Admin User
The system automatically creates a default admin user:
- Username: `admin`
- Password: `admin123`
- Email: `admin@businessai.com`

**Important**: Change the default password after first login!

## Troubleshooting

### Connection Issues
1. Check your MongoDB password is correct
2. Ensure your IP is whitelisted in MongoDB Atlas
3. Verify the connection string format

### Data Migration
To migrate from JSON files to MongoDB:
1. Set `USE_MONGODB: true`
2. Start the application
3. The system will create collections automatically
4. Data will be empty initially - you can import from JSON files if needed

### Performance
- MongoDB provides better performance for large datasets
- JSON files are suitable for small to medium datasets
- Both storage types support all features equally

## Security Notes
- Never commit passwords to version control
- Use environment variables for production
- Regularly rotate database passwords
- Enable MongoDB Atlas security features (IP whitelist, etc.)

# Reckonix Management System - Render Deployment Guide

## 🚀 Quick Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## 📋 Prerequisites

1. **MongoDB Atlas Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Render Account**: Sign up at [Render](https://render.com)

## 🔧 Environment Variables Setup

### Required Environment Variables

Set these in your Render dashboard under "Environment":

```bash
NODE_ENV=production
PORT=10000
HOST=0.0.0.0
SESSION_SECRET=your-super-secret-session-key-here
USE_MONGODB=true
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/business_ai?retryWrites=true&w=majority
MONGODB_PASSWORD=your-mongodb-password
```

### Optional Environment Variables

```bash
# If you want to use a different database name
DB_NAME=business_ai

# For additional security
NODE_ENV=production
```

## 🗄️ MongoDB Setup

1. **Create MongoDB Atlas Cluster**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster (free tier available)
   - Create a database user with read/write permissions
   - Whitelist Render's IP ranges or use `0.0.0.0/0` for all IPs

2. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

## 🚀 Deployment Steps

### Method 1: One-Click Deploy (Recommended)

1. Click the "Deploy to Render" button above
2. Connect your GitHub account
3. Select this repository
4. Configure environment variables (see above)
5. Click "Deploy"

### Method 2: Manual Deploy

1. **Create New Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**:
   - **Name**: `reckonix-crm` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Choose based on your needs (Starter is free)

3. **Set Environment Variables**:
   - Add all required environment variables listed above
   - Make sure `MONGODB_URI` includes your actual password

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for build and deployment to complete

## 📁 Project Structure

```
├── client/                 # React frontend
├── server/                 # Express.js backend
├── shared/                 # Shared types and schemas
├── data/                   # JSON data files (fallback storage)
├── dist/                   # Built application (auto-generated)
├── package.json            # Dependencies and scripts
├── Procfile               # Process configuration
├── render.yaml            # Render deployment configuration
└── README.md              # This file
```

## 🔧 Build Process

The application automatically:
1. Installs dependencies (`npm install`)
2. Builds the React frontend (`vite build`)
3. Bundles the Node.js server (`esbuild`)
4. Starts the production server (`npm start`)

## 🌐 Access Your Application

After deployment, your application will be available at:
- **URL**: `https://your-service-name.onrender.com`
- **API**: `https://your-service-name.onrender.com/api/*`

## 🔍 Health Check

Visit your deployed URL to verify the application is running correctly.

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all environment variables are set
   - Verify MongoDB connection string is correct
   - Check Render logs for specific error messages

2. **Database Connection Issues**:
   - Verify MongoDB Atlas cluster is running
   - Check IP whitelist includes Render's IP ranges
   - Confirm username/password are correct

3. **Application Not Starting**:
   - Check that `PORT` environment variable is set to `10000`
   - Verify `NODE_ENV` is set to `production`
   - Check server logs in Render dashboard

### Logs

- View logs in Render dashboard under "Logs" tab
- Check both build logs and runtime logs
- Look for any error messages or warnings

## 📞 Support

If you encounter issues:
1. Check the logs in Render dashboard
2. Verify all environment variables are correctly set
3. Test MongoDB connection independently
4. Review this README for common solutions

## 🔄 Updates

To update your deployed application:
1. Push changes to your GitHub repository
2. Render will automatically rebuild and redeploy
3. Monitor the deployment in Render dashboard

---

**Note**: This application uses MongoDB for data storage. Make sure your MongoDB Atlas cluster is properly configured and accessible from Render's servers.

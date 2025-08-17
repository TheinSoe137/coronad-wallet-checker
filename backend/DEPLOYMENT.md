# Backend Deployment Guide for Vercel

## Prerequisites
1. MongoDB database (MongoDB Atlas recommended)
2. Vercel account
3. Node.js 18.x or higher

## Step 1: Prepare Your MongoDB
1. Create a MongoDB database (MongoDB Atlas is recommended)
2. Get your connection string
3. Create a collection named `wallets`

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to backend directory
cd backend

# Deploy
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set project name (e.g., "wallet-checker-backend")
# - Set root directory: ./
# - Override settings: No
```

### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set root directory to `backend`
5. Set build command: `npm run build`
6. Set output directory: `./`
7. Set install command: `npm install`

## Step 3: Set Environment Variables
1. In your Vercel project dashboard, go to Settings > Environment Variables
2. Add `MONGODB_URI` with your MongoDB connection string
3. Redeploy if necessary

## Step 4: Test Your API
Your API will be available at:
- Health check: `https://your-project.vercel.app/api/health`
- Wallet check: `https://your-project.vercel.app/api/wallet/check`

## Step 5: Update Frontend
Update your frontend API endpoint to point to your deployed backend URL.

## Troubleshooting
- If you get "Deployment not found", make sure you're in the correct directory
- Check that your MongoDB connection string is correct
- Verify that all environment variables are set
- Check Vercel function logs for any errors

# 🚀 Render Deployment Guide

## 📋 Prerequisites
- GitHub repository with your code
- Render account (free tier available)

## 🔧 Backend Deployment

### 1. Create Backend Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `room-rental-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Instance Type**: Free (for testing)

### 2. Set Backend Environment Variables
In Render backend service settings, add these environment variables:
```
NODE_ENV=production
PORT=10000
DATABASE_URL=your-neon-database-url
JWT_SECRET=your-jwt-secret-key
FRONTEND_URL=https://your-frontend-service-name.onrender.com
```

### 3. Get Backend URL
After deployment, your backend URL will be:
`https://room-rental-backend.onrender.com`

## 🎨 Frontend Deployment

### 1. Create Frontend Service on Render
1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `room-rental-frontend` (or your preferred name)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/out` (for static export) or `frontend/.next` (for server)

### 2. Set Frontend Environment Variables
In Render frontend service settings, add:
```
NEXT_PUBLIC_API_URL=https://room-rental-backend.onrender.com
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key (optional)
```

## 🔄 Update Configuration

### Update API URLs
1. Replace `room-rental-backend` in `frontend/src/lib/api.ts` with your actual backend service name
2. Replace `room-rental-frontend` in `backend/src/index.ts` with your actual frontend service name

### Example URLs:
- Backend: `https://your-backend-name.onrender.com`
- Frontend: `https://your-frontend-name.onrender.com`

## 🐛 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check FRONTEND_URL environment variable in backend
2. **API Connection Failed**: Verify NEXT_PUBLIC_API_URL in frontend
3. **Build Failures**: Check build commands and dependencies

### Debug Steps:
1. Check Render service logs
2. Verify environment variables
3. Test API endpoints directly
4. Check CORS configuration

## 📝 Notes
- Free tier services may sleep after 15 minutes of inactivity
- First request after sleep may take 30+ seconds
- Consider upgrading to paid tier for production use

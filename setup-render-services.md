# 🚀 Quick Setup: Render Services

## 📝 **Bước 1: Tạo Services trên Render**

### Backend Service:
1. Đăng nhập [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repo `room-for-rent`
4. Cấu hình:
   ```
   Name: room-rental-api (ghi nhớ tên này!)
   Environment: Node
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm start
   ```
5. **Lưu Backend URL**: `https://room-rental-api.onrender.com`

### Frontend Service:
1. Click **"New +"** → **"Static Site"**
2. Connect cùng GitHub repo
3. Cấu hình:
   ```
   Name: room-rental-app (ghi nhớ tên này!)
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: out
   ```
4. **Lưu Frontend URL**: `https://room-rental-app.onrender.com`

## 🔧 **Bước 2: Cập nhật Code**

### Thay thế trong `frontend/src/lib/api.ts`:
```typescript
// Thay dòng này:
return 'https://YOUR_BACKEND_SERVICE_NAME.onrender.com'

// Bằng (ví dụ nếu backend service tên là 'room-rental-api'):
return 'https://room-rental-api.onrender.com'
```

### Thay thế trong `backend/src/index.ts`:
```typescript
// Thay dòng này:
'https://YOUR_FRONTEND_SERVICE_NAME.onrender.com'

// Bằng (ví dụ nếu frontend service tên là 'room-rental-app'):
'https://room-rental-app.onrender.com'
```

## ⚙️ **Bước 3: Set Environment Variables**

### Backend Service Environment Variables:
```
NODE_ENV=production
DATABASE_URL=your-neon-database-url
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://room-rental-app.onrender.com
```

### Frontend Service Environment Variables:
```
NEXT_PUBLIC_API_URL=https://room-rental-api.onrender.com
```

## 🎯 **Ví dụ thực tế:**

Nếu bạn tạo services với tên:
- Backend: `my-rental-backend`
- Frontend: `my-rental-frontend`

Thì URLs sẽ là:
- Backend: `https://my-rental-backend.onrender.com`
- Frontend: `https://my-rental-frontend.onrender.com`

**Cập nhật code với tên này!**

## ✅ **Kiểm tra:**
1. Truy cập backend URL + `/health` để test
2. Truy cập frontend URL để test UI
3. Check browser console cho API errors

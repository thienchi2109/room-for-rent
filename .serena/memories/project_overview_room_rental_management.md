# Dự án Quản lý Nhà trọ - Tổng quan

## Thông tin cơ bản
- **Tên dự án**: Room Rental Management System
- **Loại**: Full-stack web application
- **Mục đích**: Hệ thống quản lý nhà trọ toàn diện với các chức năng quản lý phòng, khách thuê, hợp đồng, hóa đơn

## Kiến trúc hệ thống
### Frontend
- **Framework**: Next.js 15.4.5 với TypeScript
- **UI Library**: shadcn/ui với Tailwind CSS
- **State Management**: 
  - Zustand cho global state (settings, auth)
  - TanStack Query cho server state management
- **Key Libraries**:
  - React Hook Form cho form handling
  - date-fns cho date manipulation
  - Sonner cho toast notifications
  - Lucide React cho icons

### Backend
- **Framework**: Node.js với Express và TypeScript
- **Database**: PostgreSQL với Prisma ORM
- **Database Host**: Neon (cloud PostgreSQL)
- **Authentication**: JWT-based auth
- **API Style**: RESTful API

## Cấu trúc thư mục
```
d:\room-for-rent/
├── frontend/          # Next.js frontend
├── backend/           # Express backend
└── shared/            # Shared types và utilities
```

## Các chức năng chính đã implement
1. **Dashboard**: Tổng quan hệ thống với thống kê
2. **Quản lý phòng**: CRUD phòng với trạng thái
3. **Quản lý khách thuê**: CRUD thông tin khách thuê
4. **Quản lý hợp đồng**: CRUD hợp đồng thuê phòng
5. **Quản lý hóa đơn**: Tạo và theo dõi hóa đơn
6. **Cài đặt hệ thống**: Cấu hình giá dịch vụ và thông tin chung
7. **Authentication**: Đăng nhập/đăng xuất với JWT

## Database Schema chính
- **users**: Quản lý người dùng hệ thống
- **rooms**: Thông tin phòng (số phòng, tầng, diện tích, giá)
- **tenants**: Thông tin khách thuê
- **contracts**: Hợp đồng thuê phòng
- **contract_tenants**: Quan hệ many-to-many giữa contract và tenant
- **bills**: Hóa đơn tiền phòng và dịch vụ
- **residency_records**: Lịch sử cư trú

## Ports
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
# Key Components và Patterns

## Frontend Component Structure

### Layout Components
- **Sidebar Navigation**: Global navigation với menu items
- **Header**: User info và logout functionality
- **ProtectedRoute**: Authentication wrapper component

### Page Components Pattern
Mỗi main page follow pattern:
1. **List Component**: Display data trong cards/table format
2. **Detail Dialog**: Modal để xem chi tiết
3. **Form Dialog**: Modal để create/edit
4. **Delete Dialog**: Confirmation dialog cho delete operations

### Key UI Components
- **FloatingActionButton**: FAB cho mobile create actions
- **LoadingSpinner**: Consistent loading states
- **StatusBadge**: Display status với colors
- **ConfirmDialog**: Reusable confirmation dialogs

### Form Patterns
- **React Hook Form**: Cho complex forms với validation
- **Local State**: Cho simple forms trong settings
- **TanStack Query**: Cho data fetching và mutations

## Backend API Patterns

### Route Structure
```
/api/auth/*     # Authentication endpoints
/api/rooms/*    # Room management
/api/tenants/*  # Tenant management  
/api/contracts/* # Contract management
/api/bills/*    # Bill management
/api/dashboard/* # Dashboard data
```

### Response Patterns
- **List endpoints**: Return `{ data: [], pagination: {} }`
- **Detail endpoints**: Return single object
- **Create/Update**: Return created/updated object
- **Delete**: Return success message

### Error Handling
- Consistent error responses với status codes
- Frontend error boundaries
- Toast notifications cho user feedback

## State Management Patterns

### TanStack Query Keys
```typescript
['rooms', filters]
['contracts', filters]  
['bills', filters]
['tenants', filters]
```

### Zustand Stores
- **authStore**: User authentication state
- **settingsStore**: Application settings (giá dịch vụ, thông tin chung)
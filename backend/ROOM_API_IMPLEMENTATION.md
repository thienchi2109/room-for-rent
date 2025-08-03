# Room CRUD API Implementation

## Summary

Đã hoàn thành thực hiện bước 4.1: **Create room CRUD API endpoints** trong task management system.

## Files Created/Modified

### 1. Routes Implementation
- **File**: `backend/src/routes/rooms.ts`
- **Description**: Thực hiện tất cả các API endpoints cho quản lý phòng

### 2. Validation Schemas
- **File**: `backend/src/lib/validation.ts`
- **Added**: `createRoomSchema` và `updateRoomSchema` cho validation input

### 3. Main App Integration
- **File**: `backend/src/index.ts`
- **Added**: Import và sử dụng room routes

### 4. Test Implementation
- **File**: `backend/src/__tests__/rooms.test.ts`
- **Description**: Comprehensive tests cho tất cả room API endpoints

## API Endpoints Implemented

### 1. GET /api/rooms
- **Purpose**: Lấy danh sách phòng với pagination và filtering
- **Features**:
  - Pagination (page, limit)
  - Filter by status, floor, type
  - Search by room number or type
  - Include related contracts and counts
- **Authentication**: Required

### 2. GET /api/rooms/:id
- **Purpose**: Lấy thông tin chi tiết của một phòng
- **Features**:
  - Include contracts với tenant information
  - Include bills (last 12 months)
  - Include meter readings (last 12 months)
- **Authentication**: Required

### 3. POST /api/rooms
- **Purpose**: Tạo phòng mới
- **Validation**:
  - Room number uniqueness check
  - Required fields validation
  - Data type validation
- **Authentication**: Required

### 4. PUT /api/rooms/:id
- **Purpose**: Cập nhật thông tin phòng
- **Features**:
  - Partial updates supported
  - Room number conflict prevention
  - Existence check
- **Authentication**: Required

### 5. DELETE /api/rooms/:id
- **Purpose**: Xóa phòng với validation checks
- **Safety Checks**:
  - Cannot delete if has active contracts
  - Cannot delete if has unpaid bills
  - Cascade delete meter readings and bills
- **Authentication**: Required

### 6. PATCH /api/rooms/:id/status
- **Purpose**: Cập nhật trạng thái phòng
- **Features**:
  - Validate status enum values
  - Existence check
- **Authentication**: Required

## Validation Rules

### Create Room Schema
- `number`: Required, unique string
- `floor`: Required integer >= 1
- `area`: Required positive number
- `type`: Required string
- `basePrice`: Required positive number
- `status`: Optional, enum (AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE)

### Update Room Schema
- All fields optional
- Same validation rules as create
- At least one field required for update

## Safety Features

1. **Authentication**: Tất cả endpoints yêu cầu JWT authentication
2. **Input Validation**: Comprehensive validation với Joi schemas
3. **Business Logic Validation**:
   - Room number uniqueness
   - Cannot delete rooms with dependencies
   - Status enum validation
4. **Error Handling**: Proper error responses với meaningful messages
5. **Logging**: Activity logging cho audit trail

## Test Coverage

Đã implement comprehensive tests covering:
- ✅ GET endpoints with pagination and filtering
- ✅ POST endpoint with validation
- ✅ PUT endpoint with conflict prevention
- ✅ DELETE endpoint with safety checks
- ✅ PATCH status endpoint
- ✅ Authentication requirements
- ✅ Error cases (404, 409, 400)

**All tests passing**: 48/48 tests pass

## Database Integration

- Sử dụng Prisma ORM để interact với PostgreSQL
- Transaction support cho delete operations
- Proper relations với Contract, Bill, MeterReading models
- Optimized queries với include và orderBy

## Next Steps

Bước tiếp theo trong implementation plan:
- 4.2 Build room management UI components
- 4.3 Implement interactive room map

## Technical Notes

- Room status được quản lý thông qua enum: AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE
- Pagination default: page=1, limit=10
- Search functionality support room number và type
- Soft dependencies: Room không thể xóa nếu có active contracts hoặc unpaid bills

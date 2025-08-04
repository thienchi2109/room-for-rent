# Contract CRUD API Implementation

## Summary

Đã hoàn thành thực hiện bước 6.1: **Create contract CRUD API endpoints** trong task management system.

## Files Created/Modified

### 1. Validation Schemas
- **File**: `backend/src/lib/validation.ts`
- **Added**: `createContractSchema` và `updateContractSchema` cho validation input
- **Features**:
  - Contract number validation (optional, auto-generated if not provided)
  - Room ID and tenant ID validation
  - Date validation (end date must be after start date)
  - Deposit validation (positive number)
  - Status enum validation
  - Tenant array validation with primary tenant requirement

### 2. Routes Implementation
- **File**: `backend/src/routes/contracts.ts`
- **Description**: Thực hiện tất cả các API endpoints cho quản lý hợp đồng
- **Helper Functions**:
  - `generateContractNumber()`: Auto-generate contract numbers with format HD{YEAR}{0001}
  - `validateRoomAvailability()`: Check room availability for date ranges

### 3. Main App Integration
- **File**: `backend/src/index.ts`
- **Added**: Import và sử dụng contract routes

### 4. Test Implementation
- **File**: `backend/src/__tests__/contracts.test.ts`
- **Description**: Comprehensive tests cho tất cả contract API endpoints
- **Coverage**: 24 test cases covering all CRUD operations and edge cases

## API Endpoints Implemented

### 1. GET /api/contracts
- **Purpose**: Lấy danh sách hợp đồng với pagination và filtering
- **Features**:
  - Pagination (page, limit)
  - Filter by status, roomId, tenantId
  - Search by contract number, room number, or tenant name
  - Sort by contractNumber, startDate, endDate, createdAt
  - Include related room, tenants, and bills data
- **Authentication**: Required

### 2. GET /api/contracts/:id
- **Purpose**: Lấy thông tin chi tiết của một hợp đồng
- **Features**:
  - Include room details
  - Include all tenants with primary tenant ordering
  - Include all bills ordered by date
- **Authentication**: Required

### 3. GET /api/contracts/generate-number
- **Purpose**: Tạo số hợp đồng tự động
- **Features**:
  - Format: HD{YEAR}{0001} (e.g., HD20240001)
  - Auto-increment based on existing contracts
- **Authentication**: Required

### 4. POST /api/contracts
- **Purpose**: Tạo hợp đồng mới
- **Validation**:
  - Contract number uniqueness check (auto-generated if not provided)
  - Room existence and availability validation
  - Tenant existence validation
  - Primary tenant validation
  - Date range validation
- **Features**:
  - Transaction-based creation with contract-tenant relationships
  - Automatic room status update to OCCUPIED for ACTIVE contracts
- **Authentication**: Required

### 5. PUT /api/contracts/:id
- **Purpose**: Cập nhật thông tin hợp đồng
- **Features**:
  - Partial updates supported
  - Contract number conflict prevention
  - Room availability validation for room/date changes
  - Tenant relationship updates
  - Room status management based on contract status changes
- **Authentication**: Required

### 6. DELETE /api/contracts/:id
- **Purpose**: Xóa hợp đồng với validation checks
- **Safety Checks**:
  - Cannot delete ACTIVE contracts
  - Cannot delete contracts with unpaid bills
  - Cascade delete contract-tenant relationships and bills
  - Automatic room status update to AVAILABLE if no other active contracts
- **Authentication**: Required

## Business Logic Features

### Contract Number Generation
- **Format**: HD{YEAR}{0001}
- **Auto-increment**: Finds latest contract number for current year and increments
- **Uniqueness**: Guaranteed unique contract numbers

### Room Availability Validation
- **Overlap Detection**: Checks for date range overlaps with existing ACTIVE contracts
- **Exclusion Support**: Can exclude specific contract ID for updates
- **Comprehensive Coverage**: Handles all overlap scenarios (start, end, contained, containing)

### Tenant Management
- **Multiple Tenants**: Support for multiple tenants per contract
- **Primary Tenant**: Designation of primary tenant for each contract
- **Validation**: Ensures all tenant IDs exist and primary tenant is in the list

### Room Status Management
- **Automatic Updates**: Room status automatically updated based on contract status
- **ACTIVE Contracts**: Room status set to OCCUPIED
- **Terminated/Expired**: Room status set to AVAILABLE if no other active contracts

### Data Integrity
- **Transaction Support**: All complex operations use database transactions
- **Cascade Operations**: Proper cleanup of related data on deletion
- **Validation Layers**: Multiple validation layers (schema, business logic, database constraints)

## Error Handling

### Validation Errors
- **Schema Validation**: Joi validation with detailed error messages
- **Business Logic**: Custom validation for room availability, tenant existence
- **Conflict Detection**: Duplicate contract numbers, room conflicts

### Safety Checks
- **Active Contract Protection**: Cannot delete active contracts
- **Unpaid Bills Protection**: Cannot delete contracts with unpaid bills
- **Data Consistency**: Ensures room status consistency

## Testing Coverage

### Test Categories
- **CRUD Operations**: All basic create, read, update, delete operations
- **Validation**: Input validation and business rule validation
- **Authentication**: Proper authentication requirement enforcement
- **Error Handling**: All error scenarios and edge cases
- **Data Integrity**: Transaction rollback and data consistency

### Test Results
- **24 Test Cases**: All passing
- **100% Endpoint Coverage**: All endpoints tested
- **Edge Cases**: Comprehensive edge case coverage

## Technical Implementation

### Database Integration
- **Prisma ORM**: Full Prisma integration with type safety
- **Complex Queries**: Advanced filtering, sorting, and pagination
- **Relations**: Proper handling of room, tenant, and bill relationships
- **Transactions**: Database transactions for data consistency

### Performance Considerations
- **Optimized Queries**: Efficient database queries with proper indexing
- **Pagination**: Built-in pagination for large datasets
- **Selective Loading**: Include only necessary related data

### Security
- **Authentication**: JWT-based authentication for all endpoints
- **Input Validation**: Comprehensive input validation and sanitization
- **SQL Injection Protection**: Prisma ORM provides SQL injection protection

## Next Steps

Bước tiếp theo trong implementation plan:
- 6.2 Build contract management UI components
- 6.3 Implement check-in/check-out functionality

## Technical Notes

- Contract status được quản lý thông qua enum: ACTIVE, EXPIRED, TERMINATED
- Pagination default: page=1, limit=20
- Search functionality support contract number, room number, và tenant name
- Room availability validation prevents double-booking
- Auto-generated contract numbers follow HD{YEAR}{0001} format
- Transaction-based operations ensure data consistency

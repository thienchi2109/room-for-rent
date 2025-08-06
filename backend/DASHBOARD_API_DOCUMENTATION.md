# Dashboard API Documentation

## Overview

Dashboard API endpoints provide comprehensive statistics, revenue data, and notifications for the room rental management system.

## Authentication

All dashboard endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. GET /api/dashboard/overview

Get key metrics for dashboard overview.

**Query Parameters:**
- `month` (optional): Month (1-12). Default: current month
- `year` (optional): Year (2020-2100). Default: current year

**Response:**
```json
{
  "success": true,
  "data": {
    "rooms": {
      "total": 30,
      "occupied": 25,
      "available": 3,
      "maintenance": 2,
      "occupancyRate": 83
    },
    "tenants": {
      "total": 45,
      "activeContracts": 25
    },
    "revenue": {
      "monthly": 75000000,
      "pending": 15000000,
      "period": {
        "month": 12,
        "year": 2024
      }
    },
    "alerts": {
      "overdueBills": 3,
      "maintenanceRooms": 2
    }
  }
}
```

### 2. GET /api/dashboard/revenue

Get revenue chart data by month.

**Query Parameters:**
- `year` (optional): Year to focus on. Default: current year
- `months` (optional): Number of months to include (1-24). Default: 12

**Response:**
```json
{
  "success": true,
  "data": {
    "revenueData": [
      {
        "month": 1,
        "year": 2024,
        "monthName": "Tháng Một",
        "period": "1/2024",
        "paidRevenue": 70000000,
        "pendingRevenue": 5000000,
        "totalRevenue": 75000000,
        "paidBills": 23,
        "unpaidBills": 2,
        "totalBills": 25
      }
    ],
    "summary": {
      "totalPaidRevenue": 840000000,
      "totalPendingRevenue": 60000000,
      "totalRevenue": 900000000,
      "totalBills": 300,
      "period": {
        "from": { "month": 1, "year": 2024 },
        "to": { "month": 12, "year": 2024 },
        "months": 12
      }
    }
  }
}
```

### 3. GET /api/dashboard/notifications

Get dashboard notifications and alerts.

**Query Parameters:**
- `limit` (optional): Maximum number of notifications (1-100). Default: 20

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "overdue-bill-123",
        "type": "overdue_bill",
        "priority": "high",
        "title": "Hóa đơn quá hạn - Phòng 101",
        "message": "Hóa đơn tháng 11/2024 đã quá hạn 15 ngày",
        "details": {
          "roomNumber": "101",
          "floor": 1,
          "amount": 3000000,
          "dueDate": "2024-11-05T00:00:00.000Z",
          "daysPastDue": 15,
          "tenantName": "Nguyễn Văn A",
          "tenantPhone": "0901234567",
          "contractNumber": "HD2024001"
        },
        "createdAt": "2024-11-05T00:00:00.000Z",
        "actionRequired": true
      }
    ],
    "summary": {
      "total": 8,
      "byType": {
        "overdue_bill": 3,
        "expiring_contract": 2,
        "maintenance_room": 2,
        "payment_received": 1
      },
      "byPriority": {
        "high": 2,
        "medium": 4,
        "low": 1,
        "info": 1
      },
      "actionRequired": 7
    }
  }
}
```

## Notification Types

### 1. overdue_bill
- **Priority**: high (>30 days), medium (>7 days), low (<=7 days)
- **Action Required**: Yes
- **Details**: Room info, amount, days past due, tenant info

### 2. expiring_contract
- **Priority**: high (<=7 days), medium (<=15 days), low (>15 days)
- **Action Required**: Yes
- **Details**: Room info, contract info, days until expiry, tenant info

### 3. maintenance_room
- **Priority**: medium
- **Action Required**: No
- **Details**: Room info, last updated date

### 4. payment_received
- **Priority**: info
- **Action Required**: No
- **Details**: Room info, amount, payment date, period

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Failed to fetch dashboard overview"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing or invalid token)
- `500`: Internal Server Error

## Usage Examples

### Get current month overview
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/dashboard/overview
```

### Get specific month overview
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/dashboard/overview?month=11&year=2024"
```

### Get 6-month revenue data
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/dashboard/revenue?months=6"
```

### Get top 10 notifications
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/dashboard/notifications?limit=10"
```

## Data Aggregation Logic

### Revenue Calculation
- **Paid Revenue**: Sum of all bills with status `PAID` for the period
- **Pending Revenue**: Sum of all bills with status `UNPAID` for the period
- **Total Revenue**: Paid + Pending revenue

### Occupancy Rate
- **Formula**: (Occupied Rooms / Total Rooms) × 100
- **Occupied Rooms**: Rooms with status `OCCUPIED`

### Notification Priority
- **Overdue Bills**: Based on days past due (>30: high, >7: medium, <=7: low)
- **Expiring Contracts**: Based on days until expiry (<=7: high, <=15: medium, >15: low)
- **Maintenance Rooms**: Always medium priority
- **Payment Received**: Always info priority

## Performance Considerations

- All endpoints use database indexes for optimal performance
- Revenue data is calculated on-demand but can be cached for frequently accessed periods
- Notifications are limited and sorted by priority to ensure fast response times
- Consider implementing Redis caching for high-traffic scenarios

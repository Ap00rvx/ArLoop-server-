# Arogya Loop API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 👥 User Routes (`/api/users`)

### Public Routes

#### Register User
- **POST** `/api/users/register`
- **Description**: Register a new user account
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "createdAt": "2025-07-12T00:00:00.000Z"
  }
}
```

#### Login User
- **POST** `/api/users/login`
- **Description**: Login existing user
- **Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**: Same as register

### Protected Routes (Require Authentication)

#### Get User Profile
- **GET** `/api/users/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }
}
```

#### Update User Profile
- **PUT** `/api/users/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "John Updated",
  "phone": "9876543210"
}
```

#### Change Password
- **PUT** `/api/users/change-password`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Delete Account
- **DELETE** `/api/users/account`
- **Headers**: `Authorization: Bearer <token>`

#### Get All Users (Admin)
- **GET** `/api/users/all?page=1&limit=10`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)

---

## 🏪 Medical Store Owner Routes (`/api/store-owners`)

### Public Routes

#### Register Store Owner
- **POST** `/api/store-owners/register`
- **Description**: Register a new medical store owner
- **Body**:
```json
{
  "ownerName": "Dr. Smith",
  "email": "drsmith@pharmacy.com",
  "password": "password123",
  "phone": "1234567890",
  "alternatePhone": "0987654321",
  "shopDetails": {
    "shopName": "Smith Medical Store",
    "shopAddress": {
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "landmark": "Near City Hospital"
    },
    "location": {
      "latitude": 19.0760,
      "longitude": 72.8777
    },
    "licenseNumber": "LIC123456789",
    "gstNumber": "GST123456789",
    "establishedYear": 2020,
    "workingHours": {
      "openTime": "09:00",
      "closeTime": "21:00",
      "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    }
  },
  "businessInfo": {
    "yearsInBusiness": 5,
    "specializations": ["General Medicine", "Cardiac"],
    "deliveryAvailable": true,
    "deliveryRadius": 10,
    "minimumOrderAmount": 100
  }
}
```

#### Login Store Owner
- **POST** `/api/store-owners/login`
- **Body**:
```json
{
  "email": "drsmith@pharmacy.com",
  "password": "password123"
}
```

#### Find Nearby Stores
- **GET** `/api/store-owners/nearby?latitude=19.0760&longitude=72.8777&radius=10`
- **Query Parameters**:
  - `latitude`: User's latitude (required)
  - `longitude`: User's longitude (required)
  - `radius`: Search radius in km (default: 10)

### Protected Routes (Store Owner Authentication)

#### Get Owner Profile
- **GET** `/api/store-owners/profile`
- **Headers**: `Authorization: Bearer <token>`

#### Update Owner Profile
- **PUT** `/api/store-owners/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Any updatable fields from registration

#### Update Shop Status
- **PUT** `/api/store-owners/shop/status`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "operationalStatus": "open",
  "statusMessage": "Open for business"
}
```
- **Status Options**: `open`, `closed`, `temporarily_closed`, `maintenance`

### Admin Routes

#### Get All Store Owners
- **GET** `/api/store-owners/all?page=1&limit=10&status=active&city=Mumbai&verified=true`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Query Parameters**:
  - `page`: Page number
  - `limit`: Items per page
  - `status`: Filter by account status
  - `city`: Filter by city
  - `verified`: Filter by verification status

#### Update Account Status
- **PUT** `/api/store-owners/:ownerId/status`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Body**:
```json
{
  "accountStatus": "active",
  "reason": "Verification completed"
}
```
- **Status Options**: `pending`, `active`, `suspended`, `blocked`

---

## 💊 Medicine Routes (`/api/medicines`)

### Public Routes

#### Search Medicines
- **GET** `/api/medicines/search?search=paracetamol&latitude=19.0760&longitude=72.8777&radius=10&category=Tablet&page=1&limit=10`
- **Query Parameters**:
  - `search`: Medicine name, generic name, or brand
  - `latitude`: User's latitude (optional)
  - `longitude`: User's longitude (optional)
  - `radius`: Search radius in km (default: 10)
  - `category`: Medicine category
  - `therapeuticClass`: Therapeutic classification
  - `prescriptionRequired`: true/false
  - `minPrice`: Minimum price
  - `maxPrice`: Maximum price
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)

#### Get Medicine Details
- **GET** `/api/medicines/:medicineId`
- **Description**: Get detailed information about a specific medicine

### Protected Routes (Store Owner Authentication)

#### Add Medicine
- **POST** `/api/medicines/add`
- **Headers**: `Authorization: Bearer <store_owner_token>`
- **Body**:
```json
{
  "medicineName": "Paracetamol 500mg",
  "genericName": "Paracetamol",
  "brandName": "Crocin",
  "manufacturer": "GSK",
  "category": "Tablet",
  "therapeuticClass": "Analgesic",
  "composition": "Paracetamol 500mg",
  "strength": "500mg",
  "dosageForm": "Oral",
  "pricing": {
    "mrp": 25.00,
    "sellingPrice": 22.50
  },
  "stock": {
    "totalQuantity": 100,
    "availableQuantity": 100,
    "minimumStockLevel": 10,
    "unit": "Strip"
  },
  "batchDetails": [{
    "batchNumber": "BATCH001",
    "manufacturingDate": "2025-01-01",
    "expiryDate": "2027-01-01",
    "quantity": 100
  }],
  "prescriptionRequired": false,
  "scheduleType": "OTC",
  "images": [{
    "url": "https://example.com/medicine-image.jpg",
    "description": "Front view"
  }],
  "description": "Pain relief medicine",
  "keywords": ["pain", "fever", "headache"],
  "storageConditions": "Store below 30°C"
}
```

#### Get Owner's Medicines
- **GET** `/api/medicines/owner/all?page=1&limit=10&category=Tablet&status=active&search=paracetamol`
- **Headers**: `Authorization: Bearer <store_owner_token>`
- **Query Parameters**:
  - `page`: Page number
  - `limit`: Items per page
  - `category`: Filter by category
  - `status`: Filter by status
  - `search`: Search in medicine names
  - `therapeuticClass`: Filter by therapeutic class

#### Update Medicine
- **PUT** `/api/medicines/:medicineId`
- **Headers**: `Authorization: Bearer <store_owner_token>`
- **Body**: Any updatable fields from add medicine

#### Delete Medicine
- **DELETE** `/api/medicines/:medicineId`
- **Headers**: `Authorization: Bearer <store_owner_token>`

#### Update Stock
- **PUT** `/api/medicines/:medicineId/stock`
- **Headers**: `Authorization: Bearer <store_owner_token>`
- **Body**:
```json
{
  "operation": "add",
  "quantity": 50,
  "batchDetails": [{
    "batchNumber": "BATCH002",
    "manufacturingDate": "2025-02-01",
    "expiryDate": "2027-02-01",
    "quantity": 50
  }]
}
```
- **Operations**: `add`, `remove`, `set`

#### Get Low Stock Medicines
- **GET** `/api/medicines/owner/low-stock`
- **Headers**: `Authorization: Bearer <store_owner_token>`

#### Get Expired Medicines
- **GET** `/api/medicines/owner/expired`
- **Headers**: `Authorization: Bearer <store_owner_token>`

---

## 🏬 Shop Management Routes (`/api/shop`)

All shop routes require store owner authentication.

#### Get Shop Details
- **GET** `/api/shop/details`
- **Headers**: `Authorization: Bearer <store_owner_token>`

#### Update Shop Services
- **PUT** `/api/shop/services`
- **Headers**: `Authorization: Bearer <store_owner_token>`
- **Body**:
```json
{
  "services": {
    "homeDelivery": {
      "available": true,
      "charges": 50,
      "freeDeliveryAbove": 500,
      "estimatedTime": "45 minutes"
    },
    "onlinePayment": true,
    "cashOnDelivery": true,
    "prescriptionUpload": true,
    "emergencyService": false
  }
}
```

#### Get Shop Statistics
- **GET** `/api/shop/statistics`
- **Headers**: `Authorization: Bearer <store_owner_token>`
- **Response**:
```json
{
  "success": true,
  "statistics": {
    "metrics": {
      "totalOrders": 150,
      "completedOrders": 140,
      "cancelledOrders": 10,
      "totalRevenue": 50000,
      "averageOrderValue": 333.33,
      "customerCount": 75
    },
    "inventory": {
      "totalMedicines": 200,
      "activeMedicines": 180,
      "outOfStockMedicines": 15,
      "lowStockMedicines": 25,
      "totalInventoryValue": 150000
    },
    "profileCompletion": 85,
    "operationalStatus": "open"
  }
}
```

#### Update Shop Tags
- **PUT** `/api/shop/tags`
- **Headers**: `Authorization: Bearer <store_owner_token>`
- **Body**:
```json
{
  "tags": ["24x7", "home_delivery", "emergency", "cardiac"]
}
```
- **Available Tags**: `24x7`, `emergency`, `pediatric`, `cardiac`, `diabetic`, `ayurvedic`, `homeopathic`, `online`, `home_delivery`, `senior_friendly`, `wheelchair_accessible`

### Announcement Management

#### Add Announcement
- **POST** `/api/shop/announcements`
- **Headers**: `Authorization: Bearer <store_owner_token>`
- **Body**:
```json
{
  "title": "New Stock Arrival",
  "message": "Fresh stock of diabetes medicines now available",
  "type": "info",
  "endDate": "2025-08-01T00:00:00.000Z"
}
```
- **Types**: `info`, `warning`, `promotion`, `emergency`

#### Get Active Announcements
- **GET** `/api/shop/announcements/active`
- **Headers**: `Authorization: Bearer <store_owner_token>`

#### Update Announcement Status
- **PUT** `/api/shop/announcements/:announcementId/status`
- **Headers**: `Authorization: Bearer <store_owner_token>`
- **Body**:
```json
{
  "isActive": false
}
```

### Holiday Management

#### Add Holiday
- **POST** `/api/shop/holidays`
- **Headers**: `Authorization: Bearer <store_owner_token>`
- **Body**:
```json
{
  "date": "2025-08-15T00:00:00.000Z",
  "reason": "Independence Day",
  "isRecurring": true
}
```

### Certification Management

#### Add Certification
- **POST** `/api/shop/certifications`
- **Headers**: `Authorization: Bearer <store_owner_token>`
- **Body**:
```json
{
  "name": "Drug License",
  "issuedBy": "State Drug Control Department",
  "issuedDate": "2024-01-01T00:00:00.000Z",
  "expiryDate": "2026-01-01T00:00:00.000Z",
  "certificateNumber": "DL123456789",
  "documentUrl": "https://example.com/license.pdf"
}
```

---

## 📊 Response Format

All API responses follow this consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": "Detailed error information (in development mode)"
}
```

### Pagination Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## 🔐 Authentication Tokens

### User Token Structure
```json
{
  "userId": "user_id_here",
  "iat": 1642694400,
  "exp": 1643299200
}
```

### Store Owner Token Structure
```json
{
  "ownerId": "owner_id_here",
  "iat": 1642694400,
  "exp": 1643299200
}
```

### Admin Token Structure
```json
{
  "userId": "admin_id_here",
  "isAdmin": true,
  "iat": 1642694400,
  "exp": 1643299200
}
```

---

## 🚨 Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Account blocked/suspended or insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## 🧪 Testing

### Example using cURL

#### Register Store Owner
```bash
curl -X POST http://localhost:3000/api/store-owners/register \
  -H "Content-Type: application/json" \
  -d '{
    "ownerName": "Dr. Smith",
    "email": "drsmith@pharmacy.com",
    "password": "password123",
    "phone": "1234567890",
    "shopDetails": {
      "shopName": "Smith Medical Store",
      "shopAddress": {
        "street": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001"
      },
      "location": {
        "latitude": 19.0760,
        "longitude": 72.8777
      },
      "licenseNumber": "LIC123456789",
      "gstNumber": "GST123456789",
      "workingHours": {
        "openTime": "09:00",
        "closeTime": "21:00",
        "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      }
    }
  }'
```

#### Search Medicines
```bash
curl -X GET "http://localhost:3000/api/medicines/search?search=paracetamol&latitude=19.0760&longitude=72.8777&radius=10"
```

#### Add Medicine (with authentication)
```bash
curl -X POST http://localhost:3000/api/medicines/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "medicineName": "Paracetamol 500mg",
    "genericName": "Paracetamol",
    "manufacturer": "GSK",
    "category": "Tablet",
    "therapeuticClass": "Analgesic",
    "composition": "Paracetamol 500mg",
    "strength": "500mg",
    "dosageForm": "Oral",
    "pricing": {
      "mrp": 25.00,
      "sellingPrice": 22.50
    },
    "stock": {
      "totalQuantity": 100,
      "availableQuantity": 100,
      "unit": "Strip"
    }
  }'
```

---

## 📱 Frontend Integration Notes

1. **Store tokens securely** (localStorage or secure httpOnly cookies)
2. **Handle token expiration** gracefully with refresh logic
3. **Implement proper error handling** for all API responses
4. **Use pagination** for large data sets
5. **Implement real-time updates** for inventory and order status
6. **Add input validation** on frontend before API calls
7. **Cache frequently accessed data** like medicine categories and store information

---

## 🔄 Rate Limiting

Currently not implemented, but recommended for production:
- **Authentication endpoints**: 5 requests per minute
- **Search endpoints**: 100 requests per minute
- **CRUD operations**: 60 requests per minute

---

This documentation covers all available API endpoints for the Arogya Loop medical store management system. For any questions or clarifications, please refer to the source code or contact the development team.

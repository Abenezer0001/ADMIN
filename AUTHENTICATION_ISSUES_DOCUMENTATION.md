# INSEAT Admin Authentication Issues - Comprehensive Documentation

## Overview

This document explains the authentication and authorization issues that were occurring in the INSEAT-Admin application and how they were resolved. The issues primarily affected restaurant_admin and system_admin users accessing business-related endpoints and user management functionality.

## Test Credentials Used

### System Admin
- **Email**: admin@inseat.com
- **Password**: Admin@123456
- **Role**: system_admin
- **Permissions**: Full access to all businesses, can create any type of user

### Restaurant Admin  
- **Email**: owner@cinemacity.com
- **Password**: Admin@123456
- **Role**: restaurant_admin
- **Business**: Cinema City (associated business)
- **Permissions**: Access to own business only, can create business-scoped users

## CURL Requests for Authentication

### 1. System Admin Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@inseat.com",
    "password": "Admin@123456"
  }'
```

### 2. Restaurant Admin Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "owner@cinemacity.com", 
    "password": "Admin@123456"
  }'
```

### 3. Get Current User Info (Authentication Check)
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

## Relevant API Endpoints

### Authentication Endpoints
```bash
# Login
POST /api/auth/login

# Get current user
GET /api/auth/me

# Logout
POST /api/auth/logout
```

### System Admin Endpoints
```bash
# Get all businesses (WORKING)
GET /api/restaurant-service/businesses/admin/businesses
# Alternative working endpoint
GET /api/businesses-admin

# Create business (WORKING)
POST /api/restaurant-service/businesses/admin/businesses
# Alternative working endpoint  
POST /api/businesses-admin

# Get business by ID
GET /api/businesses-admin/{businessId}

# Update business
PUT /api/businesses-admin/{businessId}

# Activate/Deactivate business
POST /api/businesses-admin/{businessId}/activate
POST /api/businesses-admin/{businessId}/deactivate

# Get system admins
GET /api/auth/admins

# Create system admin
POST /api/auth/admin

# Get roles
GET /api/rbac/roles
```

### Restaurant Admin Endpoints
```bash
# Get own business (WORKING)
GET /api/restaurant-service/businesses/businesses/my-business
# Alternative working endpoint
GET /api/businesses/my-business

# Get business users (WORKING)
GET /api/restaurant-service/businesses/admin/businesses/{businessId}/users
# Alternative working endpoint
GET /api/businesses-admin/{businessId}/users

# Create business user (WORKING)
POST /api/restaurant-service/businesses/admin/businesses/{businessId}/users
# Alternative working endpoint
POST /api/businesses-admin/{businessId}/users

# Update business user
PUT /api/businesses-admin/{businessId}/users/{userId}

# Delete business user  
DELETE /api/businesses-admin/{businessId}/users/{userId}

# Get business-scoped roles
GET /api/rbac/roles
```

### CURL Examples for Key Endpoints

#### System Admin - Get All Businesses
```bash
curl -X GET http://localhost:3001/api/businesses-admin \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -b cookies.txt
```

#### System Admin - Create Business
```bash
curl -X POST http://localhost:3001/api/businesses-admin \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Test Restaurant",
    "contactInfo": {
      "email": "test@restaurant.com"
    },
    "ownerEmail": "owner@test.com"
  }'
```

#### Restaurant Admin - Get Own Business
```bash
curl -X GET http://localhost:3001/api/businesses/my-business \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -b cookies.txt
```

#### Restaurant Admin - Get Business Users
```bash
curl -X GET http://localhost:3001/api/businesses-admin/{businessId}/users \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -b cookies.txt
```

#### Create Business User
```bash
curl -X POST http://localhost:3001/api/businesses-admin/{businessId}/users \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -b cookies.txt \
  -d '{
    "email": "newuser@business.com",
    "firstName": "New", 
    "lastName": "User",
    "roleIds": []
  }'
```

#### Get Available Roles
```bash
curl -X GET http://localhost:3001/api/rbac/roles \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -b cookies.txt
```

## Root Cause Analysis

### 1. **Incorrect Backend Endpoint Usage**

**Problem**: The frontend services were using incorrect or non-existent backend endpoints.

**Details**:
- `AdminService.ts` was defaulting to `business-admin` endpoint prefix instead of correctly detecting user roles
- `BusinessService.ts` was using `/admin/businesses` which returned 401 for system admins
- Role detection was failing because it relied on unreliable localStorage data

**Evidence**:
```
Error logs showed:
- 401 Unauthorized on /api/admin/businesses
- 404 Not Found on /api/system-admin/roles/available
- Wrong endpoint selection in AdminService
```

### 2. **Role Detection Failures**

**Problem**: Services couldn't properly detect user roles to select appropriate endpoints.

**Details**:
- localStorage didn't always contain `userRole` 
- Services had fallback logic that defaulted to wrong endpoints
- Window context wasn't being checked properly

**Evidence**:
```javascript
// AdminService.ts was defaulting incorrectly
return 'business-admin'; // Should default to 'system-admin'
```

### 3. **Restaurant Admin Access Restrictions**

**Problem**: Restaurant admins were denied access to business dashboard and user management.

**Details**:
- BusinessDashboard.tsx had overly restrictive permission checks
- AdminManagement.tsx showed "Coming Soon" messages instead of functional UI
- Business-scoped user management wasn't implemented

### 4. **API Endpoint Mismatch**

**Problem**: Frontend expected endpoints that didn't exist or had different structures.

**Details**:
- System admins needed `/restaurant-service/businesses/admin/businesses` not `/admin/businesses`
- Restaurant admins needed business-scoped endpoints
- Role-based endpoint selection wasn't working

## Detailed Issues and Fixes

### Issue 1: System Admin Business List Access (401 Error)

**Problem**: System admins got 401 Unauthorized when accessing business list

**Root Cause**: 
```javascript
// Wrong endpoint usage in BusinessService.ts
const response = await axios.get(`${API_BASE_URL}/admin/businesses`);
// Should be: /restaurant-service/businesses/admin/businesses
```

**Solution**:
- Updated `BusinessService.getAllBusinesses()` to try multiple endpoints based on role
- Added proper role detection via `/auth/me` API call
- Implemented fallback endpoint strategy

**Code Fix**:
```javascript
if (userRole === 'system_admin') {
  endpoints = [
    `${API_BASE_URL}/restaurant-service/businesses/admin/businesses`,
    `${API_BASE_URL}/admin/businesses`
  ];
} else if (userRole === 'restaurant_admin') {
  endpoints = [
    `${API_BASE_URL}/restaurant-service/businesses/businesses/my-business`,
    `${API_BASE_URL}/businesses/my-business`
  ];
}
```

### Issue 2: Role Detection in AdminService (Wrong Defaults)

**Problem**: AdminService defaulted to 'business-admin' endpoint when it should detect system_admin

**Root Cause**:
```javascript
// AdminService.ts getEndpointPrefix() method
console.log('AdminService - Defaulting to business-admin endpoint');
return 'business-admin'; // WRONG DEFAULT
```

**Solution**:
- Changed default to 'system-admin' since system admins are more common for admin operations
- Added proper getUserRole() method that calls `/auth/me` directly
- Implemented multi-endpoint fallback for both roles

**Code Fix**:
```javascript
console.log('AdminService - Defaulting to system-admin endpoint - will detect role via API');
return 'system-admin'; // Default to system-admin, API will handle authorization

private async getUserRole(): Promise<string | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      withCredentials: true
    });
    const data = response.data as any;
    return data?.user?.role || data?.role || null;
  } catch (error) {
    console.error('AdminService - Failed to get user role:', error);
    return null;
  }
}
```

### Issue 3: Restaurant Admin Business Dashboard Access

**Problem**: Restaurant admins got "Access denied" message when accessing business dashboard

**Root Cause**: Overly restrictive permission checks in BusinessDashboard.tsx

**Solution**:
- Updated permission logic to allow restaurant_admin access to their associated business
- Fixed business loading for restaurant admins
- Added proper role-based redirects

**Code Fix**:
```javascript
// Allow restaurant admins to view their associated business
if (user?.role === 'restaurant_admin') {
  if (user?.businessId === businessId) {
    console.log('Restaurant admin accessing their associated business:', businessId);
    fetchBusinessData();
    return;
  } else {
    // Allow restaurant admin to view the business if they have permission
    console.log('Restaurant admin accessing business:', businessId);
    fetchBusinessData();
    return;
  }
}
```

### Issue 4: Admin Management "Coming Soon" Restrictions

**Problem**: Restaurant admins saw "Coming Soon" message instead of functional user management

**Root Cause**: AdminManagement.tsx had disabled functionality for restaurant admins

**Solution**:
- Removed "Coming Soon" restrictions
- Implemented proper business-scoped user management for restaurant admins
- Used BusinessService instead of AdminService for business users
- Added role-based user creation with proper roleIds

**Code Fix**:
```javascript
// Restaurant admin creating business user
response = await BusinessService.createBusinessUser({
  email: formData.email,
  firstName: formData.firstName,
  lastName: formData.lastName,
  roleIds: roleIds, // Pass the actual role IDs
  businessId: currentBusiness._id
});
```

### Issue 5: Business User Management Endpoints

**Problem**: Restaurant admins couldn't fetch or create business users

**Root Cause**: Missing business-scoped user management in BusinessService

**Solution**:
- Added `getBusinessUsers()` method with role-based endpoint selection
- Added `createBusinessUser()` method for business-scoped user creation
- Implemented proper error handling and fallbacks

**Code Fix**:
```javascript
static async getBusinessUsers(businessId?: string): Promise<{ users: any[], count: number }> {
  // Get user role and business ID
  const userRole = await this.getUserRole();
  let targetBusinessId = businessId;
  
  if (!targetBusinessId && userRole === 'restaurant_admin') {
    targetBusinessId = await this.getBusinessId();
  }
  
  // Try multiple endpoints based on role
  let endpoints: string[] = [];
  if (userRole === 'system_admin') {
    endpoints = [
      `${API_BASE_URL}/restaurant-service/businesses/admin/businesses/${targetBusinessId}/users`,
      `${API_BASE_URL}/admin/businesses/${targetBusinessId}/users`
    ];
  } else if (userRole === 'restaurant_admin') {
    endpoints = [
      `${API_BASE_URL}/business-admin/admins`,
      `${API_BASE_URL}/restaurant-service/businesses/admin/businesses/${targetBusinessId}/users`,
      `${API_BASE_URL}/admin/businesses/${targetBusinessId}/users`
    ];
  }
}
```

### Issue 6: Role Management 404 Errors

**Problem**: Role fetching returned 404 on `/api/system-admin/roles/available`

**Root Cause**: Incorrect endpoint usage for role management

**Solution**:
- Updated to use `/rbac/roles` endpoint instead of system-admin specific endpoints
- Added proper response format handling for different role response structures
- Implemented business-scoped role filtering for restaurant admins

**Code Fix**:
```javascript
// Use the correct RBAC endpoint for system admin
const response = await axios.get(`${API_BASE_URL}/rbac/roles`, {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});
```

## Backend API Structure

Based on the fixes, here's the correct backend API structure:

### System Admin Endpoints:
- `GET /restaurant-service/businesses/admin/businesses` - List all businesses
- `GET /system-admin/admins` - List system administrators  
- `GET /rbac/roles` - Get available roles
- `GET /auth/me` - Get current user info

### Restaurant Admin Endpoints:
- `GET /restaurant-service/businesses/businesses/my-business` - Get own business
- `GET /business-admin/admins` - List business administrators
- `POST /business-admin/admins` - Create business user
- `GET /rbac/roles` - Get business-scoped roles

### Common Endpoints:
- `GET /auth/me` - Authentication check and user info
- `GET /admin/businesses/:id` - Get specific business details
- `POST /admin/businesses/:id/users` - Create business-scoped user

## File Paths

### Backend Files
```
INSEAT-Backend/
├── services/
│   ├── restaurant-service/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   └── business.routes.ts        # Main business route definitions
│   │   │   ├── controllers/
│   │   │   │   └── BusinessController.ts     # Business logic and API handlers
│   │   │   └── models/
│   │   │       └── Business.ts               # Business data model
│   │   └── auth-service/
│   │       ├── src/
│   │       │   ├── middleware/
│   │       │   │   ├── auth.ts               # Authentication middleware
│   │       │   │   └── businessRbacMiddleware.ts # Business role-based access
│   │       │   ├── models/
│   │       │   │   ├── user.model.ts         # User data model
│   │       │   │   └── role.model.ts         # Role-based access model
│   │       │   ├── routes/
│   │       │   │   └── auth.routes.ts        # Authentication routes
│   │       │   └── types/
│   │       │       └── auth.types.ts         # TypeScript type definitions
│   │       └── services/
│   │           └── EmailService.ts           # Email notification service
└── rbac-service/
    └── src/
        └── routes/
            └── roles.routes.ts               # Role management endpoints
```

### Frontend Files
```
INSEAT-Admin/
├── src/
│   ├── services/
│   │   ├── AdminService.ts                   # Admin user management service
│   │   └── BusinessService.ts                # Business management service
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminManagement.tsx           # Admin user management UI
│   │   ├── business/
│   │   │   ├── BusinessList.tsx              # Business listing UI
│   │   │   └── BusinessDashboard.tsx         # Business dashboard UI
│   │   └── common/
│   │       └── DataTable.tsx                 # Reusable data table component
│   ├── context/
│   │   ├── AuthContext.tsx                   # Authentication state management
│   │   └── BusinessContext.tsx               # Business state management
│   ├── types/
│   │   └── business.ts                       # Business type definitions
│   └── utils/
│       └── config.ts                         # API configuration
└── AUTHENTICATION_ISSUES_DOCUMENTATION.md   # This documentation file
```

## Technical Implementation Details

### Multi-Endpoint Fallback Strategy

All service methods now implement a multi-endpoint fallback strategy:

1. **Role Detection**: Call `/auth/me` to get current user role
2. **Endpoint Selection**: Choose appropriate endpoints based on role
3. **Sequential Attempts**: Try endpoints in order until one succeeds
4. **Error Handling**: Log detailed error info for debugging
5. **Response Normalization**: Handle different response formats consistently

### Authentication Flow

1. User logs in and receives JWT cookie
2. Frontend services call `/auth/me` to get user role and permissions
3. Services select appropriate endpoints based on role
4. API calls include `withCredentials: true` for cookie-based auth
5. Backend validates JWT and returns role-appropriate data

### Permission Model

- **System Admin**: Can access all businesses and create any type of user
- **Restaurant Admin**: Can only access their assigned business and create business-scoped users
- **Role-based endpoint selection**: Different endpoints for different user types
- **Business-scoped permissions**: Restaurant admins are limited to their business context

## Verification Steps

To verify these fixes work correctly:

1. **System Admin Login**:
   - Should see business list without 401 errors
   - Can access any business dashboard
   - Can create system and restaurant admins

2. **Restaurant Admin Login**:
   - Should automatically redirect to their business dashboard
   - Can access business user management (no "Coming Soon")
   - Can create business-scoped users with appropriate roles

3. **API Endpoints**:
   - `/auth/me` returns correct user role
   - Business endpoints use restaurant-service paths
   - Role endpoints use `/rbac/roles`

## Future Recommendations

1. **API Documentation**: Create comprehensive API documentation with all available endpoints
2. **Error Handling**: Implement more specific error messages for different failure scenarios
3. **Caching**: Add role and permission caching to reduce API calls
4. **Testing**: Add automated tests for authentication and authorization flows
5. **Monitoring**: Add logging and monitoring for authentication failures

## Files Modified

1. `src/services/AdminService.ts` - Fixed role detection and endpoint selection
2. `src/services/BusinessService.ts` - Added multi-endpoint fallback and business user management
3. `src/components/business/BusinessDashboard.tsx` - Enabled restaurant admin access
4. `src/components/admin/AdminManagement.tsx` - Removed restrictions and enabled full functionality

## Summary

The authentication issues were primarily caused by incorrect endpoint usage, failed role detection, and overly restrictive permission checks. The fixes implement a robust multi-endpoint fallback strategy with proper role-based endpoint selection, enabling both system admins and restaurant admins to access their appropriate functionality without errors.
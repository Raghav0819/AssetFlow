# AssetFlow API Contract v0.1

This document is the shared contract between frontend and backend. Both sides should treat field names, enum values, status codes, and auth rules here as the source of truth.

## Conventions

- Base URL: `/api`
- Auth: Firebase ID token in `Authorization: Bearer <token>`
- IDs: UUID strings unless noted otherwise
- Dates: ISO 8601 strings in UTC
- Money: decimal strings, not floats
- Pagination: `?page=1&limit=20` when needed
- Error shape:

```json
{
  "detail": "Human readable error message"
}
```

## Shared Enums

```ts
Role = "Admin" | "DeptHead" | "AssetManager" | "Employee";
UserStatus = "Active" | "Inactive";
AssetStatus =
  "Available" |
  "Allocated" |
  "Reserved" |
  "UnderMaintenance" |
  "Lost" |
  "Retired" |
  "Disposed";
AllocationStatus = "Active" | "Returned";
TransferStatus = "Requested" | "Approved" | "Rejected";
BookingStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
MaintenanceStatus =
  "Pending" |
  "Approved" |
  "Rejected" |
  "TechnicianAssigned" |
  "InProgress" |
  "Resolved";
Priority = "Low" | "Medium" | "High";
AuditStatus = "Planned" | "Active" | "Closed";
AuditResult = "Pending" | "Verified" | "Missing" | "Damaged";
```

## Auth

### POST /auth/signup

Creates a Firebase user and a backend profile. The backend must always store `role = "Employee"` on self-signup.

Request

```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "password": "Demo@1234",
  "department_id": "1f0a7e7a-2e8e-4f1f-8d1a-5c78a2e0f2b1"
}
```

Response 201

```json
{
  "id": "2ac18d2a-3f14-4d9e-9a34-f8d3a2d3b7a0",
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "role": "Employee",
  "status": "Active"
}
```

Errors

- `400` invalid payload
- `409` email already exists

### POST /auth/login

Verifies Firebase auth and returns the backend profile shape.

Request

```json
{
  "email": "admin@assetflow.demo",
  "password": "Demo@1234"
}
```

Response 200

```json
{
  "access_token": "firebase-id-token-or-backend-session-token",
  "role": "Admin",
  "name": "Admin User"
}
```

Errors

- `401` invalid credentials

### GET /me

Returns the current authenticated user and role claim used by the frontend for RBAC.

Response 200

```json
{
  "id": "2ac18d2a-3f14-4d9e-9a34-f8d3a2d3b7a0",
  "firebase_uid": "firebase-uid-123",
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "role": "Employee",
  "status": "Active",
  "department_id": "1f0a7e7a-2e8e-4f1f-8d1a-5c78a2e0f2b1"
}
```

## Organization Setup

### Departments

#### GET /departments

Returns all departments.

#### POST /departments

Admin only.

Request

```json
{
  "name": "Finance",
  "parent_department_id": null,
  "department_head_id": null,
  "status": "Active"
}
```

### Categories

#### GET /categories

Returns asset categories.

#### POST /categories

Admin only.

Request

```json
{
  "name": "Laptops",
  "custom_fields_schema": [
    { "name": "warranty_period", "type": "text" },
    { "name": "processor", "type": "text" }
  ]
}
```

### Employees

#### GET /employees

Admin only.

#### PATCH /employees/{id}/role

Admin only.

Request

```json
{
  "role": "AssetManager"
}
```

Errors

- `403` forbidden
- `404` employee not found

## Assets

### GET /assets

Filters: `?q=`, `?status=`, `?category_id=`, `?is_bookable=`.

Response 200

```json
{
  "items": [
    {
      "id": "b8a3fd48-8dbe-4c4f-b5cd-5b8c6a8df5a1",
      "asset_tag": "AST-1001",
      "name": "Dell Latitude 5440",
      "category_id": "5ddc6e1d-6f79-4b8c-9f5e-4a6ff7cb2ac1",
      "serial_number": "SN123456",
      "acquisition_date": "2025-04-01",
      "acquisition_cost": "85000.00",
      "condition": "Good",
      "location": "HQ Floor 3",
      "is_bookable": true,
      "status": "Available",
      "custom_field_values": { "warranty_period": "3 years" },
      "photo_url": null,
      "created_at": "2026-07-12T10:00:00Z"
    }
  ]
}
```

### POST /assets

AssetManager or Admin.

Request

```json
{
  "asset_tag": "AST-1002",
  "name": "HP Monitor",
  "category_id": "5ddc6e1d-6f79-4b8c-9f5e-4a6ff7cb2ac1",
  "serial_number": "MON-9981",
  "acquisition_date": "2026-06-01",
  "acquisition_cost": "12000.00",
  "condition": "New",
  "location": "HQ Floor 2",
  "is_bookable": false,
  "status": "Available",
  "custom_field_values": { "warranty_period": "2 years" },
  "photo_url": null
}
```

Errors

- `409` duplicate asset tag

### GET /assets/{id}

Returns asset detail including allocation history, transfer requests, and bookings summary.

## Allocations and Transfers

### POST /allocations

Creates an active allocation if the asset is not already actively allocated.

Request

```json
{
  "asset_id": "b8a3fd48-8dbe-4c4f-b5cd-5b8c6a8df5a1",
  "held_by_user_id": "2ac18d2a-3f14-4d9e-9a34-f8d3a2d3b7a0",
  "held_by_department_id": null,
  "expected_return_date": "2026-07-20"
}
```

Success 201

```json
{
  "id": "a9839d59-7d45-4c4a-bf63-7e4e1d1c2f77",
  "status": "Active"
}
```

Conflict 409

```json
{
  "detail": "Asset is already allocated to Priya Sharma"
}
```

### POST /transfers

Creates a transfer request for an allocated asset.

### POST /transfers/{id}/approve

AssetManager or DeptHead depending on ownership rules.

### POST /transfers/{id}/reject

Same role rules as approve.

## Bookings

### POST /bookings

Creates a booking if time ranges do not overlap with any non-cancelled booking for the same resource.

Request

```json
{
  "resource_asset_id": "b8a3fd48-8dbe-4c4f-b5cd-5b8c6a8df5a1",
  "booked_by": "2ac18d2a-3f14-4d9e-9a34-f8d3a2d3b7a0",
  "start_time": "2026-07-12T09:00:00Z",
  "end_time": "2026-07-12T10:00:00Z"
}
```

Success 201

```json
{
  "id": "5f1a0a54-2e67-4d9a-8a11-0a7c2e8dd3d0",
  "status": "Upcoming"
}
```

Conflict 409

```json
{
  "detail": "Booking overlaps with an existing booking"
}
```

### GET /bookings

Filters: `?status=` and date range filters when needed.

## Dashboard

### GET /dashboard/summary

Returns KPI cards for the logged-in user’s accessible scope.

Response 200

```json
{
  "total_assets": 24,
  "available_assets": 10,
  "allocated_assets": 8,
  "bookings_today": 3,
  "overdue_allocations": 2
}
```

## Maintenance

### POST /maintenance

Employee+ can raise a request.

Request

```json
{
  "asset_id": "b8a3fd48-8dbe-4c4f-b5cd-5b8c6a8df5a1",
  "issue_description": "Battery not charging",
  "priority": "High",
  "photo_url": null
}
```

### POST /maintenance/{id}/approve

AssetManager only. Must set asset status to `UnderMaintenance`.

### POST /maintenance/{id}/reject

AssetManager only.

### POST /maintenance/{id}/assign-technician

AssetManager only.

### POST /maintenance/{id}/resolve

Must set asset status back to `Available`.

### GET /maintenance

Queue view with filters by `status` and `priority`.

## Audits

### POST /audits

Admin only.

Request

```json
{
  "scope_department_id": null,
  "scope_location": "HQ Floor 3",
  "start_date": "2026-07-15",
  "end_date": "2026-07-18",
  "auditor_ids": ["2ac18d2a-3f14-4d9e-9a34-f8d3a2d3b7a0"]
}
```

### POST /audits/{id}/items/{asset_id}/mark

Auditor only.

Request

```json
{
  "result": "Missing",
  "notes": "Asset not found in room"
}
```

### POST /audits/{id}/close

Admin only. Missing items must flip the linked assets to `Lost`.

### GET /audits/{id}/discrepancy-report

Returns a table-ready report of missing/damaged assets.

## Reports

### GET /reports/utilization

### GET /reports/maintenance-frequency

### GET /reports/upcoming-retirement

### GET /reports/department-allocation-summary

### GET /reports/booking-heatmap

### GET /reports/export?type=csv

Admin only for all reports. These endpoints may initially return aggregated JSON; CSV export is optional until late in the schedule.

## Notifications and Logs

### GET /notifications

Current user only. Return unread-first.

### POST /notifications/{id}/read

Marks a notification as read.

### GET /logs

Admin only. Returns the activity log with optional filters.

## RBAC Rules

- `POST /auth/signup` is public
- `GET /me` requires auth
- `Admin` can manage departments, categories, employees, audits, reports, and logs
- `AssetManager` can manage assets, allocations, transfers, and maintenance approvals
- `DeptHead` can participate in scoped allocations and transfers when allowed by ownership rules
- `Employee` can use self-service flows only

## Change Rule

If a request/response shape changes, update this file first, then update backend schemas and frontend types in the same branch.

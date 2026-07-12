# AssetFlow

**Enterprise Asset & Resource Management System**

AssetFlow is a centralized ERP platform for tracking, allocating, and maintaining physical assets and shared resources. It's built for any organization with equipment, furniture, vehicles, or shared spaces — offices, schools, hospitals, factories, or agencies — replacing spreadsheets and paper logs with structured asset lifecycles, centralized resource booking, and real-time visibility into who holds what, where it is, and its condition.

The platform focuses on core ERP functionality — clean architecture, role-based workflows, and scalable module design — without touching purchasing, invoicing, or accounting concerns.

## What It Does

- Maintain departments, asset categories, and an employee directory
- Track assets through a flexible lifecycle: **Available → Allocated → Reserved → Under Maintenance → Lost → Retired → Disposed** (with valid transitions like Available ↔ Under Maintenance, Allocated → Available)
- Allocate assets to employees/departments, blocking double-allocation and offering transfer requests instead
- Book shared/limited resources (rooms, vehicles, equipment) by time slot, with overlap validation
- Route maintenance requests through an approval workflow before repair work starts
- Run scheduled audit cycles with assigned auditors and auto-generated discrepancy reports
- Surface overdue returns, bookings, and maintenance activity via notifications and a KPI dashboard

## Core Screens

1. **Login / Signup** — Signup creates an Employee account only (no self-assigned roles); Admin promotes users to Department Head / Asset Manager from the Employee Directory
2. **Dashboard** — KPI cards (assets available/allocated, maintenance today, active bookings, pending transfers, upcoming returns), overdue return alerts, quick actions
3. **Organization Setup** (Admin only) — Department Management, Asset Category Management, Employee Directory
4. **Asset Registration & Directory** — Register assets with auto-generated Asset Tag, search/filter, per-asset lifecycle status and history
5. **Asset Allocation & Transfer** — Allocate with conflict handling, transfer workflow (Requested → Approved → Re-allocated), return flow, overdue flagging
6. **Resource Booking** — Calendar view, overlap validation, booking statuses (Upcoming/Ongoing/Completed/Cancelled), reminders
7. **Maintenance Management** — Raise → Approve/Reject → Assign Technician → In Progress → Resolved, with automatic asset status transitions
8. **Asset Audit** — Audit cycles with assigned auditors, per-asset verification (Verified/Missing/Damaged), auto-generated discrepancy reports
9. **Reports & Analytics** — Utilization trends, maintenance frequency, upcoming maintenance/retirement, department allocation summaries, booking heatmaps
10. **Activity Logs & Notifications** — Full audit trail and real-time alerts for every role

## User Roles

- **Admin** — Manages departments, asset categories, audit cycles, and role assignment; views org-wide analytics
- **Asset Manager** — Registers/allocates assets; approves transfers, maintenance requests, and returns
- **Department Head** — Views department assets; approves department allocation/transfer requests; books resources for the department
- **Employee** — Views their allocated assets; books resources; raises maintenance and return/transfer requests

## Basic Workflow

Admin sets up departments, categories, and roles → Asset Manager registers assets (enter as `Available`) → assets are allocated (conflict-checked) or marked bookable → employees book shared resources by time slot → maintenance requests go through approval before assets flip to `Under Maintenance` → transfers/returns update history automatically → periodic audit cycles verify assets and generate discrepancy reports → all activity is tracked through notifications, logs, and reports.

## Contributors

Shrey, Raghav, Ashish

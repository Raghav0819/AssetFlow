// ─── Shared Enums (mirrors API_CONTRACT.md) ───

export type Role = "Admin" | "DeptHead" | "AssetManager" | "Employee";
export type UserStatus = "Active" | "Inactive";
export type AssetStatus =
  | "Available"
  | "Allocated"
  | "Reserved"
  | "UnderMaintenance"
  | "Lost"
  | "Retired"
  | "Disposed";
export type AllocationStatus = "Active" | "Returned";
export type TransferStatus = "Requested" | "Approved" | "Rejected";
export type BookingStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
export type MaintenanceStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "TechnicianAssigned"
  | "InProgress"
  | "Resolved";
export type Priority = "Low" | "Medium" | "High";
export type AuditStatus = "Planned" | "Active" | "Closed";
export type AuditResult = "Pending" | "Verified" | "Missing" | "Damaged";

// ─── Auth interfaces ───

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  role: Role;
  name: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
}

export interface UserProfile {
  id: string;
  firebase_uid: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  department_id: string | null;
}

export interface ApiError {
  detail: string;
}

// ─── Organization Setup Interfaces ───

export interface CustomFieldSchema {
  name: string;
  type: "text" | "number" | "boolean";
}

export interface Department {
  id: string;
  name: string;
  parent_department_id: string | null;
  department_head_id: string | null;
  status: UserStatus;
  parent_name?: string | null; // UI helper
  head_name?: string | null;   // UI helper
}

export interface DepartmentCreate {
  name: string;
  parent_department_id: string | null;
  department_head_id: string | null;
  status: UserStatus;
}

export interface Category {
  id: string;
  name: string;
  custom_fields_schema: CustomFieldSchema[];
}

export interface CategoryCreate {
  name: string;
  custom_fields_schema: CustomFieldSchema[];
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  department_id: string | null;
  department_name?: string | null; // UI helper
}

// ─── Asset Interfaces ───

export interface Asset {
  id: string;
  asset_tag: string;
  name: string;
  category_id: string;
  serial_number: string;
  acquisition_date: string;
  acquisition_cost: string;
  condition: string;
  location: string;
  is_bookable: boolean;
  status: AssetStatus;
  custom_field_values: Record<string, string | number | boolean>;
  photo_url: string | null;
  created_at: string;
  // UI helpers
  category_name?: string;
  assigned_to?: string | null;
}

export interface AssetCreate {
  asset_tag: string;
  name: string;
  category_id: string;
  serial_number: string;
  acquisition_date: string;
  acquisition_cost: string;
  condition: string;
  location: string;
  is_bookable: boolean;
  status: AssetStatus;
  custom_field_values: Record<string, string | number | boolean>;
  photo_url: string | null;
}

export interface HistoryEvent {
  id: string;
  icon: "deploy" | "maintenance" | "inventory" | "transfer" | "audit";
  title: string;
  description: string;
  date: string;
}

// ─── Allocation & Transfer Interfaces ───

export interface Allocation {
  id: string;
  asset_id: string;
  held_by_user_id: string | null;
  held_by_department_id: string | null;
  allocated_at: string;
  expected_return_date: string | null;
  returned_at: string | null;
  condition_notes: string | null;
  status: AllocationStatus;
  
  // UI helpers
  asset_name?: string;
  asset_tag?: string;
  employee_name?: string;
  department_name?: string;
}

export interface AllocationCreate {
  asset_id: string;
  held_by_user_id: string | null;
  held_by_department_id: string | null;
  expected_return_date: string | null;
}

export interface TransferRequest {
  id: string;
  asset_id: string;
  requested_by: string;
  current_holder_id: string | null;
  requested_to: string;
  status: TransferStatus;
  created_at: string;
  reason?: string;
  priority?: "Standard" | "Urgent";
}

export interface TransferCreate {
  asset_id: string;
  requested_to: string;
  reason?: string;
  priority?: "Standard" | "Urgent";
}

// ─── Booking Interfaces ───

export interface Booking {
  id: string;
  resource_asset_id: string;
  booked_by: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  
  // UI helpers
  asset_name?: string;
  asset_tag?: string;
  booker_name?: string;
  duration_hours?: number;
}

export interface BookingCreate {
  resource_asset_id: string;
  booked_by: string;
  start_time: string;
  end_time: string;
}

export interface BookingAvailability {
  asset_id: string;
  is_available: boolean;
  conflict_message?: string;
  existing_bookings?: Booking[];
}

export interface DashboardSummary {
  total_assets: number;
  available_assets: number;
  allocated_assets: number;
  bookings_today: number;
  overdue_allocations: number;
}

export interface ActivityLog {
  id: string;
  type: string;
  title: string;
  time: string;
}

export interface UtilizationData {
  name: string;
  allocated: number;
  available: number;
}

export interface MaintenanceTrendData {
  name: string;
  scheduled: number;
  emergency: number;
}

// ─── Maintenance Interfaces ───

export interface MaintenanceRequest {
  id: string;
  asset_id: string;
  raised_by: string;
  issue_description: string;
  priority: Priority;
  photo_url: string | null;
  status: MaintenanceStatus;
  approved_by: string | null;
  technician_name: string | null;
  resolved_at: string | null;
  created_at: string;
  
  // UI helpers
  asset_name?: string;
  asset_tag?: string;
  raised_by_name?: string;
}

export interface MaintenanceCreate {
  asset_id: string;
  issue_description: string;
  priority: Priority;
  photo_url: string | null;
}

// ─── Audit Interfaces ───

export interface AuditItem {
  id: string;
  audit_cycle_id: string;
  asset_id: string;
  result: AuditResult;
  notes: string | null;
  marked_by: string | null;
  marked_at: string | null;

  // UI helpers
  asset_tag?: string;
  asset_name?: string;
  asset_location?: string;
  asset_serial?: string;
  assigned_user_name?: string;
}

export interface AuditCycle {
  id: string;
  scope_department_id: string | null;
  scope_location: string | null;
  start_date: string;
  end_date: string;
  status: AuditStatus;
  created_by: string;
  created_at: string;
  auditor_ids: string[];

  // UI helpers
  department_name?: string;
  total_items?: number;
  verified_count?: number;
  missing_count?: number;
  damaged_count?: number;
  items?: AuditItem[];
}

export interface AuditCycleCreate {
  scope_department_id: string | null;
  scope_location: string | null;
  start_date: string;
  end_date: string;
  auditor_ids: string[];
}

export interface AuditMarkPayload {
  result: AuditResult;
  notes: string | null;
}

// ─── Report Interfaces ───

export interface MostUsedAssetReport {
  id: string;
  name: string;
  department: string;
  hours: number;
  trend: number;
}

export interface RetirementReport {
  id: string;
  name: string;
  lifespan_reached: number;
  status: "Flag" | "Critical";
}

export interface DeptUtilizationReport {
  department: string;
  target: number;
  actual: number;
}

export interface IdleReport {
  active_pct: number;
  idle_pct: number;
  repair_pct: number;
  total_idle: number;
}

export interface MaintenanceFreqReport {
  date: string;
  incidents: number;
}

// ─── Notification Interfaces ───

export interface AppNotification {
  id: string;
  user_id: string;
  type: "assignment" | "maintenance" | "alert" | "ai" | string;
  title: string;
  message: string;
  read: boolean;
  related_entity_type?: string | null;
  related_entity_id?: string | null;
  created_at: string;
  
  // UI helpers
  assigned_to_name?: string;
}
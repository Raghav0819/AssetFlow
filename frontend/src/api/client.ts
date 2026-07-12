import { isMockAuth } from "../firebase/config";
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  UserProfile,
  Department,
  DepartmentCreate,
  Category,
  CategoryCreate,
  Employee,
  Role,
  Asset,
  AssetCreate,
  Allocation,
  AllocationCreate,
  TransferRequest,
  TransferCreate,
  Booking,
  BookingCreate,
  BookingAvailability,
  DashboardSummary,
  ActivityLog,
  UtilizationData,
  MaintenanceTrendData,
  MaintenanceRequest,
  MaintenanceCreate,
  MaintenanceStatus,
  AuditCycle,
  AuditCycleCreate,
  AuditItem,
  AuditResult,
  MostUsedAssetReport,
  RetirementReport,
  DeptUtilizationReport,
  IdleReport,
  MaintenanceFreqReport,
  AppNotification,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

// ─── Backend session token (issued by /auth/login, distinct from the Firebase identity token) ───

const TOKEN_STORAGE_KEY = "assetflow_access_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// ─── Generic fetch wrapper ───

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiClientError(body.detail ?? "Something went wrong", res.status);
  }

  return res.json() as Promise<T>;
}

export class ApiClientError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

// ─── Local Mock Store (Fallback for Offline Dev / Missing Backend) ───

const STORAGE_KEYS = {
  DEPARTMENTS: "assetflow_mock_departments",
  CATEGORIES: "assetflow_mock_categories",
  EMPLOYEES: "assetflow_mock_employees",
  ASSETS: "assetflow_mock_assets",
  ALLOCATIONS: "assetflow_mock_allocations",
  TRANSFERS: "assetflow_mock_transfers",
  BOOKINGS: "assetflow_mock_bookings",
  MAINTENANCE: "assetflow_mock_maintenance",
  AUDIT_CYCLES: "af_audit_cycles",
  AUDIT_ITEMS: "af_audit_items",
  NOTIFICATIONS: "af_notifications",
};

// Seed initial values if not present
if (typeof window !== "undefined") {
  if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
    const initialDepts: Department[] = [
      { id: "dept-1", name: "Global Operations", parent_department_id: null, department_head_id: "emp-1", status: "Active" },
      { id: "dept-2", name: "Engineering", parent_department_id: "dept-1", department_head_id: "emp-2", status: "Active" },
      { id: "dept-3", name: "Marketing & Sales", parent_department_id: "dept-1", department_head_id: "emp-3", status: "Active" },
      { id: "dept-4", name: "Human Resources", parent_department_id: "dept-1", department_head_id: "emp-4", status: "Inactive" },
      { id: "dept-5", name: "Finance", parent_department_id: "dept-1", department_head_id: "emp-5", status: "Active" },
    ];
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(initialDepts));
  }

  if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
    const initialEmployees: Employee[] = [
      { id: "emp-1", name: "Julianne Doe", email: "julianne@assetflow.demo", role: "DeptHead", status: "Active", department_id: "dept-1" },
      { id: "emp-2", name: "Sarah Jenkins", email: "sarah@assetflow.demo", role: "DeptHead", status: "Active", department_id: "dept-2" },
      { id: "emp-3", name: "Marcus Wright", email: "marcus@assetflow.demo", role: "DeptHead", status: "Active", department_id: "dept-3" },
      { id: "emp-4", name: "Linda Chen", email: "linda@assetflow.demo", role: "DeptHead", status: "Inactive", department_id: "dept-4" },
      { id: "emp-5", name: "Robert Hoffman", email: "robert@assetflow.demo", role: "DeptHead", status: "Active", department_id: "dept-5" },
      { id: "emp-admin", name: "Alexander Pierce", email: "admin@assetflow.demo", role: "Admin", status: "Active", department_id: null },
      { id: "emp-priya", name: "Priya Sharma", email: "priya@example.com", role: "Employee", status: "Active", department_id: "dept-2" },
    ];
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(initialEmployees));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    const initialCategories: Category[] = [
      {
        id: "cat-1",
        name: "Laptops",
        custom_fields_schema: [
          { name: "warranty_period", type: "text" },
          { name: "processor", type: "text" },
        ],
      },
      {
        id: "cat-2",
        name: "Monitors",
        custom_fields_schema: [
          { name: "warranty_period", type: "text" },
          { name: "resolution", type: "text" },
        ],
      },
      {
        id: "cat-3",
        name: "Office Chairs",
        custom_fields_schema: [
          { name: "material", type: "text" },
          { name: "ergonomic", type: "boolean" },
        ],
      },
    ];
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ASSETS)) {
    const initialAssets: Asset[] = [
      {
        id: "asset-1", asset_tag: "AF-0012", name: "MacBook Pro 16\" (M2)",
        category_id: "cat-1", serial_number: "SN-MBP-0012",
        acquisition_date: "2025-06-15", acquisition_cost: "249999.00",
        condition: "Good", location: "San Francisco - HQ",
        is_bookable: false, status: "Allocated",
        custom_field_values: { warranty_period: "3 years", processor: "Apple M2 Max" },
        photo_url: null, created_at: "2025-06-15T10:00:00Z",
        assigned_to: "Sarah Miller",
      },
      {
        id: "asset-2", asset_tag: "AF-0045", name: "Dell UltraSharp 32\"",
        category_id: "cat-2", serial_number: "SN-DUS-0045",
        acquisition_date: "2025-03-20", acquisition_cost: "65000.00",
        condition: "Good", location: "London - Tower B",
        is_bookable: false, status: "UnderMaintenance",
        custom_field_values: { warranty_period: "2 years", resolution: "4K UHD" },
        photo_url: null, created_at: "2025-03-20T08:00:00Z",
        assigned_to: null,
      },
      {
        id: "asset-3", asset_tag: "AF-0201", name: "iPhone 14 Enterprise",
        category_id: "cat-4", serial_number: "SN-IPH-0201",
        acquisition_date: "2025-01-10", acquisition_cost: "89999.00",
        condition: "Excellent", location: "New York - Central",
        is_bookable: false, status: "Reserved",
        custom_field_values: { warranty_period: "1 year" },
        photo_url: null, created_at: "2025-01-10T12:00:00Z",
        assigned_to: null,
      },
      {
        id: "asset-4", asset_tag: "AF-0518", name: "iPad Air (5th Gen)",
        category_id: "cat-4", serial_number: "SN-IPA-0518",
        acquisition_date: "2025-04-05", acquisition_cost: "54999.00",
        condition: "Fair", location: "Unknown",
        is_bookable: false, status: "Lost",
        custom_field_values: { warranty_period: "1 year" },
        photo_url: null, created_at: "2025-04-05T09:00:00Z",
        assigned_to: null,
      },
      {
        id: "asset-5", asset_tag: "AF-0922", name: "Logitech Rally Bar",
        category_id: "cat-5", serial_number: "SN-LRB-0922",
        acquisition_date: "2025-07-01", acquisition_cost: "185000.00",
        condition: "New", location: "Tokyo - Shibuya",
        is_bookable: true, status: "Allocated",
        custom_field_values: {},
        photo_url: null, created_at: "2025-07-01T06:00:00Z",
        assigned_to: "Kenji Tanaka",
      },
      {
        id: "asset-6", asset_tag: "AF-0033", name: "ThinkPad X1 Carbon",
        category_id: "cat-1", serial_number: "SN-TPX-0033",
        acquisition_date: "2024-11-15", acquisition_cost: "145000.00",
        condition: "Good", location: "San Francisco - HQ",
        is_bookable: false, status: "Available",
        custom_field_values: { warranty_period: "3 years", processor: "Intel i7-1365U" },
        photo_url: null, created_at: "2024-11-15T10:00:00Z",
        assigned_to: null,
      },
      {
        id: "asset-7", asset_tag: "AF-0078", name: "Herman Miller Aeron",
        category_id: "cat-3", serial_number: "SN-HMA-0078",
        acquisition_date: "2025-02-28", acquisition_cost: "120000.00",
        condition: "New", location: "London - Tower B",
        is_bookable: false, status: "Available",
        custom_field_values: { material: "Mesh", ergonomic: true },
        photo_url: null, created_at: "2025-02-28T14:00:00Z",
        assigned_to: null,
      },
      {
        id: "asset-8", asset_tag: "AF-0156", name: "Sony WH-1000XM5",
        category_id: "cat-5", serial_number: "SN-SNY-0156",
        acquisition_date: "2025-05-10", acquisition_cost: "29999.00",
        condition: "Excellent", location: "New York - Central",
        is_bookable: false, status: "Allocated",
        custom_field_values: {},
        photo_url: null, created_at: "2025-05-10T11:00:00Z",
        assigned_to: "Priya Sharma",
      },
    ];
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(initialAssets));
  }

  // Seed extra categories if not already present
  const existingCats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]");
  if (!existingCats.find((c: Category) => c.id === "cat-4")) {
    existingCats.push(
      { id: "cat-4", name: "Mobile Devices", custom_fields_schema: [{ name: "warranty_period", type: "text" }] },
      { id: "cat-5", name: "AV Equipment", custom_fields_schema: [] },
    );
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(existingCats));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ALLOCATIONS)) {
    const initialAllocations: Allocation[] = [
      {
        id: "alloc-1", asset_id: "asset-1", held_by_user_id: "emp-2", held_by_department_id: null,
        allocated_at: "2025-10-12T09:00:00Z", expected_return_date: null, returned_at: null,
        condition_notes: null, status: "Active"
      },
      {
        id: "alloc-2", asset_id: "asset-5", held_by_user_id: "emp-3", held_by_department_id: null,
        allocated_at: "2025-07-02T10:00:00Z", expected_return_date: null, returned_at: null,
        condition_notes: null, status: "Active"
      },
      {
        id: "alloc-3", asset_id: "asset-8", held_by_user_id: "emp-priya", held_by_department_id: null,
        allocated_at: "2025-05-11T11:00:00Z", expected_return_date: null, returned_at: null,
        condition_notes: null, status: "Active"
      },
      // Some returned allocations for history
      {
        id: "alloc-4", asset_id: "asset-6", held_by_user_id: "emp-1", held_by_department_id: null,
        allocated_at: "2024-12-01T09:00:00Z", expected_return_date: null, returned_at: "2025-03-01T10:00:00Z",
        condition_notes: "Returned in good condition", status: "Returned"
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify(initialAllocations));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TRANSFERS)) {
    const initialTransfers: TransferRequest[] = [
      {
        id: "TR-9902", asset_id: "asset-1", requested_by: "emp-priya", current_holder_id: "emp-2",
        requested_to: "emp-priya", status: "Requested", created_at: new Date().toISOString(),
        reason: "Department Change", priority: "Standard"
      }
    ];
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(initialTransfers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    const today = new Date();
    const initialBookings: Booking[] = [
      {
        id: "booking-1",
        resource_asset_id: "asset-5",
        booked_by: "emp-priya",
        start_time: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + "T09:00:00Z",
        end_time: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + "T11:00:00Z",
        status: "Upcoming",
      },
      {
        id: "booking-2",
        resource_asset_id: "asset-5",
        booked_by: "emp-2",
        start_time: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + "T14:00:00Z",
        end_time: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + "T15:30:00Z",
        status: "Upcoming",
      },
    ];
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(initialBookings));
  }

  if (!localStorage.getItem(STORAGE_KEYS.MAINTENANCE)) {
    const initialMaintenance: MaintenanceRequest[] = [
      {
        id: "maint-1", asset_id: "asset-1", raised_by: "emp-priya", issue_description: "Projector bulb not turning on. The Epson X400 in Conference Room B is reporting a lamp failure LED indicator.",
        priority: "High", photo_url: null, status: "Pending", approved_by: null, technician_name: null,
        resolved_at: null, created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "maint-2", asset_id: "asset-2", raised_by: "emp-2", issue_description: "Server Rack 4 Re-cabling. Scheduled cable management and port mapping for the primary data center...",
        priority: "Low", photo_url: null, status: "Approved", approved_by: "emp-admin", technician_name: null,
        resolved_at: null, created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "maint-3", asset_id: "asset-5", raised_by: "emp-3", issue_description: "Leaking Water Dispenser. 2nd floor kitchen area dispenser has a slow drip from the internal valve.",
        priority: "Medium", photo_url: null, status: "TechnicianAssigned", approved_by: "emp-admin", technician_name: "David K.",
        resolved_at: null, created_at: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: "maint-4", asset_id: "asset-6", raised_by: "emp-1", issue_description: "Broken Window Lock. Replacing security latch on window W-14. Parts have arrived and installation is...",
        priority: "High", photo_url: null, status: "InProgress", approved_by: "emp-admin", technician_name: "Sarah M.",
        resolved_at: null, created_at: new Date(Date.now() - 259200000).toISOString(),
      },
      {
        id: "maint-5", asset_id: "asset-7", raised_by: "emp-2", issue_description: "Mouse Replacement. Closed 2h ago.",
        priority: "Low", photo_url: null, status: "Resolved", approved_by: "emp-admin", technician_name: "Mike T.",
        resolved_at: new Date(Date.now() - 7200000).toISOString(), created_at: new Date(Date.now() - 345600000).toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(initialMaintenance));
  }

  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_CYCLES)) {
    const initialCycles: AuditCycle[] = [
      {
        id: "audit-1",
        scope_department_id: "dept-2",
        scope_location: null,
        start_date: "2023-09-01",
        end_date: "2023-09-30",
        status: "Active",
        created_by: "emp-admin",
        created_at: "2023-09-01T00:00:00Z",
        auditor_ids: ["emp-admin", "emp-1"],
      },
    ];
    localStorage.setItem(STORAGE_KEYS.AUDIT_CYCLES, JSON.stringify(initialCycles));
  }

  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_ITEMS)) {
    const initialItems: AuditItem[] = [
      { id: "ai-1", audit_cycle_id: "audit-1", asset_id: "asset-1", result: "Verified", notes: null, marked_by: "emp-admin", marked_at: new Date().toISOString() },
      { id: "ai-2", audit_cycle_id: "audit-1", asset_id: "asset-2", result: "Missing", notes: "Asset not found in room", marked_by: "emp-1", marked_at: new Date().toISOString() },
      { id: "ai-3", audit_cycle_id: "audit-1", asset_id: "asset-3", result: "Damaged", notes: "Screen cracked", marked_by: "emp-admin", marked_at: new Date().toISOString() },
      { id: "ai-4", audit_cycle_id: "audit-1", asset_id: "asset-4", result: "Verified", notes: null, marked_by: "emp-1", marked_at: new Date().toISOString() },
      { id: "ai-5", audit_cycle_id: "audit-1", asset_id: "asset-5", result: "Pending", notes: null, marked_by: null, marked_at: null },
      { id: "ai-6", audit_cycle_id: "audit-1", asset_id: "asset-6", result: "Pending", notes: null, marked_by: null, marked_at: null },
    ];
    localStorage.setItem(STORAGE_KEYS.AUDIT_ITEMS, JSON.stringify(initialItems));
  }

  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const initialNotifications: AppNotification[] = [
      {
        id: "notif-1",
        user_id: "emp-admin",
        type: "assignment",
        title: "Laptop AF-0014 assigned to Priya Shah",
        message: "System automated asset deployment. Warranty verification complete. Next scheduled audit: Oct 12, 2024.",
        read: false,
        created_at: new Date(today.getTime() - 2 * 60000).toISOString(),
      },
      {
        id: "notif-2",
        user_id: "emp-admin",
        type: "maintenance",
        title: "Maintenance Approved",
        message: "Request #MNT-2290 for Server Rack #04 was approved by Infrastructure Lead. Technician dispatched for 14:00 PM today.",
        read: false,
        created_at: new Date(today.getTime() - 18 * 60000).toISOString(),
        assigned_to_name: "Marcus V.",
      },
      {
        id: "notif-3",
        user_id: "emp-admin",
        type: "alert",
        title: "Overdue return flagged",
        message: "High-risk asset: Canon EOS R5 (ID: CAM-1102) was due for return on Sep 18. No extension requested. Escalated to Security.",
        read: true,
        created_at: new Date(yesterday.getTime() - 3600000).toISOString(),
      },
      {
        id: "notif-4",
        user_id: "emp-admin",
        type: "ai",
        title: "AI Prediction: Low Stock Alert",
        message: "\"Based on current booking velocity, Wireless Peripherals (Stock: 12) will be depleted by Friday. Recommend initiating restock of 50 units.\"",
        read: true,
        created_at: new Date(yesterday.getTime() - 7200000).toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
  }
}

// Helper getter/setters for localStorage db
const db = {
  getDepts(): Department[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPARTMENTS) || "[]");
  },
  saveDepts(depts: Department[]) {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(depts));
  },
  getCats(): Category[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]");
  },
  saveCats(cats: Category[]) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
  },
  getEmps(): Employee[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || "[]");
  },
  saveEmps(emps: Employee[]) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(emps));
  },
  getAssets(): Asset[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSETS) || "[]");
  },
  saveAssets(assets: Asset[]) {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
  },
  getAllocations(): Allocation[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ALLOCATIONS) || "[]");
  },
  saveAllocations(allocs: Allocation[]) {
    localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify(allocs));
  },
  getTransfers(): TransferRequest[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSFERS) || "[]");
  },
  saveTransfers(transfers: TransferRequest[]) {
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
  },
  getBookings(): Booking[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || "[]");
  },
  saveBookings(bookings: Booking[]) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  },
  getMaintenance(): MaintenanceRequest[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE) || "[]");
  },
  saveMaintenance(maint: MaintenanceRequest[]) {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(maint));
  },
  getAuditCycles(): AuditCycle[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_CYCLES) || "[]");
  },
  saveAuditCycles(cycles: AuditCycle[]) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_CYCLES, JSON.stringify(cycles));
  },
  getAuditItems(): AuditItem[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_ITEMS) || "[]");
  },
  saveAuditItems(items: AuditItem[]) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_ITEMS, JSON.stringify(items));
  },
};

// ─── API endpoints with Mock fallback ───

export const api = {
  login(data: LoginRequest) {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  signup(data: SignupRequest) {
    return request<SignupResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  me() {
    return request<UserProfile>("/me");
  },

  // ─── Departments (backed by the real API — Postgres) ───
  async getDepartments(): Promise<Department[]> {
    return request<Department[]>("/departments");
  },

  async createDepartment(data: DepartmentCreate): Promise<Department> {
    return request<Department>("/departments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ─── Categories (backed by the real API — Postgres) ───
  async getCategories(): Promise<Category[]> {
    return request<Category[]>("/categories");
  },

  async createCategory(data: CategoryCreate): Promise<Category> {
    return request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ─── Employees / Directory (backed by the real API — Postgres) ───
  async getEmployees(): Promise<Employee[]> {
    return request<Employee[]>("/employees");
  },

  async updateEmployeeRole(id: string, role: Role): Promise<Employee> {
    return request<Employee>(`/employees/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  // ─── Assets ───
  async getAssets(filters?: { status?: string; category_id?: string; q?: string; is_bookable?: boolean }): Promise<{ items: Asset[] }> {
    if (isMockAuth) {
      let assets = db.getAssets();
      const cats = db.getCats();
      // Join category name
      assets = assets.map((a) => {
        const cat = cats.find((c) => c.id === a.category_id);
        return { ...a, category_name: cat ? cat.name : "Unknown" };
      });
      // Apply filters
      if (filters?.status) {
        assets = assets.filter((a) => a.status === filters.status);
      }
      if (filters?.category_id) {
        assets = assets.filter((a) => a.category_id === filters.category_id);
      }
      if (filters?.q) {
        const q = filters.q.toLowerCase();
        assets = assets.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.asset_tag.toLowerCase().includes(q) ||
            a.serial_number.toLowerCase().includes(q)
        );
      }
      if (filters?.is_bookable !== undefined) {
        assets = assets.filter((a) => a.is_bookable === filters.is_bookable);
      }
      return { items: assets };
    }
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.category_id) params.set("category_id", filters.category_id);
    if (filters?.q) params.set("q", filters.q);
    if (filters?.is_bookable !== undefined) params.set("is_bookable", filters.is_bookable.toString());
    const qs = params.toString();
    return request<{ items: Asset[] }>(`/assets${qs ? `?${qs}` : ""}`);
  },

  async createAsset(data: AssetCreate): Promise<Asset> {
    if (isMockAuth) {
      const assets = db.getAssets();
      // Check duplicate tag
      if (assets.some((a) => a.asset_tag === data.asset_tag)) {
        throw new ApiClientError("Duplicate asset tag", 409);
      }
      const newAsset: Asset = {
        id: `asset-${Date.now()}`,
        ...data,
        created_at: new Date().toISOString(),
        assigned_to: null,
      };
      assets.push(newAsset);
      db.saveAssets(assets);
      return newAsset;
    }
    return request<Asset>("/assets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getAssetById(id: string): Promise<Asset> {
    if (isMockAuth) {
      const assets = db.getAssets();
      const cats = db.getCats();
      const asset = assets.find((a) => a.id === id);
      if (!asset) throw new ApiClientError("Asset not found", 404);
      const cat = cats.find((c) => c.id === asset.category_id);
      return { ...asset, category_name: cat ? cat.name : "Unknown" };
    }
    return request<Asset>(`/assets/${id}`);
  },

  // ─── Allocations & Transfers ───
  async getAllocations(): Promise<Allocation[]> {
    if (isMockAuth) {
      const allocs = db.getAllocations();
      const assets = db.getAssets();
      const emps = db.getEmps();
      const depts = db.getDepts();

      return allocs.map(a => {
        const asset = assets.find(x => x.id === a.asset_id);
        const emp = emps.find(x => x.id === a.held_by_user_id);
        const dept = emp ? depts.find(d => d.id === emp.department_id) : null;
        return {
          ...a,
          asset_name: asset ? asset.name : "Unknown Asset",
          asset_tag: asset ? asset.asset_tag : "Unknown",
          employee_name: emp ? emp.name : "Unknown Employee",
          department_name: dept ? dept.name : "Unknown Department"
        };
      });
    }
    return request<Allocation[]>("/allocations");
  },

  async createAllocation(data: AllocationCreate): Promise<Allocation> {
    if (isMockAuth) {
      const allocs = db.getAllocations();
      const assets = db.getAssets();
      
      const assetIndex = assets.findIndex(a => a.id === data.asset_id);
      if (assetIndex === -1) throw new ApiClientError("Asset not found", 404);
      
      if (assets[assetIndex].status === "Allocated") {
        throw new ApiClientError("Asset is already allocated", 409);
      }

      const newAlloc: Allocation = {
        id: `alloc-${Date.now()}`,
        ...data,
        allocated_at: new Date().toISOString(),
        returned_at: null,
        condition_notes: null,
        status: "Active"
      };
      allocs.push(newAlloc);
      db.saveAllocations(allocs);

      // Update asset status
      assets[assetIndex].status = "Allocated";
      const emps = db.getEmps();
      const emp = emps.find(e => e.id === data.held_by_user_id);
      assets[assetIndex].assigned_to = emp ? emp.name : null;
      db.saveAssets(assets);

      return newAlloc;
    }
    return request<Allocation>("/allocations", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async getTransfers(): Promise<TransferRequest[]> {
    if (isMockAuth) {
      return db.getTransfers();
    }
    return request<TransferRequest[]>("/transfers");
  },

  async createTransferRequest(data: TransferCreate): Promise<TransferRequest> {
    if (isMockAuth) {
      const transfers = db.getTransfers();
      const assets = db.getAssets();
      
      const asset = assets.find(a => a.id === data.asset_id);
      if (!asset) throw new ApiClientError("Asset not found", 404);

      // find current holder
      const allocs = db.getAllocations();
      const currentAlloc = allocs.find(a => a.asset_id === data.asset_id && a.status === "Active");

      const newTransfer: TransferRequest = {
        id: `TR-${Math.floor(Math.random() * 9000) + 1000}`,
        asset_id: data.asset_id,
        requested_by: "emp-priya", // Mocking current user
        current_holder_id: currentAlloc ? currentAlloc.held_by_user_id : null,
        requested_to: data.requested_to,
        status: "Requested",
        created_at: new Date().toISOString(),
        reason: data.reason,
        priority: data.priority
      };
      
      transfers.push(newTransfer);
      db.saveTransfers(transfers);
      return newTransfer;
    }
    return request<TransferRequest>("/transfers", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  // ─── Bookings ───
  async getBookings(filters?: { status?: string; resource_asset_id?: string }): Promise<Booking[]> {
    if (isMockAuth) {
      let bookings = db.getBookings();
      const assets = db.getAssets();
      const emps = db.getEmps();

      // Join asset and booker names
      bookings = bookings.map(b => {
        const asset = assets.find(a => a.id === b.resource_asset_id);
        const booker = emps.find(e => e.id === b.booked_by);
        const startTime = new Date(b.start_time);
        const endTime = new Date(b.end_time);
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        
        return {
          ...b,
          asset_name: asset ? asset.name : "Unknown Asset",
          asset_tag: asset ? asset.asset_tag : "Unknown",
          booker_name: booker ? booker.name : "Unknown",
          duration_hours: durationHours
        };
      });

      // Apply filters
      if (filters?.status) {
        bookings = bookings.filter(b => b.status === filters.status);
      }
      if (filters?.resource_asset_id) {
        bookings = bookings.filter(b => b.resource_asset_id === filters.resource_asset_id);
      }

      return bookings.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
    }
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.resource_asset_id) params.set("resource_asset_id", filters.resource_asset_id);
    const qs = params.toString();
    return request<Booking[]>(`/bookings${qs ? `?${qs}` : ""}`);
  },

  async createBooking(data: BookingCreate): Promise<Booking> {
    if (isMockAuth) {
      const bookings = db.getBookings();
      const assets = db.getAssets();

      // Check asset exists and is bookable
      const asset = assets.find(a => a.id === data.resource_asset_id);
      if (!asset) throw new ApiClientError("Asset not found", 404);
      if (!asset.is_bookable) throw new ApiClientError("Asset is not bookable", 400);

      // Check for overlapping bookings
      const startTime = new Date(data.start_time);
      const endTime = new Date(data.end_time);

      const hasConflict = bookings.some(b => {
        if (b.resource_asset_id !== data.resource_asset_id) return false;
        if (b.status === "Cancelled") return false;
        
        const bStart = new Date(b.start_time);
        const bEnd = new Date(b.end_time);
        
        // Check overlap: start < other's end AND end > other's start
        return startTime < bEnd && endTime > bStart;
      });

      if (hasConflict) {
        throw new ApiClientError("Booking overlaps with an existing booking", 409);
      }

      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        ...data,
        status: "Upcoming"
      };

      bookings.push(newBooking);
      db.saveBookings(bookings);
      return newBooking;
    }
    return request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async checkBookingAvailability(assetId: string, startTime: string, endTime: string): Promise<BookingAvailability> {
    if (isMockAuth) {
      const bookings = db.getBookings();
      const assets = db.getAssets();

      const asset = assets.find(a => a.id === assetId);
      if (!asset) {
        return { asset_id: assetId, is_available: false, conflict_message: "Asset not found" };
      }

      if (!asset.is_bookable) {
        return { asset_id: assetId, is_available: false, conflict_message: "Asset is not bookable" };
      }

      const start = new Date(startTime);
      const end = new Date(endTime);

      const conflictingBookings = bookings.filter(b => {
        if (b.resource_asset_id !== assetId) return false;
        if (b.status === "Cancelled") return false;
        
        const bStart = new Date(b.start_time);
        const bEnd = new Date(b.end_time);
        
        return start < bEnd && end > bStart;
      });

      if (conflictingBookings.length > 0) {
        return {
          asset_id: assetId,
          is_available: false,
          conflict_message: `${conflictingBookings.length} booking(s) conflict with this time slot`,
          existing_bookings: conflictingBookings
        };
      }

      return { asset_id: assetId, is_available: true };
    }
    const params = new URLSearchParams({
      asset_id: assetId,
      start_time: startTime,
      end_time: endTime
    });
    return request<BookingAvailability>(`/bookings/check-availability?${params.toString()}`);
  },

  async cancelBooking(bookingId: string): Promise<Booking> {
    if (isMockAuth) {
      const bookings = db.getBookings();
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) throw new ApiClientError("Booking not found", 404);

      booking.status = "Cancelled";
      db.saveBookings(bookings);
      return booking;
    }
    return request<Booking>(`/bookings/${bookingId}/cancel`, {
      method: "POST"
    });
  },

  // ─── Dashboard (backed by the real API — Postgres) ───
  async getDashboardSummary(): Promise<DashboardSummary> {
    return request<DashboardSummary>("/dashboard/summary");
  },

  async getLogs(): Promise<ActivityLog[]> {
    if (isMockAuth) {
      return [
        { id: "1", type: "assignment", title: "Laptop AF-0014 assigned to Priya Shah", time: "24 minutes ago" },
        { id: "2", type: "booking", title: "Room B2 Booking Confirmed for Dept Q-Review", time: "1 hour ago" },
        { id: "3", type: "maintenance", title: "Printer PR-201 maintenance completed by Vendor 01", time: "3 hours ago" },
        { id: "4", type: "alert", title: "Urgent Alert: Cooling system malfunction in Data Center 4", time: "Yesterday at 18:45" },
        { id: "5", type: "request", title: "5 New Requests for workstation monitors from QA Team", time: "Yesterday at 16:30" },
      ];
    }
    return request<ActivityLog[]>("/logs");
  },

  async getUtilizationReport(): Promise<UtilizationData[]> {
    if (isMockAuth) {
      return [
        { name: "PRODUCT", allocated: 65, available: 35 },
        { name: "SALES", allocated: 45, available: 55 },
        { name: "LEGAL", allocated: 20, available: 80 },
        { name: "HR", allocated: 30, available: 70 },
        { name: "DESIGN", allocated: 85, available: 15 },
      ];
    }
    return request<UtilizationData[]>("/reports/utilization");
  },

  async getMaintenanceTrends(): Promise<MaintenanceTrendData[]> {
    if (isMockAuth) {
      return [
        { name: "Jan", scheduled: 10, emergency: 4 },
        { name: "Feb", scheduled: 15, emergency: 6 },
        { name: "Mar", scheduled: 12, emergency: 5 },
        { name: "Apr", scheduled: 25, emergency: 7 },
        { name: "May", scheduled: 18, emergency: 3 },
        { name: "Jun", scheduled: 10, emergency: 2 },
        { name: "Jul", scheduled: 28, emergency: 8 },
      ];
    }
    return request<MaintenanceTrendData[]>("/reports/maintenance-frequency");
  },

  // ─── Maintenance ───
  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    if (isMockAuth) {
      const maints = db.getMaintenance();
      const assets = db.getAssets();
      const emps = db.getEmps();

      return maints.map(m => {
        const asset = assets.find(a => a.id === m.asset_id);
        const emp = emps.find(e => e.id === m.raised_by);
        return {
          ...m,
          asset_tag: asset ? asset.asset_tag : "Unknown",
          asset_name: asset ? asset.name : "Unknown",
          raised_by_name: emp ? emp.name : "Unknown",
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return request<MaintenanceRequest[]>("/maintenance");
  },

  async createMaintenanceRequest(data: MaintenanceCreate): Promise<MaintenanceRequest> {
    if (isMockAuth) {
      const maints = db.getMaintenance();
      const newMaint: MaintenanceRequest = {
        id: `maint-${Date.now()}`,
        ...data,
        raised_by: "emp-priya", // Mocking current user
        status: "Pending",
        approved_by: null,
        technician_name: null,
        resolved_at: null,
        created_at: new Date().toISOString(),
      };
      maints.push(newMaint);
      db.saveMaintenance(maints);
      return newMaint;
    }
    return request<MaintenanceRequest>("/maintenance", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async updateMaintenanceStatus(id: string, status: MaintenanceStatus, technician_name?: string): Promise<MaintenanceRequest> {
    if (isMockAuth) {
      const maints = db.getMaintenance();
      const assets = db.getAssets();
      
      const idx = maints.findIndex(m => m.id === id);
      if (idx === -1) throw new ApiClientError("Maintenance request not found", 404);
      
      maints[idx].status = status;
      if (status === "Resolved") {
        maints[idx].resolved_at = new Date().toISOString();
      }
      if (technician_name) {
        maints[idx].technician_name = technician_name;
      }
      db.saveMaintenance(maints);

      // Sync asset status if needed
      if (status === "Approved" || status === "InProgress" || status === "TechnicianAssigned") {
         const assetIdx = assets.findIndex(a => a.id === maints[idx].asset_id);
         if (assetIdx !== -1) {
             assets[assetIdx].status = "UnderMaintenance";
             db.saveAssets(assets);
         }
      } else if (status === "Resolved") {
         const assetIdx = assets.findIndex(a => a.id === maints[idx].asset_id);
         if (assetIdx !== -1) {
             assets[assetIdx].status = "Available"; // Assuming it goes back to available
             db.saveAssets(assets);
         }
      }

      return maints[idx];
    }
    return request<MaintenanceRequest>(`/maintenance/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status, technician_name })
    });
  },

  // ─── Audits ───
  async getAudits(): Promise<AuditCycle[]> {
    if (isMockAuth) {
      const cycles = db.getAuditCycles();
      const allItems = db.getAuditItems();
      const depts = db.getDepts();

      return cycles.map(c => {
        const items = allItems.filter(i => i.audit_cycle_id === c.id);
        const dept = depts.find(d => d.id === c.scope_department_id);
        return {
          ...c,
          department_name: dept ? dept.name : c.scope_location || "All",
          total_items: items.length,
          verified_count: items.filter(i => i.result === "Verified").length,
          missing_count: items.filter(i => i.result === "Missing").length,
          damaged_count: items.filter(i => i.result === "Damaged").length,
        };
      });
    }
    return request<AuditCycle[]>("/audits");
  },

  async getAuditById(id: string): Promise<AuditCycle> {
    if (isMockAuth) {
      const cycles = db.getAuditCycles();
      const cycle = cycles.find(c => c.id === id);
      if (!cycle) throw new ApiClientError("Audit cycle not found", 404);

      const allItems = db.getAuditItems();
      const items = allItems.filter(i => i.audit_cycle_id === id);
      const assets = db.getAssets();
      const emps = db.getEmps();
      const allocs = db.getAllocations();
      const depts = db.getDepts();

      const enrichedItems: AuditItem[] = items.map(item => {
        const asset = assets.find(a => a.id === item.asset_id);
        const alloc = allocs.find(al => al.asset_id === item.asset_id && al.status === "Active");
        const assignedEmp = alloc ? emps.find(e => e.id === alloc.held_by_user_id) : null;
        return {
          ...item,
          asset_tag: asset?.asset_tag || "Unknown",
          asset_name: asset?.name || "Unknown",
          asset_location: asset?.location || "Unknown",
          asset_serial: asset?.serial_number || "Unknown",
          assigned_user_name: assignedEmp?.name || (asset?.status === "Available" ? "Unassigned" : "Infrastructure"),
        };
      });

      const dept = depts.find(d => d.id === cycle.scope_department_id);
      return {
        ...cycle,
        department_name: dept ? dept.name : cycle.scope_location || "All",
        items: enrichedItems,
        total_items: enrichedItems.length,
        verified_count: enrichedItems.filter(i => i.result === "Verified").length,
        missing_count: enrichedItems.filter(i => i.result === "Missing").length,
        damaged_count: enrichedItems.filter(i => i.result === "Damaged").length,
      };
    }
    return request<AuditCycle>(`/audits/${id}`);
  },

  async createAudit(data: AuditCycleCreate): Promise<AuditCycle> {
    if (isMockAuth) {
      const cycles = db.getAuditCycles();
      const assets = db.getAssets();
      const newCycle: AuditCycle = {
        id: `audit-${Date.now()}`,
        ...data,
        status: "Active",
        created_by: "emp-admin",
        created_at: new Date().toISOString(),
      };
      cycles.push(newCycle);
      db.saveAuditCycles(cycles);

      // Generate audit items for all assets (or filtered by department)
      const allItems = db.getAuditItems();
      const relevantAssets = data.scope_department_id
        ? assets // Simplified: include all for now
        : assets;
      const newItems: AuditItem[] = relevantAssets.map((a, i) => ({
        id: `ai-${Date.now()}-${i}`,
        audit_cycle_id: newCycle.id,
        asset_id: a.id,
        result: "Pending" as AuditResult,
        notes: null,
        marked_by: null,
        marked_at: null,
      }));
      allItems.push(...newItems);
      db.saveAuditItems(allItems);

      return { ...newCycle, total_items: newItems.length, verified_count: 0, missing_count: 0, damaged_count: 0 };
    }
    return request<AuditCycle>("/audits", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async markAuditItem(auditId: string, assetId: string, result: AuditResult, notes: string | null): Promise<AuditItem> {
    if (isMockAuth) {
      const items = db.getAuditItems();
      const idx = items.findIndex(i => i.audit_cycle_id === auditId && i.asset_id === assetId);
      if (idx === -1) throw new ApiClientError("Audit item not found", 404);

      items[idx].result = result;
      items[idx].notes = notes;
      items[idx].marked_by = "emp-admin";
      items[idx].marked_at = new Date().toISOString();
      db.saveAuditItems(items);
      return items[idx];
    }
    return request<AuditItem>(`/audits/${auditId}/items/${assetId}/mark`, {
      method: "POST",
      body: JSON.stringify({ result, notes }),
    });
  },

  async closeAudit(id: string): Promise<AuditCycle> {
    if (isMockAuth) {
      const cycles = db.getAuditCycles();
      const idx = cycles.findIndex(c => c.id === id);
      if (idx === -1) throw new ApiClientError("Audit cycle not found", 404);

      cycles[idx].status = "Closed";
      db.saveAuditCycles(cycles);

      // Flip Missing items → asset status = Lost
      const items = db.getAuditItems().filter(i => i.audit_cycle_id === id);
      const assets = db.getAssets();
      items.forEach(item => {
        if (item.result === "Missing") {
          const assetIdx = assets.findIndex(a => a.id === item.asset_id);
          if (assetIdx !== -1) assets[assetIdx].status = "Lost";
        }
      });
      db.saveAssets(assets);

      return cycles[idx];
    }
    return request<AuditCycle>(`/audits/${id}/close`, { method: "POST" });
  },

  async getDiscrepancyReport(id: string): Promise<AuditItem[]> {
    if (isMockAuth) {
      const allItems = db.getAuditItems();
      const assets = db.getAssets();
      const emps = db.getEmps();
      const allocs = db.getAllocations();

      return allItems
        .filter(i => i.audit_cycle_id === id && (i.result === "Missing" || i.result === "Damaged"))
        .map(item => {
          const asset = assets.find(a => a.id === item.asset_id);
          const alloc = allocs.find(al => al.asset_id === item.asset_id && al.status === "Active");
          const emp = alloc ? emps.find(e => e.id === alloc.held_by_user_id) : null;
          return {
            ...item,
            asset_tag: asset?.asset_tag || "Unknown",
            asset_name: asset?.name || "Unknown",
            asset_location: asset?.location || "Unknown",
            asset_serial: asset?.serial_number || "Unknown",
            assigned_user_name: emp?.name || "Unassigned",
          };
        });
    }
    return request<AuditItem[]>(`/audits/${id}/discrepancy-report`);
  },

  // ─── Reports ───
  async getReportUtilization(): Promise<{ most_used: MostUsedAssetReport[], by_dept: DeptUtilizationReport[] }> {
    if (isMockAuth) {
      return {
        most_used: [
          { id: "a1", name: "Generator Gen-X4", department: "Industrial Unit", hours: 482, trend: 12 },
          { id: "a2", name: "Forklift LX-200", department: "Logistics", hours: 410, trend: 5 },
        ],
        by_dept: [
          { department: "LOGISTICS", target: 80, actual: 85 },
          { department: "MFG", target: 90, actual: 88 },
          { department: "OPS", target: 75, actual: 70 },
          { department: "ADMIN", target: 50, actual: 40 },
          { department: "R&D", target: 60, actual: 65 },
          { department: "SALES", target: 70, actual: 72 },
        ]
      };
    }
    return request("/reports/utilization");
  },

  async getReportRetirement(): Promise<RetirementReport[]> {
    if (isMockAuth) {
      return [
        { id: "r1", name: "Transit Van V-12", lifespan_reached: 98, status: "Critical" },
        { id: "r2", name: "Server Cluster-B", lifespan_reached: 92, status: "Flag" },
      ];
    }
    return request<RetirementReport[]>("/reports/upcoming-retirement");
  },

  async getReportIdleAssets(): Promise<IdleReport> {
    if (isMockAuth) {
      return { active_pct: 60, idle_pct: 32, repair_pct: 8, total_idle: 342 };
    }
    // We could map this to department-allocation-summary or similar based on backend implementation
    return request<IdleReport>("/reports/idle-assets");
  },

  async getReportMaintenanceFrequency(): Promise<MaintenanceFreqReport[]> {
    if (isMockAuth) {
      return [
        { date: "01 MAY", incidents: 5 },
        { date: "07 MAY", incidents: 8 },
        { date: "14 MAY", incidents: 4 },
        { date: "21 MAY", incidents: 10 },
        { date: "28 MAY", incidents: 6 },
      ];
    }
    return request<MaintenanceFreqReport[]>("/reports/maintenance-frequency");
  },

  // ─── Notifications ───
  async getNotifications(): Promise<AppNotification[]> {
    if (isMockAuth) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const notifications: AppNotification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || "[]");
          // Return unread first, then by date descending
          notifications.sort((a, b) => {
            if (a.read === b.read) {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return a.read ? 1 : -1;
          });
          resolve(notifications);
        }, 300);
      });
    }
    return request<AppNotification[]>("/notifications");
  },

  async markNotificationRead(id: string): Promise<void> {
    if (isMockAuth) {
      return new Promise((resolve) => {
        const notifications: AppNotification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || "[]");
        const index = notifications.findIndex(n => n.id === id);
        if (index > -1) {
          notifications[index].read = true;
          localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
        }
        resolve();
      });
    }
    return request(`/notifications/${id}/read`, { method: "POST" });
  },

  async markAllNotificationsRead(): Promise<void> {
    if (isMockAuth) {
      return new Promise((resolve) => {
        const notifications: AppNotification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || "[]");
        notifications.forEach(n => n.read = true);
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
        resolve();
      });
    }
    // Note: Assuming a bulk read endpoint or calling individual ones. The contract doesn't explicitly define a bulk one,
    // so in a real scenario we might need to map over them or add a new endpoint.
    return request(`/notifications/read-all`, { method: "POST" });
  }
};

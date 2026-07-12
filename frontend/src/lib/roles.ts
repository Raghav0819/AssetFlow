// ─── Role Definitions ───
export type UserRole = "admin" | "asset_manager" | "department_head" | "employee";

export interface RoleConfig {
  label: string;
  description: string;
  color: string;       // Tailwind bg class
  textColor: string;   // Tailwind text class
  badge: string;       // Tailwind bg + text for badge
}

export const ROLES: Record<UserRole, RoleConfig> = {
  admin: {
    label: "Admin",
    description: "Full system access — departments, categories, roles, analytics",
    color: "from-rose-500 to-pink-600",
    textColor: "text-rose-700",
    badge: "bg-rose-50 text-rose-700 ring-rose-600/20",
  },
  asset_manager: {
    label: "Asset Manager",
    description: "Register, allocate, transfer, and maintain assets",
    color: "from-indigo-500 to-blue-600",
    textColor: "text-indigo-700",
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  },
  department_head: {
    label: "Department Head",
    description: "View department assets, approve transfers, book resources",
    color: "from-amber-500 to-orange-600",
    textColor: "text-amber-700",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  employee: {
    label: "Employee",
    description: "View assigned assets, book resources, raise requests",
    color: "from-slate-500 to-slate-600",
    textColor: "text-slate-700",
    badge: "bg-slate-100 text-slate-700 ring-slate-600/20",
  },
};

// ─── Pre-defined Email → Role Mapping ───
// Add your team's emails here with their roles.
// Any email not listed defaults to "employee".
export const EMAIL_ROLE_MAP: Record<string, UserRole> = {
  // Team members
  "admin@assetflow.com": "admin",
  "manager@assetflow.com": "asset_manager",
  "head@assetflow.com": "department_head",

  // Add real team emails below:
  // "shrey@example.com": "admin",
  // "raghav@example.com": "asset_manager",
  // "ashish@example.com": "department_head",
};

// ─── Demo User ───
// Used by the "Demo Login" button — full access, no Firebase needed
export const DEMO_USER = {
  uid: "demo-user-001",
  email: "demo@assetflow.com",
  displayName: "Demo Admin",
  role: "admin" as UserRole,
};

// ─── Helpers ───
export function getRoleForEmail(email: string): UserRole {
  return EMAIL_ROLE_MAP[email.toLowerCase()] ?? "employee";
}

export function getRoleConfig(role: UserRole): RoleConfig {
  return ROLES[role];
}

export function hasAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  // Admin always has full access
  if (userRole === "admin") return true;
  return requiredRoles.includes(userRole);
}

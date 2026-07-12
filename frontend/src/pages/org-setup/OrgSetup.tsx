import { useState, useEffect } from "react";
import { api } from "../../api/client";
import type { Department, Category, Employee, Role, UserStatus, CustomFieldSchema } from "../../types";

type ActiveTab = "departments" | "categories" | "employees" | "roles";

export default function OrgSetup() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("departments");

  // State data from API
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search/Filter states
  const [deptSearch, setDeptSearch] = useState("");
  const [catSearch, setCatSearch] = useState("");
  const [empSearch, setEmpSearch] = useState("");

  // Modal open states
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editRoleEmp, setEditRoleEmp] = useState<Employee | null>(null);

  // Form states - Department
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptParent, setNewDeptParent] = useState("");
  const [newDeptHead, setNewDeptHead] = useState("");
  const [newDeptStatus, setNewDeptStatus] = useState<UserStatus>("Active");

  // Form states - Category
  const [newCatName, setNewCatName] = useState("");
  const [customFields, setCustomFields] = useState<CustomFieldSchema[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "number" | "boolean">("text");

  // Role Assignment
  const [selectedRole, setSelectedRole] = useState<Role>("Employee");

  // Load setup data
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [deptsData, catsData, empsData] = await Promise.all([
        api.getDepartments(),
        api.getCategories(),
        api.getEmployees(),
      ]);
      setDepartments(deptsData);
      setCategories(catsData);
      setEmployees(empsData);
    } catch (err: any) {
      setError(err.message || "Failed to load organization settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form actions - Department
  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    try {
      await api.createDepartment({
        name: newDeptName.trim(),
        parent_department_id: newDeptParent || null,
        department_head_id: newDeptHead || null,
        status: newDeptStatus,
      });
      // Reset form & reload
      setNewDeptName("");
      setNewDeptParent("");
      setNewDeptHead("");
      setNewDeptStatus("Active");
      setDeptModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to add department.");
    }
  };

  // Form actions - Category Custom Fields
  const addCustomField = () => {
    if (!newFieldName.trim()) return;
    // Prevent duplicate name
    if (customFields.some((f) => f.name === newFieldName.trim())) return;

    setCustomFields([
      ...customFields,
      { name: newFieldName.trim().toLowerCase().replace(/\s+/g, "_"), type: newFieldType },
    ]);
    setNewFieldName("");
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  // Form actions - Category
  const handleAddCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await api.createCategory({
        name: newCatName.trim(),
        custom_fields_schema: customFields,
      });
      setNewCatName("");
      setCustomFields([]);
      setCatModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to add category.");
    }
  };

  // Update Role Assignment
  const handleUpdateRole = async () => {
    if (!editRoleEmp) return;
    try {
      await api.updateEmployeeRole(editRoleEmp.id, selectedRole);
      setEditRoleEmp(null);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update role.");
    }
  };

  // Filters
  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
      (d.head_name || "").toLowerCase().includes(deptSearch.toLowerCase()) ||
      d.status.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const filteredCats = categories.filter((c) =>
    c.name.toLowerCase().includes(catSearch.toLowerCase())
  );

  const filteredEmps = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.email.toLowerCase().includes(empSearch.toLowerCase()) ||
      (e.department_name || "").toLowerCase().includes(empSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <svg className="animate-spin w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm font-semibold text-slate-500">Loading organization settings…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ───── Breadcrumb & Page Header ───── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <nav className="flex text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 select-none">
            <span>Setup</span>
            <span className="mx-2">/</span>
            <span className="text-slate-600">Organization</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Organization Setup</h1>
          <p className="text-sm text-slate-500 mt-1">Configure your enterprise hierarchy, departments, and employee roles.</p>
        </div>

        {/* Global Tab Actions */}
        {activeTab === "departments" && (
          <button
            onClick={() => setDeptModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/20 hover:shadow-brand-700/30 transition-all duration-150 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Department
          </button>
        )}

        {activeTab === "categories" && (
          <button
            onClick={() => setCatModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/20 hover:shadow-brand-700/30 transition-all duration-150 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* ───── Page Tabs ───── */}
      <div className="border-b border-slate-100 flex gap-6">
        <button
          onClick={() => setActiveTab("departments")}
          className={`pb-4 text-sm font-bold border-b-2 transition-all duration-150 relative cursor-pointer ${
            activeTab === "departments"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Departments
          <span className="ml-2 px-2 py-0.5 bg-brand-100 text-brand-700 text-xs rounded-full font-bold">
            {departments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`pb-4 text-sm font-bold border-b-2 transition-all duration-150 cursor-pointer ${
            activeTab === "categories"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Categories
        </button>

        <button
          onClick={() => setActiveTab("employees")}
          className={`pb-4 text-sm font-bold border-b-2 transition-all duration-150 cursor-pointer ${
            activeTab === "employees"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Employees
        </button>

        <button
          onClick={() => setActiveTab("roles")}
          className={`pb-4 text-sm font-bold border-b-2 transition-all duration-150 cursor-pointer ${
            activeTab === "roles"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Role Assignment
        </button>
      </div>

      {/* ───── Content Area ───── */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm shadow-slate-100/50">
        
        {/* ─── Departments View ─── */}
        {activeTab === "departments" && (
          <div>
            {/* Search/Controls */}
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/20">
              <div className="w-full sm:w-96 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Filter by department name, head or status..."
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-150 rounded-xl text-sm text-gray-900 placeholder-slate-400 bg-white hover:border-slate-350 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/50 transition-all duration-150"
                />
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-700 transition-colors cursor-pointer">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-700 transition-colors cursor-pointer">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase bg-slate-50/30 select-none">
                    <th className="py-4 px-6">Department Name</th>
                    <th className="py-4 px-6">Department Head</th>
                    <th className="py-4 px-6">Parent Dept</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredDepts.length > 0 ? (
                    filteredDepts.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/50 transition-colors text-sm text-gray-800">
                        {/* Name */}
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            {d.name}
                          </div>
                        </td>
                        {/* Head */}
                        <td className="py-4 px-6 text-slate-600">
                          {d.head_name ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600">
                                {d.head_name.split(" ").map(w => w[0]).join("")}
                              </div>
                              {d.head_name}
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        {/* Parent */}
                        <td className="py-4 px-6 text-slate-500">{d.parent_name || <span className="text-slate-300">—</span>}</td>
                        {/* Status */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              d.status === "Active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${d.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                            {d.status}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-50 transition-all cursor-pointer">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                        No departments found matching search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Banner */}
            <div className="p-6 border-t border-slate-50 flex items-center justify-between text-sm text-slate-500 select-none">
              <span>Showing 1-{filteredDepts.length} of {departments.length} departments</span>
              <div className="flex gap-2">
                <button disabled className="px-3.5 py-1.5 border border-slate-200 text-slate-400 rounded-lg text-xs font-semibold disabled:opacity-50">Prev</button>
                <button disabled className="px-3.5 py-1.5 border border-slate-200 text-slate-400 rounded-lg text-xs font-semibold disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Categories View ─── */}
        {activeTab === "categories" && (
          <div>
            {/* Search/Controls */}
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/20">
              <div className="w-full sm:w-96 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Filter by category name..."
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-150 rounded-xl text-sm text-gray-900 placeholder-slate-400 bg-white hover:border-slate-350 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/50 transition-all duration-150"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase bg-slate-50/30 select-none">
                    <th className="py-4 px-6">Category Name</th>
                    <th className="py-4 px-6">Custom Schema Fields</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredCats.length > 0 ? (
                    filteredCats.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors text-sm text-gray-800">
                        {/* Name */}
                        <td className="py-4 px-6 font-semibold text-slate-900">{c.name}</td>
                        {/* Fields */}
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-2">
                            {c.custom_fields_schema.length > 0 ? (
                              c.custom_fields_schema.map((f, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                                  {f.name}
                                  <span className="text-[10px] text-slate-400">({f.type})</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic">No custom fields defined.</span>
                            )}
                          </div>
                        </td>
                        {/* Actions */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-50 transition-all cursor-pointer">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-slate-400 font-semibold">
                        No categories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Employees View ─── */}
        {activeTab === "employees" && (
          <div>
            {/* Search/Controls */}
            <div className="p-6 border-b border-slate-50 bg-slate-50/20">
              <div className="w-full sm:w-96 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Filter by name, email or department..."
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-150 rounded-xl text-sm text-gray-900 placeholder-slate-400 bg-white hover:border-slate-350 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/50 transition-all duration-150"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase bg-slate-50/30 select-none">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Email Address</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6">System Role</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEmps.length > 0 ? (
                    filteredEmps.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/50 transition-colors text-sm text-gray-800">
                        {/* Name */}
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center font-bold text-xs text-brand-600">
                              {e.name.split(" ").map(w => w[0]).join("")}
                            </div>
                            {e.name}
                          </div>
                        </td>
                        {/* Email */}
                        <td className="py-4 px-6 text-slate-600">{e.email}</td>
                        {/* Department */}
                        <td className="py-4 px-6 text-slate-500">{e.department_name || <span className="text-slate-300">—</span>}</td>
                        {/* Role */}
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${
                            e.role === "Admin" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                            e.role === "DeptHead" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                            e.role === "AssetManager" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            "bg-slate-50 text-slate-600 border border-slate-100"
                          }`}>
                            {e.role}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              e.status === "Active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${e.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                            {e.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                        No employees found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Role Assignment View ─── */}
        {activeTab === "roles" && (
          <div>
            <div className="p-6 border-b border-slate-50 bg-slate-50/20">
              <h3 className="text-sm font-bold text-slate-800">Promote or Modify Access Privileges</h3>
              <p className="text-xs text-slate-500 mt-0.5">Admin-only panel to transition profiles across role classifications.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase bg-slate-50/30 select-none">
                    <th className="py-4 px-6">Employee</th>
                    <th className="py-4 px-6">Current Role</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employees.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/50 transition-colors text-sm text-gray-800">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-slate-900">{e.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{e.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                          e.role === "Admin" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                          e.role === "DeptHead" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                          e.role === "AssetManager" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          "bg-slate-50 text-slate-600 border border-slate-100"
                        }`}>
                          {e.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            setEditRoleEmp(e);
                            setSelectedRole(e.role);
                          }}
                          className="px-4 py-2 border border-slate-200 hover:border-brand-500 hover:text-brand-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Change Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ───── Bottom Cards: Structure Integrity & AI Insights ───── */}
      {activeTab === "departments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Structure Integrity */}
          <div className="bg-brand-600 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between shadow-md shadow-brand-600/10 min-h-[160px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-4 -mt-4" />
            <div>
              <h3 className="text-lg font-bold">Structure Integrity</h3>
              <p className="text-brand-100 text-xs mt-1 leading-relaxed max-w-sm">
                All departments must have a designated Head and valid Parent Department for audit tracking and proper workflow approvals.
              </p>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-brand-100 transition-colors mt-4 text-left bg-transparent border-0 cursor-pointer p-0">
              View Hierarchy Diagram
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>

          {/* Card 2: AI Insights */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 flex gap-4 shadow-sm shadow-slate-100/50 min-h-[160px]">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0 text-purple-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex flex-col justify-between h-full">
              <div>
                <h3 className="text-sm font-bold text-slate-900">AI Organizational Insights</h3>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-sm">
                  Based on current asset utilization, consider splitting the 'Engineering' department into specialized clusters to improve allocation efficiency.
                </p>
              </div>
              <button className="text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors mt-4 text-left bg-transparent border-0 cursor-pointer p-0">
                Generate Optimization Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───── Modal Dialogs ───── */}

      {/* Modal 1: Add Department */}
      {deptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-100 shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Department</h3>
                <p className="text-xs text-slate-500">Insert details to expand your organizational matrix.</p>
              </div>
              <button
                onClick={() => setDeptModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddDept} className="space-y-4">
              {/* Dept Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales & Support"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all outline-none"
                />
              </div>

              {/* Parent Dept */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Parent Department</label>
                <select
                  value={newDeptParent}
                  onChange={(e) => setNewDeptParent(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all outline-none"
                >
                  <option value="">None (Top Level)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Head */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Department Head</label>
                <select
                  value={newDeptHead}
                  onChange={(e) => setNewDeptHead(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all outline-none"
                >
                  <option value="">Select Department Head</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Initial Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={newDeptStatus === "Active"}
                      onChange={() => setNewDeptStatus("Active")}
                      className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm font-semibold text-slate-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={newDeptStatus === "Inactive"}
                      onChange={() => setNewDeptStatus("Inactive")}
                      className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm font-semibold text-slate-700">Inactive</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeptModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/10 transition-colors cursor-pointer"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Category */}
      {catModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-100 shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Asset Category</h3>
                <p className="text-xs text-slate-500">Construct custom metadata schemas for specialized asset catalogs.</p>
              </div>
              <button
                onClick={() => setCatModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddCat} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laptops, Vehicles, Office Chairs"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all outline-none"
                />
              </div>

              {/* Dynamic Field Schemas Creator */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Custom Field Schema</label>
                <p className="text-[10px] text-slate-400 mt-0.5">Dynamically structure unique data fields for this asset classification.</p>
                
                {/* Fields List */}
                <div className="space-y-2">
                  {customFields.map((f, i) => (
                    <div key={i} className="flex justify-between items-center bg-white p-2 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                      <span>{f.name} <span className="text-[10px] text-slate-400 font-semibold">({f.type})</span></span>
                      <button
                        type="button"
                        onClick={() => removeCustomField(i)}
                        className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Field Inline */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Field name (e.g. warranty)"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs focus:border-brand-500 outline-none"
                  />
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as any)}
                    className="px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs focus:border-brand-500 outline-none"
                  >
                    <option value="text">text</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                  </select>
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Add Field
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/10 transition-colors cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Role Assignment */}
      {editRoleEmp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-100 shadow-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Modify Employee Privileges</h3>
              <p className="text-xs text-slate-500 mt-0.5">Assign access credentials for: <span className="font-bold text-slate-700">{editRoleEmp.name}</span></p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Select System Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all outline-none"
                >
                  <option value="Employee">Employee</option>
                  <option value="AssetManager">AssetManager</option>
                  <option value="DeptHead">DeptHead</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditRoleEmp(null)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateRole}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/10 transition-colors cursor-pointer"
                >
                  Save Access Level
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, type FormEvent } from "react";
import type { Category, AssetCreate, AssetStatus } from "../../types";
import { api, ApiClientError } from "../../api/client";

interface RegisterAssetModalProps {
  categories: Category[];
  onClose: () => void;
  onCreated: () => void;
}

const STATUS_OPTIONS: AssetStatus[] = ["Available", "Allocated", "Reserved"];

export default function RegisterAssetModal({ categories, onClose, onCreated }: RegisterAssetModalProps) {
  const [form, setForm] = useState({
    asset_tag: "",
    name: "",
    category_id: "",
    serial_number: "",
    acquisition_date: "",
    acquisition_cost: "",
    condition: "New",
    location: "",
    is_bookable: false,
    status: "Available" as AssetStatus,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.asset_tag || !form.name || !form.category_id || !form.serial_number || !form.location) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload: AssetCreate = {
        ...form,
        custom_field_values: {},
        photo_url: null,
      };
      await api.createAsset(payload);
      onCreated();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to register asset. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="px-7 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Register New Asset</h2>
            <p className="text-sm text-slate-500 mt-0.5">Add a new asset to the enterprise directory</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-7 py-5 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Row 1: Asset Tag + Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Asset Tag <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="AF-XXXX"
                value={form.asset_tag}
                onChange={(e) => update("asset_tag", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-gray-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Asset Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. MacBook Pro 16&quot;"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-gray-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/50 transition-all"
              />
            </div>
          </div>

          {/* Row 2: Category + Serial Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category_id}
                onChange={(e) => update("category_id", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-gray-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/50 transition-all bg-white cursor-pointer appearance-none"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Serial Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="SN-XXXXXXXX"
                value={form.serial_number}
                onChange={(e) => update("serial_number", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-gray-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/50 transition-all"
              />
            </div>
          </div>

          {/* Row 3: Acquisition Date + Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Acquisition Date</label>
              <input
                type="date"
                value={form.acquisition_date}
                onChange={(e) => update("acquisition_date", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-gray-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Acquisition Cost</label>
              <input
                type="text"
                placeholder="0.00"
                value={form.acquisition_cost}
                onChange={(e) => update("acquisition_cost", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-gray-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/50 transition-all"
              />
            </div>
          </div>

          {/* Row 4: Condition + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Condition</label>
              <select
                value={form.condition}
                onChange={(e) => update("condition", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-gray-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/50 transition-all bg-white cursor-pointer appearance-none"
              >
                <option value="New">New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. HQ Floor 3"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-gray-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/50 transition-all"
              />
            </div>
          </div>

          {/* Row 5: Status + Bookable */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Initial Status</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-gray-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/50 transition-all bg-white cursor-pointer appearance-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_bookable}
                  onChange={(e) => update("is_bookable", e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-sm text-slate-700 font-medium">Bookable Resource</span>
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-600/15 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Registering…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Register Asset
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

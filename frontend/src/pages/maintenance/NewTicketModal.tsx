import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { api } from "../../api/client";
import type { Asset } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewTicketModal({ isOpen, onClose, onSuccess }: Props) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    asset_id: "",
    issue_description: "",
    priority: "Medium" as "Low" | "Medium" | "High",
  });

  useEffect(() => {
    if (isOpen) {
      loadAssets();
      setFormData({ asset_id: "", issue_description: "", priority: "Medium" });
      setError("");
    }
  }, [isOpen]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await api.getAssets();
      setAssets(data.items);
    } catch (err) {
      setError("Failed to load assets.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.asset_id || !formData.issue_description) {
      setError("Asset and Description are required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await api.createMaintenanceRequest({
        asset_id: formData.asset_id,
        issue_description: formData.issue_description,
        priority: formData.priority,
        photo_url: null,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">New Maintenance Ticket</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Asset</label>
            <select
              value={formData.asset_id}
              onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={loading}
            >
              <option value="">Select an asset...</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.asset_tag} - {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Issue Description</label>
            <textarea
              value={formData.issue_description}
              onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
              rows={4}
              placeholder="Describe the issue in detail..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="Low">Normal (Low)</option>
              <option value="Medium">Medium</option>
              <option value="High">Urgent (High)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70"
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

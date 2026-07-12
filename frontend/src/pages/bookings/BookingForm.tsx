import { useState } from "react";
import type { Asset, Employee, BookingCreate } from "../../types";
import { api, ApiClientError } from "../../api/client";

interface BookingFormProps {
  selectedAsset: Asset | null;
  employees: Employee[];
  formDate: string;
  formStartTime: string;
  formEndTime: string;
  onDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onBookingSuccess: () => void;
}

export default function BookingForm({
  selectedAsset,
  employees,
  formDate,
  formStartTime,
  formEndTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onBookingSuccess,
}: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedAsset) {
      setError("Please select an asset");
      return;
    }

    if (!formDate || !formStartTime || !formEndTime) {
      setError("Please fill in all fields");
      return;
    }

    const startDateTime = `${formDate}T${formStartTime}:00Z`;
    const endDateTime = `${formDate}T${formEndTime}:00Z`;

    const startTime = new Date(startDateTime);
    const endTime = new Date(endDateTime);

    if (endTime <= startTime) {
      setError("End time must be after start time");
      return;
    }

    setLoading(true);
    try {
      const currentUser = employees.find(e => e.email === "priya@example.com") || employees[0];

      const bookingData: BookingCreate = {
        resource_asset_id: selectedAsset.id,
        booked_by: currentUser.id,
        start_time: startDateTime,
        end_time: endDateTime,
      };

      await api.createBooking(bookingData);
      setSuccess(true);
      onBookingSuccess();
      
      // Reset form
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to create booking");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
      <h2 className="text-lg font-bold text-gray-900 mb-4">New Booking</h2>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        {/* Asset Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resource Asset
          </label>
          <div className="px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm text-gray-900">
            {selectedAsset ? (
              <div>
                <p className="font-medium">{selectedAsset.name}</p>
                <p className="text-xs text-slate-600">{selectedAsset.asset_tag}</p>
              </div>
            ) : (
              <span className="text-slate-500">Select an asset above</span>
            )}
          </div>
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Booking Date
          </label>
          <input
            id="date"
            type="date"
            value={formDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Start Time */}
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <input
            id="startTime"
            type="time"
            value={formStartTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* End Time */}
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <input
            id="endTime"
            type="time"
            value={formEndTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Duration Display */}
        {formStartTime && formEndTime && (
          <div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
            <p className="text-sm text-brand-900">
              Duration: <span className="font-semibold">
                {Math.round((Date.parse(`2000-01-01T${formEndTime}:00`) - Date.parse(`2000-01-01T${formStartTime}:00`)) / (1000 * 60))} minutes
              </span>
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">✓ Booking created successfully!</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedAsset}
          className="w-full mt-6 px-4 py-2.5 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {loading ? "Creating..." : "Book Resource"}
        </button>
      </form>
    </div>
  );
}

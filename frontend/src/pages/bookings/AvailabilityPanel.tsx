import { useEffect, useState } from "react";
import type { Asset, Booking, BookingAvailability } from "../../types";
import { api } from "../../api/client";

interface AvailabilityPanelProps {
  selectedAsset: Asset | null;
  formDate: string;
  formStartTime: string;
  formEndTime: string;
  assetBookings: Booking[];
}

export default function AvailabilityPanel({
  selectedAsset,
  formDate,
  formStartTime,
  formEndTime,
  assetBookings,
}: AvailabilityPanelProps) {
  const [availability, setAvailability] = useState<BookingAvailability | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedAsset || !formDate || !formStartTime || !formEndTime) {
      setAvailability(null);
      return;
    }

    setLoading(true);
    const startDateTime = `${formDate}T${formStartTime}:00Z`;
    const endDateTime = `${formDate}T${formEndTime}:00Z`;

    api
      .checkBookingAvailability(selectedAsset.id, startDateTime, endDateTime)
      .then((result) => {
        setAvailability(result);
      })
      .catch(() => {
        setAvailability({
          asset_id: selectedAsset.id,
          is_available: false,
          conflict_message: "Error checking availability",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedAsset, formDate, formStartTime, formEndTime]);

  // Parse time for display
  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    return `${hours}:${minutes}`;
  };

  // Check if asset is not bookable
  if (selectedAsset && !selectedAsset.is_bookable) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Availability</h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🚫</div>
            <p className="text-sm text-slate-600">This asset is not bookable</p>
          </div>
        </div>
      </div>
    );
  }

  // No asset selected
  if (!selectedAsset) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Availability</h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📅</div>
            <p className="text-sm text-slate-600">Select an asset to check availability</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Availability Status</h2>

      <div className="flex-1 space-y-4">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin text-brand-600 text-2xl">⏳</div>
            <p className="text-sm text-slate-600 mt-2">Checking availability...</p>
          </div>
        )}

        {/* Availability Result */}
        {!loading && availability && (
          <>
            {availability.is_available ? (
              <>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <p className="font-semibold text-green-900">Available</p>
                      <p className="text-sm text-green-700">This time slot is free for booking</p>
                    </div>
                  </div>
                </div>

                {/* Booking Time Summary */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-slate-600 uppercase">Requested Slot</p>
                  <div className="text-sm text-gray-900">
                    <p>Date: <span className="font-medium">{formDate}</span></p>
                    <p>Time: <span className="font-medium">{parseTime(formStartTime)} - {parseTime(formEndTime)}</span></p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✕</span>
                    <div>
                      <p className="font-semibold text-red-900">Not Available</p>
                      <p className="text-sm text-red-700">{availability.conflict_message}</p>
                    </div>
                  </div>
                </div>

                {/* Conflicting Bookings */}
                {availability.existing_bookings && availability.existing_bookings.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-medium text-slate-600 uppercase">Existing Bookings</p>
                    <div className="space-y-2">
                      {availability.existing_bookings.map((booking) => (
                        <div key={booking.id} className="text-sm border-l-2 border-red-300 pl-2 py-1">
                          <p className="text-gray-900">
                            <span className="font-medium">{booking.booker_name}</span>
                          </p>
                          <p className="text-xs text-slate-600">
                            {booking.start_time.split('T')[1].substring(0, 5)} - {booking.end_time.split('T')[1].substring(0, 5)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* All Bookings for This Asset on Selected Date */}
        {!loading && formDate && (
          <div className="border-t border-slate-200 pt-4">
            <p className="text-xs font-medium text-slate-600 uppercase mb-2">All Bookings on {formDate}</p>
            {assetBookings.length === 0 ? (
              <p className="text-sm text-slate-600">No bookings scheduled for this date</p>
            ) : (
              <div className="space-y-2">
                {assetBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="text-sm bg-blue-50 border border-blue-200 rounded p-2"
                  >
                    <p className="text-gray-900">
                      <span className="font-medium">{booking.booker_name}</span>
                      <span className="text-slate-600"> · {booking.status}</span>
                    </p>
                    <p className="text-xs text-slate-600">
                      {booking.start_time.split('T')[1].substring(0, 5)} - {booking.end_time.split('T')[1].substring(0, 5)} ({booking.duration_hours?.toFixed(1)} hrs)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

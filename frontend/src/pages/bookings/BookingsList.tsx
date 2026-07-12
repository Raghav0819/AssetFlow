import { useState } from "react";
import type { Booking, BookingStatus } from "../../types";

interface BookingsListProps {
  bookings: Booking[];
  filterStatus: "all" | BookingStatus;
  onFilterChange: (status: "all" | BookingStatus) => void;
  onCancelBooking: (bookingId: string) => void;
  loading: boolean;
}

const statusConfig: Record<BookingStatus, { color: string; bg: string; icon: string }> = {
  Upcoming: { color: "text-blue-700", bg: "bg-blue-50", icon: "📅" },
  Ongoing: { color: "text-green-700", bg: "bg-green-50", icon: "▶️" },
  Completed: { color: "text-slate-700", bg: "bg-slate-50", icon: "✓" },
  Cancelled: { color: "text-red-700", bg: "bg-red-50", icon: "✕" },
};

export default function BookingsList({
  bookings,
  filterStatus,
  onFilterChange,
  onCancelBooking,
  loading,
}: BookingsListProps) {
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const handleCancelClick = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      setCancelingId(bookingId);
      try {
        await onCancelBooking(bookingId);
      } finally {
        setCancelingId(null);
      }
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
  };

  const statusOptions: Array<"all" | BookingStatus> = ["all", "Upcoming", "Ongoing", "Completed", "Cancelled"];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Booking History</h2>
        <div className="flex gap-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => onFilterChange(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === status
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {status === "all" ? "All" : status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin text-brand-600 text-2xl mb-3">⏳</div>
          <p className="text-slate-600">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-slate-600">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const config = statusConfig[booking.status];
            const startTime = formatDateTime(booking.start_time);
            const endTime = formatDateTime(booking.end_time);

            return (
              <div
                key={booking.id}
                className={`border-2 border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors ${config.bg}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{config.icon}</span>
                      <h3 className="font-semibold text-gray-900">{booking.asset_name}</h3>
                      <span className={`text-xs font-bold uppercase ${config.color}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-600 uppercase">Booked By</p>
                        <p className="text-gray-900 font-medium">{booking.booker_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 uppercase">Asset Tag</p>
                        <p className="text-gray-900 font-medium">{booking.asset_tag}</p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-600 uppercase">Start</p>
                        <p className="text-gray-900">{startTime.date}</p>
                        <p className="text-xs text-slate-600">{startTime.time}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 uppercase">End</p>
                        <p className="text-gray-900">{endTime.date}</p>
                        <p className="text-xs text-slate-600">{endTime.time}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 uppercase">Duration</p>
                        <p className="text-gray-900 font-medium">{booking.duration_hours?.toFixed(1)} hrs</p>
                      </div>
                    </div>
                  </div>

                  {booking.status !== "Cancelled" && booking.status !== "Completed" && (
                    <button
                      onClick={() => handleCancelClick(booking.id)}
                      disabled={cancelingId === booking.id}
                      className="ml-4 px-3 py-2 text-xs font-medium text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {cancelingId === booking.id ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import type { Booking } from "../../types";

interface CalendarDayDetailProps {
  date: string;
  bookings: Booking[];
  onClose: () => void;
}

export default function CalendarDayDetail({ date, bookings, onClose }: CalendarDayDetailProps) {
  const formatDate = (isoString: string) => {
    const dateObj = new Date(isoString);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const dateObj = new Date(isoString);
    return dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const statusConfig: Record<string, { color: string; icon: string }> = {
    Upcoming: { color: "text-blue-700 bg-blue-50 border-blue-200", icon: "📅" },
    Ongoing: { color: "text-green-700 bg-green-50 border-green-200", icon: "▶️" },
    Completed: { color: "text-slate-700 bg-slate-50 border-slate-200", icon: "✓" },
    Cancelled: { color: "text-red-700 bg-red-50 border-red-200", icon: "✕" },
  };

  const dayBookings = bookings.filter(b => b.start_time.split("T")[0] === date);
  const sortedBookings = dayBookings.sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{formatDate(date)}</h3>
          <p className="text-xs text-slate-500 mt-1">{sortedBookings.length} booking(s)</p>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          ✕ Close
        </button>
      </div>

      {sortedBookings.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🗓️</div>
          <p className="text-slate-600">No bookings scheduled for this date</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedBookings.map((booking) => {
            const config = statusConfig[booking.status];
            return (
              <div
                key={booking.id}
                className={`border-l-4 pl-4 py-3 rounded-r-lg ${config.color} border-l-current`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{config.icon}</span>
                      <h4 className="font-semibold text-gray-900">{booking.asset_name}</h4>
                      <span className="text-xs font-bold uppercase opacity-70">
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">
                      <span className="font-medium">{booking.booker_name}</span>
                      <span className="mx-2">•</span>
                      <span>{booking.asset_tag}</span>
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-slate-600 uppercase">Start</p>
                        <p className="font-medium">{formatTime(booking.start_time)}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 uppercase">End</p>
                        <p className="font-medium">{formatTime(booking.end_time)}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 uppercase">Duration</p>
                        <p className="font-medium">{booking.duration_hours?.toFixed(1)} hrs</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import type { Booking, BookingStatus } from "../../types";

interface BookingCalendarProps {
  bookings: Booking[];
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
}

interface CalendarDay {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  bookings: Booking[];
}

export default function BookingCalendar({ bookings, onDateSelect, selectedDate }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    const days: CalendarDay[] = [];

    // Previous month's days
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = getDaysInMonth(prevMonth);

    for (let i = firstDay - 1; i >= 0; i--) {
      const dayOfMonth = daysInPrevMonth - i;
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), dayOfMonth);
      days.push({
        date: date.toISOString().split("T")[0],
        dayOfMonth,
        isCurrentMonth: false,
        bookings: [],
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      const dayBookings = bookings.filter(
        (b) => b.start_time.split("T")[0] === dateStr && b.status !== "Cancelled"
      );
      days.push({
        date: dateStr,
        dayOfMonth: day,
        isCurrentMonth: true,
        bookings: dayBookings,
      });
    }

    // Next month's days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = new Date(year, month + 1, day);
      days.push({
        date: nextMonth.toISOString().split("T")[0],
        dayOfMonth: day,
        isCurrentMonth: false,
        bookings: [],
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const statusConfig: Record<BookingStatus, { color: string; abbr: string }> = {
    Upcoming: { color: "bg-blue-100 text-blue-700", abbr: "UP" },
    Ongoing: { color: "bg-green-100 text-green-700", abbr: "ON" },
    Completed: { color: "bg-slate-100 text-slate-700", abbr: "✓" },
    Cancelled: { color: "bg-red-100 text-red-700", abbr: "X" },
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0];
    return dateStr === today;
  };

  const isSelected = (dateStr: string) => {
    return selectedDate === dateStr;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Calendar Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{monthName}</h2>
          <p className="text-xs text-slate-500 mt-1">Booking Calendar View</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Today
          </button>
          <button
            onClick={handlePrevMonth}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            ←
          </button>
          <button
            onClick={handleNextMonth}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center font-semibold text-xs text-slate-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, idx) => (
          <button
            key={idx}
            onClick={() => onDateSelect?.(day.date)}
            className={`aspect-square p-2 rounded-lg border-2 transition-all flex flex-col items-start justify-start ${
              isSelected(day.date)
                ? "border-brand-500 bg-brand-50"
                : isToday(day.date)
                ? "border-brand-300 bg-brand-50"
                : day.isCurrentMonth
                ? "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                : "border-slate-100 bg-slate-50"
            } ${!day.isCurrentMonth && "opacity-40"}`}
          >
            {/* Day Number */}
            <span
              className={`text-xs font-bold ${
                day.isCurrentMonth ? "text-gray-900" : "text-slate-600"
              }`}
            >
              {day.dayOfMonth}
            </span>

            {/* Booking Indicators */}
            {day.bookings.length > 0 && (
              <div className="mt-1 w-full flex flex-col gap-0.5">
                {day.bookings.slice(0, 2).map((booking, bidx) => {
                  const config = statusConfig[booking.status];
                  return (
                    <div
                      key={bidx}
                      className={`text-[10px] font-medium px-1 py-0.5 rounded truncate w-full text-center ${config.color}`}
                      title={booking.asset_name}
                    >
                      {config.abbr}
                    </div>
                  );
                })}
                {day.bookings.length > 2 && (
                  <div className="text-[9px] text-slate-600 text-center px-1">
                    +{day.bookings.length - 2}
                  </div>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
          <span className="text-slate-600">Upcoming</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-slate-600">Ongoing</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 bg-slate-100 border border-slate-300 rounded"></div>
          <span className="text-slate-600">Completed</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-slate-600">Cancelled</span>
        </div>
      </div>
    </div>
  );
}

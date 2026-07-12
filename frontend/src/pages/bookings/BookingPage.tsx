import { useState, useEffect, useCallback } from "react";
import type { Asset, Booking, Employee } from "../../types";
import { api } from "../../api/client";

import AssetSearchPanel from "./AssetSearchPanel";
import BookingForm from "./BookingForm";
import AvailabilityPanel from "./AvailabilityPanel";
import BookingsList from "./BookingsList";
import BookingCalendar from "./BookingCalendar";
import CalendarDayDetail from "./CalendarDayDetail";

export default function BookingPage() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [formDate, setFormDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "Upcoming" | "Ongoing" | "Completed" | "Cancelled">("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [showDayDetail, setShowDayDetail] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [empData, bookingData] = await Promise.all([
        api.getEmployees(),
        api.getBookings(),
      ]);
      setEmployees(empData);
      setBookings(bookingData);

      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setFormDate(today);
    } catch (err) {
      console.error("Failed to load booking page data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBookingSuccess = async () => {
    // Refresh bookings
    try {
      const updatedBookings = await api.getBookings();
      setBookings(updatedBookings);
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormStartTime("");
      setFormEndTime("");
    } catch (err) {
      console.error("Failed to refresh bookings", err);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await api.cancelBooking(bookingId);
      const updatedBookings = await api.getBookings();
      setBookings(updatedBookings);
    } catch (err) {
      console.error("Failed to cancel booking", err);
    }
  };

  const filteredBookings = filterStatus === "all" 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  const assetBookings = selectedAsset 
    ? bookings.filter(b => b.resource_asset_id === selectedAsset.id)
    : [];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 relative animate-scale-in">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[500px] bg-gradient-to-br from-brand-50/50 via-white to-transparent blur-3xl -z-10 rounded-bl-[100px] pointer-events-none" />

      {/* Header */}
      <div className="px-10 pt-8 pb-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Resource Booking</h1>
          <p className="text-sm text-slate-500 mt-1">Schedule bookable assets with real-time availability checks.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
            Export Calendar
          </button>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
          
          {/* Top Row: Search, Form, Availability */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[400px]">
            {/* Left: Asset Search */}
            <AssetSearchPanel 
              selectedAsset={selectedAsset} 
              onSelectAsset={setSelectedAsset} 
            />

            {/* Center: Booking Form */}
            <BookingForm 
              selectedAsset={selectedAsset}
              employees={employees}
              formDate={formDate}
              formStartTime={formStartTime}
              formEndTime={formEndTime}
              onDateChange={setFormDate}
              onStartTimeChange={setFormStartTime}
              onEndTimeChange={setFormEndTime}
              onBookingSuccess={handleBookingSuccess}
            />

            {/* Right: Availability & Conflicts */}
            <AvailabilityPanel 
              selectedAsset={selectedAsset}
              formDate={formDate}
              formStartTime={formStartTime}
              formEndTime={formEndTime}
              assetBookings={assetBookings}
            />
          </div>

          {/* Bottom: Bookings List or Calendar */}
          {viewMode === "calendar" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar (Left/Main) */}
              <div className="lg:col-span-2">
                <BookingCalendar 
                  bookings={bookings}
                  selectedDate={formDate}
                  onDateSelect={(date) => {
                    setFormDate(date);
                    setShowDayDetail(true);
                  }}
                />
              </div>

              {/* Day Detail (Right) */}
              {showDayDetail && (
                <div>
                  <CalendarDayDetail 
                    date={formDate}
                    bookings={bookings}
                    onClose={() => setShowDayDetail(false)}
                  />
                </div>
              )}
            </div>
          ) : (
            <BookingsList 
              bookings={filteredBookings}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              onCancelBooking={handleCancelBooking}
              loading={loading}
            />
          )}

          {/* View Toggle */}
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                viewMode === "calendar"
                  ? "bg-brand-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              📅 Calendar View
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                viewMode === "list"
                  ? "bg-brand-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              📋 List View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

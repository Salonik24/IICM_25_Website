"use client";

import React, { useEffect, useState } from "react";

type Event = {
  id: number;
  name: string;
  description?: string;
  date: string;
  start_time: string;
  end_time?: string;
  venue?: string;
};

export default function SchedulePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    fetch("/events.json")
      .then((res) => res.json())
      .then((data: Event[]) => {
        const sorted = data.sort(
          (a: Event, b: Event) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setEvents(sorted);
      })
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  // Group events by date → Day 1, Day 2...
  const grouped: Record<string, Event[]> = events.reduce(
    (acc: Record<string, Event[]>, ev: Event) => {
      if (!acc[ev.date]) acc[ev.date] = [];
      acc[ev.date].push(ev);
      return acc;
    },
    {}
  );

  const dates = Object.keys(grouped);
  const dayNames = dates.map((_, i) => `Day ${i + 1}`);

  // Filter by selected day
  const filteredByDay =
    selectedDay === "All"
      ? events
      : grouped[dates[parseInt(selectedDay.split(" ")[1]) - 1]] || [];

  // Determine event status safely
  const getEventStatus = (event: Event): "Upcoming" | "Live" | "Past" => {
    const now = new Date();
    const [year, month, day] = event.date.split("-").map(Number);
    const [sh, sm, ss] = event.start_time.split(":").map(Number);
    const start = new Date(year, month - 1, day, sh, sm, ss);
    const end = event.end_time
      ? (() => {
          const [eh, em, es] = event.end_time.split(":").map(Number);
          return new Date(year, month - 1, day, eh, em, es);
        })()
      : null;

    if (
      now.toDateString() === start.toDateString() &&
      start <= now &&
      (!end || now <= end)
    )
      return "Live";
    if (start > now) return "Upcoming";
    return "Past";
  };

  // Apply filters
  const filtered = filteredByDay.filter((event) => {
    const status = getEventStatus(event);
    return statusFilter === "All" || status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-[#fafafa] p-8 font-sans">
      {/* 🔹 Top Bar */}
      <div className="flex flex-wrap justify-between items-center mb-8 gap-3 relative">
        {/* Day Tabs */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedDay("All")}
            className={`px-4 py-2 rounded-md font-medium transition ${
              selectedDay === "All"
                ? "bg-white border border-gray-200 text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            All
          </button>
          {dayNames.map((name, i) => (
            <button
              key={i}
              onClick={() => setSelectedDay(name)}
              className={`px-4 py-2 rounded-md font-medium transition ${
                selectedDay === name
                  ? "bg-white border border-gray-200 text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* 🔹 Custom Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 rounded-lg px-4 py-2 bg-white hover:border-purple-400 transition"
          >
            <span>
              {statusFilter === "All"
                ? "All Status"
                : statusFilter === "Upcoming"
                ? "Upcoming"
                : statusFilter === "Live"
                ? "Live"
                : "Past"}
            </span>
            <svg
              className={`w-4 h-4 transform transition ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-md z-10">
              {["All", "Upcoming", "Live", "Past"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-50 ${
                    statusFilter === status ? "text-purple-700 font-medium" : "text-gray-600"
                  }`}
                >
                  {status === "All" ? "All Status" : status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🔹 Event Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map((event: Event) => {
            const status = getEventStatus(event);

            const badgeClass =
              status === "Upcoming"
                ? "bg-purple-100 text-purple-700"
                : status === "Live"
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-600";

            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-purple-400 transition"
              >
                {/* Badge */}
                <div className="mb-3">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}`}
                  >
                    {status}
                  </span>
                </div>

                {/* Event Info */}
                <h3 className="text-xl font-semibold mb-1 text-gray-800">
                  {event.name}
                </h3>
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {event.description}
                </p>

                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    📅{" "}
                    {new Date(event.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p>
                    🕒 {event.start_time} – {event.end_time || "N/A"}
                  </p>
                  <p>📍 {event.venue}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center col-span-full">
            No events available.
          </p>
        )}
      </div>
    </div>
  );
}
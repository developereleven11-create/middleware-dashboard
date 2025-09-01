"use client";

import { useState } from "react";
import { Search, Calendar, User } from "lucide-react";

export default function Topbar() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    alert(`🔍 Searching for Order: ${query} (hook this into API later)`);
    setQuery("");
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex items-center bg-gray-900 rounded-lg px-3 py-2 w-80"
      >
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search order number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent focus:outline-none text-sm flex-1"
        />
      </form>

      {/* Right Side Controls */}
      <div className="flex items-center space-x-6">
        {/* Date Range Filter */}
        <button className="flex items-center space-x-2 bg-gray-900 px-3 py-2 rounded-lg hover:bg-gray-800">
          <Calendar size={16} className="text-gray-400" />
          <span className="text-sm text-gray-300">Last 30 Days</span>
        </button>

        {/* User Icon */}
        <div className="bg-gray-800 p-2 rounded-full">
          <User size={18} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Overview from "./dashboard/Overview";
import ManageBills from "./dashboard/ManageBills";
import Notifications from "./dashboard/Notifications";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <nav className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-md text-gray-700 ${
              activeTab === "overview"
                ? "bg-teal-500 text-white font-semibold"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => handleTabChange("overview")}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 rounded-md text-gray-700 ${
              activeTab === "manage-bills"
                ? "bg-teal-500 text-white font-semibold"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => handleTabChange("manage-bills")}
          >
            Manage Bills
          </button>
          <button
            className={`px-4 py-2 rounded-md text-gray-700 ${
              activeTab === "notifications"
                ? "bg-teal-500 text-white font-semibold"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => handleTabChange("notifications")}
          >
            Notifications
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "overview" && <Overview />}
        {activeTab === "manage-bills" && <ManageBills />}
        {activeTab === "notifications" && <Notifications />}
      </div>
    </div>
  );
};

export default Dashboard;

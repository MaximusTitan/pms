"use client";

import React from "react";

export default function AdminPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold">Welcome to Admin Panel</h2>
          <p className="text-gray-600">
            Manage your application settings here.
          </p>
        </div>
      </div>
    </div>
  );
}

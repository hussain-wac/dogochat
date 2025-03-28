import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900">
        <Navbar />
      </div>
      {/* Outlet takes remaining height */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const MainLayout = () => {
  return (
    <div className="">
      {/* Sticky Navbar */}
     
        <Navbar />
  
      {/* Outlet takes remaining height */}
      <div className="overflow-hidden h-[calc(100vh_-_63px)]
">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
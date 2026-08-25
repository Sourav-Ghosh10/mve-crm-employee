import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import GlobalLoader from "../common/GlobalLoader";
import { useAttendance } from "../../hooks/useAttendance";
import IncompleteShiftModal from "../features/attendance/IncompleteShiftModal";



const DRAWER_WIDTH = 260;
const HEADER_HEIGHT = 64; // 4rem = 64px

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { attendanceData, actions, loading } = useAttendance();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };


  return (
    <div className="min-h-screen bg-background">

      {/* Header - Full width at top */}
      <Header handleDrawerToggle={handleDrawerToggle} />

      {/* Sidebar - Below header */}
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* Main Content Area */}
      <main
        className="min-h-screen flex flex-col"
        style={{
          paddingTop: HEADER_HEIGHT,
          marginLeft: 0,
        }}
      >
        <GlobalLoader />
        {/* Desktop: offset by sidebar width */}
        <div
          className="hidden md:flex md:flex-col flex-auto"
          style={{ marginLeft: DRAWER_WIDTH }}
        >
          <div className="flex-1 p-6">
            <Outlet />
          </div>
          <div className="mt-auto">
            <Footer />
          </div>
        </div>

        {/* Mobile: full width */}
        <div className="md:hidden flex-auto flex flex-col">
          <div className="flex-1 p-4">
            <Outlet />
          </div>
          <div className="mt-auto">
            <Footer />
          </div>
        </div>
      </main>

      {attendanceData?.requiresLogoutCorrection && attendanceData?.incompleteShift && (
        <IncompleteShiftModal
          shift={attendanceData.incompleteShift}
          onSave={actions.fixIncompleteShift}
          loading={loading}
        />
      )}
    </div>

  );
};

export default MainLayout;

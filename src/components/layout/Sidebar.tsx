import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  Calendar,
  FileText,
  X,
  User,
  // Settings,
  Receipt,
  Banknote,
  // Bell,
} from "lucide-react";
import { cn } from "../../lib/utils";

const DRAWER_WIDTH = 260;
const HEADER_HEIGHT = 64; // 4rem = 64px

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const menuItems = [
  { text: "Dashboard", icon: LayoutDashboard, path: "/" },
  // { text: "Announcements", icon: Bell, path: "/announcements" },
  { text: "Attendance", icon: Clock, path: "/attendance" },
  { text: "Schedule", icon: Calendar, path: "/schedule" },
  { text: "Leave", icon: FileText, path: "/leave" },
  { text: "Reimbursements", icon: Receipt, path: "/reimbursements" },
  { text: "Payroll", icon: Banknote, path: "/payroll" },
  { text: "My Profile", icon: User, path: "/profile" },
  // { text: "Settings", icon: Settings, path: "/settings" },
];

const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  handleDrawerToggle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (mobileOpen) {
      handleDrawerToggle();
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-gradient-to-b from-primary to-primary-dark text-white">
      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all duration-200",
                "border-l-4 hover:bg-white/10",
                isActive
                  ? "bg-white/15 border-accent font-semibold text-white"
                  : "border-transparent text-white/80 hover:text-white",
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.text}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-white/40 text-center">
          &copy; {new Date().getFullYear()} CodecIT
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          style={{ top: HEADER_HEIGHT }}
          onClick={handleDrawerToggle}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed left-0 bottom-0 z-40 transform transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ top: HEADER_HEIGHT, width: DRAWER_WIDTH }}
      >
        <div className="absolute top-2 right-2 md:hidden z-10">
          <button
            onClick={handleDrawerToggle}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop permanent drawer - starts below header */}
      <aside
        className="hidden md:block fixed left-0 bottom-0 z-30 shadow-xl"
        style={{ top: HEADER_HEIGHT, width: DRAWER_WIDTH }}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;

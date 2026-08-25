import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  LogOut,
  User,
  Settings,
  Bell,
  ChevronDown,
  Clock,
  Calendar,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import { cn } from "../../lib/utils";
import logoStatic from "../../assets/codecit-logo.png";
import { announcementService } from "../../services/announcementService";
import { useSocket } from "../../hooks/useSocket";
import { formatInTimezone } from "../../utils/timezone";
import { setUnreadCount } from "../../store/slices/notificationSlice";
import NotificationPermissionModal from "../features/notifications/NotificationPermissionModal";
import LocationPermissionModal from "../features/location/LocationPermissionModal";
import type { Announcement } from "../../types/announcement.types";

interface HeaderNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  priority: string;
}


interface HeaderProps {
  handleDrawerToggle: () => void;
}

interface NotificationDropdownProps {
  notificationDropdownOpen: boolean;
  setNotificationDropdownOpen: (open: boolean) => void;
  setUserDropdownOpen: (open: boolean) => void;
  unreadCount: number;
  notificationDropdownRef: React.RefObject<HTMLDivElement | null>;
  navigate: (path: string) => void;
  notifications?: HeaderNotification[]; // Using the new interface instead of any
  onNotificationOpen?: () => void;
}

interface UserDropdownProps {
  userDropdownOpen: boolean;
  setUserDropdownOpen: (open: boolean) => void;
  setNotificationDropdownOpen: (open: boolean) => void;
  userName: string;
  userEmail: string;
  getInitials: () => string;
  getAvatarColor: () => string;
  userDropdownRef: React.RefObject<HTMLDivElement | null>;
  navigate: (path: string) => void;
  handleLogout: () => void;
}


const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notificationDropdownOpen,
  setNotificationDropdownOpen,
  setUserDropdownOpen,
  unreadCount,
  notificationDropdownRef,
  navigate,
  notifications = [], // Default to empty array if not provided
  onNotificationOpen,
}) => {

  const getIconForType = (type: string) => {
    switch (type) {
      case 'leave': return Calendar;
      case 'attendance': return Clock;
      case 'general':
      case 'holiday': return Bell;
      default: return Bell;
    }
  };

  const getIconBgForType = (type: string) => {
    switch (type) {
      case 'leave': return "bg-blue-100 text-blue-600";
      case 'attendance': return "bg-orange-100 text-orange-600";
      case 'high': return "bg-red-100 text-red-600";
      default: return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="relative" ref={notificationDropdownRef}>
      <button
        onClick={() => {
          setNotificationDropdownOpen(!notificationDropdownOpen);
          setUserDropdownOpen(false);
          if (!notificationDropdownOpen && onNotificationOpen) {
            onNotificationOpen();
          }
        }}
        className={cn(
          "relative p-2.5 rounded-xl transition-colors group",
          notificationDropdownOpen ? "bg-muted" : "hover:bg-muted",
        )}
      >
        <Bell className="w-5 h-5 text-foreground-secondary group-hover:text-foreground transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-error rounded-full flex items-center justify-center text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {notificationDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-surface rounded-2xl shadow-xl border border-border overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-foreground-secondary">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getIconForType(notification.type);
                const iconBg = getIconBgForType(notification.priority || notification.type); // Use priority for color if available

                return (
                  <button
                    key={notification.id}
                    onClick={async () => {
                      setNotificationDropdownOpen(false);
                      try {
                        if (notification.unread) {
                          await announcementService.markRead(notification.id);
                        }
                      } catch (error) {
                        console.error("Failed to mark notification as read", error);
                      }
                      navigate('/announcements');
                    }}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-3 hover:bg-muted transition-colors text-left",
                      notification.unread && "bg-primary/5",
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        iconBg,
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {notification.title}
                        </p>
                        {notification.unread && (
                          <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-foreground-secondary truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-foreground-tertiary mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </button>
                );
              }))}
          </div>

          <div className="px-4 py-3 border-t border-border">
            <button
              onClick={() => {
                setNotificationDropdownOpen(false);
                navigate("/announcements");
              }}
              className="w-full text-center text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );

};

const UserDropdown: React.FC<UserDropdownProps> = ({
  userDropdownOpen,
  setUserDropdownOpen,
  setNotificationDropdownOpen,
  userName,
  userEmail,
  getInitials,
  getAvatarColor,
  userDropdownRef,
  navigate,
  handleLogout,
}) => (
  <div className="relative" ref={userDropdownRef}>
    <button
      onClick={() => {
        setUserDropdownOpen(!userDropdownOpen);
        setNotificationDropdownOpen(false);
      }}
      className={cn(
        "flex items-center gap-3 py-1.5 pl-1.5 pr-3 rounded-xl transition-all",
        "hover:bg-muted",
        userDropdownOpen && "bg-muted",
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-semibold text-sm shadow-sm",
          getAvatarColor(),
        )}
      >
        {getInitials()}
      </div>

      <div className="text-left hidden lg:block">
        <p className="text-sm font-medium text-foreground leading-tight">
          {userName}
        </p>
        <p className="text-xs text-foreground-secondary capitalize">
          {userEmail.split("@")[0]}
        </p>
      </div>

      <ChevronDown
        className={cn(
          "w-4 h-4 text-foreground-secondary transition-transform duration-200",
          userDropdownOpen && "rotate-180",
        )}
      />
    </button>

    {userDropdownOpen && (
      <div className="absolute right-0 mt-2 w-64 bg-surface rounded-2xl shadow-xl border border-border overflow-hidden z-50">
        <div className="px-4 py-4 bg-muted/50">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shadow-md",
                getAvatarColor(),
              )}
            >
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {userName}
              </p>
              <p className="text-sm text-foreground-secondary truncate">
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        <div className="py-2">
          <button
            onClick={() => {
              setUserDropdownOpen(false);
              navigate("/profile");
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <User className="w-4 h-4 text-foreground-secondary" />
            My Profile
          </button>
          <button
            onClick={() => {
              setUserDropdownOpen(false);
              navigate("/settings");
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <Settings className="w-4 h-4 text-foreground-secondary" />
            Settings
          </button>
        </div>

        <div className="border-t border-border" />

        <div className="py-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    )}
  </div>
);

const Header: React.FC<HeaderProps> = ({ handleDrawerToggle }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const [announcements, setAnnouncements] = useState<HeaderNotification[]>([]); // Using HeaderNotification interface
  const { unreadCount, refreshTrigger } = useAppSelector((state) => state.notification);
  const { resetNotificationCount } = useSocket();

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await dispatch(logout());
    navigate("/login", { replace: true });
  };


  // Fetch announcements for notifications using useQuery
  const { data: notificationData, error: notificationError } = useQuery({
    queryKey: ["notifications-dropdown", refreshTrigger],
    queryFn: async () => {
      if (!user) return { announcements: [] };
      return announcementService.getEmployeeAnnouncements({ page: 1, limit: 10 });
    },
    staleTime: 30000,
  });

  // Log error if any
  useEffect(() => {
    if (notificationError) {
      console.error("Header: Error fetching notifications:", notificationError);
    }
  }, [notificationError]);

  // Map and sync notifications when data changes
  useEffect(() => {
    if (notificationData?.announcements) {
      const unreadItems: HeaderNotification[] = notificationData.announcements
        .filter((announcement: Announcement) => !announcement.isRead)
        .map((announcement: Announcement) => ({
          id: announcement.id,
          type: announcement.category || "general",
          title: announcement.title,
          message: announcement.content,
          time: announcement.expiryDate ? formatInTimezone(new Date(announcement.expiryDate), { day: 'numeric', month: 'short' }) : 'No Expiry',
          unread: true,
          priority: announcement.priority
        }));

      setAnnouncements(unreadItems);
      // Only sync if we're not in the middle of a push notification optimistic update
      // or just let it sync since we have the latest data now
      dispatch(setUnreadCount(unreadItems.length));
    }
  }, [notificationData, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);







  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return "U";
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : "User";
  const userEmail = user?.email || "";

  const getAvatarColor = () => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-emerald-500 to-emerald-600",
      "from-orange-500 to-orange-600",
      "from-pink-500 to-pink-600",
      "from-cyan-500 to-cyan-600",
    ];
    const index = userName.length % colors.length;
    return colors[index];
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-surface border-b border-border shadow-sm">
      <NotificationPermissionModal />
      <LocationPermissionModal />
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left side - Logo & Branding */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={handleDrawerToggle}
            className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={logoStatic}
              alt="CodecIT"
              className="w-10 h-10 rounded-xl shadow-sm"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground leading-tight">
                CodecIT
              </h1>
              <p className="text-xs text-foreground-secondary">
                HR Management System
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <NotificationDropdown
            notificationDropdownOpen={notificationDropdownOpen}
            setNotificationDropdownOpen={setNotificationDropdownOpen}
            setUserDropdownOpen={setUserDropdownOpen}
            unreadCount={unreadCount}
            notificationDropdownRef={notificationDropdownRef}
            navigate={navigate}
            notifications={announcements}
            onNotificationOpen={resetNotificationCount}
          />
          <div className="w-px h-8 bg-border mx-1 md:mx-2" />
          <UserDropdown
            userDropdownOpen={userDropdownOpen}
            setUserDropdownOpen={setUserDropdownOpen}
            setNotificationDropdownOpen={setNotificationDropdownOpen}
            userName={userName}
            userEmail={userEmail}
            getInitials={getInitials}
            getAvatarColor={getAvatarColor}
            userDropdownRef={userDropdownRef}
            navigate={navigate}
            handleLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;

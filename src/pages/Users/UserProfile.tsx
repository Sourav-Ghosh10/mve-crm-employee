import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import type { User } from "../../types/user.types";
import { userService } from "../../services/userService";
import Button from "../../components/common/Button";
import { cn } from "../../lib/utils";

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        const userData = await userService.getById(id);
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-foreground-secondary">User not found</p>
      </div>
    );
  }

  const infoItems = [
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Phone", value: user.phone || "N/A" },
    { icon: Building, label: "Department", value: user.department },
    { icon: BadgeCheck, label: "Role", value: user.role },
  ];

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/users")}
        startIcon={<ArrowLeft className="w-4 h-4" />}
      >
        Back to Users
      </Button>

      <div className="bg-surface rounded-xl shadow-md p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold mb-4">
              {user.firstName[0]}
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-foreground-secondary mb-3">{user.designation}</p>
            <span
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-semibold",
                user.status === "active"
                  ? "bg-success/10 text-success"
                  : "bg-muted text-foreground-secondary",
              )}
            >
              {user.status.toUpperCase()}
            </span>
          </div>

          {/* Info Section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Personal Information
            </h3>
            <div className="border-t border-border pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {infoItems.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-muted">
                      <Icon className="w-5 h-5 text-foreground-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground-secondary">
                        {label}
                      </p>
                      <p className="font-medium text-foreground capitalize">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Employment Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-foreground-secondary">Join Date</p>
                  <p className="font-medium text-foreground">{user.joinDate}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-secondary">
                    Employee ID
                  </p>
                  <p className="font-medium text-foreground">
                    EMP-{user.id.padStart(4, "0")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

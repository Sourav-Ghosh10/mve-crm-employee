import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { User, UserStatus } from "../../types/user.types";
import UserForm from "./UserForm";
import { usePagination } from "../../hooks/usePagination";
import { cn } from "../../lib/utils";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/Table";

const INITIAL_USERS: User[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    role: "admin",
    department: "IT",
    designation: "Senior Developer",
    status: "active",
    joinDate: "2023-01-15",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    role: "hr",
    department: "Human Resources",
    designation: "HR Manager",
    status: "active",
    joinDate: "2023-03-10",
  },
  {
    id: "3",
    firstName: "Robert",
    lastName: "Brown",
    email: "robert.brown@example.com",
    role: "employee",
    department: "Finance",
    designation: "Accountant",
    status: "on_leave",
    joinDate: "2023-06-20",
  },
];

const getStatusBadge = (status: UserStatus) => {
  const styles = {
    active: "badge-success",
    inactive: "bg-muted text-foreground-secondary",
    on_leave: "badge-warning",
  };
  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-xs font-semibold",
        styles[status],
      )}
    >
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
};

const getRoleBadge = (role: string) => (
  <span className="px-3 py-1 rounded-full text-xs font-semibold border-2 border-primary text-primary">
    {role.toUpperCase()}
  </span>
);

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Partial<User> | undefined>(
    undefined,
  );

  const handleAddUser = () => {
    setSelectedUser(undefined);
    setOpenDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleSaveUser = (data: Partial<User>) => {
    if (selectedUser?.id) {
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? ({ ...u, ...data } as User) : u,
        ),
      );
    } else {
      const newUser: User = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        status: "active",
        joinDate: new Date().toISOString().split("T")[0],
      } as User;
      setUsers([...users, newUser]);
    }
    setOpenDialog(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const { currentData, currentPage, maxPage, jump } = usePagination(
    filteredUsers,
    5,
  );

  const columns = [
    {
      id: "name",
      label: "Name",
      format: (_: unknown, row: User) => (
        <button
          onClick={() => navigate(`/users/${row.id}`)}
          className="text-left hover:text-primary transition-colors"
        >
          <div className="font-semibold text-primary">
            {row.firstName} {row.lastName}
          </div>
          <div className="text-sm text-foreground-secondary">{row.email}</div>
        </button>
      ),
    },
    {
      id: "role",
      label: "Role",
      format: (value: unknown) => getRoleBadge(value as string),
    },
    { id: "department", label: "Department" },
    {
      id: "status",
      label: "Status",
      format: (value: unknown) => getStatusBadge(value as UserStatus),
    },
    { id: "joinDate", label: "Join Date" },
    {
      id: "actions",
      label: "Actions",
      align: "right" as const,
      format: (_: unknown, row: User) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/users/${row.id}`)}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            title="View Profile"
          >
            <Eye className="w-4 h-4 text-foreground-secondary" />
          </button>
          <button
            onClick={() => handleEditUser(row)}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-primary" />
          </button>
          <button
            onClick={() => handleDeleteUser(row.id)}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-error" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <Button
          onClick={handleAddUser}
          startIcon={<Plus className="w-4 h-4" />}
        >
          Add User
        </Button>
      </div>

      <div className="bg-surface p-4 rounded-lg shadow-md">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-secondary" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <Table columns={columns} rows={currentData()} />

      {maxPage > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => jump(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {Array.from({ length: maxPage }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => jump(page)}
              className={cn(
                "w-10 h-10 rounded-md font-medium transition-colors",
                currentPage === page
                  ? "bg-primary text-white"
                  : "hover:bg-muted",
              )}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => jump(currentPage + 1)}
            disabled={currentPage === maxPage}
            className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      <Modal
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        title={selectedUser ? "Edit User" : "Add New User"}
        maxWidth="lg"
      >
        <UserForm
          initialValues={selectedUser}
          onSubmit={handleSaveUser}
          onCancel={() => setOpenDialog(false)}
        />
      </Modal>
    </div>
  );
};

export default UserList;

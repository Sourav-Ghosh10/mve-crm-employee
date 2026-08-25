import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import type { User, UserRole } from "../../types/user.types";
import { organizationService } from "../../services/organizationService";
import type { Department, Designation } from "../../types/organization.types";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { cn } from "../../lib/utils";

interface UserFormProps {
  initialValues?: Partial<User>;
  onSubmit: (data: Partial<User>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const validationSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  role: yup
    .string()
    .oneOf(["admin", "hr", "employee", "manager"])
    .required("Role is required"),
  department: yup.string().required("Department is required"),
  designation: yup.string().required("Designation is required"),
  phone: yup.string(),
});

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: boolean;
  helperText?: string;
  children: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, children, className, id, ...props }, ref) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="mb-4">
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-foreground mb-2"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full px-4 py-2.5 border rounded-md transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "bg-surface",
            error
              ? "border-error focus:ring-error"
              : "border-border hover:border-foreground-secondary",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {helperText && (
          <p
            className={cn(
              "mt-1.5 text-xs",
              error ? "text-error" : "text-foreground-secondary",
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";

const UserForm: React.FC<UserFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, desigRes] = await Promise.all([
          organizationService.getDepartments(),
          organizationService.getDesignations(),
        ]);
        setDepartments(deptRes.data);
        setDesignations(desigRes.data);
      } catch (error) {
        console.error("Failed to fetch organization data:", error);
      }
    };
    fetchData();
  }, []);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "employee" as UserRole,
      department: "",
      designation: "",
      phone: "",
      ...initialValues,
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="First Name"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          )}
        />
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Last Name"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          )}
        />
        <div className="sm:col-span-2">
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Email Address"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
        </div>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Role"
              error={!!errors.role}
              helperText={errors.role?.message}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </Select>
          )}
        />
        <Controller
          name="department"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Department"
              error={!!errors.department}
              helperText={errors.department?.message}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </Select>
          )}
        />
        <Controller
          name="designation"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Designation"
              error={!!errors.designation}
              helperText={errors.designation?.message}
            >
              <option value="">Select Designation</option>
              {designations.map((desig) => (
                <option key={desig._id} value={desig.title}>
                  {desig.title}
                </option>
              ))}
            </Select>
          )}
        />
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Phone Number"
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          )}
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save User"}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;

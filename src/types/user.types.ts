export type UserRole = "admin" | "hr" | "employee" | "manager";
export type UserStatus = "active" | "inactive" | "on_leave";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
  status: UserStatus;
  joinDate: string;
  phone?: string;
  avatar?: string;
  location?: string;
  timezone?: string;
  employeeId?: string;
  weeklyOff?: string[];
  workingHours?: {
    startTime: string;
    endTime: string;
    weeklyOff: string[];
  };
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
}

export interface UserFilters {
  role?: UserRole;
  department?: string;
  status?: UserStatus;
  search?: string;
}

// Backend user structure
export interface BackendUser {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    dateOfBirth?: string;
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
    };
  };
  employment: {
    role: string;
    department: string;
    designation: string;
    dateOfJoining: string;
    location?: string;
    timezone?: string;
    workingHours?: {
      startTime: string;
      endTime: string;
      weeklyOff: string[];
    };
  };
  id?: string;
  _id?: string;
  employeeId?: string;
  isActive: boolean;
}

export const mapUserResponse = (backendUser: BackendUser): User => {
  return {
    id: backendUser.id || backendUser._id || "",
    firstName: backendUser.personalInfo.firstName,
    lastName: backendUser.personalInfo.lastName,
    email: backendUser.personalInfo.email,
    phone: backendUser.personalInfo.phone,
    role: backendUser.employment.role as UserRole,
    department: backendUser.employment.department,
    designation: backendUser.employment.designation,
    status: (backendUser.isActive ? "active" : "inactive") as UserStatus,
    joinDate: backendUser.employment.dateOfJoining,
    location: backendUser.employment.location,
    timezone: backendUser.employment.timezone,
    employeeId: backendUser.employeeId,
    weeklyOff: backendUser.employment.workingHours?.weeklyOff,
    workingHours: backendUser.employment.workingHours,
    dateOfBirth: backendUser.personalInfo.dateOfBirth,
    address: backendUser.personalInfo.address,
    emergencyContact: backendUser.personalInfo.emergencyContact || (backendUser as any).emergencyContact,
  };
};

export const mapUserRequest = (user: Partial<User>): Partial<BackendUser> => {
  const request: Partial<BackendUser> = {};

  if (
    user.firstName !== undefined ||
    user.lastName !== undefined ||
    user.email !== undefined ||
    user.phone !== undefined ||
    user.dateOfBirth !== undefined ||
    user.address !== undefined ||
    user.emergencyContact !== undefined
  ) {
    request.personalInfo = {} as BackendUser["personalInfo"];
    if (user.firstName !== undefined) request.personalInfo.firstName = user.firstName;
    if (user.lastName !== undefined) request.personalInfo.lastName = user.lastName;
    if (user.email !== undefined) request.personalInfo.email = user.email;
    if (user.phone !== undefined) request.personalInfo.phone = user.phone;
    if (user.dateOfBirth !== undefined) request.personalInfo.dateOfBirth = user.dateOfBirth;
    if (user.address !== undefined) request.personalInfo.address = user.address;
    if (user.emergencyContact !== undefined) request.personalInfo.emergencyContact = user.emergencyContact;
  }

  if (
    user.role !== undefined ||
    user.department !== undefined ||
    user.designation !== undefined ||
    user.joinDate !== undefined ||
    user.location !== undefined
  ) {
    request.employment = {} as BackendUser["employment"];
    if (user.role !== undefined) request.employment.role = user.role;
    if (user.department !== undefined) request.employment.department = user.department;
    if (user.designation !== undefined) request.employment.designation = user.designation;
    if (user.joinDate !== undefined) request.employment.dateOfJoining = user.joinDate;
    if (user.location !== undefined) request.employment.location = user.location;
    if (user.timezone !== undefined) request.employment.timezone = user.timezone;
  }

  if (user.status !== undefined) {
    request.isActive = user.status === "active";
  }

  if (user.employeeId !== undefined) {
    request.employeeId = user.employeeId;
  }

  return request;
};

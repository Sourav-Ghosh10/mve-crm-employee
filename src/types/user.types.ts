export type UserRole = "admin" | "hr" | "employee" | "manager" | "Client" | string;
export type UserStatus = "active" | "inactive" | "on_leave";

export interface User {
  id: string;
  _id?: string;
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
  panNumber?: string;
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
  fullName?: string;
  // Admin-compatible fields
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    dateOfBirth?: string;
    panNumber?: string;
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
    };
  };
  employment: {
    role: any;
    department: string;
    designation: string;
    dateOfJoining?: string;
    location?: string;
    timezone?: string;
    workingHours?: {
      startTime: string;
      endTime: string;
      weeklyOff: string[];
    };
  };
  isActive?: boolean;
  userType?: string;
  clientId?: string;
  username?: string;
  leaveBalance?: any;
}

export interface UserFilters {
  role?: UserRole;
  roleId?: string;
  department?: string;
  status?: UserStatus;
  search?: string;
  limit?: number;
  page?: number;
  isActive?: boolean;
}

export interface PaginatedUserResponse {
  users: User[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
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
    panNumber?: string;
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

export const mapUserResponse = (backendUser: any): User => {
  const pInfo = backendUser?.personalInfo || {};
  const emp = backendUser?.employment || {};
  const firstName = pInfo.firstName || backendUser?.firstName || "";
  const lastName = pInfo.lastName || backendUser?.lastName || "";
  const email = pInfo.email || backendUser?.email || "";
  const phone = pInfo.phone || backendUser?.phone;
  const role = (emp.role || backendUser?.role || "employee") as UserRole;
  const department = emp.department || backendUser?.department || "";
  const designation = emp.designation || backendUser?.designation || "";
  const joinDate = emp.dateOfJoining || backendUser?.joinDate || "";
  const location = emp.location || backendUser?.location;
  const timezone = emp.timezone || backendUser?.timezone;
  const workingHours = emp.workingHours || backendUser?.workingHours;
  const weeklyOff = workingHours?.weeklyOff || backendUser?.weeklyOff;
  const id = backendUser?.id || backendUser?._id || "";

  return {
    id,
    _id: id,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    email,
    phone,
    role,
    department,
    designation,
    status: (backendUser?.isActive !== false ? "active" : "inactive") as UserStatus,
    isActive: backendUser?.isActive !== false,
    joinDate,
    location,
    timezone,
    employeeId: backendUser?.employeeId,
    weeklyOff,
    workingHours,
    dateOfBirth: pInfo.dateOfBirth || backendUser?.dateOfBirth,
    panNumber: pInfo.panNumber || backendUser?.panNumber,
    address: pInfo.address || backendUser?.address,
    emergencyContact: pInfo.emergencyContact || backendUser?.emergencyContact,
    personalInfo: {
      firstName,
      lastName,
      email,
      phone,
      profilePicture: pInfo.profilePicture || backendUser?.profilePicture,
      dateOfBirth: pInfo.dateOfBirth || backendUser?.dateOfBirth,
      panNumber: pInfo.panNumber || backendUser?.panNumber,
      address: pInfo.address || backendUser?.address,
      emergencyContact: pInfo.emergencyContact || backendUser?.emergencyContact,
    },
    employment: {
      role,
      department,
      designation,
      dateOfJoining: joinDate,
      location,
      timezone,
      workingHours,
    },
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
    user.panNumber !== undefined ||
    user.address !== undefined ||
    user.emergencyContact !== undefined
  ) {
    request.personalInfo = {} as BackendUser["personalInfo"];
    if (user.firstName !== undefined) request.personalInfo.firstName = user.firstName;
    if (user.lastName !== undefined) request.personalInfo.lastName = user.lastName;
    if (user.email !== undefined) request.personalInfo.email = user.email;
    if (user.phone !== undefined) request.personalInfo.phone = user.phone;
    if (user.dateOfBirth !== undefined) request.personalInfo.dateOfBirth = user.dateOfBirth;
    if (user.panNumber !== undefined) request.personalInfo.panNumber = user.panNumber;
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

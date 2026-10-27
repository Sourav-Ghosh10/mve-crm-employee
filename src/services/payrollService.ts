import api from "./api";

export interface PayslipItem {
  _id: string;
  masterId?: string;
  name: string;
  code: string;
  type: "ALLOWANCE" | "DEDUCTION";
  amount: number;
  isManualOverride: boolean;
}

export interface Payslip {
  _id: string;
  employeeId: string;
  salaryConfigId: string;
  month: number;
  year: number;
  monthlyCTC?: number;
  basicSalary?: number;
  items: PayslipItem[];
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
  totalDays: number;
  daysWorked: number;
  lopDays: number;
  status: "DRAFT" | "FINALIZED" | "CANCELLED";
  isManual: boolean;
  generatedBy?: string;
  finalizedBy?: string;
  finalizedAt?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayslipResponse {
  success: boolean;
  data: Payslip[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface SinglePayslipResponse {
  success: boolean;
  data: Payslip;
}

export interface AllowanceDeductionSlab {
  minAmount: number;
  maxAmount: number | null;
  fixedAmount: number;
}

export interface AllowanceDeductionMaster {
  _id: string;
  id?: string;
  name: string;
  code: string;
  type: "ALLOWANCE" | "DEDUCTION";
  calculationType: "FIXED" | "PERCENTAGE" | "SLAB";
  percentageOf?: "CTC" | "BASIC" | "GROSS";
  value: number;
  slabs?: AllowanceDeductionSlab[];
  isBalancing?: boolean;
  isTaxable?: boolean;
  isActive: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AllowanceDeductionMasterResponse {
  success: boolean;
  data: AllowanceDeductionMaster[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const payrollService = {
  getMyPayslips: async (params?: {
    page?: number;
    limit?: number;
    month?: number;
    year?: number;
    status?: string;
    employeeId?: string;
  }): Promise<PayslipResponse> => {
    const response = await api.get("/payroll/payslips", { params });
    return response.data;
  },

  getPayslipById: async (id: string): Promise<SinglePayslipResponse> => {
    const response = await api.get(`/payroll/payslips/${id}`);
    return response.data;
  },
  
  sendPayslipEmail: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/payroll/payslips/${id}/send-email`);
    return response.data;
  },

  downloadPayslip: async (id: string): Promise<Blob> => {
    const response = await api.get(`/payroll/payslips/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  getMasters: async (params?: any): Promise<AllowanceDeductionMasterResponse> => {
    const response = await api.get("/payroll/masters", { params });
    return response.data;
  },

  toggleMasterStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch(`/payroll/masters/${id}/status`, { isActive });
    return response.data;
  },

  deleteMaster: async (id: string) => {
    const response = await api.delete(`/payroll/masters/${id}`);
    return response.data;
  },

  updateMaster: async (id: string, data: any) => {
    const response = await api.put(`/payroll/masters/${id}`, data);
    return response.data;
  },

  createMaster: async (data: any) => {
    const response = await api.post("/payroll/masters", data);
    return response.data;
  },
};

export default payrollService;

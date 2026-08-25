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
};

export default payrollService;

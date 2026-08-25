import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import payrollService from "../../services/payrollService";
import type { Payslip } from "../../services/payrollService";
import Card from "../../components/common/Card/Card";
import Table from "../../components/common/Table/Table";
import Button from "../../components/common/Button/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import { format } from "date-fns";
import PayslipDetail from "./PayslipDetail";
import { Wallet, FileText, ChevronRight, Download, Calendar } from "lucide-react";

const Payroll: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchPayslips = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const response = await payrollService.getMyPayslips({
        employeeId: user.id,
      });
      setPayslips(response.data);
    } catch (error) {
      console.error("Failed to fetch payslips:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleViewDetails = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setIsDetailOpen(true);
  };

  const getMonthName = (month: number) => {
    const date = new Date();
    date.setMonth(month - 1);
    return format(date, "MMMM");
  };

  const getStatusBadge = (status: string) => {
    const colorMap: Record<string, string> = {
      FINALIZED: "bg-emerald-100 text-emerald-700 border-emerald-200",
      DRAFT: "bg-amber-100 text-amber-700 border-amber-200",
      CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorMap[status] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      id: "monthYear" as const,
      label: "Pay Period",
      format: (_val: unknown, row: Payslip & { id: string }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-foreground">{getMonthName(row.month)}</div>
            <div className="text-xs text-foreground-secondary">{row.year}</div>
          </div>
        </div>
      ),
    },
    {
      id: "grossEarnings" as const,
      label: "Gross Earnings",
      format: (val: unknown) => (
        <div className="font-medium text-foreground">₹{(val as number).toLocaleString()}</div>
      ),
    },
    {
      id: "totalDeductions" as const,
      label: "Deductions",
      format: (val: unknown) => (
        <span className="text-rose-500 font-medium">₹{(val as number).toLocaleString()}</span>
      ),
    },
    {
      id: "netPay" as const,
      label: "Net Salary",
      format: (val: unknown) => (
        <div className="flex flex-col">
          <span className="font-bold text-emerald-600 text-lg">
            ₹{(val as number).toLocaleString()}
          </span>
          <span className="text-[10px] text-foreground-secondary uppercase tracking-wider">Deposited</span>
        </div>
      ),
    },
    {
      id: "status" as const,
      label: "Status",
      format: (val: unknown) => getStatusBadge(val as string),
    },
    {
      id: "id" as const,
      label: "Action",
      format: (_val: unknown, row: Payslip & { id: string }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-primary/5 border-primary/20 text-primary"
            onClick={(e) => {
              e.stopPropagation();
              const original = payslips.find((p) => p._id === row.id);
              if (original) handleViewDetails(original);
            }}
            startIcon={<FileText className="w-3.5 h-3.5" />}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground-secondary hover:text-primary"
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const blob = await payrollService.downloadPayslip(row.id);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Payslip-${getMonthName(row.month)}-${row.year}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              } catch (error) {
                console.error("Failed to download payslip:", error);
              }
            }}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const tableRows = payslips.map((p) => ({
    ...p,
    id: p._id,
    monthYear: `${getMonthName(p.month)} ${p.year}`,
  }));

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg shadow-primary/20">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My Payroll</h1>
            <p className="text-foreground-secondary text-sm font-medium flex items-center gap-2 mt-1">
              Dashboard <ChevronRight className="w-3 h-3" /> Payroll & Payslips
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-card border border-border p-2 rounded-xl shadow-sm">
          <div className="px-4 py-2 border-r border-border">
            <div className="text-[10px] text-foreground-secondary uppercase font-bold tracking-tighter">Current Period</div>
            <div className="font-bold text-sm">{format(new Date(), "MMMM yyyy")}</div>
          </div>
          <div className="px-4 py-2 text-primary font-bold text-lg">
            {payslips.length} <span className="text-xs font-medium text-foreground-secondary">Records</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none">
          {tableRows.length > 0 ? (
            <div className="overflow-x-auto">
              <Table 
                rows={tableRows} 
                columns={columns} 
                className="w-full"
              />
            </div>
          ) : (
            <div className="py-20">
              <EmptyState
                title="No Payslips Yet"
                description="Your financial documents will appear here once they are processed by HR."
                icon={<FileText className="w-12 h-12 text-muted-foreground/30" />}
              />
            </div>
          )}
        </Card>
      </div>

      {selectedPayslip && (
        <PayslipDetail
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          payslip={selectedPayslip}
        />
      )}
    </div>
  );
};

export default Payroll;

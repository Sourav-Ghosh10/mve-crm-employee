import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Modal from "../../components/common/Modal/Modal";
import type { Payslip } from "../../services/payrollService";
import type { RootState } from "../../store/store";
import { organizationService } from "../../services/organizationService";
import payrollService from "../../services/payrollService";
import type { OfficeLocation } from "../../types/organization.types";
import Button from "../../components/common/Button/Button";
import { Printer, Download, CreditCard, Mail } from "lucide-react";
import { format } from "date-fns";
import signatureLogo from "../../assets/codecit-logo.png";
import systemSettingsService from "../../services/systemSettingsService";

interface PayslipDetailProps {
  isOpen: boolean;
  onClose: () => void;
  payslip: Payslip;
}

const PayslipDetail: React.FC<PayslipDetailProps> = ({
  isOpen,
  onClose,
  payslip,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const [, setOfficeLocation] = useState<OfficeLocation | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const employeeData = payslip.employeeId as any;
  const locationId = employeeData?.employment?.location || user?.location;

  useEffect(() => {
    const fetchLocation = async () => {
      if (!locationId) return;

      try {
        // If location is already an object (populated by backend)
        if (
          typeof locationId === "object" &&
          locationId.address &&
          locationId.contactInfo
        ) {
          setOfficeLocation(locationId);
          return;
        }

        // Fetch all office locations
        const response = await organizationService.getOfficeLocations();
        const locations = response.data;

        if (!locations || locations.length === 0) return;

        // Try to find matching location (by ID or Name)
        const found = locations.find(
          (loc) =>
            loc._id === locationId ||
            loc.name === locationId ||
            loc.name.toLowerCase() === String(locationId).toLowerCase() ||
            loc.name.toLowerCase().includes(String(locationId).toLowerCase()),
        );

        if (found) {
          setOfficeLocation(found);
        } else {
          // Fallback to headquarters if no specific match
          const hq =
            locations.find((loc) => loc.isHeadquarters) || locations[0];
          if (hq) setOfficeLocation(hq);
        }
      } catch (error) {
        console.error("Failed to fetch office location:", error);
      }
    };

    const fetchSignature = async () => {
      try {
        const sig =
          await systemSettingsService.getSettingByKey("payslip_signature");
        if (sig && sig.value) {
          setSignatureImage(sig.value);
        }
      } catch (error) {
        console.error("Failed to fetch signature:", error);
      }
    };

    if (isOpen) {
      fetchLocation();
      fetchSignature();
    }
  }, [isOpen, locationId]);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const windowName = "Print" + new Date().getTime();
    const printWindow = window.open(
      "about:blank",
      windowName,
      "left=50,top=50,width=900,height=900",
    );

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Payslip - ${getMonthName(payslip.month)} ${payslip.year}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: white; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 32px; margin-bottom: 40px; }
              .company-brand { display: flex; align-items: center; gap: 24px; }
              .company-logo { height: 70px; width: auto; object-fit: contain; }
              .company-info h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 6px; text-transform: uppercase; }
              .company-info p { color: #64748b; font-size: 13px; line-height: 1.6; margin: 0; display: flex; align-items: center; gap: 6px; }
              .payslip-meta { text-align: right; }
              .payslip-title { font-size: 38px; font-weight: 950; color: #4f46e5; letter-spacing: -0.04em; line-height: 1; }
              .payslip-date { font-size: 14px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin-top: 8px; border-top: 2px solid #4f46e5; display: inline-block; pt: 4px; }
              
              .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
              .data-card { background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; }
              .card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
              .card-header span { font-weight: 800; font-size: 13px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.05em; }
              
              .data-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #e2e8f0; }
              .data-row:last-child { border-bottom: none; }
              .data-label { color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; }
              .data-value { color: #0f172a; font-size: 14px; font-weight: 700; }

              table { width: 100%; border-collapse: collapse; margin-bottom: 40px; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
              th { background: #f1f5f9; padding: 14px 20px; font-weight: 800; font-size: 12px; color: #475569; text-transform: uppercase; text-align: left; border-bottom: 2px solid #e2e8f0; }
              td { padding: 14px 20px; font-size: 14px; color: #0f172a; border-bottom: 1px solid #f1f5f9; }
              .text-right { text-align: right; }
              .font-bold { font-weight: 700; }
              
              .totals-row { background: #f8fafc; font-weight: 800; }
              .earnings-total { color: #059669; }
              .deductions-total { color: #dc2626; }

              .net-pay-wrapper { display: flex; justify-content: flex-end; margin-top: 48px; }
              .net-pay-card { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 32px 56px; border-radius: 20px; text-align: center; box-shadow: 0 20px 40px -10px rgba(79, 70, 229, 0.3); }
              .net-pay-label { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; opacity: 0.9; margin-bottom: 12px; }
              .net-pay-amount { font-size: 48px; font-weight: 900; letter-spacing: -0.02em; }
              .net-pay-words { font-size: 12px; opacity: 0.8; margin-top: 12px; font-style: italic; }

              .footer { margin-top: 80px; padding-top: 24px; border-top: 2px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-end; }
              .footer-legal { color: #94a3b8; font-size: 11px; max-width: 400px; line-height: 1.4; }
              .footer-brand { color: #4f46e5; font-weight: 900; font-size: 16px; letter-spacing: -0.02em; }
              
              @media print {
                body { padding: 0; }
                .net-pay-card { box-shadow: none; -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>window.onload = function() { window.print(); window.close(); }<\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleSendEmail = async () => {
    if (sendingEmail) return;
    setSendingEmail(true);
    try {
      const resp = await payrollService.sendPayslipEmail(payslip._id);
      if (resp.success) {
        alert("Payslip sent to your email successfully!");
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("Failed to send payslip email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await payrollService.downloadPayslip(payslip._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Payslip-${getMonthName(payslip.month)}-${payslip.year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download payslip:", error);
      alert("Failed to download payslip. Please try again.");
    }
  };

  const getMonthName = (month: number) => {
    const date = new Date();
    date.setMonth(month - 1);
    return format(date, "MMMM");
  };

  const allowances = payslip.items.filter((item) => item.type === "ALLOWANCE");
  const deductions = payslip.items.filter((item) => item.type === "DEDUCTION");
  const maxRows = Math.max(allowances.length, deductions.length);

  const employeeName = employeeData?.personalInfo
    ? `${employeeData.personalInfo.firstName} ${employeeData.personalInfo.lastName}`
    : user
      ? `${user.firstName} ${user.lastName}`
      : "N/A";
  const employeeIdStr =
    employeeData?.employment?.employeeId || user?.employeeId || "N/A";
  const designation =
    employeeData?.employment?.designation?.name ||
    employeeData?.employment?.designation ||
    user?.designation ||
    "N/A";

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <span>
            Salary Certificate — {getMonthName(payslip.month)} {payslip.year}
          </span>
        </div>
      }
      maxWidth="3xl"
      actions={
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            startIcon={<Mail className="w-4 h-4" />}
            onClick={handleSendEmail}
            loading={sendingEmail}
          >
            Send Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            startIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            variant="default"
            size="sm"
            startIcon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
          >
            Download
          </Button>
        </div>
      }
    >
      <div className="p-3 sm:p-5 bg-slate-50 overflow-auto">
        <div
          ref={printRef}
          className="bg-white p-5 sm:p-7 w-full mx-auto font-sans text-[#14233a] shadow-sm"
          style={{ border: "1px solid #d6e0ec" }}
        >
          <div className="flex items-start justify-between gap-4 border-b-2 border-[#174a7c] pb-4 mb-3">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Pro Staff Logo" className="h-20 w-auto" />
              <div>
                <h2 className="text-xl font-bold text-[#174a7c]">AA SERVICES</h2>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-600">
                  Second Floor, Nasuja Building 1-89/G/36, Shilpi Valley, Plot no 36,<br />
                  Opposite Westin Hotel Madhapur, HITEC City, Hyderabad,<br />
                  Telangana, India - 500081<br />
                  Email: annie@myvirtualemployee.com.au<br />
                  Contact: +91 74166 74188
                </p>
              </div>
            </div>
            <div className="rounded bg-[#174a7c] px-4 py-2 text-xs font-black tracking-wider text-white">
              SALARY PAYSLIP
            </div>
          </div>
          <PayslipSection>1. PAY & EMPLOYEE SUMMARY</PayslipSection>
          <div className="grid grid-cols-2 border border-[#d6e0ec] text-[10px] mb-3">
            {[
              [
                "Pay Period",
                format(new Date(payslip.year, payslip.month - 1), "MMMM yyyy"),
              ],
              [
                "Pay Date",
                format(new Date(payslip.year, payslip.month, 0), "dd/MM/yyyy"),
              ],
              ["Employee Name", employeeName],
              ["Designation", designation],
              ["Employee ID", employeeIdStr],
              [
                "Date of Joining",
                employeeData?.employment?.dateOfJoining
                  ? format(
                      new Date(employeeData.employment.dateOfJoining),
                      "dd/MM/yyyy",
                    )
                  : "-",
              ],
              ["Total Cycle Days", payslip.totalDays],
              [
                "Annual CTC",
                `Rs. ${(Number(payslip.monthlyCTC || 0) * 12).toFixed(2)}`,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[105px_1fr] border-b border-[#d6e0ec] p-2 even:border-l"
              >
                <span className="font-bold text-slate-600">{label}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
          <PayslipSection>2. ATTENDANCE & LEAVE RECORD</PayslipSection>
          <div className="grid grid-cols-4 border border-[#d6e0ec] text-[10px] mb-3">
            {[
              ["Payable Days", payslip.daysWorked],
              ["LOP Days", payslip.lopDays],
              ["Attendance", "Calculated"],
              ["Leave Balance", "-"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="border-r border-[#d6e0ec] last:border-r-0 p-2"
              >
                <div className="font-bold text-slate-600">{label}</div>
                <div className="mt-1 font-semibold">{value}</div>
              </div>
            ))}
          </div>
          <PayslipSection>
            3. MONTHLY SALARY BREAKDOWN & FINANCIAL YEAR YTD (01 APR - 31 MAR)
          </PayslipSection>
          <table className="w-full border-collapse border border-[#d6e0ec] mb-3 text-[10px]">
            <thead>
              <tr className="bg-[#174a7c] text-white">
                <th className="p-2 text-left">Earnings</th>
                <th className="p-2 text-right">Current (Rs.)</th>
                <th className="p-2 text-right">YTD (Rs.)</th>
                <th className="p-2 text-left">Deductions</th>
                <th className="p-2 text-right">Current (Rs.)</th>
                <th className="p-2 text-right">YTD (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.max(maxRows, 5) }).map((_, i) => {
                const earn = allowances[i];
                const ded = deductions[i];
                return (
                  <tr key={i} className="border-t border-[#d6e0ec]">
                    <td className="p-2">{earn?.name || ""}</td>
                    <td className="p-2 text-right">
                      {earn ? earn.amount.toFixed(2) : ""}
                    </td>
                    <td className="p-2 text-right">-</td>
                    <td className="p-2">{ded?.name || ""}</td>
                    <td className="p-2 text-right">
                      {ded ? ded.amount.toFixed(2) : ""}
                    </td>
                    <td className="p-2 text-right">-</td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-[#d6e0ec] font-black text-[#174a7c]">
                <td className="p-2">Total Gross Earnings (A)</td>
                <td className="p-2 text-right">
                  Rs. {payslip.grossEarnings.toFixed(2)}
                </td>
                <td className="p-2 text-right">-</td>
                <td className="p-2">Total Deductions (B)</td>
                <td className="p-2 text-right">
                  Rs. {payslip.totalDeductions.toFixed(2)}
                </td>
                <td className="p-2 text-right">-</td>
              </tr>
            </tbody>
          </table>
          <div className="rounded bg-[#174a7c] p-4 text-white mb-3">
            <div className="flex justify-between items-center gap-4">
              <div>
                <div className="font-black tracking-wide">
                  NET SALARY PAYABLE (A - B)
                </div>
                <div className="mt-2 text-[10px] italic">
                  Amount in Words: Rupees {numberToWords(payslip.netPay)} Only
                </div>
              </div>
              <div className="text-xl font-black">
                Rs. {payslip.netPay.toFixed(2)}
              </div>
            </div>
          </div>
          <PayslipSection>
            4. YEAR TO DATE (YTD) SUMMARY - FINANCIAL YEAR (01 APR - 31 MAR)
          </PayslipSection>
          <div className="grid grid-cols-2 gap-x-8 rounded border border-[#afc4dd] p-3 text-[10px] mb-8">
            <div>
              <b>Financial Year Cycle:</b> Apr - Mar
              <br />
              <b>Pay Date of Record:</b>{" "}
              {format(new Date(payslip.year, payslip.month, 0), "dd-MMM-yyyy")}
            </div>
            <div>
              <b>YTD Gross Earnings:</b> Available on PDF
              <br />
              <b>YTD Net Salary Paid:</b> Available on PDF
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <div className="w-40 border-t border-dashed border-slate-400 pt-1">
              Employee Signature
            </div>
            <div className="w-48 border-t border-dashed border-slate-400 pt-1 text-right">
              Authorized Signatory / HR Department
            </div>
          </div>
          <div className="mt-4 border-t pt-2 text-center text-[8px] text-slate-400">
            This is a computer-generated salary document and requires no
            signature when electronically verified. | Pro Staff
          </div>
          <div className="hidden">{signatureImage || signatureLogo}</div>
        </div>
      </div>
    </Modal>
  );
};

const PayslipSection: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="mb-2 border-l-[3px] border-[#1796d2] pl-2 text-[11px] font-black tracking-wide text-[#174a7c]">
    {children}
  </div>
);

function numberToWords(num: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";

  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100)
      return (
        tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
      );
    if (n < 1000)
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 !== 0 ? " and " + convert(n % 100) : "")
      );
    if (n < 100000)
      return (
        convert(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 !== 0 ? " " + convert(n % 1000) : "")
      );
    return String(n);
  };

  return convert(num);
}

export default PayslipDetail;

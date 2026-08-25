const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'mve-crm-admin', 'src', 'pages', 'Leave', 'useLeaveColumns.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

const target1 = `        {
            _id: "leaveType",
            label: "Leave Type",
            format: (value) => (
                <span className="text-xs font-bold text-foreground uppercase bg-accent/10 text-accent px-2 py-1 rounded-md border border-accent/20">
                    {(value as string).replace('_', ' ')}
                </span>
            )
        },`;

const replacement1 = `        {
            _id: "leaveType",
            label: "Leave Type",
            format: (value) => {
                const isEarlyLeave = (value as string).toLowerCase().includes('hourly') || (value as string).toLowerCase().includes('early');
                const displayValue = isEarlyLeave ? 'Early Leave' : (value as string).replace('_', ' ');
                return (
                    <span className="text-xs font-bold text-foreground uppercase bg-accent/10 text-accent px-2 py-1 rounded-md border border-accent/20">
                        {displayValue}
                    </span>
                );
            }
        },`;

const target2 = `        {
            _id: "duration",
            label: "Duration",
            minWidth: 280,
            format: (_, row) => {
                const employeeTimezone = typeof row.employeeId !== 'string'
                    ? row.employeeId?.employment?.timezone || 'Asia/Kolkata'
                    : 'Asia/Kolkata';

                return (
                    <div className="flex flex-col gap-1.5 py-1">
                        <TimezoneDualView
                            startTime={row.startDate}
                            endTime={row.endDate}
                            primaryTimezone={employeeTimezone}
                            secondaryTimezone={adminTimezone}
                            showDate={true}
                            showTime={row.leaveType?.toLowerCase().includes('hourly')}
                            variant="minimal"
                        />
                        <span className="text-[9px] font-black text-white bg-indigo-600 px-2 py-0.5 rounded-full w-fit shadow-md shadow-indigo-200 dark:shadow-none uppercase tracking-widest">
                            {row.numberOfDays} {row.numberOfDays === 1 ? 'Day' : 'Days'}
                        </span>
                    </div>
                );
            }
        },`;

const replacement2 = `        {
            _id: "duration",
            label: "Duration",
            minWidth: 280,
            format: (_, row) => {
                const employeeTimezone = typeof row.employeeId !== 'string'
                    ? row.employeeId?.employment?.timezone || 'Asia/Kolkata'
                    : 'Asia/Kolkata';

                const isEarlyLeave = row.leaveType?.toLowerCase().includes('hourly') || row.leaveType?.toLowerCase().includes('early');
                let durationText = \`\${row.numberOfDays} \${row.numberOfDays === 1 ? 'Day' : 'Days'}\`;

                if (isEarlyLeave) {
                    let hrs = (row.numberOfDays ?? 0) * 8;
                    if (row.status === "pending" && (row.numberOfDays ?? 1) === 1 && row.startDate) {
                        const employee = typeof row.employeeId !== 'string' ? row.employeeId : null;
                        const departureTime = new Date(row.startDate);
                        let rosterEndHour = 18;
                        let rosterEndMinute = 0;
                        if (employee?.employment?.workingHours?.endTime) {
                            const [h, m] = employee.employment.workingHours.endTime.split(':');
                            rosterEndHour = parseInt(h, 10) || 18;
                            rosterEndMinute = parseInt(m, 10) || 0;
                        }
                        const rosterEndTime = new Date(row.startDate);
                        rosterEndTime.setHours(rosterEndHour, rosterEndMinute, 0, 0);
                        const diffMs = rosterEndTime.getTime() - departureTime.getTime();
                        let diffHours = diffMs / (1000 * 60 * 60);
                        if (diffHours < 0) diffHours = 0;
                        if (diffHours > 8) diffHours = 8;
                        hrs = Math.round(diffHours * 10) / 10;
                    } else if (row.status !== "pending" && row.numberOfDays !== 1) {
                         hrs = row.numberOfDays * 8;
                    }
                    durationText = hrs > 0 ? \`\${hrs}h\` : '0h';
                }

                return (
                    <div className="flex flex-col gap-1.5 py-1">
                        <TimezoneDualView
                            startTime={row.startDate}
                            endTime={row.endDate}
                            primaryTimezone={employeeTimezone}
                            secondaryTimezone={adminTimezone}
                            showDate={true}
                            showTime={isEarlyLeave}
                            variant="minimal"
                        />
                        <span className="text-[9px] font-black text-white bg-indigo-600 px-2 py-0.5 rounded-full w-fit shadow-md shadow-indigo-200 dark:shadow-none uppercase tracking-widest">
                            {durationText}
                        </span>
                    </div>
                );
            }
        },`;

let newContent = content.replace(target1, replacement1);
newContent = newContent.replace(target2, replacement2);

if (newContent === content) {
    console.error("Replacement failed.");
    if (!content.includes(target1)) console.error("Target 1 not found");
    if (!content.includes(target2)) console.error("Target 2 not found");
    process.exit(1);
}

fs.writeFileSync(targetFile, newContent, 'utf8');
console.log("Successfully updated useLeaveColumns.tsx");

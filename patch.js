const fs = require('fs');
const path = "C:/Users/Harshita/Desktop/hrmnew/mve-crm-employee/src/pages/Leave/Leave.tsx";
let content = fs.readFileSync(path, 'utf8');

const target1 = className={px-4 py-1.5 text-sm font-medium rounded-lg transition-all \};
const replacement1 = className={\px-4 py-1.5 text-sm font-medium rounded-lg transition-all \\};

const target2 = className={px-4 py-1.5 text-sm font-medium rounded-lg transition-all \};
const replacement2 = className={\px-4 py-1.5 text-sm font-medium rounded-lg transition-all \\};

const target3 = className={px-4 py-1.5 text-sm font-medium rounded-lg transition-all \};
const replacement3 = className={\px-4 py-1.5 text-sm font-medium rounded-lg transition-all \\};

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);
content = content.replace(target3, replacement3);

fs.writeFileSync(path, content, 'utf8');

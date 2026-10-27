import React from "react";
import { Users } from "lucide-react";

interface AssignedTeamProps {
    userId?: string;
}

const AssignedTeam: React.FC<AssignedTeamProps> = () => {
    return (
        <div className="bg-surface p-6 rounded-[2rem] border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Assigned Team</h3>
                        <p className="text-xs text-foreground-tertiary">Team members working on your projects</p>
                    </div>
                </div>
            </div>
            <div className="text-center py-8 text-foreground-secondary text-sm">
                No active team members assigned at this moment.
            </div>
        </div>
    );
};

export default AssignedTeam;

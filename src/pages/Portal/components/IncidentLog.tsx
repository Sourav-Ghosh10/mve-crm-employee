import React from "react";
import { AlertCircle } from "lucide-react";

interface IncidentLogProps {
    userId?: string;
    clientId?: string;
}

const IncidentLog: React.FC<IncidentLogProps> = () => {
    return (
        <div className="bg-surface p-6 rounded-[2rem] border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Incident Logs</h3>
                        <p className="text-xs text-foreground-tertiary">Recent system and service activity logs</p>
                    </div>
                </div>
            </div>
            <div className="text-center py-8 text-foreground-secondary text-sm">
                No active incidents or alerts reported.
            </div>
        </div>
    );
};

export default IncidentLog;

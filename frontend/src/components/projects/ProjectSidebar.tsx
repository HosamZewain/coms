import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Milestone, Plus, Calendar, Folder } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import api from '../../lib/api';

interface ProjectSidebarProps {
    projectId: string;
    selectedPlanId: string | null;
    selectedMilestoneId: string | null;
    onSelectPlan: (id: string | null) => void;
    onSelectMilestone: (id: string | null) => void;
    onCreatePlan: () => void;
    onCreateMilestone: (planId?: string) => void;
}

export default function ProjectSidebar({
    projectId,
    selectedPlanId,
    selectedMilestoneId,
    onSelectPlan,
    onSelectMilestone,
    onCreatePlan,
    onCreateMilestone
}: ProjectSidebarProps) {
    const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});

    const { data: plans = [] } = useQuery({
        queryKey: ['project-plans', projectId],
        queryFn: async () => {
            const res = await api.get(`/projects/${projectId}/plans`);
            return res.data.data;
        }
    });

    const togglePlan = (planId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedPlans(prev => ({ ...prev, [planId]: !prev[planId] }));
    };

    return (
        <div className="w-64 border-r bg-card h-full flex flex-col">
            <div className="p-4 border-b">
                <Button
                    variant="ghost"
                    className={cn("w-full justify-start font-bold", !selectedPlanId && "bg-secondary")}
                    onClick={() => {
                        onSelectPlan(null);
                        onSelectMilestone(null);
                    }}
                >
                    <Folder className="mr-2 h-4 w-4" />
                    Overview
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <div className="flex items-center justify-between px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                    <span>Plans</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCreatePlan}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {plans.length === 0 && (
                    <div className="text-xs text-muted-foreground px-4 py-8 text-center border-dashed border rounded-md m-2">
                        No plans yet. <br /> Start here!
                    </div>
                )}

                {plans.map((plan: any) => (
                    <div key={plan.id} className="space-y-1">
                        <div
                            className={cn(
                                "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
                                selectedPlanId === plan.id && !selectedMilestoneId && "bg-secondary font-medium"
                            )}
                            onClick={() => {
                                onSelectPlan(plan.id);
                                onSelectMilestone(null);
                                setExpandedPlans(prev => ({ ...prev, [plan.id]: true }));
                            }}
                        >
                            <span
                                className="p-0.5 hover:bg-muted rounded cursor-pointer"
                                onClick={(e) => togglePlan(plan.id, e)}
                            >
                                {expandedPlans[plan.id] ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            </span>
                            <Calendar className="h-3.5 w-3.5 text-blue-500" />
                            <span className="truncate flex-1">{plan.name}</span>
                        </div>

                        {expandedPlans[plan.id] && (
                            <div className="ml-4 pl-2 border-l space-y-0.5">
                                {plan.milestones?.map((milestone: any) => (
                                    <div
                                        key={milestone.id}
                                        className={cn(
                                            "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
                                            selectedMilestoneId === milestone.id && "bg-accent text-accent-foreground"
                                        )}
                                        onClick={() => {
                                            onSelectPlan(plan.id);
                                            onSelectMilestone(milestone.id);
                                        }}
                                    >
                                        <Milestone className="h-3.5 w-3.5 text-green-500" />
                                        <span className="truncate">{milestone.name}</span>
                                    </div>
                                ))}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-xs text-muted-foreground h-7"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectPlan(plan.id);
                                        onCreateMilestone(plan.id);
                                    }}
                                >
                                    <Plus className="mr-2 h-3 w-3" /> Add Milestone
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

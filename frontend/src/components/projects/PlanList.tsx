import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Archive, Edit, MoreVertical, Plus, Calendar } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import CreatePlanModal from './CreatePlanModal';
import EditPlanModal from './EditPlanModal';
import CreateMilestoneModal from './CreateMilestoneModal';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight } from 'lucide-react'; // Added icons

interface PlanListProps {
    projectId: string;
}

export default function PlanList({ projectId }: PlanListProps) {
    const [viewArchived, setViewArchived] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [createMilestoneOpen, setCreateMilestoneOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});

    const togglePlan = (planId: string) => {
        setExpandedPlans(prev => ({ ...prev, [planId]: !prev[planId] }));
    };

    const { data: plans = [], refetch } = useQuery({
        queryKey: ['project-plans', projectId],
        queryFn: async () => {
            const res = await api.get(`/projects/${projectId}/plans`);
            return res.data.data;
        }
    });

    const handleArchive = async (e: React.MouseEvent, planId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to archive this plan? All tasks must be done.')) return;
        try {
            await api.post(`/projects/${projectId}/plans/${planId}/archive`);
            refetch();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to archive plan');
        }
    };

    const filteredPlans = plans.filter((p: any) =>
        viewArchived ? p.status === 'ARCHIVED' : p.status !== 'ARCHIVED'
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">
                        {viewArchived ? 'Archived Plans' : 'Active Plans'}
                    </h3>
                    <Badge variant="outline">{filteredPlans.length}</Badge>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setViewArchived(!viewArchived)}>
                        {viewArchived ? 'View Active' : 'View Archived'}
                    </Button>
                    {!viewArchived && (
                        <Button onClick={() => setCreateModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Create Plan
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPlans.map((plan: any) => (
                    <Card key={plan.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base">{plan.name}</CardTitle>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(plan.startDate), 'MMM d')} - {format(new Date(plan.endDate), 'MMM d, yyyy')}
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => {
                                            setSelectedPlan(plan);
                                            setEditModalOpen(true);
                                        }}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        {!viewArchived && (
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={(e) => handleArchive(e, plan.id)}
                                            >
                                                <Archive className="mr-2 h-4 w-4" /> Archive
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tasks</span>
                                        <span className="font-medium">{plan._count.tasks}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Milestones</span>
                                        <span className="font-medium">{plan.milestones?.length || 0}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="w-full justify-between" onClick={() => togglePlan(plan.id)}>
                                    {expandedPlans[plan.id] ? 'Hide Milestones' : 'Show Milestones'}
                                    {expandedPlans[plan.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>

                                {expandedPlans[plan.id] && (
                                    <div className="space-y-2 pt-2 border-t">
                                        {plan.milestones && plan.milestones.length > 0 ? (
                                            plan.milestones.map((milestone: any) => (
                                                <div key={milestone.id} className="flex items-center gap-2 text-sm p-2 hover:bg-muted rounded-md group">
                                                    <div className={`h-2 w-2 rounded-full ${milestone.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                    <span className="font-medium flex-1">{milestone.name}</span>
                                                    <span className="text-xs text-muted-foreground">{new Date(milestone.date).toLocaleDateString()}</span>
                                                    <span className="text-xs bg-muted px-1 rounded">{milestone._count?.tasks || 0} tasks</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-muted-foreground text-center py-2">No milestones yet.</p>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full text-xs"
                                            onClick={() => {
                                                setSelectedPlan(plan);
                                                setCreateMilestoneOpen(true);
                                            }}
                                        >
                                            <Plus className="mr-2 h-3 w-3" /> Add Milestone
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredPlans.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>No {viewArchived ? 'archived' : 'active'} plans found.</p>
                        {!viewArchived && (
                            <Button variant="link" onClick={() => setCreateModalOpen(true)}>
                                Create your first plan
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <CreatePlanModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={refetch}
                projectId={projectId}
            />

            <EditPlanModal
                open={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setSelectedPlan(null);
                }}
                onSuccess={refetch}
                projectId={projectId}
                plan={selectedPlan}
            />

            <CreateMilestoneModal
                open={createMilestoneOpen}
                onClose={() => setCreateMilestoneOpen(false)}
                onSuccess={refetch}
                projectId={projectId}
                planId={selectedPlan?.id || ''}
            />
        </div>
    );
}

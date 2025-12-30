import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Plus, Calendar, ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';
import CreateTaskModal from './CreateTaskModal';

interface PlanDetailViewProps {
    plan: any;
    allTasks: any[];
    onAddMilestone: () => void;
    onTaskClick?: (taskId: string) => void;
}

export default function PlanDetailView({ plan, allTasks, onAddMilestone, onTaskClick }: PlanDetailViewProps) {
    const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({});

    // Create Task Modal State - local to this view
    const [createTaskOpen, setCreateTaskOpen] = useState(false);
    const [selectedMilestoneForTask, setSelectedMilestoneForTask] = useState<string>('');

    // Toggle expand/collapse
    const toggleMilestone = (milestoneId: string) => {
        setExpandedMilestones(prev => ({
            ...prev,
            [milestoneId]: prev[milestoneId] === undefined ? false : !prev[milestoneId] // Default open? No, let's default closed or handle logic
        }));
    };

    // Helper to get initials
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
    };

    // Helper to get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DONE': return 'bg-green-100 text-green-800';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
            case 'IN_REVIEW': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Default expanded state logic: Expand all by default? 
    // Or we can just treat undefined as expanded.
    const isExpanded = (id: string) => expandedMilestones[id] !== false;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">{plan.name}</h2>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                    </p>
                </div>
                <Button onClick={onAddMilestone}>
                    <Plus className="mr-2 h-4 w-4" /> Add Milestone
                </Button>
            </div>

            <div className="space-y-4">
                {plan.milestones?.map((milestone: any) => {
                    const milestoneTasks = allTasks.filter((t: any) => t.milestoneId === milestone.id);
                    const completedTasks = milestoneTasks.filter((t: any) => t.status === 'DONE').length;
                    const progress = milestoneTasks.length > 0 ? Math.round((completedTasks / milestoneTasks.length) * 100) : 0;

                    return (
                        <Card key={milestone.id} className="overflow-hidden">
                            <div
                                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => toggleMilestone(milestone.id)}
                            >
                                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                    {isExpanded(milestone.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-lg">{milestone.name}</h3>
                                        {milestone.isCompleted && <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-1">{milestone.description}</p>
                                </div>

                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                    <div className="flex flex-col items-end">
                                        <span className="font-medium text-foreground">{progress}%</span>
                                        <span className="text-xs">Progress</span>
                                    </div>
                                    <div className="flex flex-col items-end min-w-[80px]">
                                        <span className="font-medium text-foreground">{completedTasks} / {milestoneTasks.length}</span>
                                        <span className="text-xs">Tasks</span>
                                    </div>
                                    <div className="flex flex-col items-end min-w-[100px]">
                                        <span className="font-medium text-foreground">{new Date(milestone.date).toLocaleDateString()}</span>
                                        <span className="text-xs">Due Date</span>
                                    </div>
                                </div>
                            </div>

                            {isExpanded(milestone.id) && (
                                <div className="border-t bg-slate-50/50 p-4 pt-0">
                                    <div className="mt-4 space-y-2">
                                        {milestoneTasks.length > 0 ? (
                                            milestoneTasks.map((task: any) => (
                                                <div
                                                    key={task.id}
                                                    className="flex items-center gap-4 p-3 bg-background rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onTaskClick && onTaskClick(task.id);
                                                    }}
                                                >
                                                    <div className="shrink-0 pt-1">
                                                        {task.status === 'DONE' ? (
                                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                        ) : (
                                                            <Circle className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn("font-medium truncate", task.status === 'DONE' && "line-through text-muted-foreground")}>
                                                            {task.title}
                                                        </p>
                                                    </div>

                                                    <Badge variant="outline" className={cn("shrink-0", getStatusColor(task.status))}>
                                                        {task.status.replace('_', ' ')}
                                                    </Badge>

                                                    {task.assignee ? (
                                                        <div className="flex items-center gap-2 shrink-0 min-w-[120px]">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarFallback className="text-xs">
                                                                    {getInitials(task.assignee.firstName, task.assignee.lastName)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                                                                {task.assignee.firstName}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="shrink-0 min-w-[120px] text-sm text-muted-foreground">Unassigned</div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 text-muted-foreground text-sm italic">
                                                No tasks in this milestone.
                                            </div>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full mt-2 border-dashed border hover:bg-background"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedMilestoneForTask(milestone.id);
                                                setCreateTaskOpen(true);
                                            }}
                                        >
                                            <Plus className="mr-2 h-3 w-3" /> Add Task
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}

                {(!plan.milestones || plan.milestones.length === 0) && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        No milestones found. Start by adding one!
                    </div>
                )}
            </div>

            <CreateTaskModal
                open={createTaskOpen}
                onClose={() => setCreateTaskOpen(false)}
                onSuccess={() => {
                    if (onRefresh) onRefresh();
                }}
                projectId={plan.projectId}
                defaultMilestoneId={selectedMilestoneForTask}
                defaultPlanId={plan.id}
            />
        </div>
    );
}

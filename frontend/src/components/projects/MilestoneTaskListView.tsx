import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../../lib/utils';
import { Calendar, Clock } from 'lucide-react';

interface MilestoneTaskListViewProps {
    tasks: any[];
    onTaskClick?: (taskId: string) => void;
}

export default function MilestoneTaskListView({ tasks, onTaskClick }: MilestoneTaskListViewProps) {
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DONE': return 'bg-green-100 text-green-800 border-green-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'IN_REVIEW': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return 'text-red-600 font-medium';
            case 'HIGH': return 'text-orange-600 font-medium';
            case 'MEDIUM': return 'text-blue-600';
            default: return 'text-slate-600';
        }
    };

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground bg-slate-50/50">
                No tasks found in this milestone. Create one to get started.
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40%]">Task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Due Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((task) => (
                        <TableRow
                            key={task.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => onTaskClick?.(task.id)}
                        >
                            <TableCell>
                                <div className="font-medium">{task.title}</div>
                                {task.description && (
                                    <div className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                        {task.description}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={cn(getStatusColor(task.status))}>
                                    {task.status.replace('_', ' ')}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <span className={cn("text-xs uppercase", getPriorityColor(task.priority))}>
                                    {task.priority || 'MEDIUM'}
                                </span>
                            </TableCell>
                            <TableCell>
                                {task.assignee ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-xs">
                                                {getInitials(task.assignee.firstName, task.assignee.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm text-muted-foreground">
                                            {task.assignee.firstName} {task.assignee.lastName?.[0]}.
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-muted-foreground text-xs italic">Unassigned</span>
                                )}
                            </TableCell>
                            <TableCell>
                                {task.dueDate ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground">-</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

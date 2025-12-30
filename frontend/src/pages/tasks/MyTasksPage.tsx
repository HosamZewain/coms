import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import api from "../../lib/api";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import TaskDetailsDialog from "../boards/TaskDetailsDialog";

export default function MyTasksPage() {
    const { user } = useAuthStore();
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [assigneeId, setAssigneeId] = useState<string>(user?.id || '');
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedTaskId = searchParams.get('task');

    const handleTaskClick = (taskId: string) => {
        setSearchParams({ task: taskId });
    };

    const handleCloseDialog = () => {
        setSearchParams({});
    };

    const { data: employees } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const res = await api.get('/employees');
            return res.data.data;
        }
    });

    const { data: tasks, isLoading, error } = useQuery({
        queryKey: ['my-tasks', filterStatus, assigneeId],
        queryFn: async () => {
            const params: any = { assigneeId };
            if (filterStatus !== "ALL") params.status = filterStatus;

            const res = await api.get('/tasks', { params });
            return res.data.data;
        },
        enabled: !!assigneeId
    });

    if (isLoading) return <div className="p-8">Loading tasks...</div>;
    if (error) return <div className="p-8 text-red-500">Failed to load tasks</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
                    <p className="text-muted-foreground mt-1">Manage assigned tasks and track progress.</p>
                </div>
                <div className="flex gap-2">
                    <Select value={assigneeId} onValueChange={setAssigneeId}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select User" />
                        </SelectTrigger>
                        <SelectContent>
                            {employees?.map((emp: any) => (
                                <SelectItem key={emp.id} value={emp.userId || emp.id}>
                                    {emp.firstName} {emp.lastName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Tasks</SelectItem>
                            <SelectItem value="TODO">To Do</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="REVIEW">Review</SelectItem>
                            <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4">
                {tasks?.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            No tasks found matching your filters.
                        </CardContent>
                    </Card>
                ) : (
                    tasks?.map((task: any) => (
                        <Card
                            key={task.id}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleTaskClick(task.id)}
                        >
                            <CardContent className="p-6 flex items-start justifying-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant={
                                            task.priority === 'URGENT' ? 'destructive' :
                                                task.priority === 'HIGH' ? 'default' :
                                                    task.priority === 'MEDIUM' ? 'secondary' : 'outline'
                                        }>
                                            {task.priority || 'MEDIUM'}
                                        </Badge>
                                        {task.project && (
                                            <span className="text-sm text-muted-foreground">
                                                {task.project.name}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold mb-1">{task.title}</h3>
                                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                                        {task.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        {task.dueDate && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                Due {new Date(task.dueDate).toLocaleDateString()}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Badge variant="outline" className="capitalize">
                                                {task.status ? task.status.replace('_', ' ').toLowerCase() : 'unknown'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {selectedTaskId && (
                <TaskDetailsDialog
                    taskId={selectedTaskId}
                    onClose={handleCloseDialog}
                />
            )}
        </div>
    );
}

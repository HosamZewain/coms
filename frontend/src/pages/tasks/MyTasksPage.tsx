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
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedTaskId = searchParams.get('task');

    const handleTaskClick = (taskId: string) => {
        setSearchParams({ task: taskId });
    };

    const handleCloseDialog = () => {
        setSearchParams({});
    };

    const { data: tasks, isLoading, error } = useQuery({
        queryKey: ['my-tasks', filterStatus, user?.id],
        queryFn: async () => {
            const params: any = { assigneeId: user?.id };
            if (filterStatus !== "ALL") params.status = filterStatus;

            const res = await api.get('/tasks', { params });
            return res.data.data;
        },
        enabled: !!user?.id
    });

    // Calculate Statistics from the *filtered* or *all* tasks? 
    // Ideally stats should be for ALL tasks assigned to user, ignoring the current filter status for the top cards to be useful overview.
    // So distinct query or just deriving from "ALL" list if we fetch all?
    // Let's fetch ALL tasks for stats separate from the filtered list, OR just filter client-side for "My Tasks" page since volume isn't huge.
    // Client-side filtering is better for "My Tasks" to avoid multiple queries.

    // Modify query to fetch ALL tasks assigned to me, then filter locally for the list.
    const { data: allTasks, isLoading: loadingAll } = useQuery({
        queryKey: ['my-tasks-all', user?.id],
        queryFn: async () => {
            const res = await api.get('/tasks', { params: { assigneeId: user?.id } }); // Fetch all
            return res.data.data || [];
        },
        enabled: !!user?.id
    });

    const stats = {
        total: allTasks?.length || 0,
        inProgress: allTasks?.filter((t: any) => t.status === 'IN_PROGRESS').length || 0,
        done: allTasks?.filter((t: any) => t.status === 'DONE').length || 0,
        highPriority: allTasks?.filter((t: any) => ['HIGH', 'CRITICAL'].includes(t.priority)).length || 0
    };

    // Filter for the list view
    const displayedTasks = allTasks?.filter((t: any) => filterStatus === "ALL" || t.status === filterStatus) || [];

    if (isLoading || loadingAll) return <div className="p-8">Loading tasks...</div>;
    if (error) return <div className="p-8 text-red-500">Failed to load tasks</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
                <p className="text-muted-foreground mt-1">Overview of your current workload and progress.</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6 flex flex-col gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Total Tasks</span>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{stats.total}</span>
                            <Badge variant="secondary" className="h-8 w-8 rounded-full p-0 flex items-center justify-center bg-blue-100 text-blue-700">
                                {stats.total}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex flex-col gap-2">
                        <span className="text-sm font-medium text-muted-foreground">In Progress</span>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{stats.inProgress}</span>
                            <Badge variant="secondary" className="h-8 w-8 rounded-full p-0 flex items-center justify-center bg-yellow-100 text-yellow-700">
                                <Clock className="h-4 w-4" />
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex flex-col gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Completed</span>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{stats.done}</span>
                            <Badge variant="secondary" className="h-8 w-8 rounded-full p-0 flex items-center justify-center bg-green-100 text-green-700">
                                {stats.done}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex flex-col gap-2">
                        <span className="text-sm font-medium text-muted-foreground">High Priority</span>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{stats.highPriority}</span>
                            <Badge variant="secondary" className="h-8 w-8 rounded-full p-0 flex items-center justify-center bg-red-100 text-red-700">
                                !
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex justify-end">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="REVIEW">Review</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tasks List Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-medium">Task Title</th>
                                <th className="px-6 py-4 font-medium">Project / Board</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Priority</th>
                                <th className="px-6 py-4 font-medium">Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedTasks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No tasks found.
                                    </td>
                                </tr>
                            ) : (
                                displayedTasks.map((task: any) => (
                                    <tr
                                        key={task.id}
                                        onClick={() => handleTaskClick(task.id)}
                                        className="bg-white border-b hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {task.title}
                                            {task.type === 'BUG' && <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Bug</span>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {task.project?.name || task.board?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="capitalize">
                                                {task.status?.replace('_', ' ').toLowerCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                task.priority === 'URGENT' || task.priority === 'CRITICAL' ? 'destructive' :
                                                    task.priority === 'HIGH' ? 'default' :
                                                        task.priority === 'MEDIUM' ? 'secondary' : 'outline'
                                            }>
                                                {task.priority || 'MEDIUM'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {selectedTaskId && (
                <TaskDetailsDialog
                    taskId={selectedTaskId}
                    onClose={handleCloseDialog}
                />
            )}
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Filter, Save, Share2, Search, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Calendar } from '../../components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import TaskDetailsDialog from './TaskDetailsDialog';

interface TaskListViewProps {
    projectId?: string;
    boardId?: string;
}

export default function TaskListView({ projectId, boardId: propBoardId }: TaskListViewProps) {
    const params = useParams();
    const boardId = propBoardId || params.boardId;
    const [searchParams, setSearchParams] = useSearchParams();

    // Filters state
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
    const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'ALL');
    const [assigneeFilter, setAssigneeFilter] = useState(searchParams.get('assignee') || 'ALL');
    const [planFilter, setPlanFilter] = useState(searchParams.get('plan') || 'ALL');
    const [milestoneFilter, setMilestoneFilter] = useState(searchParams.get('milestone') || 'ALL');
    const [dateFrom, setDateFrom] = useState<Date | undefined>(searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined);
    const [search, setSearch] = useState(searchParams.get('search') || '');

    // Sync state to URL
    useEffect(() => {
        const params: any = {};
        if (statusFilter !== 'ALL') params.status = statusFilter;
        if (priorityFilter !== 'ALL') params.priority = priorityFilter;
        if (assigneeFilter !== 'ALL') params.assignee = assigneeFilter;
        if (planFilter !== 'ALL') params.plan = planFilter;
        if (milestoneFilter !== 'ALL') params.milestone = milestoneFilter;
        if (dateFrom) params.dateFrom = dateFrom.toISOString();
        if (dateTo) params.dateTo = dateTo.toISOString();
        if (search) params.search = search;
        setSearchParams(params);
    }, [statusFilter, priorityFilter, assigneeFilter, planFilter, milestoneFilter, dateFrom, dateTo, search, setSearchParams]);

    // Fetch members for assignee filter
    const { data: members = [] } = useQuery({
        queryKey: ['project-members', projectId],
        queryFn: async () => {
            if (!projectId) return [];
            const res = await api.get(`/projects/${projectId}/members`);
            return res.data.data || [];
        },
        enabled: !!projectId
    });

    // Fetch Plans
    const { data: plans = [] } = useQuery({
        queryKey: ['project-plans-filter', projectId],
        queryFn: async () => {
            if (!projectId) return [];
            const res = await api.get(`/projects/${projectId}/plans`);
            return res.data.data || [];
        },
        enabled: !!projectId
    });

    // Fetch Milestones (dependent on selected Plan, otherwise fetch all? For now, fetch all if possible or just filter locally if hierarchy is loaded. 
    // BUT common pattern: if no plan selected, maybe show empty or all? Let's just filter selected Plan's milestones if a plan is picked)
    const selectedPlan = plans.find((p: any) => p.id === planFilter);
    const milestones = selectedPlan?.milestones || [];

    const { data: tasks, isLoading } = useQuery({
        queryKey: ['board-tasks-list', boardId, projectId, statusFilter, priorityFilter, assigneeFilter, planFilter, milestoneFilter, dateFrom, dateTo, search],
        queryFn: async () => {
            const params: any = {};
            if (statusFilter !== 'ALL') params.status = statusFilter;
            if (priorityFilter !== 'ALL') params.priority = priorityFilter;
            if (assigneeFilter !== 'ALL') params.assigneeIds = [assigneeFilter];
            if (planFilter !== 'ALL') params.planId = planFilter;
            if (milestoneFilter !== 'ALL') params.milestoneId = milestoneFilter;
            if (dateFrom) params.dueDateFrom = dateFrom.toISOString();
            if (dateTo) params.dueDateTo = dateTo.toISOString();
            if (search) params.search = search;

            if (projectId) {
                params.projectId = projectId;
                const res = await api.get('/tasks', { params });
                return res.data.data;
            } else if (boardId) {
                const res = await api.get(`/boards/${boardId}/tasks`, { params });
                return res.data;
            }
            return [];
        },
        enabled: !!boardId || !!projectId
    });

    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        try {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert("Failed to copy link to clipboard.");
        }
    };

    const handleTaskClick = (taskId: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('task', taskId);
        setSearchParams(params);
    };

    const handleCloseDialog = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('task');
        setSearchParams(params);
    };

    const selectedTaskId = searchParams.get('task');

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-3 rounded-lg border">
                <div className="flex items-center gap-2 flex-1 w-full sm:w-auto flex-wrap">
                    <div className="relative flex-1 sm:max-w-xs min-w-[200px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                                {(statusFilter !== 'ALL' || priorityFilter !== 'ALL' || assigneeFilter !== 'ALL' || planFilter !== 'ALL' || milestoneFilter !== 'ALL' || dateFrom || dateTo) && (
                                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                        {[
                                            statusFilter !== 'ALL',
                                            priorityFilter !== 'ALL',
                                            assigneeFilter !== 'ALL',
                                            planFilter !== 'ALL',
                                            milestoneFilter !== 'ALL',
                                            dateFrom,
                                            dateTo
                                        ].filter(Boolean).length}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-4 align-start">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Filter Tasks</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Refine your task list with the following options.
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-medium">Status</label>
                                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ALL">All Status</SelectItem>
                                                    <SelectItem value="TODO">To Do</SelectItem>
                                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                                                    <SelectItem value="DONE">Done</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-medium">Priority</label>
                                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ALL">All Priority</SelectItem>
                                                    <SelectItem value="LOW">Low</SelectItem>
                                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                                    <SelectItem value="HIGH">High</SelectItem>
                                                    <SelectItem value="CRITICAL">Critical</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium">Assignee</label>
                                        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Assignee" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">All Assignees</SelectItem>
                                                {members.map((member: any) => (
                                                    <SelectItem key={member.id} value={member.user?.id || member.id}>
                                                        {member.user?.firstName || member.firstName} {member.user?.lastName || member.lastName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-medium">Plan</label>
                                            <Select value={planFilter} onValueChange={(val) => {
                                                setPlanFilter(val);
                                                setMilestoneFilter('ALL');
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Plan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ALL">All Plans</SelectItem>
                                                    {plans.map((plan: any) => (
                                                        <SelectItem key={plan.id} value={plan.id}>
                                                            {plan.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-medium">Milestone</label>
                                            <Select
                                                value={milestoneFilter}
                                                onValueChange={setMilestoneFilter}
                                                disabled={planFilter === 'ALL' || milestones.length === 0}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Milestone" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ALL">All Milestones</SelectItem>
                                                    {milestones.map((milestone: any) => (
                                                        <SelectItem key={milestone.id} value={milestone.id}>
                                                            {milestone.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-medium">From Date</label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal pl-3",
                                                            !dateFrom && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {dateFrom ? format(dateFrom, "P") : <span>Pick date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={dateFrom}
                                                        onSelect={setDateFrom}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-medium">To Date</label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal pl-3",
                                                            !dateTo && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {dateTo ? format(dateTo, "P") : <span>Pick date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={dateTo}
                                                        onSelect={setDateTo}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    <Button
                                        variant="destructive"
                                        className="w-full mt-2"
                                        onClick={() => {
                                            setStatusFilter('ALL');
                                            setPriorityFilter('ALL');
                                            setAssigneeFilter('ALL');
                                            setPlanFilter('ALL');
                                            setMilestoneFilter('ALL');
                                            setDateFrom(undefined);
                                            setDateTo(undefined);
                                            setSearch('');
                                        }}
                                    >
                                        Clear All Filters
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                        {copied ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share View
                            </>
                        )}
                    </Button>
                    <Button variant="outline" size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save Query
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-md bg-card flex-1 overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Assignees</TableHead>
                            <TableHead>Due Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
                            </TableRow>
                        ) : tasks?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No tasks found</TableCell>
                            </TableRow>
                        ) : (
                            tasks?.map((task: any) => (
                                <TableRow
                                    key={task.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleTaskClick(task.id)}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{task.title}</span>
                                            {task.epic && <span className="text-xs text-muted-foreground">{task.epic.title}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{task.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{task.priority}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex -space-x-2">
                                            {task.assignments.map((a: any, i: number) => (
                                                <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                                    <AvatarFallback className="text-[10px]">{a.user.firstName[0]}{a.user.lastName[0]}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {task.assignments.length === 0 && <span className="text-muted-foreground text-xs">-</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
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

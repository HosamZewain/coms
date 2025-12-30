import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
    Clock, MessageSquare, UserPlus, Edit, CheckCircle, AlertCircle,
    Search, Filter, Calendar, ListFilter
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function LogsPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [userFilter, setUserFilter] = useState<string>('all');
    const [moduleFilter, setModuleFilter] = useState<string>('all');

    const { data: activities, isLoading } = useQuery({
        queryKey: ['all-activities'],
        queryFn: async () => {
            const res = await api.get('/activities/recent?limit=100');
            return res.data.data;
        },
        refetchInterval: 30000
    });

    const { data: users } = useQuery({
        queryKey: ['users-for-filter'],
        queryFn: async () => {
            const res = await api.get('/employees');
            return res.data.data || res.data;
        }
    });

    const getActivityIcon = (action: string) => {
        switch (action) {
            case 'created': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'updated': return <Edit className="h-5 w-5 text-blue-500" />;
            case 'status_changed': return <AlertCircle className="h-5 w-5 text-orange-500" />;
            case 'assigned': return <UserPlus className="h-5 w-5 text-purple-500" />;
            case 'commented': return <MessageSquare className="h-5 w-5 text-cyan-500" />;
            default: return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getActionBadge = (action: string) => {
        const variants: Record<string, any> = {
            created: 'default',
            updated: 'secondary',
            status_changed: 'outline',
            assigned: 'default',
            commented: 'secondary'
        };
        return <Badge variant={variants[action] || 'outline'}>{action.replace('_', ' ')}</Badge>;
    };

    const getActivityText = (activity: any) => {
        const actorName = activity.actor
            ? `${activity.actor.firstName} ${activity.actor.lastName}`
            : 'Someone';
        const taskTitle = activity.task?.title || 'a task';

        switch (activity.action) {
            case 'created':
                return { actor: actorName, action: 'created', target: taskTitle };
            case 'updated':
                return { actor: actorName, action: 'updated', target: taskTitle };
            case 'status_changed':
                const meta = activity.meta ? JSON.parse(activity.meta) : {};
                return {
                    actor: actorName,
                    action: 'moved',
                    target: taskTitle,
                    detail: `from ${meta.from} to ${meta.to}`
                };
            case 'assigned':
                return { actor: actorName, action: 'assigned', target: taskTitle };
            case 'commented':
                return { actor: actorName, action: 'commented on', target: taskTitle };
            default:
                return { actor: actorName, action: 'performed an action on', target: taskTitle };
        }
    };

    // Determine module for each activity
    const getActivityModule = (activity: any) => {
        if (activity.action === 'project_deleted') return 'projects';
        if (['created', 'updated', 'deleted', 'status_changed', 'assigned', 'commented'].includes(activity.action)) {
            return 'tasks';
        }
        return 'other';
    };

    // Filter activities
    const filteredActivities = activities?.filter((activity: any) => {
        // Module filter
        if (moduleFilter !== 'all' && getActivityModule(activity) !== moduleFilter) {
            return false;
        }

        // Search filter
        const matchesSearch = searchQuery === '' ||
            activity.task?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (activity.actor?.firstName + ' ' + activity.actor?.lastName).toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) {
            return false;
        }

        // Action filter
        if (actionFilter !== 'all' && activity.action !== actionFilter) {
            return false;
        }

        // User filter
        if (userFilter !== 'all' && activity.actorUserId !== userFilter) {
            return false;
        }

        return true;
    }) || [];

    // Group activities by date
    const groupedActivities = filteredActivities.reduce((groups: any, activity: any) => {
        const date = format(new Date(activity.createdAt), 'yyyy-MM-dd');
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(activity);
        return groups;
    }, {});

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
                <p className="text-muted-foreground mt-2">
                    Complete history of all team activities and changes
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search tasks or users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {/* Action Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Action Type</label>
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="created">Created</SelectItem>
                                    <SelectItem value="updated">Updated</SelectItem>
                                    <SelectItem value="status_changed">Status Changed</SelectItem>
                                    <SelectItem value="assigned">Assigned</SelectItem>
                                    <SelectItem value="commented">Commented</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* User Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Team Member</label>
                            <Select value={userFilter} onValueChange={setUserFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Members</SelectItem>
                                    {users?.map((user: any) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.firstName} {user.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Module Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Module</label>
                            <Select value={moduleFilter} onValueChange={setModuleFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Modules" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Modules</SelectItem>
                                    <SelectItem value="tasks">Tasks</SelectItem>
                                    <SelectItem value="projects">Projects</SelectItem>
                                    <SelectItem value="employees">Employees</SelectItem>
                                    <SelectItem value="attendance">Attendance</SelectItem>
                                    <SelectItem value="recruitment">Recruitment</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                        <p className="text-muted-foreground">
                            Showing {filteredActivities.length} of {activities?.length || 0} activities
                        </p>
                        {(searchQuery || actionFilter !== 'all' || userFilter !== 'all' || moduleFilter !== 'all') && (
                            <button
                                className="text-primary hover:underline"
                                onClick={() => {
                                    setSearchQuery('');
                                    setActionFilter('all');
                                    setUserFilter('all');
                                    setModuleFilter('all');
                                }}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Activity Timeline</CardTitle>
                    <CardDescription>Chronological view of all team activities</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex items-start gap-4 animate-pulse">
                                    <div className="h-10 w-10 rounded-full bg-muted" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted rounded w-3/4" />
                                        <div className="h-3 bg-muted rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredActivities.length === 0 ? (
                        <div className="text-center py-12">
                            <ListFilter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-medium">No activities found</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Try adjusting your filters or search term
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6 max-h-[600px] overflow-y-auto">
                            {Object.entries(groupedActivities).map(([date, dateActivities]: [string, any]) => (
                                <div key={date}>
                                    {/* Date Header */}
                                    <div className="flex items-center gap-2 mb-4 sticky top-0 bg-background py-2 z-10">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="font-semibold text-sm">
                                            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                                        </h3>
                                        <div className="flex-1 h-px bg-border" />
                                    </div>

                                    {/* Activities for this date */}
                                    <div className="space-y-3 pl-6 border-l-2 border-border ml-2">
                                        {dateActivities.map((activity: any) => {
                                            const text = getActivityText(activity);
                                            return (
                                                <div
                                                    key={activity.id}
                                                    className="relative hover:bg-accent/50 p-3 rounded-lg cursor-pointer transition-colors -ml-6 pl-6"
                                                    onClick={() => {
                                                        if (activity.task?.id) {
                                                            navigate(`/projects/${activity.task.projectId}?task=${activity.task.id}`);
                                                        }
                                                    }}
                                                >
                                                    {/* Timeline dot */}
                                                    <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                                    </div>

                                                    <div className="flex items-start gap-3">
                                                        <div className="flex-shrink-0">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarFallback className="text-sm">
                                                                    {activity.actor
                                                                        ? activity.actor.firstName[0] + activity.actor.lastName[0]
                                                                        : '?'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start gap-2 flex-wrap">
                                                                {getActivityIcon(activity.action)}
                                                                <div>
                                                                    <p className="text-sm">
                                                                        <span className="font-medium">{text.actor}</span>
                                                                        {' '}{text.action}{' '}
                                                                        <span className="font-medium">"{text.target}"</span>
                                                                        {text.detail && (
                                                                            <span className="text-muted-foreground"> {text.detail}</span>
                                                                        )}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                                                        </p>
                                                                        <span className="text-xs text-muted-foreground">•</span>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {format(new Date(activity.createdAt), 'h:mm a')}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2">
                                                                {getActionBadge(activity.action)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

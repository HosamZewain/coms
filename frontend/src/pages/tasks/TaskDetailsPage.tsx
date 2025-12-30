import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import {
    ArrowLeft, Edit2, Save, X, Trash2, Calendar as CalendarIcon,
    Users, Loader2, MessageSquare, Plus, Clock
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import api from '../../lib/api';

export default function TaskDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [comment, setComment] = useState('');
    const [selectedAssignee, setSelectedAssignee] = useState('');

    // Fetch task details
    const { data: task, isLoading } = useQuery({
        queryKey: ['task', id],
        queryFn: async () => {
            const res = await api.get(`/tasks/${id}`);
            return res.data.data;
        },
        enabled: !!id
    });

    // Fetch employees for assignee dropdown
    const { data: employees } = useQuery({
        queryKey: ['project-members', task?.projectId],
        queryFn: async () => {
            if (!task?.projectId) return [];
            const res = await api.get(`/projects/${task.projectId}/members`);
            const members = res.data.data || [];
            if (!members || members.length === 0) {
                const empRes = await api.get('/employees');
                return empRes.data.data || empRes.data;
            }
            return members;
        },
        enabled: !!task?.projectId
    });

    // Fetch task activities
    const { data: activities, isLoading: activitiesLoading } = useQuery({
        queryKey: ['task-activities', id],
        queryFn: async () => {
            const res = await api.get(`/activities/task/${id}`);
            return res.data.data;
        },
        enabled: !!id
    });

    // Update task mutation
    const updateTaskMutation = useMutation({
        mutationFn: async (updates: any) => {
            return await api.patch(`/tasks/${id}`, updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', id] });
            queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
            setIsEditingTitle(false);
            setIsEditingDescription(false);
        }
    });

    // Add comment mutation
    const addCommentMutation = useMutation({
        mutationFn: async () => {
            return await api.post(`/tasks/${id}/comments`, { body: comment });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', id] });
            setComment('');
        }
    });

    // Add assignee mutation  
    const addAssigneeMutation = useMutation({
        mutationFn: async (userId: string) => {
            return await api.post(`/tasks/${id}/assignments`, { userId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', id] });
            setSelectedAssignee('');
        }
    });

    // Delete task mutation
    const deleteTaskMutation = useMutation({
        mutationFn: async () => {
            return await api.delete(`/tasks/${id}`);
        },
        onSuccess: () => {
            navigate(task?.projectId ? `/projects/${task.projectId}` : '/tasks');
        }
    });

    const handleSaveTitle = () => {
        updateTaskMutation.mutate({ title: editedTitle });
    };

    const handleSaveDescription = () => {
        updateTaskMutation.mutate({ description: editedDescription });
    };

    const handleStatusChange = (status: string) => {
        updateTaskMutation.mutate({ status });
    };

    const handlePriorityChange = (priority: string) => {
        updateTaskMutation.mutate({ priority });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return 'destructive';
            case 'HIGH': return 'default';
            case 'MEDIUM': return 'secondary';
            default: return 'outline';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DONE': return 'default';
            case 'IN_PROGRESS': return 'secondary';
            default: return 'outline';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!task) {
        return <div>Task not found</div>;
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header with breadcrumb */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    {task.project && (
                        <>
                            <span>/</span>
                            <Link to={`/projects/${task.projectId}`} className="hover:text-foreground">
                                {task.project.name}
                            </Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-foreground">Task Details</span>
                </div>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTaskMutation.mutate()}
                    disabled={deleteTaskMutation.isPending}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title Section */}
                    <Card>
                        <CardContent className="pt-6">
                            {isEditingTitle ? (
                                <div className="space-y-2">
                                    <Input
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        className="text-2xl font-bold"
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleSaveTitle}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setIsEditingTitle(false)}>
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start justify-between gap-4">
                                    <h1 className="text-3xl font-bold">{task.title}</h1>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setEditedTitle(task.title);
                                            setIsEditingTitle(true);
                                        }}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <div className="flex gap-2 mt-4">
                                <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
                                <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                <Badge variant="outline">{task.type}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Description
                                {!isEditingDescription && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setEditedDescription(task.description || '');
                                            setIsEditingDescription(true);
                                        }}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isEditingDescription ? (
                                <div className="space-y-2">
                                    <Textarea
                                        value={editedDescription}
                                        onChange={(e) => setEditedDescription(e.target.value)}
                                        rows={6}
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleSaveDescription}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setIsEditingDescription(false)}>
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {task.description || 'No description provided'}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Comments */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Comments
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Comment List */}
                            {task.comments?.length > 0 ? (
                                <div className="space-y-4">
                                    {task.comments.map((comment: any) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {comment.author?.firstName[0]}{comment.author?.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {comment.author?.firstName} {comment.author?.lastName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm mt-1">{comment.body}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No comments yet</p>
                            )}

                            <Separator />

                            {/* Add Comment */}
                            <div className="space-y-2">
                                <Textarea
                                    placeholder="Add a comment..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={3}
                                />
                                <Button
                                    size="sm"
                                    onClick={() => addCommentMutation.mutate()}
                                    disabled={!comment.trim() || addCommentMutation.isPending}
                                >
                                    {addCommentMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Add Comment
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Log */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Activity Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activitiesLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : activities && activities.length > 0 ? (
                                <div className="space-y-4">
                                    {activities.map((activity: any) => {
                                        const actorName = activity.actor
                                            ? `${activity.actor.firstName} ${activity.actor.lastName}`
                                            : 'System';

                                        let actionText = '';
                                        let actionColor = 'text-muted-foreground';

                                        switch (activity.action) {
                                            case 'created':
                                                actionText = 'created this task';
                                                actionColor = 'text-green-600';
                                                break;
                                            case 'updated':
                                                // Parse changes from metadata
                                                const updateMeta = activity.meta ? JSON.parse(activity.meta) : {};
                                                if (updateMeta.changes && updateMeta.changes.length > 0) {
                                                    const changeDescriptions = updateMeta.changes.map((change: any) => {
                                                        const fieldName = change.field.replace(/([A-Z])/g, ' $1').toLowerCase();
                                                        if (change.field === 'description') {
                                                            return `${fieldName}`;
                                                        }
                                                        return `${fieldName} from "${change.from}" to "${change.to}"`;
                                                    });
                                                    actionText = `changed ${changeDescriptions.join(', ')}`;
                                                } else {
                                                    actionText = 'updated this task';
                                                }
                                                actionColor = 'text-blue-600';
                                                break;
                                            case 'status_changed':
                                                const meta = activity.meta ? JSON.parse(activity.meta) : {};
                                                actionText = `changed status from ${meta.from || 'unknown'} to ${meta.to || 'unknown'}`;
                                                actionColor = 'text-orange-600';
                                                break;
                                            case 'assigned':
                                                actionText = 'was assigned to this task';
                                                actionColor = 'text-purple-600';
                                                break;
                                            case 'commented':
                                                actionText = 'added a comment';
                                                actionColor = 'text-cyan-600';
                                                break;
                                            default:
                                                actionText = 'performed an action';
                                        }

                                        return (
                                            <div key={activity.id} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="text-xs">
                                                        {activity.actor
                                                            ? activity.actor.firstName[0] + activity.actor.lastName[0]
                                                            : 'SY'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">{actorName}</span>
                                                        <span className={`text-sm ${actionColor}`}>{actionText}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {format(new Date(activity.createdAt), 'MMM d, yyyy • h:mm a')}
                                                        {' • '}
                                                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No activity yet
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={task.status} onValueChange={handleStatusChange}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODO">To Do</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="DONE">Done</SelectItem>
                                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Priority */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Priority</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={task.priority} onValueChange={handlePriorityChange}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="CRITICAL">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Assignees */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Assignees
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {task.assignments?.map((assignment: any) => (
                                <div key={assignment.id} className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="text-xs">
                                            {assignment.user?.firstName[0]}{assignment.user?.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{assignment.user?.firstName} {assignment.user?.lastName}</span>
                                </div>
                            ))}

                            <Separator />

                            <div className="space-y-2">
                                <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Add assignee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees?.map((emp: any) => {
                                            const userId = emp.user?.id || emp.id;
                                            const firstName = emp.user?.firstName || emp.firstName || '';
                                            const lastName = emp.user?.lastName || emp.lastName || '';
                                            return (
                                                <SelectItem key={userId} value={userId}>
                                                    {firstName} {lastName}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={() => addAssigneeMutation.mutate(selectedAssignee)}
                                    disabled={!selectedAssignee || addAssigneeMutation.isPending}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Assignee
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dates */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                Dates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {task.startDate && (
                                <div>
                                    <span className="text-muted-foreground">Start: </span>
                                    <span>{format(new Date(task.startDate), 'MMM d, yyyy')}</span>
                                </div>
                            )}
                            {task.dueDate && (
                                <div>
                                    <span className="text-muted-foreground">Due: </span>
                                    <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="text-xs text-muted-foreground space-y-1">
                                <div>Created: {format(new Date(task.createdAt), 'MMM d, yyyy')}</div>
                                <div>Updated: {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

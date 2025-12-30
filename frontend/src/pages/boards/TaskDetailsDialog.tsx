import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import api from '../../lib/api';
import { format } from 'date-fns';
import { UserPlus, Send, Edit2, Save, X as XIcon, Plus, ExternalLink, Paperclip, FileIcon, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TaskDetailsDialogProps {
    taskId: string;
    onClose: () => void;
}

export default function TaskDetailsDialog({ taskId, onClose }: TaskDetailsDialogProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [comment, setComment] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState<any>(null);
    const [showAssigneeSelect, setShowAssigneeSelect] = useState(false);
    const [selectedAssignee, setSelectedAssignee] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: task, isLoading } = useQuery({
        queryKey: ['task', taskId],
        queryFn: async () => {
            const res = await api.get(`/tasks/${taskId}`);
            return res.data.data;
        },
        enabled: !!taskId
    });

    // Initialize editedTask when task data loads
    if (task && !editedTask) {
        setEditedTask(task);
    }

    const updateTaskMutation = useMutation({
        mutationFn: async (updates: any) => {
            return await api.patch(`/tasks/${taskId}`, updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
            queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
            queryClient.invalidateQueries({ queryKey: ['board-tasks-list'] });
            setIsEditing(false);
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            return await api.patch(`/tasks/${taskId}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
            queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
            queryClient.invalidateQueries({ queryKey: ['board-tasks-list'] });
        }
    });

    const { data: employees } = useQuery({
        queryKey: ['project-members', task?.projectId],
        queryFn: async () => {
            const projectId = task?.projectId;
            if (!projectId) {
                // Fallback to all employees
                const res = await api.get('/employees');
                return res.data.data || res.data;
            }
            // Fetch project members
            const res = await api.get(`/projects/${projectId}/members`);
            const members = res.data.data || res.data;

            // If no members, fallback to all employees
            if (!members || members.length === 0) {
                const empRes = await api.get('/employees');
                return empRes.data.data || empRes.data;
            }
            return members;
        },
        enabled: !!task
    });

    const addCommentMutation = useMutation({
        mutationFn: async () => {
            return await api.post(`/tasks/${taskId}/comments`, { body: comment });
        },
        onSuccess: () => {
            setComment('');
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
        }
    });

    const deleteCommentMutation = useMutation({
        mutationFn: async (commentId: string) => {
            return await api.delete(`/tasks/${taskId}/comments/${commentId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
        }
    });

    const addAssigneeMutation = useMutation({
        mutationFn: async (userId: string) => {
            return await api.post(`/tasks/${taskId}/assignments`, { userId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
            queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
            queryClient.invalidateQueries({ queryKey: ['board-tasks-list'] });
            setShowAssigneeSelect(false);
            setSelectedAssignee('');
        }
    });

    const uploadAttachmentMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            return await api.post(`/tasks/${taskId}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
        }
    });

    const deleteAttachmentMutation = useMutation({
        mutationFn: async (attachmentId: string) => {
            return await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
        }
    });

    const handleEdit = () => {
        if (task) {
            setEditedTask({ ...task });
            setIsEditing(true);
        }
    };

    const handleSave = () => {
        const updates = {
            title: editedTask.title,
            description: editedTask.description,
            type: editedTask.type,
            priority: editedTask.priority,
            startDate: editedTask.startDate,
            dueDate: editedTask.dueDate,
        };
        updateTaskMutation.mutate(updates);
    };

    const handleCancel = () => {
        if (task) {
            setEditedTask({ ...task });
            setIsEditing(false);
        }
    };

    const handleAddAssignee = () => {
        if (selectedAssignee) {
            addAssigneeMutation.mutate(selectedAssignee);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            uploadAttachmentMutation.mutate(e.target.files[0]);
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (isLoading) return null;
    if (!task) return null;

    const displayTask = isEditing ? editedTask : task;

    return (
        <Dialog open={!!taskId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start pr-8">
                        <div className="space-y-1 flex-1 mr-4">
                            <div className="flex gap-2 mb-2">
                                {isEditing ? (
                                    <>
                                        <Select value={editedTask.type} onValueChange={(val) => setEditedTask({ ...editedTask, type: val })}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="TASK">Task</SelectItem>
                                                <SelectItem value="BUG">Bug</SelectItem>
                                                <SelectItem value="SPIKE">Spike</SelectItem>
                                                <SelectItem value="CHORE">Chore</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </>
                                ) : (
                                    <Badge variant="outline">{displayTask.type}</Badge>
                                )}
                                <Badge>{displayTask.board?.name || 'No Board'}</Badge>
                            </div>
                            {isEditing ? (
                                <Input
                                    value={editedTask.title}
                                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                    className="text-xl font-semibold"
                                    placeholder="Task title"
                                />
                            ) : (
                                <DialogTitle className="text-xl">{displayTask.title}</DialogTitle>
                            )}
                            <DialogDescription>
                                {displayTask.epic?.title && `${displayTask.epic.title} / `}
                                {displayTask.plan?.name || 'No Plan'}
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            {!isEditing && (
                                <>
                                    <Select value={task.status} onValueChange={(val) => updateStatusMutation.mutate(val)}>
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TODO">To Do</SelectItem>
                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                            <SelectItem value="IN_REVIEW">In Review</SelectItem>
                                            <SelectItem value="DONE">Done</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="sm" onClick={handleEdit}>
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            navigate(`/tasks/${taskId}`);

                                        }}
                                        title="Open Full Page"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                            {isEditing && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCancel}
                                        disabled={updateTaskMutation.isPending}
                                    >
                                        <XIcon className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSave}
                                        disabled={!editedTask.title || updateTaskMutation.isPending}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                Description
                            </h3>
                            {isEditing ? (
                                <Textarea
                                    value={editedTask.description || ''}
                                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                    placeholder="Add a description..."
                                    className="min-h-[100px]"
                                />
                            ) : (
                                <div className="prose prose-sm text-muted-foreground p-3 border rounded-md min-h-[100px] bg-muted/10 whitespace-pre-wrap">
                                    {displayTask.description || "No description provided."}
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium flex items-center gap-2">
                                    <Paperclip className="h-4 w-4" />
                                    Attachments
                                    <Badge variant="secondary" className="text-xs h-5 px-1.5 min-w-[1.25rem]">{displayTask.attachments?.length || 0}</Badge>
                                </h3>
                                <div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                    />
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => fileInputRef.current?.click()}>
                                        <Plus className="mr-1 h-3 w-3" /> Upload
                                    </Button>
                                </div>
                            </div>

                            {displayTask.attachments && displayTask.attachments.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {displayTask.attachments.map((file: any) => (
                                        <div key={file.id} className="flex items-center gap-2 p-2 border rounded-md hover:bg-muted/50 group">
                                            <div className="h-8 w-8 bg-muted rounded flex items-center justify-center shrink-0">
                                                <FileIcon className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate" title={file.fileName}>{file.fileName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(file.fileSize / 1024).toFixed(0)} KB • {format(new Date(file.createdAt), 'MMM d')}
                                                </p>
                                            </div>
                                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a
                                                    href={`http://localhost:3000${file.fileUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 hover:bg-background rounded-md text-muted-foreground hover:text-foreground"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                </a>
                                                <button
                                                    onClick={() => deleteAttachmentMutation.mutate(file.id)}
                                                    className="p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive ml-1"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground bg-muted/10 border border-dashed rounded-md p-4 text-center">
                                    No attachments yet. Upload files to share with the team.
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                Activity
                            </h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <Avatar className="h-8 w-8 mt-1">
                                        <AvatarFallback>ME</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                        <Textarea
                                            placeholder="Write a comment..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="min-h-[80px]"
                                        />
                                        <div className="flex justify-end">
                                            <Button
                                                size="sm"
                                                disabled={!comment.trim() || addCommentMutation.isPending}
                                                onClick={() => addCommentMutation.mutate()}
                                            >
                                                Send
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    {task.comments?.map((c: any) => (
                                        <div key={c.id} className="flex gap-3 text-sm group">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{c.author.firstName[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-semibold">{c.author.firstName} {c.author.lastName}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">{format(new Date(c.createdAt), 'MMM d, h:mm a')}</span>
                                                        <button
                                                            onClick={() => deleteCommentMutation.mutate(c.id)}
                                                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                                        >
                                                            <XIcon className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-foreground">{c.body}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {task.comments?.length === 0 && (
                                        <p className="text-xs text-muted-foreground text-center py-4">
                                            No comments yet. Be the first to start the conversation!
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 md:border-l md:pl-6">
                        <div>
                            <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase">Status</h3>
                            <Badge variant="outline" className="w-full justify-center py-1">{displayTask.status}</Badge>
                        </div>

                        <div>
                            <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase">Priority</h3>
                            {isEditing ? (
                                <Select value={editedTask.priority} onValueChange={(val) => setEditedTask({ ...editedTask, priority: val })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="CRITICAL">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Badge
                                    className="w-full justify-center py-1"
                                    variant={displayTask.priority === 'HIGH' || displayTask.priority === 'CRITICAL' ? 'destructive' : 'secondary'}
                                >
                                    {displayTask.priority}
                                </Badge>
                            )}
                        </div>

                        <div>
                            <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase">Assignees</h3>
                            <div className="space-y-2">
                                {displayTask.assignments?.map((a: any) => (
                                    <div key={a.id} className="flex items-center gap-2 text-sm p-1.5 hover:bg-muted rounded-md transition-colors">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-[10px]">{a.user.firstName[0]}</AvatarFallback>
                                        </Avatar>
                                        <span>{a.user.firstName} {a.user.lastName}</span>
                                    </div>
                                ))}
                                {!showAssigneeSelect && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start px-0 text-muted-foreground hover:text-primary"
                                        onClick={() => setShowAssigneeSelect(true)}
                                    >
                                        <UserPlus className="h-3 w-3 mr-2" />
                                        Add Assignee
                                    </Button>
                                )}
                                {showAssigneeSelect && (
                                    <div className="space-y-2 bg-muted/50 p-2 rounded-md">
                                        <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                                            <SelectTrigger className="w-full h-8 text-xs">
                                                <SelectValue placeholder="Select employee" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employees?.filter((emp: any) => {
                                                    const userId = emp.user?.id || emp.id;
                                                    return !displayTask.assignments?.some((a: any) => a.user.id === userId);
                                                }).map((emp: any) => {
                                                    const userId = emp.user?.id || emp.id;
                                                    const firstName = emp.user?.firstName || emp.firstName || '';
                                                    const lastName = emp.user?.lastName || emp.lastName || '';
                                                    return (
                                                        <SelectItem key={userId} value={userId} className="text-xs">
                                                            {firstName} {lastName}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={handleAddAssignee}
                                                disabled={!selectedAssignee || addAssigneeMutation.isPending}
                                                className="flex-1 h-7 text-xs"
                                            >
                                                Add
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => { setShowAssigneeSelect(false); setSelectedAssignee(''); }}
                                                className="h-7 text-xs"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase">Dates</h3>
                            {isEditing ? (
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs">Start Date</Label>
                                        <Input
                                            type="date"
                                            value={editedTask.startDate ? new Date(editedTask.startDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => setEditedTask({ ...editedTask, startDate: e.target.value })}
                                            className="mt-1 h-8 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Due Date</Label>
                                        <Input
                                            type="date"
                                            value={editedTask.dueDate ? new Date(editedTask.dueDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                                            className="mt-1 h-8 text-xs"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2 text-sm">
                                    {displayTask.startDate && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground text-xs">Start</span>
                                            <span>{format(new Date(displayTask.startDate), 'MMM d, yyyy')}</span>
                                        </div>
                                    )}
                                    {displayTask.dueDate && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground text-xs">Due</span>
                                            <span>{format(new Date(displayTask.dueDate), 'MMM d, yyyy')}</span>
                                        </div>
                                    )}
                                    {!displayTask.startDate && !displayTask.dueDate && (
                                        <span className="text-muted-foreground italic text-xs block text-center py-2 bg-muted/20 rounded">
                                            No dates set
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t text-xs text-muted-foreground text-center">
                            Created {format(new Date(displayTask.createdAt), 'MM/dd/yyyy')}
                        </div>
                    </div>
                </div>
            </DialogContent >
        </Dialog >
    );
}

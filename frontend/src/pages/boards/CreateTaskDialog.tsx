import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
// import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import api from '../../lib/api';

interface CreateTaskDialogProps {
    boardId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CreateTaskDialog({ boardId, open, onOpenChange }: CreateTaskDialogProps) {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [type, setType] = useState('TASK');
    const [priority, setPriority] = useState('MEDIUM');

    const createTaskMutation = useMutation({
        mutationFn: async () => {
            // Default to TODO status
            return await api.post(`/boards/${boardId}/tasks`, {
                title,
                type,
                priority,
                status: 'TODO'
            });
        },
        onSuccess: () => {
            onOpenChange(false);
            setTitle('');
            queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
            queryClient.invalidateQueries({ queryKey: ['board-tasks-list'] });
        }
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Type
                        </Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TASK">Task</SelectItem>
                                <SelectItem value="BUG">Bug</SelectItem>
                                <SelectItem value="SPIKE">Spike</SelectItem>
                                <SelectItem value="CHORE">Chore</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="priority" className="text-right">
                            Priority
                        </Label>
                        <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="CRITICAL">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={() => createTaskMutation.mutate()} disabled={!title || createTaskMutation.isPending}>
                        Create Task
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

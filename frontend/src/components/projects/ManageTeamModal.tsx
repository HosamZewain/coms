import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Loader2, Search, Trash2, UserPlus, Check } from 'lucide-react';

interface ManageTeamModalProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    currentMembers: any[];
}

export default function ManageTeamModal({ open, onClose, projectId, currentMembers }: ManageTeamModalProps) {
    const [search, setSearch] = useState('');
    const queryClient = useQueryClient();

    // Fetch all users for search
    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['users', search],
        queryFn: async () => {
            const response = await api.get('/users'); // Assuming this endpoint exists and lists users
            // Simple client-side filtering since backend might not support search yet
            // In a real app, this should be server-side search
            return response.data.data.filter((u: any) =>
                u.firstName.toLowerCase().includes(search.toLowerCase()) ||
                u.lastName.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase())
            );
        },
        enabled: open
    });

    const addMemberMutation = useMutation({
        mutationFn: async (userId: string) => {
            await api.post(`/projects/${projectId}/members`, { userId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        }
    });

    const removeMemberMutation = useMutation({
        mutationFn: async (userId: string) => {
            await api.delete(`/projects/${projectId}/members/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        }
    });

    const isMember = (userId: string) => currentMembers.some(m => m.id === userId);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage Team Members</DialogTitle>
                    <p className="text-sm text-muted-foreground">Add or remove members from this project.</p>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Add Member Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Add Team Member</label>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        {search && (
                            <div className="border rounded-md mt-2 max-h-40 overflow-y-auto">
                                {usersLoading ? (
                                    <div className="p-2 flex justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div>
                                ) : users?.length === 0 ? (
                                    <div className="p-2 text-sm text-muted-foreground text-center">No users found</div>
                                ) : (
                                    users?.map((user: any) => (
                                        <div key={user.id} className="flex items-center justify-between p-2 hover:bg-muted/50">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-sm">
                                                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                            {isMember(user.id) ? (
                                                <span className="text-xs text-green-600 flex items-center"><Check className="h-3 w-3 mr-1" /> Member</span>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => addMemberMutation.mutate(user.id)}
                                                    disabled={addMemberMutation.isPending}
                                                >
                                                    <UserPlus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <div className="border-t my-4" />

                    {/* Current Members List */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Current Members ({currentMembers.length})</label>
                        <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                            {currentMembers.map((member: any) => (
                                <div key={member.id} className="flex items-center justify-between p-2 rounded-md border bg-card">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-medium">{member.firstName} {member.lastName}</div>
                                            <div className="text-xs text-muted-foreground">{member.email}</div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => removeMemberMutation.mutate(member.id)}
                                        disabled={removeMemberMutation.isPending}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {currentMembers.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No team members assigned yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

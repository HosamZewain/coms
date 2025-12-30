import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { ArrowLeft, Save, Loader2, UserPlus, Trash2, AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../components/ui/dialog";
import { useAuthStore } from '../../store/auth.store';
import api from '../../lib/api';

export default function ProjectSettingsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [project, setProject] = useState<any>(null);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [allEmployees, setAllEmployees] = useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [addingMember, setAddingMember] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { checkPermission } = useAuthStore();

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await api.get(`/projects/${id}`);
                setProject(response.data.data);
            } catch (error) {
                console.error('Failed to fetch project:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    useEffect(() => {
        const fetchTeamMembers = async () => {
            try {
                const res = await api.get(`/projects/${id}/members`);
                setTeamMembers(res.data.data || []);
            } catch (error) {
                console.error('Failed to fetch team members:', error);
            }
        };
        if (id) fetchTeamMembers();
    }, [id]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await api.get('/employees');
                setAllEmployees(res.data.data || res.data || []);
            } catch (error) {
                console.error('Failed to fetch employees:', error);
            }
        };
        fetchEmployees();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch(`/projects/${id}`, {
                name: project.name,
                description: project.description,
                status: project.status,
                startDate: project.startDate,
                endDate: project.endDate
            });
            console.log('Project settings updated successfully');
            navigate(`/projects/${id}`);
        } catch (error) {
            console.error('Failed to update project:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleAddMember = async () => {
        if (!selectedEmployee) return;
        setAddingMember(true);
        try {
            // Create a task assignment for this user to add them to the project
            // Since we don't have explicit project members table, we'll just show message
            console.log('Adding member:', selectedEmployee);
            alert('To add team members, create a task and assign it to them. They will automatically become part of the project team.');
            setSelectedEmployee('');
        } catch (error) {
            console.error('Failed to add member:', error);
        } finally {
            setAddingMember(false);
        }
    };

    const handleDeleteProject = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/projects/${id}`);
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to delete project:', error);
            setIsDeleting(false);
        }
    };

    const availableEmployees = allEmployees.filter(emp => {
        const empId = emp.user?.id || emp.id;
        return !teamMembers.some(member => member.id === empId);
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!project) return <div>Project not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" onClick={() => navigate(`/projects/${id}`)}>
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Project</span>
            </div>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
                <p className="text-muted-foreground">Manage your project configuration and team</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    value={project.name}
                                    onChange={(e) => setProject({ ...project, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={project.description || ''}
                                    onChange={(e) => setProject({ ...project, description: e.target.value })}
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={project.status} onValueChange={(val) => setProject({ ...project, status: val })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PLANNING">Planning</SelectItem>
                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                            <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                            <SelectItem value="COMPLETED">Completed</SelectItem>
                                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => setProject({ ...project, startDate: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => setProject({ ...project, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                                <Button variant="outline" onClick={() => navigate(`/projects/${id}`)}>
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="team" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Team members are users who have been assigned to tasks in this project
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {teamMembers.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No team members yet</p>
                                    <p className="text-sm mt-2">Create tasks and assign users to automatically build your team</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {teamMembers.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{member.firstName?.[0]}{member.lastName?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{member.firstName} {member.lastName}</p>
                                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 border-t">
                                <p className="text-sm font-medium mb-3">Add Team Member</p>
                                <div className="flex gap-2">
                                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select an employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableEmployees.map((emp: any) => {
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
                                    <Button onClick={handleAddMember} disabled={!selectedEmployee || addingMember}>
                                        {addingMember && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Add
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Note: Team members are automatically added when you assign them to tasks
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Danger Zone */}
            {checkPermission('projects', 'delete') && (
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Delete this project</h4>
                                <p className="text-sm text-muted-foreground">
                                    Once you delete a project, there is no going back. Please be certain.
                                </p>
                            </div>
                            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Project
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. This will permanently delete the
                                            project <strong>{project?.name}</strong> and remove all associated tasks,
                                            activities, and data.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setDeleteDialogOpen(false)}
                                            disabled={isDeleting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDeleteProject}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? 'Deleting...' : 'Delete Project'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

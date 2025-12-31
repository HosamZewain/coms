
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Loader2, Plus, Users, ChevronDown, ChevronRight, UserPlus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../components/ui/collapsible"
import api from '../../lib/api';

export default function DepartmentsSettingsPage() {
    const [departments, setDepartments] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Dept Dialog State
    const [deptName, setDeptName] = useState('');
    const [deptManagerId, setDeptManagerId] = useState<string | undefined>(undefined);
    const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<any>(null);

    // Team Dialog State
    const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [teamLeaderId, setTeamLeaderId] = useState<string | undefined>(undefined);
    const [selectedDeptForTeam, setSelectedDeptForTeam] = useState<any>(null);
    const [expandedDepts, setExpandedDepts] = useState<string[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [deptRes, empRes] = await Promise.all([
                api.get('/company/departments'),
                api.get('/employees')
            ]);
            setDepartments(deptRes.data.data);
            setEmployees(empRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleDept = (id: string) => {
        setExpandedDepts(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
    };

    // Department Handlers
    const handleEditDept = (dept: any) => {
        setEditingDept(dept);
        setDeptName(dept.name);
        setDeptManagerId(dept.manager?.id || undefined);
        setIsDeptDialogOpen(true);
    };

    const handleCreateDept = () => {
        setEditingDept(null);
        setDeptName('');
        setDeptManagerId(undefined);
        setIsDeptDialogOpen(true);
    };

    const handleDeleteDept = async (id: string) => {
        if (!confirm('Are you sure? This will delete all teams under this department.')) return;
        setSaving(true);
        try {
            await api.delete(`/company/departments/${id}`);
            fetchData();
        } catch (error) {
            console.error('Failed to delete department:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDept = async () => {
        if (!deptName) return;
        setSaving(true);
        try {
            const payload = { name: deptName, managerId: deptManagerId === 'none' ? null : deptManagerId };
            if (editingDept) {
                await api.put(`/company/departments/${editingDept.id}`, payload);
            } else {
                await api.post('/company/departments', payload);
            }
            setIsDeptDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save department:', error);
        } finally {
            setSaving(false);
        }
    };

    // Team Handlers
    const handleAddTeam = (dept: any) => {
        setSelectedDeptForTeam(dept);
        setTeamName('');
        setTeamLeaderId(undefined);
        setIsTeamDialogOpen(true);
    };

    const handleDeleteTeam = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        // setSaving(true); // Optimistic or separate loading
        try {
            await api.delete(`/company/teams/${id}`);
            fetchData();
        } catch (error) {
            console.error('Failed to delete team:', error);
        }
    };

    const handleSaveTeam = async () => {
        if (!teamName || !selectedDeptForTeam) return;
        setSaving(true);
        try {
            const payload = {
                name: teamName,
                departmentId: selectedDeptForTeam.id,
                leaderId: teamLeaderId === 'none' ? null : teamLeaderId
            };
            await api.post('/company/teams', payload);
            setIsTeamDialogOpen(false);
            fetchData();
            if (!expandedDepts.includes(selectedDeptForTeam.id)) {
                toggleDept(selectedDeptForTeam.id);
            }
        } catch (error) {
            console.error('Failed to save team:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Departments & Teams</h2>
                    <p className="text-muted-foreground">Manage organization structure, departments, and teams.</p>
                </div>
                <Button onClick={handleCreateDept}><Plus className="mr-2 h-4 w-4" /> Add Department</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Organization Structure</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {departments.map((dept) => (
                            <Collapsible key={dept.id} open={expandedDepts.includes(dept.id)} onOpenChange={() => toggleDept(dept.id)} className="border rounded-md p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                                                {expandedDepts.includes(dept.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <div>
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                {dept.name}
                                                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                                    {dept.teams?.length || 0} teams
                                                </span>
                                            </h3>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                <Users className="h-3 w-3" />
                                                Manager: {dept.manager ? `${dept.manager.firstName} ${dept.manager.lastName}` : 'Not Assigned'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleAddTeam(dept)}> <UserPlus className="h-3 w-3 mr-1" /> Add Team</Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleEditDept(dept)}>Edit</Button>
                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteDept(dept.id)}>Delete</Button>
                                    </div>
                                </div>

                                <CollapsibleContent>
                                    <div className="mt-4 pl-10 space-y-2">
                                        {dept.teams && dept.teams.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="hover:bg-transparent">
                                                        <TableHead className="h-8">Team Name</TableHead>
                                                        <TableHead className="h-8">Team Leader</TableHead>
                                                        <TableHead className="h-8">Members</TableHead>
                                                        <TableHead className="h-8 text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {dept.teams.map((team: any) => (
                                                        <TableRow key={team.id}>
                                                            <TableCell className="py-2 font-medium">{team.name}</TableCell>
                                                            <TableCell className="py-2">{team.leader ? `${team.leader.firstName} ${team.leader.lastName}` : '-'}</TableCell>
                                                            <TableCell className="py-2">{team._count?.members || 0}</TableCell>
                                                            <TableCell className="py-2 text-right">
                                                                <Button variant="ghost" size="sm" className="h-6 text-red-600" onClick={() => handleDeleteTeam(team.id)}>Delete</Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-sm text-muted-foreground italic py-2">No teams in this department yet.</div>
                                        )}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Department Dialog */}
            <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingDept ? 'Edit Department' : 'Add Department'}</DialogTitle>
                        <DialogDescription>Define the department name and manager.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="deptName">Department Name</Label>
                            <Input id="deptName" value={deptName} onChange={(e) => setDeptName(e.target.value)} placeholder="e.g. Engineering" />
                        </div>
                        <div className="space-y-2">
                            <Label>Department Manager</Label>
                            <Select value={deptManagerId} onValueChange={setDeptManagerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Manager" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Manager</SelectItem>
                                    {employees.map(emp => (
                                        <SelectItem key={emp.id} value={emp.userId}>{emp.firstName} {emp.lastName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeptDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveDept} disabled={saving || !deptName}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Team Dialog */}
            <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Team to {selectedDeptForTeam?.name}</DialogTitle>
                        <DialogDescription>Create a new team and assign a leader.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="teamName">Team Name</Label>
                            <Input id="teamName" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. Frontend Team" />
                        </div>
                        <div className="space-y-2">
                            <Label>Team Leader</Label>
                            <Select value={teamLeaderId} onValueChange={setTeamLeaderId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Leader" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Leader</SelectItem>
                                    {employees.map(emp => (
                                        <SelectItem key={emp.id} value={emp.userId}>{emp.firstName} {emp.lastName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTeamDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveTeam} disabled={saving || !teamName}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Team
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

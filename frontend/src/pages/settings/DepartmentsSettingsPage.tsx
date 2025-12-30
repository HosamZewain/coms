
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Loader2 } from 'lucide-react';
import api from '../../lib/api';

export default function DepartmentsSettingsPage() {
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Dialog State
    const [deptName, setDeptName] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<any>(null);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/company/departments');
            setDepartments(res.data.data);
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleEditDept = (dept: any) => {
        setEditingDept(dept);
        setDeptName(dept.name);
        setIsDialogOpen(true);
    };

    const handleCreateDept = () => {
        setEditingDept(null);
        setDeptName('');
        setIsDialogOpen(true);
    };

    const handleDeleteDept = async (id: string) => {
        if (!confirm('Are you sure? This might affect employees assigned to this department.')) return;
        setSaving(true);
        try {
            await api.delete(`/company/departments/${id}`);
            fetchDepartments();
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
            if (editingDept) {
                await api.put(`/company/departments/${editingDept.id}`, { name: deptName });
            } else {
                await api.post('/company/departments', { name: deptName });
            }
            setIsDialogOpen(false);
            fetchDepartments();
        } catch (error) {
            console.error('Failed to save department:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
                <p className="text-muted-foreground">Manage company departments and organizational structure.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Departments List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {departments.map((dept) => (
                                <TableRow key={dept.id}>
                                    <TableCell className="font-medium">{dept.name}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEditDept(dept)}>Edit</Button>
                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteDept(dept.id)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4">
                        <Button onClick={handleCreateDept}>Add Department</Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingDept ? 'Edit Department' : 'Add Department'}</DialogTitle>
                        <DialogDescription>Enter the department details directly.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="deptName">Department Name</Label>
                            <Input
                                id="deptName"
                                value={deptName}
                                onChange={(e) => setDeptName(e.target.value)}
                                placeholder="e.g. Marketing"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveDept} disabled={saving || !deptName}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingDept ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

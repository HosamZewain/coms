
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Loader2 } from 'lucide-react';
import api from '../../lib/api';

const modules = [
    { id: 'employees', name: 'Employees' },
    { id: 'attendance', name: 'Attendance' },
    { id: 'projects', name: 'Projects' },
    { id: 'recruitment', name: 'Recruitment' },
    { id: 'reports', name: 'Reports' },
    { id: 'settings', name: 'Settings' },
];

const actions = [
    { id: 'view', name: 'View' },
    { id: 'add', name: 'Add' },
    { id: 'edit', name: 'Edit' },
    { id: 'delete', name: 'Delete' },
];

export default function RolesSettingsPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Role Dialog State
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [roleName, setRoleName] = useState('');
    const [rolePermissions, setRolePermissions] = useState<string[]>([]);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await api.get('/roles');
            setRoles(res.data.data);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleEditRole = (role: any) => {
        setEditingRole(role);
        setRoleName(role.name);
        setRolePermissions(role.permissions || []);
        setIsRoleDialogOpen(true);
    };

    const handleCreateRole = () => {
        setEditingRole(null);
        setRoleName('');
        setRolePermissions([]);
        setIsRoleDialogOpen(true);
    };

    const togglePermission = (moduleId: string, actionId: string) => {
        const perm = `${moduleId}:${actionId}`;
        setRolePermissions(prev =>
            prev.includes(perm)
                ? prev.filter(p => p !== perm)
                : [...prev, perm]
        );
    };

    const isAllModuleActionSelected = (moduleId: string, actionId: string) => {
        return rolePermissions.includes('*:*') || rolePermissions.includes(`${moduleId}:${actionId}`);
    };

    const handleSaveRole = async () => {
        if (!roleName) return;
        setSaving(true);
        try {
            if (editingRole) {
                await api.put(`/roles/${editingRole.id}`, { name: roleName, permissions: rolePermissions });
            } else {
                await api.post('/roles', { name: roleName, permissions: rolePermissions });
            }
            setIsRoleDialogOpen(false);
            fetchRoles();
        } catch (error) {
            console.error('Failed to save role:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Roles & Permissions</h2>
                <p className="text-muted-foreground">Configure access levels for different user roles.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Defined Roles</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role Name</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Users Assigned</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">{role.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions.includes('*:*') ? (
                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">Full Access</span>
                                            ) : (
                                                <>
                                                    {role.permissions.slice(0, 3).map((p: string) => (
                                                        <span key={p} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{p}</span>
                                                    ))}
                                                    {role.permissions.length > 3 && <span>...</span>}
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{role._count?.users || 0}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)}>Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4">
                        <Button onClick={handleCreateRole}>Create New Role</Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
                        <DialogDescription>
                            Define the role name and configure its granular module permissions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="roleName">Role Name</Label>
                            <Input
                                id="roleName"
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                placeholder="e.g. Senior Manager"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Permissions Matrix</Label>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="full-access"
                                        checked={rolePermissions.includes('*:*')}
                                        onCheckedChange={(checked) => setRolePermissions(checked ? ['*:*'] : [])}
                                    />
                                    <Label htmlFor="full-access" className="text-sm font-medium text-blue-600">Full System Access (*:*)</Label>
                                </div>
                            </div>

                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[200px]">Module</TableHead>
                                            {actions.map(action => (
                                                <TableHead key={action.id} className="text-center">{action.name}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {modules.map(module => (
                                            <TableRow key={module.id}>
                                                <TableCell className="font-medium">{module.name}</TableCell>
                                                {actions.map(action => (
                                                    <TableCell key={action.id} className="text-center">
                                                        <Switch
                                                            disabled={rolePermissions.includes('*:*')}
                                                            checked={isAllModuleActionSelected(module.id, action.id)}
                                                            onCheckedChange={() => togglePermission(module.id, action.id)}
                                                        />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" disabled={saving} onClick={() => setIsRoleDialogOpen(false)}>Cancel</Button>
                        <Button disabled={saving || !roleName} onClick={handleSaveRole}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingRole ? 'Update Role' : 'Create Role'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

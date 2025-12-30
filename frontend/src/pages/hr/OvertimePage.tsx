import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Plus, Check, X, Loader2 } from 'lucide-react';

export default function OvertimePage() {
    const { user } = useAuthStore();
    const [myRequests, setMyRequests] = useState<any[]>([]);
    const [allRequests, setAllRequests] = useState<any[]>([]);
    // const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        date: '',
        hours: '',
        reason: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const isManager = ['Admin', 'HR', 'Manager', 'Director'].includes(user?.role?.name || '');

    const fetchMyRequests = async () => {
        try {
            const res = await api.get('/hr/overtime/me');
            setMyRequests(res.data.data);
        } catch (error) {
            console.error('Failed to fetch my overtime:', error);
        }
    };

    const fetchAllRequests = async () => {
        if (!isManager) return;
        try {
            const res = await api.get('/hr/overtime/all');
            setAllRequests(res.data.data);
        } catch (error) {
            console.error('Failed to fetch all overtime:', error);
        }
    };

    useEffect(() => {
        // setLoading(true);
        Promise.all([fetchMyRequests(), fetchAllRequests()]); // .finally(() => setLoading(false));
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/hr/overtime', formData);
            setModalOpen(false);
            setFormData({ date: '', hours: '', reason: '' });
            fetchMyRequests();
        } catch (error) {
            console.error('Failed to submit overtime:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await api.patch(`/hr/overtime/${id}`, { status });
            fetchAllRequests();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'default'; // default is primary (black/dark) often, maybe success is better if available
            case 'REJECTED': return 'destructive';
            default: return 'secondary'; // Valid badge variants: default, secondary, destructive, outline
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Overtime Management</h2>
                    <p className="text-muted-foreground">Manage overtime requests and approvals.</p>
                </div>
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Request Overtime
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Overtime Request</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hours">Hours</Label>
                                <Input
                                    id="hours"
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    required
                                    value={formData.hours}
                                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason</Label>
                                <Textarea
                                    id="reason"
                                    required
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={submitting}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Request
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="my-requests" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="my-requests">My Requests</TabsTrigger>
                    {isManager && <TabsTrigger value="manage">Manage Requests</TabsTrigger>}
                </TabsList>

                <TabsContent value="my-requests">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Overtime History</CardTitle>
                            <CardDescription>List of all your submitted overtime requests.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Hours</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myRequests.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No requests found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        myRequests.map((req) => (
                                            <TableRow key={req.id}>
                                                <TableCell>{new Date(req.date).toLocaleDateString()}</TableCell>
                                                <TableCell>{req.hours}</TableCell>
                                                <TableCell>{req.reason}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusColor(req.status) as any}>
                                                        {req.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {isManager && (
                    <TabsContent value="manage">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending Requests</CardTitle>
                                <CardDescription>Approve or reject team overtime requests.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Hours</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allRequests.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                    No pending requests found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            allRequests.map((req) => (
                                                <TableRow key={req.id}>
                                                    <TableCell className="font-medium">
                                                        {req.user?.firstName} {req.user?.lastName}
                                                    </TableCell>
                                                    <TableCell>{new Date(req.date).toLocaleDateString()}</TableCell>
                                                    <TableCell>{req.hours}</TableCell>
                                                    <TableCell>{req.reason}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStatusColor(req.status) as any}>
                                                            {req.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {req.status === 'PENDING' && (
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                                                    onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                                    onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

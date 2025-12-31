import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Check, X, Loader2, Calendar, Info, Eye, Trash2 } from 'lucide-react';

// ... existing imports ...

// Removed misplaced functions
import api from '../../lib/api';
import { getProfileImageUrl } from '../../lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { format, isSameMonth, parseISO } from 'date-fns';

export default function ApprovalsPage() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [overtime, setOvertime] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>("all"); // Default to All Time
    const [selectedLeave, setSelectedLeave] = useState<any | null>(null);
    const [selectedOvertime, setSelectedOvertime] = useState<any | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [leavesRes, overtimeRes] = await Promise.all([
                api.get('/leaves'),
                api.get('/overtime')
            ]);
            setLeaves(leavesRes.data.data);
            setOvertime(overtimeRes.data.data);
        } catch (error) {
            console.error('Failed to fetch approvals:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filterByMonth = (items: any[], dateField: string) => {
        if (selectedMonth === 'all') return items;
        return items.filter(item => item[dateField].startsWith(selectedMonth));
    };

    const handleLeaveAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setActionLoading(id);
        try {
            await api.patch(`/leaves/${id}/status`, { status });
            // Refresh data to show updated status and approver
            fetchData();
        } catch (error) {
            console.error('Failed to update leave:', error);
            alert('Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this request?')) return;
        setActionLoading(id);
        try {
            await api.delete(`/leaves/${id}`);
            fetchData();
        } catch (error) {
            console.error('Failed to delete leave:', error);
            alert('Failed to delete request');
        } finally {
            setActionLoading(null);
        }
    };

    const handleOvertimeAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setActionLoading(id);
        try {
            await api.patch(`/overtime/${id}/status`, { status });
            fetchData();
        } catch (error) {
            console.error('Failed to update overtime:', error);
            alert('Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Approved</Badge>;
            case 'REJECTED': return <Badge variant="destructive">Rejected</Badge>;
            default: return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Pending</Badge>;
        }
    };

    // Generate last 12 months for filter + Next Year for future requests
    const months = Array.from({ length: 13 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i + 1); // shift to include next month
        return {
            value: d.toISOString().slice(0, 7),
            label: format(d, 'MMMM yyyy')
        };
    });

    const filteredLeaves = filterByMonth(leaves, 'startDate');
    const filteredOvertime = filterByMonth(overtime, 'date');

    const renderApprover = (approver: any, updatedAt: string) => {
        if (!approver) return null;
        return (
            <div className="flex items-center gap-2 mt-2 p-2 bg-muted/50 rounded-md text-sm">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={getProfileImageUrl(approver.employeeProfile?.profileImage)} />
                    <AvatarFallback>{approver.firstName[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <span className="font-medium text-xs">Approved by {approver.firstName} {approver.lastName}</span>
                    <div className="text-[10px] text-muted-foreground">{format(new Date(updatedAt), 'MMM dd, HH:mm')}</div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
                    <p className="text-muted-foreground mt-2">Manage pending requests and view history.</p>
                </div>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        {months.map(m => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Tabs defaultValue="leaves" className="w-full">
                <TabsList>
                    <TabsTrigger value="leaves">Leaves</TabsTrigger>
                    <TabsTrigger value="overtime">Overtime</TabsTrigger>
                </TabsList>

                <TabsContent value="leaves" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Leave Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLeaves.map((leave) => (
                                        <TableRow key={leave.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedLeave(leave)}>
                                            <TableCell className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={getProfileImageUrl(leave.user.employeeProfile?.profileImage)} />
                                                    <AvatarFallback>{leave.user.firstName[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{leave.user.firstName} {leave.user.lastName}</div>
                                                    <div className="text-xs text-muted-foreground">{format(new Date(leave.createdAt), 'MMM dd')}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{leave.leaveType.name}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd')}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(leave.status)}</TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                {leave.status === 'PENDING' && (
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50" onClick={() => handleDelete(leave.id)} disabled={!!actionLoading} title="Delete">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-50" onClick={() => handleLeaveAction(leave.id, 'REJECTED')} disabled={!!actionLoading} title="Reject">
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600 hover:bg-green-50" onClick={() => handleLeaveAction(leave.id, 'APPROVED')} disabled={!!actionLoading} title="Approve">
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                                {leave.status === 'APPROVED' && leave.approver && (
                                                    <span className="text-xs text-muted-foreground">by {leave.approver.firstName}</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredLeaves.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8">No requests found for this month.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="overtime" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overtime Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Hours</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOvertime.map((req) => (
                                        <TableRow key={req.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedOvertime(req)}>
                                            <TableCell className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={getProfileImageUrl(req.user.employeeProfile?.profileImage)} />
                                                    <AvatarFallback>{req.user.firstName[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{req.user.firstName} {req.user.lastName}</div>
                                                    <div className="text-xs text-muted-foreground">{format(new Date(req.createdAt), 'MMM dd')}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{format(new Date(req.date), 'MMM dd, yyyy')}</TableCell>
                                            <TableCell><Badge variant="outline">{req.hours}h</Badge></TableCell>
                                            <TableCell>{getStatusBadge(req.status)}</TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                {req.status === 'PENDING' && (
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50" onClick={() => handleOvertimeAction(req.id, 'REJECTED')} disabled={!!actionLoading}><X className="h-4 w-4" /></Button>
                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600 hover:bg-green-50" onClick={() => handleOvertimeAction(req.id, 'APPROVED')} disabled={!!actionLoading}><Check className="h-4 w-4" /></Button>
                                                    </div>
                                                )}
                                                {req.status === 'APPROVED' && req.approver && (
                                                    <span className="text-xs text-muted-foreground">by {req.approver.firstName}</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredOvertime.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8">No requests found for this month.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Leave Details Modal */}
            <Dialog open={!!selectedLeave} onOpenChange={() => setSelectedLeave(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Leave Request Details</DialogTitle>
                        <DialogDescription>Submitted on {selectedLeave && format(new Date(selectedLeave.createdAt), 'PPP')}</DialogDescription>
                    </DialogHeader>
                    {selectedLeave && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={getProfileImageUrl(selectedLeave.user.employeeProfile?.profileImage)} />
                                    <AvatarFallback>{selectedLeave.user.firstName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-lg">{selectedLeave.user.firstName} {selectedLeave.user.lastName}</p>
                                    <p className="text-sm text-muted-foreground">{selectedLeave.user.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase">Type</p>
                                    <p className="font-medium">{selectedLeave.leaveType.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase">Total Days</p>
                                    <p className="font-medium">{Math.ceil((new Date(selectedLeave.endDate).getTime() - new Date(selectedLeave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} Days</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-muted-foreground font-medium uppercase">Duration</p>
                                    <p className="font-medium">{format(new Date(selectedLeave.startDate), 'PPP')} — {format(new Date(selectedLeave.endDate), 'PPP')}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-muted-foreground font-medium uppercase">Reason</p>
                                    <p className="text-sm border p-2 rounded-md bg-muted/20 min-h-[60px]">{selectedLeave.reason || 'No reason provided.'}</p>
                                </div>
                            </div>

                            {selectedLeave.status !== 'PENDING' && (
                                <div className="border-t pt-4 mt-4">
                                    <p className="text-xs text-muted-foreground font-medium uppercase mb-2">Approval History</p>
                                    <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            {selectedLeave.status === 'APPROVED' ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
                                            <span className="font-medium capitalize">{selectedLeave.status.toLowerCase()}</span>
                                        </div>
                                        {selectedLeave.approver ? (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-muted-foreground">by</span>
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={getProfileImageUrl(selectedLeave.approver.employeeProfile?.profileImage)} />
                                                    <AvatarFallback>{selectedLeave.approver.firstName[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{selectedLeave.approver.firstName} {selectedLeave.approver.lastName}</span>
                                            </div>
                                        ) : <span className="text-xs text-muted-foreground">Manual Update</span>}
                                    </div>
                                    <p className="text-xs text-muted-foreground text-right mt-1">{format(new Date(selectedLeave.updatedAt), 'PP p')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Overtime Details Modal */}
            <Dialog open={!!selectedOvertime} onOpenChange={() => setSelectedOvertime(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Overtime Request Details</DialogTitle>
                        <DialogDescription>Submitted on {selectedOvertime && format(new Date(selectedOvertime.createdAt), 'PPP')}</DialogDescription>
                    </DialogHeader>
                    {selectedOvertime && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={getProfileImageUrl(selectedOvertime.user.employeeProfile?.profileImage)} />
                                    <AvatarFallback>{selectedOvertime.user.firstName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-lg">{selectedOvertime.user.firstName} {selectedOvertime.user.lastName}</p>
                                    <p className="text-sm text-muted-foreground">{selectedOvertime.user.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase">Date</p>
                                    <p className="font-medium">{format(new Date(selectedOvertime.date), 'PPP')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase">Hours</p>
                                    <p className="font-medium">{selectedOvertime.hours} Hours</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-muted-foreground font-medium uppercase">Reason</p>
                                    <p className="text-sm border p-2 rounded-md bg-muted/20 min-h-[60px]">{selectedOvertime.reason || 'No reason provided.'}</p>
                                </div>
                            </div>

                            {selectedOvertime.status !== 'PENDING' && (
                                <div className="border-t pt-4 mt-4">
                                    <p className="text-xs text-muted-foreground font-medium uppercase mb-2">Approval History</p>
                                    <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            {selectedOvertime.status === 'APPROVED' ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
                                            <span className="font-medium capitalize">{selectedOvertime.status.toLowerCase()}</span>
                                        </div>
                                        {selectedOvertime.approver ? (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-muted-foreground">by</span>
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={getProfileImageUrl(selectedOvertime.approver.employeeProfile?.profileImage)} />
                                                    <AvatarFallback>{selectedOvertime.approver.firstName[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{selectedOvertime.approver.firstName} {selectedOvertime.approver.lastName}</span>
                                            </div>
                                        ) : <span className="text-xs text-muted-foreground">Manual Update</span>}
                                    </div>
                                    <p className="text-xs text-muted-foreground text-right mt-1">{format(new Date(selectedOvertime.updatedAt), 'PP p')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

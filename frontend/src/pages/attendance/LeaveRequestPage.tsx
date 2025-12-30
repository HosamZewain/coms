import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Loader2 } from 'lucide-react';
import api from '../../lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";

export default function LeaveRequestPage() {
    // const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [leaveHistory, setLeaveHistory] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const fetchData = async () => {
        try {
            const [typesRes, historyRes] = await Promise.all([
                api.get('/leaves/types'),
                api.get('/leaves/my')
            ]);
            setLeaveTypes(typesRes.data.data);
            setLeaveHistory(historyRes.data.data);
        } catch (error) {
            console.error('Failed to fetch leave data', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/leaves', formData);
            // Reset form and refresh list
            setFormData({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
            await fetchData();
            alert('Leave request submitted successfully');
        } catch (error: any) {
            console.error('Failed to submit leave', error);
            alert(error.response?.data?.message || 'Failed to submit request');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Request Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Request Leave</CardTitle>
                        <CardDescription>Submit a new leave request for approval.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Leave Type</Label>
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.leaveTypeId}
                                    onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Leave Type</option>
                                    {leaveTypes.map((type) => (
                                        <option key={type.id} value={type.id}>{type.name} ({type.defaultDays} days)</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start">Start Date</Label>
                                    <Input
                                        type="date"
                                        id="start"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end">End Date</Label>
                                    <Input
                                        type="date"
                                        id="end"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason (Optional)</Label>
                                <Input
                                    placeholder="Urgent family matter..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Request
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Balance Cards (Mock for now, could link to real balances later) */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Leave Balances (Estimated)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {leaveTypes.map(type => (
                                <div key={type.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">{type.name}</span>
                                    <span className="text-green-600 font-bold">{type.defaultDays} Days</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* History Table */}
            <Card>
                <CardHeader>
                    <CardTitle>My Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaveHistory.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">No leave requests found.</TableCell>
                                </TableRow>
                            )}
                            {leaveHistory.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.leaveType?.name || 'Unknown'}</TableCell>
                                    <TableCell>{new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            ${req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                req.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {req.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

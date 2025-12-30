import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { MapPin, Clock, CalendarDays } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import AttendancePunchModal from '../../components/attendance/AttendancePunchModal';
import { useAttendanceStore } from '../../store/attendance.store';

export default function AttendancePage() {
    const { isCheckedIn, refresh } = useAttendanceStore();
    // const [isLoading, setIsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [history, setHistory] = useState<any[]>([]);
    const checkPermission = useAuthStore(state => state.checkPermission);
    // const { user } = useAuthStore();

    const [stats, setStats] = useState({ presentDays: 0, absences: 0, lateArrivals: 0, leaves: 0 });

    const fetchHistory = async () => {
        try {
            const [historyRes, statsRes] = await Promise.all([
                api.get('/attendance/me'),
                api.get('/attendance/stats')
            ]);
            setHistory(historyRes.data.data);
            setStats(statsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch attendance data', error);
        }
    };

    useEffect(() => {
        // Also ensure store is up to date on mount
        refresh();
    }, []);

    useEffect(() => {
        // Re-fetch local history whenever the global check-in status changes
        // This ensures compatibility with the Header punch button
        fetchHistory();
    }, [isCheckedIn]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const [showPunchModal, setShowPunchModal] = useState(false);
    const [punchType, setPunchType] = useState<'in' | 'out'>('in');

    const handlePunchClick = () => {
        setPunchType(isCheckedIn ? 'out' : 'in');
        setShowPunchModal(true);
    };

    const handlePunchSuccess = async () => {
        await Promise.all([
            refresh(), // Update global store (header)
            fetchHistory() // Update local history table
        ]);
        // No reload needed now as we manually updated everything
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Time & Attendance</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Punch Widget */}
                <Card className="border-l-4 border-l-primary">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl">Daily Check-in</CardTitle>
                                <CardDescription>Record your daily attendance</CardDescription>
                            </div>
                            {checkPermission('attendance', 'edit') && (
                                <Button variant="outline" size="sm" onClick={() => window.location.href = '/attendance/leave'}>
                                    Request Leave
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-6 space-y-6">
                        <div className="text-4xl font-mono font-bold tracking-wider">
                            {currentTime}
                        </div>
                        <div className="flex items-center text-muted-foreground text-sm gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>Cairo Office (GPS Verified)</span>
                        </div>
                        {checkPermission('attendance', 'edit') && (
                            <Button
                                className={`w-48 h-12 text-lg ${isCheckedIn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                                onClick={handlePunchClick}
                                disabled={false}
                            >
                                <Clock className="mr-2 h-5 w-5" />
                                {isCheckedIn ? 'Punch Out' : 'Punch In'}
                            </Button>
                        )}
                        <p className="text-sm text-gray-500">
                            {isCheckedIn ? 'You are currently checked in' : 'You have not checked in yet today'}
                        </p>
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Monthly Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                            <div className="text-sm font-medium text-green-600">Present Days</div>
                            <div className="text-2xl font-bold">{stats.presentDays}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                            <div className="text-sm font-medium text-red-600">Absences</div>
                            <div className="text-2xl font-bold">{stats.absences}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                            <div className="text-sm font-medium text-blue-600">Late Arrivals</div>
                            <div className="text-2xl font-bold">{stats.lateArrivals}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                            <div className="text-sm font-medium text-orange-600">Leaves Taken</div>
                            <div className="text-2xl font-bold">{stats.leaves}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <CalendarDays className="mr-2 h-5 w-5" />
                        Attendance History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Check In</TableHead>
                                <TableHead>Check Out</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="text-right">Total Hours</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-green-600 font-medium">{new Date(record.checkInTime).toLocaleTimeString()}</TableCell>
                                    <TableCell className="text-red-600 font-medium">{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'}</TableCell>
                                    <TableCell>{record.checkInLocation}</TableCell>
                                    <TableCell className="text-right font-mono">
                                        {record.checkOutTime
                                            ? ((new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime()) / (1000 * 60 * 60)).toFixed(2) + ' hrs'
                                            : 'On-going'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AttendancePunchModal
                isOpen={showPunchModal}
                onClose={() => setShowPunchModal(false)}
                onSuccess={handlePunchSuccess}
                type={punchType}
            />
        </div >
    );
}

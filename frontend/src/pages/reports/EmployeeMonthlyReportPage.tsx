import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { CalendarIcon, Loader2, ExternalLink, User, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getMonth, getYear, setMonth, setYear } from 'date-fns';

interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle?: string;
}

interface AttendanceRecord {
    id: string;
    checkInTime: string;
    checkOutTime?: string;
    checkInLocation?: string;
    checkOutLocation?: string;
    checkInTask?: string;
    checkInNotes?: string;
}

interface DailyReport {
    date: Date;
    status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE' | 'WEEKEND' | 'HOLIDAY';
    records: AttendanceRecord[];
    totalDuration?: number;
    leaveDetails?: any;
}

export default function EmployeeMonthlyReportPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<number>(getMonth(new Date()));
    const [selectedYear, setSelectedYear] = useState<number>(getYear(new Date()));
    const [report, setReport] = useState<DailyReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [selectedLeave, setSelectedLeave] = useState<any | null>(null);

    // Fetch employees list on mount
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await api.get('/employees');
                setEmployees(response.data.data || response.data);
            } catch (error) {
                console.error('Failed to fetch employees:', error);
            } finally {
                setLoadingEmployees(false);
            }
        };
        fetchEmployees();
    }, []);

    // Fetch report when employee or month changes
    useEffect(() => {
        if (selectedEmployee) {
            fetchMonthlyReport();
        }
    }, [selectedEmployee, selectedMonth, selectedYear]);

    const fetchMonthlyReport = async () => {
        if (!selectedEmployee) return;

        setLoading(true);
        try {
            const monthStart = startOfMonth(setYear(setMonth(new Date(), selectedMonth), selectedYear));
            const monthEnd = endOfMonth(monthStart);

            const response = await api.get(`/attendance/employee-monthly-report`, {
                params: {
                    employeeId: selectedEmployee,
                    startDate: monthStart.toISOString(),
                    endDate: monthEnd.toISOString()
                }
            });

            // Process the response into daily reports
            const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
            const attendanceData = response.data.data || [];

            const dailyReports: DailyReport[] = daysInMonth.map(date => {
                const dayData = attendanceData.find((d: any) =>
                    isSameDay(new Date(d.date), date)
                );

                if (dayData) {
                    return {
                        date,
                        status: dayData.status,
                        records: dayData.records || [],
                        totalDuration: dayData.totalDuration,
                        leaveDetails: dayData.leaveDetails
                    };
                }

                // Default for days without data
                const dayOfWeek = date.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                return {
                    date,
                    status: isWeekend ? 'WEEKEND' : 'ABSENT',
                    records: [],
                    totalDuration: 0
                };
            });

            setReport(dailyReports);
        } catch (error) {
            console.error('Failed to fetch monthly report:', error);
            setReport([]);
        } finally {
            setLoading(false);
        }
    };

    const getSelectedEmployee = () => {
        return employees.find(e => e.id === selectedEmployee);
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 5 }, (_, i) => getYear(new Date()) - 2 + i);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PRESENT':
                return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Present</Badge>;
            case 'ABSENT':
                return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Absent</Badge>;
            case 'ON_LEAVE':
                return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">On Leave</Badge>;
            case 'WEEKEND':
                return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Weekend</Badge>;
            case 'HOLIDAY':
                return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Holiday</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Calculate summary stats
    const getSummaryStats = () => {
        const present = report.filter(r => r.status === 'PRESENT').length;
        const absent = report.filter(r => r.status === 'ABSENT').length;
        const onLeave = report.filter(r => r.status === 'ON_LEAVE').length;
        const weekends = report.filter(r => r.status === 'WEEKEND').length;
        const totalHours = report.reduce((acc, r) => acc + (r.totalDuration || 0), 0) / (1000 * 60 * 60);

        return { present, absent, onLeave, weekends, totalHours: totalHours.toFixed(1) };
    };

    const stats = getSummaryStats();
    const employee = getSelectedEmployee();

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <h2 className="text-3xl font-bold tracking-tight text-white">Employee Monthly Report</h2>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Employee Selector */}
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                        <SelectTrigger className="w-[250px] bg-white/5 border-white/10 text-white">
                            <User className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="Select Employee" />
                        </SelectTrigger>
                        <SelectContent>
                            {loadingEmployees ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            ) : (
                                employees.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.firstName} {emp.lastName}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>

                    {/* Month Selector */}
                    <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                        <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
                            <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month, index) => (
                                <SelectItem key={index} value={String(index)}>{month}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Year Selector */}
                    <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                        <SelectTrigger className="w-[100px] bg-white/5 border-white/10 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Summary Stats */}
            {selectedEmployee && !loading && report.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="bg-emerald-500/10 border-emerald-500/20">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-emerald-400">{stats.present}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Days Present</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-500/10 border-red-500/20">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-red-400">{stats.absent}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Days Absent</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-500/20">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-blue-400">{stats.onLeave}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Days on Leave</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-500/10 border-slate-500/20">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-slate-400">{stats.weekends}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Weekends</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-indigo-500/10 border-indigo-500/20">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-indigo-400">{stats.totalHours}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Total Hours</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Employee Info Card */}
            {employee && (
                <Card>
                    <CardHeader className="border-b border-white/10">
                        <CardTitle className="flex items-center gap-3 text-white">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {employee.firstName[0]}{employee.lastName[0]}
                            </div>
                            <div>
                                <div>{employee.firstName} {employee.lastName}</div>
                                <div className="text-sm font-normal text-slate-400">{employee.jobTitle || 'Employee'} • {employee.email}</div>
                            </div>
                        </CardTitle>
                    </CardHeader>
                </Card>
            )}

            {/* Daily Attendance Table */}
            <Card>
                <CardHeader className="border-b border-white/10">
                    <CardTitle className="text-white">
                        {months[selectedMonth]} {selectedYear} - Daily Attendance
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {!selectedEmployee ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <User className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-lg">Select an employee to view their monthly report</p>
                        </div>
                    ) : loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-white/5">
                                    <TableHead className="text-slate-400">Date</TableHead>
                                    <TableHead className="text-slate-400">Day</TableHead>
                                    <TableHead className="text-slate-400">Status</TableHead>
                                    <TableHead className="text-slate-400">Check In / Out</TableHead>
                                    <TableHead className="text-slate-400">Duration</TableHead>
                                    <TableHead className="text-slate-400">Tasks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report.map((day) => (
                                    <TableRow key={day.date.toISOString()} className="border-white/10 hover:bg-white/5">
                                        <TableCell className="text-white font-medium">
                                            {format(day.date, 'MMM d')}
                                        </TableCell>
                                        <TableCell className="text-slate-400">
                                            {format(day.date, 'EEEE')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(day.status)}
                                                {day.status === 'ON_LEAVE' && day.leaveDetails && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 hover:bg-white/10"
                                                        onClick={() => setSelectedLeave(day.leaveDetails)}
                                                    >
                                                        <ExternalLink className="h-3 w-3 text-slate-400" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            {day.records && day.records.length > 0 ? (
                                                <div className="space-y-1">
                                                    {day.records.map((record, idx) => (
                                                        <div key={record.id} className="text-xs">
                                                            <Badge variant="outline" className={`h-5 text-[10px] px-1 mr-1 ${record.checkInLocation === 'HOME'
                                                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                                    : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                                                }`}>
                                                                {record.checkInLocation || 'OFFICE'}
                                                            </Badge>
                                                            {new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            {' - '}
                                                            {record.checkOutTime
                                                                ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                : 'Active'}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-slate-500">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {day.totalDuration ? (
                                                <Badge className={`${(day.totalDuration / (1000 * 60 * 60)) < 8
                                                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                    }`}>
                                                    {(day.totalDuration / (1000 * 60 * 60)).toFixed(2)} hrs
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-500">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-slate-300 max-w-[200px]">
                                            {day.records && day.records.length > 0 ? (
                                                <div className="space-y-1">
                                                    {day.records.map((record) => (
                                                        <div key={record.id} className="text-xs truncate">
                                                            {record.checkInTask || <span className="text-slate-500 italic">No task</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-slate-500">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Leave Details Dialog */}
            <Dialog open={!!selectedLeave} onOpenChange={(open) => !open && setSelectedLeave(null)}>
                <DialogContent className="bg-slate-900 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white">Leave Details</DialogTitle>
                        <div className="text-slate-400 text-sm">Information about the approved leave.</div>
                    </DialogHeader>
                    {selectedLeave && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-slate-400 uppercase font-semibold">Type</span>
                                    <div className="font-medium text-white">{selectedLeave.leaveType?.name || 'Leave'}</div>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 uppercase font-semibold">Status</span>
                                    <div><Badge className="bg-emerald-500/20 text-emerald-400">{selectedLeave.status}</Badge></div>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 uppercase font-semibold">Start Date</span>
                                    <div className="font-medium text-white">{format(new Date(selectedLeave.startDate), 'PPP')}</div>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 uppercase font-semibold">End Date</span>
                                    <div className="font-medium text-white">{format(new Date(selectedLeave.endDate), 'PPP')}</div>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 uppercase font-semibold">Reason</span>
                                <div className="mt-1 p-3 bg-white/5 rounded-md text-sm italic text-slate-300">
                                    "{selectedLeave.reason || 'No reason provided'}"
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setSelectedLeave(null)} className="bg-blue-600 hover:bg-blue-700">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

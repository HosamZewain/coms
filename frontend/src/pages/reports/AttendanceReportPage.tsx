import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Button } from '../../components/ui/button';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AttendanceReportPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [report, setReport] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (date) {
            fetchReport(date);
        }
    }, [date]);

    const fetchReport = async (selectedDate: Date) => {
        setLoading(true);
        try {
            // Using query param for date
            const response = await api.get(`/attendance/report?date=${selectedDate.toISOString()}`);
            setReport(response.data.data);
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Attendance Report</h2>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daily Detailed Report</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Check In / Out History</TableHead>
                                    <TableHead>Total Duration</TableHead>
                                    <TableHead>Location</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report.map((item) => (
                                    <TableRow key={item.userId}>
                                        <TableCell>
                                            <div className="font-medium">{item.firstName} {item.lastName}</div>
                                            <div className="text-xs text-muted-foreground">{item.jobTitle || 'Employee'}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                item.status === 'PRESENT' ? 'default' :
                                                    item.status === 'ABSENT' ? 'destructive' :
                                                        item.status === 'ON_LEAVE' ? 'secondary' : 'outline'
                                            }>
                                                {item.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {item.records && item.records.length > 0 ? (
                                                <div className="space-y-1">
                                                    {item.records.map((record: any, idx: number) => (
                                                        <div key={record.id} className="text-xs border-b last:border-0 pb-1 last:pb-0">
                                                            <span className="font-semibold">Session {idx + 1}:</span> {new Date(record.checkInTime).toLocaleTimeString()} -
                                                            {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : ' Active'}
                                                            {record.checkInTask && <div className="text-gray-500 pl-2">Task: {record.checkInTask}</div>}
                                                            {record.checkInNotes && <div className="text-gray-400 pl-2 text-[10px] italic">"{record.checkInNotes}"</div>}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {item.totalDuration ? (
                                                <span>{(item.totalDuration / (1000 * 60 * 60)).toFixed(2)} hrs</span>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {item.records?.map((r: any) => r.checkInLocation).filter((v: any, i: any, a: any) => a.indexOf(v) === i).join(', ') || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {report.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No records found for this date.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

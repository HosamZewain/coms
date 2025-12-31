import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { CalendarIcon, Loader2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function AttendanceReportPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [report, setReport] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<any | null>(null);

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
                                    <TableHead>Tasks & Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report.map((item) => (
                                    <TableRow key={item.userId}>
                                        <TableCell className="align-top py-4">
                                            <div className="font-medium">{item.firstName} {item.lastName}</div>
                                            <div className="text-xs text-muted-foreground">{item.jobTitle || 'Employee'}</div>
                                        </TableCell>
                                        <TableCell className="align-top py-4">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={
                                                    item.status === 'PRESENT' ? 'default' :
                                                        item.status === 'ABSENT' ? 'destructive' :
                                                            item.status === 'ON_LEAVE' ? 'secondary' : 'outline'
                                                }>
                                                    {item.status.replace('_', ' ')}
                                                </Badge>
                                                {item.status === 'ON_LEAVE' && item.leaveDetails && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        onClick={() => setSelectedLeave(item.leaveDetails)}
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top py-4">
                                            {item.records && item.records.length > 0 ? (
                                                <div className="space-y-1">
                                                    {item.records.map((record: any, idx: number) => (
                                                        <div key={record.id} className="text-xs border-b last:border-0 pb-3 last:pb-0 h-[60px] flex flex-col justify-center">
                                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                <span className="font-semibold text-muted-foreground w-16">Session {idx + 1}:</span>

                                                                <Badge variant="outline" className={`h-5 text-[10px] px-1 ${record.checkInLocation === 'HOME'
                                                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                    : 'bg-orange-50 text-orange-700 border-orange-200'
                                                                    }`}>
                                                                    IN: {record.checkInLocation || 'OFFICE'}
                                                                </Badge>

                                                                {record.checkOutLocation && record.checkOutLocation !== record.checkInLocation && (
                                                                    <>
                                                                        <span className="text-muted-foreground text-[10px]">→</span>
                                                                        <Badge variant="outline" className={`h-5 text-[10px] px-1 ${record.checkOutLocation === 'HOME'
                                                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                            : 'bg-orange-50 text-orange-700 border-orange-200'
                                                                            }`}>
                                                                            OUT: {record.checkOutLocation}
                                                                        </Badge>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className="pl-[72px] font-medium text-xs">
                                                                {new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ' Active'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="align-top py-4">
                                            {item.totalDuration ? (
                                                <Badge variant={
                                                    (item.totalDuration / (1000 * 60 * 60)) < (item.requiredHours || 8) ? "destructive" : "secondary"
                                                }>
                                                    {(item.totalDuration / (1000 * 60 * 60)).toFixed(2)} hrs
                                                </Badge>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="align-top py-4">
                                            {item.records && item.records.length > 0 ? (
                                                <div className="space-y-1">
                                                    {item.records.map((record: any) => (
                                                        <div key={record.id} className="text-xs border-b last:border-0 pb-3 last:pb-0 h-[60px] flex flex-col justify-center">
                                                            <div>
                                                                <span className="text-muted-foreground font-semibold mr-1">Task:</span>
                                                                {record.checkInTask ? (
                                                                    <span className="text-gray-900">{record.checkInTask}</span>
                                                                ) : (
                                                                    <span className="text-muted-foreground/50 italic">None</span>
                                                                )}
                                                            </div>
                                                            {record.checkInNotes && (
                                                                <div className="mt-1 text-[10px] text-muted-foreground break-words max-w-[250px] leading-tight">
                                                                    <span className="font-semibold text-primary/70">Note:</span> "{record.checkInNotes}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
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

            <Dialog open={!!selectedLeave} onOpenChange={(open) => !open && setSelectedLeave(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Leave Details</DialogTitle>
                        <div className="text-muted-foreground text-sm">Information about the approved leave.</div>
                    </DialogHeader>
                    {selectedLeave && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Type</span>
                                    <div className="font-medium">{selectedLeave.leaveType?.name || 'Leave'}</div>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Status</span>
                                    <div><Badge variant="secondary">{selectedLeave.status}</Badge></div>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Start Date</span>
                                    <div className="font-medium">{format(new Date(selectedLeave.startDate), 'PPP')}</div>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">End Date</span>
                                    <div className="font-medium">{format(new Date(selectedLeave.endDate), 'PPP')}</div>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground uppercase font-semibold">Reason</span>
                                <div className="mt-1 p-3 bg-muted rounded-md text-sm italic">
                                    "{selectedLeave.reason || 'No reason provided'}"
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h4 className="text-xs uppercase font-semibold text-muted-foreground mb-3">Approval Log</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
                                        <div className="flex-1">
                                            <div className="font-medium">Request Submitted</div>
                                            <div className="text-xs text-muted-foreground">
                                                by {selectedLeave.user?.firstName} {selectedLeave.user?.lastName} on {format(new Date(selectedLeave.createdAt), "PPP 'at' p")}
                                            </div>
                                        </div>
                                    </div>
                                    {selectedLeave.approver && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <div className="mt-0.5 h-2 w-2 rounded-full bg-green-500" />
                                            <div className="flex-1">
                                                <div className="font-medium">Approved</div>
                                                <div className="text-xs text-muted-foreground">
                                                    by {selectedLeave.approver.firstName} {selectedLeave.approver.lastName} on {format(new Date(selectedLeave.updatedAt), "PPP 'at' p")}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setSelectedLeave(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

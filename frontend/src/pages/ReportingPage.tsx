import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { BarChart, Users, TrendingUp, Download, Calendar } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";

import { useEffect, useState } from 'react';
import api from '../lib/api';

interface DashboardStats {
    totalEmployees: number;
    presentToday: number;
    scope: string; // 'Global', 'Department', 'Team', 'Self'
}

const mockReports = [
    { id: 1, name: 'Monthly Attendance Summary', date: '2025-12-01', type: 'PDF', size: '1.2 MB' },
    { id: 2, name: 'Payroll Reconciliation', date: '2025-11-28', type: 'XLSX', size: '850 KB' },
    { id: 3, name: 'Departmental Headcount', date: '2025-11-15', type: 'PDF', size: '420 KB' },
];

export default function ReportingPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/reporting/dashboard-stats');
                setStats(response.data.data);
            } catch (error) {
                console.error("Failed to fetch reporting stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Helper to format scope display
    const getScopeDisplay = () => {
        if (!stats) return '';
        if (stats.scope === 'Manager') return 'Department Overview';
        if (stats.scope === 'TeamLeader') return 'Team Overview';
        if (stats.scope === 'Employee') return 'Personal Overview';
        return 'Company Overview';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reporting & Analytics</h1>
                    <p className="text-muted-foreground mt-2">
                        {loading ? 'Loading insights...' : `Insights based on: ${getScopeDisplay()}`}
                    </p>
                </div>
                <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" /> Date Range
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Workforce</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '-' : stats?.totalEmployees}</div>
                        <p className="text-xs text-muted-foreground">in your scope</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '-' : stats?.presentToday}</div>
                        <p className="text-xs text-muted-foreground">checked in</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading || !stats?.totalEmployees ? '-' : `${Math.round((stats.presentToday / stats.totalEmployees) * 100)}%`}
                        </div>
                        <p className="text-xs text-muted-foreground">real-time</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                    <CardDescription>
                        Download generated reports for offline analysis.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Report Name</TableHead>
                                <TableHead>Generated Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Size</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockReports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium">{report.name}</TableCell>
                                    <TableCell>{report.date}</TableCell>
                                    <TableCell>{report.type}</TableCell>
                                    <TableCell className="text-right">{report.size}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">
                                            <Download className="mr-2 h-4 w-4" /> Download
                                        </Button>
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

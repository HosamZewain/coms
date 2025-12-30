import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Download, Loader2 } from 'lucide-react';

export default function PayrollPage() {
    const [loading, setLoading] = useState(false);
    const [payroll, setPayroll] = useState<any[]>([]);
    const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1));
    const [year, setYear] = useState<string>(String(new Date().getFullYear()));

    const fetchPayroll = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/payroll?month=${month}&year=${year}`);
            setPayroll(res.data.data);
        } catch (error) {
            console.error('Failed to fetch payroll:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayroll();
    }, []);

    const handleGenerate = () => {
        fetchPayroll();
    };

    const handleDownload = () => {
        // Implement download logic (e.g., convert to CSV)
        alert("Coming Soon: Download feature is not yet implemented.");
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and view employee salaries and compensations.
                    </p>
                </div>
                <Button onClick={handleDownload} variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Generate Report</CardTitle>
                    <CardDescription>Select the period to view payroll details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="w-48 space-y-2">
                            <label className="text-sm font-medium">Month</label>
                            <Select value={month} onValueChange={setMonth}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((m, index) => (
                                        <SelectItem key={index + 1} value={String(index + 1)}>
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-32 space-y-2">
                            <label className="text-sm font-medium">Year</label>
                            <Select value={year} onValueChange={setYear}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleGenerate} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate View
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Basic Salary</TableHead>
                                <TableHead className="text-green-600">Additions</TableHead>
                                <TableHead className="text-red-600">Deductions</TableHead>
                                <TableHead className="text-right">Net Salary</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payroll.length > 0 ? (
                                payroll.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.employeeName}</TableCell>
                                        <TableCell>{item.baseSalary.toLocaleString()} {item.currency}</TableCell>
                                        <TableCell className="text-green-600">+{item.additions.toLocaleString()} {item.currency}</TableCell>
                                        <TableCell className="text-red-600">-{item.deductions.toLocaleString()} {item.currency}</TableCell>
                                        <TableCell className="text-right font-bold">{item.netSalary.toLocaleString()} {item.currency}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No data found for this period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
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
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { Search, RotateCw, Eye } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../lib/api';

export default function LogsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [viewDetails, setViewDetails] = useState<any | null>(null);

    const { data: logs, isLoading, refetch } = useQuery({
        queryKey: ['audit-logs', page],
        queryFn: async () => {
            // Assuming we adding a new route for audit logs or using existing report route
            const res = await api.get(`/reporting/audit-logs?limit=50&offset=${page * 50}`);
            return res.data.data;
        },
        refetchInterval: 10000
    });

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'bg-green-100 text-green-800 border-green-200';
            case 'UPDATE': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredLogs = logs?.filter((log: any) =>
        JSON.stringify(log).toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
                    <p className="text-muted-foreground mt-2">
                        Comprehensive audit trail of all system actions.
                    </p>
                </div>
                <Button variant="outline" onClick={() => refetch()}>
                    <RotateCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Audit Trail</CardTitle>
                    <CardDescription>
                        View details of who did what, when, and from where.
                    </CardDescription>
                    <div className="pt-4">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search logs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Actor</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Resource</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead className="text-right">Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            Loading logs...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No logs found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((log: any) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="whitespace-nowrap font-medium">
                                                {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">
                                                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {log.user?.email || 'N/A'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {log.resource}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {log.ipAddress || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setViewDetails(log)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" /> View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!viewDetails} onOpenChange={(open) => !open && setViewDetails(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Log Details</DialogTitle>
                        <DialogDescription>
                            Full payload of the action performed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold text-muted-foreground">Action ID:</span>
                                <p className="font-mono">{viewDetails?.id}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">Timestamp:</span>
                                <p>{viewDetails && format(new Date(viewDetails.createdAt), 'PPpp')}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">User:</span>
                                <p>{viewDetails?.user?.email}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">IP Address:</span>
                                <p>{viewDetails?.ipAddress}</p>
                            </div>
                        </div>

                        <div>
                            <span className="font-semibold text-muted-foreground mb-2 block">Payload / Changes:</span>
                            <div className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto font-mono text-xs">
                                <pre>{viewDetails?.details ? JSON.stringify(JSON.parse(viewDetails.details), null, 2) : 'No details recorded.'}</pre>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

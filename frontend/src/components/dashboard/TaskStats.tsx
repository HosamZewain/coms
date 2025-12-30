import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../lib/api';

const STATUS_COLORS: Record<string, string> = {
    TODO: '#94a3b8',
    IN_PROGRESS: '#3b82f6',
    DONE: '#22c55e',
    BLOCKED: '#ef4444'
};

const PRIORITY_COLORS: Record<string, string> = {
    LOW: '#94a3b8',
    MEDIUM: '#3b82f6',
    HIGH: '#f59e0b',
    CRITICAL: '#ef4444'
};

export default function TaskStats() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/dashboard/stats');
            return res.data.data;
        }
    });

    const statusData = stats?.tasksByStatus?.map((item: any) => ({
        name: item.status.replace('_', ' '),
        value: item._count.status,
        color: STATUS_COLORS[item.status] || '#94a3b8'
    })) || [];

    const priorityData = stats?.tasksByPriority?.map((item: any) => ({
        name: item.priority,
        value: item._count.priority,
        color: PRIORITY_COLORS[item.priority] || '#94a3b8'
    })) || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Task Statistics</CardTitle>
                <CardDescription>Distribution by status and priority</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                        <div className="text-sm text-muted-foreground">Loading stats...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {/* Status Chart */}
                        <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-2 text-center">By Status</h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1 mt-2">
                                {statusData.map((item: any) => (
                                    <div key={item.name} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span>{item.name}</span>
                                        </div>
                                        <span className="font-medium">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Priority Chart */}
                        <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-2 text-center">By Priority</h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={priorityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {priorityData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1 mt-2">
                                {priorityData.map((item: any) => (
                                    <div key={item.name} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span>{item.name}</span>
                                        </div>
                                        <span className="font-medium">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

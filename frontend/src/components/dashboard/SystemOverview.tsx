import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FolderKanban, CheckSquare, ListTodo, CheckCircle2 } from 'lucide-react';

interface SystemOverviewProps {
    stats: {
        activeProjects: number;
        totalTasks: number;
        completedTasks: number;
        pendingTasks: number;
        activeLeaves?: number; // Optional reference
    };
}

export default function SystemOverview({ stats }: SystemOverviewProps) {
    const items = [
        {
            label: 'Active Projects',
            value: stats.activeProjects,
            icon: FolderKanban,
            color: 'text-blue-500',
            bg: 'bg-blue-100'
        },
        {
            label: 'Total Tasks',
            value: stats.totalTasks,
            icon: ListTodo,
            color: 'text-purple-500',
            bg: 'bg-purple-100'
        },
        {
            label: 'Completed',
            value: stats.completedTasks,
            icon: CheckCircle2,
            color: 'text-green-500',
            bg: 'bg-green-100'
        },
        {
            label: 'Pending',
            value: stats.pendingTasks,
            icon: CheckSquare,
            color: 'text-orange-500',
            bg: 'bg-orange-100'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item) => (
                <Card key={item.label}>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">{item.label}</p>
                            <h3 className="text-2xl font-bold">{item.value}</h3>
                        </div>
                        <div className={`p-3 rounded-full ${item.bg}`}>
                            <item.icon className={`h-5 w-5 ${item.color}`} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

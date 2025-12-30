import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UserCheck, UserX, Clock, CalendarOff } from 'lucide-react';

interface AttendanceStatsProps {
    data: {
        present: number;
        absent: number;
        late: number;
        onLeave: number;
        totalEmployees: number;
    };
}

export default function AttendanceStats({ data }: AttendanceStatsProps) {
    const stats = [
        {
            label: 'Present',
            value: data.present,
            icon: UserCheck,
            color: 'text-green-500',
            bg: 'bg-green-100'
        },
        {
            label: 'Absent',
            value: data.absent,
            icon: UserX,
            color: 'text-red-500',
            bg: 'bg-red-100'
        },
        {
            label: 'Late',
            value: data.late,
            icon: Clock,
            color: 'text-orange-500',
            bg: 'bg-orange-100'
        },
        {
            label: 'On Leave',
            value: data.onLeave,
            icon: CalendarOff,
            color: 'text-blue-500',
            bg: 'bg-blue-100'
        }
    ];

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Daily Attendance</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className={`p-2 rounded-full mb-2 ${stat.bg}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

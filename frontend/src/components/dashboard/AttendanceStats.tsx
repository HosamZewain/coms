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
    darkMode?: boolean;
}

export default function AttendanceStats({ data, darkMode = false }: AttendanceStatsProps) {
    const stats = [
        {
            label: 'Present',
            value: data.present,
            icon: UserCheck,
            color: darkMode ? 'text-emerald-400' : 'text-emerald-600',
            bg: darkMode ? 'bg-emerald-500/20' : 'bg-emerald-50',
            borderColor: darkMode ? 'border-emerald-500/30' : 'border-emerald-100',
            iconBg: darkMode ? 'bg-emerald-500/30' : 'bg-white'
        },
        {
            label: 'Absent',
            value: data.absent,
            icon: UserX,
            color: darkMode ? 'text-rose-400' : 'text-rose-600',
            bg: darkMode ? 'bg-rose-500/20' : 'bg-rose-50',
            borderColor: darkMode ? 'border-rose-500/30' : 'border-rose-100',
            iconBg: darkMode ? 'bg-rose-500/30' : 'bg-white'
        },
        {
            label: 'Late',
            value: data.late,
            icon: Clock,
            color: darkMode ? 'text-amber-400' : 'text-amber-600',
            bg: darkMode ? 'bg-amber-500/20' : 'bg-amber-50',
            borderColor: darkMode ? 'border-amber-500/30' : 'border-amber-100',
            iconBg: darkMode ? 'bg-amber-500/30' : 'bg-white'
        },
        {
            label: 'On Leave',
            value: data.onLeave,
            icon: CalendarOff,
            color: darkMode ? 'text-sky-400' : 'text-sky-600',
            bg: darkMode ? 'bg-sky-500/20' : 'bg-sky-50',
            borderColor: darkMode ? 'border-sky-500/30' : 'border-sky-100',
            iconBg: darkMode ? 'bg-sky-500/30' : 'bg-white'
        }
    ];

    return (
        <Card className={`border-0 shadow-xl overflow-hidden ${darkMode ? 'bg-white/5 backdrop-blur-xl border border-white/10' : 'bg-white/50 backdrop-blur-sm shadow-sm'}`}>
            <CardHeader className={`pb-4 border-b ${darkMode ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-white/30'}`}>
                <div className="flex items-center justify-between">
                    <CardTitle className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>Daily Attendance</CardTitle>
                    <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${darkMode ? 'text-slate-400 bg-white/10' : 'text-slate-400 bg-slate-100'}`}>
                        {data.totalEmployees} Total
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${stat.borderColor} ${stat.bg} shadow-sm group transition-all hover:scale-[1.02]`}>
                            <div className={`p-2.5 rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform ${stat.iconBg}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <div className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</div>
                            <div className={`text-[11px] font-bold uppercase tracking-tighter mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

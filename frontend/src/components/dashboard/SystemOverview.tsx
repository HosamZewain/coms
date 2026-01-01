import { FolderKanban, CheckSquare, ListTodo, CheckCircle2 } from 'lucide-react';

interface SystemOverviewProps {
    stats: {
        activeProjects: number;
        totalTasks: number;
        completedTasks: number;
        pendingTasks: number;
        activeLeaves?: number;
    };
    darkMode?: boolean;
}

export default function SystemOverview({ stats, darkMode = false }: SystemOverviewProps) {
    const items = [
        {
            label: 'Active Projects',
            value: stats.activeProjects,
            icon: FolderKanban,
            gradient: 'from-blue-500 to-cyan-500',
            iconBg: darkMode ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-100 text-blue-600'
        },
        {
            label: 'Total Tasks',
            value: stats.totalTasks,
            icon: ListTodo,
            gradient: 'from-violet-500 to-purple-500',
            iconBg: darkMode ? 'bg-violet-500/30 text-violet-300' : 'bg-purple-100 text-purple-600'
        },
        {
            label: 'Tasks Completed',
            value: stats.completedTasks,
            icon: CheckCircle2,
            gradient: 'from-emerald-500 to-teal-500',
            iconBg: darkMode ? 'bg-emerald-500/30 text-emerald-300' : 'bg-emerald-100 text-emerald-600'
        },
        {
            label: 'Pending Tasks',
            value: stats.pendingTasks,
            icon: CheckSquare,
            gradient: 'from-amber-500 to-orange-500',
            iconBg: darkMode ? 'bg-amber-500/30 text-amber-300' : 'bg-amber-100 text-amber-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item) => (
                <div
                    key={item.label}
                    className={`relative overflow-hidden rounded-2xl p-6 transition-all hover:shadow-xl group ${darkMode
                            ? 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg'
                            : 'border border-slate-100 bg-white shadow-sm'
                        }`}
                >
                    {/* Gradient accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient}`} />

                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</p>
                            <h3 className={`text-3xl font-bold mt-1 tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${item.iconBg} transition-transform group-hover:scale-110`}>
                            <item.icon className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

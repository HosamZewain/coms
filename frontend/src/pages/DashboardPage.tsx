import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import api from '../lib/api';

// New dashboard components
import ActivityFeed from '../components/dashboard/ActivityFeed';
import AttendanceStats from '../components/dashboard/AttendanceStats';
import WorkLocationStats from '../components/dashboard/WorkLocationStats';
import ActiveEmployeesList from '../components/dashboard/ActiveEmployeesList';
import SystemOverview from '../components/dashboard/SystemOverview';
import UpcomingEvents from '../components/dashboard/UpcomingEvents';
import RecentAwards from '../components/dashboard/RecentAwards';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/dashboard/stats');
            return res.data.data;
        },
        refetchInterval: 30000 // Refresh every 30s
    });

    const greetingText = getGreeting();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
                    <p className="text-sm font-medium text-slate-500 animate-pulse">Loading Workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Premium Header - Dark Mode */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-2 border border-indigo-500/30">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                        {greetingText}, {user?.firstName}
                        <span className="text-2xl">👋</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-start">
                        Here's what's happening with your team today.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 mr-4 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-800 bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                {i}
                            </div>
                        ))}
                        <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-slate-800 bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white">
                            +{stats?.attendance?.totalEmployees || 0}
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 px-4"
                        onClick={() => navigate('/attendance')}
                    >
                        Attendance
                    </Button>
                    <Button
                        size="sm"
                        className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 border-0 hover:from-indigo-600 hover:to-violet-700 px-4 shadow-lg shadow-indigo-500/25"
                        onClick={() => navigate('/attendance/leaves')}
                    >
                        Approvals
                    </Button>
                </div>
            </div>

            {/* TOP ROW: Presence & Operations (8+4) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                    <AttendanceStats data={stats?.attendance || { present: 0, absent: 0, late: 0, onLeave: 0, totalEmployees: 0 }} darkMode />
                </div>
                <div className="lg:col-span-4">
                    <WorkLocationStats data={stats?.workLocation || { office: 0, home: 0, undefined: 0 }} darkMode />
                </div>
            </div>

            {/* MIDDLE ROW: System Metrics */}
            <SystemOverview stats={stats?.system || {}} darkMode />

            {/* BOTTOM ROW: Workforce & Recognition (8+4) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden shadow-xl h-full">
                        <ActiveEmployeesList employees={stats?.activeEmployees || []} darkMode />
                    </div>
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden shadow-xl">
                        <UpcomingEvents events={stats?.upcomingEvents || []} darkMode />
                    </div>
                    <div className="rounded-2xl overflow-hidden shadow-xl">
                        <RecentAwards awards={stats?.recentAwards || []} darkMode />
                    </div>
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 text-start">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Activity</h3>
                        </div>
                        <ActivityFeed darkMode />
                    </div>
                </div>
            </div>
        </div>
    );
}

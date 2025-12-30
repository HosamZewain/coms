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

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Overview of workforce and project performance
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/attendance')}>
                        Attendance
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/attendance/leaves')}>
                        Leaves
                    </Button>
                    {useAuthStore.getState().checkPermission('projects', 'add') && (
                        <Button onClick={() => navigate('/projects/new')}>
                            New Project
                        </Button>
                    )}
                </div>
            </div>

            {/* System Overview (Projects & Tasks) */}
            <SystemOverview stats={stats?.system || {}} />

            {/* Attendance & Workforce Section */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Main Content Column */}
                <div className="xl:col-span-3 space-y-6">
                    {/* Attendance Stats Row */}
                    <AttendanceStats data={stats?.attendance || { present: 0, absent: 0, late: 0, onLeave: 0 }} />

                    {/* Active Employees & Tasks List */}
                    <ActiveEmployeesList employees={stats?.activeEmployees || []} />
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Work Location Chart */}
                    <WorkLocationStats data={stats?.workLocation || { office: 0, home: 0, undefined: 0 }} />

                    {/* Activity Feed */}
                    <ActivityFeed />
                </div>
            </div>
        </div>
    );
}

import { Sidebar } from '../components/Sidebar';
import { useAuthStore } from '../store/auth.store';
import HeaderAttendance from '../components/layout/HeaderAttendance';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((state) => state.user);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
                    <h2 className="text-lg font-semibold">Welcome back, {user?.firstName}</h2>
                    <div className="flex items-center gap-4">
                        <HeaderAttendance />
                        {/* Add User Menu or Theme Toggle here */}
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

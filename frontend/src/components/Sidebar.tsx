import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    Settings,
    LogOut,
    BarChart3,
    ChevronDown,
    ChevronRight,
    ListTodo,
    FolderKanban,
    Building2
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { Button } from './ui/button';
import { useState } from 'react';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    {
        icon: FolderKanban,
        label: 'Project Management',
        href: '/project-management',
        subItems: [
            { label: 'Projects', href: '/projects' },
            { label: 'Plans', href: '/plans' },
            { label: 'My Tasks', href: '/tasks' },
        ]
    },
    {
        icon: Building2,
        label: 'HR',
        href: '/hr',
        subItems: [
            { label: 'Employees', href: '/employees' },
            { label: 'Attendance', href: '/attendance' },
            { label: 'Leaves', href: '/attendance/leave' },
            { label: 'Payroll', href: '/hr/payroll' },
            { label: 'Approvals', href: '/hr/approvals' },
            { label: 'Overtime', href: '/hr/overtime' },
            { label: 'Recruitment', href: '/recruitment' },
            { label: 'Awards', href: '/hr/awards' },
            { label: 'Documents', href: '/hr/documents' },
        ]
    },
    { icon: Users, label: 'Team', href: '/team' },
    {
        icon: BarChart3,
        label: 'Reports',
        href: '/reports',
        subItems: [
            { label: 'Attendance Report', href: '/reports/attendance' },
            { label: 'Employee Monthly', href: '/reports/employee-monthly' },
            { label: 'Logs', href: '/reports/logs' },
        ]
    },
    {
        icon: Settings,
        label: 'Settings',
        href: '/settings',
        subItems: [
            { label: 'General', href: '/settings/company' },
            { label: 'Roles & Permissions', href: '/settings/roles' },
            { label: 'Departments', href: '/settings/departments' },
            { label: 'Holidays', href: '/settings/holidays' },
            { label: 'Work Regulations', href: '/settings/regulations' },
            { label: 'Awards Setup', href: '/settings/awards' },
        ]
    },
];

export function Sidebar() {
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);
    const [openMenus, setOpenMenus] = useState<string[]>(['Reports']);
    const { user } = useAuthStore();

    const toggleMenu = (label: string) => {
        setOpenMenus(prev =>
            prev.includes(label)
                ? prev.filter(item => item !== label)
                : [...prev, label]
        );
    };

    const checkAccess = (label: string) => {
        if (!user || !user.role) return false;
        const role = user.role.name;

        switch (label) {
            case 'Dashboard': return true;
            case 'HR': return ['Admin', 'HR', 'Director', 'Manager'].includes(role);
            case 'Reports': return ['Admin', 'HR', 'Director', 'Manager'].includes(role);
            case 'Settings': return ['Admin', 'HR'].includes(role);
            case 'Project Management': return true;
            case 'Team': return true;
            default: return true;
        }
    };

    return (
        <div className="flex h-full w-64 flex-col border-r border-white/10 bg-slate-900">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    COMS
                </h1>
            </div>
            <nav className="flex-1 space-y-1 px-4 overflow-y-auto">
                {sidebarItems.map((item) => {
                    if (!checkAccess(item.label)) return null;

                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.href) && !item.subItems;
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isOpen = openMenus.includes(item.label);

                    if (hasSubItems) {
                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    onClick={() => toggleMenu(item.label)}
                                    className={cn(
                                        "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10",
                                        location.pathname.startsWith(item.href) ? "text-white" : "text-slate-400"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </div>
                                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </button>
                                {isOpen && (
                                    <div className="ml-9 space-y-1 border-l border-white/10 pl-2">
                                        {item.subItems?.map((subItem) => (
                                            <Link
                                                key={subItem.href}
                                                to={subItem.href}
                                                className={cn(
                                                    "block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-indigo-400",
                                                    location.pathname === subItem.href
                                                        ? "text-indigo-400"
                                                        : "text-slate-500"
                                                )}
                                            >
                                                {subItem.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-white/10">
                {user && (
                    <div className="mb-4 px-2 py-1.5 text-xs text-slate-400 bg-white/5 rounded-md">
                        Signed in as: <span className="font-semibold text-slate-300">{user.firstName}</span> ({user.role?.name})
                    </div>
                )}
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-white/10"
                    onClick={() => logout()}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
            <div className="px-6 pb-4 text-xs text-center text-slate-600">
                &copy; {new Date().getFullYear()} Appout ITS
            </div>
        </div >
    );
}


import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Building, Bell, Shield, Users, CalendarDays, Lock } from 'lucide-react';

const settingsLinks = [
    {
        title: 'Company Profile',
        description: 'Update your organization\'s public information and contact details.',
        icon: Building,
        href: '/settings/company'
    },
    {
        title: 'Roles & Permissions',
        description: 'Configure access levels and manage user roles across the system.',
        icon: Shield,
        href: '/settings/roles'
    },
    {
        title: 'Departments',
        description: 'Manage company departments and organizational structure.',
        icon: Users,
        href: '/settings/departments'
    },
    {
        title: 'Work Regulations',
        description: 'Define working hours, shifts, and attendance policies.',
        icon: CalendarDays,
        href: '/settings/regulations'
    },
    {
        title: 'Holidays',
        description: 'Manage organization holidays and recurring days off.',
        icon: CalendarDays,
        href: '/settings/holidays'
    },
    {
        title: 'Awards Setup',
        description: 'Configure award types and criteria for employees.',
        icon: Users,
        href: '/settings/awards'
    },
    {
        title: 'Notifications',
        description: 'Manage email alerts and system notifications.',
        icon: Bell,
        href: '/settings/notifications'
    },
    {
        title: 'Security',
        description: 'Two-factor authentication and security policies.',
        icon: Lock,
        href: '/settings/security'
    }
];

export default function SettingsPage() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your company profile, system preferences, and security.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {settingsLinks.map((link) => (
                    <Card
                        key={link.title}
                        className="hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => navigate(link.href)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">
                                {link.title}
                            </CardTitle>
                            <link.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-sm mt-2">
                                {link.description}
                            </CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}



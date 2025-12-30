import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const activities = [
    {
        user: { name: 'Sarah Wilson', initials: 'SW' },
        action: 'applied for leave',
        target: 'Annual Leave',
        time: '2 hours ago'
    },
    {
        user: { name: 'Mike Johnson', initials: 'MJ' },
        action: 'completed task',
        target: 'API Integration',
        time: '4 hours ago'
    },
    {
        user: { name: 'Alex Brown', initials: 'AB' },
        action: 'joined as',
        target: 'Senior Developer',
        time: '1 day ago'
    },
    {
        user: { name: 'Emily Davis', initials: 'ED' },
        action: 'updated',
        target: 'Project Timeline',
        time: '2 days ago'
    }
];

export function RecentActivity() {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {activities.map((activity, index) => (
                        <div key={index} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>{activity.user.initials}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {activity.user.name} <span className="text-muted-foreground font-normal">{activity.action}</span> <span className="font-medium">{activity.target}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {activity.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Clock, MessageSquare, UserPlus, Edit, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function ActivityFeed() {
    const navigate = useNavigate();

    const { data: activities, isLoading } = useQuery({
        queryKey: ['recent-activities'],
        queryFn: async () => {
            const res = await api.get('/activities/recent?limit=10');
            return res.data.data;
        },
        refetchInterval: 30000 // Refresh every 30 seconds
    });

    const getActivityIcon = (action: string) => {
        switch (action) {
            case 'created': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'updated': return <Edit className="h-4 w-4 text-blue-500" />;
            case 'status_changed': return <AlertCircle className="h-4 w-4 text-orange-500" />;
            case 'assigned': return <UserPlus className="h-4 w-4 text-purple-500" />;
            case 'commented': return <MessageSquare className="h-4 w-4 text-cyan-500" />;
            default: return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getActivityText = (activity: any) => {
        const actorName = activity.actor
            ? `${activity.actor.firstName} ${activity.actor.lastName}`
            : 'Someone';
        const taskTitle = activity.task?.title || 'a task';

        switch (activity.action) {
            case 'created':
                return `${actorName} created "${taskTitle}"`;
            case 'updated':
                return `${actorName} updated "${taskTitle}"`;
            case 'status_changed':
                const meta = activity.meta ? JSON.parse(activity.meta) : {};
                return `${actorName} moved "${taskTitle}" from ${meta.from} to ${meta.to}`;
            case 'assigned':
                return `${actorName} assigned "${taskTitle}"`;
            case 'commented':
                return `${actorName} commented on "${taskTitle}"`;
            default:
                return `${actorName} performed an action on "${taskTitle}"`;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your team</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-start gap-3 animate-pulse">
                                <div className="h-8 w-8 rounded-full bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted rounded w-3/4" />
                                    <div className="h-3 bg-muted rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !activities || activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                        No recent activity to display
                    </p>
                ) : (
                    <div className="space-y-4">
                        {activities.map((activity: any) => (
                            <div
                                key={activity.id}
                                className="flex items-start gap-3 hover:bg-accent/50 p-2 rounded-lg cursor-pointer transition-colors"
                                onClick={() => {
                                    if (activity.task?.id) {
                                        navigate(`/projects/${activity.task.projectId}?task=${activity.task.id}`);
                                    }
                                }}
                            >
                                <div className="flex-shrink-0">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="text-xs">
                                            {activity.actor ? activity.actor.firstName[0] + activity.actor.lastName[0] : '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-2">
                                        {getActivityIcon(activity.action)}
                                        <p className="text-sm">
                                            {getActivityText(activity)}
                                        </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

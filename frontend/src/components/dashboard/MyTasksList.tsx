import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckSquare, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function MyTasksList() {
    const navigate = useNavigate();

    const { data: tasks, isLoading } = useQuery({
        queryKey: ['my-tasks-dashboard'],
        queryFn: async () => {
            const res = await api.get('/dashboard/my-tasks?limit=5');
            return res.data.data;
        }
    });

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return 'destructive';
            case 'HIGH': return 'default';
            case 'MEDIUM': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>Your assigned tasks</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="space-y-2 animate-pulse">
                                <div className="h-4 bg-muted rounded w-3/4" />
                                <div className="h-3 bg-muted rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : !tasks || tasks.length === 0 ? (
                    <div className="text-center py-8">
                        <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">No tasks assigned to you</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.slice(0, 5).map((task: any) => (
                            <div
                                key={task.id}
                                className="border-l-2 border-primary/20 pl-3 hover:border-primary/50 hover:bg-accent/50 py-2 rounded-r cursor-pointer transition-colors"
                                onClick={() => {
                                    if (task.projectId) {
                                        navigate(`/projects/${task.projectId}?task=${task.id}`);
                                    }
                                }}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-sm font-medium line-clamp-1">{task.title}</h4>
                                    <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                                        {task.priority}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                    {task.project && (
                                        <span className="text-xs text-muted-foreground">
                                            {task.project.name}
                                        </span>
                                    )}
                                    {task.dueDate && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(task.dueDate), 'MMM d')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-sm"
                            onClick={() => navigate('/tasks')}
                        >
                            View all my tasks
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

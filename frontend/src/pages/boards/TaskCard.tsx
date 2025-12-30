// import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { MessageSquare, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';

interface Task {
    id: string;
    title: string;
    priority: string;
    type: string;
    assignments: { user: { firstName: string, lastName: string } }[];
    _count: { comments: number };
    dueDate?: string;
}

export function TaskCard({ task }: { task: Task }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: task.id });

    const [_, setSearchParams] = useSearchParams();

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'CRITICAL': return 'destructive';
            case 'HIGH': return 'destructive'; // or orange
            case 'MEDIUM': return 'default'; // or blue
            default: return 'secondary';
        }
    };

    const handleClick = () => {
        setSearchParams(prev => {
            prev.set('task', task.id);
            return prev;
        });
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3" onClick={handleClick}>
            <Card className="cursor-grab hover:shadow-md transition-shadow">
                <CardHeader className="p-3 pb-0 space-y-0">
                    <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 mb-1">{task.type}</Badge>
                        <Badge variant={getPriorityColor(task.priority) as any} className="text-[10px] px-1 py-0 h-5">{task.priority}</Badge>
                    </div>
                    <CardTitle className="text-sm font-medium leading-tight mt-1">
                        {task.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2">

                </CardContent>
                <CardFooter className="p-3 pt-0 flex justify-between items-center text-muted-foreground">
                    <div className="flex -space-x-2">
                        {task.assignments.slice(0, 3).map((a, i) => (
                            <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                <AvatarFallback className="text-[10px]">{a.user.firstName[0]}{a.user.lastName[0]}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                    <div className="flex gap-3 text-xs">
                        {task.dueDate && (
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                            </div>
                        )}
                        {task._count?.comments > 0 && (
                            <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{task._count.comments}</span>
                            </div>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

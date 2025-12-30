import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Briefcase, Building2, Home } from 'lucide-react';

interface ActiveEmployee {
    userId: string;
    userName: string;
    checkInTime: string;
    location: string;
    currentTask?: string;
    projectId?: string;
}

interface ActiveEmployeesListProps {
    employees: ActiveEmployee[];
}

export default function ActiveEmployeesList({ employees }: ActiveEmployeesListProps) {
    const getLocationBadge = (location: string) => {
        switch (location) {
            case 'OFFICE':
                return <Badge variant="default" className="bg-blue-500"><Building2 className="w-3 h-3 mr-1" /> Office</Badge>;
            case 'HOME':
            case 'REMOTE':
                return <Badge variant="secondary" className="bg-purple-100 text-purple-700"><Home className="w-3 h-3 mr-1" /> Remote</Badge>;
            default:
                return <Badge variant="outline">{location}</Badge>;
        }
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Active Team Members</span>
                    <Badge variant="outline">{employees.length} Online</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {employees.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            No active team members right now.
                        </div>
                    ) : (
                        employees.map((emp) => (
                            <div key={emp.userId} className="flex items-start justify-between p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
                                <div className="flex gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {emp.userName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{emp.userName}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <Briefcase className="w-3 h-3" />
                                            {emp.currentTask || 'General Work'}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Online for {formatDistanceToNow(new Date(emp.checkInTime))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {getLocationBadge(emp.location)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

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
    darkMode?: boolean;
}

export default function ActiveEmployeesList({ employees, darkMode = false }: ActiveEmployeesListProps) {
    const getLocationBadge = (location: string) => {
        switch (location) {
            case 'OFFICE':
                return <Badge variant="default" className={darkMode ? 'bg-blue-500/30 text-blue-300 border-blue-500/50' : 'bg-blue-500'}><Building2 className="w-3 h-3 mr-1" /> Office</Badge>;
            case 'HOME':
            case 'REMOTE':
                return <Badge variant="secondary" className={darkMode ? 'bg-purple-500/30 text-purple-300 border-purple-500/50' : 'bg-purple-100 text-purple-700'}><Home className="w-3 h-3 mr-1" /> Remote</Badge>;
            default:
                return <Badge variant="outline" className={darkMode ? 'border-white/20 text-slate-400' : ''}>{location}</Badge>;
        }
    };

    return (
        <Card className={`h-full border-0 ${darkMode ? 'bg-transparent' : ''}`}>
            <CardHeader className={darkMode ? 'border-b border-white/10' : ''}>
                <CardTitle className={`flex justify-between items-center ${darkMode ? 'text-white' : ''}`}>
                    <span>Active Team Members</span>
                    <Badge variant="outline" className={darkMode ? 'border-white/20 text-slate-300' : ''}>{employees.length} Online</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {employees.length === 0 ? (
                        <div className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-muted-foreground'}`}>
                            No active team members right now.
                        </div>
                    ) : (
                        employees.map((emp) => (
                            <div key={emp.userId} className={`flex items-start justify-between p-3 rounded-lg border transition-colors ${darkMode
                                    ? 'border-white/10 bg-white/5 hover:bg-white/10'
                                    : 'bg-card/50 hover:bg-card/80'
                                }`}>
                                <div className="flex gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className={darkMode ? 'bg-indigo-500/30 text-indigo-300' : 'bg-primary/10 text-primary'}>
                                            {emp.userName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className={`font-medium ${darkMode ? 'text-white' : ''}`}>{emp.userName}</div>
                                        <div className={`text-xs flex items-center gap-1 mt-1 ${darkMode ? 'text-slate-400' : 'text-muted-foreground'}`}>
                                            <Briefcase className="w-3 h-3" />
                                            {emp.currentTask || 'General Work'}
                                        </div>
                                        <div className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-muted-foreground'}`}>
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

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Briefcase, Trophy, Star } from 'lucide-react';
import api from '../../lib/api';
import { getFileUrl } from '../../lib/utils';

export default function TeamPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [empRes, deptRes] = await Promise.all([
                    api.get('/employees'),
                    api.get('/company/departments') // To get structure/ordering if needed, but employee data has relations
                ]);
                setEmployees(empRes.data.data);
                setDepartments(deptRes.data.data);
            } catch (error) {
                console.error('Failed to fetch team data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper to group employees by Department -> Team
    const groupedData = () => {
        const groups: Record<string, { dept: any, teams: Record<string, { team: any, members: any[] }>, deptMembersWithoutTeam: any[] }> = {};
        const unassigned: any[] = [];

        // Initialize groups with all fetched departments
        departments.forEach(dept => {
            groups[dept.id] = { dept, teams: {}, deptMembersWithoutTeam: [] };
            // Initialize teams for this dept
            dept.teams?.forEach((t: any) => {
                groups[dept.id].teams[t.id] = { team: t, members: [] };
            });
        });

        // Distribute employees
        employees.forEach(emp => {
            const deptId = emp.departmentId;
            const teamId = emp.teamId;

            if (deptId && groups[deptId]) {
                if (teamId && groups[deptId].teams[teamId]) {
                    groups[deptId].teams[teamId].members.push(emp);
                } else {
                    groups[deptId].deptMembersWithoutTeam.push(emp);
                }
            } else {
                unassigned.push(emp);
            }
        });

        return { groups, unassigned };
    };

    const structure = groupedData();
    const { groups: deptGroups, unassigned } = structure;

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading team directory...</div>;

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Our Team</h2>
                <p className="text-muted-foreground">Meet the people behind the success.</p>
            </div>

            {Object.values(deptGroups).map((group: any) => {
                if (!group.dept) return null; // Should not happen

                const hasMembers = group.deptMembersWithoutTeam.length > 0 || Object.values(group.teams).some((t: any) => t.members.length > 0);
                if (!hasMembers) return null; // Hide empty departments

                return (
                    <div key={group.dept.id} className="space-y-6">
                        <div className="flex items-center gap-3 border-b pb-2">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <Briefcase className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold">{group.dept.name}</h3>
                                <div className="text-sm text-muted-foreground">Manager: {group.dept.manager ? `${group.dept.manager.firstName} ${group.dept.manager.lastName}` : 'Vacant'}</div>
                            </div>
                        </div>

                        {/* 1. Department Results (Managers/Members not in a team) */}
                        {group.deptMembersWithoutTeam.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {sortEmployees(group.deptMembersWithoutTeam, group.dept.managerId).map(emp => (
                                    <EmployeeCard key={emp.id} employee={emp} isManager={emp.id === group.dept.managerId} />
                                ))}
                            </div>
                        )}

                        {/* 2. Teams */}
                        {Object.values(group.teams).map((t: any) => (
                            t.members.length > 0 && (
                                <div key={t.team.id} className="ml-4 md:ml-8 mt-6">
                                    <h4 className="text-lg font-medium mb-4 flex items-center gap-2 text-muted-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {t.team.name}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {sortEmployees(t.members, null, t.team.leaderId).map(emp => (
                                            <EmployeeCard key={emp.id} employee={emp} isLeader={emp.id === t.team.leaderId} />
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                );
            })}

            {/* Unassigned Section */}
            {unassigned.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b pb-2">
                        <div className="bg-muted p-2 rounded-lg">
                            <Briefcase className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-muted-foreground">General / Unassigned</h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {unassigned.map((emp: any) => (
                            <EmployeeCard key={emp.id} employee={emp} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Logic to sort: Manager/Leader first
const sortEmployees = (list: any[], managerId: string | null, leaderId: string | null = null) => {
    return [...list].sort((a, b) => {
        if (a.id === managerId || a.id === leaderId) return -1;
        if (b.id === managerId || b.id === leaderId) return 1;
        return a.firstName.localeCompare(b.firstName);
    });
};

function EmployeeCard({ employee, isManager, isLeader }: { employee: any, isManager?: boolean, isLeader?: boolean }) {
    return (
        <Card className={`overflow-hidden transition-all hover:shadow-md ${isManager || isLeader ? 'border-primary/50 bg-primary/5' : ''}`}>
            <CardContent className="p-6 text-center space-y-4">
                <div className="relative inline-block">
                    <Avatar className="h-24 w-24 mx-auto border-4 border-background shadow-sm">
                        <AvatarImage src={getFileUrl(employee.employeeProfile?.profileImage)} className="object-cover" />
                        <AvatarFallback className="text-xl bg-muted">{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                    </Avatar>
                    {(isManager || isLeader) && (
                        <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-1.5 rounded-full shadow-sm" title={isManager ? "Department Manager" : "Team Leader"}>
                            <Star className="h-4 w-4 fill-current" />
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{employee.firstName} {employee.lastName}</h3>
                    <p className="text-sm text-muted-foreground truncate">{employee.employeeProfile?.jobTitle || employee.role?.name}</p>
                </div>

                {/* Awards Section */}
                {employee.awards && employee.awards.length > 0 && (
                    <div className="pt-2 flex justify-center gap-2 flex-wrap">
                        {employee.awards.map((award: any) => (
                            <AwardBadge key={award.id} award={award} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function AwardBadge({ award }: { award: any }) {
    return (
        <div className="group relative">
            <Badge variant="outline" className="px-2 py-1 gap-1 cursor-default hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200 transition-colors">
                <Trophy className="h-3 w-3 text-yellow-500" />
                <span className="max-w-[100px] truncate">{award.awardType.name}</span>
            </Badge>
        </div>
    );
}

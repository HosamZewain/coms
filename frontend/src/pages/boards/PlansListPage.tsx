// import React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Calendar, BarChart2, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import api from '../../lib/api';
import CreatePlanModal from '../../components/projects/CreatePlanModal';
import { Progress } from '../../components/ui/progress';

export default function PlansListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: plans, isLoading } = useQuery({
        queryKey: ['all-plans'],
        queryFn: async () => {
            const res = await api.get('/plans');
            return res.data.data || [];
        }
    });

    const filteredPlans = plans?.filter((plan: any) =>
        plan.name.toLowerCase().includes(search.toLowerCase()) ||
        plan.project?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Plans</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage all project plans across the system.
                    </p>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <Input
                    placeholder="Search plans..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {isLoading ? (
                <div>Loading plans...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlans?.map((plan: any) => {
                        const completedTasks = plan.tasks?.filter((t: any) => t.status === 'DONE').length || 0;
                        const totalTasks = plan._count?.tasks || 0;
                        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                        return (
                            <Card
                                key={plan.id}
                                className="hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => navigate(`/projects/${plan.projectId}?plan=${plan.id}`)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg font-semibold truncate pr-2">
                                            {plan.name}
                                        </CardTitle>
                                        <Badge variant={plan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                            {plan.status}
                                        </Badge>
                                    </div>
                                    {plan.project && (
                                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                                            <Briefcase className="h-3 w-3 mr-1" />
                                            {plan.project.name}
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {new Date(plan.startDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center">
                                                <BarChart2 className="h-4 w-4 mr-1" />
                                                {plan._count?.milestones || 0} Milestones
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium">{Math.round(progress)}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

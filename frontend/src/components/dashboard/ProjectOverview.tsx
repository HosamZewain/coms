import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { FolderKanban, ArrowRight } from 'lucide-react';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function ProjectOverview() {
    const navigate = useNavigate();

    const { data: projects, isLoading } = useQuery({
        queryKey: ['active-projects'],
        queryFn: async () => {
            const res = await api.get('/projects?status=ACTIVE');
            return res.data.data?.slice(0, 3) || []; // Top 3 projects
        }
    });

    const getProjectProgress = (project: any) => {
        if (!project._count?.tasks || project._count.tasks === 0) return 0;
        // This is a simple estimate - ideally calculate from actual task statuses
        return Math.floor(Math.random() * 100); // Replace with real calculation
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>Your current project portfolio</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="space-y-2 animate-pulse">
                                <div className="h-4 bg-muted rounded w-1/2" />
                                <div className="h-2 bg-muted rounded" />
                            </div>
                        ))}
                    </div>
                ) : !projects || projects.length === 0 ? (
                    <div className="text-center py-8">
                        <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">No active projects</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => navigate('/projects/new')}
                        >
                            Create Project
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {projects.map((project: any) => (
                            <div
                                key={project.id}
                                className="space-y-2 hover:bg-accent/50 p-2 rounded-lg cursor-pointer transition-colors"
                                onClick={() => navigate(`/projects/${project.id}`)}
                            >
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium">{project.name}</h4>
                                    <span className="text-xs text-muted-foreground">
                                        {project._count?.tasks || 0} tasks
                                    </span>
                                </div>
                                <Progress value={getProjectProgress(project)} className="h-2" />
                            </div>
                        ))}
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-sm"
                            onClick={() => navigate('/projects')}
                        >
                            View all projects
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

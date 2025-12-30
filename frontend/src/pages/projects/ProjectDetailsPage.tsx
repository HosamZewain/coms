

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Plus, ArrowLeft, Loader2, LayoutList, KanbanSquare } from 'lucide-react';
import KanbanBoard from '../boards/KanbanBoard';
import ProjectSidebar from '../../components/projects/ProjectSidebar';
import CreateTaskModal from '../../components/projects/CreateTaskModal';
import CreatePlanModal from '../../components/projects/CreatePlanModal';
import CreateMilestoneModal from '../../components/projects/CreateMilestoneModal';
import PlanDetailView from '../../components/projects/PlanDetailView';
import PlanList from '../../components/projects/PlanList';
import MilestoneTaskListView from '../../components/projects/MilestoneTaskListView';
import TaskListView from '../boards/TaskListView';
import ManageTeamModal from '../../components/projects/ManageTeamModal';
import TaskDetailsDialog from '../boards/TaskDetailsDialog';

export default function ProjectDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedTaskId = searchParams.get('task');

    const handleTaskClick = (taskId: string) => {
        searchParams.set('task', taskId);
        setSearchParams(searchParams);
    };

    const handleCloseTaskDialog = () => {
        searchParams.delete('task');
        setSearchParams(searchParams);
    };

    // Selection State
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // View State
    const [milestoneViewMode, setMilestoneViewMode] = useState<'LIST' | 'KANBAN'>('LIST');

    // Modals
    const [createTaskOpen, setCreateTaskOpen] = useState(false);
    const [createPlanOpen, setCreatePlanOpen] = useState(false);
    const [createMilestoneOpen, setCreateMilestoneOpen] = useState(false);
    const [manageTeamOpen, setManageTeamOpen] = useState(false);
    const [milestonePlanTarget, setMilestonePlanTarget] = useState<string>('');

    const queryClient = useQueryClient();

    const fetchProject = async () => {
        try {
            const response = await api.get(`/projects/${id}`);
            setProject(response.data.data);
            queryClient.invalidateQueries({ queryKey: ['project-plans', id] });
        } catch (error) {
            console.error('Failed to fetch project:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!project) return <div>Project not found</div>;

    // Derived Data
    const selectedPlan = project.plans?.find((p: any) => p.id === selectedPlanId);
    const selectedMilestone = selectedPlan?.milestones?.find((m: any) => m.id === selectedMilestoneId);

    const renderMainContent = () => {
        // 1. Milestone View - Show Tasks
        if (selectedMilestoneId) {
            return (
                <div className="space-y-4 h-full flex flex-col">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <span className="text-muted-foreground font-normal">{selectedPlan?.name} /</span>
                                    {selectedMilestone?.name}
                                </h2>
                                <p className="text-sm text-muted-foreground">{selectedMilestone?.description || 'No description'}</p>
                            </div>

                            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                                <Button
                                    variant={milestoneViewMode === 'LIST' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-7 px-3 text-xs"
                                    onClick={() => setMilestoneViewMode('LIST')}
                                >
                                    <LayoutList className="mr-2 h-3.5 w-3.5" /> List
                                </Button>
                                <Button
                                    variant={milestoneViewMode === 'KANBAN' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-7 px-3 text-xs"
                                    onClick={() => setMilestoneViewMode('KANBAN')}
                                >
                                    <KanbanSquare className="mr-2 h-3.5 w-3.5" /> Board
                                </Button>
                            </div>
                        </div>

                        <Button onClick={() => setCreateTaskOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> New Task
                        </Button>
                    </div>

                    <div className="flex-1 overflow-x-auto min-h-0">
                        {milestoneViewMode === 'LIST' ? (
                            <MilestoneTaskListView
                                tasks={project.tasks?.filter((t: any) => t.milestoneId === selectedMilestoneId) || []}
                                onTaskClick={handleTaskClick}
                            />
                        ) : (
                            <KanbanBoard projectId={id} milestoneId={selectedMilestoneId} />
                        )}
                    </div>
                </div>
            );
        }

        // 2. Plan View - List of Milestones & Tasks
        if (selectedPlanId) {
            return (
                <PlanDetailView
                    plan={selectedPlan}
                    allTasks={project.tasks || []}
                    onAddMilestone={() => {
                        setMilestonePlanTarget(selectedPlanId);
                        setCreateMilestoneOpen(true);
                    }}
                    onTaskClick={handleTaskClick}
                    onRefresh={fetchProject}
                />
            );
        }

        // 3. Project Overview (Default)
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Project Overview</h2>
                    <Button onClick={() => setCreatePlanOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Create Plan
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Total Plans</CardTitle></CardHeader>
                        <CardContent className="text-2xl font-bold">{project.plans?.length || 0}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Active Tasks</CardTitle></CardHeader>
                        <CardContent className="text-2xl font-bold">
                            {project.tasks?.filter((t: any) => t.status !== 'DONE').length || 0}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base">Team Members</CardTitle>
                            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setManageTeamOpen(true)}>Manage</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="flex -space-x-2">
                                {project.members && project.members.length > 0 ? (
                                    project.members.slice(0, 5).map((member: any) => (
                                        <Avatar key={member.id} className="h-8 w-8 border-2 border-background ring-1 ring-background">
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                {member.firstName[0]}{member.lastName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">No members yet</span>
                                )}
                                {project.members && project.members.length > 5 && (
                                    <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                                        +{project.members.length - 5}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Plans Grid */}
                {project.plans?.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Plans</h3>
                        </div>
                        <PlanList projectId={id || ''} />
                    </div>
                )}

                {/* Project Tasks (Query View) */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Project Tasks</h3>
                    </div>
                    <div className="border rounded-lg bg-background p-1 h-[600px]">
                        <TaskListView projectId={id} />
                    </div>
                </div>

                {!project.plans?.length && (
                    <div className="mt-8 p-8 border rounded-lg bg-muted/10 text-center space-y-4">
                        <h3 className="text-lg font-medium">Get Started</h3>
                        <p className="text-muted-foreground">This project is empty. Start by creating a Plan (e.g., "Phase 1" or "Q1 Goals").</p>
                        <Button onClick={() => setCreatePlanOpen(true)}>Create First Plan</Button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-50">
            {/* Header */}
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="cursor-pointer hover:bg-muted p-2 rounded-full transition-colors" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {/* Assuming PanelLeft is imported from lucide-react */}
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                        {/* Wait, use proper icon if possible, but for now reverting to ArrowLeft logic or Sidebar toggle */}
                    </div>
                    <div className="cursor-pointer hover:bg-muted p-2 rounded-full transition-colors" onClick={() => navigate('/projects')}>
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                            <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}>{project.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{project.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setManageTeamOpen(true)}>
                        Manage Team
                    </Button>
                    <Button variant="default" size="sm" onClick={() => setCreatePlanOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Create Plan
                    </Button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {isSidebarOpen && (
                    <ProjectSidebar
                        projectId={id || ''}
                        selectedPlanId={selectedPlanId}
                        selectedMilestoneId={selectedMilestoneId}
                        onSelectPlan={setSelectedPlanId}
                        onSelectMilestone={setSelectedMilestoneId}
                        onCreatePlan={() => setCreatePlanOpen(true)}
                        onCreateMilestone={(pid) => {
                            setMilestonePlanTarget(pid || '');
                            setCreateMilestoneOpen(true);
                        }}
                    />
                )}

                <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    {renderMainContent()}
                </main>
            </div>

            {/* Modals */}
            <CreateTaskModal
                open={createTaskOpen}
                onClose={() => setCreateTaskOpen(false)}
                onSuccess={() => {
                    fetchProject();
                    queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
                }}
                projectId={id || ''}
            />
            <CreatePlanModal
                open={createPlanOpen}
                onClose={() => setCreatePlanOpen(false)}
                onSuccess={fetchProject}
                projectId={id || ''}
            />
            <CreateMilestoneModal
                open={createMilestoneOpen}
                onClose={() => setCreateMilestoneOpen(false)}
                onSuccess={fetchProject}
                projectId={id || ''}
                planId={milestonePlanTarget || selectedPlanId || ''}
            />
            {project && (
                <ManageTeamModal
                    open={manageTeamOpen}
                    onClose={() => setManageTeamOpen(false)}
                    projectId={id || ''}
                    currentMembers={project.members || []}
                />
            )}
            {selectedTaskId && (
                <TaskDetailsDialog
                    taskId={selectedTaskId}
                    onClose={handleCloseTaskDialog}
                />
            )}
        </div>
    );
}

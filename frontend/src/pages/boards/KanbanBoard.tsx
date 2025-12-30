// import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import api from '../../lib/api';
import { TaskCard } from './TaskCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import TaskDetailsDialog from './TaskDetailsDialog';

interface KanbanBoardProps {
    projectId?: string;
    boardId?: string;
    planId?: string;
    milestoneId?: string;
}

export default function KanbanBoard({ projectId, boardId: propBoardId, planId, milestoneId }: KanbanBoardProps) {
    const params = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedTaskId = searchParams.get('task');

    // Use prop if provided, otherwise fallback to URL param
    const boardId = propBoardId || params.boardId;
    const queryClient = useQueryClient();

    // Fetch Tasks
    const { data: tasks, isLoading } = useQuery({
        queryKey: ['board-tasks', boardId, projectId, planId, milestoneId],
        queryFn: async () => {
            if (projectId || planId || milestoneId) {
                const queryParams: any = { projectId };
                if (planId) queryParams.planId = planId;
                if (milestoneId) queryParams.milestoneId = milestoneId;

                const res = await api.get('/tasks', { params: queryParams });
                return res.data.data;
            } else if (boardId) {
                const res = await api.get(`/boards/${boardId}/tasks`);
                return res.data;
            }
            return [];
        },
        enabled: !!boardId || !!projectId || !!planId || !!milestoneId
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ taskId, status }: { taskId: string, status: string }) => {
            return await api.patch(`/tasks/${taskId}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
        }
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const taskId = active.id as string;
        const newStatus = over.id as string;
        updateStatusMutation.mutate({ taskId, status: newStatus });
    };

    const columns = [
        { id: 'TODO', title: 'To Do' },
        { id: 'IN_PROGRESS', title: 'In Progress' },
        { id: 'IN_REVIEW', title: 'In Review' },
        { id: 'DONE', title: 'Done' },
    ];

    const getTasksByStatus = (status: string) => {
        return tasks?.filter((task: any) => task.status === status) || [];
    };

    const handleCloseDialog = () => {
        setSearchParams({});
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading tasks...</div>;
    }

    return (
        <>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {columns.map((column) => (
                        <Card key={column.id} className="bg-muted/20 min-w-[280px] w-80 flex-shrink-0">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex justify-between items-center">
                                    {column.title}
                                    <span className="text-xs text-muted-foreground font-normal">
                                        {getTasksByStatus(column.id).length}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="min-h-[400px]">
                                {getTasksByStatus(column.id).map((task: any) => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </DndContext>

            {selectedTaskId && (
                <TaskDetailsDialog
                    taskId={selectedTaskId}
                    onClose={handleCloseDialog}
                />
            )}
        </>
    );
}

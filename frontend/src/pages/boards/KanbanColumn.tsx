// import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
    id: string;
    title: string;
    tasks: any[];
}

export function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div className="flex flex-col h-full min-w-[280px] w-[280px] bg-muted/30 rounded-lg border ml-3 first:ml-0">
            <div className="p-3 font-semibold text-sm flex justify-between items-center border-b bg-background/50 rounded-t-lg">
                <span>{title}</span>
                <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{tasks.length}</span>
            </div>

            <div ref={setNodeRef} className="flex-1 p-2 overflow-y-auto">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="h-24 w-full border-2 border-dashed rounded-lg flex items-center justify-center text-xs text-muted-foreground opacity-50">
                        No tasks
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'; // Assuming these exist or will use standard UI
import { Button } from '../../components/ui/button';
import { Plus, Settings } from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import TaskListView from './TaskListView';
import CreateTaskDialog from './CreateTaskDialog';
import TaskDetailsDialog from './TaskDetailsDialog';

export default function BoardPage() {
    const { boardId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const taskId = searchParams.get('task');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('kanban');

    const { data: board, isLoading } = useQuery({
        queryKey: ['board', boardId],
        queryFn: async () => {
            const res = await api.get(`/boards/${boardId}`);
            return res.data;
        }
    });

    // Placeholder for handleCloseTask, assuming it will be defined elsewhere or removed if not needed for taskId
    const handleCloseTask = () => {
        setSearchParams({}); // Clear task param
    };

    if (isLoading) return <div className="p-8">Loading board...</div>;
    if (!board) return <div className="p-8">Board not found</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] space-y-6 overflow-hidden">
            <div className="flex justify-between items-center px-1">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{board.name}</h1>
                    <p className="text-muted-foreground">{board.description || "Project Board"}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </Button>
                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Task
                    </Button>
                </div>
            </div>

            {/* Main Board Content */}
            <div className="bg-background border rounded-lg flex flex-col flex-1 overflow-hidden">
                <div className="border-b px-4 py-2 bg-muted/10">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('kanban')}
                            className={`pb-2 border-b-2 px-1 text-sm font-medium transition-colors ${activeTab === 'kanban' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            Kanban
                        </button>
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`pb-2 border-b-2 px-1 text-sm font-medium transition-colors ${activeTab === 'list' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`pb-2 border-b-2 px-1 text-sm font-medium transition-colors ${activeTab === 'calendar' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            Calendar
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden p-4 bg-muted/5">
                    {activeTab === 'kanban' && <KanbanBoard />}
                    {activeTab === 'list' && <TaskListView />}
                    {activeTab === 'calendar' && <div>Calendar View (Coming Soon)</div>}
                </div>
            </div>

            {taskId && (
                <TaskDetailsDialog
                    taskId={taskId}
                    onClose={handleCloseTask}
                />
            )}

            <CreateTaskDialog
                boardId={boardId!}
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
            />
        </div>
    );
}

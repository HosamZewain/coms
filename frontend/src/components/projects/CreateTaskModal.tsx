import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Loader2 } from 'lucide-react';
import api from '../../lib/api';

interface CreateTaskModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    projectId: string;
    defaultMilestoneId?: string;
    defaultPlanId?: string;
}

export default function CreateTaskModal({ open, onClose, onSuccess, projectId, defaultMilestoneId, defaultPlanId }: CreateTaskModalProps) {
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectId: projectId,
        planId: defaultPlanId || '',
        milestoneId: defaultMilestoneId || '',
        assigneeId: '',
        priority: 'MEDIUM',
        dueDate: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!projectId) return;
            try {
                const [membersRes, plansRes] = await Promise.all([
                    api.get(`/projects/${projectId}/members`),
                    api.get(`/projects/${projectId}/plans`)
                ]);

                const members = membersRes.data.data || membersRes.data;
                const projectPlans = plansRes.data.data || plansRes.data;

                setEmployees(members || []);
                setPlans(projectPlans || []);

                // Auto-select logic
                if (defaultPlanId) {
                    setFormData(prev => ({ ...prev, planId: defaultPlanId }));
                } else {
                    const activePlan = projectPlans?.find((p: any) => p.status === 'ACTIVE');
                    if (activePlan) {
                        setFormData(prev => ({ ...prev, planId: activePlan.id }));
                    }
                }

                if (defaultMilestoneId) {
                    setFormData(prev => ({ ...prev, milestoneId: defaultMilestoneId }));
                }

            } catch (error) {
                console.error('Failed to fetch project data', error);
            }
        };
        if (open) fetchData();
    }, [open, projectId, defaultPlanId, defaultMilestoneId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (!formData.planId) {
            alert('Please select a plan.');
            setLoading(false);
            return;
        }
        if (!formData.milestoneId) {
            alert('Please select a milestone.');
            setLoading(false);
            return;
        }
        try {
            const payload = {
                ...formData,
                projectId,
                assigneeIds: formData.assigneeId ? [formData.assigneeId] : []
            };
            await api.post('/tasks', payload);
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                title: '',
                description: '',
                projectId: projectId,
                planId: '',
                milestoneId: '',
                assigneeId: '',
                priority: 'MEDIUM',
                dueDate: ''
            });
        } catch (error) {
            console.error('Failed to create task', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <p className="text-sm text-muted-foreground">Add a new task to your project plan.</p>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Task Title</Label>
                        <Input
                            id="title"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="plan">Plan <span className="text-red-500">*</span></Label>
                        <Select value={formData.planId} onValueChange={(val) => setFormData({ ...formData, planId: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                            <SelectContent>
                                {plans.map((plan: any) => (
                                    <SelectItem key={plan.id} value={plan.id}>
                                        {plan.name} {plan.status === 'ARCHIVED' ? '(Archived)' : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {plans.length === 0 && (
                            <p className="text-xs text-red-500">You must create a Plan first.</p>
                        )}
                    </div>

                    {formData.planId && (
                        <div className="space-y-2">
                            <Label htmlFor="milestone">Milestone <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.milestoneId}
                                onValueChange={(val) => setFormData({ ...formData, milestoneId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a milestone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {plans.find((p: any) => p.id === formData.planId)?.milestones?.map((m: any) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {(!plans.find((p: any) => p.id === formData.planId)?.milestones?.length) && (
                                <p className="text-xs text-yellow-600">This plan has no milestones. You should create one first.</p>
                            )}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="CRITICAL">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="assignee">Assignee</Label>
                        <Select value={formData.assigneeId} onValueChange={(val) => setFormData({ ...formData, assigneeId: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select member" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((emp: any) => {
                                    const userId = emp.user?.id || emp.id;
                                    const firstName = emp.user?.firstName || emp.firstName || '';
                                    const lastName = emp.user?.lastName || emp.lastName || '';
                                    return (
                                        <SelectItem key={userId} value={userId}>
                                            {firstName} {lastName}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                            id="dueDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Task
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

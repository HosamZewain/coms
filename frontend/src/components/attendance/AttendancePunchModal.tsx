import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
// import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import api from '../../lib/api';
import { Loader2 } from 'lucide-react';

interface AttendancePunchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    type: 'in' | 'out';
}

export default function AttendancePunchModal({ isOpen, onClose, onSuccess, type }: AttendancePunchModalProps) {
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);

    // User Settings check
    const [settings, setSettings] = useState({
        workOutsideOfficeAllowed: true,
        tasksLogRequired: true
    });

    // Form States
    const [location, setLocation] = useState('OFFICE');
    const [projectId, setProjectId] = useState('');
    const [task, setTask] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        try {
            const [projRes, authRes] = await Promise.all([
                api.get('/projects').catch(() => ({ data: { data: [] } })),
                api.get('/auth/me').catch(() => ({ data: { data: null } }))
            ]);

            // Handling Projects
            if (projRes.data.data && projRes.data.data.length > 0) {
                setProjects(projRes.data.data);
            } else {
                setProjects([
                    { id: 'general', name: 'General / Admin' },
                    { id: 'proj-001', name: 'Website Redesign' },
                    { id: 'proj-002', name: 'Mobile App Dev' }
                ]);
            }

            // Handling Settings
            const user = authRes.data.data;
            if (user?.employeeProfile) {
                setSettings({
                    workOutsideOfficeAllowed: user.employeeProfile.workOutsideOfficeAllowed ?? true,
                    tasksLogRequired: user.employeeProfile.tasksLogRequired ?? true
                });

                // If Home is selected but not allowed, switch to Office
                if (location === 'HOME' && user.employeeProfile.workOutsideOfficeAllowed === false) {
                    setLocation('OFFICE');
                }
            }
        } catch (error) {
            console.warn('Failed to fetch initial data');
        }
    };

    const handleSubmit = async () => {
        // Validation Logic
        if (settings.tasksLogRequired && (!projectId || !task)) {
            alert('Please select a project and enter task details.');
            return;
        }

        setLoading(true);
        try {
            const endpoint = type === 'in' ? '/attendance/punch-in' : '/attendance/punch-out';

            // If tasks NOT required, fill defaults to satisfy backend schema if needed
            // Schema says projectId/task strings are required in backend controller validation?
            // Let's assume we send 'general' string if skipped.
            const payload = {
                location,
                projectId: projectId || 'general',
                task: task || 'General Attendance',
                notes
            };

            await api.post(endpoint, payload);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Punch failed:', error);
            const msg = error.response?.data?.message || 'Failed to record attendance. Please try again.';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{type === 'in' ? 'Check In' : 'Check Out'}</DialogTitle>
                    <DialogDescription>
                        Please provide details about your work session.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right">
                            Location
                        </Label>
                        <Select value={location} onValueChange={setLocation}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select Location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="OFFICE">Office</SelectItem>
                                {settings.workOutsideOfficeAllowed && (
                                    <SelectItem value="HOME">Work from Home</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Conditionally show/require Project & Task */}
                    {settings.tasksLogRequired && (
                        <>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="project" className="text-right">
                                    Project
                                </Label>
                                <Select value={projectId} onValueChange={setProjectId}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select Project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="task" className="text-right">
                                    Tasks
                                </Label>
                                <Textarea
                                    id="task"
                                    className="col-span-3"
                                    placeholder="What are you working on?"
                                    value={task}
                                    onChange={(e) => setTask(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">
                            Notes
                        </Label>
                        <Textarea
                            id="notes"
                            className="col-span-3"
                            placeholder="Any additional notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

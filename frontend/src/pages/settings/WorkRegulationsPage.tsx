import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Plus, Pencil, Trash2, Clock } from 'lucide-react';
import api from '../../lib/api';
import WorkRegulationFormModal from './WorkRegulationFormModal';

interface WorkRegulation {
    id: string;
    name: string;
    description?: string;
    workingDays: string[];
    startTime: string;
    flexibleHours: number;
    workingHours: number;
    normalLeaveCredit: number;
    casualLeaveCredit: number;
    sickLeaveCredit: number;
    _count?: {
        employees: number;
    };
}

export default function WorkRegulationsPage() {
    const [regulations, setRegulations] = useState<WorkRegulation[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRegulation, setSelectedRegulation] = useState<WorkRegulation | null>(null);

    const fetchRegulations = async () => {
        setLoading(true);
        try {
            const res = await api.get('/hr/regulations'); // Ensure backend includes employee count if possible, or ignore for now
            setRegulations(res.data.data);
        } catch (error) {
            console.error('Failed to fetch regulations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegulations();
    }, []);

    const handleEdit = (reg: WorkRegulation) => {
        setSelectedRegulation(reg);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedRegulation(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this regulation?')) return;
        try {
            await api.delete(`/hr/regulations/${id}`);
            fetchRegulations();
        } catch (error) {
            console.error('Failed to delete:', error);
            alert('Failed to delete regulation. It might be assigned to employees.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Work Regulations</h2>
                    <p className="text-muted-foreground">Manage work shifts, hours, and leave policies.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Regulation
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {regulations.map((reg) => (
                    <Card key={reg.id} className="relative overflow-hidden">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg font-semibold">{reg.name}</CardTitle>
                                    <CardDescription className="flex items-center mt-1">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {reg.startTime} ({reg.workingHours}h)
                                    </CardDescription>
                                </div>
                                <div className="flex space-x-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(reg)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(reg.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Working Days</h4>
                                <div className="flex flex-wrap gap-1">
                                    {reg.workingDays.map(day => (
                                        <Badge key={day} variant="secondary" className="text-xs">{day.slice(0, 3)}</Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="p-2 rounded bg-muted/50">
                                    <span className="text-muted-foreground block text-xs">Flexible</span>
                                    <span className="font-medium">{reg.flexibleHours ? `${reg.flexibleHours}m` : 'None'}</span>
                                </div>
                                <div className="p-2 rounded bg-muted/50">
                                    <span className="text-muted-foreground block text-xs">Total Leave</span>
                                    <span className="font-medium">{(reg.normalLeaveCredit || 0) + (reg.casualLeaveCredit || 0) + (reg.sickLeaveCredit || 0)} Days</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {regulations.length === 0 && !loading && (
                <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed text-muted-foreground">
                    No work regulations found. Create one to get started.
                </div>
            )}

            <WorkRegulationFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchRegulations}
                regulationToEdit={selectedRegulation}
            />
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Trophy, Plus, Calendar, Loader2 } from 'lucide-react';

interface Award {
    id: string;
    awardType: { name: string; description: string };
    date: string;
    note: string;
    user: { firstName: string; lastName: string };
}

interface AwardType {
    id: string;
    name: string;
}

interface Employee {
    id: string;
    firstName: string;
    lastName: string;
}

export default function AwardsPage() {
    const { user } = useAuthStore();
    const [awards, setAwards] = useState<Award[]>([]);
    const [loading, setLoading] = useState(false);

    // Management State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [awardTypes, setAwardTypes] = useState<AwardType[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        employeeId: '',
        awardTypeId: '',
        date: new Date().toISOString().split('T')[0],
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear().toString(),
        note: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const isManager = ['Admin', 'HR', 'Manager', 'Director'].includes(user?.role?.name || '');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/hr/awards');
            setAwards(res.data.data);
        } catch (error) {
            console.error('Failed to fetch awards:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFormData = async () => {
        try {
            const [typesRes, empsRes] = await Promise.all([
                api.get('/hr/award-types'),
                api.get('/employees')
            ]);
            setAwardTypes(typesRes.data.data);
            setEmployees(empsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch form data:', error);
        }
    };

    useEffect(() => {
        fetchData();
        if (isManager) {
            fetchFormData();
        }
    }, [user]);

    const handleGiveAward = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/hr/awards', formData);
            setIsDialogOpen(false);
            fetchData();
            // Reset crucial fields
            setFormData(prev => ({ ...prev, note: '', employeeId: '', awardTypeId: '' }));
        } catch (error) {
            console.error('Failed to give award:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Filter awards: If employee, only show mine. If manager, show all.
    // Ideally backend handles this via /my-awards vs /awards, but current endpoint is generic /awards.
    // Assuming /hr/awards returns ALL for admin and only MINE for employee if authorized correctly.
    // Let's assume the controller handles filtering or we filter here if needed.
    // For now showing what backend returns.

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Awards & Recognition</h2>
                    <p className="text-muted-foreground">Celebrate achievements and milestones.</p>
                </div>
                {isManager && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Give Award
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Give an Award</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleGiveAward} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Employee</Label>
                                    <Select
                                        value={formData.employeeId}
                                        onValueChange={(val) => setFormData({ ...formData, employeeId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map(emp => (
                                                <SelectItem key={emp.id} value={emp.id}>
                                                    {emp.firstName} {emp.lastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Award Type</Label>
                                    <Select
                                        value={formData.awardTypeId}
                                        onValueChange={(val) => setFormData({ ...formData, awardTypeId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Award Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {awardTypes.map(type => (
                                                <SelectItem key={type.id} value={type.id}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Month/Year</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Month"
                                                value={formData.month}
                                                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                            />
                                            <Input
                                                placeholder="Year"
                                                value={formData.year}
                                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Note / Citation</Label>
                                    <Textarea
                                        placeholder="Reason for the award..."
                                        value={formData.note}
                                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Give Award
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : awards.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No awards found.
                    </div>
                ) : (
                    awards.map((award) => (
                        <Card key={award.id} className="relative overflow-hidden border-yellow-200 bg-gradient-to-br from-white to-yellow-50">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Trophy className="h-24 w-24 text-yellow-500" />
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    <span className="text-xs font-semibold text-yellow-600 uppercase tracking-wider">
                                        {award.awardType.name}
                                    </span>
                                </div>
                                <CardTitle className="text-xl">
                                    {award.user.firstName} {award.user.lastName}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(award.date).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="italic text-muted-foreground text-sm">
                                    "{award.note}"
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

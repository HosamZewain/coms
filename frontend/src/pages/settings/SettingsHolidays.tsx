
import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Trash2, Plus, RefreshCw } from 'lucide-react';
import api from '../../lib/api';

interface Holiday {
    id: string;
    name: string;
    date: string;
    isRecurring: boolean;
}

export default function SettingsHolidays() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const res = await api.get('/holidays');
            setHolidays(res.data.data);
        } catch (error) {
            console.error('Failed to fetch holidays:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    const handleCreate = () => {
        setName('');
        setDate('');
        setIsRecurring(false);
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!name || !date) return;
        setSaving(true);
        try {
            await api.post('/holidays', { name, date, isRecurring });
            setIsDialogOpen(false);
            fetchHolidays();
        } catch (error) {
            console.error('Failed to create holiday:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this holiday?')) return;
        try {
            await api.delete(`/holidays/${id}`);
            fetchHolidays();
        } catch (error) {
            console.error('Failed to delete holiday:', error);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle>Company Holidays</CardTitle>
                    <CardDescription>
                        Manage official company holidays and recurring annual events.
                    </CardDescription>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Holiday
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Holiday Name</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {holidays.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No holidays found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                holidays.map((holiday) => (
                                    <TableRow key={holiday.id}>
                                        <TableCell className="font-medium flex items-center">
                                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {holiday.name}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(holiday.date), 'PPP')}
                                        </TableCell>
                                        <TableCell>
                                            {holiday.isRecurring && (
                                                <Badge variant="secondary" className="gap-1">
                                                    <RefreshCw className="h-3 w-3" />
                                                    Recurring
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(holiday.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Holiday</DialogTitle>
                        <DialogDescription>
                            Create a new holiday entry. Recurring holidays repeat every year.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Holiday Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. New Year's Day"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <Switch
                                id="recurring"
                                checked={isRecurring}
                                onCheckedChange={setIsRecurring}
                            />
                            <Label htmlFor="recurring">Recurs Annually</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving || !name || !date}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Holiday
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

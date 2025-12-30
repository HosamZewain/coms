import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, Plus, Trophy } from 'lucide-react';
import api from '../../lib/api';

interface AwardType {
    id: string;
    name: string;
    description: string;
}

export default function AwardsSetupPage() {
    const [awardTypes, setAwardTypes] = useState<AwardType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const fetchAwardTypes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/hr/award-types');
            setAwardTypes(res.data.data);
        } catch (error) {
            console.error('Failed to fetch award types:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAwardTypes();
    }, []);

    const handleCreate = () => {
        setName('');
        setDescription('');
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!name) return;
        setSaving(true);
        try {
            await api.post('/hr/award-types', { name, description });
            setIsDialogOpen(false);
            fetchAwardTypes();
        } catch (error) {
            console.error('Failed to create award type:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Awards Setup</h2>
                    <p className="text-muted-foreground">Define the types of awards (e.g., Employee of the Month) available.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Award Type
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Award Types</CardTitle>
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
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {awardTypes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                            No award types defined.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    awardTypes.map((award) => (
                                        <TableRow key={award.id}>
                                            <TableCell className="font-medium flex items-center">
                                                <Trophy className="mr-2 h-4 w-4 text-yellow-500" />
                                                {award.name}
                                            </TableCell>
                                            <TableCell>{award.description}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Award Type</DialogTitle>
                        <DialogDescription>
                            Enter the name and description of the new award category.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Award Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Employee of the Month"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc">Description</Label>
                            <Input
                                id="desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving || !name}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

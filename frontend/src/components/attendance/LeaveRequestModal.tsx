import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import api from '../../lib/api';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface LeaveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
}

export default function LeaveRequestModal({ isOpen, onClose, userId }: LeaveRequestModalProps) {
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState('NORMAL');
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [reason, setReason] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        setLoading(true);
        try {
            await api.post('/leaves', {
                userId,
                type,
                startDate,
                endDate,
                reason,
                status: 'APPROVED' // Admin action implies approval
            });
            onClose();
        } catch (error) {
            console.error('Failed to add leave:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Leave Record</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Leave Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NORMAL">Normal / Annual</SelectItem>
                                <SelectItem value="CASUAL">Casual</SelectItem>
                                <SelectItem value="SICK">Sick</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Reason</Label>
                        <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for leave" />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Leave'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

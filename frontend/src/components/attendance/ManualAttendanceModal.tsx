import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import api from '../../lib/api';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface ManualAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
}

export default function ManualAttendanceModal({ isOpen, onClose, userId }: ManualAttendanceModalProps) {
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [checkIn, setCheckIn] = useState('09:00');
    const [checkOut, setCheckOut] = useState('17:00');
    const [note, setNote] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        setLoading(true);
        try {
            await api.post('/attendance/manual', {
                userId,
                date,
                checkInTime: checkIn,
                checkOutTime: checkOut,
                note
            });
            onClose();
        } catch (error) {
            console.error('Failed to add attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Manual Attendance</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Check In</Label>
                            <Input type="time" value={checkIn} onChange={e => setCheckIn(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Check Out</Label>
                            <Input type="time" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Note</Label>
                        <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Reason for manual entry" />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Record'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

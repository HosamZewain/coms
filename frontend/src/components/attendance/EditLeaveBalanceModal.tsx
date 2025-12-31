import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Loader2, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

interface EditLeaveBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export default function EditLeaveBalanceModal({ isOpen, onClose, userId }: EditLeaveBalanceModalProps) {
    const [loading, setLoading] = useState(false);
    const [balances, setBalances] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchBalances();
        }
    }, [isOpen, userId]);

    const fetchBalances = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/leaves/${userId}/balance`);
            setBalances(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load balances');
        } finally {
            setLoading(false);
        }
    };

    const handleBalanceChange = (leaveTypeId: string, newValue: string) => {
        setBalances(prev => prev.map(b =>
            b.leaveTypeId === leaveTypeId ? { ...b, balance: newValue } : b
        ));
    };

    const handleSave = async (leaveTypeId: string, newBalance: number) => {
        // Optimistic update handled by local state, but we need to send individual updates
        // or bulk? The API we designed is single update. 
        // For this UI, let's just save one by one if they changed?
        // Or actually, simpler UX: just save the one next to the button? 
        // No, usually "Save Changes" at bottom.
        // Let's iterate and save all changed ones.

        // Actually, for simplicity and robustness, let's saving individual lines be the trigger?
        // No, standard form behavior is better.

        try {
            await api.patch(`/leaves/${userId}/balance`, {
                leaveTypeId,
                balance: newBalance
            });
        } catch (error) {
            console.error('Failed to save balance', error);
            throw error;
        }
    };

    const handleSaveAll = async () => {
        setLoading(true);
        try {
            await Promise.all(balances.map(b =>
                api.patch(`/leaves/${userId}/balance`, {
                    leaveTypeId: b.leaveTypeId,
                    balance: parseFloat(b.balance)
                })
            ));
            onClose();
        } catch (err) {
            setError('Failed to save some changes');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Leave Balances</DialogTitle>
                    <DialogDescription>
                        Manually adjust the remaining leave days for this employee.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="flex items-center gap-2 p-2 text-sm text-red-600 bg-red-50 rounded">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <div className="py-4 space-y-4">
                    {loading && balances.length === 0 ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : (
                        balances.map((balance) => (
                            <div key={balance.leaveTypeId} className="grid grid-cols-4 items-center gap-4">
                                <Label className="col-span-2 text-right">
                                    {balance.leaveType.name}
                                </Label>
                                <Input
                                    type="number"
                                    className="col-span-2"
                                    value={balance.balance}
                                    onChange={(e) => handleBalanceChange(balance.leaveTypeId, e.target.value)}
                                />
                            </div>
                        ))
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSaveAll} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

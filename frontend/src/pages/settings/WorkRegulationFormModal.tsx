import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import api from '../../lib/api';
import { Loader2, X } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

interface WorkRegulation {
    id?: string;
    name: string;
    description?: string;
    workingDays: string[];
    startTime: string;
    flexibleHours: number;
    workingHours: number;
    normalLeaveCredit: number;
    casualLeaveCredit: number;
    sickLeaveCredit: number;
}

interface WorkRegulationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    regulationToEdit?: WorkRegulation | null;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0') + ':00');

export default function WorkRegulationFormModal({ isOpen, onClose, onSuccess, regulationToEdit }: WorkRegulationFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<WorkRegulation>({
        name: '',
        workingDays: [],
        startTime: '09:00',
        flexibleHours: 0,
        workingHours: 8,
        normalLeaveCredit: 0,
        casualLeaveCredit: 0,
        sickLeaveCredit: 0
    });

    useEffect(() => {
        if (regulationToEdit) {
            setFormData(regulationToEdit);
        } else {
            setFormData({
                name: '',
                workingDays: [],
                startTime: '09:00',
                flexibleHours: 0,
                workingHours: 8,
                normalLeaveCredit: 0,
                casualLeaveCredit: 0,
                sickLeaveCredit: 0
            });
        }
    }, [regulationToEdit, isOpen]);

    const handleDayToggle = (day: string) => {
        setFormData(prev => {
            if (prev.workingDays.includes(day)) {
                return { ...prev, workingDays: prev.workingDays.filter(d => d !== day) };
            } else {
                return { ...prev, workingDays: [...prev.workingDays, day] };
            }
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (regulationToEdit?.id) {
                await api.put(`/hr/regulations/${regulationToEdit.id}`, formData);
            } else {
                await api.post('/hr/regulations', formData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save regulation:', error);
            alert('Failed to save. Please check inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{regulationToEdit ? 'Edit Work Regulation' : 'New Work Regulation'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">

                    {/* Title */}
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Standard Shift"
                        />
                    </div>

                    {/* Days */}
                    <div className="space-y-2">
                        <Label>Days</Label>
                        <div className="border rounded-md p-3 flex flex-wrap gap-2">
                            {formData.workingDays.map(day => (
                                <Badge key={day} variant="secondary" className="gap-1 pl-2">
                                    {day}
                                    <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => handleDayToggle(day)} />
                                </Badge>
                            ))}
                            <Select onValueChange={handleDayToggle}>
                                <SelectTrigger className="w-[120px] h-7 text-xs border-dashed bg-transparent">
                                    <SelectValue placeholder="+ Add Day" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAYS_OF_WEEK.filter(d => !formData.workingDays.includes(d)).map(day => (
                                        <SelectItem key={day} value={day}>{day}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Start Hour */}
                    <div className="space-y-2">
                        <Label>Attendance Start Hour</Label>
                        <Select
                            value={formData.startTime}
                            onValueChange={(val) => setFormData({ ...formData, startTime: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Time" />
                            </SelectTrigger>
                            <SelectContent>
                                {HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Flexible Allowance */}
                    <div className="space-y-2">
                        <Label>Attendance Flexible Allowance</Label>
                        <Select
                            value={formData.flexibleHours.toString()}
                            onValueChange={(val) => setFormData({ ...formData, flexibleHours: parseInt(val) })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Allowance" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">None</SelectItem>
                                <SelectItem value="30">30 Minutes</SelectItem>
                                <SelectItem value="60">1 Hour</SelectItem>
                                <SelectItem value="120">2 Hours</SelectItem>
                                <SelectItem value="180">3 Hours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Working Hours */}
                    <div className="space-y-2">
                        <Label>Working Hours</Label>
                        <Select
                            value={formData.workingHours.toString()}
                            onValueChange={(val) => setFormData({ ...formData, workingHours: parseInt(val) })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Hours" />
                            </SelectTrigger>
                            <SelectContent>
                                {[4, 5, 6, 7, 8, 9, 10, 12].map(h => (
                                    <SelectItem key={h} value={h.toString()}>{h} Hours</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Leave Credits */}
                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-medium text-sm text-gray-500">Leave Configuration</h4>

                        <div className="space-y-2">
                            <Label>Normal Leave Credit (Days)</Label>
                            <Input
                                type="number"
                                value={formData.normalLeaveCredit}
                                onChange={(e) => setFormData({ ...formData, normalLeaveCredit: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Casual Leave Credit (Days)</Label>
                            <Input
                                type="number"
                                value={formData.casualLeaveCredit}
                                onChange={(e) => setFormData({ ...formData, casualLeaveCredit: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Sick Leave Credit (Days)</Label>
                            <Input
                                type="number"
                                value={formData.sickLeaveCredit}
                                onChange={(e) => setFormData({ ...formData, sickLeaveCredit: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

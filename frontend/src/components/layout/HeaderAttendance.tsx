import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Clock, PlayCircle, StopCircle } from 'lucide-react';
import { useAttendanceStore } from '../../store/attendance.store';
import AttendancePunchModal from '../attendance/AttendancePunchModal';
import { useAuthStore } from '../../store/auth.store';

export default function HeaderAttendance() {
    const { isCheckedIn, checkInTime, fetchStatus, refresh } = useAttendanceStore();
    const { checkPermission } = useAuthStore();
    const [timer, setTimer] = useState('00:00:00');
    const [showPunchModal, setShowPunchModal] = useState(false);

    // Initial fetch
    useEffect(() => {
        if (checkPermission('attendance', 'view')) {
            fetchStatus();
        }
    }, []);

    // Timer logic
    useEffect(() => {
        let interval: any; // NodeJS.Timeout;

        if (isCheckedIn && checkInTime) {
            const updateTimer = () => {
                const start = new Date(checkInTime).getTime();
                const now = new Date().getTime();
                const diff = now - start;

                if (diff >= 0) {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                    setTimer(
                        `${hours.toString().padStart(2, '0')}:${minutes
                            .toString()
                            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                    );
                }
            };

            updateTimer();
            interval = setInterval(updateTimer, 1000);
        } else {
            setTimer('00:00:00');
        }

        return () => clearInterval(interval);
    }, [isCheckedIn, checkInTime]);

    const handlePunchSuccess = async () => {
        await refresh();
        // Force a page reload if we are on the attendance page to sync everything perfectly
        // But optimally, the store update should be enough if the page subscribes to it.
        // For now, let's just refresh the store.
    };

    if (!checkPermission('attendance', 'edit')) return null;

    return (
        <div className="flex items-center gap-3 mr-4">
            {isCheckedIn && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-md border border-green-100">
                    <Clock className="h-4 w-4 animate-pulse" />
                    <span className="font-mono font-medium">{timer}</span>
                </div>
            )}

            <Button
                variant={isCheckedIn ? "destructive" : "default"}
                size="sm"
                className={isCheckedIn ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                onClick={() => setShowPunchModal(true)}
            >
                {isCheckedIn ? (
                    <>
                        <StopCircle className="mr-2 h-4 w-4" />
                        Punch Out
                    </>
                ) : (
                    <>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Punch In
                    </>
                )}
            </Button>

            <AttendancePunchModal
                isOpen={showPunchModal}
                onClose={() => setShowPunchModal(false)}
                onSuccess={handlePunchSuccess}
                type={isCheckedIn ? 'out' : 'in'}
            />
        </div>
    );
}

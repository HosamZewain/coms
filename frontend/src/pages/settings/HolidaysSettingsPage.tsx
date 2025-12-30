
import SettingsHolidays from './SettingsHolidays';

export default function HolidaysSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Holidays</h2>
                <p className="text-muted-foreground">Manage organization holidays and recurring events.</p>
            </div>
            <SettingsHolidays />
        </div>
    );
}

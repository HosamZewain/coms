import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
// import { Bell, Mail, MessageSquare, Loader2, Save } from 'lucide-react';
import api from '../../lib/api';

export default function NotificationsSettingsPage() {
    const [emailNewEmployee, setEmailNewEmployee] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/company/settings?keys=notifications_new_employee');
                setEmailNewEmployee(res.data.data.notifications_new_employee || false);
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/company/settings', { notifications_new_employee: emailNewEmployee });
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
                <p className="text-muted-foreground">Manage your email and alert preferences.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>
                        Choose what you want to be notified about.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="new-employee" className="flex flex-col space-y-1">
                            <span>New Employee Onboarding</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Receive emails when a new employee joins via the portal.
                            </span>
                        </Label>
                        <Switch
                            id="new-employee"
                            checked={emailNewEmployee}
                            onCheckedChange={setEmailNewEmployee}
                        />
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

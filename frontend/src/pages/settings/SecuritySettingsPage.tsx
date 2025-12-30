import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import api from '../../lib/api';

export default function SecuritySettingsPage() {
    const [twoFactor, setTwoFactor] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/company/settings?keys=security_2fa');
                setTwoFactor(res.data.data.security_2fa || false);
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (val: boolean) => {
        setTwoFactor(val);
        setSaving(true);
        try {
            await api.put('/company/settings', { security_2fa: val });
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
                <h2 className="text-3xl font-bold tracking-tight">Security</h2>
                <p className="text-muted-foreground">Manage security and access controls.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Access Control</CardTitle>
                    <CardDescription>
                        Manage basic security settings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="2fa" className="flex flex-col space-y-1">
                            <span>Two-Factor Authentication</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Enforce 2FA for all admin accounts.
                            </span>
                        </Label>
                        <Switch
                            id="2fa"
                            checked={twoFactor}
                            onCheckedChange={handleSave}
                            disabled={saving}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

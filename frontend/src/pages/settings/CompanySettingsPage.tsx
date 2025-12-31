
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Loader2 } from 'lucide-react';
import api from '../../lib/api';

export default function CompanySettingsPage() {
    const [companyProfile, setCompanyProfile] = useState({ companyName: '', website: '', address: '' });
    const [officeIp, setOfficeIp] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const [profileRes, settingsRes] = await Promise.all([
                    api.get('/company/profile'),
                    api.get('/company/settings?keys=office_ip')
                ]);
                setCompanyProfile(profileRes.data.data || { companyName: '', website: '', address: '' });
                setOfficeIp(settingsRes.data.data.office_ip || '');
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await Promise.all([
                api.put('/company/profile', companyProfile),
                api.put('/company/settings', { office_ip: officeIp })
            ]);
            alert('Settings updated successfully!');
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Company Profile</h2>
                <p className="text-muted-foreground">Update your organization's public information.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                    <CardDescription>
                        Basic company information visible on reports and invoices.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                                id="companyName"
                                value={companyProfile.companyName}
                                onChange={(e) => setCompanyProfile({ ...companyProfile, companyName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                value={companyProfile.website}
                                onChange={(e) => setCompanyProfile({ ...companyProfile, website: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            value={companyProfile.address}
                            onChange={(e) => setCompanyProfile({ ...companyProfile, address: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Attendance Configuration</CardTitle>
                    <CardDescription>
                        Configure restrictions for attendance tracking.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="officeIp">Office IP Address</Label>
                        <Input
                            id="officeIp"
                            placeholder="e.g. 192.168.1.100 (Separate multiple IPs with commas)"
                            value={officeIp}
                            onChange={(e) => setOfficeIp(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Employees punching in from "Office" location must match this IP address. Leave empty to allow any IP.
                        </p>
                    </div>

                    <Button onClick={handleSaveProfile} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

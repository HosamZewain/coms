import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function PublicJobApplyPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        linkedinUrl: '',
        experienceYears: '',
        residence: '',
        resumeUrl: '', // Using text for now as placeholder or could be file
    });

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await api.get(`/jobs/public/${id}`);
                setJob(response.data.data);
            } catch (error) {
                console.error('Failed to fetch job:', error);
                navigate('/careers');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post(`/jobs/public/${id}/apply`, formData);
            alert('Application submitted successfully!');
            navigate('/careers');
        } catch (error) {
            console.error('Failed to submit application:', error);
            alert('Failed to submit application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!job) return <div>Job not found</div>;

    return (
        <div className="min-h-screen bg-neutral-50 p-8">
            <div className="mx-auto max-w-3xl space-y-8">
                <Button variant="ghost" className="mb-4" onClick={() => navigate('/careers')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl">{job.title}</CardTitle>
                        <CardDescription className="text-lg">
                            {job.department} • {job.location} • {job.type}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="prose max-w-none">
                            <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                            <p className="whitespace-pre-wrap text-neutral-700">{job.description}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Apply for this position</CardTitle>
                        <CardDescription>Tell us about yourself and why you'd be a great fit.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="linkedin">LinkedIn URL</Label>
                                <Input
                                    id="linkedin"
                                    type="url"
                                    placeholder="https://linkedin.com/in/..."
                                    value={formData.linkedinUrl}
                                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="experience">Years of Experience</Label>
                                    <Input
                                        id="experience"
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.experienceYears}
                                        onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="residence">Place of Residence</Label>
                                    <Input
                                        id="residence"
                                        required
                                        placeholder="City, Country"
                                        value={formData.residence}
                                        onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cv">Upload CV (PDF/Word)</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        id="cv"
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        // required // Make required when upload implemented
                                        onChange={() => {
                                            // TODO: Implement file upload
                                            // const file = e.target.files?.[0];
                                            setFormData({ ...formData, resumeUrl: 'mock-cv-url.pdf' });
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Local file upload is mocked for now.</p>
                            </div>

                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Application
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

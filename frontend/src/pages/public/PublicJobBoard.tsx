import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { MapPin, Briefcase, Building } from 'lucide-react';

export default function PublicJobBoard() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await api.get('/jobs/public');
                setJobs(response.data.data);
            } catch (error) {
                console.error('Failed to fetch jobs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 p-8">
            <div className="mx-auto max-w-5xl space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-900">Careers at TCOMS</h1>
                    <p className="mt-4 text-lg text-neutral-600">Join our team and help build the future.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.length === 0 ? (
                        <div className="col-span-full text-center text-muted-foreground">
                            No open positions at the moment. Check back later!
                        </div>
                    ) : (
                        jobs.map((job) => (
                            <Card key={job.id} className="flex flex-col transition-all hover:shadow-lg">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl">{job.title}</CardTitle>
                                        <Badge variant="secondary">{job.type}</Badge>
                                    </div>
                                    <CardDescription className="flex items-center gap-2 mt-2">
                                        <Building className="h-4 w-4" /> {job.department || 'General'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" /> {job.location || 'Remote'}
                                        <span className="mx-2">•</span>
                                        <Briefcase className="h-4 w-4" /> {job.level || 'Mid-Level'}
                                    </div>
                                    <p className="text-sm text-neutral-600 line-clamp-3">
                                        {job.description}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" onClick={() => navigate(`/careers/${job.id}`)}>
                                        View Details & Apply
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

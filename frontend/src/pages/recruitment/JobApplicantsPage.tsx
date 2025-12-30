import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Badge } from '../../components/ui/badge';
import { Loader2, ArrowLeft, Download, Linkedin, Eye, Plus } from 'lucide-react';
import ApplicantDetailsModal from '../../components/recruitment/ApplicantDetailsModal';
import AddApplicantModal from '../../components/recruitment/AddApplicantModal';

export default function JobApplicantsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState<any>(null);
    const [applicants, setApplicants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);

    const handleViewApplicant = async (applicantId: string) => {
        try {
            const response = await api.get(`/recruitment/applicants/${applicantId}`);
            setSelectedApplicant(response.data.data);
            setDetailsOpen(true);
        } catch (error) {
            console.error('Failed to fetch applicant details:', error);
        }
    };

    const fetchApplicants = async () => {
        try {
            const response = await api.get(`/jobs/${id}/applicants`);
            setApplicants(response.data.data);
        } catch (error) {
            console.error("Failed to re-fetch applicants:", error);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobRes, applicantsRes] = await Promise.all([
                    api.get(`/jobs/${id}`),
                    api.get(`/jobs/${id}/applicants`)
                ]);
                setJob(jobRes.data.data);
                setApplicants(applicantsRes.data.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!job) return <div>Job not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/recruitment')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
                        <p className="text-muted-foreground">{job.department} • {job.level} • {job.type}</p>
                    </div>
                </div>
                <Button onClick={() => setAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Applicant
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Applicants ({applicants.length})</CardTitle>
                    <CardDescription>Manage candidates who applied for this position.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Experience</TableHead>
                                <TableHead>Residence</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Resume</TableHead>
                                <TableHead>LinkedIn</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applicants.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No applicants yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                applicants.map((applicant) => (
                                    <TableRow key={applicant.id}>
                                        <TableCell className="font-medium">
                                            {applicant.firstName} {applicant.lastName}
                                        </TableCell>
                                        <TableCell>{applicant.experienceYears} Years</TableCell>
                                        <TableCell>{applicant.residence}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span>{applicant.email}</span>
                                                <span className="text-muted-foreground">{applicant.phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {applicant.resumeUrl ? (
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer">
                                                        <Download className="mr-2 h-3 w-3" /> CV
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {applicant.linkedinUrl ? (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={applicant.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                                        <Linkedin className="h-4 w-4 text-[#0077b5]" />
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{applicant.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleViewApplicant(applicant.id)}>
                                                <Eye className="h-4 w-4 mr-1" /> View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ApplicantDetailsModal
                applicant={selectedApplicant}
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                onStatusUpdate={fetchApplicants}
            />

            <AddApplicantModal
                jobId={id!}
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSuccess={() => fetchApplicants()}
            />
        </div>
    );
}

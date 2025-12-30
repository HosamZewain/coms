import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Mail, Phone, MapPin, Briefcase, Calendar, Linkedin, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import api from "../../lib/api";

interface ApplicantDetailsModalProps {
    applicant: any;
    open: boolean;
    onClose: () => void;
    onStatusUpdate?: () => void; // Callback to refresh parent
}

export default function ApplicantDetailsModal({ applicant, open, onClose, onStatusUpdate }: ApplicantDetailsModalProps) {
    const [status, setStatus] = useState(applicant?.status || 'NEW');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (applicant) {
            setStatus(applicant.status);
        }
    }, [applicant]);

    if (!applicant) return null;

    const handleStatusChange = async (newStatus: string) => {
        setUpdating(true);
        setStatus(newStatus); // Optimistic update
        try {
            await api.patch(`/recruitment/applicants/${applicant.id}/status`, { status: newStatus });
            if (onStatusUpdate) onStatusUpdate();
        } catch (error) {
            console.error("Failed to update status:", error);
            setStatus(applicant.status); // Revert on failure
        } finally {
            setUpdating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 gap-0">
                <div className="p-6 pb-2">
                    <DialogHeader className="mb-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl">{applicant.firstName} {applicant.lastName}</DialogTitle>
                                <DialogDescription className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" /> Applied for
                                    <span className="font-medium text-foreground mx-1">
                                        {applicant.job?.title || 'Unknown Role'}
                                    </span>
                                    at {applicant.job?.department || 'Unknown Dept'}
                                </DialogDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Select value={status} onValueChange={handleStatusChange} disabled={updating}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NEW">New</SelectItem>
                                        <SelectItem value="SCREENING">Screening</SelectItem>
                                        <SelectItem value="INTERVIEWING">Interviewing</SelectItem>
                                        <SelectItem value="OFFERED">Offered</SelectItem>
                                        <SelectItem value="HIRED">Hired</SelectItem>
                                        <SelectItem value="REJECTED">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </DialogHeader>
                    <Separator />
                </div>

                <div className="flex-1 overflow-hidden p-6 pt-0">
                    <ScrollArea className="h-full pr-4">
                        <div className="grid gap-6">
                            {/* Personal Info */}
                            <section>
                                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <Mail className="h-4 w-4" /> {applicant.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <Phone className="h-4 w-4" /> {applicant.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <MapPin className="h-4 w-4" /> {applicant.residence}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <Briefcase className="h-4 w-4" /> {applicant.experienceYears} Years Experience
                                    </div>
                                </div>
                            </section>

                            {/* Links */}
                            <section>
                                <h3 className="text-lg font-semibold mb-3">Documents & Links</h3>
                                <div className="flex gap-3">
                                    {applicant.resumeUrl && (
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer">
                                                <FileText className="mr-2 h-4 w-4" /> View Resume
                                            </a>
                                        </Button>
                                    )}
                                    {applicant.linkedinUrl && (
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={applicant.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                                <Linkedin className="mr-2 h-4 w-4 text-[#0077b5]" /> LinkedIn Profile
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </section>

                            {/* Interview History */}
                            <section>
                                <h3 className="text-lg font-semibold mb-3">Interview History</h3>
                                {applicant.interviews && applicant.interviews.length > 0 ? (
                                    <div className="space-y-3">
                                        {applicant.interviews.map((interview: any) => (
                                            <div key={interview.id} className="rounded-lg border p-3 text-sm">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium">{interview.type || 'General'} Interview</span>
                                                    <Badge variant="secondary">{interview.status}</Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(interview.date).toLocaleDateString()}
                                                    <span>•</span>
                                                    <span>Interviewer: {interview.interviewer?.name || 'Unknown'}</span>
                                                </div>
                                                {interview.feedback && (
                                                    <p className="bg-neutral-50 p-2 rounded text-neutral-700">
                                                        "{interview.feedback}"
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No interviews scheduled yet.</p>
                                )}
                            </section>
                        </div>
                    </ScrollArea>
                </div>

                <div className="p-6 border-t mt-auto">
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        <Button>Schedule Interview</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

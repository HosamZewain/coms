import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { FileText, Plus, ExternalLink, Loader2, Eye } from 'lucide-react';
import { getFileUrl } from '../../lib/utils';

interface Document {
    id: string;
    title: string;
    url: string;
    createdAt: string;
    viewCount: number;
    uploader: { firstName: string; lastName: string };
}

export default function DocumentsPage() {
    const { user } = useAuthStore();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);

    // Management State
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const isHR = ['Admin', 'HR'].includes(user?.role?.name || '');

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/hr/documents');
            setDocuments(res.data.data);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAddDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !file) return;

        setSubmitting(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', file);

        try {
            await api.post('/hr/documents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setIsDialogOpen(false);
            setTitle('');
            setFile(null);
            fetchDocuments();
        } catch (error) {
            console.error('Failed to add document:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleView = async (doc: Document) => {
        try {
            // Increment view count in background
            await api.post(`/hr/documents/${doc.id}/view`);
            // Optimistically update UI or re-fetch
            const updatedDocs = documents.map(d => d.id === doc.id ? { ...d, viewCount: d.viewCount + 1 } : d);
            setDocuments(updatedDocs);
        } catch (error) {
            console.error('Failed to increment view count:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Document Center</h2>
                    <p className="text-muted-foreground">Centralized repository for organization documents.</p>
                </div>
                {isHR && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Document
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Document</DialogTitle>
                                <DialogDescription>
                                    Upload a document (PDF, DOC, Image) to the repository.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddDocument} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Document Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Employee Handbook 2025"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="file">Document File</Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt,image/*"
                                        required
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Upload Document
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Organization Documents</CardTitle>
                    <CardDescription>Policies, contracts, and other resources.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Uploaded By</TableHead>
                                <TableHead>Date Added</TableHead>
                                <TableHead className="text-center">Views</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : documents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No documents available.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                documents.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium flex items-center">
                                            <FileText className="mr-2 h-4 w-4 text-primary" />
                                            {doc.title}
                                        </TableCell>
                                        <TableCell>
                                            {doc.uploader?.firstName} {doc.uploader?.lastName}
                                        </TableCell>
                                        <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                                <Eye className="w-3 h-3 mr-1" /> {doc.viewCount}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild onClick={() => handleView(doc)}>
                                                <a href={getFileUrl(doc.url)} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                                    View <ExternalLink className="ml-1 h-3 w-3" />
                                                </a>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

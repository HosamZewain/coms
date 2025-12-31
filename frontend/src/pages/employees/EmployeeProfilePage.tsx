import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    Save,
    Loader2,
    Plus,
    X,
    Upload,
    Camera
} from 'lucide-react';
import { getProfileImageUrl } from '../../lib/utils';

import ManualAttendanceModal from '../../components/attendance/ManualAttendanceModal';
import LeaveRequestModal from '../../components/attendance/LeaveRequestModal';
import EditLeaveBalanceModal from '../../components/attendance/EditLeaveBalanceModal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { CalendarPlus, Clock, MoreVertical, Wallet } from 'lucide-react';

export default function EmployeeProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [employee, setEmployee] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Modal States
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [showBalanceModal, setShowBalanceModal] = useState(false);

    const [workRegulations, setWorkRegulations] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);

    const fetchEmployee = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch employee first
            const empRes = await api.get(`/employees/${id}`);
            const empData = empRes.data.data;

            // Check if they manage their assigned dept or lead their team
            const isDeptManager = empData.department?.managerId === empData.id;
            const isTeamLeader = empData.team?.leaderId === empData.id;

            setEmployee({ ...empData, isDepartmentManager: isDeptManager, isTeamLeader: isTeamLeader });

            // Fetch metadata
            try {
                const [regRes, deptRes, teamRes] = await Promise.all([
                    api.get('/hr/regulations'),
                    api.get('/company/departments'),
                    api.get('/company/teams')
                ]);
                setWorkRegulations(regRes.data.data);
                setDepartments(deptRes.data.data);
                setTeams(teamRes.data.data);
            } catch (err) {
                console.warn('Failed to load metadata:', err);
            }
        } catch (error: any) {
            console.error('Failed to fetch data:', error);
            setError(error.response?.data?.message || error.message || 'Failed to load employee data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployee();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/employees/${id}`, employee);
            setIsEditing(false);
            fetchEmployee();
        } catch (error) {
            console.error('Failed to save employee:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        setSaving(true);
        try {
            const res = await api.post(`/employees/${id}/upload-image`, formData, {
                headers: { 'Content-Type': undefined }
            });
            // Update local state with new image URL
            // Refresh data to show new image
            fetchEmployee();
            // Also update the global auth store if looking at own profile
            const currentUserId = employee.id;
            // Optimistic update logic if needed, but page refresh or re-fetch is safer
            fetchEmployee(); // Re-fetch to be sure
            alert('Image uploaded successfully!');
        } catch (error: any) {
            console.error('Failed to upload image:', error);
            const msg = error.response?.data?.message || 'Failed to upload image. Please try again.';
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-red-600">Error Loading Profile</h2>
                <p className="text-muted-foreground mt-2">{error}</p>
                <Button variant="link" onClick={() => navigate('/employees')} className="mt-4">Back to List</Button>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold">Employee not found</h2>
                <Button variant="link" onClick={() => navigate('/employees')}>Back to List</Button>
            </div>
        );
    }

    const initials = `${employee.firstName[0]}${employee.lastName[0]}`;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/employees')} className="pl-0">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Employees
                </Button>
                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <MoreVertical className="h-4 w-4 mr-2" />
                                Actions
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Manage</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => setShowLeaveModal(true)}>
                                <CalendarPlus className="mr-2 h-4 w-4" />
                                Add Leave
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setShowAttendanceModal(true)}>
                                <Clock className="mr-2 h-4 w-4" />
                                Add Attendance
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setShowBalanceModal(true)}>
                                <Wallet className="mr-2 h-4 w-4" />
                                Edit Balances
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="col-span-1">
                    <CardContent className="pt-6 text-center space-y-4">
                        <Avatar className="h-32 w-32 mx-auto">
                            <AvatarImage src={getProfileImageUrl(employee.employeeProfile?.profileImage)} />
                            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                        </Avatar>
                        {isEditing && (
                            <div className="flex justify-center">
                                <label htmlFor="image-upload" className="cursor-pointer">
                                    <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                                        <Camera className="h-4 w-4" />
                                        <span>Change Photo</span>
                                    </div>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={saving}
                                    />
                                </label>
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h2>
                            <p className="text-muted-foreground">{employee.employeeProfile?.jobTitle || 'No Title Set'}</p>
                        </div>
                        <div className="flex justify-center gap-2">
                            <Badge variant="outline">{employee.role?.name}</Badge>
                            <Badge variant="secondary">Active</Badge>
                        </div>
                        <div className="pt-4 space-y-2 text-sm text-left">
                            <div className="flex items-center text-muted-foreground">
                                <Mail className="mr-2 h-4 w-4" /> {employee.email}
                            </div>
                            <div className="flex items-center text-muted-foreground">
                                <Phone className="mr-2 h-4 w-4" /> {employee.employeeProfile?.phoneNumber || 'N/A'}
                            </div>
                            <div className="flex items-center text-muted-foreground">
                                <Briefcase className="mr-2 h-4 w-4" /> {employee.department?.name || 'No Department'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Section */}
                <div className="col-span-2 space-y-6">
                    <Tabs defaultValue="overview">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="work">Work Details</TabsTrigger>
                            <TabsTrigger value="personal">Personal Info</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Biography</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isEditing ? (
                                        <Textarea
                                            value={employee.employeeProfile?.bio || ''}
                                            onChange={(e) => setEmployee({
                                                ...employee,
                                                employeeProfile: { ...employee.employeeProfile, bio: e.target.value }
                                            })}
                                            placeholder="Tell us about this employee..."
                                            className="min-h-[100px]"
                                        />
                                    ) : (
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            {employee.employeeProfile?.bio || 'No biography provided.'}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Skills</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {(employee.employeeProfile?.skills || []).map((skill: string, index: number) => (
                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                {skill}
                                                {isEditing && (
                                                    <X className="h-3 w-3 cursor-pointer" onClick={() => {
                                                        const newSkills = [...employee.employeeProfile.skills];
                                                        newSkills.splice(index, 1);
                                                        setEmployee({
                                                            ...employee,
                                                            employeeProfile: { ...employee.employeeProfile, skills: newSkills }
                                                        });
                                                    }} />
                                                )}
                                            </Badge>
                                        ))}
                                        {isEditing && (
                                            <Button variant="outline" size="sm" className="h-6 py-0 px-2 text-xs" onClick={() => {
                                                const skill = prompt('Enter new skill:');
                                                if (skill) {
                                                    const newSkills = [...(employee.employeeProfile.skills || []), skill];
                                                    setEmployee({
                                                        ...employee,
                                                        employeeProfile: { ...employee.employeeProfile, skills: newSkills }
                                                    });
                                                }
                                            }}>
                                                <Plus className="h-3 w-3 mr-1" /> Add Skill
                                            </Button>
                                        )}
                                        {!isEditing && (employee.employeeProfile?.skills || []).length === 0 && (
                                            <span className="text-sm text-muted-foreground italic">No skills listed.</span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="work" className="space-y-4 mt-4">
                            <Card>
                                <CardContent className="pt-6 grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Job Title</Label>
                                        <Input
                                            disabled={!isEditing}
                                            value={employee.employeeProfile?.jobTitle || ''}
                                            onChange={(e) => setEmployee({
                                                ...employee,
                                                employeeProfile: { ...employee.employeeProfile, jobTitle: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Joining Date</Label>
                                        <div className="flex items-center">
                                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span>{employee.employeeProfile?.joiningDate ? new Date(employee.employeeProfile.joiningDate).toLocaleDateString() : 'Not Set'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Assignment Role</Label>
                                        {isEditing ? (
                                            <Select
                                                value={
                                                    employee.isDepartmentManager ? 'dept_manager' :
                                                        employee.isTeamLeader ? 'team_leader' : 'employee'
                                                }
                                                onValueChange={(val) => {
                                                    setEmployee({
                                                        ...employee,
                                                        isDepartmentManager: val === 'dept_manager',
                                                        isTeamLeader: val === 'team_leader',
                                                        teamId: val === 'dept_manager' ? null : employee.teamId // Clear team if manager
                                                    });
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="employee">Employee / Member</SelectItem>
                                                    <SelectItem value="team_leader">Team Leader</SelectItem>
                                                    <SelectItem value="dept_manager">Department Manager</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input disabled value={
                                                employee.isDepartmentManager ? 'Department Manager' :
                                                    employee.isTeamLeader ? 'Team Leader' : 'Employee'
                                            } />
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Department</Label>
                                        {isEditing ? (
                                            <Select
                                                value={employee.departmentId || 'none'}
                                                onValueChange={(val) => {
                                                    setEmployee({ ...employee, departmentId: val === 'none' ? null : val, teamId: null });
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No Department</SelectItem>
                                                    {departments.map((d: any) => (
                                                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input disabled value={employee.department?.name || 'Not Assigned'} />
                                        )}
                                    </div>

                                    {!employee.isDepartmentManager && (
                                        <div className="space-y-2">
                                            <Label>Team</Label>
                                            {isEditing ? (
                                                <Select
                                                    value={employee.teamId || 'none'}
                                                    onValueChange={(val) => setEmployee({ ...employee, teamId: val === 'none' ? null : val })}
                                                    disabled={!employee.departmentId}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Team" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">No Team</SelectItem>
                                                        {teams
                                                            .filter((t: any) => t.departmentId === employee.departmentId)
                                                            .map((t: any) => (
                                                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input disabled value={employee.team?.name || 'Not Assigned'} />
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Job Role Title</Label>
                                        <Input disabled value={employee.role?.name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Employment Start Date</Label>
                                        <Input
                                            type="date"
                                            disabled={!isEditing}
                                            value={employee.employeeProfile?.employmentStartDate ? new Date(employee.employeeProfile.employmentStartDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => setEmployee({
                                                ...employee,
                                                employeeProfile: { ...employee.employeeProfile, employmentStartDate: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Employment End Date</Label>
                                        <Input
                                            type="date"
                                            disabled={!isEditing}
                                            value={employee.employeeProfile?.employmentEndDate ? new Date(employee.employeeProfile.employmentEndDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => setEmployee({
                                                ...employee,
                                                employeeProfile: { ...employee.employeeProfile, employmentEndDate: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Base Salary</Label>
                                        <Input
                                            type="number"
                                            disabled={!isEditing}
                                            value={employee.employeeProfile?.salary || ''}
                                            placeholder="Not Set"
                                            onChange={(e) => setEmployee({
                                                ...employee,
                                                employeeProfile: { ...employee.employeeProfile, salary: e.target.value }
                                            })}
                                        />
                                    </div>

                                    {/* Settings Section */}
                                    <div className="col-span-2 space-y-4 pt-4 border-t">
                                        <h3 className="font-semibold text-sm text-gray-900">Attendance Settings</h3>

                                        <div className="flex items-center justify-between border p-3 rounded-lg">
                                            <div className="space-y-0.5">
                                                <Label>Attendance Required</Label>
                                                <p className="text-xs text-muted-foreground">Require this employee to punch in/out</p>
                                            </div>
                                            <Switch
                                                checked={employee.employeeProfile?.attendanceRequired ?? true}
                                                disabled={!isEditing}
                                                onCheckedChange={(checked) => setEmployee({
                                                    ...employee,
                                                    employeeProfile: { ...employee.employeeProfile, attendanceRequired: checked }
                                                })}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between border p-3 rounded-lg">
                                            <div className="space-y-0.5">
                                                <Label>Tasks Log Required</Label>
                                                <p className="text-xs text-muted-foreground">Require project/tasks notes on check-in</p>
                                            </div>
                                            <Switch
                                                checked={employee.employeeProfile?.tasksLogRequired ?? true}
                                                disabled={!isEditing}
                                                onCheckedChange={(checked) => setEmployee({
                                                    ...employee,
                                                    employeeProfile: { ...employee.employeeProfile, tasksLogRequired: checked }
                                                })}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between border p-3 rounded-lg">
                                            <div className="space-y-0.5">
                                                <Label>Work Outside Office</Label>
                                                <p className="text-xs text-muted-foreground">Allow "Work from Home" attendance</p>
                                            </div>
                                            <Switch
                                                checked={employee.employeeProfile?.workOutsideOfficeAllowed ?? true}
                                                disabled={!isEditing}
                                                onCheckedChange={(checked) => setEmployee({
                                                    ...employee,
                                                    employeeProfile: { ...employee.employeeProfile, workOutsideOfficeAllowed: checked }
                                                })}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label>Work Regulation</Label>
                                        {isEditing ? (
                                            <Select
                                                value={employee.employeeProfile?.workRegulationId || ''}
                                                onValueChange={(val) => setEmployee({
                                                    ...employee,
                                                    employeeProfile: { ...employee.employeeProfile, workRegulationId: val }
                                                })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Regulation" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {workRegulations.map(reg => (
                                                        <SelectItem key={reg.id} value={reg.id}>{reg.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input disabled value={workRegulations.find(r => r.id === employee.employeeProfile?.workRegulationId)?.name || 'Not Set'} />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="personal" className="space-y-4 mt-4">
                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Personal Email</Label>
                                            <Input
                                                disabled={!isEditing}
                                                value={employee.employeeProfile?.personalEmail || ''}
                                                onChange={(e) => setEmployee({
                                                    ...employee,
                                                    employeeProfile: { ...employee.employeeProfile, personalEmail: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone Number</Label>
                                            <Input
                                                disabled={!isEditing}
                                                value={employee.employeeProfile?.phoneNumber || ''}
                                                onChange={(e) => setEmployee({
                                                    ...employee,
                                                    employeeProfile: { ...employee.employeeProfile, phoneNumber: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Address</Label>
                                        <Input
                                            disabled={!isEditing}
                                            value={employee.employeeProfile?.address || ''}
                                            onChange={(e) => setEmployee({
                                                ...employee,
                                                employeeProfile: { ...employee.employeeProfile, address: e.target.value }
                                            })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Gender</Label>
                                            {isEditing ? (
                                                <select // Using simple select for speed, can upgrade to shadcn Select
                                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={employee.employeeProfile?.gender || ''}
                                                    onChange={(e) => setEmployee({
                                                        ...employee,
                                                        employeeProfile: { ...employee.employeeProfile, gender: e.target.value }
                                                    })}
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            ) : (
                                                <Input disabled value={employee.employeeProfile?.gender || 'Not Set'} />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date of Birth</Label>
                                            <Input
                                                type="date"
                                                disabled={!isEditing}
                                                value={employee.employeeProfile?.dateOfBirth ? new Date(employee.employeeProfile.dateOfBirth).toISOString().split('T')[0] : ''}
                                                onChange={(e) => setEmployee({
                                                    ...employee,
                                                    employeeProfile: { ...employee.employeeProfile, dateOfBirth: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            {/* Modals */}
            <ManualAttendanceModal
                isOpen={showAttendanceModal}
                onClose={() => setShowAttendanceModal(false)}
                userId={employee?.id}
            />
            <LeaveRequestModal
                isOpen={showLeaveModal}
                onClose={() => setShowLeaveModal(false)}
                userId={employee?.id}
            />
            <EditLeaveBalanceModal
                isOpen={showBalanceModal}
                onClose={() => setShowBalanceModal(false)}
                userId={employee?.id}
            />
        </div>
    );
}

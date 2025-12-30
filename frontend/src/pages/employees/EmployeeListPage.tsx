import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Plus, Search, MoreHorizontal, Loader2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { useAuthStore } from '../../store/auth.store';
import api from '../../lib/api';

export default function EmployeeListPage() {
    const navigate = useNavigate();
    const checkPermission = useAuthStore(state => state.checkPermission);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [error, setError] = useState<string | null>(null);

    const fetchEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/employees');
            setEmployees(response.data.data);
        } catch (error: any) {
            console.error('Failed to fetch employees:', error);
            setError(error.response?.data?.message || 'Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filteredEmployees = employees.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your team, view profiles, and update roles.
                    </p>
                </div>
                {checkPermission('employees', 'add') && (
                    <Button onClick={() => navigate('/employees/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Add Employee
                    </Button>
                )}
            </div>

            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border shadow-sm w-fit">
                <Search className="h-4 w-4 text-muted-foreground ml-2" />
                <Input
                    placeholder="Search employees..."
                    className="border-0 focus-visible:ring-0 w-[300px]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="rounded-md border bg-white shadow-sm relative min-h-[400px]">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-red-500">
                        <p>{error}</p>
                        <Button variant="outline" className="mt-4" onClick={fetchEmployees}>Try Again</Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Avatar</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmployees.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell>
                                        <Avatar>
                                            <AvatarImage src={employee.employeeProfile?.profileImage} />
                                            <AvatarFallback>{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div>{employee.firstName} {employee.lastName}</div>
                                        <div className="text-sm text-muted-foreground">{employee.email}</div>
                                    </TableCell>
                                    <TableCell>{employee.role?.name}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800`}>
                                            Active
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigate(`/employees/${employee.id}`)}>
                                                    View Profile
                                                </DropdownMenuItem>

                                                {checkPermission('employees', 'edit') && (
                                                    <DropdownMenuItem onClick={() => navigate(`/employees/${employee.id}?edit=true`)}>
                                                        Edit Details
                                                    </DropdownMenuItem>
                                                )}

                                                {checkPermission('employees', 'delete') && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Users, X, Mail, Phone, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import useAuthStore from '@/store/authStore';

export default function Employees() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch employees
    const { data: employeesData, isLoading } = useQuery({
        queryKey: ['employees', currentPage, searchTerm, statusFilter, departmentFilter],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter && { status: statusFilter }),
                ...(departmentFilter && { department: departmentFilter }),
            });
            const response = await api.get(`/employees?${params}`);
            return response.data;
        },
    });

    // Fetch departments
    const { data: departments = [] } = useQuery({
        queryKey: ['departments'],
        queryFn: async () => {
            const response = await api.get('/employees/departments/list');
            return response.data;
        },
    });

    // Form state
    const [formData, setFormData] = useState({
        employeeId: '',
        name: '',
        email: '',
        department: '',
        designation: '',
        contact: '',
        branch: 'Head Office',
        status: 'active',
        joiningDate: '',
    });

    // Create/Update mutation
    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (editingEmployee) {
                return await api.put(`/employees/${editingEmployee.id}`, data);
            } else {
                return await api.post('/employees', data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['employees']);
            toast({
                title: 'Success',
                description: `Employee ${editingEmployee ? 'updated' : 'created'} successfully`,
            });
            handleCloseDialog();
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive',
            });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return await api.delete(`/employees/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['employees']);
            toast({
                title: 'Success',
                description: 'Employee deleted successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete employee',
                variant: 'destructive',
            });
        },
    });

    const handleOpenDialog = (employee = null) => {
        if (employee) {
            setEditingEmployee(employee);
            setFormData({
                employeeId: employee.employeeId || '',
                name: employee.name || '',
                email: employee.email || '',
                department: employee.department || '',
                designation: employee.designation || '',
                contact: employee.contact || '',
                branch: employee.branch || 'Head Office',
                status: employee.status || 'active',
                joiningDate: employee.joiningDate ? employee.joiningDate.split('T')[0] : '',
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingEmployee(null);
        setFormData({
            employeeId: '',
            name: '',
            email: '',
            department: '',
            designation: '',
            contact: '',
            branch: 'Head Office',
            status: 'active',
            joiningDate: '',
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setIsConfirmOpen(true);
    };

    const { user } = useAuthStore();
    const canManage = user?.role === 'Admin' || user?.role === 'Manager';

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    const confirmDelete = () => {
        if (pendingDeleteId) deleteMutation.mutate(pendingDeleteId);
        setIsConfirmOpen(false);
        setPendingDeleteId(null);
    };

    const getStatusColor = (status) => {
        return status === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
                    <p className="text-muted-foreground mt-2">Manage your organization's employees</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Employee
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">All Departments</option>
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('');
                                setDepartmentFilter('');
                            }}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Employees Table */}
            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : employeesData?.employees?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No employees found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-medium">Employee ID</th>
                                            <th className="text-left py-3 px-4 font-medium">Name</th>
                                            <th className="text-left py-3 px-4 font-medium">Email</th>
                                            <th className="text-left py-3 px-4 font-medium">Department</th>
                                            <th className="text-left py-3 px-4 font-medium">Designation</th>
                                            <th className="text-left py-3 px-4 font-medium">Contact</th>
                                            <th className="text-left py-3 px-4 font-medium">Status</th>
                                            <th className="text-right py-3 px-4 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employeesData?.employees?.map((employee) => (
                                            <motion.tr
                                                key={employee.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="border-b last:border-0 hover:bg-muted/50"
                                            >
                                                <td className="py-3 px-4 font-medium">{employee.employeeId}</td>
                                                <td className="py-3 px-4">{employee.name}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        {employee.email}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">{employee.department}</td>
                                                <td className="py-3 px-4">{employee.designation || '-'}</td>
                                                <td className="py-3 px-4">
                                                    {employee.contact ? (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                                            {employee.contact}
                                                        </div>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                            employee.status
                                                        )}`}
                                                    >
                                                        {employee.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {canManage ? (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleOpenDialog(employee)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleDelete(employee.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">No actions</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {employeesData?.employees?.length} of {employeesData?.total} employees
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage >= employeesData?.pages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Dialog */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">
                                    {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                                </h2>
                                <Button variant="ghost" size="sm" onClick={handleCloseDialog}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="employeeId">
                                            Employee ID <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="employeeId"
                                            value={formData.employeeId}
                                            onChange={(e) =>
                                                setFormData({ ...formData, employeeId: e.target.value })
                                            }
                                            required
                                            disabled={!!editingEmployee}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="name">
                                            Full Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">
                                            Email <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact">Contact</Label>
                                        <Input
                                            id="contact"
                                            value={formData.contact}
                                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="department">
                                            Department <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="department"
                                            value={formData.department}
                                            onChange={(e) =>
                                                setFormData({ ...formData, department: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="designation">Designation</Label>
                                        <Input
                                            id="designation"
                                            value={formData.designation}
                                            onChange={(e) =>
                                                setFormData({ ...formData, designation: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="branch">Branch</Label>
                                        <Input
                                            id="branch"
                                            value={formData.branch}
                                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="joiningDate">Joining Date</Label>
                                        <Input
                                            id="joiningDate"
                                            type="date"
                                            value={formData.joiningDate}
                                            onChange={(e) =>
                                                setFormData({ ...formData, joiningDate: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="status">Status</Label>
                                        <select
                                            id="status"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={saveMutation.isPending}>
                                        {saveMutation.isPending
                                            ? 'Saving...'
                                            : editingEmployee
                                                ? 'Update Employee'
                                                : 'Create Employee'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}

            <ConfirmDialog
                open={isConfirmOpen}
                title="Delete Employee"
                description="This will permanently remove the employee record. Are you sure?"
                confirmText="Delete"
                cancelText="Cancel"
                destructive
                onCancel={() => {
                    setIsConfirmOpen(false);
                    setPendingDeleteId(null);
                }}
                onConfirm={confirmDelete}
            />
        </div>
    );
}

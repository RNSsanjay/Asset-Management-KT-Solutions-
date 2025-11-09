import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    Clock,
    CheckCircle,
    XCircle,
    RotateCcw,
    Trash2,
    Package,
    User,
    Calendar,
    FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function AssetHistory() {
    const [activeTab, setActiveTab] = useState('history');
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [actionType, setActionType] = useState('');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch history
    const { data: historyData, isLoading } = useQuery({
        queryKey: ['asset-history', currentPage, actionFilter],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: currentPage,
                limit: 20,
                ...(actionFilter && { action: actionFilter }),
            });
            const response = await api.get(`/asset-history?${params}`);
            return response.data;
        },
    });

    // Fetch available assets
    const { data: availableAssets = [] } = useQuery({
        queryKey: ['available-assets'],
        queryFn: async () => {
            const response = await api.get('/assets?status=Available&limit=100');
            return response.data.assets || [];
        },
    });

    // Fetch assigned assets
    const { data: assignedAssets = [] } = useQuery({
        queryKey: ['assigned-assets'],
        queryFn: async () => {
            const response = await api.get('/assets?status=Assigned&limit=100');
            return response.data.assets || [];
        },
    });

    // Fetch employees
    const { data: employees = [] } = useQuery({
        queryKey: ['active-employees'],
        queryFn: async () => {
            const response = await api.get('/employees?status=active&limit=100');
            return response.data.employees || [];
        },
    });

    // Form state
    const [formData, setFormData] = useState({
        assetId: '',
        employeeId: '',
        condition: '',
        reason: '',
        notes: '',
    });

    // Issue asset mutation
    const issueMutation = useMutation({
        mutationFn: async (data) => {
            return await api.post('/asset-history/issue', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['asset-history']);
            queryClient.invalidateQueries(['available-assets']);
            queryClient.invalidateQueries(['assigned-assets']);
            queryClient.invalidateQueries(['stock-summary']);
            toast({
                title: 'Success',
                description: 'Asset issued successfully',
            });
            handleCloseDialog();
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to issue asset',
                variant: 'destructive',
            });
        },
    });

    // Return asset mutation
    const returnMutation = useMutation({
        mutationFn: async (data) => {
            return await api.post('/asset-history/return', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['asset-history']);
            queryClient.invalidateQueries(['available-assets']);
            queryClient.invalidateQueries(['assigned-assets']);
            queryClient.invalidateQueries(['stock-summary']);
            toast({
                title: 'Success',
                description: 'Asset returned successfully',
            });
            handleCloseDialog();
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to return asset',
                variant: 'destructive',
            });
        },
    });

    // Scrap asset mutation
    const scrapMutation = useMutation({
        mutationFn: async (data) => {
            return await api.post('/asset-history/scrap', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['asset-history']);
            queryClient.invalidateQueries(['available-assets']);
            queryClient.invalidateQueries(['stock-summary']);
            toast({
                title: 'Success',
                description: 'Asset scrapped successfully',
            });
            handleCloseDialog();
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to scrap asset',
                variant: 'destructive',
            });
        },
    });

    const handleOpenDialog = (type) => {
        setActionType(type);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setActionType('');
        setFormData({
            assetId: '',
            employeeId: '',
            condition: '',
            reason: '',
            notes: '',
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (actionType === 'issue') {
            if (!formData.assetId || !formData.employeeId) {
                toast({
                    title: 'Validation Error',
                    description: 'Please select both asset and employee',
                    variant: 'destructive',
                });
                return;
            }
            issueMutation.mutate(formData);
        } else if (actionType === 'return') {
            if (!formData.assetId) {
                toast({
                    title: 'Validation Error',
                    description: 'Please select an asset to return',
                    variant: 'destructive',
                });
                return;
            }
            returnMutation.mutate(formData);
        } else if (actionType === 'scrap') {
            if (!formData.assetId) {
                toast({
                    title: 'Validation Error',
                    description: 'Please select an asset to scrap',
                    variant: 'destructive',
                });
                return;
            }
            scrapMutation.mutate(formData);
        }
    };

    const getActionIcon = (action) => {
        const icons = {
            Purchase: Package,
            Issue: CheckCircle,
            Return: RotateCcw,
            Repair: Clock,
            Scrap: Trash2,
            Transfer: User,
        };
        return icons[action] || FileText;
    };

    const getActionColor = (action) => {
        const colors = {
            Purchase: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            Issue: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            Return: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            Repair: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            Scrap: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            Transfer: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
        };
        return colors[action] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Asset History</h1>
                    <p className="text-muted-foreground mt-2">Track asset movements and lifecycle</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => handleOpenDialog('issue')} variant="default">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Issue Asset
                    </Button>
                    <Button onClick={() => handleOpenDialog('return')} variant="outline">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Return Asset
                    </Button>
                    <Button onClick={() => handleOpenDialog('scrap')} variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Scrap Asset
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">All Actions</option>
                            <option value="Purchase">Purchase</option>
                            <option value="Issue">Issue</option>
                            <option value="Return">Return</option>
                            <option value="Repair">Repair</option>
                            <option value="Scrap">Scrap</option>
                            <option value="Transfer">Transfer</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* History Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Asset Movement History</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : historyData?.history?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No history records found</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {historyData?.history?.map((record) => {
                                    const ActionIcon = getActionIcon(record.action);
                                    return (
                                        <motion.div
                                            key={record.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex-shrink-0">
                                                <div
                                                    className={`p-3 rounded-full ${getActionColor(
                                                        record.action
                                                    )}`}
                                                >
                                                    <ActionIcon className="h-5 w-5" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-lg flex items-center gap-2">
                                                            {record.action}
                                                            <span
                                                                className={`px-2 py-0.5 text-xs rounded-full ${getActionColor(
                                                                    record.action
                                                                )}`}
                                                            >
                                                                {record.action}
                                                            </span>
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            <Calendar className="inline h-3 w-3 mr-1" />
                                                            {formatDate(record.actionDate)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 grid gap-2 md:grid-cols-2">
                                                    <div>
                                                        <p className="text-sm font-medium">Asset</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {record.asset?.assetTag} - {record.asset?.make}{' '}
                                                            {record.asset?.model}
                                                        </p>
                                                    </div>
                                                    {record.employee && (
                                                        <div>
                                                            <p className="text-sm font-medium">Employee</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {record.employee?.name} (
                                                                {record.employee?.employeeId})
                                                            </p>
                                                        </div>
                                                    )}
                                                    {record.condition && (
                                                        <div>
                                                            <p className="text-sm font-medium">Condition</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {record.condition}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {record.performer && (
                                                        <div>
                                                            <p className="text-sm font-medium">Performed By</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {record.performer?.name}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {record.reason && (
                                                    <div className="mt-2">
                                                        <p className="text-sm font-medium">Reason</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {record.reason}
                                                        </p>
                                                    </div>
                                                )}

                                                {record.notes && (
                                                    <div className="mt-2">
                                                        <p className="text-sm font-medium">Notes</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {record.notes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-6">
                                <p className="text-sm text-muted-foreground">
                                    Showing {historyData?.history?.length} of {historyData?.total} records
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
                                        disabled={currentPage >= historyData?.pages}
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

            {/* Action Dialog */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto m-4"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold capitalize">{actionType} Asset</h2>
                                <Button variant="ghost" size="sm" onClick={handleCloseDialog}>
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="assetId">
                                        Asset <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="assetId"
                                        value={formData.assetId}
                                        onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                                        required
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="">Select asset</option>
                                        {(actionType === 'issue' ? availableAssets : assignedAssets).map((asset) => (
                                            <option key={asset.id} value={asset.id}>
                                                {asset.assetTag} - {asset.make} {asset.model}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {actionType === 'issue' && (
                                    <div>
                                        <Label htmlFor="employeeId">
                                            Employee <span className="text-red-500">*</span>
                                        </Label>
                                        <select
                                            id="employeeId"
                                            value={formData.employeeId}
                                            onChange={(e) =>
                                                setFormData({ ...formData, employeeId: e.target.value })
                                            }
                                            required
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="">Select employee</option>
                                            {employees.map((emp) => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.name} ({emp.employeeId})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {(actionType === 'return' || actionType === 'issue') && (
                                    <div>
                                        <Label htmlFor="condition">Condition</Label>
                                        <select
                                            id="condition"
                                            value={formData.condition}
                                            onChange={(e) =>
                                                setFormData({ ...formData, condition: e.target.value })
                                            }
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="">Select condition</option>
                                            <option value="Excellent">Excellent</option>
                                            <option value="Good">Good</option>
                                            <option value="Fair">Fair</option>
                                            <option value="Poor">Poor</option>
                                        </select>
                                    </div>
                                )}

                                {(actionType === 'return' || actionType === 'scrap') && (
                                    <div>
                                        <Label htmlFor="reason">
                                            Reason {actionType === 'scrap' && <span className="text-red-500">*</span>}
                                        </Label>
                                        <Input
                                            id="reason"
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            required={actionType === 'scrap'}
                                            placeholder="Enter reason..."
                                        />
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="notes">Notes</Label>
                                    <textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        placeholder="Additional notes..."
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={
                                            issueMutation.isPending ||
                                            returnMutation.isPending ||
                                            scrapMutation.isPending
                                        }
                                    >
                                        {issueMutation.isPending ||
                                            returnMutation.isPending ||
                                            scrapMutation.isPending
                                            ? 'Processing...'
                                            : `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Asset`}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

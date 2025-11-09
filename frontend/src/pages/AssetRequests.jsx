import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';
import useAuthStore from '../store/authStore';
import api from '../lib/api';

export default function AssetRequests() {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const isEmployee = user?.role === 'Employee';
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        categoryId: '',
        assetType: '',
        justification: '',
        priority: 'Medium'
    });

    // Fetch all requests
    const { data: requestsData, isLoading } = useQuery({
        queryKey: ['assetRequests'],
        queryFn: async () => {
            const response = await api.get('/asset-requests');
            return response.data;
        }
    });

    // Fetch categories for dropdown
    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/categories');
            return response.data;
        }
    });

    // Fetch pending count for managers/admins
    const { data: pendingCountData } = useQuery({
        queryKey: ['pendingRequestsCount'],
        queryFn: async () => {
            const response = await api.get('/asset-requests/pending/count');
            return response.data;
        },
        enabled: !isEmployee
    });

    // Create request mutation
    const createMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/asset-requests', data);
            return response.data;
        },
        onSuccess: () => {
            toast({ title: 'Request submitted successfully!' });
            queryClient.invalidateQueries(['assetRequests']);
            queryClient.invalidateQueries(['pendingRequestsCount']);
            setShowForm(false);
            setFormData({ categoryId: '', assetType: '', justification: '', priority: 'Medium' });
        },
        onError: (error) => {
            toast({
                title: 'Error submitting request',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive'
            });
        }
    });

    // Review request mutation
    const reviewMutation = useMutation({
        mutationFn: async ({ id, status, reviewNotes }) => {
            const response = await api.patch(`/asset-requests/${id}/review`, {
                status,
                reviewNotes
            });
            return response.data;
        },
        onSuccess: () => {
            toast({ title: 'Request reviewed successfully!' });
            queryClient.invalidateQueries(['assetRequests']);
            queryClient.invalidateQueries(['pendingRequestsCount']);
        },
        onError: (error) => {
            toast({
                title: 'Error reviewing request',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive'
            });
        }
    });

    // Delete request mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/asset-requests/${id}`);
        },
        onSuccess: () => {
            toast({ title: 'Request deleted successfully!' });
            queryClient.invalidateQueries(['assetRequests']);
            queryClient.invalidateQueries(['pendingRequestsCount']);
        },
        onError: (error) => {
            toast({
                title: 'Error deleting request',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive'
            });
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.assetType || !formData.justification) {
            toast({
                title: 'Missing fields',
                description: 'Please fill in all required fields',
                variant: 'destructive'
            });
            return;
        }
        createMutation.mutate(formData);
    };

    const handleReview = (id, status) => {
        const notes = prompt(`Enter review notes for ${status.toLowerCase()}ing this request:`);
        if (notes !== null) {
            reviewMutation.mutate({ id, status, reviewNotes: notes });
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Approved': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800',
            'Fulfilled': 'bg-blue-100 text-blue-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'Low': 'text-gray-600',
            'Medium': 'text-blue-600',
            'High': 'text-orange-600',
            'Urgent': 'text-red-600'
        };
        return colors[priority] || 'text-gray-600';
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Asset Requests</h1>
                    <p className="text-gray-600 mt-1">
                        {isEmployee ? 'Submit and track your asset requests' : 'Review and manage asset requests'}
                    </p>
                </div>
                <div className="flex gap-3">
                    {!isEmployee && pendingCountData?.count > 0 && (
                        <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold">
                            {pendingCountData.count} Pending
                        </div>
                    )}
                    {isEmployee && (
                        <Button onClick={() => setShowForm(!showForm)}>
                            {showForm ? 'Cancel' : 'New Request'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Request Form */}
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-4">New Asset Request</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Category (Optional)</Label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg"
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    >
                                        <option value="">Select category</option>
                                        {categoriesData?.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label>Priority</Label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <Label>Asset Type *</Label>
                                <Input
                                    value={formData.assetType}
                                    onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                                    placeholder="e.g., Laptop, Mouse, Monitor"
                                    required
                                />
                            </div>
                            <div>
                                <Label>Justification *</Label>
                                <textarea
                                    className="w-full px-3 py-2 border rounded-lg min-h-[100px]"
                                    value={formData.justification}
                                    onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                                    placeholder="Explain why you need this asset..."
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Card>
                </motion.div>
            )}

            {/* Requests List */}
            <div className="grid gap-4">
                {requestsData?.length === 0 ? (
                    <Card className="p-8 text-center text-gray-500">
                        <p>No asset requests found</p>
                        {isEmployee && <p className="text-sm mt-2">Click "New Request" to submit your first request</p>}
                    </Card>
                ) : (
                    requestsData?.map((request) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{request.assetType}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                            <span className={`text-sm font-medium ${getPriorityColor(request.priority)}`}>
                                                {request.priority} Priority
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p><strong>Requested by:</strong> {request.employee?.name} ({request.requester?.email})</p>
                                            {request.category && <p><strong>Category:</strong> {request.category.name}</p>}
                                            <p><strong>Date:</strong> {new Date(request.requestDate).toLocaleDateString()}</p>
                                            <p className="mt-2"><strong>Justification:</strong></p>
                                            <p className="text-gray-700">{request.justification}</p>
                                            {request.reviewNotes && (
                                                <>
                                                    <p className="mt-2"><strong>Review Notes:</strong></p>
                                                    <p className="text-gray-700">{request.reviewNotes}</p>
                                                    <p className="text-xs">Reviewed by {request.reviewer?.email} on {new Date(request.reviewDate).toLocaleDateString()}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {!isEmployee && request.status === 'Pending' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleReview(request.id, 'Approved')}
                                                    disabled={reviewMutation.isPending}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleReview(request.id, 'Rejected')}
                                                    disabled={reviewMutation.isPending}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        {(isEmployee && request.status === 'Pending') || !isEmployee ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    if (window.confirm('Delete this request?')) {
                                                        deleteMutation.mutate(request.id);
                                                    }
                                                }}
                                                disabled={deleteMutation.isPending}
                                            >
                                                Delete
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}

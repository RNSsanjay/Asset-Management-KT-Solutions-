import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, FolderOpen, X, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

export default function Categories() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    // Check if user can manage categories
    const canManage = user?.role === 'Admin' || user?.role === 'Manager';

    // Form data state
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        status: 'active',
    });

    // Fetch categories from API
    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories', searchTerm, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter) params.append('status', statusFilter);

            const response = await api.get(`/categories?${params}`);
            return response.data;
        },
    });

    // Save category (create or update)
    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (editingCategory) {
                return await api.put(`/categories/${editingCategory.id}`, data);
            } else {
                return await api.post('/categories', data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            toast({
                title: 'Success',
                description: `Category ${editingCategory ? 'updated' : 'created'} successfully`,
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

    // Delete category
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return await api.delete(`/categories/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            toast({
                title: 'Success',
                description: 'Category deleted successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete category',
                variant: 'destructive',
            });
        },
    });

    const handleOpenDialog = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name || '',
                code: category.code || '',
                description: category.description || '',
                status: category.status || 'active',
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingCategory(null);
        setFormData({
            name: '',
            code: '',
            description: '',
            status: 'active',
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

    const confirmDelete = () => {
        if (pendingDeleteId) {
            deleteMutation.mutate(pendingDeleteId);
        }
        setIsConfirmOpen(false);
        setPendingDeleteId(null);
    };

    const getStatusColor = (status) => {
        if (status === 'active') {
            return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        }
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground mt-2">Manage asset categories</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="relative md:col-span-2">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
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
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('');
                            }}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Categories Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    <div className="col-span-full text-center py-8">Loading...</div>
                ) : categories.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No categories found</p>
                    </div>
                ) : (
                    categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <FolderOpen className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{category.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Tag className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">
                                                        {category.code}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                category.status
                                            )}`}
                                        >
                                            {category.status}
                                        </span>
                                    </div>

                                    {category.description && (
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                            {category.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="text-sm text-muted-foreground">
                                            <span className="font-medium">{category.assetCount || 0}</span> assets
                                        </div>
                                        <div className="flex gap-2">
                                            {canManage ? (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleOpenDialog(category)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(category.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">No actions</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Dialog */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto m-4"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">
                                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                                </h2>
                                <Button variant="ghost" size="sm" onClick={handleCloseDialog}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">
                                        Category Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g., Laptops"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="code">
                                        Category Code <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) =>
                                            setFormData({ ...formData, code: e.target.value.toUpperCase() })
                                        }
                                        required
                                        placeholder="e.g., LAP"
                                        maxLength={10}
                                        disabled={!!editingCategory}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        2-10 uppercase characters
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        placeholder="Brief description of the category..."
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>

                                <div>
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

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={saveMutation.isPending}>
                                        {saveMutation.isPending
                                            ? 'Saving...'
                                            : editingCategory
                                                ? 'Update Category'
                                                : 'Create Category'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}

            <ConfirmDialog
                open={isConfirmOpen}
                title="Delete Category"
                description="This action will permanently delete the category. Are you sure?"
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

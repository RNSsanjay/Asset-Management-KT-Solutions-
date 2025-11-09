import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Package,
    Image as ImageIcon,
    X,
    Calendar,
    DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import useAuthStore from '@/store/authStore';

export default function Assets() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch assets
    const { data: assetsData, isLoading } = useQuery({
        queryKey: ['assets', currentPage, searchTerm, statusFilter, categoryFilter],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter && { status: statusFilter }),
                ...(categoryFilter && { categoryId: categoryFilter }),
            });
            const response = await api.get(`/assets?${params}`);
            return response.data;
        },
    });

    // Fetch categories
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/categories?status=active');
            return response.data;
        },
    });

    // Form state
    const [formData, setFormData] = useState({
        assetTag: '',
        serialNumber: '',
        categoryId: '',
        make: '',
        model: '',
        specifications: '',
        purchaseDate: '',
        purchasePrice: '',
        warrantyExpiry: '',
        vendor: '',
        branch: 'Head Office',
        location: '',
        status: 'Available',
        condition: 'Good',
        notes: '',
    });

    // Create/Update mutation
    const saveMutation = useMutation({
        mutationFn: async (data) => {
            const formDataToSend = new FormData();
            Object.keys(data).forEach((key) => {
                if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
                    formDataToSend.append(key, data[key]);
                }
            });
            if (selectedImage) {
                formDataToSend.append('image', selectedImage);
            }

            if (editingAsset) {
                return await api.put(`/assets/${editingAsset.id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                return await api.post('/assets', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['assets']);
            queryClient.invalidateQueries(['stock-summary']);
            toast({
                title: 'Success',
                description: `Asset ${editingAsset ? 'updated' : 'created'} successfully`,
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
            return await api.delete(`/assets/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['assets']);
            queryClient.invalidateQueries(['stock-summary']);
            toast({
                title: 'Success',
                description: 'Asset deleted successfully',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete asset',
                variant: 'destructive',
            });
        },
    });

    const handleOpenDialog = (asset = null) => {
        if (asset) {
            setEditingAsset(asset);
            setFormData({
                assetTag: asset.assetTag || '',
                serialNumber: asset.serialNumber || '',
                categoryId: asset.categoryId || '',
                make: asset.make || '',
                model: asset.model || '',
                specifications: asset.specifications || '',
                purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
                purchasePrice: asset.purchasePrice || '',
                warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.split('T')[0] : '',
                vendor: asset.vendor || '',
                branch: asset.branch || 'Head Office',
                location: asset.location || '',
                status: asset.status || 'Available',
                condition: asset.condition || 'Good',
                notes: asset.notes || '',
            });
            setImagePreview(asset.imageUrl ? `${api.defaults.baseURL}${asset.imageUrl}` : '');
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingAsset(null);
        setFormData({
            assetTag: '',
            serialNumber: '',
            categoryId: '',
            make: '',
            model: '',
            specifications: '',
            purchaseDate: '',
            purchasePrice: '',
            warrantyExpiry: '',
            vendor: '',
            branch: 'Head Office',
            location: '',
            status: 'Available',
            condition: 'Good',
            notes: '',
        });
        setSelectedImage(null);
        setImagePreview('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
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
        const colors = {
            Available: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            Assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            'Under Repair': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            Scrapped: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        };
        return colors[status] || '';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
                    <p className="text-muted-foreground mt-2">Manage your organization's assets</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Asset
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search assets..."
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
                            <option value="Available">Available</option>
                            <option value="Assigned">Assigned</option>
                            <option value="Under Repair">Under Repair</option>
                            <option value="Scrapped">Scrapped</option>
                        </select>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('');
                                setCategoryFilter('');
                            }}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Assets Table */}
            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : assetsData?.assets?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No assets found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-medium">Asset Tag</th>
                                            <th className="text-left py-3 px-4 font-medium">Serial No</th>
                                            <th className="text-left py-3 px-4 font-medium">Category</th>
                                            <th className="text-left py-3 px-4 font-medium">Make/Model</th>
                                            <th className="text-left py-3 px-4 font-medium">Status</th>
                                            <th className="text-left py-3 px-4 font-medium">Condition</th>
                                            <th className="text-right py-3 px-4 font-medium">Price</th>
                                            <th className="text-right py-3 px-4 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assetsData?.assets?.map((asset) => (
                                            <motion.tr
                                                key={asset.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="border-b last:border-0 hover:bg-muted/50"
                                            >
                                                <td className="py-3 px-4 font-medium">{asset.assetTag}</td>
                                                <td className="py-3 px-4">{asset.serialNumber}</td>
                                                <td className="py-3 px-4">{asset.category?.name}</td>
                                                <td className="py-3 px-4">
                                                    {asset.make} {asset.model}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                            asset.status
                                                        )}`}
                                                    >
                                                        {asset.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">{asset.condition}</td>
                                                <td className="py-3 px-4 text-right">
                                                    {formatCurrency(asset.purchasePrice)}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {canManage ? (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleOpenDialog(asset)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleDelete(asset.id)}
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
                                    Showing {assetsData?.assets?.length} of {assetsData?.total} assets
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
                                        disabled={currentPage >= assetsData?.pages}
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
                        className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">
                                    {editingAsset ? 'Edit Asset' : 'Add New Asset'}
                                </h2>
                                <Button variant="ghost" size="sm" onClick={handleCloseDialog}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Image Upload */}
                                <div>
                                    <Label>Asset Image</Label>
                                    <div className="mt-2 flex items-center gap-4">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-32 w-32 object-cover rounded-lg border"
                                            />
                                        ) : (
                                            <div className="h-32 w-32 border-2 border-dashed rounded-lg flex items-center justify-center">
                                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="assetTag">
                                            Asset Tag <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="assetTag"
                                            value={formData.assetTag}
                                            onChange={(e) =>
                                                setFormData({ ...formData, assetTag: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="serialNumber">
                                            Serial Number <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="serialNumber"
                                            value={formData.serialNumber}
                                            onChange={(e) =>
                                                setFormData({ ...formData, serialNumber: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="categoryId">
                                            Category <span className="text-red-500">*</span>
                                        </Label>
                                        <select
                                            id="categoryId"
                                            value={formData.categoryId}
                                            onChange={(e) =>
                                                setFormData({ ...formData, categoryId: e.target.value })
                                            }
                                            required
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="">Select category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="make">
                                            Make <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="make"
                                            value={formData.make}
                                            onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="model">
                                            Model <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="model"
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="vendor">Vendor</Label>
                                        <Input
                                            id="vendor"
                                            value={formData.vendor}
                                            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="purchaseDate">Purchase Date</Label>
                                        <Input
                                            id="purchaseDate"
                                            type="date"
                                            value={formData.purchaseDate}
                                            onChange={(e) =>
                                                setFormData({ ...formData, purchaseDate: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="purchasePrice">Purchase Price</Label>
                                        <Input
                                            id="purchasePrice"
                                            type="number"
                                            step="0.01"
                                            value={formData.purchasePrice}
                                            onChange={(e) =>
                                                setFormData({ ...formData, purchasePrice: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                                        <Input
                                            id="warrantyExpiry"
                                            type="date"
                                            value={formData.warrantyExpiry}
                                            onChange={(e) =>
                                                setFormData({ ...formData, warrantyExpiry: e.target.value })
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
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) =>
                                                setFormData({ ...formData, location: e.target.value })
                                            }
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
                                            <option value="Available">Available</option>
                                            <option value="Assigned">Assigned</option>
                                            <option value="Under Repair">Under Repair</option>
                                            <option value="Scrapped">Scrapped</option>
                                        </select>
                                    </div>
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
                                            <option value="Excellent">Excellent</option>
                                            <option value="Good">Good</option>
                                            <option value="Fair">Fair</option>
                                            <option value="Poor">Poor</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="specifications">Specifications</Label>
                                    <textarea
                                        id="specifications"
                                        value={formData.specifications}
                                        onChange={(e) =>
                                            setFormData({ ...formData, specifications: e.target.value })
                                        }
                                        rows={3}
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="notes">Notes</Label>
                                    <textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={saveMutation.isPending}>
                                        {saveMutation.isPending
                                            ? 'Saving...'
                                            : editingAsset
                                                ? 'Update Asset'
                                                : 'Create Asset'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}

            <ConfirmDialog
                open={isConfirmOpen}
                title="Delete Asset"
                description="This action will permanently delete the asset. This cannot be undone."
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

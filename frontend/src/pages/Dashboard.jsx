import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Package,
    Users,
    DollarSign,
    TrendingUp,
    CheckCircle,
    UserCheck,
    Wrench,
    Trash2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import useAuthStore from '@/store/authStore';

export default function Dashboard() {
    const user = useAuthStore((state) => state.user);
    const isEmployee = user?.role === 'Employee';

    // Fetch assigned assets for employees
    const { data: myAssetsData } = useQuery({
        queryKey: ['my-assets'],
        queryFn: async () => {
            const response = await api.get('/assets/my-assets');
            return response.data;
        },
        enabled: isEmployee,
    });

    // Fetch stock summary for admin/manager
    const { data: stockData } = useQuery({
        queryKey: ['stock-summary'],
        queryFn: async () => {
            const response = await api.get('/assets/stock/summary');
            return response.data;
        },
        enabled: !isEmployee,
    });

    // Employee Dashboard
    if (isEmployee) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Welcome back, {user?.name}! Here are your assigned assets.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>My Assigned Assets</CardTitle>
                        <CardDescription>
                            Assets currently assigned to you ({myAssetsData?.assets?.length || 0})
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!myAssetsData?.assets || myAssetsData.assets.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No assets assigned to you yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myAssetsData.assets.map((asset) => (
                                    <div
                                        key={asset.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{asset.make} {asset.model}</h3>
                                            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                                                <span>Tag: {asset.assetTag}</span>
                                                <span>Serial: {asset.serialNumber}</span>
                                                <span>Category: {asset.category?.name}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">
                                                {asset.condition}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {asset.location || 'No location'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Admin/Manager Dashboard
    const stats = [
        {
            name: 'Total Assets',
            value: stockData?.overview?.totalAssets || 0,
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            name: 'Available',
            value: stockData?.overview?.availableAssets || 0,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
        },
        {
            name: 'Assigned',
            value: stockData?.overview?.assignedAssets || 0,
            icon: UserCheck,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        },
        {
            name: 'Total Value',
            value: formatCurrency(stockData?.overview?.totalValue || 0),
            icon: DollarSign,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back, {user?.name}! Here's an overview of your assets.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {stat.name}
                                        </p>
                                        <p className="text-2xl font-bold mt-2">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Assets by Status</CardTitle>
                        <CardDescription>Distribution of assets by current status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stockData?.byStatus?.map((item) => (
                                <div key={item.status} className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{item.status}</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{
                                                    width: `${(item.count / stockData.overview.totalAssets) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm text-muted-foreground w-8 text-right">
                                            {item.count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Assets by Category</CardTitle>
                        <CardDescription>Top categories by asset count</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stockData?.byCategory?.slice(0, 5).map((item) => (
                                <div key={item.categoryName} className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{item.categoryName}</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{
                                                    width: `${(item.count / stockData.overview.totalAssets) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm text-muted-foreground w-8 text-right">
                                            {item.count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Branch Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Assets by Branch</CardTitle>
                    <CardDescription>Asset distribution and value across branches</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-medium">Branch</th>
                                    <th className="text-right py-3 px-4 font-medium">Asset Count</th>
                                    <th className="text-right py-3 px-4 font-medium">Total Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockData?.byBranch?.map((branch) => (
                                    <tr key={branch.branch} className="border-b last:border-0">
                                        <td className="py-3 px-4">{branch.branch}</td>
                                        <td className="py-3 px-4 text-right">{branch.count}</td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            {formatCurrency(branch.totalValue)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="font-bold border-t-2">
                                    <td className="py-3 px-4">Total</td>
                                    <td className="py-3 px-4 text-right">
                                        {stockData?.overview?.totalAssets || 0}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        {formatCurrency(stockData?.overview?.totalValue || 0)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

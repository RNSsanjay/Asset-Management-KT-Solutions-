import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    Package,
    DollarSign,
    TrendingUp,
    Activity,
    CheckCircle,
    UserCheck,
    Wrench,
    Trash2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function StockView() {
    const { data: stockData, isLoading } = useQuery({
        queryKey: ['stock-summary'],
        queryFn: async () => {
            const response = await api.get('/assets/stock/summary');
            return response.data;
        },
    });

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const statusIcons = {
        Available: CheckCircle,
        Assigned: UserCheck,
        'Under Repair': Wrench,
        Scrapped: Trash2,
    };

    const stats = [
        {
            name: 'Total Assets',
            value: stockData?.overview?.totalAssets || 0,
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            name: 'Total Value',
            value: formatCurrency(stockData?.overview?.totalValue || 0),
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
        },
        {
            name: 'Available',
            value: stockData?.overview?.availableAssets || 0,
            icon: CheckCircle,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        },
        {
            name: 'Assigned',
            value: stockData?.overview?.assignedAssets || 0,
            icon: UserCheck,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        },
    ];

    // Prepare data for charts
    const statusChartData =
        stockData?.byStatus?.map((item) => ({
            name: item.status,
            value: parseInt(item.count),
            percentage: ((item.count / stockData.overview.totalAssets) * 100).toFixed(1),
        })) || [];

    const categoryChartData =
        stockData?.byCategory?.map((item) => ({
            name: item.categoryName,
            count: parseInt(item.count),
            value: parseFloat(item.totalValue),
        })) || [];

    const branchChartData =
        stockData?.byBranch?.map((item) => ({
            name: item.branch,
            assets: parseInt(item.count),
            value: parseFloat(item.totalValue),
        })) || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading stock data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Stock View</h1>
                <p className="text-muted-foreground mt-2">
                    Comprehensive view of asset inventory and analytics
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
                                        <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
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

            {/* Charts Row 1 */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Asset Status Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Asset Distribution by Status</CardTitle>
                        <CardDescription>Current status of all assets</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Status Legend */}
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            {statusChartData.map((item, index) => {
                                const Icon = statusIcons[item.name] || Package;
                                return (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {item.name}: {item.value}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Category Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assets by Category</CardTitle>
                        <CardDescription>Asset count per category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#3b82f6" name="Asset Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Category Value Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Asset Value by Category</CardTitle>
                        <CardDescription>Total value of assets per category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="value" fill="#10b981" name="Total Value ($)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Branch Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Branch Distribution</CardTitle>
                        <CardDescription>Asset count and value by branch</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={branchChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="assets" fill="#8b5cf6" name="Asset Count" />
                                <Bar
                                    yAxisId="right"
                                    dataKey="value"
                                    fill="#f59e0b"
                                    name="Value ($)"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Tables */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Category Details Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Category Details</CardTitle>
                        <CardDescription>Detailed breakdown by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-2 font-medium">Category</th>
                                        <th className="text-right py-3 px-2 font-medium">Count</th>
                                        <th className="text-right py-3 px-2 font-medium">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categoryChartData.map((cat, index) => (
                                        <tr key={index} className="border-b last:border-0">
                                            <td className="py-3 px-2">{cat.name}</td>
                                            <td className="py-3 px-2 text-right">{cat.count}</td>
                                            <td className="py-3 px-2 text-right font-medium">
                                                {formatCurrency(cat.value)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="font-bold border-t-2">
                                        <td className="py-3 px-2">Total</td>
                                        <td className="py-3 px-2 text-right">
                                            {stockData?.overview?.totalAssets || 0}
                                        </td>
                                        <td className="py-3 px-2 text-right">
                                            {formatCurrency(stockData?.overview?.totalValue || 0)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Branch Details Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Branch Details</CardTitle>
                        <CardDescription>Detailed breakdown by branch</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-2 font-medium">Branch</th>
                                        <th className="text-right py-3 px-2 font-medium">Count</th>
                                        <th className="text-right py-3 px-2 font-medium">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {branchChartData.map((branch, index) => (
                                        <tr key={index} className="border-b last:border-0">
                                            <td className="py-3 px-2">{branch.name}</td>
                                            <td className="py-3 px-2 text-right">{branch.assets}</td>
                                            <td className="py-3 px-2 text-right font-medium">
                                                {formatCurrency(branch.value)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="font-bold border-t-2">
                                        <td className="py-3 px-2">Total</td>
                                        <td className="py-3 px-2 text-right">
                                            {stockData?.overview?.totalAssets || 0}
                                        </td>
                                        <td className="py-3 px-2 text-right">
                                            {formatCurrency(stockData?.overview?.totalValue || 0)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Status Breakdown Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                {statusChartData.map((status, index) => {
                    const Icon = statusIcons[status.name] || Package;
                    return (
                        <motion.div
                            key={status.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Icon className="h-8 w-8" style={{ color: COLORS[index % COLORS.length] }} />
                                        <span className="text-2xl font-bold">{status.value}</span>
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground">{status.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {status.percentage}% of total
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

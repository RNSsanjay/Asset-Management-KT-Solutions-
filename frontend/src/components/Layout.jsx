import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Package,
    Users,
    FolderOpen,
    History,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Moon,
    Sun,
    ChevronDown,
    User,
    FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';
import useThemeStore from '@/store/themeStore';
import { cn } from '@/lib/utils';

const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Employee'] },
    { name: 'Assets', href: '/assets', icon: Package, roles: ['Admin', 'Manager'] },
    { name: 'Employees', href: '/employees', icon: Users, roles: ['Admin', 'Manager'] },
    { name: 'Categories', href: '/categories', icon: FolderOpen, roles: ['Admin', 'Manager'] },
    { name: 'Asset History', href: '/history', icon: History, roles: ['Admin', 'Manager'] },
    { name: 'Stock View', href: '/stock', icon: BarChart3, roles: ['Admin', 'Manager'] },
    { name: 'Asset Requests', href: '/requests', icon: FileText, roles: ['Admin', 'Manager', 'Employee'] },
];

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();

    // Filter navigation based on user role
    const navigation = allNavigation.filter(item =>
        item.roles.includes(user?.role || 'Employee')
    );

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-border">
                        <Link to="/dashboard" className="flex items-center space-x-2">
                            <Package className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold">Asset Manager</span>
                        </Link>
                        <button
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href ||
                                location.pathname.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    )}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className="mr-3 h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-accent">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {user?.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top navbar */}
                <header className="sticky top-0 z-30 h-16 bg-card border-b border-border">
                    <div className="flex items-center justify-between h-full px-4 sm:px-6">
                        <button
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="flex items-center space-x-4 ml-auto">
                            {/* Theme toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                            >
                                {theme === 'dark' ? (
                                    <Sun className="h-5 w-5" />
                                ) : (
                                    <Moon className="h-5 w-5" />
                                )}
                            </Button>

                            {/* Logout button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>
        </div>
    );
}

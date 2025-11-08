import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import useAuthStore from '@/store/authStore';

// Placeholder components for other pages
const Assets = () => <div className="text-2xl font-bold">Assets Page - Coming Soon</div>;
const Employees = () => <div className="text-2xl font-bold">Employees Page - Coming Soon</div>;
const Categories = () => <div className="text-2xl font-bold">Categories Page - Coming Soon</div>;
const AssetHistory = () => <div className="text-2xl font-bold">Asset History Page - Coming Soon</div>;
const StockView = () => <div className="text-2xl font-bold">Stock View Page - Coming Soon</div>;

function App() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/assets" element={<Assets />} />
                        <Route path="/employees" element={<Employees />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/history" element={<AssetHistory />} />
                        <Route path="/stock" element={<StockView />} />
                    </Route>
                </Route>

                {/* Default redirect */}
                <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
                <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
            </Routes>
            <Toaster />
        </>
    );
}

export default App;

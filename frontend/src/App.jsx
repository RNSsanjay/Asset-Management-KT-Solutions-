import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Assets from '@/pages/Assets';
import Employees from '@/pages/Employees';
import Categories from '@/pages/Categories';
import AssetHistory from '@/pages/AssetHistory';
import StockView from '@/pages/StockView';
import useAuthStore from '@/store/authStore';

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

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, LogIn, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import useAuthStore from '@/store/authStore';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const login = useAuthStore((state) => state.login);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email, password);
            toast({
                title: 'Welcome back!',
                description: 'You have successfully logged in.',
            });
            navigate('/dashboard');
        } catch (error) {
            toast({
                title: 'Login failed',
                description: error.message || 'Invalid email or password',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center space-x-2">
                        <Package className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Asset Manager
                        </h1>
                    </div>
                </div>

                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@assetmanagement.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Sign in
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <p className="text-muted-foreground">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-primary hover:underline font-medium">
                                    Register
                                </Link>
                            </p>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                            <p className="text-xs text-muted-foreground mb-2">Demo Credentials:</p>
                            <p className="text-xs font-mono">admin@assetmanagement.com / admin123</p>
                            <p className="text-xs font-mono">manager@assetmanagement.com / manager123</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

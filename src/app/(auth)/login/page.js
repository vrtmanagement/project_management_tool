'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        // Using AuthContext login function
        const result = await login(email, password);

        if (result.success) {
            toast.success('Login successful!', {
                description: 'Redirecting to dashboard...',
            });
            // login() in AuthContext already handles token storage and redirect
        } else {
            setError(result.error || 'Login failed. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
                        <Briefcase className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
                    <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
                </div>

                {/* Login Card */}
                <Card className="shadow-2xl border-border/50">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your workspace
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner className="mr-2 h-4 w-4" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="text-sm text-center text-muted-foreground">
                            Don't have an account?{' '}
                            <Link
                                href="/register"
                                className="text-primary font-medium hover:underline"
                            >
                                Sign up for free
                            </Link>
                        </div>
                    </CardFooter>
                </Card>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-muted-foreground">
                    <p>
                        By continuing, you agree to our{' '}
                        <Link href="/terms" className="underline hover:text-foreground">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="underline hover:text-foreground">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
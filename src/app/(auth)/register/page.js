'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, AlertCircle, Briefcase, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Using AuthContext register function
    const result = await register(formData.name, formData.email, formData.password);

    if (result.success) {
      toast.success('Account created successfully!', {
        description: 'Please sign in to continue',
      });
      router.push('/login');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }

    setLoading(false);
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, text: '', color: '' };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const levels = [
      { strength: 0, text: '', color: '' },
      { strength: 1, text: 'Weak', color: 'bg-red-500' },
      { strength: 2, text: 'Fair', color: 'bg-orange-500' },
      { strength: 3, text: 'Good', color: 'bg-yellow-500' },
      { strength: 4, text: 'Strong', color: 'bg-green-500' },
      { strength: 5, text: 'Very Strong', color: 'bg-green-600' },
    ];

    return levels[strength];
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <Briefcase className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Get Started</h1>
          <p className="text-muted-foreground mt-2">Create your account and start managing tasks</p>
        </div>

        {/* Register Card */}
        <Card className="shadow-2xl border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Enter your details to create your free account
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
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={loading}
                    required
                  />
                </div>
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${level <= strength.strength ? strength.color : 'bg-muted'
                            }`}
                        />
                      ))}
                    </div>
                    {strength.text && (
                      <p className="text-xs text-muted-foreground">
                        Password strength: <span className="font-medium">{strength.text}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={loading}
                    required
                  />
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                  )}
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
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>


          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Sign in instead
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
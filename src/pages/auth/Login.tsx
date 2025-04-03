import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { supabase, signInWithGoogle } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import LegalLinks from '../../components/LegalLinks';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import RecaptchaWrapper from '../../components/RecaptchaWrapper';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  // Check if user was redirected from another page
  useEffect(() => {
    const from = location.state?.from?.pathname;
    if (from) {
      toast.info(`Please sign in to access ${from}`);
    }
  }, [location]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      
      if (!recaptchaToken) {
        toast.error('reCAPTCHA verification failed');
        return;
      }
      
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Get user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (userError) {
          // If user doesn't exist in the users table, create a new record
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: authData.user.email,
              full_name: authData.user.user_metadata?.full_name || null,
              avatar_url: authData.user.user_metadata?.avatar_url || null,
              role: 'user',
              subscription_type: 'free',
              ai_credits: 10,
              listing_credits: 5
            })
            .select()
            .single();
            
          if (createError) throw createError;
          
          // Set user in store
          setUser(newUser);
        } else {
          // Set user in store
          setUser(userData);
        }

        // Check if user is flagged
        const { data: flagData } = await supabase
          .from('user_behavior_flags')
          .select('*')
          .eq('user_id', authData.user.id)
          .eq('status', 'active')
          .limit(1);

        if (flagData && flagData.length > 0) {
          // User is flagged, show warning but allow login
          toast.warning('Your account has been flagged for review. Some features may be limited.');
        }

        toast.success('Logged in successfully!');
        
        // Redirect to the page they were trying to access, or dashboard
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from);
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Error with Google sign in:', error);
      toast.error(error.message || 'Failed to sign in with Google');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setResetSubmitting(true);
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('Password reset link sent to your email');
      setForgotPassword(false);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setResetSubmitting(false);
    }
  };

  if (forgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-400/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <h2 className="text-2xl font-bold">Reset your password</h2>
            <p className="text-gray-600">
              Enter your email and we'll send you a reset link
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={resetSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white"
              >
                {resetSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <button
              onClick={() => setForgotPassword(false)}
              className="text-sm text-blue-600 hover:underline"
            >
              Back to login
            </button>
            <LegalLinks className="justify-center" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-400/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="text-gray-600">
            Sign in to your ListHouze account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => setForgotPassword(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                {...register('password', {
                  required: 'Password is required',
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" {...register('rememberMe')} />
              <label
                htmlFor="remember"
                className="text-sm text-gray-600 leading-none"
              >
                Remember me
              </label>
            </div>

            {/* Hidden reCAPTCHA */}
            <div className="hidden">
              <RecaptchaWrapper
                siteKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={setRecaptchaToken}
                action="login"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !recaptchaToken}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
          <LegalLinks className="justify-center" />
        </CardFooter>
      </Card>
    </div>
  );
}
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { supabase, signInWithGoogle } from '../../lib/supabase';
import LegalLinks from '../../components/LegalLinks';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import RecaptchaWrapper from '../../components/RecaptchaWrapper';

type UserType = 'business' | 'lister' | 'buyer';

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  userType: UserType[];
  agreeToTerms: boolean;
}

// List of disposable email domains
const disposableEmailDomains = [
  'mailinator.com', 'tempmail.com', 'throwawaymail.com', 'guerrillamail.com',
  'yopmail.com', '10minutemail.com', 'mailnesia.com', 'temp-mail.org',
  'fakeinbox.com', 'sharklasers.com', 'trashmail.com', 'getnada.com',
  'dispostable.com', 'mailcatch.com', 'mintemail.com', 'mailinator.net'
];

// Suspicious name patterns
const suspiciousNamePatterns = [
  /^test\s/i, /^test$/i, /^user\s/i, /^user$/i, /^admin\s/i, /^admin$/i,
  /^[a-z]{1,2}\s[a-z]{1,2}$/i, /^[0-9]+\s[0-9]+$/i, /^[a-z]{1,2}[0-9]{1,2}$/i,
  /^anonymous/i, /^fake/i, /^dummy/i, /^sample/i, /^example/i, /^abc\s/i, /^xyz\s/i
];

export default function SignUp() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<SignUpFormData>({
    defaultValues: {
      userType: []
    }
  });
  const password = watch('password');
  const userTypes = watch('userType');

  const validateEmail = (email: string) => {
    // Check for basic email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return 'Invalid email address';
    }

    // Check for disposable email domains
    const domain = email.split('@')[1].toLowerCase();
    if (disposableEmailDomains.includes(domain)) {
      return 'Please use a valid personal or business email address';
    }

    // Check for suspicious patterns
    if (/^test@|^admin@|^user@|^123@|^abc@|^xyz@/i.test(email)) {
      return 'Please use a valid personal or business email address';
    }

    return true;
  };

  const validateFullName = (name: string) => {
    if (!name || name.length < 3) {
      return 'Full name is required and must be at least 3 characters';
    }

    // Check for suspicious name patterns
    for (const pattern of suspiciousNamePatterns) {
      if (pattern.test(name)) {
        return 'Please enter your real name';
      }
    }

    return true;
  };

  const handleUserTypeChange = (type: UserType, checked: boolean) => {
    if (checked) {
      setValue('userType', [...userTypes, type]);
    } else {
      setValue('userType', userTypes.filter(t => t !== type));
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setIsSubmitting(true);

      // Check if at least one user type is selected
      if (data.userType.length === 0) {
        toast.error('Please select at least one user type');
        setIsSubmitting(false);
        return;
      }

      // Check for suspicious patterns
      const emailValidation = validateEmail(data.email);
      if (typeof emailValidation === 'string') {
        toast.error(emailValidation);
        setIsSubmitting(false);
        return;
      }

      const nameValidation = validateFullName(data.fullName);
      if (typeof nameValidation === 'string') {
        toast.error(nameValidation);
        setIsSubmitting(false);
        return;
      }

      // Determine user role based on selected types
      const role = data.userType.includes('business') ? 'business' : 'user';

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            user_types: data.userType
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { data: userData, error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.fullName,
            role: role,
            user_types: data.userType
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Continue anyway since the auth user was created
        }

        // Check for suspicious behavior
        try {
          await supabase.functions.invoke('flag-suspicious-user', {
            body: { 
              userId: authData.user.id,
              email: data.email,
              fullName: data.fullName
            }
          });
        } catch (flagError) {
          console.error('Error flagging user:', flagError);
          // Continue anyway since this is just a security check
        }

        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Error with Google sign up:', error);
      toast.error(error.message || 'Failed to sign up with Google');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-400/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <h2 className="text-2xl font-bold">Create an account</h2>
          <p className="text-gray-600">
            Enter your details to create your ListHouze account
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
                  validate: validateEmail
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                {...register('fullName', {
                  required: 'Full name is required',
                  validate: validateFullName
                })}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message: 'Password must include uppercase, lowercase, number and special character'
                  }
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value =>
                    value === password || 'The passwords do not match',
                })}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>I am a:</Label>
              <div className="grid grid-cols-3 gap-4">
                <label
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={userTypes.includes('buyer')}
                    onChange={(e) => handleUserTypeChange('buyer', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="capitalize">Buyer</span>
                </label>
                <label
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={userTypes.includes('lister')}
                    onChange={(e) => handleUserTypeChange('lister', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="capitalize">Lister</span>
                </label>
                <label
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={userTypes.includes('business')}
                    onChange={(e) => handleUserTypeChange('business', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="capitalize">Business</span>
                </label>
              </div>
              {userTypes.length === 0 && (
                <p className="text-sm text-red-500">Please select at least one option</p>
              )}
            </div>

            {/* Hidden reCAPTCHA */}
            <div className="hidden">
              <RecaptchaWrapper
                siteKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={setRecaptchaToken}
                action="signup"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <Checkbox
                  id="terms"
                  {...register('agreeToTerms', {
                    required: 'You must agree to the terms and conditions',
                  })}
                />
                <label
                  htmlFor="terms"
                  className="ml-2 text-sm text-gray-600 leading-none"
                >
                  I agree to the{' '}
                  <Link to="/legal/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{', '}
                  <Link to="/legal/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>{', '}
                  <Link to="/legal/cookies" className="text-blue-600 hover:underline">
                    Cookie Policy
                  </Link>{', and '}
                  <Link to="/legal/acceptable-use" className="text-blue-600 hover:underline">
                    Acceptable Use Policy
                  </Link>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-500">{errors.agreeToTerms.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || userTypes.length === 0 || !recaptchaToken}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </span>
              ) : (
                'Create Account'
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
            onClick={handleGoogleSignUp}
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Sign up with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
          <LegalLinks className="justify-center" />
        </CardFooter>
      </Card>
    </div>
  );
}
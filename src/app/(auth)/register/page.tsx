// ============================================================
// AttendX — Register Page
// ============================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Mail, Lock, User, ScanFace } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (): { label: string; color: string; width: string } => {
    if (!password) return { label: '', color: '', width: '0%' };
    if (password.length < 6) return { label: 'Weak', color: 'bg-ios-red', width: '25%' };
    if (password.length < 8) return { label: 'Fair', color: 'bg-ios-orange', width: '50%' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { label: 'Strong', color: 'bg-ios-green', width: '100%' };
    return { label: 'Good', color: 'bg-ios-blue', width: '75%' };
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Account created! Check your email to confirm.');
      router.push('/login');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="animate-fade-in-up">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-ios-blue to-[#5856d6] rounded-[var(--radius-ios-md)] flex items-center justify-center shadow-[var(--shadow-lg)]">
          <ScanFace className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
        <p className="text-muted text-sm mt-1">Join AttendX today</p>
      </div>

      <Card className="mb-4">
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            id="register-name"
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            icon={<User className="w-5 h-5" />}
            autoComplete="name"
          />

          <Input
            id="register-email"
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            icon={<Mail className="w-5 h-5" />}
            autoComplete="email"
          />

          <div>
            <Input
              id="register-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock className="w-5 h-5" />}
              autoComplete="new-password"
            />
            {password && (
              <div className="mt-2 ml-1">
                <div className="h-1 w-full bg-ios-gray-5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} rounded-full transition-all duration-300`}
                    style={{ width: strength.width }}
                  />
                </div>
                <p className="text-xs text-muted mt-1">{strength.label}</p>
              </div>
            )}
          </div>

          <Input
            id="register-confirm-password"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            icon={<Lock className="w-5 h-5" />}
            autoComplete="new-password"
          />

          <Button type="submit" fullWidth loading={loading} size="lg">
            Create Account
          </Button>
        </form>
      </Card>

      {/* Login link */}
      <p className="text-center text-sm text-muted mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-ios-blue font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}

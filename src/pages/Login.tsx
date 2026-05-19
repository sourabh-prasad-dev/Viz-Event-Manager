import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth, useToast } from '@/context/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);

    if (success) {
      addToast('success', 'Welcome back!', 'You have been logged in successfully.');
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
      addToast('error', 'Login failed', 'Please check your credentials and try again.');
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in-scale">
      <div className="glass rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/30">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-surface-100 mb-2">Welcome Back</h1>
          <p className="text-sm text-surface-400">Sign in to manage your events</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            label="Email"
            type="email"
            placeholder="admin@vizevent.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer hover:text-surface-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            error={error}
            required
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            size="lg"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-6 p-4 rounded-xl bg-surface-800/50 border border-surface-700/50">
          <p className="text-xs font-medium text-surface-400 mb-2">Demo Credentials</p>
          <div className="space-y-1.5 text-xs text-surface-500">
            <p>
              <span className="text-primary-400">Super Admin:</span> admin@vizevent.com / admin123
            </p>
            <p>
              <span className="text-accent-400">Event Admin:</span> manager@vizevent.com / manager123
            </p>
            <p>
              <span className="text-success-400">Scanner:</span> scanner@vizevent.com / scanner123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

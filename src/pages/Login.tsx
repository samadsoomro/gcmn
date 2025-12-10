import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import collegeLogo from '@/assets/images/college-logo.png';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate(result.user?.role === 'admin' ? '/admin' : '/');
    } else {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center p-4 pakistan-bg pt-24" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      <motion.div 
        className="w-full max-w-md bg-card p-8 rounded-2xl shadow-xl border border-border" 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden shadow-lg bg-white p-2">
            <img 
              src={collegeLogo} 
              alt="GCMN College Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your GCMN Library account</p>
        </div>
        
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              <Mail size={16} />
              Email
            </label>
            <Input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              placeholder="your@email.com" 
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              <Lock size={16} />
              Password
            </label>
            <Input 
              type="password" 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              placeholder="••••••••" 
            />
          </div>
          
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Register here
          </Link>
        </p>
        
        <p className="text-center text-xs text-muted-foreground mt-4">
          Demo: admin@gcmn.edu.pk / admin123
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Login;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, AlertCircle, Phone, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import collegeLogo from '@/assets/images/college-logo.png';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const departments = [
    'Computer Science',
    'Commerce',
    'Arts',
    'Science',
    'Economics',
    'Mathematics',
    'Physics',
    'Chemistry',
    'English',
    'Urdu',
    'Islamic Studies',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.full_name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    const result = await register({
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name,
      phone: formData.phone,
      department: formData.department,
    });
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center p-4 pakistan-bg pt-24 pb-8" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      <motion.div 
        className="w-full max-w-md bg-card p-8 rounded-2xl shadow-xl border border-border" 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-xl overflow-hidden shadow-lg bg-white p-2">
            <img 
              src={collegeLogo} 
              alt="GCMN College Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground">Register for GCMN Library access</p>
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
              <User size={16} />
              Full Name *
            </label>
            <Input 
              type="text" 
              value={formData.full_name} 
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
              placeholder="Enter your full name" 
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              <Mail size={16} />
              Email *
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
              <Phone size={16} />
              Phone Number
            </label>
            <Input 
              type="tel" 
              value={formData.phone} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
              placeholder="+92 300 1234567" 
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              <GraduationCap size={16} />
              Department
            </label>
            <Select 
              value={formData.department} 
              onValueChange={(value) => setFormData({ ...formData, department: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              <Lock size={16} />
              Password *
            </label>
            <Input 
              type="password" 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              placeholder="••••••••" 
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              <Lock size={16} />
              Confirm Password *
            </label>
            <Input 
              type="password" 
              value={formData.confirmPassword} 
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
              placeholder="••••••••" 
            />
          </div>
          
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <UserPlus size={18} />
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in here
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Register;

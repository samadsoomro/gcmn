import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, AlertCircle, Phone, CheckCircle, CreditCard, Briefcase, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import collegeLogo from '@/assets/images/college-logo.png';

interface LibraryCardData {
  card_number: string;
  first_name: string;
  last_name: string;
  class: string;
  field: string;
  roll_no: string;
  status: string;
}

const Register: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'student' | 'non-student'>('student');
  
  // Student form data
  const [studentForm, setStudentForm] = useState({
    cardId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [cardData, setCardData] = useState<LibraryCardData | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState('');
  
  // Non-student form data
  const [nonStudentForm, setNonStudentForm] = useState({
    fullName: '',
    role: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const roles = [
    'Professor',
    'Lecturer',
    'Staff Member',
    'Visitor',
    'Other',
  ];

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const lookupCardId = async () => {
    if (!studentForm.cardId.trim()) {
      setCardError('Please enter your Library Card ID');
      return;
    }

    setCardLoading(true);
    setCardError('');
    setCardData(null);

    try {
      const { data, error } = await supabase
        .from('library_card_applications')
        .select('card_number, first_name, last_name, class, field, roll_no, status')
        .eq('card_number', studentForm.cardId.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setCardError('Library Card ID not found. Please check and try again.');
        return;
      }

      if (data.status !== 'approved') {
        setCardError('Your library card application is still pending approval. Please wait for approval before registering.');
        return;
      }

      setCardData(data);
    } catch (err) {
      console.error('Error looking up card:', err);
      setCardError('Failed to lookup card. Please try again.');
    } finally {
      setCardLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!cardData) {
      setError('Please lookup your Library Card ID first');
      return;
    }

    if (!studentForm.email || !studentForm.password || !studentForm.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (studentForm.password !== studentForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (studentForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: studentForm.email,
        password: studentForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: `${cardData.first_name} ${cardData.last_name}`,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        await supabase.from('profiles').insert({
          user_id: authData.user.id,
          full_name: `${cardData.first_name} ${cardData.last_name}`,
          student_class: cardData.class,
          department: cardData.field,
          roll_number: cardData.roll_no,
        });

        // Create student record
        await supabase.from('students').insert({
          user_id: authData.user.id,
          card_id: cardData.card_number,
          name: `${cardData.first_name} ${cardData.last_name}`,
          class: cardData.class,
          field: cardData.field,
          roll_no: cardData.roll_no,
        });

        setSuccess(true);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNonStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nonStudentForm.fullName || !nonStudentForm.role || !nonStudentForm.email || !nonStudentForm.password || !nonStudentForm.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (nonStudentForm.password !== nonStudentForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (nonStudentForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: nonStudentForm.email,
        password: nonStudentForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: nonStudentForm.fullName,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        await supabase.from('profiles').insert({
          user_id: authData.user.id,
          full_name: nonStudentForm.fullName,
          phone: nonStudentForm.phone,
        });

        // Create non-student record
        await supabase.from('non_students').insert({
          user_id: authData.user.id,
          name: nonStudentForm.fullName,
          role: nonStudentForm.role,
          phone: nonStudentForm.phone,
        });

        setSuccess(true);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center p-4 pakistan-bg pt-24" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="w-full max-w-md bg-card p-8 rounded-2xl shadow-xl border border-border text-center" 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <CheckCircle size={64} className="mx-auto text-emerald-500 mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Registration Successful!</h1>
          <p className="text-muted-foreground mb-6">
            Your account has been created successfully. You can now log in to access the library.
          </p>
          <Link to="/login">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center p-4 pakistan-bg pt-24 pb-8" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      <motion.div 
        className="w-full max-w-lg bg-card p-8 rounded-2xl shadow-xl border border-border" 
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

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'student' | 'non-student')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="student" className="gap-2">
              <CreditCard size={16} />
              Student
            </TabsTrigger>
            <TabsTrigger value="non-student" className="gap-2">
              <Briefcase size={16} />
              Staff/Visitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              {/* Library Card ID Lookup */}
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CreditCard size={16} />
                    Library Card ID
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Enter your Library Card ID to auto-fill your details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input 
                      value={studentForm.cardId}
                      onChange={(e) => setStudentForm({ ...studentForm, cardId: e.target.value.toUpperCase() })}
                      placeholder="e.g., CS-125-11"
                      className="font-mono"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={lookupCardId}
                      disabled={cardLoading}
                    >
                      {cardLoading ? '...' : <Search size={18} />}
                    </Button>
                  </div>
                  {cardError && (
                    <p className="text-xs text-destructive">{cardError}</p>
                  )}
                  {cardData && (
                    <div className="bg-muted/50 p-3 rounded-lg space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Name:</span> <span className="font-medium">{cardData.first_name} {cardData.last_name}</span></p>
                      <p><span className="text-muted-foreground">Class:</span> <span className="font-medium">{cardData.class}</span></p>
                      <p><span className="text-muted-foreground">Field:</span> <span className="font-medium">{cardData.field}</span></p>
                      <p><span className="text-muted-foreground">Roll No:</span> <span className="font-medium">{cardData.roll_no}</span></p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {cardData && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                      <Mail size={16} />
                      Email *
                    </label>
                    <Input 
                      type="email" 
                      value={studentForm.email} 
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} 
                      placeholder="your@email.com" 
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                      <Lock size={16} />
                      Password *
                    </label>
                    <Input 
                      type="password" 
                      value={studentForm.password} 
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} 
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
                      value={studentForm.confirmPassword} 
                      onChange={(e) => setStudentForm({ ...studentForm, confirmPassword: e.target.value })} 
                      placeholder="••••••••" 
                    />
                  </div>
                  
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    <UserPlus size={18} />
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </>
              )}
            </form>
          </TabsContent>

          <TabsContent value="non-student">
            <form onSubmit={handleNonStudentSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <User size={16} />
                  Full Name *
                </label>
                <Input 
                  type="text" 
                  value={nonStudentForm.fullName} 
                  onChange={(e) => setNonStudentForm({ ...nonStudentForm, fullName: e.target.value })} 
                  placeholder="Enter your full name" 
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <Briefcase size={16} />
                  Role *
                </label>
                <Select 
                  value={nonStudentForm.role} 
                  onValueChange={(value) => setNonStudentForm({ ...nonStudentForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <Mail size={16} />
                  Email *
                </label>
                <Input 
                  type="email" 
                  value={nonStudentForm.email} 
                  onChange={(e) => setNonStudentForm({ ...nonStudentForm, email: e.target.value })} 
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
                  value={nonStudentForm.phone} 
                  onChange={(e) => setNonStudentForm({ ...nonStudentForm, phone: e.target.value })} 
                  placeholder="+92 300 1234567" 
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <Lock size={16} />
                  Password *
                </label>
                <Input 
                  type="password" 
                  value={nonStudentForm.password} 
                  onChange={(e) => setNonStudentForm({ ...nonStudentForm, password: e.target.value })} 
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
                  value={nonStudentForm.confirmPassword} 
                  onChange={(e) => setNonStudentForm({ ...nonStudentForm, confirmPassword: e.target.value })} 
                  placeholder="••••••••" 
                />
              </div>
              
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <UserPlus size={18} />
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in here
          </Link>
        </p>
        
        <p className="text-center text-xs text-muted-foreground mt-4">
          Don't have a Library Card?{' '}
          <Link to="/library-card" className="text-primary font-medium hover:underline">
            Apply for one here
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Register;
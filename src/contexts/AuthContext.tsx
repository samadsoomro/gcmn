import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'admin';
  department?: string;
  class?: string;
  roll_number?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
}

interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  roll_number?: string;
  department?: string;
  class?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('gcmn_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Invalid stored user:', error);
        localStorage.removeItem('gcmn_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // Demo login - in production, this would call the backend API
      // Admin credentials for demo
      if (email === 'admin@gcmn.edu.pk' && password === 'admin123') {
        const adminUser: User = {
          id: '1',
          email: 'admin@gcmn.edu.pk',
          full_name: 'Library Admin',
          role: 'admin',
        };
        setUser(adminUser);
        localStorage.setItem('gcmn_user', JSON.stringify(adminUser));
        return { success: true, user: adminUser };
      }

      // Student login demo
      if (email && password.length >= 6) {
        const studentUser: User = {
          id: '2',
          email: email,
          full_name: email.split('@')[0],
          role: 'student',
          department: 'Computer Science',
          class: 'Class 12',
        };
        setUser(studentUser);
        localStorage.setItem('gcmn_user', JSON.stringify(studentUser));
        return { success: true, user: studentUser };
      }

      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // Demo registration - in production, this would call the backend API
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        full_name: userData.full_name,
        role: 'student',
        department: userData.department,
        class: userData.class,
        roll_number: userData.roll_number,
      };
      setUser(newUser);
      localStorage.setItem('gcmn_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An error occurred during registration' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gcmn_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

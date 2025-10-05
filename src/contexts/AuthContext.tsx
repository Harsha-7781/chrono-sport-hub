import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';
import { toast } from '@/hooks/use-toast';
import { authApi } from '@/services/api'; // <--- NEW IMPORT

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// NOTE: MOCK_USERS and hardcoded logic removed and replaced by API calls in login/register.

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session and JWT token
    const savedUser = localStorage.getItem('sportsapp_user');
    const savedToken = localStorage.getItem('sportsapp_token'); // <--- NEW: Read token
    
    if (savedUser && savedToken) {
      try {
        // In a real app, you might validate the token with an API call here.
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('sportsapp_user');
        localStorage.removeItem('sportsapp_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // REPLACE MOCK LOGIC WITH REAL API CALL
      const response = await authApi.login(email, password);
      const userWithoutPassword = response.user;
      const token = response.token;

      setUser(userWithoutPassword);
      localStorage.setItem('sportsapp_user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('sportsapp_token', token); // <--- NEW: Store token
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${userWithoutPassword.name}`,
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: 'admin' | 'player') => {
    setIsLoading(true);
    
    try {
      // REPLACE MOCK LOGIC WITH REAL API CALL
      const response = await authApi.register(email, password, name, role);
      const newUser = response.user;
      const token = response.token;

      setUser(newUser);
      localStorage.setItem('sportsapp_user', JSON.stringify(newUser));
      localStorage.setItem('sportsapp_token', token); // <--- NEW: Store token
      
      toast({
        title: "Account created!",
        description: `Welcome ${newUser.name}`,
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sportsapp_user');
    localStorage.removeItem('sportsapp_token'); // <--- NEW: Remove token
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
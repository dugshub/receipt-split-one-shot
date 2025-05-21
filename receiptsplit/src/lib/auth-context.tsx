// lib/auth-context.tsx - Authentication context for client components
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setClientToken, getClientToken, removeClientToken } from './auth-helpers';

// Core types for auth context
type User = { id: string; username: string; email: string; };

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = getClientToken();
        
        if (!token) {
          setIsLoading(false);
          return;
        }

        // For demo purposes - handle mock token
        if (token === 'demo-token-123') {
          setUser({
            id: 'demo-user-1',
            username: 'user1',
            email: 'user1@example.com'
          });
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // If token is invalid, remove it
          removeClientToken();
        }
      } catch (error) {
        console.error('Authentication error:', error);
        removeClientToken();
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // For demo purposes, allow a mock login with the default user
      if (email === 'user1@example.com' && password === 'password123') {
        console.log('Using mock login for demo purposes');
        // Create mock user and token
        const mockUser = {
          id: 'demo-user-1',
          username: 'user1',
          email: 'user1@example.com'
        };
        const mockToken = 'demo-token-123';
        
        // Store token and user data
        setClientToken(mockToken);
        setUser(mockUser);
        setIsLoading(false);
        return;
      }
      
      // Otherwise try actual login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const { token, user: userData } = await response.json();
      
      // Store token and user data
      setClientToken(token);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // For demo purposes, allow a mock registration
      if (true) {
        console.log('Using mock registration for demo purposes');
        // Create mock user and token
        const mockUser = {
          id: `demo-user-${Date.now()}`,
          username,
          email
        };
        const mockToken = `demo-token-${Date.now()}`;
        
        // Store token and user data
        setClientToken(mockToken);
        setUser(mockUser);
        setIsLoading(false);
        return;
      }
      
      // Real registration code (not used in demo)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const { token, user: userData } = await response.json();
      
      // Store token and user data
      setClientToken(token);
      setUser(userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // For demo mode, just log out locally, don't make API call
    const token = getClientToken();
    const isDemoMode = token && token.startsWith('demo-token');
    
    removeClientToken();
    setUser(null);
    
    // Only call logout API for non-demo mode
    if (!isDemoMode) {
      fetch('/api/auth/logout', { method: 'POST' })
        .catch(error => console.error('Logout error:', error));
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for accessing auth context
export const useAuth = () => useContext(AuthContext);
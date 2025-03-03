// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContextType, AuthProviderProps, User } from '@/components/types/auth';
import { loginUser, registerUser } from '@/services/authService'; // Assuming you have API functions

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // Assuming a User type
  const [isLoading, setIsLoading] = useState(true); // Loading state during initial check
  const router = useRouter();

  useEffect(() => {
    // Check for persisted user (e.g., from localStorage) on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false); // Mark loading as complete after initial check
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userData = await loginUser(email, password); // Call your API login function
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData)); // Persist user
        return true;
      }
      return false; // Login failed
    } catch (error: any) {
      console.error("Login failed:", error);
      throw new Error(error.message || "Login failed"); // Re-throw to be caught in the component
    }
  };

  // Signup function
  const signup = async (fullName: string, email: string, phone: string, password: string): Promise<boolean> => {
    try {
      const newUser = await registerUser(fullName, email, phone, password); // Call your API register function
      if (newUser) {
        // Optionally, log the user in immediately after signup
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser)); // Persist user
        return true;
      }
      return false; // Signup failed
    } catch (error: any) {
      console.error("Signup failed:", error);
      throw new Error(error.message || "Signup failed"); // Re-throw to be caught in the component
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Remove persisted user
    router.push('/login'); // Redirect to login page
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading, // Expose the loading state
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? children : <div>Loading...</div>} {/* Render children only after initial check */}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
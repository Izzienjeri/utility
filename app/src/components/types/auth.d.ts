// src/components/types/auth.d.ts

export interface User {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    // Add other user properties as needed
  }
  
  export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (fullName: string, email: string, phone: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean; // Add isLoading to the context type
  }
  
  export interface AuthProviderProps {
    children: ReactNode;
  }
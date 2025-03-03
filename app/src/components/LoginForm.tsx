"use client";

// src/components/Auth/LoginForm.tsx
import React, { useState } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import ErrorMessage from './ui/ErrorMessage';
import { useRouter } from 'next/navigation'; // Correct import
import { useAuth } from '@/context/AuthContext'; // Assuming you have an AuthContext

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Assuming you have a login function in your AuthContext

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = await login(email, password); // Call the login function from the context
      if (success) {
        // Redirect on successful login
        router.push('/dashboard'); // Replace with your dashboard route
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-md shadow-md bg-white">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Login</h2>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" isLoading={isLoading} className="w-full">
          Log In
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
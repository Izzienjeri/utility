// src/app/page.tsx

import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import { AuthProvider } from '@/context/AuthContext';

export default function Home() {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-E2D7E3">
        <div className="flex flex-col md:flex-row space-y-8 md:space-x-16">
          <LoginForm />
          <SignupForm />
        </div>
      </main>
    </AuthProvider>
  );
}
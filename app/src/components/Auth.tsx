'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Lock, 
  UserPlus, 
  LogOut, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  Heart,
  ArrowRight 
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

interface AuthProps {
  initialRoute: 'login' | 'register' | 'dashboard';
}

const formatPhoneNumber = (value: string) => {
  const cleaned = ('' + value).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (!match) return value;
  let formatted = '';
  if (match[1]) formatted += `(${match[1]}`;
  if (match[2]) formatted += `) ${match[2]}`;
  if (match[3]) formatted += `-${match[3]}`;
  return formatted;
};

const Auth: React.FC<AuthProps> = ({ initialRoute }) => {
  const [route, setRoute] = useState(initialRoute);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (route === 'dashboard' && !accessToken) {
      setRoute('login');
    }
  }, [route]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('accessToken', data.access_token);
        setRoute('dashboard');
        router.push('/dashboard');
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError('An error occurred during login.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }
  
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ full_name: fullName, email, phone, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setSuccessMessage(data.message || 'Registration successful!');
        setError('');
        setRoute('login');
      } else {
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          setError(`Registration failed: ${errorMessages}`);
        } else {
          setError(data.message || 'Registration failed.');
        }
        setSuccessMessage('');
        console.error('Registration error:', data);
      }
    } catch (err) {
      setError('An error occurred during registration.');
      setSuccessMessage('');
      console.error('Registration fetch error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
      });

      if (response.ok) {
        localStorage.removeItem('accessToken');
        setRoute('login');
        router.push('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.03, boxShadow: '0 7px 20px rgba(0, 0, 0, 0.15)', transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.2 } }
  };

  const InputField = ({
    label,
    id,
    type,
    placeholder,
    value,
    onChange,
    Icon,
    showVisibilityToggle,
    onVisibilityToggle,
    format
  }: {
    label: string;
    id: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    Icon: React.ComponentType<{ className?: string; size?: number }>;
    showVisibilityToggle?: boolean;
    onVisibilityToggle?: () => void;
    format?: (value: string) => string;
  }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const formattedValue = format ? format(rawValue) : rawValue;
      onChange(e);
      if (format) {
        e.target.value = formattedValue;
      }
    };
    return (
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor={id}>
          <Icon className="inline-block mr-2 align-middle text-gray-500" size={16} />
          <span className="align-middle">{label}</span>
        </label>
        <div className="relative">
          <input
            className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-purple-400 transition-shadow duration-200 text-sm"
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
          />
          {showVisibilityToggle && (
            <button
              type="button"
              onClick={onVisibilityToggle}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 focus:outline-none transition-colors duration-200"
            >
              {type === 'password' ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  const renderLoginForm = () => (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div 
        className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-gray-200"
        variants={itemVariants}
      >
        <div className="h-2 bg-gradient-to-r from-pink-500 to-purple-500"></div>
        
        <div className="px-8 pt-8 pb-10">
          <motion.div 
            className="flex flex-col items-center mb-8"
            variants={itemVariants}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-md">
              <Lock className="text-white" size={30} />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 mt-4 tracking-tight">Welcome Back</h2>
            <p className="text-gray-600 mt-2 text-center text-sm">Welcome back! Enter your credentials to access your account.</p>
          </motion.div>

          {error && (
            <motion.div 
              className="mb-6 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin}>
            <InputField
              label="Email Address"
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              Icon={Mail}
            />

            <InputField
              label="Password"
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              Icon={Lock}
              showVisibilityToggle={true}
              onVisibilityToggle={togglePasswordVisibility}
            />

            <motion.div className="flex items-center justify-between" variants={itemVariants}>
              <motion.button
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                disabled={isSubmitting}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-pink-300 group-hover:text-pink-200 transition-colors duration-300" aria-hidden="true" />
                </span>
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </motion.button>
            </motion.div>
          </form>

          <motion.div 
            className="mt-8 text-center"
            variants={itemVariants}
          >
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => setRoute('register')}
                className="text-purple-600 font-bold hover:underline focus:outline-none"
              >
                Sign Up
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderRegisterForm = () => (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        className="w-full max-w-md my-8"
        variants={itemVariants}
      >
        <motion.div 
          className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-gray-200"
          variants={itemVariants}
        >
          <div className="h-2 bg-gradient-to-r from-pink-500 to-purple-500"></div>
          
          <div className="px-8 pt-8 pb-10">
            <motion.div 
              className="flex flex-col items-center mb-8"
              variants={itemVariants}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-md">
                <UserPlus className="text-white" size={30} />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-800 mt-4 tracking-tight">Create Account</h2>
              <p className="text-gray-600 mt-2 text-center text-sm">Join our community and unlock amazing benefits!</p>
            </motion.div>

            {error && (
              <motion.div 
                className="mb-6 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                className="mb-6 p-3 bg-green-100 border border-green-300 text-green-700 text-sm rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {successMessage}
              </motion.div>
            )}

            <form onSubmit={handleRegister}>
              <InputField
                label="Full Name"
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                Icon={UserPlus}
              />

              <InputField
                label="Email Address"
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                Icon={Mail}
              />

              <InputField
                label="Phone Number"
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                Icon={Phone}
                format={formatPhoneNumber}
              />

              <InputField
                label="Password"
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                Icon={Lock}
                showVisibilityToggle={true}
                onVisibilityToggle={togglePasswordVisibility}
              />

              <InputField
                label="Confirm Password"
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                Icon={Lock}
                showVisibilityToggle={true}
                onVisibilityToggle={toggleConfirmPasswordVisibility}
              />

              <motion.div className="flex items-center justify-between" variants={itemVariants}>
                <motion.button
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  disabled={isSubmitting}
                >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <UserPlus className="h-5 w-5 text-pink-300 group-hover:text-pink-200 transition-colors duration-300" aria-hidden="true" />
                </span>
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </motion.button>
              </motion.div>
            </form>

            <motion.div 
              className="mt-8 text-center"
              variants={itemVariants}
            >
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => setRoute('login')}
                  className="text-purple-600 font-bold hover:underline focus:outline-none"
                >
                  Sign In
                </button>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  const renderDashboard = () => (
    <motion.div
      className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-pink-50 py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-gray-200"
          variants={itemVariants}
        >
          <div className="h-2 bg-gradient-to-r from-pink-500 to-purple-500"></div>
          
          <div className="px-8 py-12">
            <motion.div 
              className="flex flex-col items-center mb-12"
              variants={itemVariants}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-md">
                <Heart className="text-white" size={40} />
              </div>
              <h2 className="text-4xl font-extrabold text-gray-800 mb-2 tracking-tight">Your Dashboard</h2>
              <p className="text-gray-600 text-center max-w-md text-sm">Manage your account and explore our amazing features.</p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
              variants={itemVariants}
            >
              {[1, 2, 3].map((item) => (
                <motion.div
                  key={item}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Section {item}</h3>
                  <p className="text-gray-600 text-sm">Placeholder content for dashboard section {item}.</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="flex justify-center"
              variants={itemVariants}
            >
              <motion.button
                onClick={handleLogout}
                className="group relative flex justify-center py-3 px-6 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-300 shadow-md hover:shadow-lg"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LogOut className="h-5 w-5 text-pink-300 group-hover:text-pink-200 transition-colors duration-300" aria-hidden="true" />
                </span>
                Sign Out
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  if (route === 'login') {
    return renderLoginForm();
  } else if (route === 'register') {
    return renderRegisterForm();
  } else if (route === 'dashboard') {
    return renderDashboard();
  }

  return null;
};

export default Auth;
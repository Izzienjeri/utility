// app/src/components/Auth.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import WelcomeScreen from './WelcomeScreen';

const API_BASE_URL = 'http://localhost:5000'; // Replace with your backend URL

interface AuthProps {
    initialRoute: 'login' | 'register' | 'billForm' | 'dashboard' | 'welcome';
}

const Auth: React.FC<AuthProps> = ({ initialRoute }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [userId, setUserId] = useState(''); // Store the user ID

    const router = useRouter();
    const searchParams = useSearchParams();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please enter both email and password.');
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
                router.push('/?page=dashboard'); // Redirect to the dashboard after login
            } else {
                setError(data.message || 'Login failed.');
            }
        } catch (err) {
            setError('An error occurred during login.');
            console.error(err);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName || !email || !phone || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
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
                setUserId(data.user.id); // Save the user ID upon successful registration
                localStorage.setItem('accessToken', data.access_token);
                router.push('/?page=dashboard'); // Redirect to the dashboard after registration
            } else {
                // More detailed error handling
                if (data.errors) {
                    // Format validation errors
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
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // Animation variants
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
        hover: { scale: 1.05, transition: { duration: 0.2 } },
        tap: { scale: 0.95, transition: { duration: 0.2 } }
    };

    const renderLoginForm = () => (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E2D7E3] via-[#BCAFBD] to-[#E9ADBC]">
            <motion.div
                className="w-full max-w-md"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <motion.div
                    className="bg-white backdrop-blur-lg bg-opacity-90 rounded-3xl shadow-2xl overflow-hidden"
                    variants={itemVariants}
                >
                    <div className="h-3 bg-gradient-to-r from-[#E9ADBC] to-[#E17295]"></div>

                    <div className="px-8 pt-8 pb-10">
                        <motion.div
                            className="flex flex-col items-center mb-8"
                            variants={itemVariants}
                        >
                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-[#E9ADBC] to-[#E17295] mb-4 shadow-lg">
                                <Lock className="text-white" size={30} />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
                            <p className="text-[#BCAFBD] mt-2 text-center">Sign in to access your account</p>
                        </motion.div>

                        {error && (
                            <motion.div
                                className="mb-6 p-3 bg-red-50 border border-red-200 text-red-500 text-sm rounded-lg"
                                initial={{ opacity: 0, y: -10 }}
                               animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleLogin}>
                            <motion.div className="mb-6" variants={itemVariants}>
                                <label className="block text-[#BCAFBD] text-sm font-medium mb-2" htmlFor="email">
                                    <Mail className="inline-block mr-2" size={16} />
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E9ADBC] focus:border-transparent transition-all duration-200 outline-none"
                                        id="email"
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </motion.div>

                            <motion.div className="mb-8" variants={itemVariants}>
                                <label className="block text-[#BCAFBD] text-sm font-medium mb-2" htmlFor="password">
                                    <Lock className="inline-block mr-2" size={16} />
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E9ADBC] focus:border-transparent transition-all duration-200 outline-none"
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#E17295] focus:outline-none transition-colors duration-200"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div className="flex items-center justify-between" variants={itemVariants}>
                                <motion.button
                                    className="w-full bg-gradient-to-r from-[#E9ADBC] to-[#E17295] text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50 transition-all duration-300"
                                    type="submit"
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <span>Sign In</span>
                                    <ArrowRight className="ml-2" size={18} />
                                </motion.button>
                            </motion.div>
                        </form>

                        <motion.div
                            className="mt-8 text-center"
                            variants={itemVariants}
                        >
                            <p className="text-[#BCAFBD]">
                                Don't have an account?{' '}
                                <button
                                    onClick={() => router.push('/?page=register')}
                                    className="text-[#E17295] font-medium hover:underline focus:outline-none"
                                >
                                    Sign Up
                                </button>
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );

    const renderRegisterForm = () => (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E2D7E3] via-[#BCAFBD] to-[#E9ADBC]">
            <motion.div
                className="w-full max-w-md my-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <motion.div
                    className="bg-white backdrop-blur-lg bg-opacity-90 rounded-3xl shadow-2xl overflow-hidden"
                    variants={itemVariants}
                >
                    <div className="h-3 bg-gradient-to-r from-[#E9ADBC] to-[#E17295]"></div>

                    <div className="px-8 pt-8 pb-10">
                        <motion.div
                            className="flex flex-col items-center mb-8"
                            variants={itemVariants}
                        >
                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-[#E9ADBC] to-[#E17295] mb-4 shadow-lg">
                                <UserPlus className="text-white" size={30} />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
                            <p className="text-[#BCAFBD] mt-2 text-center">Join us today!</p>
                        </motion.div>

                        {error && (
                            <motion.div
                                className="mb-6 p-3 bg-red-50 border border-red-200 text-red-500 text-sm rounded-lg"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {error}
                            </motion.div>
                        )}

                        {successMessage && (
                            <motion.div
                                className="mb-6 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {successMessage}
                            </motion.div>
                        )}

                        <form onSubmit={handleRegister}>
                            <motion.div className="mb-4" variants={itemVariants}>
                                <label className="block text-[#BCAFBD] text-sm font-medium mb-2" htmlFor="fullName">
                                    <UserPlus className="inline-block mr-2" size={16} />
                                    Full Name
                                </label>
                                <input
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E9ADBC] focus:border-transparent transition-all duration-200 outline-none"
                                    id="fullName"
                                    type="text"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </motion.div>

                            <motion.div className="mb-4" variants={itemVariants}>
                                <label className="block text-[#BCAFBD] text-sm font-medium mb-2" htmlFor="email">
                                    <Mail className="inline-block mr-2" size={16} />
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E9ADBC] focus:border-transparent transition-all duration-200 outline-none"
                                        id="email"
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </motion.div>

                            <motion.div className="mb-4" variants={itemVariants}>
                                <label className="block text-[#BCAFBD] text-sm font-medium mb-2" htmlFor="phone">
                                    <Phone className="inline-block mr-2" size={16} />
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E9ADBC] focus:border-transparent transition-all duration-200 outline-none"
                                        id="phone"
                                        type="tel"
                                        placeholder="+1 (555) 123-4567"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </motion.div>

                            <motion.div className="mb-4" variants={itemVariants}>
                                <label className="block text-[#BCAFBD] text-sm font-medium mb-2" htmlFor="password">
                                    <Lock className="inline-block mr-2" size={16} />
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E9ADBC] focus:border-transparent transition-all duration-200 outline-none"
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#E17295] focus:outline-none transition-colors duration-200"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div className="mb-6" variants={itemVariants}>
                                <label className="block text-[#BCAFBD] text-sm font-medium mb-2" htmlFor="confirmPassword">
                                    <Lock className="inline-block mr-2" size={16} />
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E9ADBC] focus:border-transparent transition-all duration-200 outline-none"
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="••••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleConfirmPasswordVisibility}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#E17295] focus:outline-none transition-colors duration-200"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div className="flex items-center justify-between" variants={itemVariants}>
                                <motion.button
                                    className="w-full bg-gradient-to-r from-[#E9ADBC] to-[#E17295] text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50 transition-all duration-300"
                                    type="submit"
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <span>Create Account</span>
                                    <ArrowRight className="ml-2" size={18} />
                                </motion.button>
                            </motion.div>
                        </form>

                        <motion.div
                            className="mt-8 text-center"
                            variants={itemVariants}
                        >
                            <p className="text-[#BCAFBD]">
                                Already have an account?{' '}
                                <button
                                    onClick={() => router.push('/?page=login')}
                                    className="text-[#E17295] font-medium hover:underline focus:outline-none"
                                >
                                    Sign In
                                </button>
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
    let content;
    switch (initialRoute) {
        case 'login':
            content = renderLoginForm();
            break;
        case 'register':
            content = renderRegisterForm();
            break;
        default:
            content = renderLoginForm(); // Default to login
    }

    return content;
};

export default Auth;
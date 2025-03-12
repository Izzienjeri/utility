// app/src/components/WelcomeScreen.tsx
'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowRight } from 'lucide-react';

const WelcomeScreen = () => {
    const router = useRouter();

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

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <motion.div
                className="w-full max-w-md"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <motion.div
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden"
                    variants={itemVariants}
                >
                    <div className="h-3 bg-gradient-to-r from-[#E91E63] to-[#9C27B0]"></div>

                    <div className="px-8 pt-8 pb-10">
                        <motion.div
                            className="flex flex-col items-center mb-8"
                            variants={itemVariants}
                        >
                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-[#E91E63] to-[#9C27B0] mb-4 shadow-lg">
                                <Heart className="text-white" size={30} />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">Welcome to BillEase!</h2>
                            <p className="text-gray-600 mt-2 text-center">Let’s set up your bills.</p>
                            <p className="text-gray-600 mt-2 text-center">BillEase makes it easy to track and manage your expenses.
                                Get organized and never miss a payment again!
                            </p>
                        </motion.div>

                        <motion.div className="flex items-center justify-center" variants={itemVariants}>
                            <motion.button
                                className="w-full bg-gradient-to-r from-[#E91E63] to-[#9C27B0] text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200/50 hover:shadow-purple-300/50 transition-all duration-300"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => router.push('/?page=billForm')}
                            >
                                <span>Get Started</span>
                                <ArrowRight className="ml-2" size={18} />
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;
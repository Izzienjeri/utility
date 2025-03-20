// File: ./components/dashboard/PaymentHistory.tsx
// app/src/components/dashboard/PaymentHistory.tsx
'use client';

import { motion } from 'framer-motion';

const PaymentHistory = () => {

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

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <motion.h2 className="text-2xl font-semibold mb-4 text-gray-800" variants={itemVariants}>Payment History & Analytics</motion.h2>
            <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700">Transaction History</h3>
                <p className="text-gray-600">List of past payments (Date, Amount, Reference Number)...</p>
            </motion.div>
            <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700">Upcoming Payments</h3>
                <p className="text-gray-600">Shows unpaid bills & due dates...</p>
            </motion.div>
            <motion.div className="bg-white shadow-md rounded-md p-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700">Spending Insights</h3>
                <p className="text-gray-600">Monthly breakdown with graphs...</p>
                <p className="text-gray-600">Total Paid This Month: Track spending trends...</p>
            </motion.div>
        </motion.div>
    );
};

export default PaymentHistory;
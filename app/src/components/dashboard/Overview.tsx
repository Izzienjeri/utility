// app/src/components/dashboard/Overview.tsx
'use client';

import { motion } from 'framer-motion';

const Overview = () => {
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
            <motion.h2 className="text-2xl font-semibold mb-4 text-gray-800" variants={itemVariants}>Overview</motion.h2>
            <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700">Upcoming Bills</h3>
                <p className="text-gray-600">List of bills with due dates...</p>
            </motion.div>
            <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700">Total Due Amount</h3>
                <p className="text-gray-600">Sum of all unpaid bills...</p>
            </motion.div>
            <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700">Recent Transactions</h3>
                <p className="text-gray-600">Last few payments made...</p>
            </motion.div>
            <motion.div className="bg-white shadow-md rounded-md p-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700">Payment Reminder Status</h3>
                <p className="text-gray-600">See if reminders have been sent...</p>
            </motion.div>
        </motion.div>
    );
};

export default Overview;
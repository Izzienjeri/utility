// app/src/components/dashboard/PaymentOptions.tsx
'use client';

import { motion } from 'framer-motion';

const PaymentOptions = () => {
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
            <motion.h2 className="text-2xl font-semibold mb-4 text-gray-800" variants={itemVariants}>Payment Options</motion.h2>
            <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700">Pay Now</h3>
                <p className="text-gray-600">Select a single bill and pay immediately...</p>
            </motion.div>
            <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700">Pay Multiple Bills</h3>
                <p className="text-gray-600">Choose multiple bills and pay together...</p>
            </motion.div>
            <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700">Pay All Bills</h3>
                <p className="text-gray-600">One Mpesa prompt for all unpaid bills...</p>
            </motion.div>
            <motion.div className="bg-white shadow-md rounded-md p-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700">Payment Status</h3>
                <p className="text-gray-600">Shows if a bill is "Paid" or "Pending"...</p>
            </motion.div>
        </motion.div>
    );
};

export default PaymentOptions;
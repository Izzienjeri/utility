// PaymentOptions.tsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react'; // Import useState

const PaymentOptions = () => {
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null); // State for payment status
    const [checkoutRequestID, setCheckoutRequestID] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
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

    const handlePayBill = async () => {
      setError(null);
      setPaymentStatus(null);
        try {
            const billId = 'your_bill_id'; // Replace with the actual bill ID
            const token = localStorage.getItem('accessToken');

            const response = await fetch('/payments/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ bill_id: billId }),
            });

            const data = await response.json();

            if (response.ok) {
                setPaymentStatus('Payment initiated. Check your phone for the prompt.');
                setCheckoutRequestID(data.CheckoutRequestID); // Set the CheckoutRequestID
            } else {
                setError(`Payment failed: ${data.message || 'Unknown error'}`);
                setPaymentStatus(`Payment Failed: ${data.message || 'Unknown error'}`);
            }
        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
            setPaymentStatus(`An error occurred: ${e.message}`);
        }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <motion.h2 className="text-2xl font-semibold mb-4 text-gray-800" variants={itemVariants}>Payment Options</motion.h2>
            {error && <motion.div className="text-red-500 mb-4" variants={itemVariants}>{error}</motion.div>}
            {paymentStatus && <motion.div className="text-green-500 mb-4" variants={itemVariants}>{paymentStatus}</motion.div>}

            <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700">Pay Now</h3>
                <p className="text-gray-600">Select a single bill and pay immediately...</p>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handlePayBill}>Pay Bill</button>
                {checkoutRequestID && <p>Checkout Request ID: {checkoutRequestID}</p>}
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
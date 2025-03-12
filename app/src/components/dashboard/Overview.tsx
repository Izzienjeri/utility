// app/src/components/dashboard/Overview.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const API_BASE_URL = "http://localhost:5000";

interface Bill {
    id: string;
    bill_type: string;
    amount: number;
    due_date: string;
    status: string;
}

interface Transaction {
    id: string;
    bill_id: string;
    user_id: string;
    amount_paid: number;
    payment_reference: string;
    status: string;
    paid_at: string; // Updated to string to match backend DateTime
}

const Overview = () => {
    const [upcomingBills, setUpcomingBills] = useState<Bill[]>([]);
    const [totalDue, setTotalDue] = useState(0);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBills = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Retrieve access token from localStorage
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    setError('No access token found. Please log in.');
                    return;
                }
                setAccessToken(token);

                // Fetch Bills
                const billsResponse = await fetch(`${API_BASE_URL}/bills/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!billsResponse.ok) {
                    throw new Error(`HTTP error fetching bills! status: ${billsResponse.status}`);
                }

                const billsData = await billsResponse.json();
                setUpcomingBills(billsData);

                // Calculate total due amount
                const total = billsData.reduce((sum: number, bill: Bill) => {
                    if (bill.status === 'Pending') {
                        return sum + bill.amount;
                    }
                    return sum;
                }, 0);
                setTotalDue(total);

                // Fetch Recent Transactions
                const transactionsResponse = await fetch(`${API_BASE_URL}/payments/history`, { // Updated endpoint
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!transactionsResponse.ok) {
                    console.warn("Failed to fetch transactions.");
                    setRecentTransactions([]);
                } else {
                    const transactionsData: Transaction[] = await transactionsResponse.json();
                    setRecentTransactions(transactionsData);
                }

            } catch (e: any) {
                setError(`Failed to fetch data: ${e.message}`);
                console.error("Error fetching data:", e);
                setRecentTransactions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBills();
    }, []);

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

            {isLoading && <div>Loading data...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}

            <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700">Upcoming Bills</h3>
                {upcomingBills.length > 0 ? (
                    <ul>
                        {upcomingBills.map(bill => (
                            <li key={bill.id} className="py-2 border-b">
                                {bill.bill_type} - Due: {bill.due_date} - Amount: ${bill.amount}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600">No upcoming bills. Add a bill to get started!</p>
                )}
            </motion.div>

            <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700">Total Due Amount</h3>
                <p className="text-gray-600">
                    {totalDue > 0 ? `$${totalDue}` : 'No bills due.'}
                </p>
            </motion.div>

            <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700">Recent Transactions</h3>
                {recentTransactions.length > 0 ? (
                    <ul>
                        {recentTransactions.map(transaction => (
                            <li key={transaction.id} className="py-2 border-b">
                                Date: {transaction.paid_at} - Amount: ${transaction.amount_paid} - Ref: {transaction.payment_reference}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600">No recent transactions.</p>
                )}
            </motion.div>

            <motion.div className="bg-white shadow-md rounded-md p-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700">Payment Reminder Status</h3>
                <p className="text-gray-600">See if reminders have been sent...</p>
            </motion.div>
        </motion.div>
    );
};

export default Overview;
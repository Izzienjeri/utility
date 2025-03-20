// File: ./components/dashboard/Overview.tsx
// app/src/components/dashboard/Overview.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { format, isWithinInterval, parseISO } from 'date-fns'; // Import date-fns functions
import { toast } from 'sonner'; // Import toast
import { Clock, CheckCircle, AlertTriangle, Wallet, Calendar, LucideIcon } from 'lucide-react'; // Import icons

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
    bill?: Bill; // Add bill property to Transaction Interface
}

const Overview = () => {
    const [upcomingBills, setUpcomingBills] = useState<Bill[]>([]);
    const [totalDue, setTotalDue] = useState(0);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);  // New state
    const [paymentTimeoutId, setPaymentTimeoutId] = useState<NodeJS.Timeout | null>(null); // Timeout ID

    const [billDetails, setBillDetails] = useState<{ [billId: string]: Bill }>({}); // State to hold bill details

    // Define a type for payment status icons
    type PaymentStatusIcons = {
        [key: string]: {
            icon: LucideIcon;
            color: string;
        };
    };

    // Payment Status Icons
    const paymentStatusIcons: PaymentStatusIcons = {
        Completed: { icon: CheckCircle, color: 'text-green-500' },
        Pending: { icon: Clock, color: 'text-yellow-500' },
        Failed: { icon: AlertTriangle, color: 'text-red-500' },
    };

    useEffect(() => {
        const fetchBills = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Retrieve access token from localStorage
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    setError('No access token found. Please log in.');
                    toast.error('No access token found. Please log in.');
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

                // Filter bills due in the next 10 days
                const today = new Date();
                const tenDaysFromNow = new Date();
                tenDaysFromNow.setDate(today.getDate() + 10);

                const upcoming = billsData.filter((bill: Bill) => {
                    const dueDate = parseISO(bill.due_date); // Parse the due date string to a Date object
                    return isWithinInterval(dueDate, { start: today, end: tenDaysFromNow });
                });

                setUpcomingBills(upcoming);

                // Calculate total due amount from the filtered bills
                const total = upcoming.reduce((sum: number, bill: Bill) => {
                    if (bill.status === 'Pending') {
                        return sum + bill.amount;
                    }
                    return sum;
                }, 0);
                setTotalDue(total);

                // Fetch Recent Transactions with Bill details
                const transactionsResponse = await fetch(`${API_BASE_URL}/payments/history`, { // Updated endpoint
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        
                    },
                });

                if (!transactionsResponse.ok) {
                    console.warn("Failed to fetch transactions.");
                    setRecentTransactions([]);
                    toast.error("Failed to fetch transactions.");
                } else {
                    let transactionsData: Transaction[] = await transactionsResponse.json();
                    setRecentTransactions(transactionsData);

                     // Create a map of bill details for easy access
                     const billMap: { [billId: string]: Bill } = {};
                     transactionsData.forEach(transaction => {
                         if (transaction.bill) {
                             billMap[transaction.bill.id] = transaction.bill;
                         }
                     });
                     setBillDetails(billMap);

                }

            } catch (e: any) {
                setError(`Failed to fetch data: ${e.message}`);
                console.error("Error fetching data:", e);
                setRecentTransactions([]);
                toast.error(`Failed to fetch data: ${e.message}`);
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
           

            {isLoading ? (
                <div className="flex items-center justify-center">
                    <Clock className="animate-spin mr-2" /> Loading data...
                </div>
            ) : null}

            {error && <div className="text-red-500 mb-4">Error: {error}</div>}

            <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700 flex items-center"><Calendar className="mr-2" /> Upcoming Bills</h3>
                {upcomingBills.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 text-left text-gray-600">Type</th>
                                    <th className="px-4 py-2 text-left text-gray-600">Due Date</th>
                                    <th className="px-4 py-2 text-left text-gray-600">Amount</th>
                                    <th className="px-4 py-2 text-left text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingBills.map(bill => (
                                    <tr key={bill.id} className="border-b">
                                        <td className="px-4 py-2 text-gray-700">{bill.bill_type}</td>
                                        <td className="px-4 py-2 text-gray-700">{format(parseISO(bill.due_date), 'PPP')}</td>
                                        <td className="px-4 py-2 text-gray-700">Ksh {bill.amount}</td>
                                        <td className="px-4 py-2 text-gray-700">{bill.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600">No upcoming bills in the next 10 days.</p>
                )}
            </motion.div>

            <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700 flex items-center"> <Wallet className="mr-2" /> Total Due Amount</h3>
                <p className="text-gray-600 font-semibold text-xl">
                    {totalDue > 0 ? `Ksh ${totalDue}` : 'No bills due in the next 10 days.'}
                </p>
            </motion.div>

            <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2 text-gray-700 flex items-center"><Clock className="mr-2" /> Recent Transactions</h3>
                {recentTransactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 text-left text-gray-600">Bill Type</th>
                                    <th className="px-4 py-2 text-left text-gray-600">Date</th>
                                    <th className="px-4 py-2 text-left text-gray-600">Amount</th>
                                    <th className="px-4 py-2 text-left text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.map(transaction => {
                                    const formattedDate = format(new Date(transaction.paid_at), 'PPP p');
                                    //const billType = billDetails[transaction.bill_id]?.bill_type || 'Unknown Bill Type';
                                    const billType = transaction.bill?.bill_type || 'Unknown Bill Type';
                                    const statusInfo = paymentStatusIcons[transaction.status] || { icon: AlertTriangle, color: 'text-gray-500' };
                                    const StatusIcon = statusInfo.icon;

                                    return (
                                        <tr key={transaction.id} className="border-b">
                                            <td className="px-4 py-2 text-gray-700">{billType}</td>
                                            <td className="px-4 py-2 text-gray-700">{formattedDate}</td>
                                            <td className="px-4 py-2 text-gray-700">Ksh {transaction.amount_paid}</td>
                                            <td className="px-4 py-2 text-gray-700">
                                                <div className="flex items-center">
                                                    <StatusIcon className={`mr-1 w-4 h-4 ${statusInfo.color}`} />
                                                    {transaction.status}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
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
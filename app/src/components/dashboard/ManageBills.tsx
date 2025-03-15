// ManageBills.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';

const API_BASE_URL = "http://localhost:5000";

interface Bill {
    id: string;
    bill_type: string;
    amount: number;
    due_date: string;
    status: string;
    payment_option: string;
    paybill_number: string | null;
    till_number: string | null;
    account_number: string | null;
}

const ManageBills = () => {
    console.log("ManageBills component rendered"); // ADD THIS LINE
    const [bills, setBills] = useState<Bill[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchBills = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    setError('No access token found. Please log in.');
                    setIsLoading(false); // Stop loading if no token
                    return;
                }
       
                const response = await fetch(`${API_BASE_URL}/bills/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
       
                if (!response.ok) {
                    console.error("API Response Status:", response.status); // Log status code
                    console.error("API Response Text:", await response.text()); // Log response body
                    throw new Error(`HTTP error fetching bills! status: ${response.status}`);
                }
       
                const data: Bill[] = await response.json();
                setBills(data);
                console.log("Bills data:", data); // ADD THIS LINE
            } catch (e: any) {
                setError(`Failed to fetch data: ${e.message}`);
                console.error("Fetch error:", e); // Log the full error
            } finally {
                setIsLoading(false);
            }
        };

        fetchBills();
    }, []);

    const handleDeleteBill = async (billId: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this bill?");
        if (!confirmed) {
            return;
        }
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('No access token found. Please log in.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/bills/${billId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error deleting bill! status: ${response.status}`);
            }

            // Refresh the bill list
            setBills(bills.filter(bill => bill.id !== billId)); //remove from the state
            // Optionally, you could call fetchBills() again to get the updated list from the server
        } catch (e: any) {
            setError(`Failed to delete bill: ${e.message}`);
        }
    };
    const handleEditBill = (billId: string) => {
        router.push(`/?page=billForm&edit=${billId}`); // Navigate to BillForm with bill ID
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

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <motion.h2 className="text-2xl font-semibold mb-4 text-gray-800" variants={itemVariants}>Manage Bills</motion.h2>

            {error && <div className="text-red-500 mb-4">{error}</div>}
            {isLoading ? (
                <div>Loading bills...</div>
            ) : (
                <>
                    <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
                        <h3 className="text-lg font-medium mb-2 text-gray-700">Add New Bill</h3>
                        <p className="text-gray-600">Select bill type (Electricity, Rent, Water, WiFi, Trash)...</p>
                        <button
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"
                            onClick={() => router.push('/?page=billForm')}
                        >
                            Add Bill
                        </button>
                    </motion.div>

                    {bills.length > 0 ? (
                        <motion.div className="bg-white shadow-md rounded-md p-4" variants={itemVariants}>
                            <h3 className="text-lg font-medium mb-2 text-gray-700">Your Bills</h3>
                            <ul>
                                {bills.map(bill => (
                                    <li key={bill.id} className="py-2 border-b flex items-center justify-between">
                                        {bill.bill_type} - Due: {bill.due_date} - Amount: ${bill.amount}
                                        <div>
                                            <button
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded mr-2"
                                                onClick={() => handleEditBill(bill.id)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded"
                                                onClick={() => handleDeleteBill(bill.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ) : (
                        <motion.div className="bg-white shadow-md rounded-md p-4" variants={itemVariants}>
                            <p className="text-gray-600">No bills found.  Add a new bill to get started.</p>
                        </motion.div>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default ManageBills;

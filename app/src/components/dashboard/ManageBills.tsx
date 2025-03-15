// ManageBills.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, DollarSign } from 'lucide-react'; // Added DollarSign icon

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
    const [bills, setBills] = useState<Bill[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBills, setSelectedBills] = useState<string[]>([]); // For multiple payments
    const router = useRouter();

    useEffect(() => {
        const fetchBills = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    setError('No access token found. Please log in.');
                    setIsLoading(false);
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/bills/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    console.error("API Response Status:", response.status);
                    console.error("API Response Text:", await response.text());
                    throw new Error(`HTTP error fetching bills! status: ${response.status}`);
                }

                const data: Bill[] = await response.json();
                setBills(data);
                console.log("Bills data:", data);
            } catch (e: any) {
                setError(`Failed to fetch data: ${e.message}`);
                console.error("Fetch error:", e);
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

            setBills(bills.filter(bill => bill.id !== billId));
        } catch (e: any) {
            setError(`Failed to delete bill: ${e.message}`);
        }
    };

    const handleEditBill = (billId: string) => {
        router.push(`/?page=billForm&edit=${billId}`);
    };

    // Functions for handling payments
    const handlePayBill = async (billId: string) => {
         try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('No access token found. Please log in.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/payments/pay`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bill_id: billId }),
            });

            const data = await response.json();

            if (response.ok) {
                 window.alert("Payment initiated. Check your phone for the prompt.");
                console.log('Payment initiated',data);
            } else {
                setError(`Payment failed: ${data.message || 'Unknown error'}`);
                window.alert(`Payment failed: ${data.message || 'Unknown error'}`);
            }
        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
            window.alert(`An error occurred: ${e.message}`);
        }
    };

    const handlePayMultipleBills = async () => {
       if (selectedBills.length === 0) {
            alert("No bills selected for payment.");
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('No access token found. Please log in.');
                return;
            }

            // You'll need to adapt your backend to handle multiple bill IDs in a single request.
            const response = await fetch(`${API_BASE_URL}/payments/pay-multiple`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bill_ids: selectedBills }), // Send selected bill IDs
            });

            const data = await response.json();

            if (response.ok) {
                alert("Payment initiated for selected bills. Check your phone for the prompt(s).");
                 setSelectedBills([]);  // Clear selected bills after payment
                setBills(prevBills => prevBills.map(bill => { //update bill status after payment
                     if (selectedBills.includes(bill.id)) {
                        return { ...bill, status: 'Paid' }; // Update status to 'Paid' for selected bills
                    }
                    return bill;
                }));
                console.log("Multiple payments initiated:", data);
            } else {
                setError(`Payment failed: ${data.message || 'Unknown error'}`);
                window.alert(`Payment failed: ${data.message || 'Unknown error'}`);
            }
        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
            window.alert(`An error occurred: ${e.message}`);
        }

    };

    const handlePayAllBills = async () => {
           try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('No access token found. Please log in.');
                return;
            }

            // You'll need to adapt your backend to handle multiple bill IDs in a single request.
            const response = await fetch(`${API_BASE_URL}/payments/pay-all`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert("Payment initiated for All bills. Check your phone for the prompt(s).");
                 setSelectedBills([]);  // Clear selected bills after payment
                 setBills(prevBills => prevBills.map(bill => { //update bill status after payment
                   return { ...bill, status: 'Paid' }; // Update status to 'Paid' for all bills
                }));
                console.log("All payments initiated:", data);
            } else {
                setError(`Payment failed: ${data.message || 'Unknown error'}`);
                window.alert(`Payment failed: ${data.message || 'Unknown error'}`);
            }
        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
            window.alert(`An error occurred: ${e.message}`);
        }
    };

    const handleCheckboxChange = (billId: string) => {
         setSelectedBills(prevSelected => {
            if (prevSelected.includes(billId)) {
                return prevSelected.filter(id => id !== billId);
            } else {
                return [...prevSelected, billId];
            }
        });
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
                                         <input
                                                type="checkbox"
                                                checked={selectedBills.includes(bill.id)}
                                                onChange={() => handleCheckboxChange(bill.id)}
                                                className="mr-2"
                                            />
                                        {bill.bill_type} - Due: {bill.due_date} - Amount: ${bill.amount} - Status: {bill.status}
                                        <div>
                                            <button
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded mr-2"
                                                onClick={() => handleEditBill(bill.id)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded mr-2"
                                                onClick={() => handleDeleteBill(bill.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                                 <button
                                                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-2 rounded"
                                                    onClick={() => handlePayBill(bill.id)}
                                                >
                                                    <DollarSign className="h-4 w-4" />
                                                </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                                    onClick={handlePayMultipleBills}
                                    disabled={selectedBills.length === 0}
                                >
                                    Pay Selected Bills
                                </button>
                                <button
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={handlePayAllBills}
                                >
                                    Pay All Bills
                                </button>
                            </div>
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
// ManageBills.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, DollarSign, Plus, Lightbulb, Home, Droplet, Wifi, } from 'lucide-react'; // Added Plus icon, icon here
import { Transition } from "@headlessui/react";

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
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [selectedBills, setSelectedBills] = useState<string[]>([]); // For multiple payments
    const router = useRouter();
    const [editBillId, setEditBillId] = useState<string | null>(null); // State for edit mode
    const [showError, setShowError] = useState(false);

    interface BillType {
        value: string;
        icon: React.ReactNode; // Use React.ReactNode for JSX elements
    }

    const billTypes: BillType[] = [
        {
            value: "Electricity",
            icon: <Lightbulb className="inline-block mr-1" size={14} />,
        },
        {
            value: "Rent",
            icon: <Home className="inline-block mr-1" size={14} />,
        },
        {
            value: "Water",
            icon: <Droplet className="inline-block mr-1" size={14} />,
        },
        { value: "WiFi", icon: <Wifi className="inline-block mr-1" size={14} /> },
        {
            value: "Trash",
            icon: <Trash2 className="inline-block mr-1" size={14} />,
        },
    ];

    // Function to fetch bills
    const fetchBills = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('No access token found. Please log in.');
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
            setShowError(false);
            setError(null);

        } catch (e: any) {
            setShowError(true);
            setError(`Failed to fetch data: ${e.message}`);
            console.error("Fetch error:", e);
        }
    };

    useEffect(() => {
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
            await fetchBills(); // Refresh bills after deletion
        } catch (e: any) {
            setError(`Failed to delete bill: ${e.message}`);
        }
    };

    const handleEditBill = (billId: string) => {
        setEditBillId(billId);
        setIsModalOpen(true);
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
                console.log('Payment initiated', data);
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

            {showError && <div className="text-red-500 mb-4">{error}</div>}
            <>
                <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
                    <h3 className="text-lg font-medium mb-2 text-gray-700 flex items-center justify-between">
                        <span>Add New Bill</span>
                        <button
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => {
                                setEditBillId(null); // Reset editBillId when adding a new bill
                                setIsModalOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2 inline-block" />
                            Add Bill
                        </button>
                    </h3>
                    <p className="text-gray-600">Add a new recurring bill to your list.</p>
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
            {/* Modal */}
            <Transition appear show={isModalOpen} as="div">
                <div className="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <Transition.Child
                            as={motion.div}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full"
                        >
                            <div className="p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">
                                    {editBillId ? "Edit Bill" : "Add New Bill"}
                                </h2>
                                <BillFormModal
                                    editBillId={editBillId}
                                    onClose={() => {
                                        setIsModalOpen(false);
                                        setEditBillId(null);
                                        fetchBills(); // Refresh bills after closing modal
                                    }}
                                    onBillUpdated={fetchBills} // Callback to refresh bills after update
                                    onError={setError}
                                    billTypes={billTypes}
                                />
                            </div>
                        </Transition.Child>
                    </div>
                </div>
            </Transition>
        </motion.div>
    );
};

// BillFormModal Component (Simplified)
interface BillFormModalProps {
    editBillId: string | null;
    onClose: () => void;
    onBillUpdated: () => void; // Callback to refresh bills
    onError: (error: string) => void;
    billTypes: { value: string; icon: React.ReactNode }[];
}

const BillFormModal: React.FC<BillFormModalProps> = ({ editBillId, onClose, onBillUpdated, onError, billTypes }) => {
    const [billType, setBillType] = useState("");
    const [amount, setAmount] = useState("");
    const [paymentOption, setPaymentOption] = useState("");
    const [paybillNumber, setPaybillNumber] = useState("");
    const [tillNumber, setTillNumber] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [isBillTypeOpen, setIsBillTypeOpen] = useState(false);
    const [isPaymentOptionOpen, setIsPaymentOptionOpen] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoadingToken, setIsLoadingToken] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);


    const paymentOptions = [
        { value: "paybill", label: "Paybill" },
        { value: "till", label: "Till Number" },
    ];

    useEffect(() => {
        const getToken = async () => {
            if (typeof window !== "undefined" && localStorage) {
                const token = localStorage.getItem("accessToken");
                if (token) {
                    setAccessToken(token);
                    console.log("accessToken in BillForm:", token);
                } else {
                    console.warn("No access token found in localStorage.");
                    onError("Authentication required. Please login.");
                    // router.push("/?page=login"); // Redirect to login
                    return;
                }
                setIsLoadingToken(false);

                if (editBillId) {
                    setIsEditMode(true);
                    try {
                        const response = await fetch(
                            `${API_BASE_URL}/bills/${editBillId}`,
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (response.ok) {
                            const billData = await response.json();
                            setBillType(billData.bill_type);
                            setAmount(billData.amount);
                            setPaymentOption(billData.payment_option);
                            setPaybillNumber(billData.paybill_number || "");
                            setTillNumber(billData.till_number || "");
                            setAccountNumber(billData.account_number || "");
                            setDueDate(billData.due_date);
                        } else {
                            onError("Failed to fetch bill for editing.");
                        }
                    } catch (err) {
                        onError("An error occurred while fetching the bill.");
                        console.error(err);
                    }
                } else {
                    setIsEditMode(false);
                }
            } else {
                console.warn("localStorage is not available.");
                onError(
                    "localStorage is not available. Please enable cookies or use a different browser."
                );
                setIsLoadingToken(false);
            }
        };

        getToken();
    }, [editBillId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoadingToken) {
            onError("Please wait while the authentication token is loaded.");
            return;
        }

        if (!accessToken) {
            onError("Authentication required. Please login.");
            return;
        }

        if (!billType || !amount || !paymentOption || !dueDate) {
            onError("Please fill in all required fields.");
            return;
        }

        // Validate based on payment option
        if (paymentOption === "paybill") {
            if (!paybillNumber || !accountNumber) {
                onError("Paybill requires both Paybill Number and Account Number.");
                return;
            }
        } else if (paymentOption === "till") {
            if (!tillNumber) {
                onError("Till Number is required for Till payment.");
                return;
            }
        }

        try {
            const url = editBillId
                ? `${API_BASE_URL}/bills/${editBillId}`
                : `${API_BASE_URL}/bills/`;
            const method = editBillId ? "PUT" : "POST";

            // Construct the request body.  Only include the relevant payment details.
            const requestBody: any = {
                bill_type: billType,
                amount: amount,
                payment_option: paymentOption,
                due_date: dueDate,
            };

            if (paymentOption === "paybill") {
                requestBody.paybill_number = paybillNumber;
                requestBody.account_number = accountNumber;
            } else if (paymentOption === "till") {
                requestBody.till_number = tillNumber;
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (response.ok) {
                // setSuccessMessage(
                //     editBillId ? "Bill updated successfully!" : "Bill added successfully!"
                // );
                // setError("");
                // setBillType("");
                // setAmount("");
                // setPaymentOption("");
                // setPaybillNumber("");
                // setTillNumber("");
                // setAccountNumber("");
                // setDueDate("");

                // localStorage.removeItem("isFirstTimeUser");
                onBillUpdated(); // Notify parent component to refresh bills
                onClose();
            } else {
                onError(data.message || "Failed to add bill.");
                // setSuccessMessage("");
            }
        } catch (err) {
            onError("An error occurred while adding the bill.");
            // setSuccessMessage("");
            console.error(err);
        }
    };

    const handleCancel = () => {
        onClose(); // Close the modal
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Bill Type */}
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="billType">
                    Bill Type
                </label>
                <div className="relative">
                    <button
                        type="button"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9C27B0] focus:border-transparent transition-all duration-200 outline-none flex items-center justify-between"
                        onClick={() => setIsBillTypeOpen(!isBillTypeOpen)}
                    >
                        {billType || "Select Bill Type"}
                        <span>▼</span>
                    </button>
                    {isBillTypeOpen && (
                        <div className="absolute left-0 mt-1 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                            <div
                                className="py-1"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="options-menu"
                            >
                                {billTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        role="menuitem"
                                        onClick={() => {
                                            setBillType(type.value);
                                            setIsBillTypeOpen(false);
                                        }}
                                    >
                                        <span className="inline-block mr-1">
                                            {type.icon}
                                        </span>
                                        {type.value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Amount */}
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                    Amount
                </label>
                <input
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9C27B0] focus:border-transparent transition-all duration-200 outline-none"
                    id="amount"
                    type="number"
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>

            {/* Payment Option */}
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentOption">
                    Payment Option
                </label>
                <div className="relative">
                    <button
                        type="button"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9C27B0] focus:border-transparent transition-all duration-200 outline-none flex items-center justify-between"
                        onClick={() =>
                            setIsPaymentOptionOpen(!isPaymentOptionOpen)
                        }
                    >
                        {paymentOption
                            ? paymentOptions.find(
                                (option) => option.value === paymentOption
                            )?.label
                            : "Select Payment Option"}
                        <span>▼</span>
                    </button>
                    {isPaymentOptionOpen && (
                        <div className="absolute left-0 mt-1 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                            <div
                                className="py-1"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="options-menu"
                            >
                                {paymentOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        role="menuitem"
                                        onClick={() => {
                                            setPaymentOption(option.value);
                                            setIsPaymentOptionOpen(false);
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Paybill Fields */}
            {paymentOption === "paybill" && (
                <>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paybillNumber">
                            Paybill Number (Business Number)
                        </label>
                        <input
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9C27B0] focus:border-transparent transition-all duration-200 outline-none"
                            id="paybillNumber"
                            type="text"
                            placeholder="Enter Paybill Number"
                            value={paybillNumber}
                            onChange={(e) => setPaybillNumber(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="accountNumber">
                            Account Number
                        </label>
                        <input
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9C27B0] focus:border-transparent transition-all duration-200 outline-none"
                            id="accountNumber"
                            type="text"
                            placeholder="Enter Account Number"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                        />
                    </div>
                </>
            )}

            {/* Till Number Field */}
            {paymentOption === "till" && (
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tillNumber">
                        Till Number
                    </label>
                    <input
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9C27B0] focus:border-transparent transition-all duration-200 outline-none"
                        id="tillNumber"
                        type="text"
                        placeholder="Enter Till Number"
                        value={tillNumber}
                        onChange={(e) => setTillNumber(e.target.value)}
                    />
                </div>
            )}

            {/* Due Date */}
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dueDate">
                    Due Date
                </label>
                <input
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9C27B0] focus:border-transparent transition-all duration-200 outline-none"
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                    onClick={handleCancel}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-gradient-to-r from-[#E91E63] to-[#9C27B0] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200/50 hover:shadow-purple-300/50 transition-all duration-300"
                >
                    {isEditMode ? "Update Bill" : "Add Bill"}
                </button>
            </div>
        </form>
    );
};

export default ManageBills;
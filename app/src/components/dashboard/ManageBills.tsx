// File: ./components/dashboard/ManageBills.tsx
// ManageBills.tsx
"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Edit,
  Trash2,
  DollarSign,
  Plus,
  Lightbulb,
  Home,
  Droplet,
  Wifi,
  Calendar,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Transition } from "@headlessui/react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const [editBillId, setEditBillId] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [isPaying, setIsPaying] = useState(false);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [paymentCheckInterval, setPaymentCheckInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [isLoadingBills, setIsLoadingBills] = useState(false);

  interface BillType {
    value: string;
    icon: ReactNode;
  }

  const billTypeIcons: { [key: string]: BillType } = {
    Electricity: {
      value: "Electricity",
      icon: <Lightbulb className="inline-block mr-1" size={16} />,
    },
    Rent: {
      value: "Rent",
      icon: <Home className="inline-block mr-1" size={16} />,
    },
    Water: {
      value: "Water",
      icon: <Droplet className="inline-block mr-1" size={16} />,
    },
    WiFi: {
      value: "WiFi",
      icon: <Wifi className="inline-block mr-1" size={16} />,
    },
    Trash: {
      value: "Trash",
      icon: <Trash2 className="inline-block mr-1" size={16} />,
    },
  };

  const fetchBills = async () => {
    setIsLoadingBills(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No access token found. Please log in.");
        toast.error("No access token found. Please log in.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/bills/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": `application/json`,
        },
      });

      if (!response.ok) {
        console.error("API Response Status:", response.status);
        console.error("API Response Text:", await response.text());
        throw new Error(
          `HTTP error fetching bills! status: ${response.status}`
        );
      }

      const data: Bill[] = await response.json();
      setBills(data);
      setShowError(false);
      setError(null);
    } catch (e: any) {
      setShowError(true);
      setError(`Failed to fetch data: ${e.message}`);
      toast.error(`Failed to fetch data: ${e.message}`);
    } finally {
      setIsLoadingBills(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    const filtered = bills.filter((bill) => {
      const billDate = parseISO(bill.due_date);
      return billDate.getMonth() === selectedMonth;
    });
    setFilteredBills(filtered);
  }, [bills, selectedMonth]);

  const handleDeleteBill = async (billId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bill?"
    );
    if (!confirmed) {
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No access token found. Please log in.");
        toast.error("No access token found. Please log in.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/bills/${billId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error deleting bill! status: ${response.status}`);
      }

      setBills(bills.filter((bill) => bill.id !== billId));
      await fetchBills();
      toast.success("Bill deleted successfully!");
    } catch (e: any) {
      setError(`Failed to delete bill: ${e.message}`);
      toast.error(`Failed to delete bill: ${e.message}`);
    }
  };

  const handleEditBill = (billId: string) => {
    setEditBillId(billId);
    setIsModalOpen(true);
  };

  const startPaymentPolling = (billId: string) => {
    const intervalId = setInterval(async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found.");
        clearInterval(intervalId);
        setIsPaying(false);
        setPayingBillId(null);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/bills/${billId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const billData = await response.json();
          if (billData.status === "Paid" || billData.status === "Failed") {
            clearInterval(intervalId);
            setPaymentCheckInterval(null);
            setIsPaying(false);
            setPayingBillId(null);
            setSelectedBillId(null);
            toast.success(
              `Bill ${billData.bill_type} payment ${billData.status}`
            );
            await fetchBills(); // Refresh the bill list
          }
        } else {
          console.error("Failed to fetch bill status.");
        }
      } catch (error) {
        console.error("Error during payment status check:", error);
        clearInterval(intervalId);
        setIsPaying(false);
        setPayingBillId(null);
        setSelectedBillId(null);
      }
    }, 5000); // Check every 5 seconds

    setPaymentCheckInterval(intervalId);
  };

  const handlePayBill = async (billId: string) => {
    setPayingBillId(billId);
    setIsPaying(true);
    setError(null);
    setSelectedBillId(billId);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No access token found. Please log in.");
        toast.error("No access token found. Please log in.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/payments/pay`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bill_id: billId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Payment initiated. Check your phone for the prompt.");
        startPaymentPolling(billId);
      } else {
        setError(`Payment failed: ${data.message || "Unknown error"}`);
        toast.error(`Payment failed: ${data.message || "Unknown error"}`);
      }
    } catch (e: any) {
      setError(`An error occurred: ${e.message}`);
      toast.error(`An error occurred: ${e.message}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleBillStatusUpdate = useCallback(() => {
    if (editBillId) {
      fetchBills();
      setIsModalOpen(false);
      setEditBillId(null);
    }
    if (paymentCheckInterval && selectedBillId) {
      clearInterval(paymentCheckInterval);
      setPaymentCheckInterval(null);
    }
  }, [editBillId, paymentCheckInterval, selectedBillId]);

  useEffect(() => {
    handleBillStatusUpdate();
  }, [handleBillStatusUpdate]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.h2
        className="text-2xl font-semibold mb-4 text-gray-800"
        variants={itemVariants}
      >
        Manage Bills
      </motion.h2>

      {showError && <div className="text-red-500 mb-4">{error}</div>}
      <>
        <motion.div
          className="bg-white shadow-md rounded-md p-4 mb-4"
          variants={itemVariants}
        >
          <h3 className="text-lg font-medium mb-2 text-gray-700 flex items-center justify-between">
            <span>Add New Bill</span>
            <button
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded flex items-center"
              onClick={() => {
                setEditBillId(null);
                setIsModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2 inline-block" />
              Add Bill
            </button>
          </h3>
          <p className="text-gray-600">
            Add a new recurring bill to your list.
          </p>
        </motion.div>

        <motion.div
          className="bg-white shadow-md rounded-md p-4 mb-4"
          variants={itemVariants}
        >
          <label
            htmlFor="month"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Select Month:
          </label>
          <select
            id="month"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {monthNames.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
        </motion.div>

        {isLoadingBills ? (
          <div>Loading bills...</div> // Add loading indicator here
        ) : (
          <motion.div
            className="bg-white shadow-md rounded-md p-4"
            variants={itemVariants}
          >
            <h3 className="text-lg font-medium mb-2 text-gray-700">
              Your Bills for {monthNames[selectedMonth]}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-gray-600">Type</th>
                    <th className="px-4 py-2 text-left text-gray-600">
                      Due Date
                    </th>
                    <th className="px-4 py-2 text-left text-gray-600">
                      Amount
                    </th>
                    <th className="px-4 py-2 text-left text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill.id} className="border-b">
                      <td className="px-4 py-2 text-gray-700">
                        {billTypeIcons[bill.bill_type]?.icon}
                        {bill.bill_type}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {format(parseISO(bill.due_date), "PPP")}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        Ksh {bill.amount}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {isPaying && payingBillId === bill.id ? (
                          <div className="flex items-center">
                            <Clock className="animate-spin mr-2" /> Paying...
                          </div>
                        ) : (
                          bill.status
                        )}
                      </td>

                      <td className="px-4 py-2 text-gray-700">
                        <div className="flex items-center">
                          <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded mr-2 flex items-center"
                            onClick={() => handleEditBill(bill.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded mr-2 flex items-center"
                            onClick={() => handleDeleteBill(bill.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            className={`bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-2 rounded flex items-center ${
                              isPaying && payingBillId === bill.id
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={() => handlePayBill(bill.id)}
                            disabled={isPaying && payingBillId === bill.id}
                          >
                            {isPaying && payingBillId === bill.id ? (
                              <ClipLoader color="#ffffff" size={16} />
                            ) : (
                              <>
                                <DollarSign className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </>
      {/* Modal */}
      <Transition appear show={isModalOpen}>
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
                    fetchBills();
                  }}
                  onBillUpdated={fetchBills}
                  onError={setError}
                  billTypes={Object.values(billTypeIcons)}
                />
              </div>
            </Transition.Child>
          </div>
        </div>
      </Transition>
    </motion.div>
  );
};

interface BillFormModalProps {
  editBillId: string | null;
  onClose: () => void;
  onBillUpdated: () => void;
  onError: (error: string) => void;
  billTypes: { value: string; icon: ReactNode }[];
}

const BillFormModal: React.FC<BillFormModalProps> = ({
    editBillId,
    onClose,
    onBillUpdated,
    onError,
    billTypes,
  }) => {
    const [billType, setBillType] = useState("");
    const [amount, setAmount] = useState("");
    const [paybillNumber, setPaybillNumber] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [isBillTypeOpen, setIsBillTypeOpen] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoadingToken, setIsLoadingToken] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isRecurring, setIsRecurring] = useState(false);  // NEW STATE
  
    useEffect(() => {
      const getToken = async () => {
        if (typeof window !== "undefined" && localStorage) {
          const token = localStorage.getItem("accessToken");
          if (token) {
            setAccessToken(token);
          } else {
            console.warn("No access token found in localStorage.");
            onError("Authentication required. Please login.");
            toast.error("Authentication required. Please login.");
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
                setPaybillNumber(billData.paybill_number || "");
                setAccountNumber(billData.account_number || "");
                setDueDate(billData.due_date);
              } else {
                onError("Failed to fetch bill for editing.");
                toast.error("Failed to fetch bill for editing.");
              }
            } catch (err) {
              onError("An error occurred while fetching the bill.");
              toast.error("An error occurred while fetching the bill.");
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
          toast.error(
            "localStorage is not available. Please enable cookies or use a different browser."
          );
          setIsLoadingToken(false);
        }
      };
  
      getToken();
    }, [editBillId, onError, toast]);
  
      // NEW FUNCTION: CREATE RECURRING BILLS
      const createRecurringBills = async (baseBill: any, token: string) => {
        const billsToCreate = [];
        let nextDueDate = new Date(baseBill.due_date);
  
        for (let i = 1; i <= 11; i++) {  // Create for next 11 months
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          const newBill = {
            ...baseBill,
            due_date: nextDueDate.toISOString().split('T')[0], // Format to YYYY-MM-DD
          };
          billsToCreate.push(newBill);
        }
  
        try {
          const response = await fetch(`${API_BASE_URL}/bills/`, {  // Use the SAME endpoint.  Backend handles array.
            method: 'POST', // Backend needs to accept an array of bills here!
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(billsToCreate), // Send the array to the backend
          });
  
          const data = await response.json();
  
          if (response.ok) {
            toast.success("Bill and recurring bills added successfully!");
          } else {
            toast.error(data.message || "Failed to add recurring bills.");
          }
        } catch (err) {
          toast.error("An error occurred while adding the recurring bills.");
          console.error(err);
        }
      };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      if (isLoadingToken) {
        onError("Please wait while the authentication token is loaded.");
        toast.error("Please wait while the authentication token is loaded.");
        return;
      }
  
      if (!accessToken) {
        onError("Authentication required. Please login.");
        toast.error("Authentication required. Please login.");
        return;
      }
  
      if (!billType || !amount || !paybillNumber || !accountNumber || !dueDate) {
        onError(
          "Please fill in all required fields, including Paybill and Account Numbers."
        );
        toast.error(
          "Please fill in all required fields, including Paybill and Account Numbers."
        );
        return;
      }
  
      if (!paybillNumber || !accountNumber) {
        onError("Paybill requires both Paybill Number and Account Number.");
        toast.error("Paybill requires both Paybill Number and Account Number.");
        return;
      }
  
      try {
        const url = editBillId
          ? `${API_BASE_URL}/bills/${editBillId}`
          : `${API_BASE_URL}/bills/`;
        const method = editBillId ? "PUT" : "POST";
  
        const requestBody: any = {
          bill_type: billType,
          amount: amount,
          payment_option: "paybill",
          paybill_number: paybillNumber,
          account_number: accountNumber,
          due_date: dueDate,
        };
  
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
          toast.success(
            editBillId ? "Bill updated successfully!" : "Bill added successfully!"
          );
          onBillUpdated();
          onClose();
                  // NEW: Create recurring bills if toggled
                  if (isRecurring && !editBillId) { // Don't create recurring on edits
                    await createRecurringBills(requestBody, accessToken); // Pass the base bill
                  }
        } else {
          onError(data.message || "Failed to add bill.");
          toast.error(data.message || "Failed to add bill.");
        }
      } catch (err) {
        onError("An error occurred while adding the bill.");
        toast.error("An error occurred while adding the bill.");
        console.error(err);
      }
    };
  
    const handleCancel = () => {
      onClose();
    };
  
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="billType"
          >
            Bill Type
          </label>
          <div className="relative">
            <button
              type="button"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-teal-200 focus:border-transparent transition-all duration-200 outline-none flex items-center justify-between"
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
                      <span className="inline-block mr-1">{type.icon}</span>
                      {type.value}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
  
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="amount"
          >
            Amount
          </label>
          <input
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-teal-200 focus:border-transparent transition-all duration-200 outline-none"
            id="amount"
            type="number"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
  
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="paybillNumber"
          >
            Paybill Number (Business Number)
          </label>
          <input
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-teal-200 focus:border-transparent transition-all duration-200 outline-none"
            id="paybillNumber"
            type="text"
            placeholder="Enter Paybill Number"
            value={paybillNumber}
            onChange={(e) => setPaybillNumber(e.target.value)}
          />
        </div>
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="accountNumber"
          >
            Account Number
          </label>
          <input
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-teal-200 focus:border-transparent transition-all duration-200 outline-none"
            id="accountNumber"
            type="text"
            placeholder="Enter Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
        </div>
  
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="dueDate"
          >
            Due Date
          </label>
          <input
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-teal-200 focus:border-transparent transition-all duration-200 outline-none"
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
  
                 {/* NEW: Recurring Bill Toggle */}
                 <div className="mb-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 h-5 w-5 text-teal-500 focus:ring-teal-300"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        disabled={isEditMode} // Disable on edit
                      />
                      <span className="text-gray-700 text-sm font-bold">
                        Create Recurring Bills (Next 11 Months)
                      </span>
                    </label>
                  </div>
  
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
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-5 rounded-md shadow-md transition-colors duration-300"
          >
            {isEditMode ? "Update Bill" : "Add Bill"}
          </button>
        </div>
      </form>
    );
  };

export default ManageBills;

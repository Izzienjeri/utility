// app/src/components/BillForm.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Wallet,
  Home,
  Lightbulb,
  Droplet,
  Wifi,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner"; // Import toast from sonner

const API_BASE_URL = "http://localhost:5000";

interface BillFormProps {
  userId: string;
  editBillId?: string | null;
}

const BillForm: React.FC<BillFormProps> = ({ userId, editBillId }) => {
  const [billType, setBillType] = useState("");
  const [amount, setAmount] = useState("");
  const [paybillNumber, setPaybillNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isBillTypeOpen, setIsBillTypeOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);

  const billTypes = [
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

  useEffect(() => {
    const getToken = async () => {
      if (typeof window !== "undefined" && localStorage) {
        const token = localStorage.getItem("accessToken");
        if (token) {
          setAccessToken(token);
        } else {
          console.warn("No access token found in localStorage.");
          toast.error("Authentication required. Please login.");
          router.push("/?page=login");
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
              toast.error("Failed to fetch bill for editing.");
            }
          } catch (err) {
            toast.error("An error occurred while fetching the bill.");
            console.error(err);
          }
        } else {
          setIsEditMode(false);
        }
      } else {
        console.warn("localStorage is not available.");
        toast.error(
          "localStorage is not available. Please enable cookies or use a different browser."
        );
        setIsLoadingToken(false);
      }
    };

    getToken();

    const isFirstTimeUser = localStorage.getItem("isFirstTimeUser");
    if (!isFirstTimeUser && !editBillId) {
      router.push("/?page=dashboard&ion=overview");
    }
  }, [router, editBillId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoadingToken) {
      toast.error("Please wait while the authentication token is loaded.");
      return;
    }

    if (!accessToken) {
      toast.error("Authentication required. Please login.");
      return;
    }

    if (!billType || !amount || !paybillNumber || !accountNumber || !dueDate) {
      toast.error(
        "Please fill in all required fields, including Paybill and Account Numbers."
      );
      return;
    }

    // Validate Paybill and Account Number
    if (!paybillNumber || !accountNumber) {
      toast.error("Paybill requires both Paybill Number and Account Number.");
      return;
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
        payment_option: "paybill", // Always paybill
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
        setError("");
        setBillType("");
        setAmount("");
        setPaybillNumber("");
        setAccountNumber("");
        setDueDate("");

        localStorage.removeItem("isFirstTimeUser");
        router.push("/?page=dashboard&ion=manage-bills");
      } else {
        toast.error(data.message || "Failed to add bill.");
        setSuccessMessage("");
      }
    } catch (err) {
      toast.error("An error occurred while adding the bill.");
      setSuccessMessage("");
      console.error(err);
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

  const buttonVariants = {
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.2 } },
  };

  if (isLoadingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div>Loading authentication token...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {accessToken ? (
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="rounded-2xl shadow-md overflow-hidden bg-gradient-to-br from-blue-900 to-teal-500 text-white"
            variants={itemVariants}
          >
            <div className="px-8 pt-6 pb-8">
              <motion.div
                className="flex flex-col items-center mb-6"
                variants={itemVariants}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white text-blue-800 mb-3 shadow-md">
                  <Wallet className="text-blue-800" size={28} />
                </div>
                <h2 className="text-2xl font-semibold ">
                  {isEditMode ? "Edit Bill" : "Add a Bill"}
                </h2>
                <p className="text-gray-300 mt-1 text-center italic">
                  Currently, we only support Paybill payments.
                </p>
              </motion.div>

              {error && (
                <motion.div
                  className="mb-4 p-3 bg-red-50 border border-red-200 text-red-500 text-sm rounded-md"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-md"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {successMessage}
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                <motion.div className="mb-3" variants={itemVariants}>
                  <label
                    className="block text-gray-200 text-sm font-medium mb-2"
                    htmlFor="billType"
                  >
                    <span className="inline-block mr-1">
                      <Home size={16} />
                    </span>
                    Bill Type
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-teal-200 focus:border-transparent transition-all duration-200 outline-none flex items-center justify-between text-black"
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
                </motion.div>

                <motion.div className="mb-3" variants={itemVariants}>
                  <label
                    className="block text-gray-200 text-sm font-medium mb-2"
                    htmlFor="amount"
                  >
                    <span className="inline-block mr-1">
                      <Wallet size={16} />
                    </span>
                    Amount
                  </label>
                  <input
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-teal-200 focus:border-transparent transition-all duration-200 outline-none text-black"
                    id="amount"
                    type="number"
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </motion.div>

                <motion.div className="mb-3" variants={itemVariants}>
                  <label
                    className="block text-gray-200 text-sm font-medium mb-2"
                    htmlFor="paybillNumber"
                  >
                    Paybill Number (Business Number)
                  </label>
                  <input
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-teal-200 focus:border-transparent transition-all duration-200 outline-none text-black"
                    id="paybillNumber"
                    type="text"
                    placeholder="Enter Paybill Number"
                    value={paybillNumber}
                    onChange={(e) => setPaybillNumber(e.target.value)}
                  />
                </motion.div>
                <motion.div className="mb-3" variants={itemVariants}>
                  <label
                    className="block text-gray-200 text-sm font-medium mb-2"
                    htmlFor="accountNumber"
                  >
                    Account Number
                  </label>
                  <input
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-teal-200 focus:border-transparent transition-all duration-200 outline-none text-black"
                    id="accountNumber"
                    type="text"
                    placeholder="Enter Account Number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </motion.div>

                <motion.div className="mb-5" variants={itemVariants}>
                  <label
                    className="block text-gray-200 text-sm font-medium mb-2"
                    htmlFor="dueDate"
                  >
                    <span className="inline-block mr-1">
                      <Calendar size={16} />
                    </span>
                    Due Date
                  </label>
                  <input
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-teal-200 focus:border-transparent transition-all duration-200 outline-none text-black"
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </motion.div>

                <motion.div
                  className="flex items-center justify-between"
                  variants={itemVariants}
                >
                  <motion.button
                    className="w-full bg-white text-blue-800 font-medium py-2.5 px-5 rounded-md flex items-center justify-center shadow-md hover:bg-gray-200 transition-colors duration-300"
                    type="submit"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <span>{isEditMode ? "Update Bill" : "Add Bill"}</span>
                    <ArrowRight className="ml-2" size={16} />
                  </motion.button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <div>Authentication required. Please login.</div>
      )}
    </div>
  );
};

export default BillForm;
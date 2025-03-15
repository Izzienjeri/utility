// app/src/components/BillForm.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation"; // Import useRouter
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

const API_BASE_URL = "http://localhost:5000";

interface BillFormProps {
  userId: string;
  editBillId?: string | null;
}

const BillForm: React.FC<BillFormProps> = ({ userId, editBillId }) => {
  const [billType, setBillType] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentOption, setPaymentOption] = useState("");
  const [paybillNumber, setPaybillNumber] = useState("");
  const [tillNumber, setTillNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isBillTypeOpen, setIsBillTypeOpen] = useState(false);
  const [isPaymentOptionOpen, setIsPaymentOptionOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const router = useRouter(); // Initialize useRouter
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
          setError("Authentication required. Please login.");
          return;
        }
        setIsLoadingToken(false);

        if (editBillId) {
          setIsEditMode(true); // Set to edit mode
          // Fetch the bill data for editing
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
              setError("Failed to fetch bill for editing.");
            }
          } catch (err) {
            setError("An error occurred while fetching the bill.");
            console.error(err);
          }
        } else {
          setIsEditMode(false);
        }
      } else {
        console.warn("localStorage is not available.");
        setError(
          "localStorage is not available. Please enable cookies or use a different browser."
        );
        setIsLoadingToken(false);
      }
    };

    getToken();

    // NEW CODE: Check for isFirstTimeUser and redirect if necessary
    const isFirstTimeUser = localStorage.getItem("isFirstTimeUser");
    if (!isFirstTimeUser && !editBillId) {
      router.push("/?page=dashboard&ion=overview");
    }
  }, [router, editBillId]); // Add router to the dependency array

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoadingToken) {
      setError("Please wait while the authentication token is loaded.");
      return;
    }

    if (!accessToken) {
      setError("Authentication required. Please login.");
      return;
    }

    if (!billType || !amount || !paymentOption || !dueDate) {
      setError("Please fill in all required fields.");
      return;
    }

    if (paymentOption === "paybill" && (!paybillNumber || !accountNumber)) {
      setError("Paybill requires both Paybill Number and Account Number.");
      return;
    }

    if (paymentOption === "till" && !tillNumber) {
      setError("Till Number is required for Till payment.");
      return;
    }

    try {
      const url = editBillId
        ? `${API_BASE_URL}/bills/${editBillId}`
        : `${API_BASE_URL}/bills/`;
      const method = editBillId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // ***VERY IMPORTANT***
        },
        body: JSON.stringify({
          bill_type: billType,
          amount: amount,
          payment_option: paymentOption,
          paybill_number: paybillNumber,
          till_number: tillNumber,
          account_number: accountNumber,
          due_date: dueDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          editBillId ? "Bill updated successfully!" : "Bill added successfully!"
        );
        setError("");
        setBillType("");
        setAmount("");
        setPaymentOption("");
        setPaybillNumber("");
        setTillNumber("");
        setAccountNumber("");
        setDueDate("");

        // NEW CODE: Remove isFirstTimeUser and redirect to dashboard
        localStorage.removeItem("isFirstTimeUser");
        router.push("/?page=dashboard&ion=manage-bills");
      } else {
        setError(data.message || "Failed to add bill.");
        setSuccessMessage("");
      }
    } catch (err) {
      setError("An error occurred while adding the bill.");
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
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.2 } },
  };

  if (isLoadingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div>Loading authentication token...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {accessToken ? (
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            variants={itemVariants}
          >
            <div className="h-3 bg-gradient-to-r from-[#E91E63] to-[#9C27B0]"></div>

            <div className="px-8 pt-8 pb-10">
              <motion.div
                className="flex flex-col items-center mb-8"
                variants={itemVariants}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-[#E91E63] to-[#9C27B0] mb-4 shadow-lg">
                  <Wallet className="text-white" size={30} />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">
                  {isEditMode ? "Edit Bill" : "Add a Bill"}
                </h2>
                <p className="text-gray-600 mt-2 text-center">
                  Enter your bill details below
                </p>
              </motion.div>

              {error && (
                <motion.div
                  className="mb-6 p-3 bg-red-50 border border-red-200 text-red-500 text-sm rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  className="mb-6 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {successMessage}
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                <motion.div className="mb-4" variants={itemVariants}>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="billType"
                  >
                    <span className="inline-block mr-2">
                      <Home size={16} />
                    </span>
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
                </motion.div>

                <motion.div className="mb-4" variants={itemVariants}>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="amount"
                  >
                    <span className="inline-block mr-2">
                      <Wallet size={16} />
                    </span>
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
                </motion.div>

                <motion.div className="mb-4" variants={itemVariants}>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="paymentOption"
                  >
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
                </motion.div>

                {paymentOption === "paybill" && (
                  <>
                    <motion.div className="mb-4" variants={itemVariants}>
                      <label
                        className="block text-gray-700 text-sm font-medium mb-2"
                        htmlFor="paybillNumber"
                      >
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
                    </motion.div>
                    <motion.div className="mb-4" variants={itemVariants}>
                      <label
                        className="block text-gray-700 text-sm font-medium mb-2"
                        htmlFor="accountNumber"
                      >
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
                    </motion.div>{" "}
                  </>
                )}

                {paymentOption === "till" && (
                  <motion.div className="mb-4" variants={itemVariants}>
                    <label
                      className="block text-gray-700 text-sm font-medium mb-2"
                      htmlFor="tillNumber"
                    >
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
                  </motion.div>
                )}

                <motion.div className="mb-6" variants={itemVariants}>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="dueDate"
                  >
                    <span className="inline-block mr-2">
                      <Calendar size={16} />
                    </span>
                    Due Date
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9C27B0] focus:border-transparent transition-all duration-200 outline-none"
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
                    className="w-full bg-gradient-to-r from-[#E91E63] to-[#9C27B0] text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200/50 hover:shadow-purple-300/50 transition-all duration-300"
                    type="submit"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <span>{isEditMode ? "Update Bill" : "Add Bill"}</span>
                    <ArrowRight className="ml-2" size={18} />
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

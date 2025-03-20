// app/src/components/dashboard/Overview.tsx
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Wallet,
  Calendar,
  LucideIcon,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  paid_at: string;
  bill?: Bill;
}

const Overview = () => {
  const [upcomingBills, setUpcomingBills] = useState<Bill[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentTimeoutId, setPaymentTimeoutId] =
    useState<NodeJS.Timeout | null>(null);

  const [billDetails, setBillDetails] = useState<{ [billId: string]: Bill }>(
    {}
  );

  type PaymentStatusIcons = {
    [key: string]: {
      icon: LucideIcon;
      color: string;
    };
  };

  const paymentStatusIcons: PaymentStatusIcons = {
    Completed: { icon: CheckCircle, color: "text-green-500" },
    Pending: { icon: Clock, color: "text-yellow-500" },
    Failed: { icon: AlertTriangle, color: "text-red-500" },
  };

  const router = useRouter();

  useEffect(() => {
    const fetchBills = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("No access token found. Please log in.");
          toast.error("No access token found. Please log in.");
          return;
        }
        setAccessToken(token);

        const billsResponse = await fetch(`${API_BASE_URL}/bills/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!billsResponse.ok) {
          throw new Error(
            `HTTP error fetching bills! status: ${billsResponse.status}`
          );
        }

        const billsData = await billsResponse.json();

        const today = new Date();
        const tenDaysFromNow = new Date();
        tenDaysFromNow.setDate(today.getDate() + 10);

        const upcoming = billsData.filter((bill: Bill) => {
          const dueDate = parseISO(bill.due_date);
          return isWithinInterval(dueDate, {
            start: today,
            end: tenDaysFromNow,
          });
        });

        setUpcomingBills(upcoming);

        const total = upcoming.reduce((sum: number, bill: Bill) => {
          if (bill.status === "Pending") {
            return sum + bill.amount;
          }
          return sum;
        }, 0);
        setTotalDue(total);

        const transactionsResponse = await fetch(
          `${API_BASE_URL}/payments/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!transactionsResponse.ok) {
          console.warn("Failed to fetch transactions.");
          setRecentTransactions([]);
          toast.error("Failed to fetch transactions.");
        } else {
          let transactionsData: Transaction[] =
            await transactionsResponse.json();
          setRecentTransactions(transactionsData);

          // Create a map of bill details for easy access
          const billMap: { [billId: string]: Bill } = {};
          transactionsData.forEach((transaction) => {
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Welcome Message */}
      <motion.div className="mb-6" variants={itemVariants}>
        <h2 className="text-2xl font-semibold text-gray-800">
          Welcome back, User!
        </h2>
        <p className="text-gray-600">Here's a summary of your bills.</p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <Clock className="animate-spin mr-2" /> Loading data...
        </div>
      ) : null}

      {error && <div className="text-red-500 mb-4">Error: {error}</div>}

      {/* Billing Card */}
      <motion.div
        className="bg-gradient-to-br from-blue-900 to-teal-500 text-white rounded-2xl shadow-md p-6 mb-6"
        variants={itemVariants}
      >
        <h3 className="text-xl font-semibold mb-2">Total Due</h3>
        <p className="text-4xl font-bold">Ksh {totalDue}</p>
        <p className="text-sm mt-2">Due within the next 10 days.</p>
      </motion.div>

      {/* Grid Section for Individual Bills */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={itemVariants}
      >
        {upcomingBills.map((bill) => (
          <motion.div
            key={bill.id}
            className="bg-white rounded-md shadow-sm p-4 flex flex-col justify-between"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <div>
              <h4 className="text-lg font-semibold text-gray-700">
                {bill.bill_type}
              </h4>
              <p className="text-gray-600">
                Due: {format(parseISO(bill.due_date), "PPP")}
              </p>
              <p className="text-gray-800 font-bold">Ksh {bill.amount}</p>
            </div>
            <button
              onClick={() => router.push(`/?page=dashboard&ion=manage-bills`)}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded mt-2"
            >
              Pay Now
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Transactions Section (moved to the bottom) */}
      <motion.div
        className="bg-white shadow-md rounded-md p-4 mt-6"
        variants={itemVariants}
      >
        <h3 className="text-lg font-medium mb-2 text-gray-700 flex items-center">
          <Clock className="mr-2" /> Recent Transactions
        </h3>
        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-gray-600">
                    Bill Type
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600">Date</th>
                  <th className="px-4 py-2 text-left text-gray-600">Amount</th>
                  <th className="px-4 py-2 text-left text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => {
                  const formattedDate = format(
                    new Date(transaction.paid_at),
                    "PPP p"
                  );
                  const billType =
                    transaction.bill?.bill_type || "Unknown Bill Type";
                  const statusInfo =
                    paymentStatusIcons[transaction.status] || {
                      icon: AlertTriangle,
                      color: "text-gray-500",
                    };
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={transaction.id} className="border-b">
                      <td className="px-4 py-2 text-gray-700">{billType}</td>
                      <td className="px-4 py-2 text-gray-700">
                        {formattedDate}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        Ksh {transaction.amount_paid}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        <div className="flex items-center">
                          <StatusIcon
                            className={`mr-1 w-4 h-4 ${statusInfo.color}`}
                          />
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
    </motion.div>
  );
};

export default Overview;
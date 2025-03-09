// app/src/components/BillForm.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Wallet, Home, Lightbulb, Droplet, Wifi, Trash2, ArrowRight } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000'; // Replace with your backend URL

interface BillFormProps {
  userId: string;
}

const BillForm: React.FC<BillFormProps> = ({ userId }) => {
  const [billType, setBillType] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!billType || !amount || !paymentMethod || !accountNumber || !dueDate) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/bills/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          bill_type: billType,
          amount: amount,
          payment_method: paymentMethod,
          account_number: accountNumber,
          due_date: dueDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Bill added successfully!');
        setError('');
        // Clear the form
        setBillType('');
        setAmount('');
        setPaymentMethod('');
        setAccountNumber('');
        setDueDate('');
      } else {
        setError(data.message || 'Failed to add bill.');
        setSuccessMessage('');
      }
    } catch (err) {
      setError('An error occurred while adding the bill.');
      setSuccessMessage('');
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

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E2D7E3] via-[#BCAFBD] to-[#E9ADBC]">
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          className="bg-white backdrop-blur-lg bg-opacity-90 rounded-3xl shadow-2xl overflow-hidden"
          variants={itemVariants}
        >
          <div className="h-3 bg-gradient-to-r from-[#E9ADBC] to-[#E17295]"></div>

          <div className="px-8 pt-8 pb-10">
            <motion.div
              className="flex flex-col items-center mb-8"
              variants={itemVariants}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-[#E9ADBC] to-[#E17295] mb-4 shadow-lg">
                <Wallet className="text-white" size={30} />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Add a Bill</h2>
              <p className="text-[#BCAFBD] mt-2 text-center">Enter your bill details below</p>
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
                <label className="block text-[#BCAFBD] text-sm font-medium mb-2" htmlFor="billType">
                  <span className="inline-block mr-2"><Home size={16} /></span>
                  Bill Type
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E9ADBC] focus:border-transparent transition-all duration-200 outline-none"
                  id="billType"
                  value={billType}
                  onChange={(e) => setBillType(e.target.value)}
                >
                  <option value="">Select Bill Type</option>
                  <option value="Electricity"><Lightbulb className="inline-block mr-1" size={14} />Electricity</option>
                  <option value="Rent"><Home className="inline-block mr-1" size={14} />Rent</option>
                  <option value="Water"><Droplet className="inline-block mr-1" size={14} />Water</option>
                  <option value="WiFi"><Wifi className="inline-block mr-1" size={14} />WiFi</option>
                  <option value="Trash"><Trash2 className="inline-block mr-1" size={14} />Trash</option>
                </select>
              </motion.div>

              <motion.div className="mb-4" variants={itemVariants}>
                <label className="block text-[#BCAFBD] text-sm font-medium mb-2" htmlFor="amount">
                  <span className="inline-block mr-2"><Wallet size={16} /></span>
                  Amount
                </label>
                <input
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E9ADBC] focus:border-transparent transition-all duration-200 outline-none"
                  id="amount"
                  type="number"
                  placeholder="Enter Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </motion.div>

              <motion.div className="mb-4" variants={itemVariants}>
                <label className="block text-[#BCAFBD] text-sm font-medium mb-2" htmlFor="paymentMethod">
                  <span className="inline-block mr-2"><Wallet size={16} /></span>
                  Payment Method
                </label>
                <input
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E9ADBC] focus:border-transparent transition-all duration-200 outline-none"
                  id="paymentMethod"
                  type="text"
                  placeholder="Enter Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
              </motion.div>

              <motion.div className="mb-4" variants={itemVariants}>
                <label className="block text-[#BCAFBD] text-sm font-medium mb-2" htmlFor="accountNumber">
                  <span className="inline-block mr-2"><Wallet size={16} /></span>
                  Account Number
                </label>
                <input
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E9ADBC] focus:border-transparent transition-all duration-200 outline-none"
                  id="accountNumber"
                  type="text"
                  placeholder="Enter Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </motion.div>

              <motion.div className="mb-6" variants={itemVariants}>
                <label className="block text-[#BCAFBD] text-sm font-medium mb-2" htmlFor="dueDate">
                  <span className="inline-block mr-2"><Calendar size={16} /></span>
                  Due Date
                </label>
                <input
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E9ADBC] focus:border-transparent transition-all duration-200 outline-none"
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </motion.div>

              <motion.div className="flex items-center justify-between" variants={itemVariants}>
                <motion.button
                  className="w-full bg-gradient-to-r from-[#E9ADBC] to-[#E17295] text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50 transition-all duration-300"
                  type="submit"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <span>Add Bill</span>
                  <ArrowRight className="ml-2" size={18} />
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BillForm;
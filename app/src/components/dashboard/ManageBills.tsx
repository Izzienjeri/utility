// app/src/components/dashboard/ManageBills.tsx
'use client';

import { motion } from 'framer-motion';

const ManageBills = () => {

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
      <motion.h2 className="text-2xl font-semibold mb-4" variants={itemVariants}>Manage Bills</motion.h2>
      <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
        <h3 className="text-lg font-medium mb-2">Add New Bill</h3>
        <p>Select bill type (Electricity, Rent, Water, WiFi, Trash)...</p>
      </motion.div>
      <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
        <h3 className="text-lg font-medium mb-2">Edit Bill Details</h3>
        <p>Update Paybill/Till Number, Account Number...</p>
      </motion.div>
      <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
        <h3 className="text-lg font-medium mb-2">Set Due Dates</h3>
        <p>Choose payment deadlines...</p>
      </motion.div>
      <motion.div className="bg-white shadow-md rounded-md p-4" variants={itemVariants}>
        <h3 className="text-lg font-medium mb-2">Delete Bill</h3>
        <p>Remove a bill if no longer applicable...</p>
      </motion.div>
    </motion.div>
  );
};

export default ManageBills;
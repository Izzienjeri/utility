// app/src/components/dashboard/Notifications.tsx
'use client';

import { motion } from 'framer-motion';

const Notifications = () => {
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
      <motion.h2 className="text-2xl font-semibold mb-4" variants={itemVariants}>Notifications & Reminders</motion.h2>
      <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
        <h3 className="text-lg font-medium mb-2">View Reminders</h3>
        <p>See upcoming email reminders...</p>
      </motion.div>
      <motion.div className="bg-white shadow-md rounded-md p-4 mb-4" variants={itemVariants}>
        <h3 className="text-lg font-medium mb-2">Resend Reminder</h3>
        <p>If a user wants to get another reminder...</p>
      </motion.div>
      <motion.div className="bg-white shadow-md rounded-md p-4" variants={itemVariants}>
        <h3 className="text-lg font-medium mb-2">Unpaid Bill Alerts</h3>
        <p>Notifications for overdue payments...</p>
      </motion.div>
    </motion.div>
  );
};

export default Notifications;
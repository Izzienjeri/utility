"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Heart, ArrowRight } from "lucide-react";

const WelcomeScreen = () => {
  const router = useRouter();

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
                <Heart className="text-blue-800" size={28} />
              </div>
              <h2 className="text-2xl font-semibold ">Welcome to PayTrack!</h2>
              <p className="text-gray-300 mt-1 text-center">
                Simplify your bill payments and stay on top of your expenses.
              </p>
              <p className="text-gray-300 mt-1 text-center">
                Get started now and never miss a payment again!
              </p>
            </motion.div>

            <motion.div
              className="flex items-center justify-center"
              variants={itemVariants}
            >
              <motion.button
                className="w-full bg-white text-blue-800 font-medium py-2.5 px-5 rounded-md flex items-center justify-center shadow-md hover:bg-gray-200 transition-colors duration-300"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => router.push("/?page=billForm")}
              >
                <span>Get Started</span>
                <ArrowRight className="ml-2" size={16} />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;

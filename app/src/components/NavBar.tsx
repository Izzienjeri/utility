// components/NavBar.tsx
"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";

const NavBar = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("isFirstTimeUser");
    router.push("/?page=login");
  };

  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto flex items-center justify-between">
        <motion.h1 className="text-2xl font-bold text-gray-800">
          BillEase
        </motion.h1>

        <motion.button
          className="text-gray-700 hover:text-gray-900 flex items-center"
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }} // Optional: Add a hover effect
          whileTap={{ scale: 0.95 }} // Optional: Add a tap effect
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </motion.button>
      </div>
    </nav>
  );
};

export default NavBar;
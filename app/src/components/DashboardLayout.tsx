// DashboardLayout.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
    Home,
    Wallet,
    List,
    BarChart,
    Bell,
    Settings,
    LogOut,
} from "lucide-react";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activePage = searchParams.get("section") || "overview";

    const navigation = [
        { name: "Overview", href: "/?page=dashboard§ion=overview", icon: Home },
        {
            name: "Manage Bills",
            href: "/?page=dashboard§ion=manage-bills",
            icon: Wallet,
        },
        {
            name: "Payment Options",
            href: "/?page=dashboard§ion=payment-options",
            icon: List,
        },
        {
            name: "Payment History & Analytics",
            href: "/?page=dashboard§ion=payment-history",
            icon: BarChart,
        },
        {
            name: "Notifications & Reminders",
            href: "/?page=dashboard§ion=notifications",
            icon: Bell,
        },
        { name: "Settings", href: "/?page=dashboard§ion=settings", icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isFirstTimeUser");
        router.push("/?page=login");
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

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <motion.aside
                className="w-64 bg-white shadow-md"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <div className="p-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">BillEase</h1>
                    <nav>
                        {navigation.map((item) => (
                            <motion.a
                                key={item.name}
                                href={item.href}
                                className={`flex items-center py-2 px-4 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50 ${item.href === `/?page=dashboard§ion=${activePage}` ? "bg-gradient-to-r from-[#E91E63] to-[#9C27B0] text-white" : ""
                                    }`}
                                variants={itemVariants}
                                onClick={(e) => {
                                    e.preventDefault();
                                    router.push(item.href);
                                }}
                            >
                                <item.icon
                                    className="mr-2 h-5 w-5"
                                    style={{
                                        color: item.href === `/?page=dashboard§ion=${activePage}`
                                            ? "white"
                                            : undefined,
                                    }}
                                />
                                {item.name}
                            </motion.a>
                        ))}
                        <motion.button
                            className="flex items-center py-2 px-4 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                            onClick={handleLogout}
                            variants={itemVariants}
                        >
                            <LogOut className="mr-2 h-5 w-5" />
                            Logout
                        </motion.button>
                    </nav>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 p-4">{children}</div>
        </div>
    );
};

export default DashboardLayout;

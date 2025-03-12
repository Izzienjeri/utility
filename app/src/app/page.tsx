// app/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Auth from '@/components/Auth';
import BillForm from '@/components/BillForm';
import DashboardLayout from '@/components/DashboardLayout';
import Overview from '@/components/dashboard/Overview';
import ManageBills from '@/components/dashboard/ManageBills';
import PaymentOptions from '@/components/dashboard/PaymentOptions';
import PaymentHistory from '@/components/dashboard/PaymentHistory';
import Notifications from '@/components/dashboard/Notifications';
import Settings from '@/components/dashboard/Settings';
import WelcomeScreen from '@/components/WelcomeScreen';
import { useEffect, useState } from "react";

export default function HomePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const page = searchParams.get('page') || 'login';
    const userId = searchParams.get('userId') || '';
    const dashboardSection = searchParams.get('section') || 'overview';
    const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Add a loading state

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedValue = localStorage.getItem('isFirstTimeUser');
            setIsFirstTimeUser(storedValue === 'true');
        }
        setIsLoading(false); // Set loading to false after attempting to retrieve the value
    }, []);

    const renderDashboardSection = () => {
        switch (dashboardSection) {
            case 'overview':
                return <Overview />;
            case 'manage-bills':
                return <ManageBills />;
            case 'payment-options':
                return <PaymentOptions />;
            case 'payment-history':
                return <PaymentHistory />;
            case 'notifications':
                return <Notifications />;
            case 'settings':
                return <Settings />;
            default:
                return <Overview />;
        }
    };

    if (isLoading) {
        return <div>Loading...</div>; // Show a loading indicator while checking localStorage
    }

    if (page === 'dashboard') {
        return (
            <DashboardLayout>
                {renderDashboardSection()}
            </DashboardLayout>
        );
    } else if (page === 'billForm') {
        return <BillForm userId={userId} />;
    } else if (page === 'welcome') {
        return <WelcomeScreen />;
    } else {
        return <Auth initialRoute={page as 'login' | 'register' | 'billForm' | 'dashboard' | 'welcome'} />;
    }
}
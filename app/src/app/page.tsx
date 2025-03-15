// app/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Auth from '@/components/Auth';
import BillForm from '@/components/BillForm';
import DashboardLayout from '@/components/DashboardLayout';
import Overview from '@/components/dashboard/Overview';
import ManageBills from '@/components/dashboard/ManageBills';
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
    const dashboardSection = searchParams.get('ion') || 'overview'; // Corrected name
    const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Add a loading state
    const editBillId = searchParams.get('edit');
    const [checkoutRequestID, setCheckoutRequestID] = useState<string | null>(null);

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
            <DashboardLayout key={dashboardSection}> {/* Key Prop Here! */}
                {renderDashboardSection()}
                {checkoutRequestID && (
                    <div>
                        <p>M-Pesa payment initiated. Check your phone for the prompt.</p>
                        <p>Checkout Request ID: {checkoutRequestID}</p>
                        {/* You might want to add a button to check the payment status later */}
                    </div>
                )}
            </DashboardLayout>
        );
    } else if (page === 'billForm') {
         return <BillForm userId={userId} editBillId={editBillId || null} />;
    } else if (page === 'welcome') {
        return <WelcomeScreen />;
    } else {
        return <Auth initialRoute={page as 'login' | 'register' | 'billForm' | 'dashboard' | 'welcome'} />;
    }
}
// app/src/app/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
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
import {useEffect, useState} from "react";

export default function HomePage() {
    const searchParams = useSearchParams();
    const page = searchParams.get('page') || 'login';
    const userId = searchParams.get('userId') || '';
    const dashboardSection = searchParams.get('section') || 'overview'; // Default dashboard section
    const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsFirstTimeUser(localStorage.getItem('isFirstTimeUser') === 'true');
        }
    }, []);

    const renderDashboardSection = () => {
        switch (dashboardSection) {
            case 'overview':
                return <Overview/>;
            case 'manage-bills':
                return <ManageBills/>;
            case 'payment-options':
                return <PaymentOptions/>;
            case 'payment-history':
                return <PaymentHistory/>;
            case 'notifications':
                return <Notifications/>;
            case 'settings':
                return <Settings/>;
            default:
                return <Overview/>; // Default to Overview
        }
    };

    if (page === 'dashboard') {
        if (isFirstTimeUser === true) {
            return (
                <DashboardLayout>
                    {renderDashboardSection()}
                </DashboardLayout>
            );

        } else {
            return <BillForm userId={userId}/>;
        }


    } else if (page === 'billForm') {
        return <BillForm userId={userId}/>;
    } else if (page === 'welcome') {
        return <WelcomeScreen/>;
    }
    else {
        return <Auth initialRoute={page as 'login' | 'register' | 'billForm' | 'dashboard' | 'welcome'}/>;
    }
}
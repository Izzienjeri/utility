// app/src/app/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Auth from '@/components/Auth';
import BillForm from '@/components/BillForm';

export default function HomePage() {
  const searchParams = useSearchParams();
  const page = searchParams.get('page') || 'login'; // Default to 'login'
  const userId = searchParams.get('userId') || '';

  return (
    <>
      {page === 'billForm' ? <BillForm userId={userId} /> : <Auth initialRoute={page as 'login' | 'register' | 'dashboard' | 'billForm'} />}
    </>
  );
}
'use client';
import Auth from '@/components/Auth';

export default function Home() {
  return (
    <Auth initialRoute="login" /> // Or "register" or "dashboard"
  );
}
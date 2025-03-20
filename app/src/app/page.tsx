// app/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Auth from "@/components/Auth";
import BillForm from "@/components/BillForm";
import NavBar from "@/components/NavBar";
import Dashboard from "@/components/Dashboard";
import WelcomeScreen from "@/components/WelcomeScreen";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = searchParams.get("page") || "login";
  const userId = searchParams.get("userId") || "";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const editBillId = searchParams.get("edit");
  const [checkoutRequestID, setCheckoutRequestID] =
    useState<string | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    setIsAuthenticated(!!accessToken);

    const storedValue = localStorage.getItem("isFirstTimeUser");
    setIsFirstTimeUser(storedValue === "true");

    const checkout = searchParams.get("checkout");
    if (checkout) {
      setCheckoutRequestID(checkout);
    }

    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Clock className="animate-spin mr-2" /> Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth initialRoute={page as "login" | "register"} />;
  }

  //Crucial: Correctly use the isFirstTimeUser value and remove item when navigating away
  if (isFirstTimeUser === true && page === "welcome") {
    return <WelcomeScreen />;
  }

  //Conditionally render navbar
  const shouldShowNavBar = !(isFirstTimeUser === true && page === "billForm");

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {shouldShowNavBar && <NavBar />}
      <div className="flex-1 p-6">
        {page === "billForm" ? (
          <BillForm userId={userId} editBillId={editBillId || null} />
        ) : (
          <Dashboard />
        )}
        {checkoutRequestID && (
          <div>
            <p>M-Pesa payment initiated. Check your phone for the prompt.</p>
            <p>Checkout Request ID: {checkoutRequestID}</p>
          </div>
        )}
      </div>
    </div>
  );
}
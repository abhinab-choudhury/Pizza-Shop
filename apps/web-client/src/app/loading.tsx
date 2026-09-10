"use client";

import { useEffect, useState } from "react";

export default function Loading() {
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingMessage("Welcome to Pinocchio's Pizza");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">
        {loadingMessage}
      </p>
    </div>
  );
}

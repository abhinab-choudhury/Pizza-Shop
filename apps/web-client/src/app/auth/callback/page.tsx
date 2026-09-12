"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const from = searchParams.get("from");

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    localStorage.setItem("access_token", accessToken);

    const redirectTo =
      from &&
      from.startsWith("/") &&
      !from.startsWith("//") &&
      from !== "/login"
        ? from
        : "/product";

    router.replace(redirectTo);
  }, [searchParams, router]);

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">
          Signing you in...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackInner />
    </Suspense>
  );
}
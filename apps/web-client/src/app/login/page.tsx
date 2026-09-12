"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, User, Lock, KeyRound, Eye, EyeOff } from "lucide-react";

type View = "login" | "otp-email" | "otp-verify";

export default function LoginPage() {
  const { login, register, isAuthenticated } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<View>("login");
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [from] = useState(() => {
    if (typeof window !== "undefined") {
      const f = new URLSearchParams(window.location.search).get("from");
      if (
        f &&
        f.startsWith("/") &&
        !f.startsWith("//") &&
        f !== "/login"
      ) {
        return f;
      }
    }
    return "/product";
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(from);
    }
  }, [isAuthenticated, from, router]);

  if (isAuthenticated) {
    return null;
  }

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        await register(email, name, password);
      } else {
        await login(email, password);
      }
      router.replace(from);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      await api.auth.sendOtp(email);
      setView("otp-verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.auth.verifyOtp(email, otpCode);
      localStorage.setItem("access_token", res.accessToken);
      window.location.href = from;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-16 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-1 ring-primary/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pizza.svg"
              alt="Pinocchio's Pizza"
              className="size-12 object-contain"
            />
          </div>
          <CardTitle className="mt-2">
            {view === "otp-verify"
              ? "Enter Verification Code"
              : isRegister
                ? "Create Account"
                : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {view === "otp-verify"
              ? `We sent a 6-digit code to ${email}`
              : isRegister
                ? "Sign up to start ordering"
                : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {view === "otp-verify" ? (
            <OtpVerifyView
              otpCode={otpCode}
              setOtpCode={setOtpCode}
              onVerify={handleVerifyOtp}
              onBack={() => {
                setView("otp-email");
                setOtpCode("");
                setError(null);
              }}
              isLoading={isLoading}
              error={error}
            />
          ) : view === "otp-email" ? (
            <OtpEmailView
              email={email}
              setEmail={setEmail}
              onSend={handleSendOtp}
              onBack={() => {
                setView("login");
                setError(null);
              }}
              isLoading={isLoading}
              error={error}
            />
          ) : (
            <>
              <form onSubmit={handleEmailPasswordSubmit} className="mx-0 my-6 space-y-4">
                {isRegister && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading
                    ? "Please wait..."
                    : isRegister
                      ? "Create Account"
                      : "Sign In"}
                </Button>
              </form>

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  or
                </span>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <a href={api.auth.googleAuthUrl}>
                    <GoogleIcon className="size-4" />
                    Continue with Google
                  </a>
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setView("otp-email");
                    setError(null);
                  }}
                >
                  <Mail className="size-4" />
                  Sign in with Email OTP
                </Button>
              </div>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                {isRegister
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError(null);
                  }}
                  className="font-medium text-primary hover:underline"
                >
                  {isRegister ? "Sign in" : "Create one"}
                </button>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OtpEmailView({
  email,
  setEmail,
  onSend,
  onBack,
  isLoading,
  error,
}: {
  email: string;
  setEmail: (v: string) => void;
  onSend: () => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <div className="space-y-2">
        <Label htmlFor="otp-email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="otp-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          We&apos;ll send a 6-digit verification code to this email
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        className="w-full"
        onClick={onSend}
        disabled={isLoading || !email.trim()}
      >
        {isLoading ? "Sending..." : "Send Verification Code"}
      </Button>
    </div>
  );
}

function OtpVerifyView({
  otpCode,
  setOtpCode,
  onVerify,
  onBack,
  isLoading,
  error,
}: {
  otpCode: string;
  setOtpCode: (v: string) => void;
  onVerify: (e: React.FormEvent) => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <div className="flex justify-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="size-7" />
        </span>
      </div>

      <form onSubmit={onVerify} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp-code">Verification Code</Label>
          <Input
            id="otp-code"
            placeholder="000000"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="text-center text-2xl tracking-[0.5em]"
            maxLength={6}
            autoFocus
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || otpCode.length !== 6}
        >
          {isLoading ? "Verifying..." : "Verify & Sign In"}
        </Button>
      </form>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import AuthSelection, { AuthSelectionType } from "@/components/authSelection";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Lock,
  Mail,
  Facebook,
  Instagram,
  RectangleGoggles,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function LoginContent() {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<AuthSelectionType | null>(null);
  const [step, setStep] = useState("form"); // 'selection', 'form', 'forgot-password'
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for social login error
  useEffect(() => {
    const error = searchParams?.get("error");
    if (error === "social_not_registered") {
      console.log("Social account not registered");
      toast.error(
        "This social account is not registered. Please sign up first."
      );
    } else if (error === "OAuthAccountNotLinked") {
      console.log("OAuth account not linked");
      toast.error(
        "An account with this email already exists. Please sign in using your original method (email/password) or contact support to link your accounts."
      );
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // if (!userType) {
    //   setMessage("Please select your user type.");
    //   setLoading(false);
    //   return;
    // }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl:
        userType === "business" ? "/business/profile" : "/business/profile",
    });

    if (result?.error) {
      console.log("Login error:", result.error);
      toast.error(
        result.error === "CredentialsSignin"
          ? "Invalid email or password. Please try again."
          : result.error
      );
      setLoading(false);
      return;
    }
    if (result?.ok && result?.url) {
      toast.success("Logged in successfully");
      router.push(result.url);
    } else {
      toast.error("An unexpected error occurred.");
    }
    setLoading(false);
  }

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/main/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          "Password reset email has been sent. Please check your inbox."
        );
        setStep("form");
        setForgotEmail("");
      } else {
        toast.error(data.error || "Failed to send reset email.");
      }
    } catch (err) {
      toast.error("Failed to send reset email.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Selection Screen
  if (step === "selection") {
    return <AuthSelection onSelect={setUserType} onNextStep={setStep} />;
  }

  // Forgot Password Screen
  if (step === "forgot-password") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-full max-w-md">
          <Button
            onClick={() => setStep("form")}
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold mb-2 text-black text-center">
            Forgot Password?
          </h2>
          <p className="text-center text-gray-700 mb-8">
            Enter your email below.
          </p>
          <form
            onSubmit={handleForgotPasswordSubmit}
            className="flex flex-col gap-6"
          >
            <div>
              <label className="block text-base font-semibold mb-2 text-black">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="email"
                  name="forgotEmail"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className=""
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="disabled:cursor-not-allowed"
              disabled={forgotLoading}
            >
              {forgotLoading ? "Sending email..." : "Forgot Password"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Login Form Screen
  if (step === "form") {
    return (
      <div className=" h-full">
        <div className="flex flex-col items-center justify-center gap-7">
          <div className="flex flex-col gap-2  text-center">
            <h1 className="text-2xl font-bold text-center">
              Login to your account
            </h1>
            <p className="text-sm text-[#737373]">
              Enter your email below to login to your account
            </p>
          </div>
          <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
            <div>
              <label className="block text-base font-semibold mb-2 text-black">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  name="email"
                  placeholder="Placeholder"
                  value={email}
                  onChange={(e) => setemail(e.target.value)}
                  className=""
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-base font-semibold mb-2 text-black">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="password"
                  name="password"
                  placeholder="Placeholder"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end text-sm mb-2">
              <button
                type="button"
                className="text-black font-semibold hover:underline"
                onClick={() => setStep("forgot-password")}
              >
                Forgot Password?
              </button>
            </div>
            <div className="flex gap-4">
              {/* <Button
                type="button"
                className="flex-1 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors"
                onClick={() => setStep("selection")}
              >
                Back
              </Button> */}
              <Button
                type="submit"
                className="flex-1 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-[#737373]">OR CONTINUE WITH</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
            {/* Social Login Section */}
            <div className="flex flex-col gap-2 w-full">
              <button
                type="button"
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() =>
                  signIn("google", {
                    callbackUrl: "/api/auth/main/socialredirect",
                  })
                }
              >
                <RectangleGoggles className="w-5 h-5" /> Sign in with Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() =>
                  signIn("facebook", {
                    callbackUrl: "/api/auth/main/socialredirect",
                  })
                }
              >
                <Facebook className="w-5 h-5" /> Sign in with Facebook
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() =>
                  signIn("instagram", {
                    callbackUrl: "/api/auth/main/socialredirect",
                  })
                }
              >
                <Instagram className="w-5 h-5" /> Sign in with Instagram
              </button>
            </div>
            <div className="text-center text-black font-medium">
              Don't have an account?{" "}
              <a href="/register" className="underline">
                Sign up
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

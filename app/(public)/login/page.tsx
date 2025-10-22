"use client";

import { useState } from "react";
import AuthSelection, { AuthSelectionType } from "@/components/authSelection";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Mail,
  Facebook,
  Instagram,
  RectangleGoggles,
} from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<AuthSelectionType | null>(null);
  const [step, setStep] = useState("selection"); // 'selection', 'form'
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    if (!userType) {
      setMessage("Please select your user type.");
      setLoading(false);
      return;
    }
    // Let NextAuth handle the redirect and session
    const result = await signIn("credentials", {
      username,
      password,
      userType,
      redirect: false,
      callbackUrl:
        userType === "bussiness" ? "/bussiness/profile" : "/bussiness/profile", // update if influencer profile exists
    });

    if (result?.error) {
      setMessage(
        result.error === "CredentialsSignin"
          ? "Invalid email, password, or user type."
          : result.error
      );
      setLoading(false);
      return;
    }
    if (result?.ok && result?.url) {
      router.push(result.url);
    } else {
      setMessage("An unexpected error occurred.");
    }
    setLoading(false);
  }

  // Selection Screen
  if (step === "selection") {
    return <AuthSelection onSelect={setUserType} onNextStep={setStep} />;
  }

  // Login Form Screen
  if (step === "form") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-2 text-black text-left">
            Welcome back to Kollab
          </h2>
          <p className="text-left text-gray-700 mb-8">
            Please sign in to your account to continue.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-base font-semibold mb-2 text-black">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  placeholder="Placeholder"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-base font-semibold mb-2 text-black">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
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
              >
                Forgot Password?
              </button>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                className="flex-1 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors"
                onClick={() => setStep("selection")}
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
          {/* Social Login Section */}
          <div className="flex flex-col gap-2 mt-8">
            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded font-semibold text-gray-700 hover:bg-gray-50"
              onClick={() =>
                signIn("google", {
                  callbackUrl: "/bussiness/profile",
                })
              }
            >
              <RectangleGoggles className="w-5 h-5" /> Sign in with Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded font-semibold text-gray-700 hover:bg-gray-50"
              onClick={() =>
                signIn("facebook", { callbackUrl: "/bussiness/profile" })
              }
            >
              <Facebook className="w-5 h-5" /> Sign in with Facebook
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded font-semibold text-gray-700 hover:bg-gray-50"
              onClick={() =>
                signIn("instagram", { callbackUrl: "/bussiness/profile" })
              }
            >
              <Instagram className="w-5 h-5" /> Sign in with Instagram
            </button>
          </div>
          {message && (
            <div className="text-center text-sm mt-4 text-red-600">
              {message}
            </div>
          )}
          <div className="text-center mt-8 text-black font-medium">
            Don’t have an account?{" "}
            <a href="/register" className="underline">
              Sign up
            </a>
          </div>
        </div>
      </div>
    );
  }
}

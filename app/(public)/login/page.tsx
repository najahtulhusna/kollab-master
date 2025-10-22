"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    // Let NextAuth handle the redirect and session
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/bussiness/profile",
    });
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">
          Sign in to Your Account
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="flex flex-col gap-2 mt-6">
          <button
            type="button"
            className="bg-red-500 text-white py-2 rounded font-semibold hover:bg-red-600"
            onClick={() =>
              signIn("google", { callbackUrl: "/bussiness/profile" })
            }
          >
            Sign in with Google
          </button>
          <button
            type="button"
            className="bg-blue-800 text-white py-2 rounded font-semibold hover:bg-blue-900"
            onClick={() =>
              signIn("facebook", { callbackUrl: "/bussiness/profile" })
            }
          >
            Sign in with Facebook
          </button>
          <button
            type="button"
            className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white py-2 rounded font-semibold hover:opacity-90"
            onClick={() =>
              signIn("instagram", { callbackUrl: "/bussiness/profile" })
            }
          >
            Sign in with Instagram
          </button>
        </div>
        {message && (
          <div className="text-center text-sm mt-4 text-red-600">{message}</div>
        )}
        <div className="text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-700 hover:underline">
            Register
          </a>
        </div>
      </div>
    </div>
  );
}

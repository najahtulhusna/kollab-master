"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="flex items-center justify-between px-8 py-6 ">
        <div className="text-3xl font-bold">
          <img src="/logo-v1.svg" alt="Logo" />
        </div>
        {/* <div className="flex gap-4 items-center bg-white rounded shadow p-2 ">
          <Link href="/login">
            <button
              className={`px-4 py-2 text-sm font-medium rounded cursor-pointer ${
                pathname === "/login"
                  ? "bg-black text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Login
            </button>
          </Link>
          <Link href="/register">
            <button
              className={`px-4 py-2 text-sm font-medium rounded cursor-pointer ${
                pathname === "/register"
                  ? "bg-black text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Sign Up
            </button>
          </Link>
        </div> */}
      </header>
      <main className="flex-1 h-[calc(100vh-100px)">{children}</main>
    </div>
  );
}

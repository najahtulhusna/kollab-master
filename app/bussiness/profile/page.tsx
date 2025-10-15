"use client";
import { useSession, signOut } from "next-auth/react";

export default function BusinessProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (!session)
    return (
      <div className="text-center mt-10">
        You must be logged in to view this page.
      </div>
    );

  const { user } = session;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow w-full max-w-md mt-10">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Business Profile
        </h2>
        <div className="flex flex-col items-center gap-4">
          {user?.image && (
            <img
              src={user.image}
              alt="Avatar"
              className="w-24 h-24 rounded-full border"
            />
          )}
          <div className="text-lg font-semibold">{user?.name || "No name"}</div>
          <div className="text-gray-600">{user?.email}</div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded shadow"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

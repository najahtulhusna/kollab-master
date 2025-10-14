"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const [apiResult, setApiResult] = useState("");

  async function handleTestApi() {
    setApiResult("Loading...");
    try {
      const res = await fetch("/api/auth/main/testApi");
      const data = await res.json();
      setApiResult(JSON.stringify(data));
    } catch (err) {
      setApiResult("Error calling API");
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold underline">Test Tailwind</h1>

      <h4>Test supabase in /login page</h4>
      <Button>Test Shadcn</Button>
      <Button onClick={handleTestApi}>Call testApi</Button>
      {apiResult && <div className="mt-2 text-center">{apiResult}</div>}
    </div>
  );
}

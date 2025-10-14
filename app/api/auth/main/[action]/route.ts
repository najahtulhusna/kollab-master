import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import test from "node:test";

// ─── Actions ────────────────────────────────
async function getTest() {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from("test-table").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

async function testApi() {
  return NextResponse.json("testApi");
}

// Add more actions here if needed, e.g.
// async function createUser(body: any) { ... }
// async function login(body: any) { ... }

// ─── Router Dispatcher ──────────────────────
export async function GET(req: NextRequest, context: any) {
  // ⚠️ simplest and safest for now
  const action = context.params?.action;

  const actions: Record<string, () => Promise<NextResponse>> = {
    getTest: getTest,
    testApi: testApi,
    // "users": getUsers,
  };

  const fn = actions[action];
  if (!fn) {
    return NextResponse.json({ error: "Invalid GET action" }, { status: 404 });
  }

  return fn();
}

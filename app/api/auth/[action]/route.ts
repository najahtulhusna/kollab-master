import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

// ─── Actions ────────────────────────────────
async function getTest() {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from("test-table").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// Add more actions here if needed, e.g.
// async function createUser(body: any) { ... }
// async function login(body: any) { ... }

// ─── Router Dispatcher ──────────────────────
export async function GET(
  req: Request,
  { params }: { params: { action: string } }
) {
  const actions: Record<string, () => Promise<NextResponse>> = {
    test: getTest,
    // "users": getUsers,
  };

  const fn = actions[params.action];
  if (!fn) {
    return NextResponse.json({ error: "Invalid GET action" }, { status: 404 });
  }

  return fn();
}

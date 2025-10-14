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

import bcrypt from "bcryptjs";

// Register action
async function register(body: any) {
  const { name, email, password } = body;
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const supabase = supabaseServer();
  // Check if user already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  // Create user
  const { data: user, error } = await supabase
    .from("users")
    .insert([{ email, name, password: hashedPassword }])
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // Create account record for credentials provider
  await supabase.from("accounts").insert([
    {
      user_id: user.id,
      provider: "credentials",
      provider_account_id: user.id,
      type: "credentials",
    },
  ]);
  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
}

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

export async function POST(req: NextRequest, context: any) {
  const action = context.params?.action;
  const body = await req.json();
  const actions: Record<string, (body: any) => Promise<NextResponse>> = {
    register,
    // add more POST actions here
  };
  const fn = actions[action];
  if (!fn) {
    return NextResponse.json({ error: "Invalid POST action" }, { status: 404 });
  }
  return fn(body);
}

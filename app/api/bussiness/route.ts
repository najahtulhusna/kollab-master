import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// ─── Get Business Info by User ID from Session ──────────
export async function GET(req: NextRequest) {
  // Get session
  const session = await getServerSession(authOptions);
  console.log("Session in business GET route:", session);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json(
      { error: "Not authenticated or user id missing in session" },
      { status: 401 }
    );
  }
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("bussiness")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ business: data });
}

// ─── Save or Update Business ─────────────────────────────
async function saveOrUpdateBusiness(body: any) {
  try {
    const { id, user_id, name, job_position } = body;
    // Get session
    const session = await getServerSession(authOptions);
    console.log("Session in business GET route:", session);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated or user id missing in session" },
        { status: 401 }
      );
    }
    if (!name || !job_position) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const supabase = supabaseServer();
    if (id) {
      // Try update by id
      const { data, error } = await supabase
        .from("bussiness")
        .update({ name, job_position })
        .eq("id", id)
        .select()
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ message: "Business updated", business: data });
    } else {
      // Insert new
      const { data, error } = await supabase
        .from("bussiness")
        .insert([{ userId, name, job_position }])
        .select()
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ message: "Business created", business: data });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

// ─── Router Dispatcher ──────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json();
  return saveOrUpdateBusiness(body);
}

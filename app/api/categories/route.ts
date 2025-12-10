import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to load categories", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ categories: data || [] });
}

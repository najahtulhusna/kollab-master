import { NextRequest, NextResponse } from "next/server";

async function getTestDetails(req: NextRequest) {
  return NextResponse.json({ message: "Test GET route is working!" });
}

// ─── Router Dispatcher ──────────────────────
export async function GET(req: NextRequest, context: any) {
  const action = context.params?.action;
  const actions: Record<string, () => Promise<NextResponse>> = {
    tester2: () => getTestDetails(req),
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
  const actions: Record<string, (body: any) => Promise<NextResponse>> = {};
  const fn = actions[action];
  if (!fn) {
    return NextResponse.json({ error: "Invalid POST action" }, { status: 404 });
  }
  return fn(body);
}

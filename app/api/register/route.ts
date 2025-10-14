import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }
    // Read existing users
    let users = [];
    try {
      const data = await fs.readFile(USERS_FILE, "utf-8");
      users = JSON.parse(data);
    } catch (e) {
      users = [];
    }
    // Check for duplicate email
    if (users.some((u: any) => u.email === email)) {
      return NextResponse.json(
        { error: "Email already registered." },
        { status: 409 }
      );
    }
    // Add new user
    users.push({ email, password });
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

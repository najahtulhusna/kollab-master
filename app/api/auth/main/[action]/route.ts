import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

// ─── Actions ────────────────────────────────

// Social redirect handler
async function socialRedirect(req: NextRequest) {
  // Get the session
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).email) {
    // Not logged in, redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }
  const email = (session.user as any).email;
  // Check user in DB
  const supabase = supabaseServer();
  const { data: user, error } = await supabase
    .from("users")
    .select("username")
    .eq("email", email)
    .single();
  if (!error && user && user.username) {
    // Username exists, go to profile page
    return NextResponse.redirect(new URL("/business/profile", req.url));
  }
  // Otherwise, go to signup page with social param
  return NextResponse.redirect(new URL("/register?social=true", req.url));
}
async function getTest() {
  return NextResponse.json({ message: "Test GET route is working!" });
}

async function testApi() {
  return NextResponse.json("testApi");
}

import bcrypt from "bcryptjs";

async function verifyPassword(body: any) {
  try {
    const { userId, password } = body;

    if (!userId || !password) {
      return NextResponse.json(
        { error: "Missing required fields: userId and password" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Get the password hash from accounts table
    const { data: account, error: fetchError } = await supabase
      .from("accounts")
      .select("password_hash")
      .eq("user_id", userId)
      .eq("provider", "local")
      .single();

    if (fetchError || !account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, account.password_hash);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: "Password verified successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

async function updateProfile(body: any) {
  try {
    const {
      userId,
      email,
      username,
      firstname,
      lastname,
      password,
      usertype,
      referral_source,
      categories,
      phone,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id, email, usertype")
      .eq("id", userId)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If email is being changed, check if new email is already taken
    if (email && email !== existingUser.email) {
      const { data: emailExists } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .eq("usertype", existingUser.usertype)
        .neq("id", userId)
        .single();

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (email) updateData.email = email;
    if (username) updateData.username = username;
    if (firstname) updateData.firstname = firstname;
    if (lastname) updateData.lastname = lastname;
    if (usertype) updateData.usertype = usertype;
    if (referral_source) updateData.referral_source = referral_source;
    if (categories) updateData.categories = categories;
    if (phone) updateData.phone = phone;

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (updateError || !updatedUser) {
      return NextResponse.json(
        { error: updateError?.message || "Profile update failed" },
        { status: 500 }
      );
    }

    // If password is provided, update it in accounts table
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      const { error: passwordError } = await supabase
        .from("accounts")
        .update({ password_hash: hashedPassword })
        .eq("user_id", userId)
        .eq("provider", "local");

      if (passwordError) {
        return NextResponse.json(
          { error: "Password update failed" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        avatar_url: updatedUser.avatar_url,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        usertype: updatedUser.usertype,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

async function register(body: any) {
  try {
    const {
      name,
      email,
      password,
      username,
      avatar_url,
      firstname,
      lastname,
      usertype,
      referral_source,
      categories,
      phone,
    } = body;
    const missingFields = [];
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!username) missingFields.push("username");
    if (!firstname) missingFields.push("firstname");
    if (!lastname) missingFields.push("lastname");
    if (!usertype) missingFields.push("usertype");
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }
    const supabase = supabaseServer();
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .eq("usertype", usertype)
      .single();
    if (existingUser) {
      return NextResponse.json(
        { error: `Email already bound to a ${usertype} account` },
        { status: 409 }
      );
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user with all fields
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert([
        {
          email,
          username,
          avatar_url: avatar_url || null,
          firstname,
          lastname,
          usertype,
          referral_source: referral_source || null,
          categories: categories || null,
          phone: phone || null,
        },
      ])
      .select()
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { error: userError?.message || "User creation failed" },
        { status: 500 }
      );
    }
    // Create account record for local provider
    const { error: accountError } = await supabase.from("accounts").insert([
      {
        user_id: user.id,
        provider: "local",
        provider_account_id: user.id,
        password_hash: hashedPassword,
      },
    ]);
    if (accountError) {
      return NextResponse.json(
        { error: accountError.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar_url: user.avatar_url,
        firstname: user.firstname,
        lastname: user.lastname,
        usertype: user.usertype,
        name: user.name,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

async function forgotPassword(body: any) {
  try {
    const { email } = body;
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }
    const supabase = supabaseServer();
    // Find user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();
    if (userError || !user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
    // Set new password to '123456'
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("123456", 10);
    const { error: updateError } = await supabase
      .from("accounts")
      .update({ password_hash: hashedPassword })
      .eq("user_id", user.id)
      .eq("provider", "local");
    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }
    return NextResponse.json({ message: "Password reset to 123456" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

async function updateAvatar(req: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await req.formData();
    const userId = formData.get("userId");
    const file = formData.get("avatar");
    if (
      !userId ||
      !file ||
      typeof userId !== "string" ||
      !(file instanceof File)
    ) {
      return NextResponse.json(
        { error: "Missing userId or avatar file" },
        { status: 400 }
      );
    }
    // Generate file name
    const ext = path.extname(file.name) || ".png";
    const guid = randomUUID();
    const epoch = Math.floor(Date.now() / 1000);
    const fileName = `${guid}_${epoch}${ext}`;
    const saveDir = path.join(process.cwd(), "public/profileImage");
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }
    const filePath = path.join(saveDir, fileName);
    // Save file to disk
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
    // Save path to db (relative path)
    const supabase = supabaseServer();
    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: `/profileImage/${fileName}` })
      .eq("id", userId);
    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update avatar in db" },
        { status: 500 }
      );
    }
    return NextResponse.json({
      message: "Avatar updated",
      avatar_url: `/profileImage/${fileName}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

async function checkEmail(body: any) {
  try {
    const { email, usertype } = body;
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }
    const supabase = supabaseServer();
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .eq("usertype", usertype)
      .single();

    return NextResponse.json({ exists: !!existingUser });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
// ─── Router Dispatcher ──────────────────────
export async function GET(req: NextRequest, context: any) {
  const action = context.params?.action;
  const actions: Record<string, () => Promise<NextResponse>> = {
    getTest: getTest,
    testApi: testApi,
    socialredirect: () => socialRedirect(req),
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
  // Special case for updateAvatar: handle multipart form data
  if (action === "updateAvatar") {
    return updateAvatar(req);
  }
  const body = await req.json();
  const actions: Record<string, (body: any) => Promise<NextResponse>> = {
    register,
    updateProfile,
    verifyPassword,
    forgotPassword,
    checkEmail,
    // updateAvatar handled above
  };
  const fn = actions[action];
  if (!fn) {
    return NextResponse.json({ error: "Invalid POST action" }, { status: 404 });
  }
  return fn(body);
}

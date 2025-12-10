import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

type SupabaseClient = ReturnType<typeof supabaseServer>;

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
};

const slugifyCategory = (value: string) => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (normalized) return normalized;
  return `category-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
};

const normalizeCategoryNames = (categories: unknown): string[] => {
  if (typeof categories === "string") {
    categories = [categories];
  }

  if (!Array.isArray(categories)) return [];

  const seen = new Set<string>();
  const names: string[] = [];

  categories.forEach((raw) => {
    if (typeof raw !== "string") return;
    const name = raw.trim();
    if (!name) return;

    const slug = slugifyCategory(name);
    if (seen.has(slug)) return;
    seen.add(slug);
    names.push(name);
  });

  return names;
};

async function upsertCategories(
  supabase: SupabaseClient,
  categoryNames: string[]
): Promise<CategoryRow[]> {
  if (!categoryNames.length) return [];

  const mapped = categoryNames.map((name) => ({
    name,
    slug: slugifyCategory(name),
  }));

  const slugs = mapped.map((item) => item.slug);

  const { data: existing, error: existingError } = await supabase
    .from("categories")
    .select("id, name, slug")
    .in("slug", slugs);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingBySlug = new Map<string, CategoryRow>(
    (existing || []).map((row) => [row.slug, row])
  );

  const toInsert = mapped.filter((item) => !existingBySlug.has(item.slug));
  let inserted: CategoryRow[] = [];

  if (toInsert.length) {
    const { data: insertedRows, error: insertError } = await supabase
      .from("categories")
      .upsert(toInsert, { onConflict: "slug" })
      .select("id, name, slug");

    if (insertError) {
      throw new Error(insertError.message);
    }

    inserted = insertedRows || [];
  }

  const merged = new Map<string, CategoryRow>([
    ...existingBySlug.entries(),
    ...inserted.map((item) => [item.slug, item]),
  ]);

  return mapped
    .map((item) => merged.get(item.slug))
    .filter((item): item is CategoryRow => Boolean(item));
}

async function syncUserCategories(
  supabase: SupabaseClient,
  userId: string,
  categories: string[]
): Promise<CategoryRow[]> {
  const normalizedNames = normalizeCategoryNames(categories);

  if (!normalizedNames.length) {
    await supabase.from("user_categories").delete().eq("user_id", userId);
    return [];
  }

  const categoryRows = await upsertCategories(supabase, normalizedNames);

  await supabase.from("user_categories").delete().eq("user_id", userId);

  const { error: linkError } = await supabase
    .from("user_categories")
    .upsert(
      categoryRows.map((category) => ({
        user_id: userId,
        category_id: category.id,
      })),
      { onConflict: "user_id,category_id" }
    );

  if (linkError) {
    throw new Error(linkError.message);
  }

  return categoryRows;
}

async function fetchUserCategories(
  supabase: SupabaseClient,
  userId: string
): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("user_categories")
    .select("category:categories(id, name, slug)")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return (
    data
      ?.map((row: any) => row.category)
      .filter(Boolean) as CategoryRow[]
  );
}

// ─── Actions ────────────────────────────────

/**
 * Handle social login redirect based on user registration status
 * @param req - Next.js request object
 * @param redirectMode - Determines where to redirect unregistered users:
 *   - 'login': Redirects to login page with error message (for login flow)
 *   - 'register': Redirects to register page with social=true param (for registration flow)
 */
async function handleSocialRedirect(
  req: NextRequest,
  redirectMode: "login" | "register"
) {
  // Get the session
  const session = await getServerSession(authOptions);

  // If not logged in, redirect to login
  if (!session || !session.user || !(session.user as any).email) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const email = (session.user as any).email;

  // Check if user exists in database
  const supabase = supabaseServer();
  const { data: user, error } = await supabase
    .from("users")
    .select("username, usertype")
    .eq("email", email)
    .single();

  // If user exists and has usertype, profile is complete - go to dashboard
  if (!error && user && user.usertype) {
    return NextResponse.redirect(new URL("/business/profile", req.url));
  }

  // User not registered - redirect based on mode
  if (redirectMode === "login") {
    // From login page: show error that social account not registered
    return NextResponse.redirect(
      new URL("/login?error=social_not_registered", req.url)
    );
  } else {
    // From register page: continue to registration with social data
    // Preserve usertype from original request if it exists
    const { searchParams } = new URL(req.url);
    const usertype = searchParams.get("usertype");
    const registerUrl = new URL("/register", req.url);
    registerUrl.searchParams.set("social", "true");
    if (usertype) {
      registerUrl.searchParams.set("usertype", usertype);
    }
    return NextResponse.redirect(registerUrl);
  }
}

// Wrapper functions for backward compatibility
async function socialRedirect(req: NextRequest) {
  return handleSocialRedirect(req, "login");
}

async function socialRedirect2(req: NextRequest) {
  return handleSocialRedirect(req, "register");
}
async function getTest() {
  return NextResponse.json({ message: "Test GET route is working!" });
}

async function testApi() {
  return NextResponse.json("testApi");
}

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

    const normalizedCategories = normalizeCategoryNames(categories);
    const shouldUpdateCategories = Array.isArray(categories) || typeof categories === "string";

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
    if (referral_source !== undefined)
      updateData.referral_source = referral_source || null;
    if (phone !== undefined) updateData.phone = phone || null;

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

    let userCategories: CategoryRow[] = [];
    if (shouldUpdateCategories) {
      try {
        userCategories = await syncUserCategories(
          supabase,
          userId,
          normalizedCategories
        );
      } catch (err: any) {
        return NextResponse.json(
          { error: "Failed to update categories", details: err.message },
          { status: 500 }
        );
      }
    } else {
      try {
        userCategories = await fetchUserCategories(supabase, userId);
      } catch (err: any) {
        // Do not fail the request if categories are not critical
        userCategories = [];
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
        categories: userCategories.map((item) => item.name),
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
    const normalizedCategories = normalizeCategoryNames(categories);
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

    let userCategories: CategoryRow[] = [];
    if (normalizedCategories.length) {
      try {
        userCategories = await syncUserCategories(
          supabase,
          user.id,
          normalizedCategories
        );
      } catch (err: any) {
        return NextResponse.json(
          { error: "Failed to attach categories", details: err.message },
          { status: 500 }
        );
      }
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
        categories: userCategories.map((item) => item.name),
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

async function getUserProfile(body: any) {
  try {
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Get user profile data
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let categories: CategoryRow[] = [];
    try {
      categories = await fetchUserCategories(supabase, userId);
    } catch (err) {
      categories = [];
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        avatar_url: user.avatar_url,
        phone: user.phone,
        usertype: user.usertype,
        categories: categories.map((item) => item.name),
        referral_source: user.referral_source,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
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
    socialredirectregister: () => socialRedirect2(req),
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
    getUserProfile,
    // updateAvatar handled above
  };
  const fn = actions[action];
  if (!fn) {
    return NextResponse.json({ error: "Invalid POST action" }, { status: 404 });
  }
  return fn(body);
}

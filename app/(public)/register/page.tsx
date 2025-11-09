"use client";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Briefcase, Sparkles, User, Mail, Lock } from "lucide-react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthSelection, { AuthSelectionType } from "@/components/authSelection";
import CompanyInformation, {
  CompanyData,
} from "@/components/CompanyInformation";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const isSocial = searchParams.get("social") === "true";
    if (isSocial) {
      getSession().then((session) => {
        if (session) {
          setFormData((prev) => ({
            ...prev,
            firstName: session.user?.firstname || "",
            email: session.user?.email || "",
          }));
        }
        console.log("Session info for social registration:", session);
      });
    }
  }, [searchParams]);
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [userType, setUserType] = useState<AuthSelectionType | null>(null);
  const [step, setStep] = useState("selection"); // 'selection', 'form', 'company', 'loading'
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    repeatPassword: "",
    // avatar_url: "", // Uncomment and add input if you want avatar support
  });
  const [companyData, setCompanyData] = useState<CompanyData>({
    companyName: "",
    jobPosition: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    // Immediate password match validation
    if (name === "password" || name === "repeatPassword") {
      if (
        updatedForm.password &&
        updatedForm.repeatPassword &&
        updatedForm.password !== updatedForm.repeatPassword
      ) {
        setPasswordError("Passwords do not match.");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleCompanyDataChange = (data: CompanyData) => {
    setCompanyData(data);
    console.log("Company data updated:", data); // For debugging
  };

  const handleCompanySubmit = async (data: CompanyData) => {
    setMessage("");
    setLoading(true);
    try {
      // Get user id from next-auth session
      const session = await getSession();
      const userId = session?.user?.id;
      if (!userId) {
        setMessage("User ID not found in session. Please log in again.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/business/saveOrUpdateBusiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          name: data.companyName,
          job_position: data.jobPosition,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        router.push("/business/profile");
      } else {
        setMessage(result.error || "Failed to save business information.");
      }
    } catch (err) {
      setMessage("Failed to save business information.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    if (formData.password !== formData.repeatPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }
    // Check if session exists (social login)
    const session = await getSession();
    if (session && session.user) {
      // Social user: update existing user
      const res = await fetch("/api/auth/main/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          email: formData.email,
          username: formData.username,
          firstname: formData.firstName,
          lastname: formData.lastName,
          password: formData.password,
          usertype: userType,
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        await update({
          ...session?.user,
          username: formData.username,
          email: formData.email,
          firstname: formData.firstName,
          lastname: formData.lastName,
          usertype: userType,
        });
        if (userType === "business") {
          setStep("company");
        } else {
          router.push("/business/profile");
        }
      } else {
        setMessage(data.error || "Profile update failed.");
      }
      setLoading(false);
      return;
    }
    // Normal registration flow
    const res = await fetch("/api/auth/main/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        firstname: formData.firstName,
        lastname: formData.lastName,
        usertype: userType,
      }),
    });
    const data = await res.json();
    if (res.ok && data.user) {
      setMessage("Registration successful! You can now log in.");
      try {
        // Auto-login the user
        const signInResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        if (signInResult?.ok) {
          if (userType === "business") {
            setStep("company");
          } else {
            router.push("/business/profile");
          }
        } else {
          router.push("/login");
          setLoading(false);
        }
      } catch (error) {
        console.error("Auto-login error:", error);
        router.push("/login");
        setLoading(false);
      }
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        repeatPassword: "",
      });
    } else {
      setMessage(data.error || "Registration failed.");
    }
    setLoading(false);
  };

  // Selection Screen
  if (step === "selection") {
    return <AuthSelection onSelect={setUserType} onNextStep={setStep} />;
  }

  // Form Screen
  if (step === "form") {
    return (
      <div className="h-full bg-white">
        <main className="flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Progress Indicator */}
            {/* <div className="flex items-center justify-center mb-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full text-sm font-medium">
                  ✓
                </div>
                <div className="w-24 h-0.5 bg-gray-300"></div>
                <div className="flex items-center justify-center w-8 h-8 border-2 border-gray-300 rounded-full text-sm font-medium">
                  2
                </div>
                {userType === "business" && (
                  <>
                    <div className="w-24 h-0.5 bg-gray-300"></div>
                    <div className="flex items-center justify-center w-8 h-8 border-2 border-gray-300 rounded-full text-sm font-medium">
                      3
                    </div>
                  </>
                )}
              </div>
            </div> */}

            {/* Form Title */}
            <h1 className="text-2xl font-bold mb-2">Create your account</h1>
            <p className="text-sm text-gray-600 mb-8">
              Tell us a bit about yourself. Please fill in your personal
              information.
            </p>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="yourname@mail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Repeat Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="repeatPassword"
                    placeholder="Repeat Password"
                    value={formData.repeatPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                      passwordError ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                </div>
                {passwordError && (
                  <div className="text-xs text-red-600 mt-1">
                    {passwordError}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep("selection")}
                  className="flex-1 py-2.5 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </div>
            </form>
            {message && (
              <div className="text-center text-sm mt-4 text-red-600">
                {message}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Company Information Screen
  if (step === "company") {
    return (
      <div className="h-full bg-white">
        <main className="flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <CompanyInformation
              onDataChange={handleCompanyDataChange}
              onSubmit={handleCompanySubmit}
              initialData={companyData}
            />

            {message && (
              <div className="text-center text-sm mt-4 text-red-600">
                {message}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Loading Screen
  return (
    <div className="h-3/4 bg-white">
      <main className="h-full flex flex-col items-center justify-center">
        <div className="w-full max-w-md text-center">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full text-sm font-medium">
                ✓
              </div>
              <div className="w-24 h-0.5 bg-black"></div>
              <div className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full text-sm font-medium">
                ✓
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">
            We're setting things up for you...
          </h1>
          <p className="text-sm text-gray-600 mb-12">
            Hang tight! We're setting you up and getting things ready for you.
          </p>

          {/* Animated Loading Box */}
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-gray-400 text-lg animate-pulse">
                LOADER ANIMATION HERE
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

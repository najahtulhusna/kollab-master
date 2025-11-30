"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn, useSession } from "next-auth/react";
import AuthSelection, { AuthSelectionType } from "@/components/authSelection";
import CompanyInformation, {
  CompanyData,
} from "@/components/CompanyInformation";
import SignupForm from "@/components/signup-form";

function SignUpContent() {
  const searchParams = useSearchParams();
  const { update } = useSession();
  const router = useRouter();
  const [userType, setUserType] = useState<AuthSelectionType | null>(null);
  const [step, setStep] = useState("selection"); // 'selection', 'form', 'company', 'categories', 'teamSize'
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    repeatPassword: "",
    phone: "",
  });
  const [companyData, setCompanyData] = useState<CompanyData>({
    companyName: "",
    jobPosition: "",
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [customCategory, setCustomCategory] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [teamMode, setTeamMode] = useState<"independent" | "team" | "">("");
  const [location, setLocation] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (searchParams.get("social") !== "true") return;
    getSession().then((session) => {
      if (session) {
        setFormData((prev) => ({
          ...prev,
          firstName: session.user?.firstname || "",
          email: session.user?.email || "",
        }));
        setStep("form");
      }
      console.log("Session info for social registration:", session);
    });
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

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
    console.log("Company data updated:", data);
  };

  const handleCompanySubmit = (data: CompanyData) => {
    setCompanyData(data);
    setMessage("");
    setStep("categories");
  };

  const handleFinalize = async () => {
    setMessage("");
    setLoading(true);
    try {
      const categoryValue =
        selectedCategory === "Other" ? customCategory : selectedCategory;
      if (!categoryValue) {
        setMessage("Please select a category.");
        setLoading(false);
        return;
      }
      if (userType === "business") {
        if (!teamSize) {
          setMessage("Please select your team size.");
          setLoading(false);
          return;
        }
        if (!location.trim()) {
          setMessage("Please provide your business location.");
          setLoading(false);
          return;
        }
      }
      if (!referralSource.trim()) {
        setMessage("Please tell us how you heard about us.");
        setLoading(false);
        return;
      }
      const session = await getSession();
      const userId = session?.user?.id;
      if (!userId) {
        setMessage("User ID not found in session. Please log in again.");
        setLoading(false);
        return;
      }
      if (userType === "business") {
        const res = await fetch("/api/business/saveOrUpdateBusiness", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            name: companyData.companyName,
            job_position: companyData.jobPosition,
            team_size: teamSize,
            location,
          }),
        });
        const result = await res.json();
        if (!res.ok) {
          setMessage(result.error || "Failed to save business information.");
          setLoading(false);
          return;
        }
      }
      // Persist referral and categories to the user profile
      const referralRes = await fetch("/api/auth/main/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          referral_source: referralSource,
          categories: categoryValue,
        }),
      });
      if (!referralRes.ok) {
        const referralData = await referralRes.json();
        console.warn("Referral save failed:", referralData?.error);
      }
      setCompleted(true);
      setStep("completed");
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
    if (!formData.phone) {
      setMessage("Phone number is required.");
      setLoading(false);
      return;
    }
    if (!acceptedTerms) {
      setMessage("Please accept the terms and conditions.");
      setLoading(false);
      return;
    }

    // Check if session exists (social login)
    const existingSession = await getSession();
    if (existingSession && existingSession.user) {
      const res = await fetch("/api/auth/main/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: existingSession.user.id,
          email: formData.email,
          username: formData.username,
          firstname: formData.firstName,
          lastname: formData.lastName,
          password: formData.password,
          usertype: userType,
          phone: formData.phone,
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        await update({
          ...existingSession.user,
          username: formData.username,
          email: formData.email,
          firstname: formData.firstName,
          lastname: formData.lastName,
          usertype: userType,
          phone: formData.phone,
        });
        if (userType === "business") {
          setStep("company");
        } else {
          setStep("categories");
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
        phone: formData.phone,
      }),
    });
    const data = await res.json();
    if (res.ok && data.user) {
      setMessage("Registration successful! You can now log in.");
      try {
        const signInResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        if (signInResult?.ok) {
          if (userType === "business") {
            setStep("company");
          } else {
            setStep("categories");
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
        phone: "",
      });
      setAcceptedTerms(false);
    } else {
      setMessage(data.error || "Registration failed.");
    }
    setLoading(false);
  };

  if (completed || step === "completed") {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md text-center space-y-6 px-4">
          <div className="text-3xl font-bold">Your account is all set!</div>
          <p className="text-gray-600">
            You can now access your profile and start using Kollab.
          </p>
          <button
            className="w-full py-3 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors"
            onClick={() => router.push("/business/profile")}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === "selection") {
    return (
      <AuthSelection
        onSelect={(type) => {
          setUserType(type);
          setStep("emailCheck");
        }}
        onNextStep={() => setStep("emailCheck")}
      />
    );
  }

  if (step === "emailCheck") {
    return (
      <div className="h-full bg-white">
        <main className="flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold mb-2">Verify your email</h1>
            <p className="text-sm text-gray-600 mb-6">
              Enter your email to check if an account already exists.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  className="flex-1 py-2.5 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors"
                  onClick={() => setStep("selection")}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="flex-1 py-2.5 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors"
                  disabled={emailCheckLoading || !formData.email || !userType}
                  onClick={async () => {
                    if (!formData.email || !userType) {
                      setMessage("Please enter email and select account type.");
                      return;
                    }
                    setMessage("");
                    setEmailCheckLoading(true);
                    try {
                      const res = await fetch("/api/auth/main/checkEmail", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          email: formData.email,
                          usertype: userType,
                        }),
                      });
                      const data = await res.json();
                      if (res.ok && data.exists) {
                        setMessage("An account with this email already exists. Please log in.");
                      } else if (res.ok) {
                        setStep("form");
                      } else {
                        setMessage(data.error || "Unable to verify email.");
                      }
                    } catch (err) {
                      setMessage("Unable to verify email.");
                    }
                    setEmailCheckLoading(false);
                  }}
                >
                  {emailCheckLoading ? "Checking..." : "Continue"}
                </button>
              </div>
              {message && (
                <div className="text-sm text-red-600 text-center">{message}</div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (step === "form") {
    return (
      <SignupForm
        formData={formData}
        passwordError={passwordError}
        loading={loading}
        message={message}
        onInputChange={handleInputChange}
        onPhoneChange={(value) =>
          setFormData((prev) => ({
            ...prev,
            phone: value,
          }))
        }
        acceptedTerms={acceptedTerms}
        onToggleTerms={() => setAcceptedTerms((prev) => !prev)}
        onSubmit={handleSubmit}
        onBack={() => setStep("selection")}
      />
    );
  }

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

  if (step === "categories") {
    const categoryOptions = [
      "Fashion",
      "Technology",
      "Food & Beverage",
      "Health & Wellness",
      "Travel",
      "Other",
    ];

    const selectedLabel =
      selectedCategory === "Other" ? customCategory : selectedCategory;

    return (
      <div className="h-full bg-white">
        <main className="flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold mb-2">
              Select your business category
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Choose the category that best describes your business.
            </p>

            <div className="grid gap-3 mb-4">
              {categoryOptions.map((option) => {
                const isActive = option === selectedCategory;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(option);
                      setMessage("");
                      if (option !== "Other") {
                        setCustomCategory("");
                      }
                    }}
                    className={`w-full text-left px-4 py-3 rounded border ${
                      isActive ? "border-black bg-gray-50" : "border-gray-300"
                    } hover:border-black transition-colors`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {selectedCategory === "Other" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">
                  Specify your category
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., Education"
                />
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep("company")}
                className="flex-1 py-2.5 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedCategory) {
                    setMessage("Please select a category.");
                    return;
                  }
                  if (selectedCategory === "Other" && !customCategory.trim()) {
                    setMessage("Please specify your category.");
                    return;
                  }
                  setMessage("");
                  if (userType === "business") {
                    setStep("teamMode");
                  } else {
                    setStep("referral");
                  }
                }}
                className="flex-1 py-2.5 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors"
              >
                Continue
              </button>
            </div>
            {message && (
              <div className="text-center text-sm mt-4 text-red-600">
                {message}
              </div>
            )}
            {selectedLabel && (
              <div className="text-center text-xs text-gray-600 mt-2">
                Selected: {selectedLabel}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (step === "teamMode") {
    return (
      <div className="h-full bg-white">
        <main className="flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold mb-2">Choose account type</h1>
            <p className="text-sm text-gray-600 mb-6">
              Are you signing up as an independent or with a team?
            </p>

            <div className="grid gap-3 mb-4">
              {[
                { key: "independent", label: "Independent" },
                { key: "team", label: "Team" },
              ].map((opt) => {
                const isActive = teamMode === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setTeamMode(opt.key as "independent" | "team");
                      setMessage("");
                    }}
                    className={`w-full text-left px-4 py-3 rounded border ${
                      isActive ? "border-black bg-gray-50" : "border-gray-300"
                    } hover:border-black transition-colors`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep("categories")}
                className="flex-1 py-2.5 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!teamMode) {
                    setMessage("Please select an account type.");
                    return;
                  }
                  if (teamMode === "independent") {
                    setTeamSize("independent");
                    setStep("location");
                  } else {
                    setTeamSize("");
                    setStep("teamSize");
                  }
                  setMessage("");
                }}
                className="flex-1 py-2.5 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors"
              >
                Continue
              </button>
            </div>
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

  if (step === "teamSize") {
    const teamOptions = ["1-10", "11-50", "51-200", "200+"];

    return (
      <div className="h-full bg-white">
        <main className="flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold mb-2">Select your team size</h1>
            <p className="text-sm text-gray-600 mb-6">
              This helps us tailor recommendations for your business.
            </p>

            <div className="grid gap-3 mb-4">
              {teamOptions.map((option) => {
                const isActive = option === teamSize;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setTeamSize(option);
                      setMessage("");
                    }}
                    className={`w-full text-left px-4 py-3 rounded border ${
                      isActive ? "border-black bg-gray-50" : "border-gray-300"
                    } hover:border-black transition-colors`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep("categories")}
                className="flex-1 py-2.5 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!teamSize) {
                    setMessage("Please select your team size.");
                    return;
                  }
                  setMessage("");
                  setStep("location");
                }}
                className="flex-1 py-2.5 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors"
              >
                Continue
              </button>
            </div>
            {message && (
              <div className="text-center text-sm mt-4 text-red-600">
                {message}
              </div>
            )}
            {teamSize && (
              <div className="text-center text-xs text-gray-600 mt-2">
                Selected team size: {teamSize}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (step === "location") {
    return (
      <div className="h-full bg-white">
        <main className="flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold mb-2">Business location</h1>
            <p className="text-sm text-gray-600 mb-6">
              Where is your business primarily based?
            </p>

            <div className="mb-4">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep("teamSize")}
                className="flex-1 py-2.5 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!location.trim()) {
                    setMessage("Please provide your business location.");
                    return;
                  }
                  setMessage("");
                  setStep("referral");
                }}
                className="flex-1 py-2.5 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors"
              >
                Continue
              </button>
            </div>
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

  if (step === "referral") {
    const referralOptions = [
      "Friend or colleague",
      "Social media",
      "Search engine",
      "Event or webinar",
      "App store",
      "Other",
    ];

    return (
      <div className="h-full bg-white">
        <main className="flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold mb-2">How did you hear about us?</h1>
            <p className="text-sm text-gray-600 mb-6">
              This helps us understand how people find Kollab.
            </p>

            <div className="grid gap-3 mb-4">
              {referralOptions.map((option) => {
                const isActive = option === referralSource;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setReferralSource(option);
                      setMessage("");
                    }}
                    className={`w-full text-left px-4 py-3 rounded border ${
                      isActive ? "border-black bg-gray-50" : "border-gray-300"
                    } hover:border-black transition-colors`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5">
                Or tell us more
              </label>
              <input
                type="text"
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
                placeholder="e.g., Newsletter, Blog post"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() =>
                  setStep(userType === "business" ? "location" : "categories")
                }
                className="flex-1 py-2.5 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinalize}
                className="flex-1 py-2.5 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors"
                disabled={loading}
              >
                {loading ? "Saving..." : "Finish"}
              </button>
            </div>
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

  if (completed) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md text-center space-y-6 px-4">
          <div className="text-3xl font-bold">Your account is all set!</div>
          <p className="text-gray-600">
            You can now access your profile and start using Kollab.
          </p>
          <button
            className="w-full py-3 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors"
            onClick={() => router.push("/business/profile")}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <div className="flex justify-center gap-4">
          <div className="w-3 h-3 rounded-full bg-black animate-pulse" />
          <div className="w-3 h-3 rounded-full bg-gray-500 animate-pulse delay-150" />
          <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse delay-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Setting things up...</h1>
          <p className="text-sm text-gray-600">
            Hang tight! We're preparing your account.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}

"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn, useSession } from "next-auth/react";
import { toast } from "sonner";

import AuthSelection, { AuthSelectionType } from "@/components/authSelection";
import CompanyInformation, {
  CompanyData,
} from "@/components/CompanyInformation";
import SignupForm from "@/components/signup-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Facebook, Instagram, RectangleGoggles } from "lucide-react";

const DEFAULT_CATEGORY_OPTIONS = [
  "Fashion",
  "Technology",
  "Food & Beverage",
  "Health & Wellness",
  "Travel",
];
const MAX_CATEGORIES = 3;

function SignUpContent() {
  const searchParams = useSearchParams();
  const { update } = useSession();
  const router = useRouter();
  const [userType, setUserType] = useState<AuthSelectionType | null>(null);
  const [step, setStep] = useState("selection");
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
  const [categoryOptions, setCategoryOptions] = useState<string[]>(
    DEFAULT_CATEGORY_OPTIONS
  );
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [teamMode, setTeamMode] = useState<"independent" | "team" | "">("");
  const [location, setLocation] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [otherReferralText, setOtherReferralText] = useState("");
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (searchParams.get("social") !== "true") return;
    getSession().then((session) => {
      if (session) {
        setFormData((prev) => ({
          ...prev,
          firstName: session.user?.firstname || "",
          email: session.user?.email || "",
        }));

        // Get usertype from URL parameter if it exists
        const usertypeParam = searchParams.get(
          "usertype"
        ) as AuthSelectionType | null;
        if (
          usertypeParam &&
          (usertypeParam === "business" || usertypeParam === "influencer")
        ) {
          setUserType(usertypeParam);
        }

        setStep("form");
      }
      console.log("Session info for social registration:", session);
    });
  }, [searchParams]);

  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Unable to fetch categories");
        const data = await res.json();
        const names =
          data?.categories
            ?.map((item: any) =>
              typeof item?.name === "string" ? item.name.trim() : ""
            )
            .filter((name: string) => !!name) || [];
        if (names.length) {
          setCategoryOptions(names);
        }
      } catch (err) {
        toast.error("Unable to load categories. Showing defaults instead.");
        setCategoryOptions(DEFAULT_CATEGORY_OPTIONS);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

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
    setStep("categories");
  };

  const isCategorySelected = (name: string) =>
    selectedCategories.some(
      (item) => item.toLowerCase() === name.trim().toLowerCase()
    );

  const toggleCategorySelection = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setSelectedCategories((prev) => {
      const exists = prev.some(
        (item) => item.toLowerCase() === trimmed.toLowerCase()
      );

      if (exists) {
        return prev.filter(
          (item) => item.toLowerCase() !== trimmed.toLowerCase()
        );
      }

      if (prev.length >= MAX_CATEGORIES) {
        toast.error(`You can select up to ${MAX_CATEGORIES} categories.`);
        return prev;
      }

      return [...prev, trimmed];
    });
  };

  const handleAddCustomCategory = () => {
    if (!customCategory.trim()) {
      toast.error("Please type a category to add.");
      return;
    }
    toggleCategorySelection(customCategory);
    setCustomCategory("");
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      if (!selectedCategories.length) {
        toast.error("Please select at least one category.");
        setLoading(false);
        return;
      }
      if (userType === "business") {
        if (!teamSize) {
          toast.error("Please select your team size.");
          setLoading(false);
          return;
        }
        if (!location.trim()) {
          toast.error("Please provide your business location.");
          setLoading(false);
          return;
        }
      }
      if (!referralSource.trim()) {
        toast.error("Please tell us how you heard about us.");
        setLoading(false);
        return;
      }
      if (referralSource === "Other" && !otherReferralText.trim()) {
        toast.error("Please specify how you heard about us.");
        setLoading(false);
        return;
      }
      const session = await getSession();
      const userId = session?.user?.id;
      if (!userId) {
        toast.error("User ID not found in session. Please log in again.");
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
          toast.error(result.error || "Failed to save business information.");
          setLoading(false);
          return;
        }
      }
      const finalReferralSource =
        referralSource === "Other" ? otherReferralText : referralSource;
      const referralRes = await fetch("/api/auth/main/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          referral_source: finalReferralSource,
          categories: selectedCategories,
        }),
      });
      if (!referralRes.ok) {
        const referralData = await referralRes.json();
        console.warn("Referral save failed:", referralData?.error);
      }
      setStep("completed");
    } catch (err) {
      toast.error("Failed to save business information.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (formData.password !== formData.repeatPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }
    if (!formData.phone) {
      toast.error("Phone number is required.");
      setLoading(false);
      return;
    }
    if (!acceptedTerms) {
      toast.error("Please accept the terms and conditions.");
      setLoading(false);
      return;
    }

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
        toast.error(data.error || "Profile update failed.");
      }
      setLoading(false);
      return;
    }

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
      toast.success("Registration successful! You can now log in.");
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
      toast.error(data.error || "Registration failed.");
    }
    setLoading(false);
  };

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
        <main className="flex flex-col items-center justify-center gap-7">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-center">
              Kollab for Business
            </h1>
            <p className="text-sm text-[#737373]">
              Create an account or login to manage your business.
            </p>
          </div>

          <div className="w-full space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className=""
                placeholder="you@example.com"
              />
            </div>

            <div className=" flex flex-col gap-4">
              {/* <Button
                type="button"
                className="w-full bg-white text-black border"
                onClick={() => setStep("selection")}
              >
                Back
              </Button> */}
              <Button
                type="button"
                className="w-full"
                onClick={async () => {
                  if (!formData.email || !userType) {
                    toast.error("Please enter email and select account type.");
                    return;
                  }
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
                      toast.error(
                        "An account with this email already exists. Please log in."
                      );
                    } else if (res.ok) {
                      setStep("form");
                    } else {
                      toast.error(data.error || "Unable to verify email.");
                    }
                  } catch (err) {
                    toast.error("Unable to verify email.");
                  }
                  setEmailCheckLoading(false);
                }}
              >
                {emailCheckLoading ? "Checking..." : "Continue"}
              </Button>
            </div>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-[#737373]">OR CONTINUE WITH</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() =>
                  signIn("google", {
                    callbackUrl: `/api/auth/main/socialredirectregister?usertype=${userType}`,
                  })
                }
              >
                <RectangleGoggles className="w-5 h-5" /> Sign in with Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() =>
                  signIn("facebook", {
                    callbackUrl: `/api/auth/main/socialredirectregister?usertype=${userType}`,
                  })
                }
              >
                <Facebook className="w-5 h-5" /> Sign in with Facebook
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() =>
                  signIn("instagram", {
                    callbackUrl: `/api/auth/main/socialredirectregister?usertype=${userType}`,
                  })
                }
              >
                <Instagram className="w-5 h-5" /> Sign in with Instagram
              </button>
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
        onBack={() => setStep("emailCheck")}
      />
    );
  }

  if (step === "company") {
    return (
      <CompanyInformation
        onDataChange={handleCompanyDataChange}
        onSubmit={handleCompanySubmit}
        initialData={companyData}
      />
    );
  }

  if (step === "categories") {
    return (
      <div className="h-full bg-white">
        <main className="flex flex-col items-center justify-center gap-7">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-bold ">
              Select categories that best describe your business
            </h1>
            <p className="text-sm text-[#737373]">
              Choose your primary and up to 3 related service type
            </p>
          </div>

          <div className="flex items-center justify-between w-full text-xs text-gray-600">
            <span>Select up to {MAX_CATEGORIES} categories.</span>
            <span>
              {selectedCategories.length}/{MAX_CATEGORIES} selected
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            {categoriesLoading ? (
              <div className="col-span-2 text-center text-sm text-gray-500">
                Loading categories...
              </div>
            ) : (
              categoryOptions.map((option) => {
                const isActive = isCategorySelected(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleCategorySelection(option)}
                    className={`w-full text-left px-4 py-3 rounded border ${
                      isActive ? "border-black bg-gray-50" : "border-gray-300"
                    } hover:border-black transition-colors`}
                  >
                    {option}
                  </button>
                );
              })
            )}
          </div>

          <div className="w-full space-y-2">
            <label className="block text-sm font-medium">
              Add a custom category
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter service type"
                className=""
              />
              <Button type="button" onClick={handleAddCustomCategory}>
                Add
              </Button>
            </div>
          </div>

          {selectedCategories.length > 0 && (
            <div className="w-full flex flex-wrap gap-2 text-sm">
              {selectedCategories.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => toggleCategorySelection(item)}
                    className="text-gray-500 hover:text-black"
                    aria-label={`Remove ${item}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <Button
            type="button"
            onClick={() => {
              if (!selectedCategories.length) {
                toast.error("Please select at least one category.");
                return;
              }
              if (userType === "business") {
                setStep("teamMode");
              } else {
                setStep("referral");
              }
            }}
            className="w-full"
          >
            Continue
          </Button>
        </main>
      </div>
    );
  }

  if (step === "teamMode") {
    return (
      <div className="h-full bg-white">
        <main className="flex flex-col items-center justify-center gap-7">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-bold ">Select account type</h1>
            <p className="text-sm text-[#737373]">
              This will help us set up your account correctly
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            {[
              { key: "independent", label: "I'm an independent" },
              { key: "team", label: "I have a team" },
            ].map((opt) => {
              const isActive = teamMode === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setTeamMode(opt.key as "independent" | "team");
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

          <Button
            type="button"
            onClick={() => {
              if (!teamMode) {
                toast.error("Please select an account type.");
                return;
              }
              if (teamMode === "independent") {
                setTeamSize("independent");
                setStep("location");
              } else {
                setTeamSize("");
                setStep("teamSize");
              }
            }}
            className="w-full"
          >
            Continue
          </Button>
        </main>
      </div>
    );
  }

  if (step === "teamSize") {
    const teamOptions = ["2-5 people", "6-10 people", "11+ people"];

    return (
      <div className="h-full bg-white">
        <main className="flex flex-col items-center justify-center gap-7">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-bold ">What's your team size</h1>
          </div>

          <div className="grid gap-3 mb-4 w-full">
            {teamOptions.map((option) => {
              const isActive = option === teamSize;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setTeamSize(option);
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

          <div className="flex flex-col gap-4 w-full">
            {/* <Button
              type="button"
              onClick={() => setStep("teamMode")}
              className="w-full bg-white text-black border"
            >
              Back
            </Button> */}
            <Button
              type="button"
              onClick={() => {
                if (!teamSize) {
                  toast.error("Please select your team size.");
                  return;
                }
                setStep("location");
              }}
              className="w-full"
            >
              Continue
            </Button>
          </div>
          {teamSize && (
            <div className="text-center text-xs text-gray-600 mt-2">
              Selected team size: {teamSize}
            </div>
          )}
        </main>
      </div>
    );
  }

  if (step === "location") {
    return (
      <div className="h-full bg-white">
        <main className="flex flex-col items-center justify-center gap-7">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-bold ">
              Where's your business located?
            </h1>
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-2">
              Business Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your business location"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-4 w-full">
            {/* <Button
              type="button"
              onClick={() => setStep("teamMode")}
              className="w-full bg-white text-black border"
            >
              Back
            </Button> */}
            <Button
              type="button"
              onClick={() => {
                if (!location.trim()) {
                  toast.error("Please provide your business location.");
                  return;
                }
                setStep("referral");
              }}
              className="w-full"
            >
              Continue
            </Button>
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
        <main className="flex flex-col items-center justify-center gap-7">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-bold ">How did you hear about us?</h1>
            <p className="text-sm text-[#737373]">
              This helps us understand how people find Kollab.
            </p>
          </div>

          <div className="space-y-3 mb-4 w-full">
            {referralOptions.map((option) => {
              const isChecked = option === referralSource;
              return (
                <div key={option} className="flex items-center gap-3">
                  <Checkbox
                    id={`referral-${option}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setReferralSource(option);
                        if (option !== "Other") {
                          setOtherReferralText("");
                        }
                      }
                    }}
                    className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                  />
                  <label
                    htmlFor={`referral-${option}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {option}
                  </label>
                </div>
              );
            })}
          </div>

          {referralSource === "Other" && (
            <div className="w-full">
              <label className="block text-sm font-medium mb-1.5">
                Please specify
              </label>
              <Input
                type="text"
                value={otherReferralText}
                onChange={(e) => setOtherReferralText(e.target.value)}
                placeholder="Enter your answer here"
                className="w-full "
              />
            </div>
          )}

          <div className="flex flex-col gap-4 w-full">
            {/* <Button
              type="button"
              onClick={() =>
                setStep(userType === "business" ? "location" : "categories")
              }
              className="w-full bg-white text-black border"
            >
              Back
            </Button> */}
            <Button
              type="button"
              onClick={handleFinalize}
              className="w-full"
              disabled={loading}
            >
              {loading ? "Saving..." : "Create Account"}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (step === "completed" && userType === "business") {
    return (
      <div className="h-full bg-white">
        <main className="flex flex-col items-center justify-center gap-7">
          <img src="/account-setup.png" alt="Logo" className="" />
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-bold ">Your business is set up!</h1>
            <p className="text-sm text-[#737373]">
              Let's get your first campaign rolling.
            </p>
          </div>
          <div className="w-full ">
            <Button
              className="w-full "
              onClick={() => router.push("/business/profile")}
            >
              Let's go!
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (step === "completed" && userType === "influencer") {
    return (
      <div className="h-full bg-white">
        <main className="flex flex-col items-center justify-center gap-7">
          <img src="/account-setup.png" alt="Logo" className="" />
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-bold ">Your profile is set up!</h1>
            <p className="text-sm text-[#737373]">
              Let's get you your first collab.
            </p>
          </div>
          <div className="w-full ">
            <Button
              className="w-full "
              onClick={() => router.push("/business/profile")}
            >
              Let's go!
            </Button>
          </div>
        </main>
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

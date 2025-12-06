"use client";
import React from "react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type SignupFormData = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  repeatPassword: string;
  phone: string;
};

type SignupFormProps = {
  formData: SignupFormData;
  passwordError: string;
  loading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (value: string) => void;
  acceptedTerms: boolean;
  onToggleTerms: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
};

export function SignupForm({
  formData,
  passwordError,
  loading,
  onInputChange,
  onPhoneChange,
  acceptedTerms,
  onToggleTerms,
  onSubmit,
  onBack,
}: SignupFormProps) {
  return (
    <div className="h-full bg-white">
      <main className="flex flex-col items-center justify-center gap-7">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold ">Kollab for Business</h1>
          <p className="text-sm text-[#737373]">
            You're almost there! Create your new account for {formData.email}
             by completing these details.
          </p>
        </div>

        <form className="w-full space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={onInputChange}
                className=""
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Last Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={onInputChange}
                className=""
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="email"
                name="email"
                placeholder="yourname@mail.com"
                value={formData.email}
                onChange={onInputChange}
                className=""
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={onInputChange}
                className=""
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={onInputChange}
                className=""
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Repeat Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="password"
                name="repeatPassword"
                placeholder="Repeat your password"
                value={formData.repeatPassword}
                onChange={onInputChange}
                className={`${
                  passwordError ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
            </div>
            {passwordError && (
              <div className="text-xs text-red-600 mt-1">{passwordError}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <PhoneInput
                international
                defaultCountry="MY"
                value={formData.phone}
                onChange={(value: string | undefined) =>
                  onPhoneChange(value || "")
                }
                className={cn(
                  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                )}
              />
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={onToggleTerms}
              className="mt-1 h-4 w-4 border-gray-300 rounded data-[state=checked]:bg-black data-[state=checked]:border-black focus:ring-black"
            />
            <label htmlFor="terms" className="text-sm text-[#737373]">
              I agree to the Privacy Policy, Terms of Service & Terms of
              Business.
            </label>
          </div>

          <div className="flex flex-col gap-4">
            {/* <Button
              type="button"
              onClick={onBack}
              className="w-full bg-white text-black border"
            >
              Back
            </Button> */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Continue"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default SignupForm;

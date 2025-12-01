import React from "react";
import { Briefcase, Sparkles, User, Mail, Lock } from "lucide-react";
export type AuthSelectionType = "business" | "influencer";

interface AuthSelectionProps {
  onSelect: (type: AuthSelectionType) => void;
  onNextStep: (step: string) => void;
}

const AuthSelection: React.FC<AuthSelectionProps> = ({
  onSelect,
  onNextStep,
}) => {
  return (
    <main className="flex flex-col items-center justify-center gap-7">
      <h1 className="text-2xl font-bold text-center mb-2">Create an account</h1>

      <div className="flex flex-col gap-6">
        <button
          onClick={() => {
            onSelect("business");
            onNextStep("form");
          }}
          className=" text-left w-full p-4 border-2 border-gray-300 rounded-md hover:border-gray-400 hover:shadow-md transition-all"
        >
          <p className="text-sm font-medium">Kollab for Business</p>
          <p className="text-sm text-[#737373]">
            Manage campaigns. Work with creators. Grow your brand.
          </p>
        </button>

        <button
          onClick={() => {
            onSelect("influencer");
            onNextStep("form");
          }}
          className=" text-left w-full p-4 border-2 border-gray-300 rounded-md hover:border-gray-400 hover:shadow-md transition-all"
        >
          <p className="text-sm font-medium">Kollab for Influencer</p>
          <p className="text-sm text-[#737373]">
            Get collabs. Build your profile. Earn more.
          </p>
        </button>
      </div>
      <div>
        <p className="text-sm text-center ">
          Already have an account?{" "}
          <a href="/login" className="underline font-bold">
            Log in
          </a>
        </p>
      </div>
    </main>
  );
};

export default AuthSelection;

import React from "react";
import { Briefcase, Sparkles, User, Mail, Lock } from "lucide-react";
export type AuthSelectionType = "bussiness" | "influencer";

interface AuthSelectionProps {
  onSelect: (type: AuthSelectionType) => void;
  onNextStep: (step: string) => void;
}

const AuthSelection: React.FC<AuthSelectionProps> = ({
  onSelect,
  onNextStep,
}) => {
  return (
    <div className="h-3/4 bg-white flex justify-center">
      <main className="flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-center mb-2">
            Let's get you started!
          </h1>
          <p className="text-center text-gray-600 mb-12">
            Choose how you'd like to sign up. Are you registering as a Business
            or as an Influencer?
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            <button
              onClick={() => {
                onSelect("bussiness");
                onNextStep("form");
              }}
              className="flex flex-col items-center justify-center w-40 h-40 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-md transition-all"
            >
              <Briefcase className="w-12 h-12 mb-3" strokeWidth={1.5} />
              <span className="text-sm font-medium">As Business</span>
            </button>

            <button
              onClick={() => {
                onSelect("influencer");
                onNextStep("form");
              }}
              className="flex flex-col items-center justify-center w-40 h-40 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-md transition-all"
            >
              <Sparkles className="w-12 h-12 mb-3" strokeWidth={1.5} />
              <span className="text-sm font-medium">As an Influencer</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthSelection;

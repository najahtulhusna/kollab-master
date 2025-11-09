"use client";
import React, { useState } from "react";
import { Building, Briefcase } from "lucide-react";

export interface CompanyData {
  companyName: string;
  jobPosition: string;
}

interface CompanyInformationProps {
  onDataChange?: (data: CompanyData) => void;
  onSubmit?: (data: CompanyData) => void;
  initialData?: Partial<CompanyData>;
  className?: string;
}

export default function CompanyInformation({
  onDataChange,
  onSubmit,
  initialData = {},
  className = "",
}: CompanyInformationProps) {
  const [formData, setFormData] = useState<CompanyData>({
    companyName: initialData.companyName || "",
    jobPosition: initialData.jobPosition || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };

    setFormData(updatedData);

    // Call the onChange callback to notify parent component
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <div className={`w-full max-w-md ${className}`}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Company Information</h1>
        <p className="text-sm text-gray-600">
          Almost there! Please provide your company details to complete your
          profile.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-2">
            Company Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Job Position <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="jobPosition"
              placeholder="Job Position"
              value={formData.jobPosition}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
              required
            />
          </div>
        </div>

        {onSubmit && (
          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Continue
          </button>
        )}
      </form>
    </div>
  );
}

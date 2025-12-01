"use client";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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
    <div className="h-full bg-white">
      <main className="flex flex-col items-center justify-center gap-7">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold ">What’s your business name?</h1>
          <p className="text-sm text-[#737373]">
            This is the brand name your clients will see. Your billing and legal
            name can be added later.
          </p>
        </div>

        <form className="w-full space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-2">
              Bussiness Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                name="companyName"
                placeholder="Enter your business name"
                value={formData.companyName}
                onChange={handleInputChange}
                className=""
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Job Position <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                name="jobPosition"
                placeholder="Job Position"
                value={formData.jobPosition}
                onChange={handleInputChange}
                className=""
                required
              />
            </div>
          </div>

          {onSubmit && (
            <Button type="submit" className="w-full ">
              Continue
            </Button>
          )}
        </form>
      </main>
    </div>
  );
}

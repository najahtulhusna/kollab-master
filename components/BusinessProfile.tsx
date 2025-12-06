"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  Sparkles,
  Loader2,
  Edit2,
  AlertCircle,
  Save,
} from "lucide-react";
import { toast } from "sonner";

export default function BusinessProfile({
  userId,
  usertype,
}: {
  userId: string;
  usertype: string;
}) {
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessError, setBusinessError] = useState("");
  const [businessEdit, setBusinessEdit] = useState(false);
  const [businessForm, setBusinessForm] = useState({
    id: "",
    name: "",
    job_position: "",
  });
  const [businessSaveLoading, setBusinessSaveLoading] = useState(false);

  useEffect(() => {
    if (usertype === "business") {
      setBusinessLoading(true);
      fetch("/api/business/getBusinessDetails")
        .then((res) => res.json())
        .then((data) => {
          if (data.business) {
            setBusinessInfo(data.business);
          } else {
            setBusinessError(data.error || "No business info found");
            toast.error(data.error || "No business info found");
          }
        })
        .catch(() => {
          const errorMessage = "Failed to fetch business info";
          setBusinessError(errorMessage);
          toast.error(errorMessage);
        })
        .finally(() => setBusinessLoading(false));
    }
  }, [usertype]);

  useEffect(() => {
    if (businessInfo) {
      setBusinessForm({
        id: businessInfo.id || "",
        name: businessInfo.name || "",
        job_position: businessInfo.job_position || "",
      });
    }
  }, [businessInfo]);

  if (usertype !== "business") return null;

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Business Information</h3>
        </div>
        {!businessEdit && businessInfo && (
          <Button
            onClick={() => setBusinessEdit(true)}
            size="sm"
            className="gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Business Info
          </Button>
        )}
      </div>
      {businessLoading ? (
        <div className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="animate-spin w-4 h-4" /> Loading business info...
        </div>
      ) : businessError ? (
        <div className="text-red-500 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {businessError}
        </div>
      ) : businessEdit ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground font-medium">
                Company Name
              </label>
              <Input
                type="text"
                value={businessForm.name}
                onChange={(e) =>
                  setBusinessForm({ ...businessForm, name: e.target.value })
                }
                placeholder="Enter company name"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground font-medium">
                Job Position
              </label>
              <Input
                type="text"
                value={businessForm.job_position}
                onChange={(e) =>
                  setBusinessForm({
                    ...businessForm,
                    job_position: e.target.value,
                  })
                }
                placeholder="Enter job position"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              onClick={async () => {
                setBusinessSaveLoading(true);
                try {
                  const res = await fetch(
                    "/api/business/saveOrUpdateBusiness",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        id: businessForm.id,
                        user_id: userId,
                        name: businessForm.name,
                        job_position: businessForm.job_position,
                      }),
                    }
                  );
                  const data = await res.json();
                  if (res.ok) {
                    toast.success("Business info updated!");
                    setBusinessEdit(false);
                    setBusinessInfo(data.business);
                  } else {
                    toast.error(data.error || "Failed to update business info");
                  }
                } catch (err) {
                  toast.error("Failed to update business info");
                }
                setBusinessSaveLoading(false);
              }}
              disabled={businessSaveLoading}
              className="flex-1"
            >
              {businessSaveLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 w-4 h-4" />
                  Save
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setBusinessEdit(false);
                setBusinessForm({
                  id: businessInfo?.id || "",
                  name: businessInfo?.name || "",
                  job_position: businessInfo?.job_position || "",
                });
              }}
              variant="outline"
              disabled={businessSaveLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : businessInfo ? (
        <div className="grid gap-4 mt-2">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-medium">
                Company Name
              </p>
              <p className="text-sm font-medium mt-0.5">{businessInfo.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-medium">
                Job Position
              </p>
              <p className="text-sm font-medium mt-0.5">
                {businessInfo.job_position}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground flex items-center gap-2">
          No business info found.
          <Button
            onClick={() => setBusinessEdit(true)}
            size="sm"
            className="ml-2 gap-2"
            variant="outline"
          >
            <Edit2 className="w-4 h-4" /> Add Business Info
          </Button>
        </div>
      )}
    </div>
  );
}

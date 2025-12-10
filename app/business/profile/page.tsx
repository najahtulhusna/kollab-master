"use client";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User as UserIcon,
  Mail as MailIcon,
  Loader2,
  Edit2,
  Save,
  AlertCircle,
  Lock,
  Camera,
  Phone,
  Briefcase,
  Tag,
  UserCheck,
  Calendar,
} from "lucide-react";
import BusinessProfile from "@/components/BusinessProfile";
import { toast } from "sonner";

export default function BusinessProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstname: "",
    lastname: "",
    password: "",
  });

  // Get userId from session
  const userId = (session?.user as any)?.id;

  // Fetch user profile data using API
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      setIsLoadingProfile(true);
      try {
        const response = await fetch("/api/auth/main/getUserProfile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        const data = await response.json();

        if (response.ok && data.user) {
          setUser(data.user);
        } else {
          toast.error(data.error || "Failed to load profile");
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (status === "loading" || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">
            You must be logged in to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load user profile.</p>
        </div>
      </div>
    );
  }

  const usertype = user?.usertype;

  const handleEdit = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      password: "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: "",
      email: "",
      firstname: "",
      lastname: "",
      password: "",
    });
    setPasswordError("");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append("userId", userId);
      form.append("avatar", file);
      const res = await fetch("/api/auth/main/updateAvatar", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (res.ok && data.avatar_url) {
        // Refresh user profile data
        const profileResponse = await fetch("/api/auth/main/getUserProfile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const profileData = await profileResponse.json();
        if (profileResponse.ok && profileData.user) {
          setUser(profileData.user);
          toast.success("Avatar updated successfully!");
        }
      } else {
        toast.error(data.error || "Failed to update avatar");
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveClick = () => {
    // Show password confirmation dialog
    setPasswordError("");
    setCurrentPassword("");
    setShowPasswordDialog(true);
  };

  const handleVerifyAndSave = async () => {
    if (!currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }

    setIsVerifying(true);
    setPasswordError("");

    try {
      // Verify current password
      const verifyResponse = await fetch("/api/auth/main/verifyPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          password: currentPassword,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setPasswordError(verifyData.error || "Password verification failed");
        setIsVerifying(false);
        return;
      }

      // Password verified, now update profile
      setShowPasswordDialog(false);
      setIsSaving(true);

      const updateData: any = {
        userId: userId,
        email: formData.email,
        username: formData.username,
      };

      if (formData.firstname) updateData.firstname = formData.firstname;
      if (formData.lastname) updateData.lastname = formData.lastname;
      if (formData.password) updateData.password = formData.password;

      const updateResponse = await fetch("/api/auth/main/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const updateResult = await updateResponse.json();

      if (!updateResponse.ok) {
        toast.error(updateResult.error || "Failed to update profile");
        setIsSaving(false);
        return;
      }

      // Refresh user profile data
      const profileResponse = await fetch("/api/auth/main/getUserProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const profileData = await profileResponse.json();
      if (profileResponse.ok && profileData.user) {
        setUser(profileData.user);
      }

      setIsEditing(false);
      setCurrentPassword("");
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      setPasswordError("An unexpected error occurred");
      toast.error("An unexpected error occurred while updating profile");
    } finally {
      setIsVerifying(false);
      setIsSaving(false);
    }
  };

  const handleDialogClose = () => {
    if (!isVerifying) {
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setPasswordError("");
    }
  };

  return (
    <div className=" mt-10">
      <div className="max-w-2xl">
        {/* Profile Card */}
        <div className="bg-card border rounded-lg shadow-sm mt-4">
          {/* Content */}
          <div className="relative pt-16 pb-6 px-6">
            <div className="absolute -top-12 left-8">
              <div className="relative group">
                <button
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="w-24 h-24 rounded-full border-4 border-background bg-muted overflow-hidden cursor-pointer hover:opacity-90 transition-opacity disabled:cursor-not-allowed"
                >
                  {user?.avatar_url ? (
                    <img
                      src={user?.avatar_url || ""}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <UserIcon className="text-primary w-10 h-10" />
                    </div>
                  )}
                </button>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {isUploadingAvatar ? (
                    <Loader2 className="animate-spin h-6 w-6 text-white" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>
            {!isEditing ? (
              <>
                {/* View Mode */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {user?.firstname + " " + user?.lastname || "No name"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user?.email}
                    </p>
                  </div>
                  <Button onClick={handleEdit} size="sm" className="gap-2">
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </div>

                {/* Info Grid */}
                <div className="grid gap-4 mt-8">
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium">
                        Username
                      </p>
                      <p className="text-sm font-medium mt-0.5">
                        {user?.username || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                      <MailIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium">
                        Email
                      </p>
                      <p className="text-sm font-medium mt-0.5">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium">
                        Phone
                      </p>
                      <p className="text-sm font-medium mt-0.5">
                        {user?.phone || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium">
                        User Type
                      </p>
                      <p className="text-sm font-medium mt-0.5 capitalize">
                        {user?.usertype || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                      <Tag className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium">
                        Categories
                      </p>
                      <p className="text-sm font-medium mt-0.5">
                        {Array.isArray(user?.categories)
                          ? user.categories.join(", ")
                          : user?.categories || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium">
                        Referral Source
                      </p>
                      <p className="text-sm font-medium mt-0.5">
                        {user?.referral_source || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium">
                        Member Since
                      </p>
                      <p className="text-sm font-medium mt-0.5">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Not available"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                      Username
                    </label>
                    <Input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder="Enter your username"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MailIcon className="w-4 h-4 text-muted-foreground" />
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input
                        type="text"
                        value={formData.firstname}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstname: e.target.value,
                          })
                        }
                        placeholder="First name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input
                        type="text"
                        value={formData.lastname}
                        onChange={(e) =>
                          setFormData({ ...formData, lastname: e.target.value })
                        }
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Leave blank to keep current password"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave blank if you don't want to change your password
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSaveClick}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isSaving}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Move BusinessProfile outside the profile card */}
      {usertype === "business" && (
        <div className="max-w-2xl ">
          <div className="bg-card border rounded-lg shadow-sm mt-4 p-6">
            <BusinessProfile userId={userId} usertype={usertype} />
          </div>
        </div>
      )}

      {/* Password Confirmation Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Identity</DialogTitle>
            <DialogDescription>
              Please enter your current password to save changes to your
              profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleVerifyAndSave();
                  }
                }}
                disabled={isVerifying}
              />
              {passwordError && (
                <p className="text-sm text-red-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {passwordError}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDialogClose}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button onClick={handleVerifyAndSave} disabled={isVerifying}>
              {isVerifying ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Verifying...
                </>
              ) : (
                "Confirm & Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

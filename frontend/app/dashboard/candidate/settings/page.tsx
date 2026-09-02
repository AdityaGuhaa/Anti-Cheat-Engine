"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Upload,
  Github,
  Linkedin,
  Save,
  MapPin,
  Globe,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";
import { useApi } from "@/hooks/useApi";

export default function SettingsPage() {
  const { fetchWithAuth } = useApi();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    bio: "",
    email: "",
    location: "",
  });

  useEffect(() => {
    fetchWithAuth("/api/candidate/profile")
      .then((data) => setProfile(data))
      .catch(console.error);
  }, []);

  // 2. Generic Input Handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setProfile({ ...profile, [e.target.id]: e.target.value });
  };

  // 3. Save to Backend
  const handleSave = async () => {
    setLoading(true);
    try {
      await fetchWithAuth("/api/candidate/profile/update", {
        method: "POST",
        body: JSON.stringify(profile),
      });
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your profile, resume, and preferences.
        </p>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Identity & Resume */}
        <div className="space-y-6">
          {/* Profile Picture Card */}
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="relative group">
                <Avatar className="w-28 h-28 border-4 border-white shadow-lg">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>AM</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="text-white" size={24} />
                </div>
              </div>
              <h3 className="mt-4 font-bold text-gray-900 text-lg">
                Alex Mercer
              </h3>
              <p className="text-sm text-gray-500">Senior Frontend Developer</p>

              <div className="mt-6 w-full">
                <Button
                  variant="outline"
                  className="w-full text-xs h-8 border-dashed border-gray-300 text-gray-600"
                >
                  Change Avatar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resume Upload Card */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">Resume / CV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer bg-gray-50/50">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
                  <Upload size={14} />
                </div>
                <p className="text-xs font-medium text-gray-900">
                  Upload new PDF
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">Max 5MB</p>
              </div>

              {/* Current File */}
              <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded border border-blue-100 text-blue-600">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      alex_resume_v2.pdf
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Uploaded 2 days ago
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Public Profile
              </CardTitle>
              <CardDescription>
                This information will be displayed to examiners.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                  />{" "}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                  />{" "}
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <Label htmlFor="headline">Professional Headline</Label>
                <Input
                  id="headline"
                  value={profile.headline}
                  onChange={handleChange}
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  className="min-h-[100px]"
                />
                <p className="text-[11px] text-gray-400 text-right">
                  0/500 characters
                </p>
              </div>

              <Separator />

              {/* Contact Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900">
                  Contact Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Social Links */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900">
                  Social Links
                </h4>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg border border-gray-200">
                      <Github size={18} />
                    </div>
                    <Input
                      placeholder="https://github.com/username"
                      defaultValue="github.com/"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                      <Linkedin size={18} />
                    </div>
                    <Input
                      placeholder="https://linkedin.com/in/username"
                      defaultValue="linkedin.com/"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg border border-gray-200">
                      <Globe size={18} />
                    </div>
                    <Input placeholder="https://yourwebsite.com" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Exam Reminders</Label>
                  <p className="text-xs text-gray-500">
                    Receive emails about upcoming scheduled exams.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Result Release</Label>
                  <p className="text-xs text-gray-500">
                    Get notified when your exam results are published.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

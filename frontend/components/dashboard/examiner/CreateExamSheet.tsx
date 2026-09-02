"use client";

import { useState, useRef } from "react";
import { useApi } from "@/hooks/useApi";
import { X, UploadCloud, Sparkles, Lock, Globe, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface CreateExamSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateExamSheet({ isOpen, onClose }: CreateExamSheetProps) {
  const { fetchWithAuth } = useApi();

  const [examName, setExamName] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [accessType, setAccessType] = useState<"public" | "private">("public");
  const [proctoring, setProctoring] = useState(true);
  const [candidateEmails, setCandidateEmails] = useState<string[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]); // To store Gemini's output

  const [customMsg, setCustomMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState(60);

  // Mock AI Generator functions
  const handleGenerateQuestions = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (isGenerating) return; // 👈 Immediate exit if already running
    // 2. State Guard: Don't allow a second call if one is active
    if (!syllabus || isGenerating) return;

    if (!syllabus) return alert("Please enter a syllabus first!");

    setIsGenerating(true);
    try {
      const result = await fetchWithAuth("/generate-questions", {
        method: "POST",
        body: JSON.stringify({ content: syllabus, mode: "medium" }),
      });

      if (result.success) {
        setQuestions(result.data);
        alert(`Successfully generated ${result.data.length} questions!`);
      }
    } catch (err) {
      console.error(err);
      alert("AI Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoGenerateMsg = () => {
    setCustomMsg(
      "Dear Candidate,\n\nYou are invited to take the Senior Frontend Developer Assessment. This exam is AI-proctored and timed. Please ensure you have a stable internet connection.\n\nGood luck,\nTalent Acquisition Team",
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Simple logic: split by commas or newlines and clean up
      const emails = text
        .split(/[\n,]+/)
        .map((email) => email.trim())
        .filter((email) => email.includes("@"));
      setCandidateEmails(emails);
      alert(`Found ${emails.length} valid candidate emails.`);
    };
    reader.readAsText(file);
  };

  const handleCreateExam = async () => {
    if (!examName || questions.length === 0) {
      return alert("Please name the exam and generate questions first.");
    }

    setIsSaving(true);
    try {
      await fetchWithAuth("/api/examiner/create-exam", {
        method: "POST",
        body: JSON.stringify({
          title: examName,
          syllabus,
          isProctored: proctoring,
          accessType,
          questions,
          startDate, // Now sending actual date
          duration, // Now sending actual duration
          candidateEmails: accessType === "private" ? candidateEmails : [],
          customMessage: accessType === "private" ? customMsg : "",
        }),
      });
      alert("Exam Created and Saved to Database!");
      onClose();
      window.location.reload(); // Refresh to see the new exam
    } catch (err) {
      alert("Failed to save exam.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Create New Examination
            </h2>
            <p className="text-sm text-gray-500">
              Configure exam details and settings.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* 1. Basic Details */}
          <section className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="examName">Examination Name</Label>
              <Input
                id="examName"
                value={examName}
                placeholder="e.g. Senior Backend Engineer Assessment"
                className="h-11"
                onChange={(e) => setExamName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="syllabus">Syllabus / Topics</Label>
                <button
                  onClick={handleGenerateQuestions}
                  disabled={isGenerating}
                  className="text-xs flex items-center gap-1.5 text-blue-600 font-medium hover:underline"
                  type="button"
                >
                  <Sparkles size={12} />
                  {isGenerating ? "Gemini is thinking..." : "Generate via AI"}
                </button>
              </div>
              <Textarea
                id="syllabus"
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
                placeholder="Paste the job description or list of topics here..."
                className="min-h-[120px] resize-none"
              />
              {questions.length > 0 && (
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 size={12} /> {questions.length} Questions ready
                  to be saved.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (Mins)</Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                />
              </div>
            </div>
          </section>

          <div className="h-px bg-gray-100" />

          {/* 2. Proctoring Settings */}
          <section className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">AI Proctoring</Label>
                {proctoring ? (
                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase">
                    On
                  </span>
                ) : (
                  <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase">
                    Off
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Detects tab switching, multiple faces, and unauthorized objects.
              </p>
            </div>
            <Switch checked={proctoring} onCheckedChange={setProctoring} />
          </section>

          <div className="h-px bg-gray-100" />

          {/* 3. Access Type */}
          <section className="space-y-4">
            <Label>Access Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <AccessCard
                type="public"
                current={accessType}
                onClick={() => setAccessType("public")}
                icon={<Globe size={20} />}
                title="Public Link"
                desc="Anyone with the link can take the exam."
              />
              <AccessCard
                type="private"
                current={accessType}
                onClick={() => setAccessType("private")}
                icon={<Lock size={20} />}
                title="Private Invite"
                desc="Only invited candidates via email."
              />
            </div>
          </section>

          {/* 4. Conditional: Private Access Fields */}
          {accessType === "private" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* File Upload */}
              <div className="space-y-6">
                {/* File Upload UI */}
                <div className="space-y-2">
                  <Label>Candidate List ({candidateEmails.length} found)</Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                      candidateEmails.length > 0
                        ? "border-green-200 bg-green-50/30"
                        : "border-gray-200 hover:bg-gray-50",
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud
                      className="mx-auto mb-2 text-blue-600"
                      size={24}
                    />
                    <p className="text-sm font-medium">Click to upload CSV</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".csv"
                    />
                  </div>
                </div>

                {/* Custom Message UI */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Invitation Message</Label>
                    <button
                      onClick={handleAutoGenerateMsg}
                      className="text-xs text-purple-600 flex items-center gap-1"
                    >
                      <Wand2 size={12} /> Auto-write
                    </button>
                  </div>
                  <Textarea
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="bg-white">
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
            disabled={isSaving || questions.length === 0}
            onClick={handleCreateExam}
          >
            {isSaving ? "Saving..." : "Create Exam"}{" "}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper Component for the Radio Cards
function AccessCard({ type, current, onClick, icon, title, desc }: any) {
  const isSelected = current === type;
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-xl border p-4 transition-all relative",
        isSelected
          ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
      )}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 text-blue-600">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
        </div>
      )}
      <div
        className={cn("mb-3", isSelected ? "text-blue-600" : "text-gray-500")}
      >
        {icon}
      </div>
      <h3
        className={cn(
          "font-semibold text-sm mb-1",
          isSelected ? "text-blue-900" : "text-gray-900",
        )}
      >
        {title}
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

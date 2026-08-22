"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ReportType, ItemCategory, ReportAttributes } from "@/types/report";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  MapPin,
  Calendar,
  User,
  Tag,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Lock,
  ShieldCheck,
  Mail
} from "lucide-react";

const CATEGORIES: ItemCategory[] = [
  "Electronics & Laptops",
  "Student IDs & Wallets",
  "Bottles, Mugs & Drinkware",
  "Dorm & Car Keys",
  "Backpacks & Bags",
  "Calculators & Books",
  "Watches & Jewelry",
  "Jackets & Apparel",
  "Other",
];

const PRESETS = [
  {
    label: "MacBook Air (Lost)",
    type: "lost" as ReportType,
    title: "Space Gray MacBook Air M2 13-inch",
    category: "Electronics & Laptops",
    description: "Lost my Space Gray MacBook Air M2 in the campus main library 2nd floor study nook. It has an octocat GitHub sticker and an OpenAI sticker on the lid. Left around 3:30 PM.",
    location: "Main Campus Library, 2nd Floor Study Area",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    name: "Sarah Lin",
    contact: "sarah.lin@gmail.com | (555) 234-5678",
  },
  {
    label: "TI-84 Calculator (Lost)",
    type: "lost" as ReportType,
    title: "TI-84 Plus CE Graphing Calculator (Rose Gold)",
    category: "Calculators & Books",
    description: "Left my Texas Instruments TI-84 Plus CE Rose Gold graphing calculator in Science Hall Lecture Room 101 after Calculus III exam. Has a chemistry sticker on the slide cover.",
    location: "Science & Tech Hall, Lecture Room 101",
    image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80",
    name: "Maya Patel",
    contact: "mpatel@gmail.com",
  },
  {
    label: "Dorm & Car Keys (Lost)",
    type: "lost" as ReportType,
    title: "Dorm Key Set & Toyota Car Key with Stitch Plush",
    category: "Dorm & Car Keys",
    description: "North Quad dorm room key, mail key, and Toyota key fob on a split ring with a small blue Disney Stitch plush keychain. Lost near the Engineering Quad walkway.",
    location: "Engineering Quad Walkway near North Quad",
    image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
    name: "Chloe Miller",
    contact: "chloe.m@gmail.com",
  },
];

function SubmitFormContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as ReportType) || "lost";
  const { user, loginWithGoogle, loginWithCustomEmail, isAdmin } = useAuth();

  const [type, setType] = useState<ReportType>(initialType);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("Electronics & Laptops");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dateTime, setDateTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [contactName, setContactName] = useState(user?.name || "");
  const [contactInfo, setContactInfo] = useState(user?.email || "");
  const [imageUrl, setImageUrl] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleNameInput, setGoogleNameInput] = useState("");
  const [googleLoggingIn, setGoogleLoggingIn] = useState(false);
  const [googleOAuthError, setGoogleOAuthError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [extractedAttributes, setExtractedAttributes] = useState<ReportAttributes | null>(null);
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);
  const [createdReportEmail, setCreatedReportEmail] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRealGoogleOAuth = async () => {
    setGoogleLoggingIn(true);
    setGoogleOAuthError("");
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.warn("Google OAuth popup notice:", err.message);
      setGoogleOAuthError(
        err.message?.includes("provider is not enabled")
          ? "Google OAuth is not yet enabled in your Supabase project dashboard. You can enable it under Auth > Providers > Google, or sign in below with your Google email."
          : (err.message || "Failed to initialize Google Sign-In.")
      );
    } finally {
      setGoogleLoggingIn(false);
    }
  };

  const handleCustomEmailSubmit = async (overrideEmail?: string, overrideName?: string) => {
    setGoogleLoggingIn(true);
    try {
      await loginWithCustomEmail(overrideEmail || googleEmailInput, overrideName || googleNameInput);
    } finally {
      setGoogleLoggingIn(false);
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setType(preset.type);
    setTitle(preset.title);
    setCategory(preset.category);
    setDescription(preset.description);
    setLocation(preset.location);
    setImageUrl(preset.image);
    setImageBase64(null);
    setContactName(preset.name);
    setContactInfo(preset.contact);
    setExtractedAttributes(null);
    setCreatedReportId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg("You must be signed in with your Google Mail account to submit a report.");
      return;
    }

    if (!title || !description || !location || !contactName) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    setAiAnalyzing(true);
    setErrorMsg("");

    try {
      const payload = {
        type,
        title,
        description,
        category,
        image_url: imageUrl || null,
        image_base64: imageBase64 || null,
        location,
        date_time: new Date(dateTime).toISOString(),
        contact_name: contactName,
        contact_info: contactInfo || user.email,
        reporter_email: user.email,
      };

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Submission failed");
      }

      setExtractedAttributes(data.report.attributes);
      setCreatedReportId(data.report.id);
      setCreatedReportEmail(user.email);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during report submission.");
    } finally {
      setSubmitting(false);
      setAiAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Multimodal Gemini Attribute Extraction & pgvector</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Submit a Lost or Found Report
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload item photos and details. Gemini automatically extracts colors, brand, materials, and identifying marks to generate 768-d vector embeddings in Supabase.
        </p>
      </div>

      {/* Mandatory Google Authentication Gate if Not Signed In */}
      {!user ? (
        <div className="glass-panel rounded-3xl p-8 border border-indigo-500/30 bg-slate-900/90 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Google Mail Authentication Required
              </h2>
              <p className="text-xs text-slate-300">
                Please sign in with your <strong className="text-indigo-300">Google Mail</strong> account to submit and track your report.
              </p>
            </div>
          </div>

          <div className="space-y-4 max-w-md">
            {/* Primary Continue with Google Button */}
            <button
              type="button"
              onClick={handleRealGoogleOAuth}
              disabled={googleLoggingIn}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition active:scale-98"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoggingIn ? "Redirecting to Google..." : "Continue with Google (accounts.google.com)"}</span>
            </button>

            {googleOAuthError && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs">
                {googleOAuthError}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 h-[1px] bg-slate-800" />
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Or Enter Gmail</span>
              <div className="flex-1 h-[1px] bg-slate-800" />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (googleEmailInput) handleCustomEmailSubmit(googleEmailInput, googleNameInput);
              }}
              className="space-y-3"
            >
              <input
                type="email"
                value={googleEmailInput}
                onChange={(e) => setGoogleEmailInput(e.target.value)}
                placeholder="your.email@gmail.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition active:scale-98"
              >
                Sign In & Unlock Form
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          {/* User Status Banner */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-indigo-400"
                />
              ) : (
                <User className="w-6 h-6 text-indigo-400 shrink-0" />
              )}
              <div>
                <span className="font-bold text-white block">
                  Signed in as {user.name} ({user.email})
                </span>
                <span className="text-slate-400">
                  This report will be tied to your Google account. Only you (or Campus Admin) can resolve it.
                </span>
              </div>
            </div>
            {isAdmin && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shrink-0 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </span>
            )}
          </div>

          {/* Quick Presets for Demo / Testing */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Quick Test Presets:</span>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                ⚡ {preset.label}
              </button>
            ))}
          </div>

          {/* Success Modal / Banner */}
          {createdReportId && (
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-5 animate-fadeIn">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-300">
                      Report Created & Embedded in Supabase pgvector!
                    </h3>
                    <p className="text-xs text-slate-300">
                      Tied to Google Account: <strong className="text-indigo-300">{createdReportEmail}</strong>.
                    </p>
                  </div>
                </div>

                <a
                  href={`/match?reportId=${createdReportId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-blue-500 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Find AI Matches Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* AI Extracted Attributes Breakdown */}
              {extractedAttributes && (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extracted Structured Attributes (Gemini Flash)</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Brand</span>
                      <span className="font-semibold text-slate-200">{extractedAttributes.brand || "N/A"}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Primary Color</span>
                      <span className="font-semibold text-cyan-300">{extractedAttributes.primary_color || "N/A"}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Item Type</span>
                      <span className="font-semibold text-slate-200">{extractedAttributes.item_type || "N/A"}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Condition</span>
                      <span className="font-semibold text-emerald-300">{extractedAttributes.condition || "N/A"}</span>
                    </div>
                  </div>

                  {extractedAttributes.identifying_marks && extractedAttributes.identifying_marks.length > 0 && (
                    <div className="text-xs text-slate-300">
                      <span className="text-slate-400 font-medium">Distinct Marks: </span>
                      <span className="text-amber-300">{extractedAttributes.identifying_marks.join("; ")}</span>
                    </div>
                  )}

                  {extractedAttributes.enhanced_summary && (
                    <div className="text-xs text-slate-400 italic">
                      &ldquo;{extractedAttributes.enhanced_summary}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Lost vs Found Toggle */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType("lost")}
                className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition ${
                  type === "lost"
                    ? "border-rose-500 bg-rose-500/15 text-white shadow-lg shadow-rose-500/10"
                    : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="text-2xl">🔍</span>
                <span className="font-bold text-sm">I Lost an Item</span>
                <span className="text-xs opacity-75">I am looking to recover my property</span>
              </button>

              <button
                type="button"
                onClick={() => setType("found")}
                className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition ${
                  type === "found"
                    ? "border-emerald-500 bg-emerald-500/15 text-white shadow-lg shadow-emerald-500/10"
                    : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="text-2xl">🎁</span>
                <span className="font-bold text-sm">I Found an Item</span>
                <span className="text-xs opacity-75">I discovered someone else&apos;s item</span>
              </button>
            </div>

            {/* Basic Information Panel */}
            <div className="glass-panel rounded-2xl p-6 space-y-6">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" />
                <span>Item Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Title / Item Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Space Gray MacBook Air M2 13-inch"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Detailed Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe color, stickers, scratches, distinct engravings, case details, and the circumstances..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400">
                  💡 Gemini will automatically analyze this text along with the photo to extract brands, colors, materials, and distinct marks.
                </p>
              </div>
            </div>

            {/* Photo Upload Panel */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span>Photo / Image</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* File Upload Box */}
                <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-900/30">
                  <Upload className="w-8 h-8 text-slate-500 mb-2" />
                  <label className="text-xs font-semibold text-indigo-400 hover:underline cursor-pointer">
                    Upload image file
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</span>
                </div>

                {/* Direct Image URL */}
                <div className="space-y-2 flex flex-col justify-center">
                  <label className="block text-xs font-semibold text-slate-300">
                    Or paste image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImageBase64(null);
                    }}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Preview */}
              {(imageBase64 || imageUrl) && (
                <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageBase64 || imageUrl}
                    alt="Upload preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageBase64(null);
                      setImageUrl("");
                    }}
                    className="absolute top-2 right-2 px-2 py-1 rounded bg-rose-600/80 text-white text-[11px] hover:bg-rose-500"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Location & Time Panel */}
            <div className="glass-panel rounded-2xl p-6 space-y-6">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>Location & Timeline</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Location / Campus Landmark <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Main Campus Library 2nd Floor, or Student Union Lounge"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["Library 2nd Floor", "Student Union / Dining", "Science & Tech Hall", "Gym Locker Room", "North Quad Dorms"].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocation(loc)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      >
                        📍 {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Date & Time <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information & Ownership Security */}
            <div className="glass-panel rounded-2xl p-6 space-y-6">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Contact Method</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Your Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Sarah Lin"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Google Mail / Phone Contact <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="e.g. sarah.lin@gmail.com | 555-0192"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 transition transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Analyzing with Gemini & Generating 768-d Vector...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Submit Report & Run AI Vector Pipeline</span>
                </>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function SubmitReportPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading form...</div>}>
      <SubmitFormContent />
    </Suspense>
  );
}

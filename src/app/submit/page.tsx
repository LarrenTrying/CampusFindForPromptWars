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
  ShieldCheck,
  Building2,
  X,
  Phone,
  Hash
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

function SubmitFormContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as ReportType) || "lost";
  const { user, isAdmin } = useAuth();

  const [type, setType] = useState<ReportType>(initialType);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("Electronics & Laptops");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dateTime, setDateTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [contactName, setContactName] = useState(user?.name || "");
  const [contactInfo, setContactInfo] = useState("");
  const [campusIdInput, setCampusIdInput] = useState(user?.campus_id || "");
  const [imageUrl, setImageUrl] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [extractedAttributes, setExtractedAttributes] = useState<ReportAttributes | null>(null);
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);
  const [createdReportCampusId, setCreatedReportCampusId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showFoundDepositModal, setShowFoundDepositModal] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setContactName(user.name);
      if (user.campus_id) setCampusIdInput(user.campus_id);
    }
  }, [user]);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !location || !contactName) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    setAiAnalyzing(true);
    setErrorMsg("");

    const assignedCampusId = campusIdInput.trim() || user?.campus_id || "90421";

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
        contact_info: contactInfo || `Campus ID #${assignedCampusId}`,
        reporter_campus_id: assignedCampusId,
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
      setCreatedReportCampusId(assignedCampusId);

      // Reset all text boxes and input fields
      setTitle("");
      setDescription("");
      setLocation("");
      setImageUrl("");
      setImageBase64(null);
      setContactInfo("");
      setDateTime(new Date().toISOString().slice(0, 16));

      // Scroll smoothly back to the top of the page
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      // Trigger deposit popup for found item reports
      if (type === "found") {
        setShowFoundDepositModal(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during report submission.");
    } finally {
      setSubmitting(false);
      setAiAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-plum-950">
      {/* Found Item Staff Room Deposit Pop-up Modal */}
      {showFoundDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border-2 border-emerald-500 bg-[#FFE2E2] shadow-2xl p-6 sm:p-8 space-y-6 relative animate-scaleIn text-plum-950">
            <button
              onClick={() => setShowFoundDepositModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-[#FBEFEF] text-plum-700 hover:text-plum-950"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon & Title */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shadow-md">
                <Building2 className="w-8 h-8 text-emerald-700" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  Action Required: Custody Handover
                </span>
                <h2 className="text-xl font-black text-plum-950 mt-2">
                  Please Deposit Found Item
                </h2>
              </div>
            </div>

            {/* Prominent Location Box */}
            <div className="p-4 rounded-2xl bg-[#FBEFEF] border border-[#F5CBCB] text-center space-y-1.5 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-plum-700">Designated Drop-Off Location:</span>
              <div className="text-xl font-black text-emerald-700 flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>2nd Floor Staff Room</span>
              </div>
            </div>

            {/* Message Description */}
            <p className="text-xs text-plum-800 text-center leading-relaxed font-medium">
              Thank you for turning in a found item! To ensure safe custody and allow the owner to safely verify and claim their property, please deliver this item to duty staff at the <strong className="text-plum-950 font-bold">2nd Floor Staff Room</strong> as soon as possible.
            </p>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => setShowFoundDepositModal(false)}
                className="w-full py-3.5 rounded-xl text-xs font-bold bg-[#6ea17e] hover:bg-[#5e916e] text-white shadow-md border border-[#9ec0aa] transition active:scale-98 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I Understand & Will Deposit Item</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/"
                  className="py-2.5 rounded-xl text-xs font-bold text-center bg-[#FBEFEF] hover:bg-[#F5CBCB] text-plum-900 border border-[#F5CBCB] shadow-sm transition block"
                >
                  View in Main Feed
                </a>
                <a
                  href={`/match?reportId=${createdReportId}`}
                  className="py-2.5 rounded-xl text-xs font-bold text-center bg-[#C5B3D3] hover:bg-[#b8a3c8] text-plum-950 border border-[#ab92bf] shadow-sm transition block"
                >
                  Check AI Matches
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-plum-800 uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-plum-900" />
          <span>Multimodal Gemini Attribute Extraction & pgvector</span>
        </div>
        <h1 className="text-3xl font-black text-plum-950">
          Submit a Lost or Found Report
        </h1>
        <p className="text-sm text-plum-800 mt-1 font-medium">
          Upload item photos and details. Gemini automatically extracts colors, brand, materials, and identifying marks to generate 768-d vector embeddings in Supabase.
        </p>
      </div>

      {/* Optional User Status Banner if Logged In */}
      {user && (
        <div className="p-4 rounded-2xl bg-[#FFE2E2] border border-[#F5CBCB] flex items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#C5B3D3] border border-[#ab92bf] flex items-center justify-center font-mono font-bold text-plum-950 text-sm">
              #
            </div>
            <div>
              <span className="font-bold text-plum-950 block">
                Signed in as {user.name} (Campus ID #{user.campus_id})
              </span>
              <span className="text-plum-700">
                This report is automatically tied to your campus ID #{user.campus_id}.
              </span>
            </div>
          </div>
          {isAdmin && (
            <span className="px-2.5 py-1 rounded-lg bg-[#C5B3D3] text-plum-950 font-bold border border-[#ab92bf] shrink-0 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </span>
          )}
        </div>
      )}

      {/* Success Modal / Banner */}
      {createdReportId && (
        <div className="p-6 rounded-2xl bg-emerald-100 border border-emerald-300 space-y-5 animate-fadeIn shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-200 border border-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-black text-emerald-900">
                  Report Created & Embedded in Supabase pgvector!
                </h3>
                <p className="text-xs text-emerald-800 font-medium">
                  Tied to Campus ID: <strong className="font-mono">#{createdReportCampusId}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FBEFEF] hover:bg-[#F5CBCB] text-plum-900 border border-[#F5CBCB] shadow-sm transition"
              >
                <span>View in Main Feed</span>
              </a>
              <a
                href={`/match?reportId=${createdReportId}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#C5B3D3] hover:bg-[#b8a3c8] text-plum-950 border border-[#ab92bf] shadow-sm transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Find AI Matches</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* AI Extracted Attributes Breakdown */}
          {extractedAttributes && (
            <div className="p-4 rounded-xl bg-[#FBEFEF] border border-emerald-300 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-plum-900">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extracted Structured Attributes (Gemini Flash)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-[#FFE2E2] border border-[#F5CBCB]">
                  <span className="text-plum-600 block text-[10px] uppercase font-bold">Brand</span>
                  <span className="font-bold text-plum-950">{extractedAttributes.brand || "N/A"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FFE2E2] border border-[#F5CBCB]">
                  <span className="text-plum-600 block text-[10px] uppercase font-bold">Primary Color</span>
                  <span className="font-bold text-plum-950">{extractedAttributes.primary_color || "N/A"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FFE2E2] border border-[#F5CBCB]">
                  <span className="text-plum-600 block text-[10px] uppercase font-bold">Item Type</span>
                  <span className="font-bold text-plum-950">{extractedAttributes.item_type || "N/A"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FFE2E2] border border-[#F5CBCB]">
                  <span className="text-plum-600 block text-[10px] uppercase font-bold">Condition</span>
                  <span className="font-bold text-emerald-800">{extractedAttributes.condition || "N/A"}</span>
                </div>
              </div>

              {extractedAttributes.identifying_marks && extractedAttributes.identifying_marks.length > 0 && (
                <div className="text-xs text-plum-800 font-medium">
                  <span className="font-bold">Distinct Marks: </span>
                  <span>{extractedAttributes.identifying_marks.join("; ")}</span>
                </div>
              )}

              {extractedAttributes.enhanced_summary && (
                <div className="text-xs text-plum-700 italic">
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
                ? "border-rose-500 bg-rose-100 text-rose-900 shadow-md font-black"
                : "border-[#F5CBCB] bg-[#FFE2E2]/60 text-plum-800 hover:bg-[#FFE2E2]"
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
                ? "border-emerald-500 bg-emerald-100 text-emerald-900 shadow-md font-black"
                : "border-[#F5CBCB] bg-[#FFE2E2]/60 text-plum-800 hover:bg-[#FFE2E2]"
            }`}
          >
            <span className="text-2xl">🎁</span>
            <span className="font-bold text-sm">I Found an Item</span>
            <span className="text-xs opacity-75">I discovered someone else&apos;s item</span>
          </button>
        </div>

        {/* Basic Information Panel */}
        <div className="rounded-2xl p-6 space-y-6 bg-[#FFE2E2] border border-[#F5CBCB] shadow-sm">
          <h2 className="text-base font-black text-plum-950 flex items-center gap-2">
            <Tag className="w-4 h-4 text-plum-800" />
            <span>Item Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-plum-900">
                Title / Item Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Space Gray MacBook Air M2 13-inch"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-sm text-plum-950 placeholder-plum-400 focus:outline-none focus:border-[#C5B3D3] shadow-sm font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-plum-900">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-sm text-plum-950 focus:outline-none focus:border-[#C5B3D3] shadow-sm font-semibold"
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
            <label className="block text-xs font-bold text-plum-900">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe color, stickers, scratches, distinct engravings, case details, and the circumstances..."
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-sm text-plum-950 placeholder-plum-400 focus:outline-none focus:border-[#C5B3D3] shadow-sm font-medium"
            />
            <p className="text-[11px] text-plum-600 font-medium">
              💡 Gemini will automatically analyze this text along with the photo to extract brands, colors, materials, and distinct marks.
            </p>
          </div>
        </div>

        {/* Photo Upload Panel */}
        <div className="rounded-2xl p-6 space-y-4 bg-[#FFE2E2] border border-[#F5CBCB] shadow-sm">
          <h2 className="text-base font-black text-plum-950 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-plum-800" />
            <span>Photo / Image</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* File Upload Box */}
            <div className="border-2 border-dashed border-[#F5CBCB] hover:border-[#C5B3D3] rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-[#FBEFEF]">
              <Upload className="w-8 h-8 text-plum-400 mb-2" />
              <label className="text-xs font-bold text-plum-900 hover:underline cursor-pointer">
                Upload image file
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-plum-500 mt-1">PNG, JPG, WEBP up to 10MB</span>
            </div>

            {/* Direct Image URL */}
            <div className="space-y-2 flex flex-col justify-center">
              <label className="block text-xs font-bold text-plum-900">
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
                className="w-full px-4 py-2 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-xs text-plum-950 placeholder-plum-400 focus:outline-none focus:border-[#C5B3D3] shadow-sm"
              />
            </div>
          </div>

          {/* Preview */}
          {(imageBase64 || imageUrl) && (
            <div className="relative h-44 w-full rounded-xl overflow-hidden bg-[#FAF0F0] border border-[#F5CBCB]">
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
                className="absolute top-2 right-2 px-2 py-1 rounded bg-rose-500 text-white text-[11px] font-bold hover:bg-rose-600 shadow-sm"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Location & Time Panel */}
        <div className="rounded-2xl p-6 space-y-6 bg-[#FFE2E2] border border-[#F5CBCB] shadow-sm">
          <h2 className="text-base font-black text-plum-950 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-plum-800" />
            <span>Location & Timeline</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-plum-900">
                Location / Campus Landmark <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Main Campus Library 2nd Floor, or Student Union Lounge"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-sm text-plum-950 placeholder-plum-400 focus:outline-none focus:border-[#C5B3D3] shadow-sm font-semibold"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["Library 2nd Floor", "Student Union / Dining", "Science & Tech Hall", "Gym Locker Room", "North Quad Dorms"].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FBEFEF] hover:bg-[#F5CBCB] text-plum-900 border border-[#F5CBCB] transition shadow-sm"
                  >
                    📍 {loc}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-plum-900">
                Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-sm text-plum-950 focus:outline-none focus:border-[#C5B3D3] shadow-sm font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-2xl p-6 space-y-6 bg-[#FFE2E2] border border-[#F5CBCB] shadow-sm">
          <h2 className="text-base font-black text-plum-950 flex items-center gap-2">
            <User className="w-4 h-4 text-plum-800" />
            <span>Contact Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-plum-900">
                Your Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Sarah Lin"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-sm text-plum-950 placeholder-plum-400 focus:outline-none focus:border-[#C5B3D3] shadow-sm font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-plum-900 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-plum-600" />
                <span>Email or Phone Contact</span>
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="e.g. sarah.lin@campus.edu | 555-0192"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-sm text-plum-950 placeholder-plum-400 focus:outline-none focus:border-[#C5B3D3] shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-plum-900 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-plum-600" />
                <span>Campus Student ID (Optional)</span>
              </label>
              <input
                type="text"
                maxLength={5}
                value={campusIdInput}
                onChange={(e) => setCampusIdInput(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 90421"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-sm font-mono text-plum-950 placeholder-plum-400 focus:outline-none focus:border-[#C5B3D3] shadow-sm"
              />
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs flex items-center gap-2 font-bold shadow-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl text-base font-bold bg-[#C5B3D3] hover:bg-[#b8a3c8] text-plum-950 border border-[#ab92bf] shadow-md shadow-[#C5B3D3]/40 transition transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-plum-900" />
              <span>Analyzing with Gemini & Generating 768-d Vector...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-plum-900" />
              <span>Submit Report & Run AI Vector Pipeline</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function SubmitReportPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-plum-600">Loading form...</div>}>
      <SubmitFormContent />
    </Suspense>
  );
}

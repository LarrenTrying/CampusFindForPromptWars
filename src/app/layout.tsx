import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "FindGuard AI - Intelligent Lost & Found System with pgvector & Gemini",
  description: "Next-generation Lost & Found system powered by Supabase pgvector and Google Gemini Multimodal AI matching.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400">FindGuard AI</span>
              <span>•</span>
              <span>Supabase pgvector + Gemini Multimodal Engine</span>
            </div>
            <div className="text-slate-500">
              Pairing lost & found reports using 768-dimensional embeddings and forensic LLM evaluation.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

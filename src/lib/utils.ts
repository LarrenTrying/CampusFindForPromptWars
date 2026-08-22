import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function timeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function getCategoryBadge(category: string): { bg: string; text: string; border: string } {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    "Electronics & Laptops": { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    "Student IDs & Wallets": { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    "Dorm & Car Keys": { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
    "Backpacks & Bags": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
    "Calculators & Books": { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    "Watches & Jewelry": { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
    "Jackets & Apparel": { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
  };

  return map[category] || { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" };
}

export function getScoreColor(score: number): { bg: string; text: string; ring: string; label: string } {
  if (score >= 80) {
    return { bg: "bg-emerald-500", text: "text-emerald-400", ring: "ring-emerald-500/30", label: "High Match" };
  } else if (score >= 50) {
    return { bg: "bg-amber-500", text: "text-amber-400", ring: "ring-amber-500/30", label: "Possible Match" };
  } else {
    return { bg: "bg-slate-400", text: "text-slate-400", ring: "ring-slate-400/30", label: "Low Match" };
  }
}

/**
 * Computes cosine similarity between two numeric vectors
 */
export function computeCosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  const sim = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1, sim));
}

/**
 * Generates a 768-dimensional deterministic semantic-hash embedding
 */
export function generateDeterministicEmbedding(text: string, dimensions = 768): number[] {
  const normalized = (text || "").toLowerCase().trim();
  const vector = new Array(dimensions).fill(0);
  if (!normalized) return vector;

  const words = normalized.split(/\W+/).filter(Boolean);

  // 1. Word hashing & positional features
  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    let hash = 5381;
    for (let i = 0; i < word.length; i++) {
      hash = (hash * 33) ^ word.charCodeAt(i);
    }
    
    // Spread into vector
    for (let k = 0; k < 12; k++) {
      const idx = Math.abs((hash + k * 97) % dimensions);
      const sign = (hash + k) % 2 === 0 ? 1 : -1;
      const weight = 1.0 / Math.sqrt(w + 1);
      vector[idx] += sign * weight;
    }
  }

  // 2. Character n-gram hashing
  for (let i = 0; i < normalized.length - 2; i++) {
    const trigram = normalized.substring(i, i + 3);
    let hash = 0;
    for (let j = 0; j < trigram.length; j++) {
      hash = (hash << 5) - hash + trigram.charCodeAt(j);
    }
    const idx = Math.abs(hash % dimensions);
    vector[idx] += 0.4;
  }

  // 3. Normalize vector to unit length (L2 norm)
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
}

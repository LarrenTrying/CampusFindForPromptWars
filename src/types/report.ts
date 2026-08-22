export type ReportType = "lost" | "found";
export type ReportStatus = "active" | "matched" | "resolved";

export type ItemCategory =
  | "Electronics & Laptops"
  | "Student IDs & Wallets"
  | "Bottles, Mugs & Drinkware"
  | "Dorm & Car Keys"
  | "Backpacks & Bags"
  | "Calculators & Books"
  | "Watches & Jewelry"
  | "Jackets & Apparel"
  | "Other";

export interface ReportAttributes {
  category?: string;
  item_type?: string;
  brand?: string;
  model?: string;
  primary_color?: string;
  secondary_colors?: string[];
  materials?: string[];
  identifying_marks?: string[];
  condition?: "New" | "Good" | "Worn" | "Damaged" | "Unknown";
  estimated_value_range?: "Low" | "Medium" | "High";
  keyword_tags?: string[];
  enhanced_summary?: string;
}

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  category: ItemCategory | string;
  image_url?: string | null;
  location: string;
  date_time: string;
  contact_name: string;
  contact_info: string;
  status: ReportStatus;
  attributes: ReportAttributes;
  embedding?: number[] | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateReportInput {
  type: ReportType;
  title: string;
  description: string;
  category: string;
  image_url?: string | null;
  image_base64?: string | null;
  location: string;
  date_time: string;
  contact_name: string;
  contact_info: string;
  custom_attributes?: Partial<ReportAttributes>;
}

export interface GeminiMatchEvaluation {
  confidence_score: number; // 0 - 100
  confidence_level: "HIGH" | "MEDIUM" | "LOW" | "UNLIKELY";
  match_summary: string;
  matching_features: string[];
  conflicting_features: string[];
  spatial_temporal_analysis: string;
  recommended_next_step: string;
}

export interface MatchCandidate {
  report: Report;
  vector_similarity: number; // 0.0 - 1.0 from pgvector
  gemini_evaluation?: GeminiMatchEvaluation;
  final_score: number; // combined score 0 - 100
}

export interface MatchResponse {
  source_report: Report;
  target_type: ReportType;
  candidates_evaluated: number;
  matches: MatchCandidate[];
}

export interface SemanticSearchResult {
  report: Report;
  similarity: number;
  highlighted_match_reason?: string;
}

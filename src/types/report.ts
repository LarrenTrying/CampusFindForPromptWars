export type ReportType = "lost" | "found";

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
  category?: ItemCategory | string;
  item_type?: string;
  brand?: string;
  model?: string;
  primary_color?: string;
  secondary_colors?: string[];
  materials?: string[];
  identifying_marks?: string[];
  condition?: "New" | "Good" | "Worn" | "Damaged" | string;
  estimated_value_range?: "Low" | "Medium" | "High" | string;
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
  reporter_campus_id?: string; // 5-digit campus ID (e.g. 90421, Admin: 43554)
  reporter_email?: string;
  reporter_pin?: string;
  secret_pin?: string;
  status: "active" | "matched" | "resolved";
  attributes?: ReportAttributes;
  embedding?: number[] | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateReportInput {
  type: ReportType;
  title: string;
  description: string;
  category?: ItemCategory | string;
  image_url?: string | null;
  image_base64?: string | null;
  location: string;
  date_time?: string;
  contact_name: string;
  contact_info: string;
  reporter_campus_id?: string; // 5-digit ID
  reporter_email?: string;
  reporter_pin?: string;
  secret_pin?: string;
  custom_attributes?: Partial<ReportAttributes>;
}

export interface MatchScoreBreakdown {
  category_score?: number;
  color_score?: number;
  brand_score?: number;
  attributes_score?: number;
  location_proximity_score?: number;
  time_proximity_score?: number;
  vector_semantic_score?: number;
  final_confidence?: number;
  match_reasons?: string[];
  discrepancies?: string[];
  gemini_analysis?: string;
}

export interface GeminiMatchEvaluation {
  confidence_score: number;
  confidence_level?: string;
  match_verdict?: "STRONG_MATCH" | "POSSIBLE_MATCH" | "UNLIKELY_MATCH" | string;
  match_summary?: string;
  matching_features?: string[];
  conflicting_features?: string[];
  spatial_temporal_analysis?: string;
  recommended_next_step?: string;
  match_reasons?: string[];
  discrepancies?: string[];
  explanation?: string;
  verification_questions?: string[];
}

export interface MatchCandidate {
  report: Report;
  vector_similarity?: number;
  gemini_evaluation?: GeminiMatchEvaluation;
  final_score?: number;
  score?: MatchScoreBreakdown;
}

export interface MatchResponse {
  source_report: Report;
  target_type: ReportType;
  candidates_evaluated: number;
  matches: MatchCandidate[];
  message?: string;
}

export interface SemanticSearchResult {
  report: Report;
  similarity: number;
  match_highlights?: string[];
  highlighted_match_reason?: string;
}

export interface SearchFilters {
  type?: ReportType | "all";
  category?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  status?: "active" | "resolved" | "all";
  minSimilarity?: number;
}

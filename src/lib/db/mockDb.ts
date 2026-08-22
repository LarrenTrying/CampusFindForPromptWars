import { Report, ReportType, ItemCategory, CreateReportInput } from "@/types/report";
import { computeCosineSimilarity, generateDeterministicEmbedding } from "../utils";

// Clean initial state with 0 dummy reports
const INITIAL_REPORTS: Report[] = [];

// Helper to pre-embed reports
function initializeEmbeddings(reports: Report[]): Report[] {
  return reports.map((r) => {
    if (!r.embedding || r.embedding.length === 0) {
      const summaryText = `${r.title} ${r.description} ${r.category} ${r.location} ${
        r.attributes?.brand || ""
      } ${r.attributes?.primary_color || ""} ${r.attributes?.materials?.join(" ") || ""} ${
        r.attributes?.identifying_marks?.join(" ") || ""
      } ${r.attributes?.keyword_tags?.join(" ") || ""}`;
      return {
        ...r,
        embedding: generateDeterministicEmbedding(summaryText, 768),
      };
    }
    return r;
  });
}

// Global in-memory storage for reports
declare global {
  // eslint-disable-next-line no-var
  var __MOCK_REPORTS_DB: Report[] | undefined;
}

function getDatabase(): Report[] {
  if (!global.__MOCK_REPORTS_DB) {
    global.__MOCK_REPORTS_DB = [];
  }
  return global.__MOCK_REPORTS_DB;
}

export const MockDb = {
  getAllReports(filters?: {
    type?: ReportType | "all";
    category?: string;
    status?: string;
    query?: string;
  }): Report[] {
    let list = getDatabase();

    if (filters?.type && filters.type !== "all") {
      list = list.filter((r) => r.type === filters.type);
    }
    if (filters?.category && filters.category !== "All") {
      list = list.filter((r) => r.category === filters.category);
    }
    if (filters?.status && filters.status !== "all") {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          (r.reporter_campus_id && r.reporter_campus_id.toLowerCase().includes(q)) ||
          r.attributes?.brand?.toLowerCase().includes(q) ||
          r.attributes?.primary_color?.toLowerCase().includes(q)
      );
    }

    return [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getReportById(id: string): Report | null {
    const list = getDatabase();
    return list.find((r) => r.id === id) || null;
  },

  createReport(
    input: CreateReportInput,
    extractedAttributes: Report["attributes"],
    embedding: number[]
  ): Report {
    const list = getDatabase();
    const newReport: Report = {
      id: crypto.randomUUID(),
      type: input.type,
      title: input.title,
      description: input.description,
      category: input.category || extractedAttributes?.category || "Other",
      image_url: input.image_url || input.image_base64 || null,
      location: input.location,
      date_time: input.date_time || new Date().toISOString(),
      contact_name: input.contact_name,
      contact_info: input.contact_info,
      reporter_campus_id: input.reporter_campus_id || "90421",
      status: "active",
      attributes: {
        ...extractedAttributes,
        ...input.custom_attributes,
      },
      embedding: embedding || generateDeterministicEmbedding(`${input.title} ${input.description}`, 768),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    list.unshift(newReport);
    return newReport;
  },

  createReportWithId(report: Report): Report {
    const list = getDatabase();
    const existingIndex = list.findIndex((r) => r.id === report.id);
    if (existingIndex >= 0) {
      list[existingIndex] = report;
    } else {
      list.unshift(report);
    }
    return report;
  },

  updateReportStatus(id: string, status: Report["status"]): Report | null {
    const list = getDatabase();
    const item = list.find((r) => r.id === id);
    if (!item) return null;
    item.status = status;
    item.updated_at = new Date().toISOString();
    return item;
  },

  matchOppositeReports(
    queryEmbedding: number[],
    targetType: ReportType,
    threshold = 0.05,
    limit = 8
  ): { report: Report; similarity: number }[] {
    const list = getDatabase();
    const oppositeCandidates = list.filter(
      (r) => r.type === targetType && r.status === "active" && r.embedding
    );

    const scored = oppositeCandidates.map((candidate) => {
      const sim = computeCosineSimilarity(queryEmbedding, candidate.embedding!);
      return {
        report: candidate,
        similarity: sim,
      };
    });

    return scored
      .filter((item) => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  },

  searchReports(
    queryEmbedding: number[],
    filterType?: ReportType | "all",
    filterCategory?: string,
    threshold = 0.15,
    limit = 12
  ): { report: Report; similarity: number }[] {
    let list = getDatabase().filter((r) => r.embedding);

    if (filterType && filterType !== "all") {
      list = list.filter((r) => r.type === filterType);
    }
    if (filterCategory && filterCategory !== "All") {
      list = list.filter((r) => r.category === filterCategory);
    }

    const scored = list.map((item) => {
      const sim = computeCosineSimilarity(queryEmbedding, item.embedding!);
      return {
        report: item,
        similarity: sim,
      };
    });

    return scored
      .filter((item) => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  },

  clearAllReports(): void {
    global.__MOCK_REPORTS_DB = [];
  },
};

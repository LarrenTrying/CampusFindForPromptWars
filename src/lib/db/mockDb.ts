import { Report, ReportType, ItemCategory, CreateReportInput } from "@/types/report";
import { computeCosineSimilarity, generateDeterministicEmbedding } from "../utils";

// Purely Campus-Focused Lost & Found Pairs
const INITIAL_REPORTS: Report[] = [
  {
    id: "rep-101",
    type: "lost",
    title: "Space Gray MacBook Air M2 13-inch",
    description: "Lost my Space Gray MacBook Air M2 in the campus main library 2nd floor study nook. It has an octocat GitHub sticker and an OpenAI sticker on the lid. Left around 3:30 PM.",
    category: "Electronics & Laptops",
    image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    location: "Main Campus Library, 2nd Floor Study Area",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    contact_name: "Sarah Lin",
    contact_info: "sarah.lin@campus.edu | (555) 234-5678",
    status: "active",
    attributes: {
      category: "Electronics & Laptops",
      item_type: "Laptop",
      brand: "Apple",
      model: "MacBook Air M2 13-inch",
      primary_color: "Space Gray",
      secondary_colors: ["Black", "White"],
      materials: ["Aluminum", "Glass"],
      identifying_marks: ["GitHub Octocat sticker on top left", "OpenAI logo sticker near center"],
      condition: "Good",
      estimated_value_range: "High",
      keyword_tags: ["laptop", "macbook", "apple", "m2", "stickers", "library"],
      enhanced_summary: "Apple MacBook Air M2 in Space Gray with distinctive developer stickers (GitHub, OpenAI) lost in library.",
    },
    embedding: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "rep-102",
    type: "found",
    title: "Found Apple Laptop with Developer Stickers at Library Desk",
    description: "Found an Apple laptop left behind at the 2nd floor library quiet room near desk #14. Has several tech stickers on the gray cover. Turned into the front circulation desk.",
    category: "Electronics & Laptops",
    image_url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
    location: "Library Front Circulation Desk (found on 2nd Floor)",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // 22 hours ago
    contact_name: "Library Desk Staff",
    contact_info: "library-desk@campus.edu | Ext. 402",
    status: "active",
    attributes: {
      category: "Electronics & Laptops",
      item_type: "Laptop",
      brand: "Apple",
      model: "MacBook Air",
      primary_color: "Space Gray",
      secondary_colors: ["Gray", "Multi-colored stickers"],
      materials: ["Aluminum"],
      identifying_marks: ["Tech stickers including an octopus-cat creature and circular AI icon"],
      condition: "Good",
      estimated_value_range: "High",
      keyword_tags: ["apple", "macbook", "laptop", "stickers", "found", "library"],
      enhanced_summary: "Found Space Gray Apple MacBook with tech stickers at the campus library 2nd floor desk.",
    },
    embedding: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
  },
  {
    id: "rep-103",
    type: "lost",
    title: "Fossil Brown Leather Bi-fold Wallet with Student ID",
    description: "Lost my brown vintage Fossil leather wallet. Contains Campus student ID (David K., ID #9042), driver's license, and campus dining card. Red accent stitching inside seam.",
    category: "Student IDs & Wallets",
    image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    location: "Student Union Lounge & Dining Hall",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    contact_name: "David Kim",
    contact_info: "dkim99@campus.edu | (555) 789-0123",
    status: "active",
    attributes: {
      category: "Student IDs & Wallets",
      item_type: "Bi-fold Wallet",
      brand: "Fossil",
      primary_color: "Brown",
      secondary_colors: ["Red", "Tan"],
      materials: ["Genuine Leather"],
      identifying_marks: ["Red accent stitching on interior flap", "Fossil embossed logo on front right", "Student ID #9042 inside"],
      condition: "Worn",
      estimated_value_range: "Medium",
      keyword_tags: ["wallet", "leather", "fossil", "brown", "student id", "student union"],
      enhanced_summary: "Brown Fossil leather bi-fold wallet with red stitching details and student ID lost in Student Union.",
    },
    embedding: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "rep-104",
    type: "found",
    title: "Brown Leather Wallet with Student ID Card at Student Union",
    description: "Picked up a distressed brown leather wallet on the sofa near the Student Union coffee kiosk. Contains university student cards. Left with Student Services info desk.",
    category: "Student IDs & Wallets",
    image_url: "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=800&q=80",
    location: "Student Union Info Desk (found near coffee kiosk)",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    contact_name: "Student Services Desk",
    contact_info: "student-services@campus.edu | (555) 345-HELP",
    status: "active",
    attributes: {
      category: "Student IDs & Wallets",
      item_type: "Bi-fold Wallet",
      brand: "Fossil",
      primary_color: "Brown",
      secondary_colors: ["Tan"],
      materials: ["Leather"],
      identifying_marks: ["Embossed emblem on corner", "Red stitching detail on inside edge", "Campus cards present"],
      condition: "Worn",
      estimated_value_range: "Medium",
      keyword_tags: ["wallet", "leather", "brown", "student union", "found", "id cards"],
      enhanced_summary: "Brown leather wallet with embossed logo and red stitching found on student union sofa.",
    },
    embedding: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
  {
    id: "rep-105",
    type: "lost",
    title: "TI-84 Plus CE Graphing Calculator (Rose Gold)",
    description: "Left my Texas Instruments TI-84 Plus CE Rose Gold graphing calculator in Science Hall Lecture Room 101 after Calculus III exam. Has a small chemistry sticker on the slide cover.",
    category: "Calculators & Books",
    image_url: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80",
    location: "Science & Tech Hall, Lecture Room 101",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    contact_name: "Maya Patel",
    contact_info: "mpatel@campus.edu | (555) 441-2091",
    status: "active",
    attributes: {
      category: "Calculators & Books",
      item_type: "Graphing Calculator",
      brand: "Texas Instruments",
      model: "TI-84 Plus CE",
      primary_color: "Rose Gold",
      secondary_colors: ["White", "Black"],
      materials: ["Plastic", "Glass LCD"],
      identifying_marks: ["Benzene ring chemistry sticker on slide cover", "Name 'Maya P.' written on battery compartment"],
      condition: "Good",
      estimated_value_range: "Medium",
      keyword_tags: ["calculator", "ti-84", "texas instruments", "rose gold", "science hall", "math"],
      enhanced_summary: "Rose Gold TI-84 Plus CE calculator with chemistry decal lost in Science Hall room 101.",
    },
    embedding: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "rep-106",
    type: "found",
    title: "Found Rose Gold TI-84 Graphing Calculator in Science Hall",
    description: "Found a Rose Gold Texas Instruments graphing calculator under seat row 4 in Science Hall Room 101. Handed to Department TA office.",
    category: "Calculators & Books",
    image_url: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=800&q=80",
    location: "Science Hall TA Office Room 204 (Found in Room 101)",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    contact_name: "Math TA Office",
    contact_info: "math-ta@campus.edu | Office 204",
    status: "active",
    attributes: {
      category: "Calculators & Books",
      item_type: "Graphing Calculator",
      brand: "Texas Instruments",
      model: "TI-84 Plus CE",
      primary_color: "Rose Gold / Pink",
      secondary_colors: ["White"],
      materials: ["Plastic"],
      identifying_marks: ["Science molecule sticker on protective slide case"],
      condition: "Good",
      estimated_value_range: "Medium",
      keyword_tags: ["calculator", "ti-84", "texas instruments", "rose gold", "found", "science hall"],
      enhanced_summary: "Found Rose Gold TI-84 calculator with science sticker in Science Hall lecture room.",
    },
    embedding: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "rep-107",
    type: "lost",
    title: "AirPods Pro 2nd Gen with Matte Olive Case & Carabiner",
    description: "Left my Apple AirPods Pro (2nd gen) in the olive green case with a mini brass carabiner attached in the Campus Recreation Athletic Locker Room.",
    category: "Electronics & Laptops",
    image_url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    location: "Campus Recreation Center - Men's Locker Room",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    contact_name: "Alex Thorne",
    contact_info: "alex.t@campus.edu | 555-0192",
    status: "active",
    attributes: {
      category: "Electronics & Laptops",
      item_type: "Wireless Earbuds",
      brand: "Apple",
      model: "AirPods Pro 2nd Gen",
      primary_color: "Olive Green (Case)",
      secondary_colors: ["White (Buds)", "Brass (Clip)"],
      materials: ["Silicone", "Plastic", "Brass"],
      identifying_marks: ["Matte olive green protective case", "Small brass wiregate carabiner"],
      condition: "Good",
      estimated_value_range: "Medium",
      keyword_tags: ["airpods", "apple", "earbuds", "green case", "gym", "campus rec"],
      enhanced_summary: "Apple AirPods Pro with olive green silicone case and brass carabiner lost in Campus Rec locker room.",
    },
    embedding: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "rep-108",
    type: "lost",
    title: "Dorm Key Set & Toyota Car Key with Stitch Plush",
    description: "North Quad dorm room key, mail key, and Toyota key fob on a split ring with a small blue Disney Stitch plush keychain. Lost near the Engineering Quad walkway.",
    category: "Dorm & Car Keys",
    image_url: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
    location: "Engineering Quad Walkway near North Quad",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    contact_name: "Chloe Miller",
    contact_info: "chloe.m@campus.edu",
    status: "active",
    attributes: {
      category: "Dorm & Car Keys",
      item_type: "Key Fob & Dorm Keys",
      brand: "Toyota / Campus Dorm",
      primary_color: "Black",
      secondary_colors: ["Blue", "Silver"],
      materials: ["Metal", "Plastic", "Plush"],
      identifying_marks: ["Disney Stitch blue plush toy attached", "Dorm key stamped with room number #312"],
      condition: "Good",
      estimated_value_range: "Medium",
      keyword_tags: ["keys", "dorm key", "toyota", "stitch", "keychain", "engineering quad"],
      enhanced_summary: "Dorm room keys and Toyota key fob with blue Disney Stitch plush keychain lost on Engineering Quad.",
    },
    embedding: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  }
];

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

// Global in-memory storage for development / mock mode
declare global {
  // eslint-disable-next-line no-var
  var __MOCK_REPORTS_DB: Report[] | undefined;
}

function getDatabase(): Report[] {
  if (!global.__MOCK_REPORTS_DB) {
    global.__MOCK_REPORTS_DB = initializeEmbeddings([...INITIAL_REPORTS]);
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
      id: "rep-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      type: input.type,
      title: input.title,
      description: input.description,
      category: input.category || extractedAttributes.category || "Other",
      image_url: input.image_url || input.image_base64 || null,
      location: input.location,
      date_time: input.date_time || new Date().toISOString(),
      contact_name: input.contact_name,
      contact_info: input.contact_info,
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

  resetToSeedData(): Report[] {
    global.__MOCK_REPORTS_DB = initializeEmbeddings([...INITIAL_REPORTS]);
    return global.__MOCK_REPORTS_DB;
  },
};

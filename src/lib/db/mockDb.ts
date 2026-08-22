import { Report, ReportType, ItemCategory, CreateReportInput } from "@/types/report";
import { computeCosineSimilarity, generateDeterministicEmbedding } from "../utils";

// Initial realistic dataset with complementary Lost & Found pairs
const INITIAL_REPORTS: Report[] = [
  {
    id: "rep-101",
    type: "lost",
    title: "Space Gray MacBook Air M2 13-inch",
    description: "Lost my Space Gray MacBook Air M2 in the campus main library 2nd floor study nook. It has an octocat GitHub sticker and an OpenAI sticker on the lid. Left around 3:30 PM.",
    category: "Electronics",
    image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    location: "Main Campus Library, 2nd Floor Study Area",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    contact_name: "Sarah Lin",
    contact_info: "sarah.lin@example.com | (555) 234-5678",
    status: "active",
    attributes: {
      category: "Electronics",
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
    embedding: null, // Will be computed
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "rep-102",
    type: "found",
    title: "Found Apple Laptop with Developer Stickers at Library Desk",
    description: "Found an Apple laptop left behind at the 2nd floor library quiet room near desk #14. Has several tech stickers on the gray cover. Turned into the front circulation desk.",
    category: "Electronics",
    image_url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
    location: "Library Front Circulation Desk (found on 2nd Floor)",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // 22 hours ago
    contact_name: "Front Desk Staff",
    contact_info: "library-desk@campus.edu | Desk Ext. 402",
    status: "active",
    attributes: {
      category: "Electronics",
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
    title: "Fossil Brown Leather Bi-fold Wallet",
    description: "Lost my brown vintage Fossil leather wallet. Contains California driver's license (David K.), student ID, and blue metro card. Red accent stitching inside seam.",
    category: "Wallets & Cards",
    image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    location: "Downtown Metro Station / Line 4 Train",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    contact_name: "David Kim",
    contact_info: "dkim99@example.com | (555) 789-0123",
    status: "active",
    attributes: {
      category: "Wallets & Cards",
      item_type: "Bi-fold Wallet",
      brand: "Fossil",
      primary_color: "Brown",
      secondary_colors: ["Red", "Tan"],
      materials: ["Genuine Leather"],
      identifying_marks: ["Red accent stitching on interior flap", "Fossil embossed logo on front right"],
      condition: "Worn",
      estimated_value_range: "Medium",
      keyword_tags: ["wallet", "leather", "fossil", "brown", "ids", "metro"],
      enhanced_summary: "Brown Fossil leather bi-fold wallet with red stitching details and IDs lost near metro station.",
    },
    embedding: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "rep-104",
    type: "found",
    title: "Brown Leather Wallet with IDs found on Metro Bench",
    description: "Picked up a distressed brown leather wallet on the downtown platform bench. Has cards and a student ID inside. Kept safe with station attendant.",
    category: "Wallets & Cards",
    image_url: "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=800&q=80",
    location: "Downtown Metro Station Platform B",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    contact_name: "Metro Station Master",
    contact_info: "metro-lostfound@transit.org | 555-TRANSIT",
    status: "active",
    attributes: {
      category: "Wallets & Cards",
      item_type: "Bi-fold Wallet",
      brand: "Fossil",
      primary_color: "Brown",
      secondary_colors: ["Tan"],
      materials: ["Leather"],
      identifying_marks: ["Embossed emblem on corner", "Red stitching detail on inside edge"],
      condition: "Worn",
      estimated_value_range: "Medium",
      keyword_tags: ["wallet", "leather", "brown", "metro", "found", "ids"],
      enhanced_summary: "Brown leather wallet with embossed logo and red stitching found on transit station platform.",
    },
    embedding: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
  {
    id: "rep-105",
    type: "lost",
    title: "Lost Golden Retriever - 'Cooper' with Blue Collar",
    description: "Friendly 3-year-old male Golden Retriever went missing from Riverside Dog Park. Wearing a teal-blue reflective collar with silver bone tag. Very friendly, responds to treats.",
    category: "Pets & Animals",
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    location: "Riverside Dog Park / East River Trail",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    contact_name: "Emily & Mark",
    contact_info: "555-DOG-HOME | emily.findcooper@gmail.com",
    status: "active",
    attributes: {
      category: "Pets & Animals",
      item_type: "Dog",
      brand: "Golden Retriever",
      primary_color: "Golden / Honey",
      secondary_colors: ["Teal Blue (Collar)", "Silver (Tag)"],
      materials: ["Fur", "Nylon collar"],
      identifying_marks: ["Teal blue reflective collar", "Silver bone tag labeled Cooper", "Small scar over right paw"],
      condition: "Good",
      estimated_value_range: "High",
      keyword_tags: ["dog", "golden retriever", "cooper", "pet", "blue collar", "park"],
      enhanced_summary: "Golden Retriever named Cooper with teal blue collar and silver tag missing from Riverside Park.",
    },
    embedding: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "rep-106",
    type: "found",
    title: "Found Golden Dog with Blue Collar roaming near East River Trail",
    description: "Found a very sweet Golden Retriever near the East River bike path. Had a blue/cyan nylon collar. Brought to North City Animal Shelter for temporary holding.",
    category: "Pets & Animals",
    image_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
    location: "North City Animal Shelter (Found East River Trail)",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    contact_name: "North Shelter Intake",
    contact_info: "intake@northcityshelter.org | (555) 998-PETS",
    status: "active",
    attributes: {
      category: "Pets & Animals",
      item_type: "Dog",
      brand: "Golden Retriever",
      primary_color: "Golden / Yellow",
      secondary_colors: ["Cyan Blue"],
      materials: ["Fur", "Reflective collar"],
      identifying_marks: ["Cyan reflective collar with bone charm"],
      condition: "Good",
      estimated_value_range: "High",
      keyword_tags: ["dog", "golden retriever", "blue collar", "found", "trail", "shelter"],
      enhanced_summary: "Friendly Golden Retriever with cyan reflective collar found near East River Trail and held at shelter.",
    },
    embedding: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "rep-107",
    type: "lost",
    title: "AirPods Pro 2nd Gen with Matte Green Silicone Case",
    description: "Left my Apple AirPods Pro (2nd gen) in the olive green case with a mini brass carabiner attached in the gym locker room.",
    category: "Electronics",
    image_url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    location: "FitZone Gym - 3rd Floor Locker Room",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    contact_name: "Alex Thorne",
    contact_info: "alex.t@example.com | 555-0192",
    status: "active",
    attributes: {
      category: "Electronics",
      item_type: "Wireless Earbuds",
      brand: "Apple",
      model: "AirPods Pro 2nd Gen",
      primary_color: "Olive Green (Case)",
      secondary_colors: ["White (Buds)", "Brass (Clip)"],
      materials: ["Silicone", "Plastic", "Brass"],
      identifying_marks: ["Matte olive green protective case", "Small brass wiregate carabiner"],
      condition: "Good",
      estimated_value_range: "Medium",
      keyword_tags: ["airpods", "apple", "earbuds", "green case", "gym"],
      enhanced_summary: "Apple AirPods Pro with olive green silicone case and brass carabiner lost in gym locker room.",
    },
    embedding: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "rep-108",
    type: "lost",
    title: "Toyota Car Key & House Keys with Stitch Keychain",
    description: "Car key fob for Toyota RAV4 along with 3 house keys and a blue Disney Stitch plush keychain. Lost somewhere along Oak Avenue.",
    category: "Keys",
    image_url: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
    location: "Oak Avenue sidewalk between 5th & 7th St",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    contact_name: "Chloe M.",
    contact_info: "chloek@example.com",
    status: "active",
    attributes: {
      category: "Keys",
      item_type: "Key Fob & Keyring",
      brand: "Toyota",
      primary_color: "Black",
      secondary_colors: ["Blue", "Silver"],
      materials: ["Metal", "Plastic", "Plush"],
      identifying_marks: ["Disney Stitch blue plush toy attached", "3 silver house keys on split ring"],
      condition: "Good",
      estimated_value_range: "Medium",
      keyword_tags: ["keys", "toyota", "stitch", "keychain", "car key"],
      enhanced_summary: "Toyota key fob and house keys with blue Disney Stitch plush keychain lost on Oak Avenue.",
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

  /**
   * Cosine Nearest-Neighbor Search for Opposite Type Reports (lost <-> found)
   */
  matchOppositeReports(
    queryEmbedding: number[],
    targetType: ReportType,
    threshold = 0.2,
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

  /**
   * General Semantic Search
   */
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

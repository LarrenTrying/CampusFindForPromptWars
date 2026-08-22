import { getGeminiAI } from "./client";
import { ReportAttributes } from "@/types/report";

export async function extractAttributesFromInput(params: {
  title: string;
  description: string;
  category?: string;
  location?: string;
  imageBase64?: string | null;
}): Promise<ReportAttributes> {
  const genAI = getGeminiAI();

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const promptText = `
You are an expert campus lost-and-found investigator and forensic multimodal analyzer.
Analyze the following lost/found item report details and any attached image:

TITLE: ${params.title}
DESCRIPTION: ${params.description}
CATEGORY HINT: ${params.category || "Unknown"}
LOCATION: ${params.location || "Unknown"}

IMPORTANT EXTRACTION RULES:
- ONLY extract materials that are explicitly mentioned in the description or clearly evident in the photo.
- NEVER assume or hallucinate 'Glass' for water bottles, tumblers, or flasks unless the user specifically wrote 'glass'. If material is unmentioned, use ['Stainless Steel / Aluminum / Plastic (Unspecified)'].
- Identify item category: "Electronics & Laptops" | "Student IDs & Wallets" | "Bottles, Mugs & Drinkware" | "Dorm & Car Keys" | "Backpacks & Bags" | "Calculators & Books" | "Watches & Jewelry" | "Jackets & Apparel" | "Other"

Extract precise structured attributes in valid JSON conforming to this schema:
{
  "category": string,
  "item_type": string (e.g., "Water Bottle", "Laptop", "Bi-fold Wallet", "Graphing Calculator", "Car Key Fob", "Backpack"),
  "brand": string or null (e.g., "Hydro Flask", "Stanley", "Yeti", "Owala", "Apple", "Texas Instruments", "Fossil", "Toyota"),
  "model": string or null (e.g., "32oz Wide Mouth", "MacBook Air M2", "TI-84 Plus CE"),
  "primary_color": string (e.g., "Blue", "Space Gray", "Brown", "Rose Gold", "Black", "Green"),
  "secondary_colors": string[] (e.g., ["White", "Silver", "Black"]),
  "materials": string[] (e.g., ["Stainless Steel", "Aluminum", "Plastic", "Leather", "Metal"]),
  "identifying_marks": string[] (specific distinct marks, stickers, engraving, scratches, boot colors, straw lid, carabiners),
  "condition": "New" | "Good" | "Worn" | "Damaged" | "Unknown",
  "estimated_value_range": "Low" | "Medium" | "High",
  "keyword_tags": string[] (5-10 specific search keywords),
  "enhanced_summary": string (A concise 1-2 sentence forensic description capturing the item's key identifiable traits)
}
`;

      const contents: (string | { inlineData: { data: string; mimeType: string } })[] = [promptText];

      if (params.imageBase64 && params.imageBase64.includes(",")) {
        const parts = params.imageBase64.split(",");
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const base64Data = parts[1];

        contents.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        });
      }

      const response = await model.generateContent(contents);
      const text = response.response.text();
      const parsed = JSON.parse(text) as ReportAttributes;
      return parsed;
    } catch (error) {
      console.warn("Gemini attribute extraction failed or model error, using heuristic fallback:", error);
    }
  }

  // Heuristic rule-based extractor fallback
  return fallbackAttributeExtractor(params);
}

function fallbackAttributeExtractor(params: {
  title: string;
  description: string;
  category?: string;
  location?: string;
}): ReportAttributes {
  const combined = `${params.title} ${params.description}`.toLowerCase();

  // 1. Detect Category & Item Type
  let category = params.category || "Other";
  let itemType = "Item";

  if (/bottle|flask|hydro flask|stanley|yeti|tumbler|mug|thermos|cup|nalgene|owala|canteen|s'well|contigo|drinkware/.test(combined)) {
    category = "Bottles, Mugs & Drinkware";
    if (/hydro flask/.test(combined)) itemType = "Hydro Flask Bottle";
    else if (/stanley/.test(combined)) itemType = "Stanley Tumbler";
    else if (/yeti/.test(combined)) itemType = "Yeti Tumbler / Bottle";
    else if (/owala/.test(combined)) itemType = "Owala FreeSip Bottle";
    else if (/mug|cup/.test(combined)) itemType = "Travel Mug / Cup";
    else itemType = "Water Bottle";
  } else if (/macbook|laptop|dell|thinkpad|computer|ipad|tablet|iphone|android|phone|airpods|headphone|earbuds|camera|watch|apple watch/.test(combined)) {
    category = "Electronics & Laptops";
    if (/macbook|laptop|dell|thinkpad/.test(combined)) itemType = "Laptop";
    else if (/airpods|earbuds|headphone/.test(combined)) itemType = "Wireless Earbuds";
    else if (/iphone|phone|pixel|samsung/.test(combined)) itemType = "Smartphone";
    else itemType = "Electronic Device";
  } else if (/calculator|ti-84|ti-83|casio|textbook|notebook|binder|book/.test(combined)) {
    category = "Calculators & Books";
    if (/calculator|ti-84|ti-83|casio/.test(combined)) itemType = "Graphing Calculator";
    else itemType = "Textbook / Notebook";
  } else if (/wallet|purse|cardholder|driver license|credit card|id card|student id|dining card/.test(combined)) {
    category = "Student IDs & Wallets";
    itemType = "Wallet / Student ID Card";
  } else if (/key|keychain|fob|car key|house key|dorm key/.test(combined)) {
    category = "Dorm & Car Keys";
    itemType = "Dorm & Car Keys";
  } else if (/backpack|bag|tote|duffel|purse|luggage|suitcase/.test(combined)) {
    category = "Backpacks & Bags";
    itemType = "Backpack / Bag";
  } else if (/ring|necklace|bracelet|watch|earring|gold|silver|diamond/.test(combined)) {
    category = "Watches & Jewelry";
    itemType = "Jewelry / Watch";
  } else if (/jacket|hoodie|sweater|coat|shirt|hat|cap/.test(combined)) {
    category = "Jackets & Apparel";
    itemType = "Jacket / Apparel";
  }

  // 2. Detect Brand
  let brand: string | undefined = undefined;
  const brandKeywords = [
    "hydro flask", "stanley", "yeti", "owala", "nalgene", "camelbak", "s'well", "contigo",
    "apple", "samsung", "fossil", "sony", "nike", "adidas", "toyota", "honda", "ford", 
    "bose", "dell", "lenovo", "hp", "texas instruments", "casio", "patagonia", "north face", "anker"
  ];
  for (const b of brandKeywords) {
    if (combined.includes(b)) {
      brand = b.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  // 3. Detect Colors
  const colors = ["blue", "sky blue", "navy", "dark blue", "light blue", "black", "space gray", "silver", "white", "brown", "tan", "red", "teal", "green", "olive", "rose gold", "pink", "purple", "yellow", "orange"];
  let primaryColor = "Unknown";
  const secondaryColors: string[] = [];

  for (const c of colors) {
    if (combined.includes(c)) {
      if (primaryColor === "Unknown") {
        primaryColor = c.charAt(0).toUpperCase() + c.slice(1);
      } else if (!secondaryColors.includes(c)) {
        secondaryColors.push(c.charAt(0).toUpperCase() + c.slice(1));
      }
    }
  }
  if (primaryColor === "Unknown") primaryColor = "Standard";

  // 4. Distinct Marks
  const marks: string[] = [];
  if (/sticker|decal|logo|graphic/.test(combined)) marks.push("Has stickers / decals");
  if (/scratch|dent|scuff|engrav/.test(combined)) marks.push("Has physical marks / scratches");
  if (/boot|silicone boot|handle|strap|carabiner|keychain|charm/.test(combined)) marks.push("Has attached accessory or silicone boot");
  if (/straw|straw lid|chug cap|wide mouth/.test(combined)) marks.push("Specific lid/cap style");

  // 5. Materials (Never default to Glass for bottles unless explicitly stated)
  const materials: string[] = [];
  if (/glass/.test(combined)) materials.push("Glass");
  if (/stainless steel|metal|aluminum|steel/.test(combined)) materials.push("Stainless Steel / Metal");
  if (/leather/.test(combined)) materials.push("Leather");
  if (/silicone|rubber|plastic/.test(combined)) materials.push("Plastic / Silicone");
  if (/fabric|canvas|nylon/.test(combined)) materials.push("Fabric / Nylon");

  if (materials.length === 0) {
    if (category === "Bottles, Mugs & Drinkware") {
      materials.push("Stainless Steel / Metal / Plastic (Standard)");
    } else {
      materials.push("Standard Material");
    }
  }

  // 6. Tags
  const words = combined.split(/\W+/).filter(w => w.length > 2);
  const keywordTags = Array.from(new Set([...words.slice(0, 6), itemType.toLowerCase(), primaryColor.toLowerCase()]));

  return {
    category,
    item_type: itemType,
    brand,
    primary_color: primaryColor,
    secondary_colors: secondaryColors.length > 0 ? secondaryColors : undefined,
    materials: materials,
    identifying_marks: marks.length > 0 ? marks : ["Standard appearance"],
    condition: "Good",
    estimated_value_range: category === "Electronics & Laptops" || category === "Watches & Jewelry" ? "High" : "Medium",
    keyword_tags: keywordTags,
    enhanced_summary: `${primaryColor} ${brand ? brand + " " : ""}${itemType} reported at ${params.location || "campus area"}.`,
  };
}

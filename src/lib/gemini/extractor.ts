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
      // Try gemini-2.5-flash or gemini-1.5-flash
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const promptText = `
You are an expert lost-and-found investigator and forensic multimodal analyzer.
Analyze the following lost/found item report details and any attached image:

TITLE: ${params.title}
DESCRIPTION: ${params.description}
CATEGORY HINT: ${params.category || "Unknown"}
LOCATION: ${params.location || "Unknown"}

Extract precise structured attributes in valid JSON conforming to this schema:
{
  "category": "Electronics" | "Wallets & Cards" | "Keys" | "Bags & Backpacks" | "Pets & Animals" | "Jewelry & Watches" | "Clothing & Accessories" | "Documents & IDs" | "Other",
  "item_type": string (e.g., "Laptop", "Bi-fold Wallet", "Dog", "Car Key Fob", "Backpack"),
  "brand": string or null (e.g., "Apple", "Fossil", "Toyota", "Nike"),
  "model": string or null (e.g., "MacBook Air M2 13-inch", "AirPods Pro", "RAV4"),
  "primary_color": string (e.g., "Space Gray", "Brown", "Golden / Yellow", "Black"),
  "secondary_colors": string[] (e.g., ["Red", "White", "Silver"]),
  "materials": string[] (e.g., ["Aluminum", "Leather", "Silicone", "Fur", "Metal"]),
  "identifying_marks": string[] (specific distinct marks, stickers, engraving, scratches, accessories, collar tags, embroidery),
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

  if (/macbook|laptop|dell|thinkpad|computer|ipad|tablet|iphone|android|phone|airpods|headphone|earbuds|camera|watch|apple watch/.test(combined)) {
    category = "Electronics";
    if (/macbook|laptop|dell|thinkpad/.test(combined)) itemType = "Laptop";
    else if (/airpods|earbuds|headphone/.test(combined)) itemType = "Wireless Earbuds";
    else if (/iphone|phone|pixel|samsung/.test(combined)) itemType = "Smartphone";
    else itemType = "Electronic Device";
  } else if (/wallet|purse|cardholder|driver license|credit card|id card|metro card/.test(combined)) {
    category = "Wallets & Cards";
    itemType = "Wallet / Cardholder";
  } else if (/key|keychain|fob|car key|house key/.test(combined)) {
    category = "Keys";
    itemType = "Keys & Keychain";
  } else if (/dog|cat|puppy|kitten|retriever|husky|poodle|pet|bird/.test(combined)) {
    category = "Pets & Animals";
    if (/dog|puppy|retriever/.test(combined)) itemType = "Dog";
    else if (/cat|kitten/.test(combined)) itemType = "Cat";
    else itemType = "Pet";
  } else if (/backpack|bag|tote|duffel|purse|luggage|suitcase/.test(combined)) {
    category = "Bags & Backpacks";
    itemType = "Backpack / Bag";
  } else if (/ring|necklace|bracelet|watch|earring|gold|silver|diamond/.test(combined)) {
    category = "Jewelry & Watches";
    itemType = "Jewelry / Watch";
  }

  // 2. Detect Brand
  let brand: string | undefined = undefined;
  const brandKeywords = [
    "apple", "samsung", "fossil", "sony", "nike", "adidas", "toyota", "honda", "ford", 
    "bose", "dell", "lenovo", "hp", "gucci", "coach", "patagonia", "north face", "anker"
  ];
  for (const b of brandKeywords) {
    if (combined.includes(b)) {
      brand = b.charAt(0).toUpperCase() + b.slice(1);
      break;
    }
  }

  // 3. Detect Colors
  const colors = ["black", "space gray", "silver", "white", "brown", "tan", "red", "blue", "teal", "green", "olive", "gold", "pink", "purple", "yellow", "orange"];
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
  if (primaryColor === "Unknown") primaryColor = "Standard / Natural";

  // 4. Distinct Marks
  const marks: string[] = [];
  if (/sticker|octocat|openai|logo|decal/.test(combined)) marks.push("Contains stickers or custom decals");
  if (/scratch|dent|crack|engrav|monogram/.test(combined)) marks.push("Has physical marks or engravings");
  if (/collar|tag|carabiner|keychain|charm/.test(combined)) marks.push("Includes attached tag, charm, or accessory");

  // 5. Materials
  const materials: string[] = [];
  if (/leather/.test(combined)) materials.push("Leather");
  if (/aluminum|metal|steel/.test(combined)) materials.push("Metal / Aluminum");
  if (/silicone|rubber|plastic/.test(combined)) materials.push("Silicone / Plastic");
  if (/fur|nylon|fabric|canvas/.test(combined)) materials.push("Fabric / Fur");

  // 6. Tags
  const words = combined.split(/\W+/).filter(w => w.length > 3);
  const keywordTags = Array.from(new Set([...words.slice(0, 6), itemType.toLowerCase(), primaryColor.toLowerCase()]));

  return {
    category,
    item_type: itemType,
    brand,
    primary_color: primaryColor,
    secondary_colors: secondaryColors.length > 0 ? secondaryColors : undefined,
    materials: materials.length > 0 ? materials : ["Standard Material"],
    identifying_marks: marks.length > 0 ? marks : ["Standard appearance"],
    condition: "Good",
    estimated_value_range: category === "Electronics" || category === "Jewelry & Watches" ? "High" : "Medium",
    keyword_tags: keywordTags,
    enhanced_summary: `${primaryColor} ${brand ? brand + " " : ""}${itemType} with distinct features reported at ${params.location || "campus/city area"}.`,
  };
}

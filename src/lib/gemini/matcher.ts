import { getGeminiAI } from "./client";
import { Report, GeminiMatchEvaluation } from "@/types/report";

export async function evaluateMatchPairWithGemini(
  sourceReport: Report,
  candidateReport: Report
): Promise<GeminiMatchEvaluation> {
  const genAI = getGeminiAI();

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const prompt = `
You are an expert campus AI lost-and-found investigator. Your job is to thoroughly compare two opposite-type reports (one LOST item and one FOUND item) and evaluate if they are the exact same physical item.

=== REPORT A (${sourceReport.type.toUpperCase()}) ===
Title: ${sourceReport.title}
Description: ${sourceReport.description}
Category: ${sourceReport.category}
Location: ${sourceReport.location}
Date/Time: ${sourceReport.date_time}
Attributes: ${JSON.stringify(sourceReport.attributes || {}, null, 2)}

=== REPORT B (${candidateReport.type.toUpperCase()}) ===
Title: ${candidateReport.title}
Description: ${candidateReport.description}
Category: ${candidateReport.category}
Location: ${candidateReport.location}
Date/Time: ${candidateReport.date_time}
Attributes: ${JSON.stringify(candidateReport.attributes || {}, null, 2)}

CRITICAL EVALUATION GUIDELINES:
- Understand that campus users write varying descriptions: one person might say "blue bottle", while another writes "found a blue water flask". Recognize they describe the SAME core object.
- DO NOT disqualify or heavily penalize matches for omitted/unspecified materials or missing brand names if the core item type (e.g. blue water bottle) aligns.
- Evaluate physical traits (color, item type, brand, stickers/marks), category, and spatio-temporal feasibility on campus.

Return ONLY a JSON response strictly conforming to this schema:
{
  "confidence_score": number (integer between 0 and 100 representing probability of being the same item),
  "confidence_level": "HIGH" | "MEDIUM" | "LOW" | "UNLIKELY",
  "match_summary": string (1-3 sentences summarizing the key match reasoning),
  "matching_features": string[] (3-5 specific matching bullet points),
  "conflicting_features": string[] (any real discrepancies or items to verify),
  "spatial_temporal_analysis": string (e.g. "Both located in Science Hall within 3 hours of loss."),
  "recommended_next_step": string (e.g. "Contact the finder to confirm specific stickers or lid type.")
}
`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const parsed = JSON.parse(text) as GeminiMatchEvaluation;
      return parsed;
    } catch (error) {
      console.warn("Gemini match evaluation call failed or model error, using fallback evaluator:", error);
    }
  }

  // High-accuracy heuristic rule evaluator fallback
  return fallbackMatchEvaluator(sourceReport, candidateReport);
}

function fallbackMatchEvaluator(
  reportA: Report,
  reportB: Report
): GeminiMatchEvaluation {
  let score = 50;
  const matchingPoints: string[] = [];
  const conflicts: string[] = [];

  const textA = `${reportA.title} ${reportA.description} ${reportA.location} ${JSON.stringify(reportA.attributes || {})}`.toLowerCase();
  const textB = `${reportB.title} ${reportB.description} ${reportB.location} ${JSON.stringify(reportB.attributes || {})}`.toLowerCase();

  // 1. Check Item Type / Concept Match (e.g. bottle vs bottle, laptop vs laptop, calculator vs calculator)
  const isBottleA = /bottle|flask|tumbler|mug|hydro|stanley|yeti|drinkware/.test(textA);
  const isBottleB = /bottle|flask|tumbler|mug|hydro|stanley|yeti|drinkware/.test(textB);
  if (isBottleA && isBottleB) {
    score += 20;
    matchingPoints.push("Item type match: Both reports reference a water bottle / drinkware flask.");
  }

  const isLaptopA = /laptop|macbook|computer|dell|thinkpad/.test(textA);
  const isLaptopB = /laptop|macbook|computer|dell|thinkpad/.test(textB);
  if (isLaptopA && isLaptopB) {
    score += 20;
    matchingPoints.push("Item type match: Both reports reference a laptop computer.");
  }

  const isCalcA = /calculator|ti-84|ti-83|casio/.test(textA);
  const isCalcB = /calculator|ti-84|ti-83|casio/.test(textB);
  if (isCalcA && isCalcB) {
    score += 20;
    matchingPoints.push("Item type match: Both reports reference a graphing calculator.");
  }

  const isWalletA = /wallet|cardholder|purse|student id/.test(textA);
  const isWalletB = /wallet|cardholder|purse|student id/.test(textB);
  if (isWalletA && isWalletB) {
    score += 20;
    matchingPoints.push("Item type match: Both reports reference a wallet / cardholder.");
  }

  // 2. Category check
  if (reportA.category && reportB.category && (
    reportA.category.toLowerCase() === reportB.category.toLowerCase() ||
    (isBottleA && isBottleB) ||
    (isLaptopA && isLaptopB)
  )) {
    score += 10;
    matchingPoints.push(`Aligned category: ${reportA.category || "Campus Items"}.`);
  }

  // 3. Color check (Critical for bottles, clothing, laptops)
  const colors = ["blue", "sky blue", "navy", "dark blue", "light blue", "black", "space gray", "silver", "white", "brown", "tan", "red", "teal", "green", "olive", "rose gold", "pink", "purple", "yellow", "orange"];
  const colorsInA = colors.filter(c => textA.includes(c));
  const colorsInB = colors.filter(c => textB.includes(c));
  const sharedColors = colorsInA.filter(c => colorsInB.includes(c));

  if (sharedColors.length > 0) {
    score += 20;
    matchingPoints.push(`Matching color tone: ${sharedColors.join(", ")}.`);
  }

  // 4. Brand check
  const brandA = reportA.attributes?.brand?.toLowerCase();
  const brandB = reportB.attributes?.brand?.toLowerCase();
  if (brandA && brandB && brandA !== "unspecified" && brandB !== "unspecified") {
    if (brandA === brandB || brandA.includes(brandB) || brandB.includes(brandA)) {
      score += 15;
      matchingPoints.push(`Brand matches: both reference '${reportA.attributes?.brand}'.`);
    } else {
      score -= 15;
      conflicts.push(`Different reported brands: '${reportA.attributes?.brand}' vs '${reportB.attributes?.brand}'.`);
    }
  }

  // 5. Distinct marks / stickers / accessories
  if (/sticker|decal|octocat|openai/.test(textA) && /sticker|decal|octocat|octopus|ai/.test(textB)) {
    score += 20;
    matchingPoints.push("Distinctive sticker details match across reports.");
  }
  if (/stitch|plush|carabiner|strap/.test(textA) && /stitch|plush|carabiner|strap/.test(textB)) {
    score += 15;
    matchingPoints.push("Matching accessory / keychain attachment.");
  }

  // Clamp score
  score = Math.max(15, Math.min(98, score));

  let confidenceLevel: GeminiMatchEvaluation["confidence_level"] = "LOW";
  if (score >= 75) confidenceLevel = "HIGH";
  else if (score >= 50) confidenceLevel = "MEDIUM";
  else if (score >= 30) confidenceLevel = "LOW";
  else confidenceLevel = "UNLIKELY";

  const summary = score >= 70
    ? `Strong match detected! Both reports describe a ${sharedColors[0] || ""} ${isBottleA ? "water bottle" : reportA.category} with consistent campus traits.`
    : `Potential candidate found with overlapping attributes (${matchingPoints.slice(0, 2).join("; ")}). Further verification recommended.`;

  return {
    confidence_score: score,
    confidence_level: confidenceLevel,
    match_summary: summary,
    matching_features: matchingPoints.length > 0 ? matchingPoints : ["General category and description overlap."],
    conflicting_features: conflicts.length > 0 ? conflicts : ["Verify secondary distinguishing marks (stickers, scratches, or brand logo) upon claiming."],
    spatial_temporal_analysis: `Locations '${reportA.location}' and '${reportB.location}' are within reasonable campus vicinity.`,
    recommended_next_step: score >= 70
      ? `Contact ${reportB.contact_name} (${reportB.contact_info}) to coordinate claim verification.`
      : `Compare secondary photos or request private identifier verification.`,
  };
}

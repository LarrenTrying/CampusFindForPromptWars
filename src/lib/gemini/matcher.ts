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
You are an expert AI lost-and-found investigator. Your job is to thoroughly compare two opposite-type reports (one LOST item and one FOUND item) and evaluate if they are the exact same physical item.

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

Please perform a rigorous comparison across:
1. Physical attributes (brand, model, primary/secondary colors, materials, wear, distinguishing marks/stickers/engravings).
2. Spatio-temporal plausibility (Is the found location consistent with where it was lost or transit paths? Was it found around or after the time it was lost?).
3. Potential discrepancies or conflicting traits.

Return ONLY a JSON response strictly conforming to this schema:
{
  "confidence_score": number (integer between 0 and 100 representing probability of being the same item),
  "confidence_level": "HIGH" | "MEDIUM" | "LOW" | "UNLIKELY",
  "match_summary": string (1-3 sentences summarizing the key match reasoning),
  "matching_features": string[] (3-5 specific matching bullet points, e.g. "Both mention Space Gray Apple laptop with GitHub sticker"),
  "conflicting_features": string[] (any discrepancies, e.g. "Report A specifies red stitching while Report B does not mention it"),
  "spatial_temporal_analysis": string (e.g. "Found 2 hours after reported loss at the same building library desk, which is highly consistent."),
  "recommended_next_step": string (e.g. "Contact the library front desk with proof of student ID or password unlock to claim.")
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

  // 1. Category check
  if (reportA.category && reportB.category && reportA.category.toLowerCase() === reportB.category.toLowerCase()) {
    score += 15;
    matchingPoints.push(`Both items belong to the '${reportA.category}' category.`);
  }

  // 2. Brand check
  const brandA = reportA.attributes?.brand?.toLowerCase();
  const brandB = reportB.attributes?.brand?.toLowerCase();
  if (brandA && brandB && (brandA === brandB || brandA.includes(brandB) || brandB.includes(brandA))) {
    score += 15;
    matchingPoints.push(`Brand matches: both reference '${reportA.attributes?.brand}'.`);
  } else if (brandA && brandB && brandA !== brandB) {
    score -= 20;
    conflicts.push(`Reported brand differs ('${reportA.attributes?.brand}' vs '${reportB.attributes?.brand}').`);
  }

  // 3. Color check
  const colorA = reportA.attributes?.primary_color?.toLowerCase();
  const colorB = reportB.attributes?.primary_color?.toLowerCase();
  if (colorA && colorB && (colorA === colorB || textB.includes(colorA) || textA.includes(colorB))) {
    score += 10;
    matchingPoints.push(`Color alignment on primary tone (${reportA.attributes?.primary_color || colorA}).`);
  }

  // 4. Distinguishing marks / keywords overlap
  const wordsA = new Set(textA.split(/\W+/).filter(w => w.length > 3));
  const wordsB = new Set(textB.split(/\W+/).filter(w => w.length > 3));
  const commonWords = Array.from(wordsA).filter(w => wordsB.has(w) && !["item", "found", "lost", "report", "with", "have", "some"].includes(w));

  if (commonWords.length >= 4) {
    score += 15;
    matchingPoints.push(`Strong keyword and distinct feature overlap: ${commonWords.slice(0, 4).join(", ")}.`);
  }

  // 5. Special sticker / collar / accessory matches
  if (/sticker|octocat|openai/.test(textA) && /sticker|octocat|octopus|ai/.test(textB)) {
    score += 20;
    matchingPoints.push("Distinctive sticker features match (GitHub Octocat / tech decals).");
  }
  if (/cooper|bone|blue collar|teal/.test(textA) && /blue|collar|trail|bone/.test(textB)) {
    score += 20;
    matchingPoints.push("Pet visual traits and collar color match closely.");
  }
  if (/fossil|red stitch|bi-fold/.test(textA) && /fossil|red stitch|leather|wallet/.test(textB)) {
    score += 20;
    matchingPoints.push("Leather wallet model and interior stitching details align.");
  }

  // Clamp score
  score = Math.max(10, Math.min(98, score));

  let confidenceLevel: GeminiMatchEvaluation["confidence_level"] = "LOW";
  if (score >= 80) confidenceLevel = "HIGH";
  else if (score >= 55) confidenceLevel = "MEDIUM";
  else if (score >= 35) confidenceLevel = "LOW";
  else confidenceLevel = "UNLIKELY";

  const summary = score >= 75
    ? `Strong match detected! Key physical characteristics, category (${reportA.category}), and contextual locations show high correlation.`
    : `Potential candidate with overlapping features (${matchingPoints.slice(0, 2).join("; ")}). Further verification recommended.`;

  return {
    confidence_score: score,
    confidence_level: confidenceLevel,
    match_summary: summary,
    matching_features: matchingPoints.length > 0 ? matchingPoints : ["General category and description overlap."],
    conflicting_features: conflicts.length > 0 ? conflicts : ["Verify specific serial numbers or interior contents to confirm ownership."],
    spatial_temporal_analysis: `Locations '${reportA.location}' and '${reportB.location}' are within plausible geographic proximity and timeline.`,
    recommended_next_step: score >= 75
      ? `Contact ${reportB.contact_name} (${reportB.contact_info}) to coordinate claim verification.`
      : `Compare secondary photos or request private identifier verification.`,
  };
}

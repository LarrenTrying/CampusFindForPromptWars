import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local natively
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateDeterministicEmbedding(text, dimensions = 768) {
  const normalized = (text || "").toLowerCase().trim();
  const vector = new Array(dimensions).fill(0);
  if (!normalized) return vector;

  const words = normalized.split(/\W+/).filter(Boolean);

  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    let hash = 5381;
    for (let i = 0; i < word.length; i++) {
      hash = (hash * 33) ^ word.charCodeAt(i);
    }
    for (let k = 0; k < 12; k++) {
      const idx = Math.abs((hash + k * 97) % dimensions);
      const sign = (hash + k) % 2 === 0 ? 1 : -1;
      const weight = 1.0 / Math.sqrt(w + 1);
      vector[idx] += sign * weight;
    }
  }

  for (let i = 0; i < normalized.length - 2; i++) {
    const trigram = normalized.substring(i, i + 3);
    let hash = 0;
    for (let j = 0; j < trigram.length; j++) {
      hash = (hash << 5) - hash + trigram.charCodeAt(j);
    }
    const idx = Math.abs(hash % dimensions);
    vector[idx] += 0.4;
  }

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

const SEED_REPORTS = [
  {
    id: "8d754f9a-1122-4411-9988-111111111111",
    type: "lost",
    title: "Space Gray MacBook Air M2 13-inch",
    description: "Lost my Space Gray MacBook Air M2 in the campus main library 2nd floor study nook. It has an octocat GitHub sticker and an OpenAI sticker on the lid. Left around 3:30 PM.",
    category: "Electronics & Laptops",
    image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    location: "Main Campus Library, 2nd Floor Study Area",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    contact_name: "Sarah Lin",
    contact_info: "sarah.lin@campus.edu | (555) 234-5678",
    reporter_campus_id: "90421",
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
    }
  },
  {
    id: "8d754f9a-1122-4411-9988-222222222222",
    type: "found",
    title: "Found Apple Laptop with Developer Stickers at Library Desk",
    description: "Found an Apple laptop left behind at the 2nd floor library quiet room near desk #14. Has several tech stickers on the gray cover. Turned into the 2nd floor staff room.",
    category: "Electronics & Laptops",
    image_url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
    location: "Library Front Circulation Desk (found on 2nd Floor)",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    contact_name: "Library Duty Staff",
    contact_info: "library-desk@campus.edu | Ext. 402",
    reporter_campus_id: "43554",
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
    }
  },
  {
    id: "8d754f9a-1122-4411-9988-333333333333",
    type: "lost",
    title: "Fossil Brown Leather Bi-fold Wallet with Student ID",
    description: "Lost my brown vintage Fossil leather wallet. Contains Campus student ID (David K., ID #71829), driver's license, and campus dining card. Red accent stitching inside seam.",
    category: "Student IDs & Wallets",
    image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    location: "Student Union Lounge & Dining Hall",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    contact_name: "David Kim",
    contact_info: "dkim99@campus.edu | (555) 789-0123",
    reporter_campus_id: "71829",
    status: "active",
    attributes: {
      category: "Student IDs & Wallets",
      item_type: "Bi-fold Wallet",
      brand: "Fossil",
      primary_color: "Brown",
      secondary_colors: ["Red", "Tan"],
      materials: ["Genuine Leather"],
      identifying_marks: ["Red accent stitching on interior flap", "Fossil embossed logo on front right", "Student ID #71829 inside"],
      condition: "Worn",
      estimated_value_range: "Medium",
      keyword_tags: ["wallet", "leather", "fossil", "brown", "student id", "student union"],
      enhanced_summary: "Brown Fossil leather bi-fold wallet with red stitching details and student ID lost in Student Union.",
    }
  },
  {
    id: "8d754f9a-1122-4411-9988-444444444444",
    type: "found",
    title: "Brown Leather Wallet with Student ID Card at Student Union",
    description: "Picked up a distressed brown leather wallet on the sofa near the Student Union coffee kiosk. Contains university student cards. Left at 2nd Floor Staff Room.",
    category: "Student IDs & Wallets",
    image_url: "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=800&q=80",
    location: "Student Union Info Desk (found near coffee kiosk)",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    contact_name: "Student Services Desk",
    contact_info: "student-services@campus.edu | (555) 345-HELP",
    reporter_campus_id: "43554",
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
    }
  },
  {
    id: "8d754f9a-1122-4411-9988-555555555555",
    type: "lost",
    title: "TI-84 Plus CE Graphing Calculator (Rose Gold)",
    description: "Left my Texas Instruments TI-84 Plus CE Rose Gold graphing calculator in Science Hall Lecture Room 101 after Calculus III exam. Has a small chemistry sticker on the slide cover.",
    category: "Calculators & Books",
    image_url: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80",
    location: "Science & Tech Hall, Lecture Room 101",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    contact_name: "Maya Patel",
    contact_info: "mpatel@campus.edu | (555) 441-2091",
    reporter_campus_id: "55120",
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
    }
  },
  {
    id: "8d754f9a-1122-4411-9988-666666666666",
    type: "found",
    title: "Found Rose Gold TI-84 Graphing Calculator in Science Hall",
    description: "Found a Rose Gold Texas Instruments graphing calculator under seat row 4 in Science Hall Room 101. Handed to 2nd Floor Staff Room.",
    category: "Calculators & Books",
    image_url: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=800&q=80",
    location: "Science Hall TA Office Room 204 (Found in Room 101)",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    contact_name: "Math Department Staff",
    contact_info: "math-ta@campus.edu | Office 204",
    reporter_campus_id: "43554",
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
    }
  },
  {
    id: "8d754f9a-1122-4411-9988-777777777777",
    type: "lost",
    title: "AirPods Pro 2nd Gen with Matte Olive Case & Carabiner",
    description: "Left my Apple AirPods Pro (2nd gen) in the olive green case with a mini brass carabiner attached in the Campus Recreation Athletic Locker Room.",
    category: "Electronics & Laptops",
    image_url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    location: "Campus Recreation Center - Men's Locker Room",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    contact_name: "Alex Thorne",
    contact_info: "alex.t@campus.edu | 555-0192",
    reporter_campus_id: "88219",
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
    }
  },
  {
    id: "8d754f9a-1122-4411-9988-888888888888",
    type: "lost",
    title: "Dorm Key Set & Toyota Car Key with Stitch Plush",
    description: "North Quad dorm room key, mail key, and Toyota key fob on a split ring with a small blue Disney Stitch plush keychain. Lost near the Engineering Quad walkway.",
    category: "Dorm & Car Keys",
    image_url: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
    location: "Engineering Quad Walkway near North Quad",
    date_time: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    contact_name: "Chloe Miller",
    contact_info: "chloe.m@campus.edu",
    reporter_campus_id: "66401",
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
    }
  }
];

async function seed() {
  console.log("Seeding Supabase with campus lost & found reports...");
  for (const report of SEED_REPORTS) {
    const summaryText = `${report.title} ${report.description} ${report.category} ${report.location} ${
      report.attributes?.brand || ""
    } ${report.attributes?.primary_color || ""} ${report.attributes?.materials?.join(" ") || ""} ${
      report.attributes?.identifying_marks?.join(" ") || ""
    } ${report.attributes?.keyword_tags?.join(" ") || ""}`;

    const embedding = generateDeterministicEmbedding(summaryText, 768);

    const payload = {
      id: report.id,
      type: report.type,
      title: report.title,
      description: report.description,
      category: report.category,
      image_url: report.image_url,
      location: report.location,
      date_time: report.date_time,
      contact_name: report.contact_name,
      contact_info: report.contact_info,
      reporter_campus_id: report.reporter_campus_id,
      status: report.status,
      attributes: report.attributes,
      embedding: embedding,
    };

    const { error } = await supabase
      .from('reports')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn(`Failed to insert report "${report.title}":`, error.message);
    } else {
      console.log(`✓ Inserted: [${report.type.toUpperCase()}] ${report.title}`);
    }
  }
  console.log("Seeding completed successfully!");
}

seed();

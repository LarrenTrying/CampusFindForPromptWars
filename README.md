# 🔍 FindGuard AI - Next.js Lost & Found with Supabase pgvector & Gemini

An intelligent, full-stack Lost & Found web platform built with **Next.js (App Router)**, **Supabase PostgreSQL (`pgvector`)**, and **Google Gemini Multimodal AI**.

---

## 🌟 Key Features

1. **Multimodal Report Submission (`/submit`)**:
   - Accepts photos (with live preview / upload), item title, detailed natural language descriptions, category, location, and timestamp.
   - On submission, calls **Google Gemini** (`gemini-2.5-flash`) to perform forensic extraction of structured attributes:
     - Item Category & Specific Item Type
     - Brand & Model (e.g. *Apple MacBook Air M2 13-inch*, *Fossil*, *Toyota*)
     - Primary Color & Secondary Accent Colors
     - Materials (e.g. *Aluminum*, *Leather*, *Silicone*)
     - Distinguishing marks, stickers, engravings, serial hints, or pet collar charms
     - Item Condition & Estimated Value Range
     - Search Keyword Tags & Enhanced Forensic Summary
   - Automatically computes a 768-dimensional vector embedding using Google GenAI (`text-embedding-004`) and saves it in Supabase `pgvector`.

2. **Automated Opposite-Type Matching Engine (`/api/match` & `/match`)**:
   - Given a source report (e.g., a *Lost* report), executes a nearest-neighbor cosine similarity search (`<=>`) in `pgvector` specifically against the opposite report type (*Found* reports).
   - Passes top candidate pairs to **Gemini Flash** for deep multimodal comparison.
   - Gemini produces:
     - **Match Confidence Score** (0–100%) and Confidence Tier (HIGH / MEDIUM / LOW / UNLIKELY)
     - **Match Summary & Rationale** explaining why the items correlate
     - **Matching Features** (bulleted checklist)
     - **Discrepancies & Verification Checklist** (items for owner/finder to double-check)
     - **Spatio-temporal Analysis** (checking if loss location/time aligns with found location/time)
     - **Recommended Next Step** (how to coordinate handover)
   - Interactive 1-click **"Confirm & Claim Match"** action with celebratory confetti.

3. **Semantic Search (`/search`)**:
   - Natural language search query interface (e.g., *"I lost a gray apple laptop with developer stickers at the library yesterday afternoon"*).
   - Generates embedding vector of query on the fly and queries `pgvector` with cosine similarity ranking.
   - Displays match percentage and highlight snippets.

4. **Explore Feed & Real-time Stats (`/`)**:
   - Filter by Lost/Found, Category, Status (Active/Resolved), or search keyword.
   - Instant 1-click **Demo Seeder** button that populates paired cases (MacBooks, vintage wallets, AirPods, golden retriever dog, keys) for instant testing out of the box.

5. **Individual Report Details (`/reports/[id]`)**:
   - Forensic attribute breakdown card, location map details, and live inline "Opposite Matches" pipeline.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 14 App Router, TypeScript, React 18
- **Styling**: Tailwind CSS, Lucide Icons, Glassmorphism, Canvas Confetti
- **Vector Database**: Supabase PostgreSQL with `pgvector` extension (`vector(768)` & HNSW cosine index)
- **AI Models**:
  - `gemini-2.5-flash` / `gemini-1.5-flash`: Multimodal forensic attribute extraction & deep match evaluation
  - `text-embedding-004`: 768-dimensional vector embedding generation

---

## 🚀 Quick Start

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env.local`:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your keys:
\`\`\`env
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

> **Note**: The application has an automatic fallback to an in-memory/local pgvector mock engine and heuristic AI pipeline so it runs **100% immediately out of the box** even before you enter API keys!

### 3. Supabase pgvector Setup (When using live Supabase)
Execute the SQL script in `supabase/schema.sql` inside your Supabase SQL Editor.

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Reference

- `GET /api/reports` - List reports with filters (`type`, `category`, `status`, `query`)
- `POST /api/reports` - Create report, extract attributes with Gemini, generate 768-d vector, and store in database
- `GET /api/reports/:id` - Fetch single report
- `PATCH /api/reports/:id` - Update status (e.g. resolve/claim)
- `GET /api/match?reportId=:id` - Find nearest-neighbor opposite-type reports via pgvector and score with Gemini
- `POST /api/search` - Semantic search via natural language vector query
- `POST /api/seed` - Populate database with realistic paired lost & found items
- `GET /api/status` - Live check of Supabase pgvector & Gemini connectivity

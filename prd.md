You are an expert full-stack engineer and product architect.

Build a production-ready, open-source web application called **FileFox** (working title — easy to rename). Publicly, it presents as a boring, SEO-friendly tool like “AI File Organizer”.

## 0. Product Concept (High-Level)

FileFox is an **AI-powered file organizer**.

One job, done extremely well:

> User uploads a messy folder (as a .zip) → AI analyzes filenames, metadata, and contents → proposes a clean, structured folder layout + renamed files → user approves → gets an “organized” zip (or script to apply locally).

Core principles:

- **Privacy-first** – files are processed transiently, not stored long-term.
- **Web-based** – runs in the browser + serverless backend.
- **BYOK AI via OpenRouter** – the deployer/user configures OpenRouter API key; app does not ship with a paid key.
- **Frictionless** – no signup needed for first small folder.
- **Clear upgrade path** – free limits vs larger orgs / advanced features.

The app **must not** try to be a Swiss Army knife. It only does:

- Bulk file naming
- Folder structuring
- Duplicate detection
- Export of organized results (ZIP or script)

Nothing else.

---

## 1. Tech Stack

Use:

- **Next.js 14+** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **Convex** for backend data, state, and job tracking
- **Clerk** for authentication (for dashboard + higher limits)
- **Object Storage** (S3-compatible) for temporary zip storage
- **OpenRouter** for BYOK LLM access:
  - Env: `OPENROUTER_API_KEY`
  - Base URL: `https://openrouter.ai/api/v1`
  - Model env: `OPENROUTER_MODEL` (e.g. `openai/gpt-4.1-mini` or similar)

LLM usage goes through OpenRouter so users can plug in whichever upstream they like.

---

## 2. Core Entities (Convex Schema)

Define the following collections in Convex:

### `users`

- `userId: string` (Clerk user id)
- `createdAt: Date`

### `sessions` (organizing sessions)

Represents a single “organize this folder” operation.

- `_id: string`
- `userId?: string | null` (nullable for anonymous users)
- `status: "uploaded" | "analyzing" | "proposed" | "processing" | "complete" | "failed"`
- `originalZipKey: string` (storage key for uploaded zip)
- `organizedZipKey?: string | null` (storage key for organized zip, if generated)
- `fileCount: number`
- `totalBytes: number`
- `plan: any` (JSON of proposed organization plan: folder tree + rename map)
- `settings: { maxDepth: number; namingStyle: "descriptive" | "timestamped" | "kebab-case"; groupBy: string[] }`
- `createdAt: Date`
- `updatedAt: Date`
- `errorMessage?: string | null`
- `isPreviewOnly: boolean` (for free/anon — only shows plan, no final zip/script)

### `limits`

(Optional but useful — or encode via code/env)

- `userId?: string | null`
- `maxFilesPerSession: number`
- `maxBytesPerSession: number`
- `maxSessionsPerDay: number`

### `events` (optional for analytics/audit)

- `_id`
- `sessionId`
- `type: "view" | "start" | "plan_generated" | "download"`
- `createdAt`

---

## 3. AI / OpenRouter Integration (BYOK)

Implement a thin wrapper around OpenRouter:

File: `lib/llmClient.ts`

- Read env:
  - `OPENROUTER_API_KEY`
  - `OPENROUTER_MODEL`
- If `OPENROUTER_API_KEY` is missing:
  - Disable AI features and show a clear warning in UI:
    > "AI organization is not configured. Please set OPENROUTER_API_KEY and OPENROUTER_MODEL."

### LLM Responsibilities

The LLM should **not** receive raw file content blobs (for privacy/cost). Instead send:

- A summarized “manifest” of uploaded files:
  - filename
  - extension
  - size
  - inferred type (by extension)
  - optionally a short sample of contents for a few representative files (for documents)

Example manifest item:

```json
{
  "originalPath": "Downloads/IMG_1234.JPG",
  "fileName": "IMG_1234.JPG",
  "extension": "jpg",
  "sizeBytes": 2342345,
  "sampleText": null,
  "mimeType": "image/jpeg"
}

interface FilePlanItem {
  originalPath: string;
  newPath: string;   // e.g. "Photos/2023/Trip to Rome/IMG_1234.jpg"
}

interface OrganizationPlan {
  summary: string;
  rules: string[];
  items: FilePlanItem[];
}

LLM Functions
	•	generateOrganizationPlan(manifest, userSettings): Promise<OrganizationPlan>
	•	Give it clear instructions:
	•	Group by type/date/topic
	•	Avoid over-nesting
	•	Use human readable folder names
	•	Preserve file extensions
	•	Avoid collisions in filenames
	•	Optionally:
	•	refinePlan(existingPlan, instruction): Promise<OrganizationPlan>
	•	For v1 this is optional; you can just regenerate.

All LLM calls must be server-side only (Convex/Next API routes), never from the client.

⸻

4. User Flows

4.1 Landing Page (/)

Goal: frictionless start + instant demo.

Components:
	•	Hero section:
	•	Headline: “Organize your messy folders with AI (in one click)”
	•	Subtext: “Upload a zip of your Downloads or Documents and get a clean, organized folder structure back.”
	•	Drag-and-drop + file picker area:
	•	Accepts .zip only for v1.
	•	Show constraints (e.g., “Up to 200 files / 500MB free” for anon).
	•	Button: “Organize this folder”

Flow:
	1.	User drops a zip file.
	2.	Client:
	•	Calls Convex createSession mutation with file metadata.
	•	Receives uploadUrl + sessionId.
	•	Uploads zip directly to object storage via uploadUrl.
	•	Calls Convex markSessionUploaded(sessionId).
	3.	Redirect to /session/[sessionId].

No login required for first try.

⸻

4.2 Session Page (/session/[id])

This is the “organize view”, the core UI.

States:
	1.	Analyzing
	•	Show spinner + message: “Analyzing 146 files…”
	•	Backend:
	•	Unzips file (server/worker)
	•	Builds manifest array
	•	Calls generateOrganizationPlan via OpenRouter
	•	Saves plan onto sessions.plan
	•	Sets status = "proposed"
	2.	Proposed Plan
	•	Show side-by-side:
	•	Left: “Original” tree (just file list grouped by original folders)
	•	Right: “Proposed” tree (folders + renamed structure)
	•	Summary panel:
	•	“423 files reorganised into 12 folders”
	•	“Duplicates detected: 13” (if implemented)
	•	Allow:
	•	Toggle view between “flat list” and “tree”
	•	Maybe a dropdown to switch between naming styles (for future LLM refinements)
	3.	Call to Action
	•	Buttons:
	•	“Download organized ZIP” (if allowed on free tier)
	•	OR “Download apply script” (for local-only/privacy workflow)
	•	For anonymous free users:
	•	Possibly limit to “see plan only” or small downloads, with CTA:
	•	“Sign up to process larger folders and download organized zip.”
	4.	Processing
	•	When user clicks “Confirm and build organized folder”:
	•	Backend:
	•	Creates a new folder tree in temp storage:
	•	Copies/renames files according to plan.items
	•	Zips it
	•	Stores organizedZipKey on session
	•	Sets status = "complete"
	5.	Complete
	•	Show:
	•	Download button for organized zip
	•	Option to export a .sh or .ps1 script that:
	•	Renames/moves files locally based on plan.items
	•	Show “Before vs After” metrics:
	•	Number of folders before vs after
	•	Number of renamed files
	•	“Organization score” (just a fun metric, later could be algorithmic)

⸻

4.3 Auth & Dashboard (Clerk, /dashboard)

Use Clerk for login.

Free / anonymous users:
	•	Can:
	•	Do a small session (e.g. up to 200 files / 500MB)
	•	See the plan, maybe download once
	•	No historical dashboard

Logged-in users:
	•	/dashboard shows:
	•	Recent sessions:
	•	Date
	•	File count
	•	Status (Complete/Failed)
	•	Buttons: View plan, Download, Re-run with different settings
	•	Filters:
	•	Last 7 days / 30 days
	•	Sessions with downloads
	•	Clicking a session:
	•	Goes to /session/[id] with full view (including plan + actions).

⸻

5. Limits & Plans (Product Logic, Even If Not All Implemented Day 1)

These can be hard-coded or in Convex:

Anonymous
	•	Max 1 active session
	•	Max files per session: 200
	•	Max size: 500MB
	•	Plan view allowed
	•	Maybe 1 zip download per day

Logged-in Free
	•	Clerk account
	•	Max sessions/day: 3
	•	Max files: 1,000
	•	Max size: 2GB
	•	Access to history + re-download

Future Paid (not required technically now but structure should allow)
	•	Personal ($9/mo)
	•	Max files: 5,000
	•	Max size: 10GB
	•	Preset organization profiles
	•	Duplicates finder
	•	Keep plans & script history
	•	Pro ($29/mo)
	•	50k+ files
	•	Cloud connectors
	•	Scheduled “clean my folder every week”
	•	API access

Your code should be structured so these tiers are easy to plug in later.

⸻

6. Convex Functions (Detailed)

Create Convex functions (mutations/actions/queries), e.g.:

createSession({ fileName, fileSize, isAnon, settings }) (mutation)
	•	Validate:
	•	Size & file count limits (rough check from zip header if possible)
	•	Create sessions entry:
	•	status: "uploaded" initially (or "pending_upload" + update later)
	•	Generate pre-signed upload URL from object storage
	•	Return:
	•	sessionId
	•	uploadUrl

markSessionUploaded({ sessionId }) (mutation)
	•	Set status: "uploaded"
	•	Kick off an async/background job to:
	•	Unzip file
	•	Build manifest
	•	Call LLM
	•	Save plan
	•	Set status: "proposed"

(Depending on Convex capabilities, this can be an action or a scheduled job.)

getSession({ sessionId }) (query)
	•	Return safe view of session:
	•	status
	•	plan
	•	fileCount
	•	totalBytes
	•	errorMessage
	•	settings

generatePlan({ sessionId }) (action, if triggered manually)
	•	Optional: if you want a “Regenerate plan” button.
	•	Calls LLM with manifest + settings to get new plan.

confirmPlanAndBuild({ sessionId }) (action)
	•	Validates user limits.
	•	Reads plan.
	•	Creates organized folder + zip in storage.
	•	Saves organizedZipKey.
	•	Sets status: "complete".

getDownloadUrl({ sessionId, type }) (query/mutation)
	•	type = "organized" or "script"
	•	Returns short-lived pre-signed URL for:
	•	Organized zip
	•	Script file based on plan.items

getUserSessions() (query)
	•	List sessions for logged-in user.

⸻

7. Storage & Scripts

Object Storage
	•	Use an S3-compatible bucket for:
	•	Uploaded zips
	•	Organized zips
	•	(Optionally) manifest caches or tmp unzipped locations

Env:
	•	STORAGE_ENDPOINT
	•	STORAGE_REGION
	•	STORAGE_BUCKET
	•	STORAGE_ACCESS_KEY_ID
	•	STORAGE_SECRET_ACCESS_KEY

Apply Scripts

Generate an optional script file from plan.items:
	•	For Linux/macOS (apply_organization.sh):
	•	Move commands using mv with path handling.
	•	For Windows (apply_organization.ps1):
	•	Equivalent Move-Item commands.

User can run this locally if they don’t want to download re-zipped files.

⸻

8. Frontend Structure (Next.js App Router)

Routes
	•	app/page.tsx → Landing + upload
	•	app/session/[id]/page.tsx → Session view (plan preview, download)
	•	app/dashboard/page.tsx → User’s sessions (Clerk protected)
	•	app/about/page.tsx → Explanation, privacy, open-source link
	•	app/api/* (if any custom route handlers outside Convex are needed; ideally Convex handles most logic)

Components
	•	UploadArea
	•	SessionStatusPanel
	•	PlanTreeView (render original vs proposed trees)
	•	StatsSummary
	•	DownloadButtons
	•	PricingTeaser (future)
	•	LimitBadge (shows current limits based on anon vs logged-in)

Style with Tailwind, target:
	•	Clean, utilitarian design
	•	Emphasis on “before/after”
	•	Use monospace or code-like styling in script and plan views
	•	Use simple colors: neutral background, accent color for highlights

⸻

9. Non-Functional Requirements
	•	Full TypeScript coverage (frontend + backend).
	•	All LLM calls server-side via OpenRouter.
	•	No logging of file contents or filenames in analytics by default.
	•	Clear handling of:
	•	Missing OPENROUTER_API_KEY
	•	LLM errors (show “We couldn’t build a plan. Try again.”)
	•	Automatic cleanup job:
	•	Removes old zips & sessions beyond X days (e.g., 1–3 days) for privacy.
	•	Open-source license: MIT or Apache-2.0.
	•	README.md includes:
	•	What the app does
	•	Limits and privacy notes
	•	How to set:
	•	Clerk
	•	Convex
	•	S3 storage
	•	OpenRouter API
	•	How to deploy to Vercel + Convex.

⸻

10. Deliverables

Build and deliver:
	1.	A Next.js App Router project with the routes described.
	2.	Convex schema and functions for sessions, plan generation, and downloads.
	3.	OpenRouter-based LLM client that works with BYOK (user’s own OpenRouter key).
	4.	Object storage integration for uploaded/organized zips.
	5.	A complete UI that:
	•	Accepts a zip
	•	Shows analysis/proposed organization
	•	Allows downloading organized results or script
	6.	Clerk auth integration for the dashboard & higher limits.
	7.	Documentation for open-source users to self-host and configure BYOK.

Make the architecture clean, composable, and easy to extend with pricing tiers and cloud connectors later.
```

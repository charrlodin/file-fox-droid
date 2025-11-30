const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface OrganizationPlan {
  summary: string;
  rules: string[];
  items: Array<{
    originalPath: string;
    newPath: string;
  }>;
  foldersBefore: number;
  foldersAfter: number;
  duplicatesFound: number;
}

interface FileManifestItem {
  originalPath: string;
  fileName: string;
  extension: string;
  sizeBytes: number;
  mimeType: string;
}

interface OrganizationSettings {
  maxDepth: number;
  namingStyle: "descriptive" | "timestamped" | "kebab-case";
  groupBy: string[];
}

export async function generateOrganizationPlan(
  manifest: FileManifestItem[],
  settings: OrganizationSettings,
  apiKey: string,
  model: string
): Promise<OrganizationPlan> {
  const systemPrompt = `You are an expert file organization assistant. Your job is to analyze a list of files and propose a clean, logical folder structure.

Rules:
- Group files by ${settings.groupBy.join(", ")}
- Maximum folder depth: ${settings.maxDepth}
- Naming style: ${settings.namingStyle}
- Use human-readable folder names
- Preserve file extensions
- Avoid filename collisions
- Identify potential duplicates by similar names/sizes
- Don't over-nest - keep structure simple and practical

Respond with valid JSON only, no markdown or explanation.`;

  const userPrompt = `Organize these ${manifest.length} files:

${JSON.stringify(manifest.slice(0, 200), null, 2)}
${manifest.length > 200 ? `\n... and ${manifest.length - 200} more files` : ""}

Respond with this exact JSON structure:
{
  "summary": "Brief description of the organization applied",
  "rules": ["Rule 1 applied", "Rule 2 applied"],
  "items": [
    {"originalPath": "original/path/file.ext", "newPath": "New Folder/Subfolder/file.ext"}
  ],
  "foldersBefore": <number>,
  "foldersAfter": <number>,
  "duplicatesFound": <number>
}`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://foxfile.app",
      "X-Title": "FoxFile",
    },
    body: JSON.stringify({
      model: model || "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No response from AI");
  }

  try {
    const plan = JSON.parse(content) as OrganizationPlan;
    
    // Ensure all original files are in the plan
    const plannedFiles = new Set(plan.items.map(i => i.originalPath));
    for (const file of manifest) {
      if (!plannedFiles.has(file.originalPath)) {
        plan.items.push({
          originalPath: file.originalPath,
          newPath: file.originalPath, // Keep in place if not reorganized
        });
      }
    }

    return plan;
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }
}

export function isOpenRouterConfigured(): boolean {
  return !!(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_MODEL);
}

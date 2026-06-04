// Vercel serverless function: receives a username suggestion from the web app
// and files it as a GitHub Issue in the repo, so the owner gets notified.
//
// Requires a Vercel env var:
//   GITHUB_TOKEN  — a token with permission to create issues on the repo
//                   (recommended: a fine-grained PAT scoped to this repo only,
//                    with "Issues: Read and write").
// Optional env vars (have sensible defaults):
//   GITHUB_OWNER  — default "SamZewdu"
//   GITHUB_REPO   — default "funny-username-generator"

const OWNER = process.env.GITHUB_OWNER || "SamZewdu";
const REPO = process.env.GITHUB_REPO || "funny-username-generator";
const MAX_LEN = 200;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res
      .status(500)
      .json({ error: "Server not configured (missing GITHUB_TOKEN)." });
  }

  // Body may arrive parsed (object) or as a raw string depending on headers.
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const suggestion = (body?.suggestion ?? "").toString().trim();
  const note = (body?.note ?? "").toString().trim();

  if (!suggestion) {
    return res.status(400).json({ error: "Suggestion is required." });
  }
  if (suggestion.length > MAX_LEN) {
    return res
      .status(400)
      .json({ error: `Suggestion is too long (max ${MAX_LEN} chars).` });
  }

  const title = `Suggestion: ${suggestion.slice(0, 60)}`;
  const issueBody = [
    `**Suggested username:** ${suggestion}`,
    note ? `\n**Note from submitter:** ${note.slice(0, MAX_LEN)}` : "",
    `\n_Submitted via the web app on ${new Date().toISOString()}._`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const gh = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "funny-username-generator",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          body: issueBody,
          labels: ["suggestion"],
        }),
      }
    );

    if (!gh.ok) {
      const detail = await gh.text();
      console.error("GitHub API error:", gh.status, detail);
      return res
        .status(502)
        .json({ error: "Could not file the suggestion. Please try later." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Suggestion handler error:", err);
    return res.status(500).json({ error: "Unexpected error." });
  }
}

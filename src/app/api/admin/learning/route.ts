import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, subject, duration, tags, content } = body;

    if (!date || !subject || !duration || !content) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const dir = path.join(process.cwd(), "content", "learning");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const tagsLine =
      tags && tags.length > 0 ? `tags: [${tags.join(", ")}]\n` : "";

    const markdown = `---
date: ${date}
subject: ${subject}
duration: ${duration}
${tagsLine}---

${content}
`;

    const filePath = path.join(dir, `${date}.md`);
    fs.writeFileSync(filePath, markdown, "utf-8");

    return Response.json({ success: true, path: filePath });
  } catch (e) {
    return Response.json({ error: "Failed to save" }, { status: 500 });
  }
}

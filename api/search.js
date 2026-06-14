import ai from "../data/ai.json";
import dev from "../data/dev.json";
import socials from "../data/socials.json";
import gaming from "../data/gaming.json";

import db from "../lib/firebase.js";

const DB = { ...ai, ...dev, ...socials, ...gaming };

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res);

  // preflight CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "POST only"
    });
  }

  const q = String(req.body?.query || "").toLowerCase().trim();

  if (!q) {
    return res.status(400).json({
      ok: false,
      error: "empty query"
    });
  }

  const url = DB[q];

  const result = {
    ok: !!url,
    query: q,
    url: url || null
  };

  // 📖 Wikipedia
  try {
    const wikiRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`
    );

    if (wikiRes.ok) {
      const wiki = await wikiRes.json();

      result.wikipedia = {
        title: wiki.title,
        description: wiki.extract,
        url: wiki.content_urls?.desktop?.page || null
      };
    }
  } catch (e) {}

  // 🌐 DuckDuckGo
  try {
    const ddgRes = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_redirect=1&no_html=1`
    );

    if (ddgRes.ok) {
      const ddg = await ddgRes.json();

      result.duckduckgo = {
        title: ddg.Heading || null,
        abstract: ddg.Abstract || null,
        related: (ddg.RelatedTopics || [])
          .slice(0, 5)
          .map(r => ({
            text: r.Text,
            url: r.FirstURL
          }))
      };
    }
  } catch (e) {}

  // 🧠 Firebase memory
  try {
    await db.collection("search_logs").add({
      query: q,
      result,
      createdAt: Date.now()
    });
  } catch (e) {
    console.log("Firebase error:", e);
  }

  return res.status(200).json(result);
}
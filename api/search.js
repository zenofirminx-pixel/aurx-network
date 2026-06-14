import ai from "../data/ai.json" assert { type: "json" };
import dev from "../data/dev.json" assert { type: "json" };
import socials from "../data/socials.json" assert { type: "json" };
import gaming from "../data/gaming.json" assert { type: "json" };

const DB = { ...ai, ...dev, ...socials, ...gaming };

export default async function handler(req, res) {
  try {
    const q = (req.query.q || "").toLowerCase().trim();

    if (!q) {
      return res.status(400).json({ ok: false, error: "empty query" });
    }

    const url = DB[q] || null;

    let result = {
      ok: true,
      query: q,
      url
    };

    // Wikipedia SAFE
    try {
      const wikiRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`
      );

      if (wikiRes.ok) {
        const wiki = await wikiRes.json();

        result.wikipedia = {
          title: wiki.title || null,
          description: wiki.extract || null,
          url: wiki.content_urls?.desktop?.page || null
        };
      }
    } catch (e) {}

    // DuckDuckGo SAFE
    try {
      const ddgRes = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_redirect=1&no_html=1`
      );

      if (ddgRes.ok) {
        const ddg = await ddgRes.json();

        result.duckduckgo = {
          title: ddg.Heading || null,
          abstract: ddg.Abstract || null,
          related: Array.isArray(ddg.RelatedTopics)
            ? ddg.RelatedTopics.slice(0, 5).map(r => ({
                text: r.Text || "",
                url: r.FirstURL || ""
              }))
            : []
        };
      }
    } catch (e) {}

    return res.status(200).json(result);

  } catch (err) {
    console.error("SERVER ERROR:", err);

    return res.status(500).json({
      ok: false,
      error: "internal server error"
    });
  }
}
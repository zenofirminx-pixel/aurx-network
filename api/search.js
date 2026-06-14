import db from "../lib/firebase.js";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// 🧠 base de données en dur (ULTRA SAFE)
const DB = {
  github: "https://github.com",
  google: "https://google.com",
  youtube: "https://youtube.com",
  chatgpt: "https://chatgpt.com",
  vercel: "https://vercel.com",
  firebase: "https://firebase.google.com",
  twitter: "https://twitter.com",
  instagram: "https://instagram.com",
  tiktok: "https://tiktok.com",
  discord: "https://discord.com",
  reddit: "https://reddit.com",
  stackoverflow: "https://stackoverflow.com",
  npm: "https://npmjs.com",
  node: "https://nodejs.org"
};

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "POST only"
    });
  }

  const q = String(req.body?.query || "")
    .toLowerCase()
    .trim();

  if (!q) {
    return res.status(400).json({
      ok: false,
      error: "empty query"
    });
  }

  const url = DB[q] || null;

  const result = {
    ok: !!url,
    query: q,
    url
  };

  // 🧠 Firebase memory (SAFE, optional)
  try {
    await db.collection("search_logs").add({
      query: q,
      url,
      createdAt: Date.now()
    });
  } catch (e) {
    console.log("Firebase error:", e);
  }

  return res.status(200).json(result);
}
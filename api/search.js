function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// 🧠 Base de données de liens
const DB = {
  // Liens d'origine
  github: "https://github.com",
  google: "https://google.com",
  youtube: "https://youtube.com",
  chatgpt: "https://chatgpt.com",
  vercel: "https://vercel.com",
  firebase: "https://firebase.google.com",
  twitter: "https://x.com",
  instagram: "https://instagram.com",
  tiktok: "https://tiktok.com",
  discord: "https://discord.com",
  reddit: "https://reddit.com",
  stackoverflow: "https://stackoverflow.com",
  npm: "https://npmjs.com",
  node: "https://nodejs.org",

  // Extensions majeures pour couvrir les sites populaires
  wikipedia: "https://wikipedia.org",
  twitch: "https://twitch.tv",
  spotify: "https://spotify.com",
  amazon: "https://amazon.com",
  netflix: "https://netflix.com",
  pinterest: "https://pinterest.com",
  linkedin: "https://linkedin.com",
  facebook: "https://facebook.com",
  canva: "https://canva.com",
  figma: "https://figma.com"
};

export default function handler(req, res) {
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

  // 1. Vérification dans la base fixe
  let url = DB[q] || null;

  // 2. Génération dynamique pour couvrir des milliers de domaines automatiquement
  // Si le mot clé est un nom simple sans espace, on génère l'URL au format .com standard
  if (!url && q.length > 2 && !q.includes(" ") && !q.includes(".")) {
    url = `https://${q}.com`;
  }

  return res.status(200).json({
    ok: !!url,
    query: q,
    url
  });
}

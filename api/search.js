function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// 🧠 Base de liens étendue + APIs de recherche dynamiques
const DB = {
  // --- LIENS EN DUR ---
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
  wikipedia: "https://wikipedia.org",
  twitch: "https://twitch.tv",
  spotify: "https://spotify.com",
  amazon: "https://amazon.com",
  netflix: "https://netflix.com",
  pinterest: "https://pinterest.com",
  linkedin: "https://linkedin.com",
  facebook: "https://facebook.com",
  canva: "https://canva.com",
  figma: "https://figma.com",

  // --- RECHERCHES DIRECTES AUTOMATIQUES (Simule des milliers de liens) ---
  // Si l'utilisateur tape "google: quelque chose" ou "wiki: sujet"
  getGoogleSearch: (query) => `https://www.google.com/search?q=${encodeURIComponent(query)}`,
  getDuckDuckGo: (query) => `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
  getWikipediaSearch: (query) => `https://fr.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
  getYoutubeSearch: (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
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

  // 1. On cherche d'abord dans les mots-clés en dur (ex: "github")
  let url = DB[q] || null;

  // 2. Si aucun lien exact n'est trouvé, on utilise l'API de recherche intelligente
  if (!url) {
    // Si la requête commence par un préfixe spécifique (ex: "wiki: informatique")
    if (q.startsWith("wiki:")) {
      const term = q.replace("wiki:", "").trim();
      url = DB.getWikipediaSearch(term);
    } else if (q.startsWith("yt:") || q.startsWith("youtube:")) {
      const term = q.replace(/^(yt:|youtube:)/, "").trim();
      url = DB.getYoutubeSearch(term);
    } else if (q.startsWith("ddg:")) {
      const term = q.replace("ddg:", "").trim();
      url = DB.getDuckDuckGo(term);
    } else {
      // Par défaut, si le mot est totalement inconnu, ça génère une recherche Google
      // Cela rend ton application virtuellement infinie
      url = DB.getGoogleSearch(q);
    }
  }

  return res.status(200).json({
    ok: !!url,
    query: q,
    url
  });
}

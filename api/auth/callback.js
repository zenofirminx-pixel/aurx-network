export default async function handler(req, res) {
  const { code } = req.query;

  // L'URL exacte de ta PWA que tu viens de me donner
  const PWA_URL = "https://firmin-history.vercel.app"; 

  if (!code) {
    return res.status(400).json({
      ok: false,
      error: "Missing OAuth code"
    });
  }

  try {
    // 🔁 1. Échange du code contre les tokens Google
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code"
      })
    });

    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      throw new Error(tokens.error || "No access_token");
    }

    // 👤 2. Récupération des infos de l'utilisateur Google
    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        }
      }
    );

    const user = await userRes.json();

    // 🧠 3. Construction de l'objet session
    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      locale: user.locale || "fr"
    };

    // 🔑 4. Transformation des infos en un Token Base64 pour ton index.html
    const token = Buffer.from(JSON.stringify(session)).toString('base64');

    // 🚀 5. Redirection REDOUTABLE et DIRECTE vers ta PWA avec le token !
    return res.redirect(`${PWA_URL}/?token=${token}`);

  } catch (err) {
    console.error("OAuth error:", err);
    // En cas d'erreur, on renvoie l'utilisateur à la PWA avec un indicateur d'échec
    return res.redirect(`${PWA_URL}/?login=error`);
  }
}

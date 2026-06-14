import client from "./google.js";

export default async function handler(req, res) {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).json({ ok: false, error: "Missing code" });
    }

    // échange code → tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // récup user Google
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture
    };

    const session = Buffer.from(JSON.stringify(user)).toString("base64");

    return res.redirect(
      `https://aurx-network.vercel.app/?token=${session}`
    );

  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "OAuth failed" });
  }
}
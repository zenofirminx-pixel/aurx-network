import { verifyGoogleToken } from "./google.js";
import { parse } from "cookie";

export default async function handler(req, res) {
  try {
    const cookies = parse(req.headers.cookie || "");
    const authHeader = req.headers.authorization;

    let token = null;

    // 🔐 priorité header puis cookie
    if (authHeader) {
      token = authHeader.split(" ")[1];
    }

    if (!token && cookies.aurx_token) {
      token = cookies.aurx_token;
    }

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: "No token"
      });
    }

    const user = await verifyGoogleToken(token);

    return res.status(200).json({
      ok: true,
      user
    });

  } catch (err) {
    return res.status(401).json({
      ok: false,
      error: "Invalid token"
    });
  }
}
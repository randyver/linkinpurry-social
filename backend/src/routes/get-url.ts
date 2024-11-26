import type { Context } from "hono";
import { getR2SignedUrl } from "../utils/s3Helper.js";

export async function getSignedUrlHandler(c: Context) {
  try {
    const key = c.req.query("key");
    const expiresIn = c.req.query("expiresIn");

    if (!key) {
      return c.json({ success: false, message: "Missing key parameter" }, 400);
    }

    let expiresInSec: number | undefined;
    if (expiresIn) {
      const parsedExpiresIn = parseInt(expiresIn, 10);
      if (isNaN(parsedExpiresIn) || parsedExpiresIn <= 0) {
        return c.json(
          { success: false, message: "Invalid expiresIn parameter" },
          400
        );
      }
      expiresInSec = parsedExpiresIn;
    }

    const signedUrl = await getR2SignedUrl(key, expiresInSec);

    return c.json({ success: true, url: signedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return c.json(
      { success: false, message: "Failed to generate signed URL" },
      500
    );
  }
}

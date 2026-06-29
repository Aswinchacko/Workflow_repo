// WebAuthn relying-party config. Derived from the ACTUAL incoming request so it
// always matches the domain the user is on (localhost, Vercel, custom domain,
// preview URLs) without needing any env var. rpID must equal the site hostname;
// origin must match the browser origin exactly.
export const rpName = "WorkSite Portal";

export function rpFromRequest(req: Request): { rpID: string; origin: string } {
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  const rpID = host.split(":")[0]; // strip port -> "localhost" or "app.vercel.app"
  const origin = `${proto}://${host}`;
  return { rpID, origin };
}

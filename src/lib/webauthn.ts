// WebAuthn relying-party config. Derived from NEXTAUTH_URL so it matches the
// deployed domain (rpID must equal the site's hostname; origin must be exact).
export const rpName = "WorkSite Portal";

function appUrl(): URL {
  return new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000");
}

export function getRpId(): string {
  return appUrl().hostname; // e.g. "localhost" or "your-app.vercel.app"
}

export function getOrigin(): string {
  return appUrl().origin; // e.g. "https://your-app.vercel.app"
}

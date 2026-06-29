/** Sample company letterhead — replace with real values in production. */
export const company = {
  name: "AL RASHID CONTRACTING LLC",
  addressLine1: "Office 1204, Business Bay Tower",
  addressLine2: "Dubai, United Arab Emirates",
  trn: "100XXXXXXXXX",
  phone: "+971 4 XXX XXXX",
  email: "info@alrashidcontracting.ae",
  website: "www.alrashidcontracting.ae",
  /** UAE standard VAT — shown as informational on estimates. */
  vatRate: 0.05,
  portalName: "WorkSite Portal",
  disclaimer: [
    "This document is a cost estimate for internal procurement planning only.",
    "Final pricing is subject to vendor quotation and management approval.",
    "Amounts are shown in UAE Dirhams (AED) unless stated otherwise.",
  ],
} as const;

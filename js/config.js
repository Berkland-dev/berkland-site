/**
 * BERKLAND CLEANING — SITE CONFIG
 * Edit this ONE file to update contact info, brand colors, or the backend URL.
 * No other file should hardcode these values.
 */
const SITE_CONFIG = {
  // ---- Brand (safe to change here; nothing else in the codebase is "locked") ----
  BRAND_NAME: "Berkland Cleaning Services",
  BRAND_LEGAL_NAME: "Babylon Cleaning Service",
  BRAND_SLOGAN: "Clean Spaces • Healthy Lives",

  // ---- Contact ----
  COMPANY_PHONE: "301-818-2624",
  COMPANY_PHONE_TEL: "3018182624", // digits only, used in tel: links
  OFFICIAL_EMAIL: "info@berklandcleaning.com",

  // ---- Colors (must match css/styles.css :root — change both places) ----
  PRIMARY_NAVY: "#0B2B5C",
  SECONDARY_BLUE: "#1D6BB0",
  LEAF_GREEN: "#62B235",

  // ---- Hero background video (direct .mp4 URL or a YouTube URL) ----
  HERO_BG_VIDEO: "videos/hero.mp4",

  // ---- Backend API base URL ----
  // This is the ONLY place the site knows about your backend.
  // Point it at your deployed API (see /backend/README.md).
  // Leave as-is during local testing; forms will show a friendly
  // "coming soon" message instead of failing silently.
  API_BASE_URL: "https://api.berklandcleaning.com", // TODO: replace once backend is deployed

  // Set true only while backend isn't live yet, to keep forms testable
  // without erroring in the console. Flip to false once API_BASE_URL is real.
  API_NOT_YET_DEPLOYED: true
};

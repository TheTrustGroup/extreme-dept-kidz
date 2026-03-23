/**
 * Generate a client-ready PDF with links, login credentials, and a short flow overview.
 *
 * Run from project root:
 *   npm run generate-client-pdf
 *
 * Optional env (same shell, or add to .env.local — not committed):
 *   CLIENT_PDF_SITE_URL=https://extremedeptkidz.com
 *   CLIENT_PDF_WAREHOUSE_URL=https://warehouse.extremedeptkidz.com
 *   CLIENT_PDF_ADMIN_EMAIL=you@example.com
 *   CLIENT_PDF_ADMIN_PASSWORD=your-secret   (omit to print a fill-in placeholder)
 *
 * Output: ~/Desktop/Extreme-Dept-Kidz-Client-Access.pdf
 */

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvLocal();

const desktopPath = path.join(process.env.HOME || "", "Desktop");
const outputFilename = "Extreme-Dept-Kidz-Client-Access.pdf";
const outputPath = path.join(desktopPath, outputFilename);

const SITE =
  process.env.CLIENT_PDF_SITE_URL?.trim().replace(/\/$/, "") ||
  "https://extremedeptkidz.com";
const WAREHOUSE =
  process.env.CLIENT_PDF_WAREHOUSE_URL?.trim().replace(/\/$/, "") ||
  "https://warehouse.extremedeptkidz.com";
const ADMIN_LOGIN = `${SITE}/admin/login`;

const ADMIN_EMAIL =
  process.env.CLIENT_PDF_ADMIN_EMAIL?.trim() || "info@extremedeptkidz.com";
const ADMIN_PASSWORD =
  process.env.CLIENT_PDF_ADMIN_PASSWORD?.trim() ||
  "[Your admin password — fill in by hand; do not share by email]";

const ROLE_PASSWORD = "EDK-!@#";
const ROLE_USERS: { role: string; email: string }[] = [
  { role: "Manager", email: "manager@extremedeptkidz.com" },
  { role: "Cashier", email: "cashier@extremedeptkidz.com" },
  { role: "Warehouse", email: "warehouse@extremedeptkidz.com" },
  { role: "Driver", email: "driver@extremedeptkidz.com" },
  { role: "Viewer", email: "viewer@extremedeptkidz.com" },
];

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 56, bottom: 52, left: 56, right: 56 },
  info: {
    Title: "Extreme Dept Kidz — Client access",
    Author: "Extreme Dept Kidz",
  },
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const W = doc.page.width - doc.page.margins.left - doc.page.margins.right;
const left = doc.page.margins.left;

function hr(y: number): void {
  doc.save();
  doc.strokeColor("#e5e5e5").lineWidth(0.5);
  doc.moveTo(left, y).lineTo(left + W, y).stroke();
  doc.restore();
}

function sectionTitle(text: string): void {
  doc.moveDown(0.4);
  hr(doc.y);
  doc.moveDown(0.55);
  doc.font("Helvetica-Bold").fontSize(12.5).fillColor("#111");
  doc.text(text, left, doc.y, { width: W });
  doc.moveDown(0.65);
}

function bodyPara(text: string, size = 10.5): void {
  doc.font("Helvetica").fontSize(size).fillColor("#333");
  doc.text(text, { width: W, align: "left", lineGap: 2 });
}

function bulletLine(text: string): void {
  doc.font("Helvetica").fontSize(10).fillColor("#333");
  doc.text("•  " + text, { width: W, indent: 8, lineGap: 1 });
}

// ─── Title block ───────────────────────────────────────────────────────────
doc.font("Helvetica-Bold").fontSize(20).fillColor("#0a0a0a");
doc.text("Extreme Dept Kidz", { align: "center" });
doc.moveDown(0.35);
doc.font("Helvetica").fontSize(11.5).fillColor("#555");
doc.text("Website, admin & warehouse access", { align: "center" });
doc.moveDown(0.25);
doc.font("Helvetica-Oblique").fontSize(9).fillColor("#888");
doc.text("For your records — treat as confidential.", { align: "center" });
doc.moveDown(1.4);

// ─── Links ─────────────────────────────────────────────────────────────────
sectionTitle("Quick links");
const linkRows: { label: string; url: string }[] = [
  { label: "Customer website (browse & shop)", url: SITE },
  { label: "Admin dashboard (orders, products, settings)", url: ADMIN_LOGIN },
  { label: "Warehouse app (inventory & POS)", url: WAREHOUSE },
];
doc.font("Helvetica").fontSize(10.5).fillColor("#333");
for (const row of linkRows) {
  doc.text(row.label, { width: W });
  doc.fillColor("#0b57d0").text(row.url, { link: row.url, underline: true });
  doc.fillColor("#333").moveDown(0.45);
}

// ─── Credentials ───────────────────────────────────────────────────────────
sectionTitle("Admin login (main dashboard)");
doc.font("Helvetica").fontSize(10.5).fillColor("#333");
doc.text("Sign in here to manage the store: ", { continued: true });
doc.fillColor("#0b57d0").text(ADMIN_LOGIN, { link: ADMIN_LOGIN, underline: true });
doc.fillColor("#333").moveDown(0.5);
doc.text("Email:    " + ADMIN_EMAIL);
doc.text("Password: " + ADMIN_PASSWORD);
doc.moveDown(0.9);

sectionTitle("Warehouse / POS role accounts");
bodyPara(
  "Log in at the warehouse URL above. These accounts share one password for onboarding; change passwords after first login if you prefer.",
  10,
);
doc.moveDown(0.45);
doc.font("Helvetica-Bold").fontSize(10).fillColor("#333");
doc.text("Shared password for roles below:  " + ROLE_PASSWORD);
doc.moveDown(0.5);
doc.font("Helvetica").fontSize(10).fillColor("#333");
for (const { role, email } of ROLE_USERS) {
  doc.text(`${role.padEnd(12)}  ${email}`);
  doc.moveDown(0.28);
}

// ─── Flow overview ─────────────────────────────────────────────────────────
sectionTitle("How the site fits together");
bodyPara(
  "Customer site — Shoppers browse collections, add items to the cart, and complete checkout with their details. They receive confirmation on the success screen.",
  10,
);
doc.moveDown(0.45);
bodyPara(
  "Admin dashboard — After logging in at the admin URL, your team manages products, categories, orders, customers, inventory views, and store settings from the sidebar. This is the main back office for day-to-day operations.",
  10,
);
doc.moveDown(0.45);
bodyPara(
  "Warehouse app — Staff use the warehouse URL for floor workflows (inventory and point-of-sale style tasks). It talks to the same backend as the main site, so stock and orders stay in sync.",
  10,
);
doc.moveDown(0.55);
doc.font("Helvetica-Bold").fontSize(10).fillColor("#333");
doc.text("Typical flow:");
doc.moveDown(0.35);
bulletLine("Customer places an order on the website.");
bulletLine("Team sees and updates the order in Admin (Orders).");
bulletLine("Warehouse staff fulfill or adjust stock using the warehouse app as needed.");

// ─── Footer ────────────────────────────────────────────────────────────────
doc.moveDown(1.1);
hr(doc.y);
doc.moveDown(0.65);
doc.font("Helvetica").fontSize(8.5).fillColor("#666");
doc.text(
  "Keep this PDF private. Prefer a password manager or secure handoff; avoid sending passwords in plain email or chat.",
  { width: W, align: "center" },
);
doc.moveDown(0.35);
doc.font("Helvetica-Oblique").fontSize(8).fillColor("#999");
doc.text("Generated " + new Date().toISOString().slice(0, 10), {
  width: W,
  align: "center",
});

doc.end();

stream.on("finish", () => {
  console.log("✅ PDF saved to Desktop:");
  console.log("   " + outputPath);
  console.log("");
  console.log(
    "Tip: set CLIENT_PDF_ADMIN_PASSWORD when generating if you want the password printed (avoid committing it).",
  );
});

stream.on("error", (err) => {
  console.error("❌ Error creating PDF:", err);
  process.exit(1);
});

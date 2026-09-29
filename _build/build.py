#!/usr/bin/env python3
"""
Berkland static site builder.
Source of truth: _build/templates/ (head/header/footer) + _build/content/ (per-page body).
Output: flat .html files in the site root — exactly what GitHub Pages / Cloudflare Pages serve.
Run: python3 _build/build.py
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TPL = os.path.join(ROOT, "_build", "templates")
CONTENT = os.path.join(ROOT, "_build", "content")

with open(os.path.join(TPL, "head.html")) as f: HEAD = f.read()
with open(os.path.join(TPL, "header.html")) as f: HEADER = f.read()
with open(os.path.join(TPL, "footer.html")) as f: FOOTER = f.read()

# path -> (title, meta description, extra <script> block for that page only)
PAGES = {
    "index.html": (
        "Berkland Cleaning Services | Clean Spaces • Healthy Lives — Washington DC, Maryland & Northern Virginia",
        "Professional residential, commercial and specialty cleaning across Washington DC, Maryland and Northern Virginia. Get a free quote or book a cleaning today.",
        "index.html",
        '<script>loadHeroVideo(); startHeroRotator();</script>'
    ),
    "residential.html": (
        "Residential House Cleaning in Washington DC, Maryland & Northern Virginia | Berkland Cleaning",
        "Residential house cleaning in Washington DC, Maryland & Northern Virginia. Standard, recurring, deep, move-in/move-out and Airbnb turnover cleaning from Berkland.",
        "residential.html", ""
    ),
    "commercial.html": (
        "Commercial Cleaning Services in the DMV | Berkland Cleaning",
        "Commercial cleaning services in Washington DC, Maryland & Northern Virginia — office, medical, school, religious, retail, property management and industrial cleaning from Berkland.",
        "commercial.html", ""
    ),
    "specialty.html": (
        "Specialty Cleaning: Post-Construction, Floor Care, Carpet & Events | Berkland Cleaning",
        "Specialty cleaning in the DMV: post-construction cleaning, commercial floor care, carpet & interior window cleaning, and event cleanup from Berkland.",
        "specialty.html", ""
    ),
    "specialized.html": (
        "Embassy & Diplomatic Facility Cleaning | Berkland Cleaning",
        "Embassy and diplomatic facility cleaning in Washington DC. Confidential, protocol-driven service for diplomatic residences, chanceries and consulates from Berkland.",
        "specialized.html", ""
    ),
    "areas.html": (
        "Cleaning Service Areas — Washington DC, Maryland & Northern Virginia | Berkland Cleaning",
        "Berkland cleaning service areas: Washington DC, Montgomery, Prince George's, Howard, Frederick & Anne Arundel Counties in Maryland, and Fairfax, Arlington, Alexandria & more in Northern Virginia.",
        "areas.html", ""
    ),
    "about.html": (
        "About Berkland Cleaning Services",
        "About Berkland Cleaning Services — a full-service residential, commercial and specialty cleaning company serving Washington DC, Maryland and Northern Virginia.",
        "about.html", ""
    ),
}

def build_page(filename, title, desc, canonical, extra_script):
    with open(os.path.join(CONTENT, filename)) as f:
        body = f.read()
    head = HEAD.replace("{{TITLE}}", title).replace("{{META_DESC}}", desc).replace("{{CANONICAL}}", canonical)
    footer = FOOTER.replace("{{PAGE_SCRIPT}}", extra_script)
    html = head + "\n" + HEADER + "\n" + body + "\n" + footer + "\n</body>\n</html>\n"
    out_path = os.path.join(ROOT, filename)
    with open(out_path, "w") as f:
        f.write(html)
    print(f"  built {filename}  ({len(html):,} bytes)")

def build_sitemap():
    urls = "\n".join(
        f"  <url><loc>https://berklandcleaning.com/{p}</loc></url>"
        for p in PAGES
    )
    sitemap = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>\n'
    with open(os.path.join(ROOT, "sitemap.xml"), "w") as f:
        f.write(sitemap)
    with open(os.path.join(ROOT, "robots.txt"), "w") as f:
        f.write("User-agent: *\nAllow: /\nSitemap: https://berklandcleaning.com/sitemap.xml\n")
    print("  built sitemap.xml + robots.txt")

if __name__ == "__main__":
    print("Building Berkland static site...")
    for filename, (title, desc, canonical, script) in PAGES.items():
        build_page(filename, title, desc, canonical, script)
    build_sitemap()
    print("Done. Output is in the repo root, ready for GitHub Pages.")

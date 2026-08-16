// build-projects.js
// Converts content/projects/*.md (written by Decap CMS) into data/projects.json
// (consumed by renderProjects() in the browser).

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const CONTENT_DIR = path.join(__dirname, 'content', 'projects');
const OUTPUT_FILE = path.join(__dirname, 'data', 'projects.json');

function buildProjects() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.warn(`No content directory found at ${CONTENT_DIR} — writing empty projects.json`);
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, '[]');
    return;
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

  const projects = files.map(filename => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf8');
    const { data } = matter(raw);

    if (!data.slug) {
      console.warn(`Warning: ${filename} has no slug field — skipping`);
      return null;
    }

    return data;
  }).filter(Boolean);

  projects.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(projects, null, 2));

  console.log(`Wrote ${projects.length} project(s) to ${OUTPUT_FILE}`);
}

buildProjects();
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { MARKETING_SEO } from '../src/features/marketing/seo-pages.js';

const distDirectory = path.resolve('dist');
const template = await readFile(path.join(distDirectory, 'index.html'), 'utf8');
const pages = Object.values(MARKETING_SEO);

const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
const replaceRequired = (html, expression, replacement, field) => {
  if (!expression.test(html)) throw new Error(`No se encontró ${field} en dist/index.html`);
  return html.replace(expression, replacement);
};

for (const page of pages) {
  const canonical = page.canonical;
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  let html = template;

  html = replaceRequired(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, 'title');
  html = replaceRequired(html, /<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`, 'description');
  html = replaceRequired(html, /<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`, 'canonical');
  html = replaceRequired(html, /<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`, 'og:url');
  html = replaceRequired(html, /<meta property="og:title" content="[\s\S]*?"\s*\/>/, `<meta property="og:title" content="${title}" />`, 'og:title');
  html = replaceRequired(html, /<meta property="og:description" content="[\s\S]*?"\s*\/>/, `<meta property="og:description" content="${description}" />`, 'og:description');
  html = replaceRequired(html, /<meta name="twitter:title" content="[\s\S]*?"\s*\/>/, `<meta name="twitter:title" content="${title}" />`, 'twitter:title');
  html = replaceRequired(html, /<meta name="twitter:description" content="[\s\S]*?"\s*\/>/, `<meta name="twitter:description" content="${description}" />`, 'twitter:description');

  const pageDirectory = path.join(distDirectory, page.path);
  await mkdir(pageDirectory, { recursive: true });
  await writeFile(path.join(pageDirectory, 'index.html'), html);
}

console.log(`Prerendered SEO metadata for ${pages.length} marketing routes.`);

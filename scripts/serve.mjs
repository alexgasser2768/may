/**
 * Petit serveur de développement, sans dépendance.
 *   npm run dev    → construit, sert dist/ sur http://localhost:4321 et reconstruit à chaque modification
 *   npm run serve  → sert dist/ tel quel
 * Répond aussi aux envois du formulaire en mode démonstration (POST merci.html) sans rien stocker.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { networkInterfaces } from 'node:os';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(RACINE, 'dist');
const PORT = Number(process.env.PORT) || 4321;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.avif': 'image/avif', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };

const construire = () => spawnSync(process.execPath, [join(RACINE, 'scripts/build.mjs')], { stdio: 'inherit' }).status === 0;

if (process.argv.includes('--watch')) {
  construire();
  let minuterie;
  for (const d of ['contenu', 'src']) {
    watch(join(RACINE, d), { recursive: true }, () => {
      clearTimeout(minuterie);
      minuterie = setTimeout(() => { console.log('\n↻ Modification détectée, reconstruction…'); construire(); }, 150);
    });
  }
}

createServer(async (req, res) => {
  let chemin = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (chemin.endsWith('/')) chemin += 'index.html';
  if (req.method === 'POST') chemin = '/merci.html'; // démonstration : données ignorées
  const fichier = normalize(join(DIST, chemin));
  if (!fichier.startsWith(DIST)) { res.writeHead(403).end(); return; }
  try {
    let corps = await readFile(fichier);
    const type = TYPES[extname(fichier)] || 'application/octet-stream';
    const entetes = { 'Content-Type': type, 'Cache-Control': 'no-cache' };
    if (/gzip/.test(req.headers['accept-encoding'] || '') && !/woff2|avif|webp|jpg|png/.test(type)) {
      corps = gzipSync(corps);
      entetes['Content-Encoding'] = 'gzip';
    }
    res.writeHead(200, entetes).end(corps);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Page introuvable');
  }
}).listen(PORT, () => {
  // Adresses du réseau local : pour tester sur un téléphone connecté au même Wi-Fi.
  const reseau = Object.values(networkInterfaces()).flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal && !/^172\.(1[6-9]|2\d|3[01])\./.test(i.address))
    .map((i) => `http://${i.address}:${PORT}`);
  console.log(`\n→ Site disponible sur http://localhost:${PORT}`);
  if (reseau.length) console.log(`→ Sur le téléphone (même Wi-Fi) : ${reseau.join('  ')}`);
  console.log('');
});

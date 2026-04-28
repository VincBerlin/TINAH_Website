import { statSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const KB = 1024;
const MB = 1024 * KB;

const errors = [];

function assertMaxSize(path, maxBytes, label) {
  const size = statSync(path).size;
  if (size > maxBytes) {
    errors.push(`${label} ist zu groß: ${(size / MB).toFixed(2)} MB > ${(maxBytes / MB).toFixed(2)} MB (${path})`);
  } else {
    console.log(`✅ ${label}: ${(size / MB).toFixed(2)} MB`);
  }
}

function checkBuildBudgets() {
  const dir = 'dist/assets';
  const files = readdirSync(dir);
  const jsFiles = files.filter((f) => f.endsWith('.js'));
  const cssFiles = files.filter((f) => f.endsWith('.css'));

  const jsSizes = jsFiles.map((f) => ({ file: f, size: statSync(join(dir, f)).size }));
  const cssSizes = cssFiles.map((f) => ({ file: f, size: statSync(join(dir, f)).size }));

  const maxJs = jsSizes.reduce((a, b) => (a.size > b.size ? a : b), { file: '', size: 0 });
  const totalJs = jsSizes.reduce((sum, f) => sum + f.size, 0);
  const totalCss = cssSizes.reduce((sum, f) => sum + f.size, 0);

  const MAX_MAIN_JS = 300 * KB;
  const MAX_TOTAL_JS = 360 * KB;
  const MAX_TOTAL_CSS = 120 * KB;

  if (maxJs.size > MAX_MAIN_JS) {
    errors.push(`Größtes JS-Bundle zu groß: ${maxJs.file} ${(maxJs.size / KB).toFixed(1)} KB > ${(MAX_MAIN_JS / KB).toFixed(1)} KB`);
  } else {
    console.log(`✅ Größtes JS-Bundle: ${maxJs.file} ${(maxJs.size / KB).toFixed(1)} KB`);
  }

  if (totalJs > MAX_TOTAL_JS) {
    errors.push(`Gesamtes JS zu groß: ${(totalJs / KB).toFixed(1)} KB > ${(MAX_TOTAL_JS / KB).toFixed(1)} KB`);
  } else {
    console.log(`✅ Gesamt-JS: ${(totalJs / KB).toFixed(1)} KB`);
  }

  if (totalCss > MAX_TOTAL_CSS) {
    errors.push(`Gesamtes CSS zu groß: ${(totalCss / KB).toFixed(1)} KB > ${(MAX_TOTAL_CSS / KB).toFixed(1)} KB`);
  } else {
    console.log(`✅ Gesamt-CSS: ${(totalCss / KB).toFixed(1)} KB`);
  }
}

function checkCriticalMedia() {
  // Kritische Above-the-fold Assets der Hero-Experience.
  assertMaxSize('public/images/hiru.mp4', 12 * MB, 'Hero-Video (Desktop)');
  assertMaxSize('public/images/hiru-poster.jpg', 500 * KB, 'Hero-Poster');
}

function checkHeroPerfHints() {
  const heroFiles = ['src/sections/Hero.tsx', 'subseite_location/src/sections/Hero.tsx'];
  for (const file of heroFiles) {
    const code = readFileSync(file, 'utf8');
    if (!code.includes('preload="metadata"')) {
      errors.push(`${file} fehlt preload=\"metadata\" beim Hero-Video`);
    } else {
      console.log(`✅ ${file}: preload=\"metadata\" vorhanden`);
    }
  }
}

checkBuildBudgets();
checkCriticalMedia();
checkHeroPerfHints();

if (errors.length) {
  console.error('\n❌ Performance-Guard fehlgeschlagen:');
  for (const e of errors) {
    console.error(` - ${e}`);
  }
  process.exit(1);
}

console.log('\n✅ Performance-Guard erfolgreich.');

// Réduit Mona Sans (variable, axes graisse + largeur) au latin utile pour le français.
// Usage : npm run font:subset
import { readFile, writeFile } from 'node:fs/promises';
import subsetFont from 'subset-font';

const SRC = new URL('../node_modules/@fontsource-variable/mona-sans/files/mona-sans-latin-wdth-normal.woff2', import.meta.url);
const OUT = new URL('../src/assets/fonts/mona-sans-vf.woff2', import.meta.url);

const ascii = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('');
const french = 'àâäæçéèêëîïôöœùûüÿÀÂÄÆÇÉÈÊËÎÏÔÖŒÙÛÜŸ';
const punctuation = '«»‹›‘’‚“”„–—…·•€×÷±≈≠≤≥→←↑↓↗↘↵⇧°§©®™№  ';
const text = ascii + french + punctuation;

const source = await readFile(SRC);
const subset = await subsetFont(source, text, {
	targetFormat: 'woff2',
	variationAxes: { wght: { min: 350, max: 850 }, wdth: { min: 75, max: 100 } },
});
await writeFile(OUT, subset);
console.log(`[font] ${source.length} → ${subset.length} octets (${(subset.length / 1024).toFixed(1)} Ko)`);

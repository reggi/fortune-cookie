// Generate additional file formats from the source text file

import {readFile, writeFile} from 'node:fs/promises';

const LF = '\n';
const textEncoding = {encoding: 'utf-8'};

/**
 * Ensure uniform file names
 *
 * @param {string} suffix
 * @returns {string}
 */
function getFileName (suffix) {
  return `fortune-cookies${suffix}`;
}

/**
 * @param {string} str
 * @returns {string}
 */
function appendFinalNewline (str) {
  return `${str.trimEnd()}${LF}`;
}

/**
 * @param {string} fileNameSuffix
 * @param {string} str
 * @returns {Promise<void>}
 */
function writeTextFile (fileNameSuffix, str) {
  return writeFile(
    getFileName(fileNameSuffix),
    appendFinalNewline(str),
    textEncoding,
  );
}

/**
 * Returns a new, filtered array of deduplicated strings. When determining
 * duplicates, the string comparison algorithm ignores:
 * - letter case
 * - non-word characters (punctuation, etc.)
 *
 * @param {string[]} array
 * @returns {string[]}
 */
function removeDuplicates (array) {
  const set = new Set();
  const regexpNotAWord = /\W/g;

  return array.filter(str => {
    const simplified = str
      // Ignore letter case
      .toLowerCase()
      // Ignore non-word characters
      .replaceAll(regexpNotAWord, '');

    const keep = !set.has(simplified);
    set.add(simplified);
    return keep;
  });
}

/**
 * @param {string} str
 * @returns {string[]}
 */
function parseFortunes (str) {
  return str.split(LF)
    // Trim surrounding whitespace
    .map(line => line.trim())
    // Remove empty lines
    .filter(Boolean);
}

const fortunes = parseFortunes(
  await readFile(getFileName('.txt'), textEncoding),
);

// Source text file: rewrite to ensure uniform whitespace
await writeTextFile('.txt', fortunes.join(LF));

// Markdown file: Format as list
await writeTextFile(
  '.md',
  removeDuplicates(fortunes).map(line => `* ${line}`).join(LF),
);

// JSON file: with whitespace for readability
const fortunesJson = JSON.stringify(removeDuplicates(fortunes), null, 2);
await writeTextFile('.json', fortunesJson);

// ESM file: this is for stability until (JSON) import assertsions are stabilized
const esmSource = `export default ${fortunesJson};`;
await writeTextFile('.mjs', esmSource);

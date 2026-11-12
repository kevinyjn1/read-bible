// Generates everything under data/ from public-domain source texts.
//
//   node scripts/build-data.mjs
//
// Sources are downloaded once into .cache/ and reused afterwards.
//   Korean:  개역한글 (KRV, 1961)           - github.com/thiagobodruk/bible
//   English: Berean Standard Bible (BSB) - ebible.org/details.php?id=engbsb
// The BSB also supplies the section and paragraph boundaries that decide
// where a reading may end. Requires the `unzip` command.

import { mkdir, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOKS, STAGES } from './books.mjs';
import { planChapters } from './plan.mjs';
import { parseUsfm } from './usfm.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, '.cache');
const DATA = join(ROOT, 'data');

const KO_URL = 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/ko_krv.json';
const EN_URL = 'https://ebible.org/Scriptures/engbsb_usfm.zip';

// USFM book codes in the same (canonical) order as BOOKS.
const USFM_CODES = ('GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG '
  + 'ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO '
  + 'GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV').split(' ');

async function download(name, url) {
  const file = join(CACHE, name);
  if (!existsSync(file)) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    await mkdir(CACHE, { recursive: true });
    await writeFile(file, Buffer.from(await response.arrayBuffer()));
  }
  return file;
}

const clean = (text) => text.replace(/\s+/g, ' ').trim();

async function loadKorean() {
  const text = await readFile(await download('ko_krv.json', KO_URL), 'utf8');
  const books = new Map(JSON.parse(text.replace(/^﻿/, '')).map((book) => [book.abbrev, book]));
  return (book) => books.get(book.src).chapters.map((chapter) => chapter.map(clean));
}

async function loadEnglish() {
  const zip = await download('engbsb_usfm.zip', EN_URL);
  const folder = join(CACHE, 'engbsb_usfm');
  if (!existsSync(folder)) execFileSync('unzip', ['-q', '-o', zip, '-d', folder]);
  const files = await readdir(folder);
  return async (book) => {
    const code = USFM_CODES[BOOKS.indexOf(book)];
    const file = files.find((name) => name.endsWith(`${code}engbsb.usfm`));
    if (!file) throw new Error(`No USFM file for ${book.id} (${code})`);
    return parseUsfm(await readFile(join(folder, file), 'utf8'));
  };
}

async function main() {
  const korean = await loadKorean();
  const english = await loadEnglish();

  await rm(DATA, { recursive: true, force: true });
  await mkdir(join(DATA, 'ko'), { recursive: true });
  await mkdir(join(DATA, 'en'), { recursive: true });

  const texts = new Map(); // id -> { ko, en, breaks }
  for (const book of BOOKS) {
    const ko = korean(book);
    const { chapters: en, breaks } = await english(book);
    if (ko.length !== en.length) throw new Error(`${book.id}: chapter count differs (${ko.length} vs ${en.length})`);
    texts.set(book.id, { ko, en, breaks });
    await writeFile(join(DATA, 'ko', `${book.id}.json`), JSON.stringify(ko));
    await writeFile(join(DATA, 'en', `${book.id}.json`), JSON.stringify(en));
  }

  const bookIndex = new Map(BOOKS.map((book, i) => [book.id, i]));
  const days = [];
  const stages = [];
  const covered = new Map(BOOKS.map((book) => [book.id, new Set()]));

  for (const stage of STAGES) {
    const start = days.length;
    for (const item of stage.items) {
      const [id, first, last] = Array.isArray(item) ? item : [item, 1, texts.get(item).ko.length];
      const { ko, breaks } = texts.get(id);
      const chapters = [];
      for (let chapter = first; chapter <= last; chapter++) {
        if (covered.get(id).has(chapter)) throw new Error(`${id} ${chapter} appears twice in the plan`);
        covered.get(id).add(chapter);
        chapters.push({
          chapter,
          lengths: ko[chapter - 1].map((verse) => verse.length),
          breaks: breaks[chapter - 1],
        });
      }
      for (const range of planChapters(chapters)) days.push([bookIndex.get(id), ...range]);
    }
    const { items, ...meta } = stage;
    stages.push({ ...meta, start, count: days.length - start });
  }

  for (const book of BOOKS) {
    const missing = texts.get(book.id).ko.length - covered.get(book.id).size;
    if (missing) throw new Error(`${book.id}: ${missing} chapters are not in the plan`);
  }

  // Verse counts per chapter, so references can be written without loading the text.
  const books = BOOKS.map(({ src, ...book }) => ({
    ...book,
    verses: {
      ko: texts.get(book.id).ko.map((chapter) => chapter.length),
      en: texts.get(book.id).en.map((chapter) => chapter.length),
    },
  }));
  await writeFile(join(DATA, 'plan.json'), JSON.stringify({ books, stages, days }));
  console.log(`${days.length} readings in ${stages.length} stages (${(days.length / 365).toFixed(1)} years)`);
}

await main();

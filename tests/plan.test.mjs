import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { splitChapter, planChapters, MAX } from '../scripts/plan.mjs';
import { parseUsfm } from '../scripts/usfm.mjs';
import { slicePassage } from '../js/core.js';

const none = { sections: new Set(), paragraphs: new Set() };

test('splitChapter prefers a nearby section boundary', () => {
  const lengths = Array(40).fill(65); // 2600 characters, so two parts, ideal cut before verse 21
  assert.deepEqual(splitChapter(lengths, none), [1, 21]);
  assert.deepEqual(splitChapter(lengths, { sections: new Set([18]), paragraphs: new Set([20]) }), [1, 18]);
  assert.deepEqual(splitChapter(lengths, { sections: new Set([4]), paragraphs: new Set([20]) }), [1, 20]);
});

test('planChapters groups short chapters and splits long ones', () => {
  const chapter = (number, size) => ({ chapter: number, lengths: Array(size / 50).fill(50), breaks: none });
  const days = planChapters([chapter(1, 500), chapter(2, 600), chapter(3, 1000), chapter(4, 3000), chapter(5, 200)]);
  assert.deepEqual(days[0], [1, 1, 2, 0]);
  assert.deepEqual(days[1], [3, 1, 3, 0]);
  assert.deepEqual(days.slice(2, 4), [[4, 1, 4, 30], [4, 31, 4, 0]]);
  assert.deepEqual(days[4], [5, 1, 5, 0]);
});

test('parseUsfm reads verses and boundaries', () => {
  const { chapters, breaks } = parseUsfm([
    '\\id MRK',
    '\\c 1',
    '\\s1 A heading',
    '\\m',
    '\\v 1 \\w In|strong="G1"\\w* the beginning.\\f + \\fr 1:1 \\ft a note\\f*',
    '\\v 2 Second',
    '\\q1 line continues,',
    '\\b',
    '\\m',
    '\\v 3 Third verse.',
    '\\s1 Next',
    '\\v 4 Fourth.',
  ].join('\n'));
  assert.deepEqual(chapters, [['In the beginning.', 'Second line continues,', 'Third verse.', 'Fourth.']]);
  assert.deepEqual([...breaks[0].sections], [1, 4]);
  assert.deepEqual([...breaks[0].paragraphs], [3]);
});

// ---------- the generated data ----------

const load = (path) => JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), 'utf8'));
const plan = load('plan.json');
const text = { ko: new Map(), en: new Map() };
for (const book of plan.books) {
  text.ko.set(book.id, load(`ko/${book.id}.json`));
  text.en.set(book.id, load(`en/${book.id}.json`));
}

test('the plan has 66 books and stages that cover every reading once', () => {
  assert.equal(plan.books.length, 66);
  let expectedStart = 0;
  for (const stage of plan.stages) {
    assert.equal(stage.start, expectedStart);
    assert.ok(stage.count > 0);
    expectedStart += stage.count;
  }
  assert.equal(expectedStart, plan.days.length);
});

test('the plan covers every Korean verse exactly once', () => {
  const seen = new Set();
  for (const day of plan.days) {
    const id = plan.books[day[0]].id;
    for (const part of slicePassage(text.ko.get(id), day)) {
      for (const verse of part.verses) {
        const key = `${id} ${part.chapter}:${verse.number}`;
        assert.ok(!seen.has(key), `${key} appears twice`);
        seen.add(key);
      }
    }
  }
  let total = 0;
  for (const chapters of text.ko.values()) for (const chapter of chapters) total += chapter.length;
  assert.equal(seen.size, total);
});

test('every reading is short and has text in both languages', () => {
  plan.days.forEach((day, index) => {
    const id = plan.books[day[0]].id;
    for (const lang of ['ko', 'en']) {
      const verses = slicePassage(text[lang].get(id), day).flatMap((part) => part.verses);
      const length = verses.reduce((sum, verse) => sum + verse.text.length, 0);
      assert.ok(length > 0, `reading ${index + 1} is empty in ${lang}`);
      if (lang === 'ko') assert.ok(length <= MAX * 1.25, `reading ${index + 1} is too long (${length})`);
    }
  });
});

test('the texts contain no leftover markup', () => {
  for (const lang of ['ko', 'en']) {
    for (const [id, chapters] of text[lang]) {
      chapters.forEach((chapter, c) => chapter.forEach((verse, v) => {
        assert.ok(!/[\\|]|\s{2}|^\s|\s$/.test(verse), `${lang} ${id} ${c + 1}:${v + 1}: ${verse}`);
      }));
    }
  }
});

test('verse counts in the plan match the texts', () => {
  for (const book of plan.books) {
    for (const lang of ['ko', 'en']) {
      assert.deepEqual(book.verses[lang], text[lang].get(book.id).map((chapter) => chapter.length));
    }
  }
});

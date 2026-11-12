// Pure logic: dates, streaks, references, and slicing passages.
// No DOM access here, so everything in this file is unit tested.

const DAY_MS = 86_400_000;

/** Local calendar date as YYYY-MM-DD. */
export function dateKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Days since the epoch for a YYYY-MM-DD key (time zone independent). */
export function dayNumber(key) {
  const [year, month, day] = key.split('-').map(Number);
  return Math.round(Date.UTC(year, month - 1, day) / DAY_MS);
}

/** The YYYY-MM-DD key `offset` days away from `key`. */
export function shiftKey(key, offset) {
  const date = new Date((dayNumber(key) + offset) * DAY_MS);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

/**
 * Streak statistics.
 * The current streak stays alive through today: it only resets once a full
 * calendar day has passed without a reading.
 * @param {Iterable<string>} dates - YYYY-MM-DD keys of days with a reading
 * @param {string} today - YYYY-MM-DD
 */
export function streakStats(dates, today) {
  const days = [...new Set([...dates].map(dayNumber))].sort((a, b) => a - b);
  const set = new Set(days);
  const now = dayNumber(today);

  let longest = 0;
  let run = 0;
  let previous = null;
  for (const day of days) {
    run = previous !== null && day === previous + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = day;
  }

  const readToday = set.has(now);
  let current = 0;
  for (let day = readToday ? now : now - 1; set.has(day); day--) current++;

  return { current, longest, total: days.length, readToday };
}

/** The 7 date keys (Sunday to Saturday) of the week containing `today`. */
export function weekKeys(today) {
  const weekday = new Date(dayNumber(today) * DAY_MS).getUTCDay();
  return Array.from({ length: 7 }, (_, i) => shiftKey(today, i - weekday));
}

/** Index of the first reading that is not done yet, or -1 when all are done. */
export function nextUnread(done, total) {
  for (let i = 0; i < total; i++) if (!(i in done)) return i;
  return -1;
}

/** Index of the stage that contains reading `index`. */
export function stageOf(stages, index) {
  return stages.findIndex((stage) => index >= stage.start && index < stage.start + stage.count);
}

/**
 * Human readable reference for a reading, for example "마가복음 1:1-24" or "Psalms 1-3".
 * @param {object} book - entry from plan.books
 * @param {number[]} day - [bookIndex, firstChapter, firstVerse, lastChapter, lastVerse]
 * @param {'ko'|'en'} lang
 */
export function formatReference(book, day, lang) {
  const [, c1, v1, c2, v2] = day;
  const whole = v1 === 1 && v2 === 0;
  if (!whole) {
    const last = v2 || book.verses[lang][c1 - 1];
    return `${book[lang]} ${c1}:${v1}-${last}`;
  }
  const chapters = c1 === c2 ? `${c1}` : `${c1}-${c2}`;
  if (lang === 'ko') return `${book.ko} ${chapters}${book.id === 'psalms' ? '편' : '장'}`;
  const name = book.id === 'psalms' && c1 === c2 ? 'Psalm' : book.en;
  return `${name} ${chapters}`;
}

/**
 * Cut a reading out of a book.
 * @param {string[][]} chapters - the whole book
 * @param {number[]} day - [bookIndex, firstChapter, firstVerse, lastChapter, lastVerse]
 * @returns {{chapter: number, verses: {number: number, text: string}[]}[]}
 */
export function slicePassage(chapters, day) {
  const [, c1, v1, c2, v2] = day;
  const result = [];
  for (let chapter = c1; chapter <= c2; chapter++) {
    const all = chapters[chapter - 1] ?? [];
    const first = chapter === c1 ? v1 : 1;
    const last = chapter === c2 && v2 ? Math.min(v2, all.length) : all.length;
    const verses = [];
    for (let number = first; number <= last; number++) {
      verses.push({ number, text: all[number - 1] ?? '' });
    }
    result.push({ chapter, verses });
  }
  return result;
}

/** Estimated reading time in minutes. */
export function readingMinutes(passage, lang) {
  const text = passage.flatMap((part) => part.verses.map((verse) => verse.text)).join(' ');
  const minutes = lang === 'ko' ? text.replace(/\s/g, '').length / 230 : text.split(/\s+/).length / 150;
  return Math.max(1, Math.round(minutes));
}

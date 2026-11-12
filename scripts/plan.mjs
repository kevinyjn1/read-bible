// Cuts the Bible into short daily readings.
//
// A reading is always a contiguous range inside one book. Short chapters are
// grouped together, long chapters are split at section or paragraph boundaries
// so a reading does not stop in the middle of a story when it can be avoided.

/** Target length of one reading, in Korean characters (about 5 minutes). */
export const TARGET = 1300;
/** A chapter (or group of chapters) up to this length stays in one reading. */
export const MAX = Math.round(TARGET * 1.3);
/** Extra distance charged for cutting at a paragraph instead of a section. */
const PARAGRAPH_PENALTY = TARGET * 0.2;
/** Extra distance charged for cutting in the middle of a paragraph. */
const MID_PARAGRAPH_PENALTY = TARGET * 0.45;

/**
 * Split one long chapter into parts.
 * Each cut lands as close as possible to an even split, but a section
 * boundary nearby wins over a paragraph boundary, which wins over any verse.
 * @param {number[]} lengths - length of each verse
 * @param {{sections: Set<number>, paragraphs: Set<number>}} breaks - verse
 *   numbers (1-based) that begin a section or a paragraph
 * @returns {number[]} first verse (1-based) of every part, starting with 1
 */
export function splitChapter(lengths, breaks) {
  const total = lengths.reduce((a, b) => a + b, 0);
  const parts = Math.max(2, Math.round(total / TARGET));
  const before = [0]; // before[i] = characters before verse i+1
  for (const len of lengths) before.push(before[before.length - 1] + len);

  const starts = [1];
  for (let k = 1; k < parts; k++) {
    const ideal = (total * k) / parts;
    const previous = starts[starts.length - 1];
    let best = 0;
    let bestCost = Infinity;
    for (let verse = previous + 1; verse <= lengths.length; verse++) {
      let cost = Math.abs(before[verse - 1] - ideal);
      if (breaks.sections.has(verse)) cost += 0;
      else if (breaks.paragraphs.has(verse)) cost += PARAGRAPH_PENALTY;
      else cost += MID_PARAGRAPH_PENALTY;
      if (cost < bestCost) {
        bestCost = cost;
        best = verse;
      }
    }
    if (best) starts.push(best);
  }
  return starts;
}

/**
 * Build the readings for a run of chapters in one book.
 * @param {{chapter: number, lengths: number[], breaks: {sections: Set<number>, paragraphs: Set<number>}}[]} chapters
 * @returns {[number, number, number, number][]} [firstChapter, firstVerse, lastChapter, lastVerse]
 *   where lastVerse 0 means "to the end of the chapter".
 */
export function planChapters(chapters) {
  const days = [];
  let group = null; // whole chapters waiting to be emitted together

  const flush = () => {
    if (group) days.push([group.first, 1, group.last, 0]);
    group = null;
  };

  for (const { chapter, lengths, breaks } of chapters) {
    const size = lengths.reduce((a, b) => a + b, 0);
    if (size > MAX) {
      flush();
      const starts = splitChapter(lengths, breaks);
      starts.forEach((start, i) => {
        const isLast = i === starts.length - 1;
        days.push([chapter, start, chapter, isLast ? 0 : starts[i + 1] - 1]);
      });
    } else if (group && group.size + size <= MAX) {
      group.last = chapter;
      group.size += size;
    } else {
      flush();
      group = { first: chapter, last: chapter, size };
    }
  }
  flush();
  return days;
}

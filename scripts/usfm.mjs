// Minimal USFM reader for the Berean Standard Bible files from ebible.org.

/** Markers whose line is a heading or note, not Bible text. */
const NON_TEXT = new Set(['id', 'h', 'toc1', 'toc2', 'mt1', 'r', 'mr', 'd', 'qa', 'ms1', 's1', 's2']);
/** Markers that begin a new section. */
const SECTION = new Set(['s1', 's2', 'ms1']);
/** Markers that begin a new paragraph. */
const PARAGRAPH = new Set(['m', 'pmo', 'pc', 'b']);

/** Remove footnotes and inline markup from a piece of USFM text. */
export function plainText(usfm) {
  return usfm
    .replace(/\\f .*?\\f\*/g, '')
    .replace(/\\w (.*?)\|[^\\]*\\w\*/g, '$1')
    .replace(/\\[a-z]+\d?\*?/g, '');
}

const clean = (text) => text.replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim();

/**
 * @param {string} source - one USFM book
 * @returns {{
 *   chapters: string[][],
 *   breaks: {sections: Set<number>, paragraphs: Set<number>}[]
 * }} the verses of every chapter, and for every chapter the verse numbers
 *   (1-based) at which a section or a paragraph begins
 */
export function parseUsfm(source) {
  const chapters = [];
  const breaks = [];
  let chapter = -1;
  let verse = -1;
  let pending = null; // 'section' or 'paragraph' when the next verse opens one

  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^\\([a-z]+\d?)\s*(.*)$/);
    if (!match) continue;
    const [, marker, rest] = match;

    if (marker === 'c') {
      chapter = Number.parseInt(rest, 10) - 1;
      verse = -1;
      chapters[chapter] = [];
      breaks[chapter] = { sections: new Set(), paragraphs: new Set() };
      continue;
    }
    if (SECTION.has(marker)) pending = 'section';
    else if (PARAGRAPH.has(marker) && pending !== 'section') pending = 'paragraph';
    if (NON_TEXT.has(marker) || chapter < 0) continue;

    // A text line can continue the current verse and can start new ones.
    const pieces = (marker === 'v' ? `\\v ${rest}` : rest).split(/\\v\s+/);
    pieces.forEach((piece, i) => {
      let body = piece;
      if (i > 0) {
        const number = Number.parseInt(piece, 10);
        verse = number - 1;
        body = piece.replace(/^\d+\s*/, '');
        if (pending === 'section') breaks[chapter].sections.add(number);
        if (pending === 'paragraph') breaks[chapter].paragraphs.add(number);
        pending = null;
      }
      const text = plainText(body);
      if (verse < 0 || !text.trim()) return;
      // More text for the verse we are already in: a pending break is mid-verse, drop it.
      if (i === 0) pending = null;
      chapters[chapter][verse] = `${chapters[chapter][verse] ?? ''} ${text}`;
    });
  }

  return {
    chapters: chapters.map((verses) => Array.from(verses, (text) => clean(text ?? ''))),
    breaks,
  };
}

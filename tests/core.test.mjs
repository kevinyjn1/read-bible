import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dateKey, shiftKey, streakStats, weekKeys, nextUnread, stageOf,
  formatReference, slicePassage, readingMinutes,
} from '../js/core.js';

test('dateKey uses the local calendar date', () => {
  assert.equal(dateKey(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
  assert.equal(dateKey(new Date(2026, 10, 12, 0, 0)), '2026-11-12');
});

test('shiftKey crosses month, year and leap day boundaries', () => {
  assert.equal(shiftKey('2026-03-01', -1), '2026-02-28');
  assert.equal(shiftKey('2028-03-01', -1), '2028-02-29');
  assert.equal(shiftKey('2026-12-31', 1), '2027-01-01');
});

test('streak is zero with no readings', () => {
  assert.deepEqual(streakStats([], '2026-11-12'), { current: 0, longest: 0, total: 0, readToday: false });
});

test('streak counts consecutive days ending today', () => {
  const stats = streakStats(['2026-11-10', '2026-11-11', '2026-11-12'], '2026-11-12');
  assert.deepEqual(stats, { current: 3, longest: 3, total: 3, readToday: true });
});

test('streak stays alive when today is not read yet', () => {
  const stats = streakStats(['2026-11-10', '2026-11-11'], '2026-11-12');
  assert.equal(stats.current, 2);
  assert.equal(stats.readToday, false);
});

test('streak resets after a missed day but keeps the longest run', () => {
  const stats = streakStats(['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-10'], '2026-11-12');
  assert.deepEqual(stats, { current: 0, longest: 3, total: 4, readToday: false });
});

test('several readings on one day count as one day', () => {
  const stats = streakStats(['2026-11-12', '2026-11-12', '2026-11-11'], '2026-11-12');
  assert.deepEqual(stats, { current: 2, longest: 2, total: 2, readToday: true });
});

test('streak runs across a year boundary', () => {
  assert.equal(streakStats(['2026-12-30', '2026-12-31', '2027-01-01'], '2027-01-01').current, 3);
});

test('weekKeys returns Sunday to Saturday around today', () => {
  assert.deepEqual(weekKeys('2026-11-12'), [
    '2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14',
  ]);
  assert.equal(weekKeys('2026-11-08')[0], '2026-11-08');
  assert.equal(weekKeys('2026-11-14')[6], '2026-11-14');
});

test('nextUnread finds the first gap', () => {
  assert.equal(nextUnread({}, 3), 0);
  assert.equal(nextUnread({ 0: 'x', 1: 'x' }, 3), 2);
  assert.equal(nextUnread({ 0: 'x', 2: 'x' }, 3), 1);
  assert.equal(nextUnread({ 0: 'x', 1: 'x', 2: 'x' }, 3), -1);
});

test('stageOf locates a reading', () => {
  const stages = [{ start: 0, count: 2 }, { start: 2, count: 3 }];
  assert.equal(stageOf(stages, 0), 0);
  assert.equal(stageOf(stages, 2), 1);
  assert.equal(stageOf(stages, 4), 1);
});

const mark = { id: 'mark', ko: '마가복음', en: 'Mark', verses: { ko: [45, 28], en: [45, 28] } };
const psalms = { id: 'psalms', ko: '시편', en: 'Psalms', verses: { ko: [6, 12, 8], en: [6, 12, 8] } };

test('formatReference handles partial chapters', () => {
  assert.equal(formatReference(mark, [0, 1, 1, 1, 20], 'ko'), '마가복음 1:1-20');
  assert.equal(formatReference(mark, [0, 1, 21, 1, 0], 'en'), 'Mark 1:21-45');
});

test('formatReference handles whole chapters', () => {
  assert.equal(formatReference(mark, [0, 2, 1, 2, 0], 'ko'), '마가복음 2장');
  assert.equal(formatReference(mark, [0, 1, 1, 2, 0], 'en'), 'Mark 1-2');
  assert.equal(formatReference(psalms, [0, 1, 1, 3, 0], 'ko'), '시편 1-3편');
  assert.equal(formatReference(psalms, [0, 2, 1, 2, 0], 'en'), 'Psalm 2');
  assert.equal(formatReference(psalms, [0, 1, 1, 3, 0], 'en'), 'Psalms 1-3');
});

test('slicePassage cuts by chapter and verse', () => {
  const book = [['a1', 'a2', 'a3'], ['b1', 'b2'], ['c1']];
  assert.deepEqual(slicePassage(book, [0, 1, 2, 1, 3]), [
    { chapter: 1, verses: [{ number: 2, text: 'a2' }, { number: 3, text: 'a3' }] },
  ]);
  assert.deepEqual(slicePassage(book, [0, 2, 1, 3, 0]).map((part) => part.verses.length), [2, 1]);
  // An end verse beyond the chapter is clamped (verse counts differ between translations).
  assert.equal(slicePassage(book, [0, 2, 1, 2, 9])[0].verses.length, 2);
});

test('readingMinutes is at least one minute', () => {
  assert.equal(readingMinutes([{ chapter: 1, verses: [{ number: 1, text: '짧다' }] }], 'ko'), 1);
  const long = [{ chapter: 1, verses: [{ number: 1, text: 'word '.repeat(750) }] }];
  assert.equal(readingMinutes(long, 'en'), 5);
});

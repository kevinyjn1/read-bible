# 성경을 읽자 · Read the Bible

하루 5분, 처음 읽는 사람도 차근차근 따라갈 수 있는 성경 읽기 웹사이트입니다.

**사이트: https://kevinyjn1.github.io/read-bible/**

- **오늘의 날짜와 연속 기록** - 며칠째 이어서 읽고 있는지 한눈에 보여 줍니다.
- **하루 5분 분량** - 성경 전체를 1,516번의 짧은 읽기로 나누었습니다. 이야기가 중간에 끊기지 않도록 단락에 맞춰 나눕니다.
- **초보자를 위한 순서** - 창세기부터가 아니라 가장 짧은 복음서인 마가복음에서 시작해, 19단계로 조금씩 넓혀 갑니다.
- **책 소개와 묵상 질문** - 새로운 책을 시작할 때 짧은 소개가, 매일 끝에 생각해 볼 질문이 나옵니다.
- **한국어 / English / 함께 보기** - 개역한글과 Berean Standard Bible을 나란히 읽을 수 있습니다.
- **가입 없음** - 읽기 기록은 내 기기의 브라우저에만 저장됩니다.

휴대폰에서는 브라우저 메뉴의 "홈 화면에 추가"로 앱처럼 쓸 수 있습니다.

---

A Bible reading site for beginners: five minutes a day, with a streak to keep you going.

**Site: https://kevinyjn1.github.io/read-bible/**

- **Date and streak** - see how many days in a row you have read.
- **Five minutes a day** - the whole Bible in 1,516 short readings, cut at section breaks so a story is not interrupted.
- **A beginner-friendly order** - it starts with Mark, the shortest Gospel, and grows through 19 stages.
- **Book intros and reflection questions** - a short intro when a new book begins, and one question after each reading.
- **Korean, English, or both side by side.**
- **No account** - your history stays in your own browser.

## 읽기 순서 · Reading order

| | 단계 | Stage | Books |
|---|---|---|---|
| 1 | 예수님을 만나요 | Meet Jesus | Mark |
| 2 | 모든 것의 시작 | In the Beginning | Genesis |
| 3 | 사랑의 복음 | The Gospel of Love | John |
| 4 | 기도와 지혜 | Prayer and Wisdom | Psalms 1-41, James, Proverbs |
| 5 | 자유를 향하여 | Set Free | Exodus |
| 6 | 교회의 탄생 | The Church Is Born | Acts |
| 7 | 기쁨의 편지들 | Letters of Joy | Philippians, Ephesians, Galatians, Colossians, 1-2 Thessalonians, Philemon |
| 8 | 약속의 땅 | The Promised Land | Joshua, Judges, Ruth |
| 9 | 예수님의 발자취 | In His Steps | Luke |
| 10 | 왕들의 이야기 | The Story of the Kings | 1-2 Samuel, Psalms 42-72, 1-2 Kings |
| 11 | 복음의 깊이 | The Depth of the Gospel | Romans, 1-2 Corinthians |
| 12 | 광야의 학교 | School of the Wilderness | Leviticus, Numbers, Deuteronomy |
| 13 | 약속의 성취 | Promises Fulfilled | Matthew, Hebrews |
| 14 | 삶의 질문들 | Life's Big Questions | Job, Psalms 73-106, Ecclesiastes, Song of Solomon |
| 15 | 포로와 귀환 | Exile and Return | 1-2 Chronicles, Ezra, Nehemiah, Esther, Daniel |
| 16 | 믿음을 지키라 | Keep the Faith | 1-2 Timothy, Titus, 1-2 Peter, 1-3 John, Jude |
| 17 | 선지자들의 외침 | Voices of the Prophets | Isaiah, Jeremiah, Lamentations, Ezekiel |
| 18 | 끝까지 사랑하시는 하나님 | Love That Will Not Let Go | The twelve minor prophets, Psalms 107-150 |
| 19 | 새 하늘과 새 땅 | All Things New | Revelation |

## Development

A static site with no dependencies and no build step for the pages themselves.

```bash
npm start        # serve at http://localhost:4173
npm test         # unit tests and data integrity checks
npm run build:data   # regenerate data/ from the source texts
```

| Path | What it is |
|---|---|
| `index.html`, `css/`, `js/app.js` | The site |
| `js/core.js` | Pure logic: streaks, dates, references (unit tested) |
| `scripts/books.mjs` | Book names, intros, and the reading order. Edit this to change the journey. |
| `scripts/plan.mjs` | Cuts books into 5-minute readings |
| `scripts/build-data.mjs` | Downloads the source texts and writes `data/` |
| `data/` | Generated. Do not edit by hand. |

To change the length of a reading, change `TARGET` in `scripts/plan.mjs` and run `npm run build:data`.
Note that this renumbers the readings, so existing readers' progress would no longer line up.

## Bible texts

Both translations are in the public domain.

- **개역한글 (Korean Revised Version, 1961)** - via [thiagobodruk/bible](https://github.com/thiagobodruk/bible)
- **Berean Standard Bible** - via [eBible.org](https://ebible.org/details.php?id=engbsb). Its section breaks also decide where each reading ends.

Newer Korean translations such as 개역개정 and 새번역 are under copyright, so they cannot be included here.

## License

Code: [MIT](LICENSE). Bible texts: public domain.

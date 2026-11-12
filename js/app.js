import {
  dateKey, streakStats, weekKeys, nextUnread, stageOf,
  formatReference, slicePassage, readingMinutes,
} from './core.js';

const STORAGE_KEY = 'readbible:v1';
const REPO_URL = 'https://github.com/kevinyjn1/read-bible';
const SIZES = [15, 16.5, 18, 20, 22.5];

const TEXT = {
  ko: {
    brand: '성경을 읽자',
    today: '오늘', journey: '여정',
    streakUnit: '일 연속',
    streakStart: '오늘, 첫 걸음을 떼어 보세요',
    streakKeep: '오늘 읽으면 연속 기록이 이어져요',
    streakDone: '오늘도 읽었어요. 내일 또 만나요',
    daysRead: '읽은 날', longest: '최장 연속', progress: '전체 진행',
    dayCount: (n) => `${n}일`,
    weekdays: ['일', '월', '화', '수', '목', '금', '토'],
    day: (n) => `${n}일차`,
    stage: (n) => `${n}단계`,
    minutes: (n) => `약 ${n}분`,
    todaysReading: '오늘의 말씀',
    newStage: '새로운 단계',
    about: (name) => `${name}, 어떤 책인가요?`,
    reflect: '잠깐 생각해 보기',
    questions: [
      '오늘 말씀에서 가장 마음에 남는 구절은 무엇인가요?',
      '이 말씀은 하나님이 어떤 분이라고 알려 주나요?',
      '오늘 하루, 이 말씀을 어떻게 살아 볼 수 있을까요?',
      '새롭게 알게 되었거나 궁금해진 점이 있나요?',
      '이 말씀을 읽고 드리고 싶은 짧은 기도가 있나요?',
    ],
    complete: '읽었어요',
    completed: '읽음',
    undo: '취소',
    doneTitle: '오늘의 읽기 완료',
    doneBody: (n) => (n > 1 ? `${n}일 연속으로 읽고 있어요. 내일 또 만나요.` : '좋은 시작이에요. 내일 또 만나요.'),
    nextUp: '다음 말씀',
    readAhead: '미리 읽기',
    previous: '이전', next: '다음',
    backToToday: '오늘의 말씀으로',
    smaller: '글자 작게', larger: '글자 크게', glyph: '가',
    journeyTitle: '성경 읽기 여정',
    journeyLead: (total) => `하루 5분씩, ${total.toLocaleString('ko-KR')}번의 읽기로 성경 전체를 읽어요. 쉬운 책부터 차근차근 나아갑니다.`,
    readings: (done, total) => `${done} / ${total}`,
    stageDone: '완료',
    here: '지금 여기',
    allDone: '성경 전체를 다 읽었어요!',
    allDoneBody: '긴 여정을 끝까지 걸어왔어요. 여정 탭에서 언제든 다시 읽을 수 있어요.',
    share: '친구에게 공유하기',
    shareText: '하루 5분, 같이 성경 읽어요',
    copied: '링크를 복사했어요',
    footerNote: '읽기 기록은 이 기기의 브라우저에만 저장됩니다.',
    footerCredit: `성경 본문: 개역한글 · Berean Standard Bible (퍼블릭 도메인) · <a href="${REPO_URL}">GitHub</a>`,
    loading: '말씀을 불러오는 중...',
    loadError: '말씀을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.',
    retry: '다시 시도',
    notFound: '찾을 수 없는 페이지예요.',
    date: (d) => new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(d),
    shortDate: (key) => key.replaceAll('-', '.'),
    title: '성경을 읽자 - 하루 5분 성경 읽기',
  },
  en: {
    brand: 'Read the Bible',
    today: 'Today', journey: 'Journey',
    streakUnit: 'day streak',
    streakStart: 'Take your first step today',
    streakKeep: 'Read today to keep your streak going',
    streakDone: 'Done for today. See you tomorrow',
    daysRead: 'Days read', longest: 'Longest streak', progress: 'Progress',
    dayCount: (n) => `${n}`,
    weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    day: (n) => `Day ${n}`,
    stage: (n) => `Stage ${n}`,
    minutes: (n) => `About ${n} min`,
    todaysReading: 'Today\'s reading',
    newStage: 'New stage',
    about: (name) => `What is ${name}?`,
    reflect: 'Pause and reflect',
    questions: [
      'Which verse stood out to you most today?',
      'What does this passage show you about God?',
      'How could you live this out today?',
      'What was new to you, or left you curious?',
      'Is there a short prayer you want to pray after reading this?',
    ],
    complete: 'I read it',
    completed: 'Read',
    undo: 'Undo',
    doneTitle: 'Today\'s reading is done',
    doneBody: (n) => (n > 1 ? `You are on a ${n}-day streak. See you tomorrow.` : 'A great start. See you tomorrow.'),
    nextUp: 'Next reading',
    readAhead: 'Read ahead',
    previous: 'Previous', next: 'Next',
    backToToday: 'Back to today\'s reading',
    smaller: 'Smaller text', larger: 'Larger text', glyph: 'A',
    journeyTitle: 'The journey',
    journeyLead: (total) => `Five minutes a day, ${total.toLocaleString('en-US')} readings, the whole Bible. It starts with the easiest books and builds from there.`,
    readings: (done, total) => `${done} / ${total}`,
    stageDone: 'Done',
    here: 'You are here',
    allDone: 'You have read the whole Bible!',
    allDoneBody: 'You walked the whole journey. You can reread anything from the Journey tab.',
    share: 'Share with a friend',
    shareText: 'Read the Bible with me, 5 minutes a day',
    copied: 'Link copied',
    footerNote: 'Your reading history is saved only in this browser.',
    footerCredit: `Scripture: 개역한글 (KRV) · Berean Standard Bible (public domain) · <a href="${REPO_URL}">GitHub</a>`,
    loading: 'Loading the passage...',
    loadError: 'Could not load the passage. Please check your connection.',
    retry: 'Try again',
    notFound: 'Page not found.',
    date: (d) => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(d),
    shortDate: (key) => key.replaceAll('-', '.'),
    title: 'Read the Bible - 5 minutes a day',
  },
};

const ICON = {
  flame: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c.6 3.4-1 5.2-2.6 7C7.9 11.2 6.5 12.9 6.5 15.4a5.5 5.5 0 0 0 11 0c0-2-.9-3.6-1.9-5-.5 1.3-1.2 2.1-2.2 2.6.6-3.5-.2-7.3-1.4-10.5Z" fill="currentColor"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5.5-5.5L19 12l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

const app = document.getElementById('app');
let plan = null;
let state = loadState();
let renderedOn = dateKey();
let renderToken = 0;
const openStages = new Set();
const bookCache = new Map();

// ---------- state ----------

function loadState() {
  const fallback = { lang: 'ko', size: 2, done: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== 'object') return fallback;
    return {
      lang: ['ko', 'en', 'both'].includes(saved.lang) ? saved.lang : 'ko',
      size: Number.isInteger(saved.size) && saved.size >= 0 && saved.size < SIZES.length ? saved.size : 2,
      done: saved.done && typeof saved.done === 'object' ? saved.done : {},
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode). The app still works for this visit.
  }
}

/** Language of the interface (the "both" mode uses Korean for the interface). */
const ui = () => (state.lang === 'en' ? 'en' : 'ko');
const t = () => TEXT[ui()];
const stats = () => streakStats(Object.values(state.done), dateKey());

// ---------- helpers ----------

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
));

/** Inner part of a progress bar. Any progress at all stays visible. */
const barFill = (done, total) => `<i style="width:${(done / total) * 100}%"${done > 0 ? ' class="some"' : ''}></i>`;

async function loadBook(lang, id) {
  const key = `${lang}/${id}`;
  if (!bookCache.has(key)) {
    const request = fetch(`data/${key}.json`).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    });
    request.catch(() => bookCache.delete(key));
    bookCache.set(key, request);
  }
  return bookCache.get(key);
}

function toast(message) {
  const element = document.getElementById('toast');
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove('show'), 2200);
}

function reference(index, lang = ui()) {
  const day = plan.days[index];
  return formatReference(plan.books[day[0]], day, lang);
}

// ---------- chrome (header, footer) ----------

function renderChrome(tab) {
  const text = t();
  document.documentElement.lang = ui();
  document.title = text.title;
  document.getElementById('brand-name').textContent = text.brand;
  for (const link of document.querySelectorAll('.tabs a')) {
    link.textContent = text[link.dataset.tab];
    if (link.dataset.tab === tab) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  for (const button of document.querySelectorAll('#lang-switch button')) {
    button.setAttribute('aria-pressed', String(button.dataset.lang === state.lang));
  }
  document.getElementById('share').textContent = text.share;
  document.getElementById('footer-note').textContent = text.footerNote;
  document.getElementById('footer-credit').innerHTML = text.footerCredit;
  document.documentElement.style.setProperty('--reading-size', `${SIZES[state.size]}px`);
}

// ---------- streak panel ----------

function streakPanel() {
  const text = t();
  const today = dateKey();
  const { current, longest, total, readToday } = stats();
  const readDates = new Set(Object.values(state.done));
  const doneCount = Object.keys(state.done).length;
  const percent = (doneCount / plan.days.length) * 100;
  const message = readToday ? text.streakDone : current > 0 ? text.streakKeep : text.streakStart;

  const week = weekKeys(today).map((key, i) => {
    const classes = ['dot'];
    if (readDates.has(key)) classes.push('read');
    if (key === today) classes.push('today');
    if (key > today) classes.push('future');
    return `<li class="${classes.join(' ')}">
      <span class="dot-label">${text.weekdays[i]}</span>
      <span class="dot-mark">${readDates.has(key) ? ICON.check : ''}</span>
    </li>`;
  }).join('');

  return `
    <section class="streak ${current > 0 ? 'alive' : ''}" aria-label="${escapeHtml(text.streakUnit)}">
      <p class="date">${escapeHtml(text.date(new Date()))}</p>
      <div class="streak-main">
        <span class="flame">${ICON.flame}</span>
        <p class="streak-count"><strong>${current}</strong><span>${escapeHtml(text.streakUnit)}</span></p>
      </div>
      <p class="streak-message">${escapeHtml(message)}</p>
      <ol class="week">${week}</ol>
      <dl class="stats">
        <div><dt>${escapeHtml(text.daysRead)}</dt><dd>${escapeHtml(text.dayCount(total))}</dd></div>
        <div><dt>${escapeHtml(text.longest)}</dt><dd>${escapeHtml(text.dayCount(longest))}</dd></div>
        <div><dt>${escapeHtml(text.progress)}</dt><dd>${percent > 0 && percent < 1 ? percent.toFixed(1) : Math.floor(percent)}%</dd></div>
      </dl>
    </section>`;
}

// ---------- reader ----------

function passageHtml(book, primary, lang, secondary) {
  const multi = primary.length > 1;
  return primary.map((part, partIndex) => {
    const heading = multi
      ? `<h3 class="chapter">${escapeHtml(formatReference(book, [0, part.chapter, 1, part.chapter, 0], ui()))}</h3>`
      : '';
    // Pair the two languages by verse number. Their verse counts can differ slightly.
    const others = secondary?.[partIndex]?.verses ?? [];
    const byNumber = new Map(part.verses.map((verse) => [verse.number, { first: verse.text, second: '' }]));
    for (const verse of others) {
      const entry = byNumber.get(verse.number) ?? { first: '', second: '' };
      entry.second = verse.text;
      byNumber.set(verse.number, entry);
    }
    const verses = [...byNumber].sort((a, b) => a[0] - b[0]).map(([number, { first, second }]) => {
      if (!first && !second) return '';
      return `<p class="verse"><sup>${number}</sup><span class="verse-body">
        ${first ? `<span lang="${lang}">${escapeHtml(first)}</span>` : ''}
        ${second ? `<span class="verse-second" lang="en">${escapeHtml(second)}</span>` : ''}
      </span></p>`;
    }).join('');
    return heading + verses;
  }).join('');
}

function readerShell(index, { home }) {
  const text = t();
  const day = plan.days[index];
  const book = plan.books[day[0]];
  const stageIndex = stageOf(plan.stages, index);
  const stage = plan.stages[stageIndex];
  const lang = ui();
  const isDone = index in state.done;
  const startsStage = index === stage.start;
  const startsBook = index === 0 || plan.days[index - 1][0] !== day[0];
  const stageDone = plan.days.slice(stage.start, stage.start + stage.count)
    .filter((_, i) => (stage.start + i) in state.done).length;

  const intro = startsBook ? `
    <aside class="note">
      <h3>${escapeHtml(text.about(book[lang]))}</h3>
      <p>${escapeHtml(lang === 'ko' ? book.introKo : book.introEn)}</p>
    </aside>` : '';

  const stageBanner = startsStage ? `
    <aside class="note stage-note">
      <p class="eyebrow">${escapeHtml(text.newStage)} · ${escapeHtml(text.stage(stageIndex + 1))}</p>
      <h3>${escapeHtml(stage[lang])}</h3>
      <p>${escapeHtml(lang === 'ko' ? stage.descKo : stage.descEn)}</p>
    </aside>` : '';

  const action = isDone ? `
    <div class="done-row">
      <span class="done-badge">${ICON.check}${escapeHtml(text.completed)} · ${escapeHtml(text.shortDate(state.done[index]))}</span>
      <button type="button" class="link" data-action="undo" data-index="${index}">${escapeHtml(text.undo)}</button>
    </div>` : `
    <button type="button" class="button primary big" data-action="complete" data-index="${index}">
      ${ICON.check}<span>${escapeHtml(text.complete)}</span>
    </button>`;

  const pager = home ? '' : `
    <nav class="pager" aria-label="${escapeHtml(text.previous)} / ${escapeHtml(text.next)}">
      ${index > 0 ? `<a class="pager-link" href="#/day/${index}"><small>${escapeHtml(text.previous)}</small>${escapeHtml(reference(index - 1))}</a>` : '<span></span>'}
      ${index < plan.days.length - 1 ? `<a class="pager-link end" href="#/day/${index + 2}"><small>${escapeHtml(text.next)}</small>${escapeHtml(reference(index + 1))}</a>` : '<span></span>'}
    </nav>`;

  return `
    <article class="reader" data-index="${index}">
      ${home ? '' : `<a class="back" href="#/">${escapeHtml(text.backToToday)}</a>`}
      <header class="reader-head">
        <p class="eyebrow">${home ? `${escapeHtml(text.todaysReading)} · ` : ''}${escapeHtml(text.day(index + 1))}</p>
        <h1>${escapeHtml(reference(index))}</h1>
        <div class="reader-meta">
          <a class="stage-chip" href="#/journey">
            <span>${escapeHtml(text.stage(stageIndex + 1))} · ${escapeHtml(stage[lang])}</span>
            <span class="bar" aria-hidden="true">${barFill(stageDone, stage.count)}</span>
          </a>
          <span class="minutes" id="minutes"></span>
          <span class="size-controls">
            <button type="button" data-action="size" data-step="-1" aria-label="${escapeHtml(text.smaller)}" ${state.size === 0 ? 'disabled' : ''}><span class="a-small">${text.glyph}</span></button>
            <button type="button" data-action="size" data-step="1" aria-label="${escapeHtml(text.larger)}" ${state.size === SIZES.length - 1 ? 'disabled' : ''}><span class="a-large">${text.glyph}</span></button>
          </span>
        </div>
      </header>
      ${stageBanner}
      ${intro}
      <div class="passage" id="passage"><p class="loading">${escapeHtml(text.loading)}</p></div>
      <aside class="reflect">
        <h3>${escapeHtml(text.reflect)}</h3>
        <p>${escapeHtml(text.questions[index % text.questions.length])}</p>
      </aside>
      <div class="actions">${action}</div>
      ${pager}
    </article>`;
}

async function fillPassage(index, token) {
  const text = t();
  const day = plan.days[index];
  const book = plan.books[day[0]];
  const target = document.getElementById('passage');
  const languages = state.lang === 'both' ? ['ko', 'en'] : [state.lang];
  try {
    const books = await Promise.all(languages.map((lang) => loadBook(lang, book.id)));
    if (token !== renderToken) return;
    const [primary, secondary] = books.map((chapters) => slicePassage(chapters, day));
    target.innerHTML = passageHtml(book, primary, languages[0], secondary);
    target.classList.toggle('parallel', languages.length > 1);
    document.getElementById('minutes').textContent = text.minutes(readingMinutes(primary, languages[0]));
  } catch {
    if (token !== renderToken) return;
    target.innerHTML = `<p class="loading">${escapeHtml(text.loadError)}</p>
      <button type="button" class="button ghost" data-action="retry">${escapeHtml(text.retry)}</button>`;
  }
}

// ---------- views ----------

function viewToday(token) {
  const text = t();
  const { current, readToday } = stats();
  const next = nextUnread(state.done, plan.days.length);

  if (next === -1) {
    app.innerHTML = `${streakPanel()}
      <section class="card celebrate"><h1>${escapeHtml(text.allDone)}</h1><p>${escapeHtml(text.allDoneBody)}</p>
      <a class="button primary" href="#/journey">${escapeHtml(text.journey)}</a></section>`;
    return;
  }

  if (readToday) {
    app.innerHTML = `${streakPanel()}
      <section class="card celebrate">
        <span class="celebrate-mark">${ICON.check}</span>
        <h1>${escapeHtml(text.doneTitle)}</h1>
        <p>${escapeHtml(text.doneBody(current))}</p>
      </section>
      <a class="card next-card" href="#/day/${next + 1}">
        <span>
          <span class="eyebrow">${escapeHtml(text.nextUp)} · ${escapeHtml(text.day(next + 1))}</span>
          <strong>${escapeHtml(reference(next))}</strong>
        </span>
        <span class="next-cta">${escapeHtml(text.readAhead)}${ICON.arrow}</span>
      </a>`;
    return;
  }

  app.innerHTML = streakPanel() + readerShell(next, { home: true });
  fillPassage(next, token);
}

function viewDay(index, token) {
  app.innerHTML = readerShell(index, { home: false });
  fillPassage(index, token);
}

function viewJourney() {
  const text = t();
  const lang = ui();
  const total = plan.days.length;
  const doneCount = Object.keys(state.done).length;
  const next = nextUnread(state.done, total);
  const currentStage = next === -1 ? -1 : stageOf(plan.stages, next);
  if (openStages.size === 0 && currentStage >= 0) openStages.add(currentStage);

  const stages = plan.stages.map((stage, stageIndex) => {
    const indexes = Array.from({ length: stage.count }, (_, i) => stage.start + i);
    const done = indexes.filter((i) => i in state.done).length;
    const complete = done === stage.count;
    const isOpen = openStages.has(stageIndex);
    const bookNames = [...new Set(indexes.map((i) => plan.books[plan.days[i][0]][lang]))].join(' · ');
    const list = isOpen ? `<ol class="day-list">${indexes.map((i) => `
        <li><a href="#/day/${i + 1}" class="${i in state.done ? 'is-done' : ''} ${i === next ? 'is-next' : ''}">
          <span class="day-number">${i + 1}</span>
          <span class="day-ref">${escapeHtml(reference(i))}</span>
          ${i === next ? `<span class="tag">${escapeHtml(text.here)}</span>` : ''}
          <span class="day-check">${i in state.done ? ICON.check : ''}</span>
        </a></li>`).join('')}</ol>` : '';

    return `
      <li class="stage ${complete ? 'complete' : ''} ${stageIndex === currentStage ? 'current' : ''}">
        <button type="button" class="stage-head" data-action="toggle-stage" data-stage="${stageIndex}" aria-expanded="${isOpen}">
          <span class="stage-number">${complete ? ICON.check : stageIndex + 1}</span>
          <span class="stage-text">
            <strong>${escapeHtml(stage[lang])}</strong>
            <span class="stage-desc">${escapeHtml(lang === 'ko' ? stage.descKo : stage.descEn)}</span>
            <span class="stage-books">${escapeHtml(bookNames)}</span>
            <span class="stage-progress">
              <span class="bar" aria-hidden="true">${barFill(done, stage.count)}</span>
              <span class="count">${complete ? escapeHtml(text.stageDone) : escapeHtml(text.readings(done, stage.count))}</span>
            </span>
          </span>
          <span class="chevron">${ICON.chevron}</span>
        </button>
        ${list}
      </li>`;
  }).join('');

  app.innerHTML = `
    <section class="journey-head">
      <h1>${escapeHtml(text.journeyTitle)}</h1>
      <p>${escapeHtml(text.journeyLead(total))}</p>
      <div class="overall">
        <span class="bar" aria-hidden="true">${barFill(doneCount, total)}</span>
        <span class="count">${escapeHtml(text.readings(doneCount.toLocaleString(), total.toLocaleString()))}</span>
      </div>
    </section>
    <ol class="stages">${stages}</ol>`;
}

// ---------- routing ----------

function render({ keepScroll = false } = {}) {
  if (!plan) return;
  const token = ++renderToken;
  renderedOn = dateKey();
  const route = location.hash.replace(/^#\/?/, '');
  const dayMatch = route.match(/^day\/(\d+)$/);

  if (route === '') {
    renderChrome('today');
    viewToday(token);
  } else if (route === 'journey') {
    renderChrome('journey');
    viewJourney();
  } else if (dayMatch && Number(dayMatch[1]) >= 1 && Number(dayMatch[1]) <= plan.days.length) {
    renderChrome('');
    viewDay(Number(dayMatch[1]) - 1, token);
  } else {
    renderChrome('');
    app.innerHTML = `<section class="card celebrate"><p>${escapeHtml(t().notFound)}</p>
      <a class="button primary" href="#/">${escapeHtml(t().backToToday)}</a></section>`;
  }
  if (!keepScroll) window.scrollTo(0, 0);
}

// ---------- events ----------

document.addEventListener('click', async (event) => {
  const langButton = event.target.closest('#lang-switch button');
  if (langButton) {
    state.lang = langButton.dataset.lang;
    saveState();
    render({ keepScroll: true });
    return;
  }

  if (event.target.closest('#share')) {
    const url = location.origin + location.pathname;
    const text = t();
    try {
      if (navigator.share) await navigator.share({ title: text.brand, text: text.shareText, url });
      else {
        await navigator.clipboard.writeText(url);
        toast(text.copied);
      }
    } catch {
      // The person closed the share sheet, nothing to do.
    }
    return;
  }

  const target = event.target.closest('[data-action]');
  if (!target) return;
  const { action } = target.dataset;

  if (action === 'complete') {
    state.done[target.dataset.index] = dateKey();
    saveState();
    const onHome = location.hash.replace(/^#\/?/, '') === '';
    render({ keepScroll: !onHome });
  } else if (action === 'undo') {
    delete state.done[target.dataset.index];
    saveState();
    render({ keepScroll: true });
  } else if (action === 'size') {
    state.size = Math.min(SIZES.length - 1, Math.max(0, state.size + Number(target.dataset.step)));
    saveState();
    render({ keepScroll: true });
  } else if (action === 'toggle-stage') {
    const stage = Number(target.dataset.stage);
    if (openStages.has(stage)) openStages.delete(stage);
    else openStages.add(stage);
    // Keep at least a marker so the current stage does not reopen by itself.
    if (openStages.size === 0) openStages.add(-1);
    render({ keepScroll: true });
  } else if (action === 'retry') {
    render({ keepScroll: true });
  }
});

window.addEventListener('hashchange', () => render());

// Another tab changed the reading history.
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return;
  state = loadState();
  render({ keepScroll: true });
});

// The date changed while the page was in the background (for example overnight).
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && dateKey() !== renderedOn) render({ keepScroll: true });
});

// ---------- start ----------

async function start() {
  renderChrome(location.hash.includes('journey') ? 'journey' : 'today');
  app.innerHTML = `<p class="loading">${escapeHtml(t().loading)}</p>`;
  try {
    const response = await fetch('data/plan.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    plan = await response.json();
    render();
  } catch {
    app.innerHTML = `<section class="card celebrate"><p>${escapeHtml(t().loadError)}</p>
      <button type="button" class="button primary" id="reload">${escapeHtml(t().retry)}</button></section>`;
    document.getElementById('reload').addEventListener('click', start);
  }
}

start();

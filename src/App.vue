<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#" :aria-label="t.brandAria">
        <span class="brand-mark">E</span>
        <span>EchoSpell</span>
      </a>
      <div class="header-stats">
        <span><b>{{ streak }}</b> {{ t.streak }}</span><span><b>{{ accuracy }}%</b> {{ t.accuracy }}</span>
        <button class="mistake-button" type="button" @click="startSession('mistakes')">{{ t.mistakes }} {{ mistakes.length }}</button>
        <div class="language-switch" :aria-label="t.localeName">
          <button :class="{ active: locale === 'zh' }" type="button" @click="locale = 'zh'">中</button>
          <button :class="{ active: locale === 'ja' }" type="button" @click="locale = 'ja'">日</button>
        </div>
      </div>
    </header>

    <main>
      <section class="intro"><p class="eyebrow">{{ t.eyebrow }}</p><h1>{{ t.titleStart }}<span>{{ t.titleAccent }}</span></h1><p>{{ t.subtitle }}</p></section>
      <section class="practice-area">
        <div class="dictionary-toolbar">
          <label class="dictionary-select">
            <span>{{ t.dictionary }}</span>
            <select v-model="selectedDictionaryId" @change="changeDictionary">
              <option v-for="dictionary in availableDictionaries" :key="dictionary.id" :value="dictionary.id">
                {{ dictionaryName(dictionary) }} · {{ dictionary.words.length }} {{ t.wordUnit }}
              </option>
            </select>
          </label>
          <button class="import-button" type="button" @click="fileInput?.click()">{{ t.importJson }}</button>
          <input ref="fileInput" class="visually-hidden" type="file" accept=".json,.csv,.tsv,.txt,.xlsx,.xls,.docx,.doc" @change="handleImport" />
        </div>
        <p v-if="importMessage" class="import-message" role="status">{{ importMessage }}</p>
        <p v-if="importError" class="import-message error" role="alert">{{ importError }}</p>
        <p v-if="activeDictionary.verified === false" class="custom-warning" role="note">{{ t.unverifiedWarning }}</p>
        <section class="trainer-card" aria-live="polite">
          <div class="card-topline">
            <div class="mode-switch" :aria-label="t.mode">
              <button :class="{ active: studyMode === 'learn' }" type="button" @click="setStudyMode('learn')">{{ t.learn }}</button>
              <button :class="{ active: studyMode === 'practice' }" type="button" @click="setStudyMode('practice')">{{ t.practice }}</button>
            </div>
            <div class="card-tools">
              <button class="meaning-toggle" :class="{ active: showMeaning }" type="button" @click="toggleMeaning">
                {{ showMeaning ? t.hideMeaning : t.showMeaning }}
              </button>
              <button v-if="sessionMode === 'mistakes'" class="back-to-library" type="button" @click="startSession('all')">{{ t.backToLibrary }}</button>
              <div class="card-meta"><span class="counter">{{ index + 1 }} / {{ shuffled.length }}</span><span class="level" :class="{ mistakes: sessionMode === 'mistakes' }">{{ levelLabel }}</span></div>
            </div>
          </div>
          <div class="progress-track"><span :style="{ width: `${progress}%` }"></span></div>

          <div v-if="result === 'idle'" class="question-state">
            <button class="sound-button" type="button" :aria-label="t.playAria" @click="speak(slowMode)">
              <span class="sound-rings"><i></i><i></i><i></i></span>
              <svg class="play-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5.2v13.6L18.8 12 8 5.2Z" />
              </svg>
            </button>
            <p class="listen-label">{{ t.listen }}</p>
            <div class="hint-switches">
              <button class="hint-switch slow-toggle" :class="{ active: slowMode }" type="button" @click="toggleSlowMode">
                <span class="switch-dot" aria-hidden="true"></span>{{ t.slow }}
              </button>
              <button v-if="studyMode === 'learn'" class="hint-switch syllable-toggle" :class="{ active: showSyllables }" type="button" @click="toggleSyllables">
                {{ t.syllable }}<span class="switch-dot" aria-hidden="true"></span>
              </button>
            </div>
            <p class="learning-meaning" :class="{ hidden: !showMeaning }" :aria-hidden="!showMeaning"><span>{{ t.meaning }}</span><strong>{{ currentMeaning }}</strong></p>
            <label class="answer-label" for="answer">{{ t.answerLabel }}</label>
            <div class="answer-wrap">
              <div v-if="studyMode === 'learn'" class="guided-answer" role="note" :aria-label="showSyllables && currentSyllables.length ? syllableAriaLabel : undefined" :aria-hidden="!(showSyllables && currentSyllables.length)">
                <template v-if="showSyllables && learningSyllableGroups.length">
                  <template v-for="(group, groupIndex) in learningSyllableGroups" :key="`${group.index}-${group.text}`">
                    <span class="guided-syllable" :class="{ stressed: group.index === currentStressIndex }">
                      <span v-for="(letter, letterIndex) in group.letters" :key="`${groupIndex}-${letterIndex}-${letter.char}`" :class="`guided-${letter.type}`">{{ letter.char }}</span>
                    </span>
                    <span v-if="groupIndex < learningSyllableGroups.length - 1" class="guided-separator" aria-hidden="true">·</span>
                  </template>
                </template>
                <template v-else>
                  <span v-for="(letter, letterIndex) in learningLetters" :key="`${letterIndex}-${letter.char}`" :class="`guided-${letter.type}`">{{ letter.char }}</span>
                </template>
              </div>
              <input id="answer" ref="input" v-model="answer" class="answer-input" :class="{ 'learning-input': studyMode === 'learn' }" type="text" inputmode="text" autocomplete="off" autocapitalize="none" spellcheck="false" :placeholder="studyMode === 'practice' ? t.placeholder : ''" @keyup.enter="handleEnter" />
            </div>
            <p v-if="studyMode === 'learn'" class="learning-instruction">
              <template v-for="line in t.learningInstruction" :key="line">
                <span>{{ line }}</span>
              </template>
            </p>
            <div v-if="studyMode === 'practice'" class="actions"><button class="secondary" type="button" @click="skip">{{ t.skip }}</button><button class="primary" type="button" :disabled="!answer.trim()" @click="check">{{ t.check }} <span>↵</span></button></div>
            <button v-else class="learning-skip" type="button" @click="skipAndContinue">{{ t.skip }}</button>
          </div>

          <div v-else class="result-state" :class="result">
            <div class="result-content">
              <div class="result-icon">{{ result === 'correct' ? '✓' : '×' }}</div>
              <p class="result-kicker">{{ result === 'correct' ? t.correct : errorMessage }}</p>
              <div class="word-result" :aria-label="`${t.correctSpelling} ${current.word}`"><span v-for="(part, i) in diff" :key="i" :class="part.type">{{ part.char }}</span></div>
              <p v-if="current.phonetic" class="phonetic">{{ current.phonetic }}</p>
              <p v-if="currentSyllables.length && (studyMode === 'practice' || showSyllables)" class="syllable-hint result-syllables" :aria-label="syllableAriaLabel">
                <template v-for="(syllable, syllableIndex) in currentSyllables" :key="`${syllable}-${syllableIndex}`">
                  <span :class="{ stressed: syllableIndex === currentStressIndex }">{{ syllable }}</span><i v-if="syllableIndex < currentSyllables.length - 1" aria-hidden="true">·</i>
                </template>
              </p>
              <div v-if="studyMode === 'learn' && showMeaning" class="learning-panel">
                <div><span class="panel-label">{{ t.meaning }}</span><strong>{{ currentMeaning }}</strong></div>
                <div v-if="currentTip"><span class="panel-label">{{ t.tip }}</span><p>{{ currentTip }}</p></div>
                <div v-if="current.example"><span class="panel-label">{{ t.example }}</span><p>{{ current.example }}</p></div>
              </div>
            </div>
            <button class="primary next-button" type="button" @click="next">{{ isLast ? t.restart : t.next }} <span>→</span></button>
          </div>
        </section>
      </section>
    </main>
    <footer class="site-footer">
      <a href="https://github.com/RexKing624/echo-spell" target="_blank" rel="noreferrer">GitHub</a>
      <span aria-hidden="true">·</span>
      <a href="https://xergnik.com" target="_blank" rel="noreferrer">xergnik.com</a>
      <span aria-hidden="true">·</span>
      <span>{{ t.footerLocation }}</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { dictionaries, words } from './data/words'
import { importDictionaryFile } from './utils/importDictionary'

const copy = {
  zh: {
    localeName: '中文', brandAria: 'EchoSpell 首页', streak: '连对', accuracy: '正确率', mistakes: '错词',
    eyebrow: 'LEARN SPELLING THROUGH LISTENING', titleStart: '听见，然后', titleAccent: '写对。',
    subtitle: '专为“会念但不会写”设计的英语拼写练习。', basic: '基础', advanced: '进阶', challenge: '挑战',
    playAria: '播放单词发音', listen: '点击播放 · 听清楚这个词', slow: '慢速',
    answerLabel: '写下你听到的单词', placeholder: 'Type what you hear', skip: '跳过', check: '检查拼写',
    correct: '拼对了！', correctSpelling: '正确拼写', meaning: '意思', tip: '记忆提示', example: '例句',
    restart: '重新练习', next: '下一个单词', dictionary: '当前词库', importJson: '导入词库', wordUnit: '词',
    imported: '已导入', invalidImport: '无法识别有效词汇，请检查文件内容和格式。', legacyDoc: '旧版 .doc 暂时无法在浏览器中可靠读取，请先另存为 .docx 后再导入。', unsupportedFile: '暂不支持这种文件。可导入 JSON、CSV、TSV、TXT、Excel 或 DOCX。',
    unverifiedWarning: '用户导入词库 · 非 EchoSpell 内置，未经校验。拼写、释义和格式可能不准确，请自行核对。',
    mode: '学习模式', learn: '学习', practice: '练习', showMeaning: '显示意思', hideMeaning: '隐藏意思', syllable: '音节', syllableAria: '单词音节', backToLibrary: '回到词库练习', footerLocation: '© 2026 日本 / 东京', learningInstruction: ['照着完整输入 正确后会自动进入下一词'],
    close: '很接近。', missing: '你漏掉了', position: '注意这些字母的位置', retry: '再听一次，注意每个音节。',
  },
  ja: {
    localeName: '日本語', brandAria: 'EchoSpell ホーム', streak: '連続正解', accuracy: '正解率', mistakes: '苦手',
    eyebrow: 'LEARN SPELLING THROUGH LISTENING', titleStart: '聞いて、そして', titleAccent: '書ける。',
    subtitle: '「読めるのに書けない」を解決する英単語スペリング練習。', basic: '基礎', advanced: '応用', challenge: 'チャレンジ',
    playAria: '英単語の発音を再生', listen: 'タップして、単語をよく聞こう', slow: '低速',
    answerLabel: '聞こえた英単語を入力してください', placeholder: '聞こえた単語を入力', skip: 'スキップ', check: 'スペルを確認',
    correct: '正解！', correctSpelling: '正しいスペル', meaning: '意味', tip: '覚え方', example: '例文',
    restart: 'もう一度練習', next: '次の単語', dictionary: '単語帳', importJson: '単語帳を読み込む', wordUnit: '語',
    imported: '読み込み完了', invalidImport: '有効な単語を認識できません。ファイルの内容と形式を確認してください。', legacyDoc: '旧形式の .doc はブラウザで正確に読み込めません。.docx 形式で保存してから読み込んでください。', unsupportedFile: 'この形式には未対応です。JSON、CSV、TSV、TXT、Excel、DOCXを利用できます。',
    unverifiedWarning: 'ユーザー読み込み単語帳 · EchoSpell 内蔵ではなく、未検証です。スペル・意味・形式を各自で確認してください。',
    mode: '学習モード', learn: '学習', practice: '練習', showMeaning: '意味を表示', hideMeaning: '意味を隠す', syllable: '音節', syllableAria: '単語の音節', backToLibrary: '単語帳練習に戻る', footerLocation: '© 2026 日本 / 東京', learningInstruction: ['最後まで入力 正解すると自動で次へ進みます'],
    close: 'もう少しです。', missing: '抜けている文字', position: '文字の位置に注意', retry: 'もう一度聞いて、音節を意識しましょう。',
  },
}

const savedLocale = localStorage.getItem('echospell-locale')
const locale = ref(savedLocale || (navigator.language.startsWith('ja') ? 'ja' : 'zh'))
const t = computed(() => copy[locale.value])
const DEFAULT_DICTIONARY_ID = 'cet4-high-frequency'
const DEFAULT_DICTIONARY_MIGRATION_KEY = 'echospell-default-dictionary-cet4'
const shuffled = ref([])
const index = ref(0)
const answer = ref('')
const result = ref('idle')
const streak = ref(0)
const correctCount = ref(0)
const totalCount = ref(0)
const legacyMistakes = localStorage.getItem('sound2spell-mistakes')
const mistakes = ref(JSON.parse(localStorage.getItem('echospell-mistakes') || legacyMistakes || '[]'))
const input = ref(null)
const fileInput = ref(null)
const slowMode = ref(false)
const studyMode = ref(localStorage.getItem('echospell-mode') || 'learn')
const showMeaning = ref(localStorage.getItem('echospell-show-meaning') !== 'false')
const showSyllables = ref(localStorage.getItem('echospell-show-syllables') === 'true')
const sessionMode = ref('all')
const customDictionary = ref(readStoredDictionary())
const selectedDictionaryId = ref(getInitialDictionaryId())
const importMessage = ref('')
const importError = ref('')

const availableDictionaries = computed(() => customDictionary.value ? [...dictionaries, customDictionary.value] : dictionaries)
const activeDictionary = computed(() => availableDictionaries.value.find(item => item.id === selectedDictionaryId.value) || dictionaries.find(item => item.id === DEFAULT_DICTIONARY_ID) || dictionaries[0])
const activeWords = computed(() => activeDictionary.value.words.map(normalizeWord).filter(Boolean))
const current = computed(() => shuffled.value[index.value] || activeWords.value[0] || words[0])
const progress = computed(() => shuffled.value.length ? ((index.value + (result.value === 'idle' ? 0 : 1)) / shuffled.value.length) * 100 : 0)
const accuracy = computed(() => totalCount.value ? Math.round((correctCount.value / totalCount.value) * 100) : 0)
const isLast = computed(() => index.value >= shuffled.value.length - 1)
const levelLabel = computed(() => sessionMode.value === 'mistakes' ? t.value.mistakes : (t.value[current.value.level] || t.value.basic))
const currentMeaning = computed(() => localize(current.value.meaning) || '—')
const currentTip = computed(() => localize(current.value.tip))
const currentSyllables = computed(() => Array.isArray(current.value.syllables) ? current.value.syllables : [])
const currentStressIndex = computed(() => Number.isInteger(current.value.stressIndex) ? current.value.stressIndex : null)
const syllableAriaLabel = computed(() => `${t.value.syllableAria}: ${currentSyllables.value.join(' · ')}`)
const learningLetters = computed(() => {
  const typed = answer.value
  const target = current.value.word
  const length = Math.max(typed.length, target.length)

  return Array.from({ length }, (_, index) => {
    const typedChar = typed[index]
    const targetChar = target[index]

    if (typedChar !== undefined) {
      const isMatch = targetChar && typedChar.toLowerCase() === targetChar.toLowerCase()
      return { char: typedChar, type: isMatch ? 'typed' : 'wrong' }
    }

    return { char: targetChar, type: 'remainder' }
  }).filter(letter => letter.char)
})
const learningSyllableGroups = computed(() => {
  if (!currentSyllables.value.length) return []
  const visibleLetters = learningLetters.value.filter(letter => /[A-Za-z]/.test(letter.char))
  let cursor = 0

  return currentSyllables.value.map((syllable, index) => {
    const letterCount = String(syllable).replace(/[^A-Za-z]/g, '').length
    const letters = visibleLetters.slice(cursor, cursor + letterCount)
    cursor += letterCount
    return { index, text: syllable, letters }
  }).filter(group => group.letters.length)
})
let learningAdvanceTimer

watch(locale, value => {
  localStorage.setItem('echospell-locale', value)
  document.documentElement.lang = value === 'ja' ? 'ja' : 'zh-CN'
  document.title = value === 'ja' ? 'EchoSpell — 聞いて、書ける。' : 'EchoSpell — 听见，然后写对'
})

watch(answer, value => {
  window.clearTimeout(learningAdvanceTimer)
  if (studyMode.value === 'learn' && result.value === 'idle' && normalize(value) === normalize(current.value.word)) {
    learningAdvanceTimer = window.setTimeout(() => next(), 320)
  }
})

function shuffle(items) { return [...items].sort(() => Math.random() - 0.5) }

function readStoredDictionary() {
  try {
    const stored = JSON.parse(localStorage.getItem('echospell-custom-dictionary') || 'null')
    return stored ? { ...stored, verified: false } : null
  } catch {
    return null
  }
}

function getInitialDictionaryId() {
  const savedDictionaryId = localStorage.getItem('echospell-dictionary')
  if (!savedDictionaryId) return DEFAULT_DICTIONARY_ID
  if (savedDictionaryId === 'core-spelling' && localStorage.getItem(DEFAULT_DICTIONARY_MIGRATION_KEY) !== 'true') {
    localStorage.setItem(DEFAULT_DICTIONARY_MIGRATION_KEY, 'true')
    localStorage.setItem('echospell-dictionary', DEFAULT_DICTIONARY_ID)
    return DEFAULT_DICTIONARY_ID
  }
  return savedDictionaryId
}

function localize(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[locale.value] || value.zh || value.ja || Object.values(value)[0] || ''
}

function dictionaryName(dictionary) {
  return localize(dictionary.name) || dictionary.id
}

function normalizeSyllables(value) {
  if (!Array.isArray(value)) return []
  return value.map(item => String(item ?? '').trim()).filter(Boolean)
}

function normalizeStressIndex(value, syllables = []) {
  if (value === null || value === undefined || String(value).trim() === '') return null
  const index = Number(value)
  if (!Number.isInteger(index)) return null
  return index >= 0 && index < syllables.length ? index : null
}

function normalizeWord(item) {
  const source = typeof item === 'string' ? { word: item } : item
  if (!source || typeof source.word !== 'string') return null
  const word = source.word.trim()
  if (!word || !/^[A-Za-z][A-Za-z '\-]*$/.test(word)) return null
  const meaning = typeof source.meaning === 'string' ? { zh: source.meaning } : (source.meaning || {})
  const tip = typeof source.tip === 'string' ? { zh: source.tip } : (source.tip || {})
  const syllables = normalizeSyllables(source.syllables)
  const stressIndex = normalizeStressIndex(source.stressIndex, syllables)
  return {
    word,
    phonetic: source.phonetic || '',
    syllables,
    stressIndex,
    meaning,
    tip,
    example: source.example || '',
    level: ['basic', 'advanced', 'challenge'].includes(source.level) ? source.level : 'basic'
  }
}

function changeDictionary() {
  localStorage.setItem('echospell-dictionary', selectedDictionaryId.value)
  importMessage.value = ''
  importError.value = ''
  startSession('all')
}

function setStudyMode(mode) {
  studyMode.value = mode
  localStorage.setItem('echospell-mode', mode)
  window.clearTimeout(learningAdvanceTimer)
  answer.value = ''
  result.value = 'idle'
  nextTick(() => {
    input.value?.focus()
    if (mode === 'learn') speak()
  })
}

async function handleImport(event) {
  importMessage.value = ''
  importError.value = ''
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const imported = await importDictionaryFile(file)
    customDictionary.value = imported
    selectedDictionaryId.value = imported.id
    localStorage.setItem('echospell-custom-dictionary', JSON.stringify(imported))
    localStorage.setItem('echospell-dictionary', imported.id)
    importMessage.value = `${t.value.imported} ${imported.words.length} ${t.value.wordUnit} · ${t.value.unverifiedWarning}`
    startSession('all')
  } catch (error) {
    if (error.code === 'legacy-doc') importError.value = t.value.legacyDoc
    else if (error.code === 'unsupported-file') importError.value = t.value.unsupportedFile
    else importError.value = t.value.invalidImport
  } finally {
    event.target.value = ''
  }
}

function startSession(mode = sessionMode.value) {
  sessionMode.value = mode
  const pool = mode === 'mistakes' ? activeWords.value.filter(item => mistakes.value.includes(item.word)) : activeWords.value
  shuffled.value = shuffle(pool.length ? pool : activeWords.value)
  index.value = 0; answer.value = ''; result.value = 'idle'; streak.value = 0; correctCount.value = 0; totalCount.value = 0
  nextTick(() => {
    input.value?.focus()
    if (studyMode.value === 'learn') speak()
  })
}

function toggleSlowMode() {
  const nextSlowMode = !slowMode.value
  slowMode.value = nextSlowMode
  speak(nextSlowMode)
}

function toggleMeaning() {
  showMeaning.value = !showMeaning.value
  localStorage.setItem('echospell-show-meaning', String(showMeaning.value))
}

function toggleSyllables() {
  showSyllables.value = !showSyllables.value
  localStorage.setItem('echospell-show-syllables', String(showSyllables.value))
}

function speak(slow = slowMode.value) {
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(current.value.word)
  utterance.lang = 'en-US'; utterance.rate = slow ? 0.42 : 0.95; utterance.pitch = slow ? 0.95 : 1
  window.speechSynthesis.speak(utterance)
}

function normalize(value) { return value.trim().toLowerCase() }

function saveMistakes() { localStorage.setItem('echospell-mistakes', JSON.stringify(mistakes.value)) }

function check() {
  if (studyMode.value !== 'practice' || !answer.value.trim() || result.value !== 'idle') return
  totalCount.value++
  if (normalize(answer.value) === current.value.word) {
    result.value = 'correct'; correctCount.value++; streak.value++
    mistakes.value = mistakes.value.filter(word => word !== current.value.word)
  } else {
    result.value = 'wrong'; streak.value = 0
    if (!mistakes.value.includes(current.value.word)) mistakes.value.push(current.value.word)
  }
  saveMistakes()
}

function next() {
  if (isLast.value) return startSession()
  index.value++; answer.value = ''; result.value = 'idle'
  nextTick(() => { input.value?.focus(); speak() })
}

function skip() {
  if (result.value !== 'idle') return
  answer.value = ''; result.value = 'wrong'; totalCount.value++; streak.value = 0
  if (!mistakes.value.includes(current.value.word)) mistakes.value.push(current.value.word)
  saveMistakes()
}

function skipAndContinue() {
  if (isLast.value) startSession()
  else next()
}

function handleEnter() {
  if (studyMode.value === 'learn') return
  result.value === 'idle' ? check() : next()
}

function diffAnswer(typed, target) {
  const a = normalize(typed); const n = a.length; const m = target.length
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = 0; i <= n; i++) dp[i][0] = i
  for (let j = 0; j <= m; j++) dp[0][j] = j
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === target[j - 1] ? 0 : 1))
  const parts = []; let i = n; let j = m
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === target[j - 1]) { parts.unshift({ char: target[j - 1], type: 'same' }); i--; j-- }
    else if (j > 0 && (i === 0 || dp[i][j - 1] <= dp[i - 1][j] && dp[i][j - 1] <= dp[i - 1][j - 1])) { parts.unshift({ char: target[j - 1], type: 'missing' }); j-- }
    else if (i > 0 && j > 0) { parts.unshift({ char: target[j - 1], type: 'wrong' }); i--; j-- }
    else i--
  }
  return parts
}

const diff = computed(() => diffAnswer(answer.value, current.value.word))
const errorMessage = computed(() => {
  const missing = diff.value.filter(part => part.type === 'missing').map(part => part.char)
  const wrong = diff.value.filter(part => part.type === 'wrong').map(part => part.char)
  if (missing.length) return `${t.value.close} ${t.value.missing}：${missing.map(c => `“${c}”`).join('、')}。`
  if (wrong.length) return `${t.value.close} ${t.value.position}：${wrong.map(c => `“${c}”`).join('、')}。`
  return t.value.retry
})

onMounted(() => {
  document.documentElement.lang = locale.value === 'ja' ? 'ja' : 'zh-CN'
  if (!availableDictionaries.value.some(item => item.id === selectedDictionaryId.value)) {
    selectedDictionaryId.value = DEFAULT_DICTIONARY_ID
  }
  startSession()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');

:root {
  font-family: 'DM Sans', 'Noto Sans SC', sans-serif;
  color: #1d2925;
  background: #f4f0e8;
  font-synthesis: none;
  --ink: #1d2925;
  --green: #184f43;
  --mint: #cfe5d6;
  --cream: #f4f0e8;
  --orange: #e2643d;
  --line: rgba(29, 41, 37, .15);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; overflow-x: hidden; }
body { margin: 0; min-width: 320px; min-height: 100vh; background: var(--cream); overflow-x: hidden; overscroll-behavior-x: none; }
button, input { font: inherit; }
button { cursor: pointer; }

.app-shell { min-height: 100vh; max-width: 100vw; overflow-x: clip; background-image: radial-gradient(rgba(24,79,67,.08) 1px, transparent 1px); background-size: 24px 24px; }
.topbar { height: 64px; display: flex; align-items: center; justify-content: space-between; flex-wrap: nowrap; padding: 0 max(24px, calc((100vw - 1120px) / 2)); border-bottom: 1px solid var(--line); background: rgba(244,240,232,.88); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 10; }
.brand { flex: 0 0 auto; display: flex; align-items: center; gap: 10px; color: var(--ink); text-decoration: none; font-weight: 700; font-size: 19px; white-space: nowrap; }
.brand-mark { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: var(--green); color: white; font-family: 'Playfair Display', serif; }
.header-stats { flex: 0 1 auto; min-width: 0; display: flex; align-items: center; justify-content: flex-end; gap: 20px; font-size: 13px; color: #65716d; white-space: nowrap; }
.header-stats b { color: var(--ink); }
.mistake-button { border: 1px solid var(--line); background: transparent; border-radius: 999px; padding: 7px 13px; color: var(--ink); }
.language-switch { display: flex; padding: 3px; border: 1px solid var(--line); border-radius: 999px; background: rgba(255,255,255,.55); }
.language-switch button { width: 28px; height: 28px; border: 0; border-radius: 50%; background: transparent; color: #65716d; font-size: 12px; font-weight: 700; }
.language-switch button.active { background: var(--green); color: white; }
main { width: min(100% - 48px, 1280px); max-width: 100%; margin: 0 auto; overflow-x: clip; }
.intro { text-align: center; padding: 38px 0 24px; }
.eyebrow { font-size: 11px; letter-spacing: .22em; font-weight: 700; color: var(--orange); }
.intro h1 { margin: 10px 0 8px; font-family: 'Playfair Display', 'Noto Sans SC', serif; font-size: clamp(38px, 5.4vw, 62px); line-height: 1; letter-spacing: -.04em; }
.intro h1 span { color: var(--green); font-style: italic; }
.intro > p:last-child { color: #63706b; margin: 12px 0 0; }
.practice-area { padding-bottom: 34px; text-align: center; }
.site-footer { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 0 24px 26px; color: #7b8581; font-size: 13px; }
.site-footer a { color: inherit; font-weight: 600; text-decoration: underline; text-underline-offset: 4px; }
.site-footer a:hover { color: var(--green); }
.dictionary-toolbar { max-width: 620px; margin: 0 auto 16px; display: flex; align-items: end; justify-content: center; gap: 10px; }
.dictionary-select { flex: 1 1 auto; min-width: 0; text-align: left; }
.dictionary-select > span { display: block; margin: 0 0 6px 3px; color: #68736f; font-size: 11px; font-weight: 700; letter-spacing: .08em; }
.dictionary-select select { width: 100%; min-height: 40px; padding: 0 36px 0 13px; border: 1px solid var(--line); border-radius: 11px; background: rgba(255,253,248,.8); color: var(--ink); font: inherit; outline: none; }
.dictionary-select select:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(24,79,67,.1); }
.import-button { flex: 0 0 auto; min-height: 40px; padding: 0 16px; border: 1px solid var(--green); border-radius: 11px; background: transparent; color: var(--green); font-weight: 700; white-space: nowrap; }
.import-button:hover { background: rgba(24,79,67,.07); }
.import-message { max-width: 680px; margin: -8px auto 18px; color: var(--green); font-size: 12px; }
.import-message.error { color: #a13e2b; }
.custom-warning { max-width: 680px; margin: -8px auto 18px; padding: 10px 13px; border: 1px solid rgba(190,120,28,.28); border-radius: 10px; background: #fff6df; color: #81550d; font-size: 12px; line-height: 1.55; text-align: left; }
.visually-hidden { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0,0,0,0) !important; white-space: nowrap !important; border: 0 !important; }
.trainer-card { width: min(100%, 620px); max-width: 100%; height: 590px; margin: 0 auto; display: flex; flex-direction: column; background: #fffdf8; border: 1px solid rgba(29,41,37,.16); border-radius: 22px; padding: 20px 26px 24px; box-shadow: 0 18px 46px rgba(48,47,38,.08); overflow-x: clip; touch-action: pan-y; }
.card-topline { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #77817d; }
.card-tools { display: flex; align-items: center; justify-content: flex-end; gap: 14px; }
.card-meta { display: flex; align-items: center; gap: 10px; }
.meaning-toggle { border: 0; padding: 0; background: transparent; color: #76807c; font-size: 13px; font-weight: 700; text-decoration: underline; text-underline-offset: 4px; }
.meaning-toggle.active { color: var(--green); }
.meaning-toggle:hover { color: var(--orange); }
.back-to-library { border: 0; padding: 0; background: transparent; color: var(--green); font-size: 13px; font-weight: 700; text-decoration: underline; text-underline-offset: 4px; }
.back-to-library:hover { color: var(--orange); }
.mode-switch { display: flex; padding: 3px; border: 1px solid var(--line); border-radius: 10px; background: #f3f1eb; }
.mode-switch button { min-width: 56px; height: 32px; padding: 0 12px; border: 0; border-radius: 7px; background: transparent; color: #6a7570; font-size: 13px; font-weight: 700; }
.mode-switch button.active { background: var(--green); color: white; box-shadow: 0 2px 8px rgba(24,79,67,.16); }
.level { background: #e7efe9; color: var(--green); padding: 5px 10px; border-radius: 999px; font-weight: 600; }
.level.mistakes { background: #fff0e8; color: var(--orange); }
.progress-track { height: 3px; background: #e8e7e0; margin: 12px 0 0; overflow: hidden; border-radius: 3px; }
.progress-track span { display: block; height: 100%; background: var(--orange); transition: width .35s ease; }
.question-state { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; align-items: center; padding-top: 38px; overflow-x: hidden; overflow-y: auto; touch-action: pan-y; }
.sound-button { flex: 0 0 auto; width: 88px; height: 88px; min-width: 88px; min-height: 88px; margin-top: 0; border: 0; border-radius: 50%; color: white; background: var(--green); position: relative; display: grid; place-items: center; box-shadow: 0 10px 26px rgba(24,79,67,.18); transition: transform .2s; }
.sound-button:hover { transform: scale(1.04); }
.sound-button:active { transform: scale(.97); }
.play-icon { width: 45px; height: 45px; transform: translateX(2px); margin-top: -40px;}
.play-icon path { fill: white; }
.sound-rings i { position: absolute; inset: -1px; border: 1px solid rgba(24,79,67,.12); border-radius: 50%; }
.sound-rings i:nth-child(2) { inset: -8px; }
.sound-rings i:nth-child(3) { inset: -16px; }
.listen-label { margin: 18px 0 6px; font-size: 16px; color: #66716d; }
.hint-switches { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 4px 0 0; }
.hint-switch { min-width: 64px; height: 30px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: 1px solid rgba(24,79,67,.18); border-radius: 999px; background: #e7efe9; color: var(--green); font-size: 14px; font-weight: 800; padding: 0 13px; transition: background .18s ease, color .18s ease, border-color .18s ease, box-shadow .18s ease; }
.hint-switch.active { background: var(--orange); border-color: var(--orange); color: white; box-shadow: 0 6px 16px rgba(226,100,61,.16); }
.switch-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(24,79,67,.35); }
.hint-switch.active .switch-dot { background: #a13e2b; box-shadow: 0 0 0 3px rgba(255,255,255,.22); }
.syllable-hint { display: inline-flex; align-items: baseline; justify-content: center; flex-wrap: wrap; gap: 7px; margin: 4px 0 0; color: #66716d; font-size: 16px; letter-spacing: .04em; }
.syllable-hint span { font-weight: 500; }
.syllable-hint .stressed { color: var(--green); font-weight: 800; }
.syllable-hint i { color: #a7aea9; font-style: normal; font-weight: 700; }
.result-syllables { margin: -14px 0 20px; }
.learning-meaning { width: 100%; margin: 14px 0 0; padding: 12px 16px; border-radius: 12px; background: #f3f0e8; color: #4d5a55; font-size: 15px; line-height: 1.55; text-align: center; }
.learning-meaning.hidden { visibility: hidden; pointer-events: none; }
.learning-meaning span { display: block; margin-bottom: 4px; color: #7a8580; font-size: 12px; font-weight: 700; letter-spacing: .12em; }
.learning-meaning strong { color: var(--ink); font-size: 17px; }
.answer-label { align-self: stretch; font-size: 16px; font-weight: 600; margin: 18px 0 7px; text-align: center; }
.answer-wrap { position: relative; width: 100%; max-width: 100%; overflow: hidden; }
.answer-input { width: 100%; background: #f7f5ef; border: 1px solid #d9d9d1; border-radius: 12px; padding: 14px 18px; font-size: 24px; letter-spacing: .14em; color: var(--ink); caret-color: transparent; outline: none; text-align: center; }
.answer-input:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(24,79,67,.1); }
.answer-input::placeholder { color: #a6aaa6; letter-spacing: 0; font-size: 17px; }
.guided-answer { position: absolute; inset: 0; z-index: 1; display: flex; align-items: center; justify-content: center; max-width: 100%; padding: 14px 18px; color: var(--ink); font-size: 24px; letter-spacing: .14em; pointer-events: none; white-space: pre; overflow: hidden; }
.guided-syllable { display: inline-flex; align-items: center; justify-content: center; }
.guided-syllable.stressed .guided-remainder { color: rgba(24,79,67,.46); font-weight: 700; }
.guided-separator { color: rgba(24,79,67,.23); margin: 0 .12em; font-weight: 700; }
.guided-typed { color: var(--ink); }
.guided-wrong { color: #d84b32; font-weight: 700; }
.guided-remainder { color: rgba(24,79,67,.25); }
.answer-input.learning-input { position: relative; z-index: 2; background: transparent; color: transparent; caret-color: transparent; }
.learning-instruction { align-self: stretch; margin: 8px 0 0; color: #7a8580; font-size: 15px; line-height: 1.5; text-align: center; white-space: nowrap; }
.learning-instruction span { display: block; }
.learning-skip { margin-top: auto; padding: 11px 18px; border: 0; background: transparent; color: #76807c; font-size: 14px; text-decoration: underline; text-underline-offset: 3px; }
.actions { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; width: 100%; margin-top: auto; padding-top: 22px; }
.primary, .secondary { border-radius: 12px; padding: 15px 20px; border: 1px solid var(--green); font-size: 16px; font-weight: 600; }
.primary { background: var(--green); color: white; }
.primary:disabled { opacity: .4; cursor: not-allowed; }
.primary span { margin-left: 10px; opacity: .7; }
.secondary { background: transparent; color: var(--green); }
.result-state { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; text-align: center; overflow-x: hidden; overflow-y: auto; touch-action: pan-y; animation: appear .3s ease; }
.result-content { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: center; padding: 10px 0 20px; }
.result-icon { width: 52px; height: 52px; margin: 0 auto 14px; border-radius: 50%; display: grid; place-items: center; font-size: 28px; font-weight: 600; }
.correct .result-icon { color: var(--green); background: var(--mint); }
.wrong .result-icon { color: #a13e2b; background: #f8d8cc; }
.result-kicker { color: #66716d; margin: 0 0 9px; font-size: 16px; }
.word-result { max-width: 100%; min-height: 70px; overflow-wrap: anywhere; font-family: 'Playfair Display', serif; font-size: clamp(36px, 8vw, 58px); font-weight: 700; letter-spacing: .02em; }
.word-result .missing, .word-result .wrong { color: var(--orange); border-bottom: 3px solid var(--orange); }
.phonetic { color: #78817e; margin: 4px 0 26px; font-size: 16px; }
.learning-panel { text-align: left; background: #f3f0e8; border-radius: 14px; padding: 4px 18px; }
.learning-panel > div { display: grid; grid-template-columns: 90px 1fr; gap: 12px; padding: 14px 0; border-bottom: 1px solid rgba(29,41,37,.1); }
.learning-panel > div:last-child { border-bottom: 0; }
.panel-label { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: #79817d; padding-top: 3px; }
.learning-panel strong, .learning-panel p { margin: 0; font-size: 16px; line-height: 1.65; }
.next-button { width: 100%; margin-top: auto; }
@keyframes appear { from { opacity: 0; transform: translateY(8px); } }

@media (max-width: 980px) {
  main { width: min(100% - 32px, 680px); }
}

@media (max-width: 640px) {
  .topbar { height: 64px; padding: 0 12px; gap: 10px; overflow: hidden; }
  .header-stats > span { display: none; }
  .header-stats { gap: 8px; }
  .brand { font-size: 16px; }
  .brand-mark { width: 32px; height: 32px; }
  .intro { padding: 34px 0 22px; }
  .intro h1 { font-size: 42px; }
  .trainer-card { height: 590px; padding: 18px 16px 20px; border-radius: 20px; }
  .card-topline { align-items: center; gap: 10px; }
  .card-tools { flex: 1; min-width: 0; flex-direction: row; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: nowrap; }
  .card-meta { flex-shrink: 0; flex-direction: row; align-items: center; gap: 6px; }
  .meaning-toggle { flex-shrink: 0; font-size: 12px; white-space: nowrap; }
  .back-to-library { font-size: 12px; }
  .mode-switch button { min-width: 50px; padding: 0 8px; }
  .practice-area { padding-bottom: 34px; }
  .site-footer { padding-bottom: 28px; font-size: 12px; }
  .dictionary-toolbar { align-items: end; flex-direction: row; gap: 8px; }
  .dictionary-select select { font-size: 14px; padding-left: 11px; padding-right: 30px; }
  .import-button { width: auto; min-width: 88px; padding: 0 12px; font-size: 14px; }
  .progress-track { margin-bottom: 0; }
  .question-state { padding-top: 32px; }
  .sound-button { width: 78px; height: 78px; min-width: 78px; min-height: 78px; margin-top: 0; }
  .play-icon { width: 26px; height: 26px; transform: translateX(2px); }
  .listen-label, .answer-label { font-size: 16px; }
  .hint-switch, .learning-instruction { font-size: 15px; }
  .syllable-hint { font-size: 15px; gap: 6px; }
  .answer-input, .guided-answer { font-size: 22px; letter-spacing: .1em; }
  .actions { grid-template-columns: 1fr; }
  .actions .secondary { order: 2; }
  .learning-panel > div { grid-template-columns: 1fr; gap: 3px; }
}
</style>

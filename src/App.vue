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
        <p class="section-label">{{ t.path }}</p>
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
          <input ref="fileInput" class="visually-hidden" type="file" accept=".json,application/json" @change="handleImport" />
        </div>
        <p v-if="importMessage" class="import-message" role="status">{{ importMessage }}</p>
        <p v-if="importError" class="import-message error" role="alert">{{ importError }}</p>
        <div class="practice-layout">
          <aside class="practice-rail" aria-label="Practice steps 1 and 2">
            <article class="step-card"><b>01</b><span>Listen</span><p>{{ t.step1 }}</p></article>
            <article class="step-card"><b>02</b><span>Spell</span><p>{{ t.step2 }}</p></article>
          </aside>

          <section class="trainer-card" aria-live="polite">
        <div class="card-topline"><span class="counter">{{ index + 1 }} / {{ shuffled.length }}</span><span class="level">{{ levelLabel }}</span></div>
        <div class="progress-track"><span :style="{ width: `${progress}%` }"></span></div>

        <div v-if="result === 'idle'" class="question-state">
          <button class="sound-button" type="button" :aria-label="t.playAria" @click="speak(slowMode)"><span class="sound-rings"><i></i><i></i><i></i></span><span class="speaker">▶</span></button>
          <p class="listen-label">{{ t.listen }}</p>
          <button class="slow-toggle" :class="{ active: slowMode }" type="button" @click="slowMode = !slowMode; speak(slowMode)">{{ slowMode ? t.slowOn : t.slowOff }}</button>
          <label class="answer-label" for="answer">{{ t.answerLabel }}</label>
          <input id="answer" ref="input" v-model="answer" class="answer-input" type="text" inputmode="text" autocomplete="off" autocapitalize="none" spellcheck="false" :placeholder="t.placeholder" @keyup.enter="handleEnter" />
          <div class="actions"><button class="secondary" type="button" @click="skip">{{ t.skip }}</button><button class="primary" type="button" :disabled="!answer.trim()" @click="check">{{ t.check }} <span>↵</span></button></div>
        </div>

        <div v-else class="result-state" :class="result">
          <div class="result-icon">{{ result === 'correct' ? '✓' : '×' }}</div>
          <p class="result-kicker">{{ result === 'correct' ? t.correct : errorMessage }}</p>
          <div class="word-result" :aria-label="`${t.correctSpelling} ${current.word}`"><span v-for="(part, i) in diff" :key="i" :class="part.type">{{ part.char }}</span></div>
          <p v-if="current.phonetic" class="phonetic">{{ current.phonetic }}</p>
          <div class="learning-panel">
            <div><span class="panel-label">{{ t.meaning }}</span><strong>{{ currentMeaning }}</strong></div>
            <div v-if="currentTip"><span class="panel-label">{{ t.tip }}</span><p>{{ currentTip }}</p></div>
            <div v-if="current.example"><span class="panel-label">{{ t.example }}</span><p>{{ current.example }}</p></div>
          </div>
          <button class="primary next-button" type="button" @click="next">{{ isLast ? t.restart : t.next }} <span>→</span></button>
        </div>
          </section>

          <aside class="practice-rail" aria-label="Practice steps 3 and 4">
            <article class="step-card"><b>03</b><span>Understand</span><p>{{ t.step3 }}</p></article>
            <article class="step-card"><b>04</b><span>Remember</span><p>{{ t.step4 }}</p></article>
          </aside>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { dictionaries, words } from './data/words'

const copy = {
  zh: {
    localeName: '中文', brandAria: 'EchoSpell 首页', streak: '连对', accuracy: '正确率', mistakes: '错词',
    eyebrow: 'LEARN SPELLING THROUGH LISTENING', titleStart: '听见，然后', titleAccent: '写对。',
    subtitle: '专为“会念但不会写”设计的英语拼写练习。', basic: '基础', advanced: '进阶', challenge: '挑战',
    playAria: '播放单词发音', listen: '点击播放 · 听清楚这个词', slowOn: '慢速已开', slowOff: '慢速播放',
    answerLabel: '写下你听到的单词', placeholder: 'Type what you hear', skip: '跳过', check: '检查拼写',
    correct: '拼对了！', correctSpelling: '正确拼写', meaning: '意思', tip: '记忆提示', example: '例句',
    restart: '重新练习', next: '下一个单词', path: '你的练习路径', dictionary: '当前词库', importJson: '导入 JSON', wordUnit: '词',
    imported: '已导入', invalidImport: '无法导入：请选择包含 words 数组的有效 JSON 词库。',
    step1: '先用耳朵认识它', step2: '自己写出拼写', step3: '理解错误与含义', step4: '错词会再次出现',
    close: '很接近。', missing: '你漏掉了', position: '注意这些字母的位置', retry: '再听一次，注意每个音节。',
  },
  ja: {
    localeName: '日本語', brandAria: 'EchoSpell ホーム', streak: '連続正解', accuracy: '正解率', mistakes: '苦手',
    eyebrow: 'LEARN SPELLING THROUGH LISTENING', titleStart: '聞いて、そして', titleAccent: '書ける。',
    subtitle: '「読めるのに書けない」を解決する英単語スペリング練習。', basic: '基礎', advanced: '応用', challenge: 'チャレンジ',
    playAria: '英単語の発音を再生', listen: 'タップして、単語をよく聞こう', slowOn: 'ゆっくり再生中', slowOff: 'ゆっくり再生',
    answerLabel: '聞こえた英単語を入力してください', placeholder: '聞こえた単語を入力', skip: 'スキップ', check: 'スペルを確認',
    correct: '正解！', correctSpelling: '正しいスペル', meaning: '意味', tip: '覚え方', example: '例文',
    restart: 'もう一度練習', next: '次の単語', path: '学習の流れ', dictionary: '単語帳', importJson: 'JSONを読み込む', wordUnit: '語',
    imported: '読み込み完了', invalidImport: '読み込めません。有効な words 配列を含む JSON を選択してください。',
    step1: 'まず耳で単語を知る', step2: '自分でスペルを書く', step3: '間違いと意味を理解', step4: '苦手な単語をもう一度',
    close: 'もう少しです。', missing: '抜けている文字', position: '文字の位置に注意', retry: 'もう一度聞いて、音節を意識しましょう。',
  },
}

const savedLocale = localStorage.getItem('echospell-locale')
const locale = ref(savedLocale || (navigator.language.startsWith('ja') ? 'ja' : 'zh'))
const t = computed(() => copy[locale.value])
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
const sessionMode = ref('all')
const customDictionary = ref(readStoredDictionary())
const selectedDictionaryId = ref(localStorage.getItem('echospell-dictionary') || 'cet4-high-frequency')
const importMessage = ref('')
const importError = ref('')

const availableDictionaries = computed(() => customDictionary.value ? [...dictionaries, customDictionary.value] : dictionaries)
const activeDictionary = computed(() => availableDictionaries.value.find(item => item.id === selectedDictionaryId.value) || dictionaries[0])
const activeWords = computed(() => activeDictionary.value.words.map(normalizeWord).filter(Boolean))
const current = computed(() => shuffled.value[index.value] || activeWords.value[0] || words[0])
const progress = computed(() => shuffled.value.length ? ((index.value + (result.value === 'idle' ? 0 : 1)) / shuffled.value.length) * 100 : 0)
const accuracy = computed(() => totalCount.value ? Math.round((correctCount.value / totalCount.value) * 100) : 0)
const isLast = computed(() => index.value >= shuffled.value.length - 1)
const levelLabel = computed(() => t.value[current.value.level] || t.value.basic)
const currentMeaning = computed(() => localize(current.value.meaning) || '—')
const currentTip = computed(() => localize(current.value.tip))

watch(locale, value => {
  localStorage.setItem('echospell-locale', value)
  document.documentElement.lang = value === 'ja' ? 'ja' : 'zh-CN'
  document.title = value === 'ja' ? 'EchoSpell — 聞いて、書ける。' : 'EchoSpell — 听见，然后写对'
})

function shuffle(items) { return [...items].sort(() => Math.random() - 0.5) }

function readStoredDictionary() {
  try {
    return JSON.parse(localStorage.getItem('echospell-custom-dictionary') || 'null')
  } catch {
    return null
  }
}

function localize(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[locale.value] || value.zh || value.ja || Object.values(value)[0] || ''
}

function dictionaryName(dictionary) {
  return localize(dictionary.name) || dictionary.id
}

function normalizeWord(item) {
  const source = typeof item === 'string' ? { word: item } : item
  if (!source || typeof source.word !== 'string') return null
  const word = source.word.trim()
  if (!word || !/^[A-Za-z][A-Za-z '\-]*$/.test(word)) return null
  const meaning = typeof source.meaning === 'string' ? { zh: source.meaning } : (source.meaning || {})
  const tip = typeof source.tip === 'string' ? { zh: source.tip } : (source.tip || {})
  return {
    word,
    phonetic: source.phonetic || '',
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

async function handleImport(event) {
  importMessage.value = ''
  importError.value = ''
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const parsed = JSON.parse(await file.text())
    const sourceWords = Array.isArray(parsed) ? parsed : parsed.words
    if (!Array.isArray(sourceWords)) throw new Error('missing words')

    const unique = new Map()
    for (const item of sourceWords) {
      const normalized = normalizeWord(item)
      if (normalized) unique.set(normalized.word.toLowerCase(), normalized)
    }
    const importedWords = [...unique.values()]
    if (!importedWords.length) throw new Error('empty words')

    const imported = {
      id: 'custom-import',
      name: parsed.name || file.name.replace(/\.json$/i, ''),
      description: parsed.description || '',
      words: importedWords
    }
    customDictionary.value = imported
    selectedDictionaryId.value = imported.id
    localStorage.setItem('echospell-custom-dictionary', JSON.stringify(imported))
    localStorage.setItem('echospell-dictionary', imported.id)
    importMessage.value = `${t.value.imported} ${importedWords.length} ${t.value.wordUnit}`
    startSession('all')
  } catch {
    importError.value = t.value.invalidImport
  } finally {
    event.target.value = ''
  }
}

function startSession(mode = sessionMode.value) {
  sessionMode.value = mode
  const pool = mode === 'mistakes' ? activeWords.value.filter(item => mistakes.value.includes(item.word)) : activeWords.value
  shuffled.value = shuffle(pool.length ? pool : activeWords.value)
  index.value = 0; answer.value = ''; result.value = 'idle'; streak.value = 0; correctCount.value = 0; totalCount.value = 0
  nextTick(() => input.value?.focus())
}

function speak(slow = false) {
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(current.value.word)
  utterance.lang = 'en-US'; utterance.rate = slow ? 0.62 : 0.86; utterance.pitch = 1
  window.speechSynthesis.speak(utterance)
}

function normalize(value) { return value.trim().toLowerCase() }

function saveMistakes() { localStorage.setItem('echospell-mistakes', JSON.stringify(mistakes.value)) }

function check() {
  if (!answer.value.trim() || result.value !== 'idle') return
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

function handleEnter() { result.value === 'idle' ? check() : next() }

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
    selectedDictionaryId.value = 'cet4-high-frequency'
  }
  startSession()
})
</script>

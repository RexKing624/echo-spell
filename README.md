# EchoSpell

> Hear it. Spell it. Remember it.

EchoSpell is a browser-based English spelling trainer for learners who can recognize or pronounce a word but struggle to write it correctly.

[中文](#中文) · [日本語](#日本語) · [English](#english)

---

## 中文

### 简介

EchoSpell 是一款面向中文和日文用户的英语听音拼写练习工具，专门解决“会念、听得懂，但不会写”的问题。

练习流程很简单：

**听发音 → 输入拼写 → 查看错误 → 理解词义 → 复习错词**

### 功能

- 浏览器英语发音，支持正常和慢速播放
- 慢速和音节提示使用独立开关，开启状态会高亮显示
- 输入单词后立即检查拼写
- 练习模式高亮漏写或写错的字母
- 学习模式显示浅色拼写提示，并实时标红输入错误的字母
- 中文与日文界面切换
- 中文、日文释义和记忆提示
- 可选音节提示；内置四级词库已补充音节和主重音，用户导入词库也可提供音节数据
- 英语音标与例句
- 自动保存错词并集中复习，错词练习中可一键回到词库练习
- 学习 / 练习双模式：学习模式照写并自动进入下一词，练习模式独立拼写并纠错
- 支持 JSON、CSV、TSV、TXT、Excel 和 DOCX 词库导入
- 学习记录保存在本地浏览器，无需账号
- 适配电脑和手机

### 本地运行

```bash
npm install
npm run dev
```

打开 [http://127.0.0.1:5173](http://127.0.0.1:5173)。

### 构建

```bash
npm run build
```

---

## 日本語

### 概要

EchoSpell は、英単語を「読める・聞き取れるのに、正しく書けない」という学習者のためのスペリング練習ツールです。中国語と日本語のインターフェースに対応しています。

学習の流れ：

**発音を聞く → スペルを入力 → 間違いを確認 → 意味を理解 → 苦手な単語を復習**

### 主な機能

- ブラウザによる英語音声の通常・低速再生
- 低速再生と音節ヒントは独立したスイッチで切り替え
- 入力したスペルをすぐにチェック
- 練習モードで抜けた文字や間違えた文字をハイライト表示
- 学習モードで薄いスペル見本を表示し、入力ミスをリアルタイムで赤く表示
- 中国語・日本語インターフェースの切り替え
- 中国語・日本語の意味と覚え方
- 任意の音節ヒント。内蔵 CET-4 単語帳には音節と主アクセントを追加済みで、読み込み単語帳でも利用可能
- 英語の発音記号と例文
- 間違えた単語を自動保存して復習、苦手練習から単語帳練習へすぐ戻れる
- 学習 / 練習モード：学習では見本を写して自動で次へ、練習では自力でスペルを確認
- JSON、CSV、TSV、TXT、Excel、DOCX の単語帳読み込み
- アカウント不要、学習記録はブラウザ内に保存
- PC・スマートフォン対応

### ローカルで起動

```bash
npm install
npm run dev
```

[http://127.0.0.1:5173](http://127.0.0.1:5173) を開いてください。

### ビルド

```bash
npm run build
```

---

## English

### About

EchoSpell is an English spelling trainer designed for learners who can hear or say a word but cannot always spell it correctly. The interface supports both Chinese and Japanese learners.

The learning loop is intentionally simple:

**Listen → Spell → Check mistakes → Understand → Review**

### Features

- Normal and slow English pronunciation using browser speech synthesis
- Separate switches for slow playback and syllable hints
- Immediate spelling feedback
- Highlights missing and incorrect letters in Practice mode
- Shows a pale spelling guide in Learn mode and marks wrong typed letters in red
- Chinese and Japanese interface switcher
- Bilingual meanings and memory tips
- Optional syllable hints; the built-in CET-4 list includes syllables and primary stress, and imported dictionaries can provide them too
- English phonetics and example sentences
- Automatic mistake list, focused review, and a quick return to regular dictionary practice
- Learn / Practice modes: guided copying with auto-advance or independent spelling checks
- Dictionary imports from JSON, CSV, TSV, TXT, Excel, and DOCX
- Local browser storage with no account required
- Responsive layout for desktop and mobile

### Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

### Build

```bash
npm run build
```

---

## Tech stack

- Vue 3
- Vite
- Web Speech API (`SpeechSynthesis`)
- Local Storage
- `xlsx` and `mammoth` for browser-side dictionary import parsing

## Import format · 导入格式 · インポート形式

EchoSpell includes the cleaned CET-4 high-frequency dictionary in `src/data/cet4-high-frequency.json`, with Chinese/Japanese meanings, spelling syllables, and primary stress indexes. Users can also import JSON, CSV, TSV, TXT, Excel, or DOCX dictionaries from the page.

EchoSpell 已内置清洗后的四级高频词库 `src/data/cet4-high-frequency.json`，包含中文/日文释义、拼写音节和主重音索引；也支持从页面导入 JSON、CSV、TSV、TXT、Excel 或 DOCX 词库。旧版 `.doc` 请先另存为 `.docx`。

EchoSpell には整理済みの中国大学英語四級頻出単語帳 `src/data/cet4-high-frequency.json` が含まれており、中国語/日本語の意味、スペリング音節、主アクセント位置を収録しています。JSON、CSV、TSV、TXT、Excel、DOCX を読み込めます。旧形式の `.doc` は `.docx` に変換してください。

```json
{
  "name": {
    "zh": "我的词库",
    "ja": "マイ単語帳"
  },
  "words": [
    {
      "word": "environment",
      "phonetic": "/ɪnˈvaɪrənmənt/",
      "syllables": ["en", "vi", "ron", "ment"],
      "stressIndex": 1,
      "meaning": {
        "zh": "环境",
        "ja": "環境"
      },
      "example": "A quiet environment helps me focus.",
      "tip": {
        "zh": "不要漏掉中间的 n。",
        "ja": "途中の n を忘れずに。"
      }
    }
  ]
}
```

Only `word` is required. `meaning`, `phonetic`, `syllables`, `stressIndex`, `example`, and `tip` are optional. An array such as `["apple", "banana"]` is also accepted.

只有 `word` 是必填字段；`meaning`、`phonetic`、`syllables`、`stressIndex`、`example`、`tip` 均可省略。也可以直接导入 `["apple", "banana"]` 这样的数组。

必須項目は `word` のみです。`meaning`、`phonetic`、`syllables`、`stressIndex`、`example`、`tip` は省略できます。`["apple", "banana"]` のような配列も読み込めます。

`syllables` may be an array or a string such as `"en-vi-ron-ment"`. EchoSpell does not automatically guess syllables from spelling; imported syllable and stress data should be reviewed by the user.

`syllables` 可以是数组，也可以是 `"en-vi-ron-ment"` 这样的字符串。EchoSpell 不会仅根据拼写自动猜测音节；用户导入的音节和重音数据需要自行核对。

`syllables` は配列でも、`"en-vi-ron-ment"` のような文字列でも構いません。EchoSpell はスペルだけから音節を自動推測しません。読み込んだ音節・アクセント情報はユーザー自身で確認してください。

> Imported dictionaries are user-provided and are not verified by EchoSpell. Spelling, meanings, and formatting should be reviewed by the user.
>
> 用户导入的词库并非 EchoSpell 内置内容，未经校验；请自行核对拼写、释义和格式。
>
> ユーザーが読み込んだ単語帳は EchoSpell 内蔵ではなく未検証です。スペル・意味・形式を各自で確認してください。

## Project structure

```text
echo-spell/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.vue
    ├── main.js
    ├── data/
    │   ├── cet4-high-frequency.json
    │   └── words.js
    └── utils/
        └── importDictionary.js
```

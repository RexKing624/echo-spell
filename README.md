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
- 输入单词后立即检查拼写
- 高亮漏写或写错的字母
- 中文与日文界面切换
- 中文、日文释义和记忆提示
- 英语音标与例句
- 自动保存错词并集中复习
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
- 入力したスペルをすぐにチェック
- 抜けた文字や間違えた文字をハイライト表示
- 中国語・日本語インターフェースの切り替え
- 中国語・日本語の意味と覚え方
- 英語の発音記号と例文
- 間違えた単語を自動保存して復習
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
- Immediate spelling feedback
- Highlights missing and incorrect letters
- Chinese and Japanese interface switcher
- Bilingual meanings and memory tips
- English phonetics and example sentences
- Automatic mistake list and focused review
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

## Import format · 导入格式 · インポート形式

EchoSpell includes the cleaned CET-4 high-frequency dictionary in `src/data/cet4-high-frequency.json`. Users can also import their own JSON dictionary from the page.

EchoSpell 已内置清洗后的四级高频词库 `src/data/cet4-high-frequency.json`，也支持用户从页面直接导入自己的 JSON 词库。

EchoSpell には整理済みの中国大学英語四級頻出単語帳 `src/data/cet4-high-frequency.json` が含まれています。画面から自分の JSON 単語帳を読み込むこともできます。

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

Only `word` is required. `meaning`, `phonetic`, `example`, and `tip` are optional. An array such as `["apple", "banana"]` is also accepted.

只有 `word` 是必填字段；其他字段均可省略。也可以直接导入 `["apple", "banana"]` 这样的数组。

必須項目は `word` のみです。ほかの項目は省略できます。`["apple", "banana"]` のような配列も読み込めます。

## Project structure

```text
echo-spell/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.vue
    ├── main.js
    ├── style.css
    └── data/
        └── words.js
```

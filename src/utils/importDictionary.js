const WORD_HEADERS = ['word', 'english', 'vocabulary', '单词', '英文', '词汇', '単語', '英単語'];
const MEANING_HEADERS = ['meaning', 'definition', '释义', '意思', '中文', '意味', '訳'];
const PHONETIC_HEADERS = ['phonetic', 'pronunciation', '音标', '発音記号'];
const EXAMPLE_HEADERS = ['example', 'sentence', '例句', '例文'];
const TIP_HEADERS = ['tip', 'note', '提示', '记忆', 'メモ', '覚え方'];

function cleanHeader(value) {
  return String(value ?? '').trim().toLowerCase();
}

function headerIndex(row, candidates) {
  return row.findIndex(cell => candidates.includes(cleanHeader(cell)));
}

function normalizeRow(word, meaning = '', phonetic = '', example = '', tip = '') {
  const cleanWord = String(word ?? '').trim();
  if (!/^[A-Za-z][A-Za-z '\-]*$/.test(cleanWord)) return null;
  return {
    word: cleanWord,
    meaning: meaning ? { zh: String(meaning).trim() } : {},
    phonetic: String(phonetic ?? '').trim(),
    example: String(example ?? '').trim(),
    tip: tip ? { zh: String(tip).trim() } : {},
    level: 'basic'
  };
}

function rowsToWords(rows) {
  const usableRows = rows.filter(row => Array.isArray(row) && row.some(cell => String(cell ?? '').trim()));
  if (!usableRows.length) return [];

  const header = usableRows[0];
  const wordColumn = headerIndex(header, WORD_HEADERS);
  const hasHeader = wordColumn >= 0;
  const meaningColumn = hasHeader ? headerIndex(header, MEANING_HEADERS) : 1;
  const phoneticColumn = hasHeader ? headerIndex(header, PHONETIC_HEADERS) : 2;
  const exampleColumn = hasHeader ? headerIndex(header, EXAMPLE_HEADERS) : 3;
  const tipColumn = hasHeader ? headerIndex(header, TIP_HEADERS) : 4;
  const start = hasHeader ? 1 : 0;

  return usableRows.slice(start).map(row => normalizeRow(
    row[hasHeader ? wordColumn : 0],
    meaningColumn >= 0 ? row[meaningColumn] : '',
    phoneticColumn >= 0 ? row[phoneticColumn] : '',
    exampleColumn >= 0 ? row[exampleColumn] : '',
    tipColumn >= 0 ? row[tipColumn] : ''
  )).filter(Boolean);
}

function textToWords(text) {
  const words = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim().replace(/^\d+[.)、]\s*/, '');
    if (!line) continue;

    if (/[\t|]/.test(line)) {
      const cells = line.split(/[\t|]/).map(value => value.trim());
      const word = normalizeRow(cells[0], cells[1], cells[2], cells[3], cells[4]);
      if (word) words.push(word);
      continue;
    }

    const chineseIndex = line.search(/[\u3400-\u9fff\u3040-\u30ff]/);
    if (chineseIndex >= 0) {
      const englishPart = line.slice(0, chineseIndex).trim();
      const posMatch = englishPart.match(/\s+(?:vi|vt|v|n|a|ad|adv|prep|conj|pron|num|art)\s*\./i);
      const wordText = (posMatch ? englishPart.slice(0, posMatch.index) : englishPart).trim();
      const word = normalizeRow(wordText, line.slice(chineseIndex).trim());
      if (word) words.push(word);
      continue;
    }

    const simple = line.match(/^([A-Za-z][A-Za-z'\-]*)(?:\s*[,;:]\s*|\s+)?(.*)$/);
    if (simple) {
      const word = normalizeRow(simple[1], simple[2]);
      if (word) words.push(word);
    }
  }
  return words;
}

async function spreadsheetToWords(file) {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) return [];
  const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
  return rowsToWords(rows);
}

async function docxToWords(file) {
  const mammothModule = await import('mammoth/mammoth.browser.js');
  const mammoth = mammothModule.default || mammothModule;
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return textToWords(result.value);
}

function jsonToWords(parsed) {
  const source = Array.isArray(parsed) ? parsed : parsed.words;
  if (!Array.isArray(source)) return [];
  return source.map(item => {
    if (typeof item === 'string') return normalizeRow(item);
    if (!item || typeof item !== 'object') return null;
    const meaning = typeof item.meaning === 'string' ? item.meaning : (item.meaning?.zh || item.meaning?.ja || '');
    const tip = typeof item.tip === 'string' ? item.tip : (item.tip?.zh || item.tip?.ja || '');
    const normalized = normalizeRow(item.word, meaning, item.phonetic, item.example, tip);
    if (!normalized) return null;
    normalized.meaning = item.meaning && typeof item.meaning === 'object' ? item.meaning : normalized.meaning;
    normalized.tip = item.tip && typeof item.tip === 'object' ? item.tip : normalized.tip;
    normalized.level = ['basic', 'advanced', 'challenge'].includes(item.level) ? item.level : 'basic';
    return normalized;
  }).filter(Boolean);
}

export async function importDictionaryFile(file) {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  let parsed;
  let words;

  if (extension === 'json') {
    parsed = JSON.parse(await file.text());
    words = jsonToWords(parsed);
  } else if (['xlsx', 'xls', 'csv', 'tsv'].includes(extension)) {
    words = await spreadsheetToWords(file);
  } else if (extension === 'docx') {
    words = await docxToWords(file);
  } else if (extension === 'doc') {
    const error = new Error('legacy-doc');
    error.code = 'legacy-doc';
    throw error;
  } else if (extension === 'txt' || file.type.startsWith('text/')) {
    words = textToWords(await file.text());
  } else {
    const error = new Error('unsupported-file');
    error.code = 'unsupported-file';
    throw error;
  }

  const unique = new Map();
  for (const word of words) unique.set(word.word.toLowerCase(), word);
  const importedWords = [...unique.values()];
  if (!importedWords.length) {
    const error = new Error('empty-file');
    error.code = 'empty-file';
    throw error;
  }

  return {
    id: 'custom-import',
    name: parsed?.name || file.name.replace(/\.[^.]+$/, ''),
    description: parsed?.description || '',
    verified: false,
    sourceType: extension,
    words: importedWords
  };
}

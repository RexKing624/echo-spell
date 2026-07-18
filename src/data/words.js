import cet4HighFrequency from './cet4-high-frequency.json';

export const words = [
  { word: 'necessary', phonetic: '/ˈnesəseri/', syllables: ['nec', 'es', 'sar', 'y'], stressIndex: 0, meaning: { zh: 'adj. 必要的 / 必需的', ja: 'adj. 必要な / 欠かせない' }, example: 'It is necessary to practice every day.', tip: { zh: '一个 c，两个 s：ne-ce-ss-ary。', ja: 'c は1つ、s は2つ：ne-ce-ss-ary。' }, level: 'basic' },
  { word: 'environment', phonetic: '/ɪnˈvaɪrənmənt/', syllables: ['en', 'vi', 'ron', 'ment'], stressIndex: 1, meaning: { zh: 'n. 环境 / 周围状况', ja: 'n. 環境 / 周囲の状況' }, example: 'A quiet environment helps me focus.', tip: { zh: '中间不要漏掉 n：environ + ment。', ja: '途中の n を忘れずに：environ + ment。' }, level: 'basic' },
  { word: 'fascinating', phonetic: '/ˈfæsɪneɪtɪŋ/', syllables: ['fas', 'ci', 'nat', 'ing'], stressIndex: 0, meaning: { zh: 'adj. 极有吸引力的 / 迷人的 / 有趣的', ja: 'adj. とても魅力的な / 興味深い / 夢中にさせる' }, example: 'The documentary was fascinating.', tip: { zh: '来自 fascinate，s 后面还有一个 c。', ja: 'fascinate が語源。s の後に c が入ります。' }, level: 'advanced' },
  { word: 'consequence', phonetic: '/ˈkɒnsɪkwens/', syllables: ['con', 'se', 'quence'], stressIndex: 0, meaning: { zh: 'n. 结果 / 后果', ja: 'n. 結果 / 影響 / 成り行き' }, example: 'Every decision has a consequence.', tip: { zh: '把 sequence 整体放进 con-sequence。', ja: 'sequence をそのまま入れて con-sequence。' }, level: 'advanced' },
  { word: 'accommodate', phonetic: '/əˈkɒmədeɪt/', syllables: ['ac', 'com', 'mo', 'date'], stressIndex: 1, meaning: { zh: 'v. 容纳 / 适应 / 提供住宿', ja: 'v. 収容する / 適応させる / 宿泊させる' }, example: 'The room can accommodate six people.', tip: { zh: '双 c 加双 m：ac-com-modate。', ja: 'c も m も2つ：ac-com-modate。' }, level: 'challenge' },
  { word: 'recommend', phonetic: '/ˌrekəˈmend/', syllables: ['rec', 'om', 'mend'], stressIndex: 2, meaning: { zh: 'v. 推荐 / 建议', ja: 'v. 勧める / 推薦する / 助言する' }, example: 'I recommend this book to beginners.', tip: { zh: '一个 c，两个 m：re-com-mend。', ja: 'c は1つ、m は2つ：re-com-mend。' }, level: 'basic' },
  { word: 'pronunciation', phonetic: '/prəˌnʌnsiˈeɪʃən/', syllables: ['pro', 'nun', 'ci', 'a', 'tion'], stressIndex: 3, meaning: { zh: 'n. 发音 / 读音', ja: 'n. 発音 / 読み方' }, example: 'Her pronunciation is very clear.', tip: { zh: '不是 pronounciation：这里没有第二个 o。', ja: 'pronounciation ではなく、2つ目の o はありません。' }, level: 'advanced' },
  { word: 'separate', phonetic: '/ˈsepərət/', syllables: ['sep', 'a', 'rate'], stressIndex: 0, meaning: { zh: 'adj. 分开的；v. 使分开 / 分离', ja: 'adj. 別々の；v. 分ける / 分離する' }, example: 'Keep the two ideas separate.', tip: { zh: '中间是 par：se-par-ate。', ja: '真ん中は par：se-par-ate。' }, level: 'basic' },
  { word: 'achievement', phonetic: '/əˈtʃiːvmənt/', syllables: ['a', 'chieve', 'ment'], stressIndex: 1, meaning: { zh: 'n. 成就 / 成绩 / 达成', ja: 'n. 達成 / 成果 / 業績' }, example: 'Finishing the course was a real achievement.', tip: { zh: 'i 在 e 前：achieve + ment。', ja: 'i が e より前：achieve + ment。' }, level: 'advanced' },
  { word: 'embarrassed', phonetic: '/ɪmˈbærəst/', syllables: ['em', 'bar', 'rassed'], stressIndex: 1, meaning: { zh: 'adj. 尴尬的 / 窘迫的', ja: 'adj. 恥ずかしい / きまりの悪い' }, example: 'I felt embarrassed by my mistake.', tip: { zh: '双 r、双 s：emba-rr-a-ss-ed。', ja: 'r も s も2つ：emba-rr-a-ss-ed。' }, level: 'challenge' },
  { word: 'definitely', phonetic: '/ˈdefɪnətli/', syllables: ['def', 'i', 'nite', 'ly'], stressIndex: 0, meaning: { zh: 'adv. 肯定地 / 当然 / 明确地', ja: 'adv. 間違いなく / 確実に / はっきりと' }, example: 'I will definitely try again.', tip: { zh: '来自 definite，不是 definately。', ja: 'definite が語源。definately ではありません。' }, level: 'advanced' },
  { word: 'opportunity', phonetic: '/ˌɒpəˈtjuːnəti/', syllables: ['op', 'por', 'tu', 'ni', 'ty'], stressIndex: 2, meaning: { zh: 'n. 机会 / 时机', ja: 'n. 機会 / 好機' }, example: 'This is a great opportunity to learn.', tip: { zh: '开头双 p：op-por-tunity。', ja: '最初の p は2つ：op-por-tunity。' }, level: 'basic' }
];

export const dictionaries = [
  cet4HighFrequency,
  {
    id: 'core-spelling',
    name: { zh: '核心易错词', ja: 'スペル基礎単語' },
    description: { zh: '内置的英语易错拼写示例词库。', ja: 'スペルを間違えやすい英単語の基本セットです。' },
    words
  }
];

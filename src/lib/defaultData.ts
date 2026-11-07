import { GlobalConfig, Question, Subject } from '../types';

export const DEFAULT_CONFIG: GlobalConfig = {
  title: '極黑知識挑戰',
  subtitle: '挑戰跨領域全方位智庫 • 答對即抽限額專屬防偽兌換券',
  startButtonText: '立即開始挑戰',
  footerText: '© 2026 極黑知識挑戰 • 智慧防偽數位認證系統',
  adminPasswordHash: '115394',
  voucherTheme: 'gold',
  voucherDiscountTitle: '恭喜獲得 6折 尊爵優惠券',
  voucherDiscountBadge: '6折 / 40% OFF',
  voucherSubtitle: '憑此券於合作門市結帳時出示，由店員點擊現場核銷',
  voucherNotes: '限單次消費折抵使用，憑券現場核銷，核銷後即失效作廢',
  voucherIcon: 'trophy',
  updatedAt: new Date().toISOString(),
};

// High quality clean SVG placeholders for multiple images demonstration
const SVG_GEOMETRY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23050505"><rect width="600" height="400" fill="%230a0a0a" stroke="%23333" stroke-width="2"/><polygon points="300,60 500,340 100,340" fill="none" stroke="%2310b981" stroke-width="4"/><circle cx="300" cy="245" r="95" fill="none" stroke="%23f59e0b" stroke-width="3" stroke-dasharray="6,6"/><text x="300" y="380" fill="%23ffffff" font-size="20" font-family="sans-serif" text-anchor="middle">幾何附圖一：正三角形與內切圓半徑示意圖</text><text x="300" y="250" fill="%23f59e0b" font-size="18" font-family="sans-serif" text-anchor="middle">r = a / (2√3)</text></svg>`;

const SVG_GEOMETRY_EXP = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23050505"><rect width="600" height="400" fill="%230a0a0a" stroke="%23333" stroke-width="2"/><line x1="100" y1="340" x2="300" y2="60" stroke="%2310b981" stroke-width="3"/><line x1="300" y1="60" x2="500" y2="340" stroke="%2310b981" stroke-width="3"/><line x1="100" y1="340" x2="500" y2="340" stroke="%2310b981" stroke-width="3"/><line x1="300" y1="60" x2="300" y2="340" stroke="%233b82f6" stroke-width="3" stroke-dasharray="4,4"/><circle cx="300" cy="245" r="5" fill="%23f59e0b"/><text x="300" y="380" fill="%2310b981" font-size="18" font-family="sans-serif" text-anchor="middle">幾何附圖二：高 h = (√3 / 2) a 之重心與內心重合</text></svg>`;

const SVG_SOLAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23000000"><rect width="600" height="400" fill="%23000000"/><circle cx="80" cy="200" r="60" fill="%23f59e0b"/><circle cx="190" cy="200" r="12" fill="%23a3a3a3"/><circle cx="260" cy="200" r="22" fill="%23eab308"/><circle cx="350" cy="200" r="24" fill="%233b82f6"/><circle cx="440" cy="200" r="16" fill="%23ef4444"/><circle cx="530" cy="200" r="45" fill="%23d97706"/><text x="300" y="360" fill="%23e5e5e5" font-size="20" font-family="sans-serif" text-anchor="middle">天文附圖：太陽系行星距日順序示意圖</text></svg>`;

const SVG_PERIODIC = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23000000"><rect width="600" height="400" fill="%230a0a0a" stroke="%23222" stroke-width="2"/><rect x="150" y="70" width="300" height="240" rx="16" fill="%23171717" stroke="%2310b981" stroke-width="3"/><text x="300" y="140" fill="%2310b981" font-size="32" font-family="sans-serif" font-weight="bold" text-anchor="middle">Au (Gold)</text><text x="300" y="200" fill="%23f59e0b" font-size="60" font-family="sans-serif" font-weight="bold" text-anchor="middle">79</text><text x="300" y="260" fill="%239ca3af" font-size="20" font-family="sans-serif" text-anchor="middle">原子序數 Atomic Number: 79</text><text x="300" y="370" fill="%23ffffff" font-size="18" font-family="sans-serif" text-anchor="middle">元素附圖：化學元素週期表「金」之原子核結構</text></svg>`;

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub_math',
    name: '趣味幾何與數學',
    description: '挑戰邏輯思維、空間幾何與經典數學常識',
    iconName: 'Calculator',
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub_nature',
    name: '自然科學與天文',
    description: '探索宇宙星體、元素週期與物理世界奧秘',
    iconName: 'Atom',
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub_lang',
    name: '文史精選與成語',
    description: '品味古典詩詞典故、文化歷史與文字趣味',
    iconName: 'BookOpen',
    order: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub_life',
    name: '日常生活與常識',
    description: '身邊的生活智慧、地理氣象與趣味百寶箱',
    iconName: 'Sparkles',
    order: 4,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 'q_math_1',
    subjectId: 'sub_math',
    title: '正三角形的內角度數',
    prompt: '在歐幾里得平面幾何中，一個邊長均等之正三角形（如圖示），其每一個內角的角度為多少度？（請輸入數字）',
    imageUrls: [SVG_GEOMETRY, SVG_GEOMETRY_EXP],
    explanation: '三角形的內角和恆為 180 度。正三角形的三個邊長等長，三個內角亦完全相等，因此每個內角度數為 180° ÷ 3 = 60 度。',
    explanationImageUrls: [SVG_GEOMETRY_EXP],
    acceptableAnswers: ['60', '60度', '六十', '六十度', '60°'],
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_math_2',
    subjectId: 'sub_math',
    title: '最小的正質數',
    prompt: '在所有大於 0 的自然數中，最小的質數（素數）且為唯一的偶數質數是哪一個數字？',
    imageUrls: [],
    explanation: '質數定義為大於 1 且只能被 1 和自身整除的正整數。1 既不是質數也不是合數；因此最小的質數為 2，且 2 是全體質數中唯一的偶數。',
    explanationImageUrls: [],
    acceptableAnswers: ['2', '二', 'Two'],
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_nature_1',
    subjectId: 'sub_nature',
    title: '距離太陽最近的行星',
    prompt: '在太陽系的八大行星中，軌道距離太陽最近的是哪一顆行星？（如附圖距日順序所示）',
    imageUrls: [SVG_SOLAR],
    explanation: '太陽系八大行星依距日由近至遠依序為：水星、金星、地球、火星、木星、土星、天王星、海王星。因此距太陽最近的是水星（Mercury）。',
    explanationImageUrls: [SVG_SOLAR],
    acceptableAnswers: ['水星', 'Mercury', '水星行星'],
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_nature_2',
    subjectId: 'sub_nature',
    title: '貴金屬「金」的原子序數',
    prompt: '化學元素週期表中，元素符號為 Au 的「金」，其原子核內包含多少個質子（即其原子序數為多少）？',
    imageUrls: [SVG_PERIODIC],
    explanation: '金（Gold，拉丁名 Aurum，符號 Au）是一種珍貴的過渡金屬，其原子序數為 79，在元素週期表中位於第 6 週期、第 11 族。',
    explanationImageUrls: [SVG_PERIODIC],
    acceptableAnswers: ['79', '七十九'],
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_lang_1',
    subjectId: 'sub_lang',
    title: '李白《靜夜思》詩句填空',
    prompt: '唐代詩仙李白的五言絕句名作《靜夜思》：「床前明月光，疑是地上霜。舉頭望明月，低頭思____。」請填出最後兩個字。',
    imageUrls: [],
    explanation: '李白《靜夜思》全詩：「床前明月光，疑是地上霜。舉頭望明月，低頭思故鄉。」表達了旅居異鄉對家鄉的真摯思念之情。',
    explanationImageUrls: [],
    acceptableAnswers: ['故鄉', '故乡', '家鄉', '家乡'],
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q_life_1',
    subjectId: 'sub_life',
    title: '水在標準大氣壓下的沸點',
    prompt: '在 1 個標準大氣壓（101.325 kPa）環境下，純水的沸點為攝氏幾度？（請輸入數字）',
    imageUrls: [],
    explanation: '在 1 個標準大氣壓下，水達到氣液平衡並劇烈沸騰的溫度定義為攝氏 100 度（100 °C / 212 °F）。',
    explanationImageUrls: [],
    acceptableAnswers: ['100', '100度', '一百', '一百度', '100°C', '100C'],
    order: 1,
    createdAt: new Date().toISOString(),
  },
];

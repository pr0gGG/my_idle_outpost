// Все игровые числа и константы живут здесь. Логика и арт читают только CONFIG.
var CONFIG = {
  SAVE_KEY: 'zastava_save',
  SAVE_VERSION: 1,
  AUTOSAVE_SEC: 5,

  // Логический размер холста; всё масштабируется с сохранением пропорций.
  VIEW: { W: 360, H: 640, SCENE_FRAC: 0.55, GROUND_Y: 300, TABBAR_H: 56, TOPBAR_H: 40, DPR_MAX: 2 },

  MAX_DT: 0.1,              // потолок шага кадра, сек
  DAYNIGHT_TRANSITION_SEC: 2,

  TABS: ['post', 'battle', 'chests', 'inventory'],
  DEFAULT_TAB: 'post',
  NIGHT_TABS: ['battle'],   // на этих вкладках сцена ночная

  BATTLE_MODES: ['campaign', 'sortie'],

  // Порядок валют в полном списке; у каждой токен цвета из PALETTE
  CURRENCIES: ['coins', 'shovels', 'brave', 'gems', 'keys'],
  CURRENCY_COLOR: { coins: 'coin', shovels: 'shovel', brave: 'brave', gems: 'gem', keys: 'ui_accent' },
  // Валюты в верхней полосе по вкладкам
  TAB_CURRENCIES: {
    post: ['coins'],
    battle: ['shovels', 'brave'],
    chests: ['coins'],
    inventory: ['coins'],
  },

  START: { coins: 10, shovels: 0, brave: 0, gems: 0, keys: 0 },

  // ---- Пост: экономика ----
  // Цена перехода с уровня n на n+1: baseCost * growth^n.
  // Доход за цикл: profit * уровень * множитель рубежей. Значения — стартовые, баланс в этапе 8.
  LOCATIONS: [
    {
      id: 'roadside',
      stations: [
        { id: 'tavern',    baseCost: 10,   growth: 1.15, profit: 3,   cycle: 2, color: 'cloth_red',     order: 'food' },
        { id: 'forge',     baseCost: 150,  growth: 1.15, profit: 40,  cycle: 4, color: 'cloth_mustard', order: 'weapon' },
        { id: 'alchemist', baseCost: 2000, growth: 1.15, profit: 720, cycle: 6, color: 'cloth_teal',    order: 'potion' },
      ],
    },
  ],
  // Рубежи уровня станции: множитель дохода. Число рубежей = число деталей внешнего вида (см. ART_GUIDE §4).
  MILESTONES: [
    { level: 10, mult: 2 }, { level: 25, mult: 2 }, { level: 50, mult: 2 },
    { level: 100, mult: 3 }, { level: 200, mult: 3 },
  ],
  BUY_MODES: ['x1', 'x10', 'max'],
  BUY_AMOUNT: { x1: 1, x10: 10 },
  DEFAULT_BUY_MODE: 'x1',

  CUSTOMERS: {
    queueMax: 3,        // включая обслуживаемого
    walkSpeed: 80,      // px/с
    shuffleSpeed: 140,  // шаг вперёд в очереди
    slotGap: 26,        // расстояние между клиентами в очереди
    spawnX: 392,        // вход/выход справа, за краем экрана
    spawnCooldown: 0.6, // пауза между появлениями у одной станции
    firstIncomeMaxSec: 15, // тест: первая прибыль после покупки не позже
  },
  STATION_VIEW: { width: 90, bounceSec: 0.2, bounceScale: 0.08 },

  // Чаевые: шанс за платёж, награда = платёж * coinMult
  TIPS: {
    chance: 0.1, coinMult: 3, maxPerStation: 1,
    shovelChance: 0.04, shovelAmount: 1,
    braveChance: 0.08, braveMin: 1, braveMax: 3,
    hitRadius: 26,
  },

  // Красные точки на вкладках
  NOTIFY_CHECK_SEC: 1,
  INVENTORY_NEAR_FULL: 0.9,

  // Сокращение больших чисел: K, M, B, T, затем aa, ab, ... zz
  NUMBER_SUFFIXES: ['', 'K', 'M', 'B', 'T'],

  PALETTE: {
    sky_day_top: '#f7a25b', sky_day_bot: '#ffd9a0',
    sky_night_top: '#1b1340', sky_night_bot: '#4a2d6b',
    sun: '#ffe08a', moon: '#e6ecff',
    ground_day: '#8a5a3c', ground_night: '#2c2236',
    wood: '#a9683a', wood_dark: '#6e3f25',
    cloth_red: '#c9463d', cloth_teal: '#2f8f8b', cloth_mustard: '#e0a526',
    stone: '#9b8f86', stone_dark: '#6a5f5a',
    skin_1: '#f2c8a0', skin_2: '#d9a577', skin_3: '#b07a52', skin_4: '#7e5236',
    ui_bg: '#2a1b2e', ui_panel: '#3d2742', ui_text: '#fff4e0', ui_accent: '#ffb347',
    coin: '#ffcf3f', undead: '#9fb59a', goblin: '#6fae4f', danger: '#e0453a',
    rarity_1: '#b8b0a8', rarity_2: '#5fbf5a', rarity_3: '#4a90e2', rarity_4: '#b05cf0', rarity_5: '#ffb21e',
    state_ok: '#5fbf5a', state_warn: '#ffb347', state_bad: '#e0453a',
    state_disabled: '#7a6b78', state_locked: '#8f8190',
    brave: '#e8822c', shovel: '#c7cdd6', gem: '#4fd6e8',
  },
};

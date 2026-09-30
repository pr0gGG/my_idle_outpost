// Все игровые числа и константы живут здесь. Логика и арт читают только CONFIG.
var CONFIG = {
  SAVE_KEY: 'zastava_save',
  SAVE_VERSION: 1,
  AUTOSAVE_SEC: 5,

  // Логическая ширина 360; высота подстраивается под экран в пределах Hmin…Hmax, без леттербокса.
  // Сцена занимает всё между верхней полосой (TOPBAR_H) и таб-баром (TABBAR_H). layers — доли высоты сцены (ART_GUIDE §4.2).
  VIEW: { W: 360, Hmin: 640, Hmax: 800, TABBAR_H: 56, TOPBAR_H: 44, DPR_MAX: 2,
          layers: { field: 0.22, fence: 0.28, road: 0.38, counter: 0.45 } },

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
  // Покупка уровня станции: тап = +1 уровень, удержание = серия покупок по +1 (src/hold.js). Режимов ×1/×10/MAX нет.
  BUY: {
    hold: {
      initialDelay: 0.35,  // сек от нажатия до первой повторной покупки (короткий тап = одна покупка)
      rateStart: 4,        // покупок в секунду в начале удержания
      rateMax: 8,          // покупок в секунду после разгона
      rampAfter: 1.0,      // через сколько секунд удержания начинается разгон
      rampDuration: 1.0,   // за сколько секунд скорость растёт от rateStart до rateMax
      maxPerUpdate: 2,     // не больше покупок за один кадр (после лагов нет «очереди»)
    },
    fx: { springMinGap: 0.09, popupMergeSec: 0.45, sfxMinGap: 0.06 }, // сглаживание эффектов при быстрой серии
  },

  // Клиенты стоят в закреплённых слотах вдоль прилавка (ART_GUIDE §4.4). Слотов не меньше, чем станций в локации.
  CUSTOMERS: {
    slots: 4,              // число слотов (растёт улучшением «расширение вместимости», этап 2a)
    arriveSec: 0.45,       // новый клиент подходит к слоту (цикл станции при этом уже идёт)
    leaveSec: 0.9,         // обслуженный уходит со слота
    checkSec: 0.5,         // зелёная галочка над уходящим
    sideOffset: 90,        // откуда приходит клиент (px от слота)
    firstIncomeMaxSec: 15, // тест: первая прибыль после покупки первой станции не позже
  },
  // Работник ходит с подносом от станции к прилавку: доли цикла станции (0…1)
  WORKERS: { walkStart: 0.55, walkEnd: 0.88, returnEnd: 0.3 },
  CATALOG: { badgeDebugParam: 'badge' },  // ?badge=N показывает бейдж на кнопке каталога (до этапа 2a; каталога ещё нет)
  STATION_VIEW: { bounceSec: 0.2, bounceScale: 0.08 },

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

  // Палитра (ART_GUIDE §2): пыльно-песочная гамма поста, тёмно-серый интерфейс с жёлтым и синим акцентами.
  PALETTE: {
    sand: '#d9a86a', sand_light: '#ecc994', sand_dark: '#b88445', road: '#c79658',
    sky_night: '#241a3d', moon: '#e6ecff', ground_night: '#2c2236',
    wood: '#a9683a', wood_dark: '#6e3f25',
    cloth_red: '#c9463d', cloth_teal: '#2f8f8b', cloth_mustard: '#e0a526',
    stone: '#9b8f86', stone_dark: '#6a5f5a',
    skin_1: '#f2c8a0', skin_2: '#d9a577', skin_3: '#b07a52', skin_4: '#7e5236',
    ui_bg: '#2b2d33', ui_panel: '#3b3e46', ui_panel_light: '#4a4e58', ui_text: '#f4f1ea',
    ui_yellow: '#ffc93c', ui_accent: '#ffc93c', ui_blue: '#3d8bfd',
    coin: '#ffcf3f', undead: '#9fb59a', goblin: '#6fae4f', danger: '#e0453a',
    rarity_1: '#b8b0a8', rarity_2: '#5fbf5a', rarity_3: '#4a90e2', rarity_4: '#b05cf0', rarity_5: '#ffb21e',
    state_ok: '#5fbf5a', state_warn: '#ffb347', state_bad: '#e0453a',
    state_disabled: '#6b6f78', state_locked: '#8a8e97',
    brave: '#e8822c', shovel: '#c7cdd6', gem: '#4fd6e8',
  },
};

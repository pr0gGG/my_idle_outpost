# Застава на Рубеже

Вертикальная idle-игра (HTML/JS, Canvas 2D). Дизайн: `GAME_DESIGN.md`, арт: `ART_GUIDE.md`.

## Запуск
Из папки проекта:

```
python tools/serve.py 8080
```

Сервер без кеша: правки видны сразу после обновления страницы.

- На компьютере: http://localhost:8080
- На телефоне (тот же Wi-Fi): `http://<IP компьютера>:8080` (IP: `ipconfig`, строка IPv4). При запросе Windows разрешите Python доступ к частной сети.
- Сохранение лежит в localStorage браузера, сброс: очистить данные сайта.

## Структура
`config.js` — все числа · `strings.ru.js` — тексты · `src/` — логика и UI · `art/` — отрисовка.

## Тесты
```
node tools/test.js
```
Проверяют форматирование чисел, формулы цены/дохода/рубежей, MAX-покупку, сохранение.

## Публикация (GitHub Pages)
Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
Адрес: https://pr0ggg.github.io/my_idle_outpost/

## Dev-параметры и инструменты
- `tools/serve.py` — сервер без кеша. `tools/test.js` — автотесты (`node tools/test.js`).
- Параметры игры: `?warp=N` (прокрутить N секунд симуляции), `?open=<id станции>` (открыть карточку), `?badge=N` (бейдж кнопки каталога, пока каталога нет).
- `tools/seed.html?preset=fresh|mid|late&tab=battle&…` — записывает тестовое сохранение и открывает игру.
- `tools/shot_live.py out.png "preset=mid&open=forge&warp=7"` — скриншот живой игры (headless Edge); `tools/shot.py`, `tools/gif.py` — прототип `proto/`.
- `proto/` — статичная тестовая сцена этапа 1.5 (справочный прототип, в игре не используется).

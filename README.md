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

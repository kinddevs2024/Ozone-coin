# Ozone-coin Frontend

Фронтенд для Ozone-coin. React, Vite, Tailwind. Работает с отдельным бэкендом по URL из переменной окружения.

## Запуск

1. Скопируй `.env.example` в `.env`.
2. Укажи `VITE_API_URL` — URL бэкенда (например `http://localhost:3001` для локальной разработки или `https://твой-api.railway.app` для продакшена). Если не указать — запросы идут на тот же домен.
3. `npm install`
4. `npm run dev` — приложение на http://localhost:5173

## Сборка и деплой

- `npm run build` — сборка в `dist/`
- На Vercel/Netlify задай в настройках проекта переменную **VITE_API_URL** равной URL твоего бэкенда (например `https://ozone-api.railway.app`). Без этого на проде запросы будут уходить на тот же домен, что и фронт, и API не сработает.

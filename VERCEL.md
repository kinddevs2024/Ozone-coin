# Деплой на Vercel

## 1. Переменные окружения

В **Vercel Dashboard** → твой проект → **Settings** → **Environment Variables** добавь:

| Имя | Значение | Среды |
|-----|----------|--------|
| `MONGODB_URI` | Твоя строка подключения MongoDB (как в .env) | Production, Preview |
| `ADMIN_USER` | Логин админки | Production, Preview |
| `ADMIN_PASSWORD` | Пароль админки | Production, Preview |

Без `MONGODB_URI` API на Vercel не сможет подключиться к базе.

## 2. Деплой

- Подключи репозиторий к Vercel или делай `vercel` из CLI.
- После пуша Vercel соберёт проект (`npm run build`) и задеплоит:
  - статику (SPA) из `dist/`;
  - серверный API из `api/index.ts` (все запросы `/api/*` идут в одну функцию).

## 3. Проверка

- Открой `https://твой-домен.vercel.app` — должна открыться главная.
- Открой `https://твой-домен.vercel.app/api/health` — должен вернуться JSON с `"status":"ok"` и полем `db`.
- Залогинься в админку и проверь добавление класса/учеников.

Если `db` в `/api/health` равен `"error"`, проверь `MONGODB_URI` и доступность кластера (сеть, пароль, IP в Atlas).

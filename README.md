# Still Breathing 🧟

Панель управления персонажами для настольной ролевой игры **All Flesh Must Be Eaten** (AFMBE).

## Возможности

- 🔐 Авторизация по нику + отпечаток пальца (WebAuthn)
- 📝 Создание и редактирование персонажей
- 📤 Экспорт/импорт персонажей кодом
- 📱 Адаптивный дизайн для мобильных

## Быстрый старт

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API будет на `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Приложение на `http://localhost:5173`

## Деплой на Fly.io

### Первый раз

```bash
# Установи flyctl: https://fly.io/docs/hands-on/install-flyctl/
fly auth login
fly launch  # создаст приложение
fly volumes create sb_data --size 1  # 1GB для SQLite
fly deploy
```

### Обновление

```bash
fly deploy
```

## Env переменные (для продакшена)

```env
JWT_SECRET=your-random-secret-here
RP_ID=your-domain.fly.dev
RP_ORIGIN=https://your-domain.fly.dev
```

## Структура проекта

```
sb-panel/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI приложение
│   │   ├── models.py        # SQLAlchemy модели
│   │   ├── auth/            # WebAuthn + JWT
│   │   └── routers/         # API endpoints
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── views/           # Страницы
    │   ├── stores/          # Pinia (state)
    │   └── components/
    └── package.json
```

## Техстек

- **Frontend:** Vue 3, Pinia, Vue Router, UnoCSS
- **Backend:** FastAPI, SQLAlchemy, py-webauthn
- **Database:** SQLite
- **Auth:** WebAuthn (Touch ID / Fingerprint)

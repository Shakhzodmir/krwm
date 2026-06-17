# Вход через Kakao — пошаговая настройка (Supabase)

Код в приложении уже готов (`loginWithKakao()` в app.js). Чтобы кнопка «Войти через Kakao»
заработала, нужно один раз настроить два сервиса: **Supabase** и **Kakao Developers**.
Займёт ~20 минут. Всё бесплатно.

---

## Шаг 1. Создать проект Supabase

1. Зайди на https://supabase.com → **Start your project** → войди через GitHub или email.
2. **New project**: название например `korean-with-madie`, регион — Seoul (ap-northeast-2), пароль БД — любой (сохрани).
3. Когда проект создастся, открой **Project Settings → API** и скопируй:
   - **Project URL** — вида `https://abcdefgh.supabase.co`
   - **anon public** ключ (длинный, начинается с `eyJ…`)

> ⚠️ Копируй именно **anon public**, НЕ `service_role` — тот секретный и в клиент не идёт никогда.

## Шаг 2. Создать приложение в Kakao Developers

1. Зайди на https://developers.kakao.com → войди со своим Kakao-аккаунтом.
2. **내 애플리케이션 (My Application) → 애플리케이션 추가하기 (Add application)**:
   - App name: `Korean with Madie`, Company: твоё имя.
3. В приложении открой **앱 키 (App Keys)** и скопируй **REST API key**.
4. **카카오 로그인 (Kakao Login)** в левом меню → включи переключатель **활성화 (Activation)** = ON.
5. Там же **Redirect URI** → **등록 (Register)** → вставь:
   ```
   https://<ТВОЙ-ПРОЕКТ>.supabase.co/auth/v1/callback
   ```
   (точный адрес Supabase покажет на шаге 3 — поле Callback URL).
6. **동의항목 (Consent Items)** в меню Kakao Login:
   - **닉네임 (Nickname)** → 필수 동의 (обязательное согласие)
   - **카카오계정 이메일 (Email)** → 선택 동의 (по желанию; для email нужна бизнес-верификация,
     без неё тоже работает — приложение подставит служебный email).
7. В **보안 (Security)** создай **Client Secret** → скопируй и включи (활성화 ON).

## Шаг 3. Включить провайдера Kakao в Supabase

1. Supabase → **Authentication → Providers → Kakao**.
2. Включи **Enable Sign in with Kakao**.
3. Вставь:
   - **REST API Key** (из шага 2.3) → поле Client ID
   - **Client Secret** (из шага 2.7)
4. Скопируй показанный **Callback URL** и проверь, что он добавлен в Redirect URI у Kakao (шаг 2.5).
5. **Authentication → URL Configuration**:
   - **Site URL**: адрес сайта, например `https://madie.github.io/krwm/`
   - **Redirect URLs**: добавь тот же адрес (и `http://localhost:8742/` для локальных проверок).

## Шаг 4. Вставить ключи в приложение

Открой `app.js`, найди `MADIE_SUPABASE` (поиском) и заполни:

```js
const MADIE_SUPABASE = {
  url: 'https://abcdefgh.supabase.co',   // Project URL из шага 1
  anonKey: 'eyJ…'                        // anon public из шага 1
};
```

Готово. Кнопка «Войти через Kakao» начнёт работать: пользователь уходит на Kakao,
возвращается на сайт, приложение само подхватывает сессию, создаёт профиль
и переносит прогресс гостя.

---

## Что уже сделано в коде (проверять не нужно)

- `loginWithKakao()` — запускает OAuth через Supabase (`signInWithOAuth({ provider: 'kakao' })`).
- `initSupabaseSession()` — на старте ловит возврат с Kakao, создаёт пользователя приложения,
  показывает приветствие, чистит URL от токенов.
- `migrateGuestProgress()` — при первом входе переносит XP/стрик/словарик гостя в аккаунт.
- `logoutUser()` — разлогинивает и из Supabase, если вход был через Kakao.
- supabase-js грузится лениво с CDN только если ключи заполнены.

## Apple — позже

Кнопка «Войти через Apple» в приложении есть, но отключена (бейдж «СКОРО»).
Для включения понадобится платный Apple Developer аккаунт ($99/год), там же
настраивается Sign in with Apple → Supabase → Providers → Apple. Когда решишь —
скажи, подключим тем же способом.

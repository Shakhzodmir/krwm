// Service Worker for Firebase Cloud Messaging — handles push notifications
// when the app is in the background or fully closed.
// IMPORTANT: this file MUST live at the site root (e.g. /firebase-messaging-sw.js).
// Also acts as the PWA service worker: caches the app shell for fast loads
// and offline opening (audio/video are intentionally NOT cached — too big).

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// ───────────────────────── PWA APP-SHELL CACHE ─────────────────────────
const CACHE_VERSION = 'madie-v5';
const SHELL = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './manifest.json',
  './assets/logo.png',
  './assets/logo-app.png',
  './assets/pwa/icon-192.png',
  './assets/pwa/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;             // CDN/Firebase — мимо
  if (/\.(mp3|m4a|mp4|pdf|apk)$/i.test(url.pathname)) {
    // Экзаменационные аудио TOPIK огромные (десятки МБ) и разовые — не кэшируем,
    // забили бы Cache Storage без пользы. Фоновая музыка для занятий (assets/music/)
    // маленькая (~3МБ/трек) и крутится в цикле весь сеанс — её кэшируем как картинки.
    // APK (app/KoreanWithMadie.apk) — всегда из сети: ссылка постоянная, и из кэша
    // ученица скачала бы старую версию приложения после обновления.
    if (!/\/assets\/music\//i.test(url.pathname)) return;
  } else {
    var isCode = /\/(index\.html)?$|\.(html|js|css|json)$/i.test(url.pathname);
    var versioned = isCode && url.searchParams.has('v');
    if (isCode && !versioned) {
      // Страницы (index.html и все *.html: privacy, delete-account, textbook…) и
      // немаркированный код: без версии в URL мы не знаем, свежий ли кэш — поэтому
      // всегда идём в сеть, кэш только для офлайна. (До 16.10.2026 *.html, кроме
      // index.html, отдавались из кэша навсегда: новая редакция privacy.html не
      // доходила до тех, кто открывал её раньше.)
      // cache:'no-cache' обязателен: GitHub Pages отдаёт max-age=600, и обычный fetch
      // до 10 минут молча брал СТАРЫЙ index.html из HTTP-кэша браузера («обновляю —
      // ничего не меняется»). С no-cache браузер всегда сверяется с сервером по ETag
      // (ответ 304 — дёшево), и новая версия видна с первой перезагрузки.
      e.respondWith(
        fetch(req, { cache: 'no-cache' }).then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then(c => c.put(req, copy));
          }
          return res;
        }).catch(() => caches.match(req))
      );
      return;
    }
  }
  // Всё остальное — картинки, шрифты, и код с ?v=… в URL. Версионный код по
  // определению не может устареть в кэше: смена версии — это новый URL, значит
  // старая запись просто больше не запрашивается. Отдаём мгновенно из кэша,
  // сеть — только при первом обращении к этому URL.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(req, copy));
      }
      return res;
    }))
  );
});

firebase.initializeApp({
  apiKey:            "AIzaSyBP0lw2WYMj7RQ42qsAlqpg8sE5Hu9k_0c",
  authDomain:        "koreanmadie.firebaseapp.com",
  projectId:         "koreanmadie",
  storageBucket:     "koreanmadie.firebasestorage.app",
  messagingSenderId: "226267487940",
  appId:             "1:226267487940:web:411e04e968e94cabe9b391"
});

const messaging = firebase.messaging();

// ───────────────────────── УВЕДОМЛЕНИЯ (docs/notifications/CONTRACT.md §6) ─────────────────────────
// Сервер шлёт веб-токенам webpush.notification (без top-level notification). Такое
// уведомление SDK показывает САМ (иконка, картинка, кнопки, tag), а основной клик по
// нему тоже обрабатывает сам: фокус окна + postMessage 'notification-clicked' с
// fcmOptions.link или openWindow(link). Поэтому здесь:
//  • onBackgroundMessage — второе уведомление НЕ рисуем (раньше показывались оба,
//    с двойным звуком); data-only сообщения (на будущее) показываем из data;
//  • notificationclick — кнопки «Принять/Отклонить» (их SDK оставляет нам) и наши
//    собственные уведомления: найти окно приложения (kmIsApp) → postMessage('km-push-open')
//    + focus, окна нет → openWindow(ссылка). Дальше ссылку разбирает роутер страницы kmRoute;
//  • push (только Safari/iOS) — «заглушка» при видимом окне, чтобы WebKit не снял подписку.
const KM_ICON = '/assets/pwa/icon-192.png';
const KM_BADGE = '/assets/pwa/badge-96.png';          // монохромная — для строки состояния Android
const KM_CHAT_TYPES = ['dm', 'group', 'community', 'hw_checked'];

function kmStr(v) { return typeof v === 'string' ? v : ''; }

// Ссылка уведомления → адрес ЭТОГО сайта '/?go=…'. Маршрут задают только параметры,
// поэтому чужой домен сюда не пускаем, а зеркало (koreanmadie.web.app) открывает у себя.
function kmLocalLink(link) {
  try {
    const u = new URL(kmStr(link) || '/', self.location.origin);
    return u.searchParams.get('go') ? '/' + u.search : '/';
  } catch (e) { return '/'; }
}

// Окно ПРИЛОЖЕНИЯ — корень сайта ('/' или '/index.html'; адрес приложение меняет только через
// replaceState с тем же pathname, start_url манифеста — ./index.html). На том же домене живут и
// статичные страницы без app.js (блог, /learn-korean/, /topik/, textbook.html…): сообщение
// 'km-push-open' там некому принять, а фокус увёл бы ученицу не туда.
function kmIsApp(c) {
  try {
    const u = new URL(c.url);
    return u.origin === self.location.origin && (u.pathname === '/' || u.pathname === '/index.html');
  } catch (e) { return false; }
}

// ── Safari и iOS-приложение с экрана «Домой»: пуш при открытом сайте ──
// WebKit считает «невидимым» каждый пуш, после которого не вызван showNotification, и после
// третьего снимает подписку сайта: уведомления молча перестают приходить, хотя в Настройках
// они «включены». SDK 10.12.2 при видимом окне уведомление не рисует — только передаёт пуш
// странице (баннер рисует app.js). Поэтому на WebKit при видимом окне показываем «заглушку»
// с тем же текстом — тихую, со своим tag — и сразу закрываем: WebKit видит показ, а поверх
// открытого приложения ничего не висит. Видимость проверяем так же, как SDK (любое окно
// сайта). Остальным браузерам (Chrome, Android, Edge, Firefox) этот обработчик ничего не делает.
const KM_WEBKIT = (function () {
  const ua = (self.navigator && self.navigator.userAgent) || '';
  return /AppleWebKit/.test(ua) && !/Chrome|Chromium|CriOS|Android|Edg/.test(ua);
})();
const KM_FG_TAG = 'km-fg';
self.addEventListener('push', event => {
  if (!KM_WEBKIT) return;
  let p = null;
  try { p = event.data ? event.data.json() : null; } catch (e) { p = null; }
  if (!p || typeof p !== 'object') return;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const visible = list.some(c => c.visibilityState === 'visible' && !kmStr(c.url).startsWith('chrome-extension://'));
    if (!visible) return undefined;                       // окна не видно — уведомление покажет SDK
    const n = (p.notification && typeof p.notification === 'object') ? p.notification : {};
    const d = (p.data && typeof p.data === 'object') ? p.data : {};
    return self.registration.showNotification(kmStr(n.title) || kmStr(d.title) || 'Korean with Madie', {
      body: kmStr(n.body) || kmStr(d.body),
      tag: KM_FG_TAG, silent: true, icon: KM_ICON, badge: KM_BADGE,
      data: { link: kmLocalLink((p.fcmOptions && p.fcmOptions.link) || d.link) }
    })
      .then(() => self.registration.getNotifications({ tag: KM_FG_TAG }))
      .then(ns => { (ns || []).forEach(x => { try { x.close(); } catch (e) {} }); })
      .catch(() => {});
  }));
});

messaging.onBackgroundMessage(payload => {
  if (!payload || payload.notification) return;       // уже показано SDK — второе не рисуем
  const d = payload.data || {};
  const title = kmStr(d.title);
  const body = kmStr(d.body);
  if (!title && !body) return;
  const type = kmStr(d.type);
  const icon = kmStr(d.icon);
  const options = {
    body,
    icon: (/^https:\/\//.test(icon) || /^\/[^/]/.test(icon)) ? icon : KM_ICON,
    badge: KM_BADGE,
    data: Object.assign({}, d, { link: kmLocalLink(d.link) })
  };
  const tag = kmStr(d.tag);
  if (tag) {
    options.tag = tag;
    if (KM_CHAT_TYPES.indexOf(type) >= 0) options.renotify = true;   // renotify — только вместе с tag
  }
  if (/^https:\/\//.test(kmStr(d.image))) options.image = d.image;
  if (type === 'friend_req') {
    options.requireInteraction = true;
    options.actions = [
      { action: 'accept', title: kmStr(d.b1) || 'Принять' },
      { action: 'decline', title: kmStr(d.b2) || 'Отклонить' }
    ];
  }
  return self.registration.showNotification(title || 'Korean with Madie', options);
});

// Окно приложения есть — отдать ему ссылку и показать; нет — открыть по ссылке
function kmOpen(link) {
  return clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const own = list.filter(kmIsApp);
    const target = own.find(c => c.focused) || own.find(c => c.visibilityState === 'visible') || own[0];
    if (target) {
      target.postMessage({ kind: 'km-push-open', link });
      if ('focus' in target) return Promise.resolve(target.focus()).catch(() => {});
      return undefined;
    }
    if (clients.openWindow) return clients.openWindow(link);
    return undefined;
  });
}

self.addEventListener('notificationclick', event => {
  const n = event.notification;
  const nd = (n && n.data) || {};
  const fcm = nd.FCM_MSG || null;                    // уведомление, показанное SDK
  const d = (fcm && fcm.data) || nd;                 // data-контракт
  let link;
  if (event.action === 'accept' || event.action === 'decline') {
    const rk = kmStr(d.reqKey), u = kmStr(d.fromUid);
    link = (rk && u)
      ? '/?go=friends&act=' + event.action + '&rk=' + encodeURIComponent(rk) + '&u=' + encodeURIComponent(u) + '&to=' + encodeURIComponent(kmStr(d.to))
      : '/?go=friends';
  } else {
    // Основной клик по SDK-уведомлению сюда обычно не доходит (SDK перехватывает его сам)
    link = kmLocalLink((fcm && fcm.fcmOptions && fcm.fcmOptions.link) || d.link);
  }
  try { n.close(); } catch (e) {}
  event.waitUntil(kmOpen(link));
});

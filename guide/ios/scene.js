// Инструкция «Madie на iPhone»: чистая функция времени renderAt(t) на сцене 1080×1920.
// Одна сцена — два выхода: интерактивная страница (index.html) и видео (ch00/reel.html → render2.js → mp4).
// Всё, что зависит от времени, считается здесь; ни Date.now, ни Math.random, ни CSS-анимаций.
(function () {
  'use strict';
  const A = (window.GUIDE_BASE || 'assets/');
  const W = 1080, H = 1920;

  // ───────── математика
  const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
  const lerp = (a, b, u) => a + (b - a) * u;
  const E = {
    lin: u => u, out2: u => 1 - (1 - u) * (1 - u), out3: u => 1 - Math.pow(1 - u, 3), out4: u => 1 - Math.pow(1 - u, 4),
    inOut: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2, in2: u => u * u,
    back: u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
    spring: u => u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.exp(-7 * u) * Math.cos(u * 11)
  };
  const P = (t, a, d, e = E.out3) => e(clamp((t - a) / d));
  const rgb = (c1, c2, u) => 'rgb(' + c1.map((v, i) => Math.round(lerp(v, c2[i], u))).join(',') + ')';
  function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ x >>> 15, x | 1); x ^= x + Math.imul(x ^ x >>> 7, x | 61); return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }

  // ───────── сценарий
  const SC = [
    { id: 'intro', t0: 0, t1: 3.6, eb: 'ИНСТРУКЦИЯ', title: 'Madie на iPhone', sub: 'за 1 минуту', n: 0, chip: 'Начало' },
    { id: 'safari', t0: 3.6, t1: 8.0, eb: 'СНАЧАЛА', title: 'Открой в Safari', sub: '', n: 0, chip: 'Safari' },
    { id: 's1', t0: 8.0, t1: 13.6, eb: 'ШАГ 1', title: 'Поделиться', sub: '', n: 1, chip: '1 · Поделиться' },
    { id: 's2', t0: 13.6, t1: 17.6, eb: 'ШАГ 2', title: 'На экран «Домой»', sub: '', n: 2, chip: '2 · На экран «Домой»' },
    { id: 's3', t0: 17.6, t1: 22.2, eb: 'ШАГ 3', title: 'Добавить', sub: '', n: 3, chip: '3 · Добавить' },
    { id: 's4', t0: 22.2, t1: 29.6, eb: 'ШАГ 4', title: 'Открой значок', sub: '', n: 4, chip: '4 · Открой значок' },
    { id: 'push', t0: 29.6, t1: 36.0, eb: 'УВЕДОМЛЕНИЯ', title: 'Включи уведомления', sub: 'Нажми «Разрешить»', n: 0, chip: 'Уведомления' },
    { id: 'mic', t0: 36.0, t1: 41.8, eb: 'ВАЖНО', title: 'Голос — в Safari', sub: 'со значка — клавиатура', n: 0, chip: 'Про голос' },
    { id: 'done', t0: 41.8, t1: 47.0, eb: 'ГОТОВО', title: 'Madie на экране', sub: 'koreanmadie.study', n: 0, chip: 'Готово' }
  ];
  const TOTAL = 47.0;
  // касания: t — момент нажатия; sel — цель для интерактива; hold — за сколько до касания палец уже на цели
  const TAPS = [
    { t: 10.8, sel: 't-share', hold: .3, txt: 'Нажми на «Поделиться»' },
    { t: 16.9, sel: 't-home', hold: .3, txt: 'Нажми на «На экран «Домой»»' },
    { t: 20.7, sel: 't-add', hold: .3, txt: 'Нажми «Добавить»' },
    { t: 25.0, sel: 't-icon', hold: .3, txt: 'Нажми на значок Madie' },
    { t: 31.8, sel: 't-enable', hold: .3, txt: 'Нажми «Включить уведомления»' },
    { t: 33.8, sel: 't-allow', hold: .3, txt: 'Нажми «Разрешить»' }
  ];
  const T_ = { share: 10.8, home: 16.9, add: 20.7, icon: 25.0, enable: 31.8, allow: 33.8 };

  // ───────── камера: [t, fx, fy, s] — точка экрана телефона (fx,fy) встаёт в центр кадра, s — масштаб
  const CAM = [
    [0, 195, 422, 1.12], [3.6, 195, 422, 1.12], [4.2, 195, 470, 1.3], [7.6, 195, 470, 1.3],
    [8.5, 195, 735, 1.9, 1215], [11.0, 195, 735, 1.9, 1215], [12.4, 195, 520, 1.22], [17.0, 195, 500, 1.22],
    [17.9, 195, 440, 1.2], [19.2, 270, 190, 1.75], [20.9, 270, 190, 1.75], [21.6, 195, 422, 1.12],
    [23.0, 160, 440, 1.5], [25.0, 160, 440, 1.5], [25.9, 195, 422, 1.12], [29.6, 195, 422, 1.12],
    [30.2, 195, 480, 1.32], [34.3, 195, 480, 1.32], [35.0, 195, 125, 1.6, 830], [36.4, 195, 125, 1.6, 830], [37.0, 195, 395, 1.55, 1090],
    [41.2, 195, 395, 1.55, 1090], [42.1, 195, 422, 1.12], [43.6, 150, 448, 1.9, 1130], [47, 150, 448, 1.9, 1130]
  ];
  function cam(t) {
    const AY = k => k[4] == null ? 1040 : k[4];
    if (t <= CAM[0][0]) return { fx: CAM[0][1], fy: CAM[0][2], s: CAM[0][3], ay: AY(CAM[0]) };
    for (let i = 1; i < CAM.length; i++) {
      if (t <= CAM[i][0]) {
        const a = CAM[i - 1], b = CAM[i], u = E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
        return { fx: lerp(a[1], b[1], u), fy: lerp(a[2], b[2], u), s: lerp(a[3], b[3], u), ay: lerp(AY(a), AY(b), u) };
      }
    }
    const z = CAM[CAM.length - 1]; return { fx: z[1], fy: z[2], s: z[3], ay: AY(z) };
  }

  // ───────── палец: ключи [t, x, y, opacity, press]
  const FING = [
    [9.4, 300, 930, 0, 0], [10.5, 192, 806, 1, 0], [10.74, 192, 802, 1, 0], [10.82, 192, 802, 1, 1], [11.02, 192, 802, 1, 0], [11.6, 260, 940, 0, 0],
    [14.0, 200, 770, 0, 0], [14.2, 200, 750, 1, .6], [15.2, 200, 480, 1, .6], [15.45, 200, 440, 0, 0],
    [16.1, 250, 620, 0, 0], [16.6, 195, 534, 1, 0], [16.82, 195, 530, 1, 0], [16.9, 195, 530, 1, 1], [17.1, 195, 530, 1, 0], [17.5, 300, 700, 0, 0],
    [19.2, 345, 290, 0, 0], [20.3, 330, 144, 1, 0], [20.62, 328, 137, 1, 0], [20.7, 328, 136, 1, 1], [20.9, 328, 136, 1, 0], [21.3, 330, 210, 0, 0],
    [23.6, 300, 700, 0, 0], [24.5, 152, 458, 1, 0], [24.92, 148, 449, 1, 0], [25.0, 148, 448, 1, 1], [25.2, 148, 448, 1, 0], [25.6, 200, 560, 0, 0],
    [30.6, 300, 800, 0, 0], [31.4, 196, 522, 1, 0], [31.72, 195, 515, 1, 0], [31.8, 195, 514, 1, 1], [32.0, 195, 514, 1, 0], [32.4, 260, 640, 0, 0],
    [32.9, 270, 620, 0, 0], [33.5, 262, 498, 1, 0], [33.72, 262, 493, 1, 0], [33.8, 262, 493, 1, 1], [34.0, 262, 493, 1, 0], [34.4, 300, 620, 0, 0]
  ];
  function finger(t) {
    if (t <= FING[0][0] || t >= FING[FING.length - 1][0]) return null;
    for (let i = 1; i < FING.length; i++) {
      if (t <= FING[i][0]) {
        const a = FING[i - 1], b = FING[i], u = E.inOut(clamp((t - a[0]) / Math.max(1e-6, b[0] - a[0])));
        return { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), o: lerp(a[3], b[3], u), p: lerp(a[4], b[4], u) };
      }
    }
    return null;
  }

  // ───────── геометрия шторки «Поделиться»
  const st = t => t < 14.2 ? lerp(844, 330, P(t, 11.0, .8, E.out4)) : lerp(330, 110, P(t, 14.2, 1.0, E.inOut));
  const scroll = t => lerp(0, 60, P(t, 14.5, 1.0, E.inOut));
  const homeRowY = t => st(t) + 194 + 5 * 52 + 26 - scroll(t);

  // ───────── подсветки (кольца) и подсказки-пузыри — в координатах экрана телефона
  const RINGS = [
    { x: 166, y: 774, w: 52, h: 52, r: 26, t0: 9.3, t1: 11.1 },
    { x: 28, y: 731, w: 334, h: 44, r: 22, t0: 4.3, t1: 5.9 },
    { x: 20, y: 504, w: 350, h: 52, r: 12, t0: 15.4, t1: 17.2 },
    { x: 284, y: 114, w: 92, h: 44, r: 22, t0: 19.3, t1: 20.95 },
    { x: 112, y: 412, w: 72, h: 72, r: 18, t0: 22.7, t1: 25.2 },
    { x: 52, y: 484, w: 286, h: 58, r: 29, t0: 30.1, t1: 32.0 },
    { x: 196, y: 470, w: 128, h: 46, r: 10, t0: 32.9, t1: 34.0 },
    { x: 112, y: 412, w: 72, h: 72, r: 18, t0: 43.5, t1: 47.5 }
  ];
  const CALL = [
    { t0: 4.4, t1: 7.6, x: 195, y: 726, dir: 'down', txt: 'koreanmadie.study' },
    { t0: 9.5, t1: 11.0, x: 192, y: 832, dir: 'up', txt: 'Поделиться' },
    { t0: 15.5, t1: 17.0, x: 195, y: 560, dir: 'up', txt: 'На экран «Домой»' },
    { t0: 18.3, t1: 19.4, x: 195, y: 262, dir: 'up', txt: 'Имя оставь «Madie»' },
    { t0: 19.7, t1: 20.95, x: 328, y: 108, dir: 'down', txt: 'Добавить' },
    { t0: 22.5, t1: 24.5, x: 148, y: 490, dir: 'up', txt: 'Значок Madie' },
    { t0: 26.5, t1: 29.2, x: 195, y: 790, dir: 'down', txt: 'Без адресной строки' },
    { t0: 32.9, t1: 34.0, x: 262, y: 466, dir: 'down', txt: 'Разрешить' }
  ];

  // ───────── значки (SVG)
  const svg = (p, w = 24, extra = '') => '<svg viewBox="0 0 24 24" width="' + w + '" height="' + w + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' + extra + '>' + p + '</svg>';
  const IC = {
    share: '<path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/>',
    back: '<path d="M15 5l-7 7 7 7"/>', fwd: '<path d="M9 5l7 7-7 7"/>',
    book: '<path d="M12 6.5C10 5 7 4.6 3.5 5v13c3.5-.4 6.5 0 8.5 1.5 2-1.5 5-1.9 8.5-1.5V5C17 4.6 14 5 12 6.5z"/><path d="M12 6.5V19.5"/>',
    tabs: '<rect x="8" y="3.5" width="12.5" height="12.5" rx="3"/><path d="M5 8v8.5A3.5 3.5 0 0 0 8.5 20H17"/>',
    reload: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.5h-4.5"/>',
    page: '<rect x="4" y="5" width="16" height="14" rx="3"/><path d="M8 10h8M8 14h8"/>',
    addhome: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8.5v7M8.5 12h7"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.8 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z"/>',
    glass: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
    print: '<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v6H7z"/>',
    pen: '<path d="M4 20l1-4L16 5a2.1 2.1 0 0 1 3 3L8 19z"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    kbd: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', cross: '<path d="M6 6l12 12M18 6L6 18"/>'
  };

  // ───────── CSS
  const css = `
#stage{position:relative;width:1080px;height:1920px;overflow:hidden;background:#FFFAF6;font-family:Inter,'Segoe UI','Noto Sans KR',system-ui,sans-serif;color:#5C2A33;-webkit-font-smoothing:antialiased}
#stage *{box-sizing:border-box}
#stage :where(div,img,span,b,i,svg,p){margin:0;padding:0}
#stage .ab{position:absolute}
#stage img{display:block;user-select:none;-webkit-user-drag:none}
.disp{font-family:Fraunces,Georgia,'Times New Roman',serif;font-weight:700;letter-spacing:-.02em}
.hg{position:absolute;left:0;top:0;width:1080px;opacity:0;will-change:transform,opacity}
.hg .eb{position:absolute;left:0;width:1080px;top:252px;text-align:center;display:flex;justify-content:center;align-items:center;gap:18px;font-weight:800;font-size:30px;letter-spacing:.18em;color:#BC4B5E}
.hg .eb i{display:block;width:46px;height:3px;border-radius:2px;background:linear-gradient(90deg,transparent,#BC4B5E)}
.hg .eb i.r{background:linear-gradient(270deg,transparent,#BC4B5E)}
.hg .dots{display:flex;gap:10px;margin-left:8px}
.hg .dots b{width:14px;height:14px;border-radius:50%;background:rgba(188,75,94,.22)}
.hg .dots b.on{background:#BC4B5E}
.hg .ti{position:absolute;left:60px;width:960px;top:306px;text-align:center;font-size:80px;line-height:1.06;color:#5C2A33;white-space:nowrap}
.hg .ti span{display:inline-block;will-change:transform,opacity}
.hg .su{position:absolute;left:90px;width:900px;top:418px;text-align:center;font-size:40px;line-height:1.3;font-weight:600;color:rgba(92,42,51,.82)}
#fade{position:absolute;left:0;top:0;width:1080px;height:620px;background:linear-gradient(180deg,#FFFAF6 0,#FFFAF6 80%,rgba(255,250,246,0) 100%);pointer-events:none}
.petal{position:absolute;left:0;top:0;width:34px;height:26px;border-radius:70% 30% 70% 30%;background:linear-gradient(135deg,#F7CDD2,#F2A6AE);opacity:0;will-change:transform,opacity}
.spark{position:absolute;left:0;top:0;width:26px;height:26px;opacity:0}
.spark:before,.spark:after{content:'';position:absolute;left:50%;top:50%;background:#C9A55C;border-radius:3px}
.spark:before{width:5px;height:26px;margin:-13px 0 0 -2.5px}.spark:after{width:26px;height:5px;margin:-2.5px 0 0 -13px}
#ph{position:absolute;left:0;top:0;width:390px;height:844px;transform-origin:0 0}
#bez{position:absolute;left:-14px;top:-14px;width:418px;height:872px;border-radius:62px;background:linear-gradient(145deg,#34343a,#0e0e11);box-shadow:0 30px 70px rgba(92,42,51,.30),inset 0 0 0 2px #4a4a52}
#scr{position:absolute;left:0;top:0;width:390px;height:844px;border-radius:48px;overflow:hidden;background:#FFFAF6}
#island{position:absolute;left:140px;top:11px;width:110px;height:32px;border-radius:16px;background:#000;z-index:60}
#over{position:absolute;left:0;top:0;width:390px;height:844px;pointer-events:none}
#stat{position:absolute;left:0;top:0;width:390px;height:50px;z-index:50;font-weight:600;font-size:16px}
#stat .tm{position:absolute;left:44px;top:15px}
#stat .ri{position:absolute;right:34px;top:17px;display:flex;gap:6px;align-items:center}
#hind{position:absolute;left:125px;top:830px;width:140px;height:5px;border-radius:3px;z-index:55}
.sbar{position:absolute;left:13px;top:716px;width:364px;height:110px;border-radius:36px;background:rgba(250,248,249,.86);box-shadow:0 8px 28px rgba(40,20,30,.16),0 0 0 .5px rgba(0,0,0,.06);backdrop-filter:blur(14px);color:#1c1c1e}
.sbar .pill{position:absolute;left:15px;top:15px;width:334px;height:44px;border-radius:22px;background:rgba(120,120,128,.12);font-size:17px;display:flex;align-items:center;justify-content:center}
.sbar .pill .l{position:absolute;left:13px;top:10px;color:#1c1c1e}.sbar .pill .r{position:absolute;right:13px;top:10px}
.sbar .tb{position:absolute;top:66px;width:44px;height:36px;display:flex;align-items:center;justify-content:center}
.card{background:#fff;border-radius:16px}
.row{position:absolute;left:0;width:100%;height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;font-size:17px;color:#1c1c1e;border-bottom:.5px solid rgba(60,60,67,.18)}
.blue{color:#0a7aff}
.apc{position:absolute;width:60px;height:60px;border-radius:14px}
.alb{position:absolute;width:76px;text-align:center;font-size:11.5px;font-weight:500;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.35)}
.ring{position:absolute;border:3.5px solid #BC4B5E;box-shadow:0 0 0 5px rgba(188,75,94,.22),0 0 22px rgba(188,75,94,.45);will-change:transform,opacity}
.bub{position:absolute;left:0;top:0;white-space:nowrap;will-change:transform,opacity}
.bub b{display:block;font-weight:800;font-size:34px;color:#fff;background:linear-gradient(135deg,#C65A6D,#A8394D);padding:12px 26px 14px;border-radius:34px;box-shadow:0 8px 22px rgba(168,57,77,.45)}
.bub:after{content:'';position:absolute;width:0;height:0;border:14px solid transparent}
.bub.down:after{left:50%;margin-left:-14px;top:100%;border-top-color:#A8394D;border-bottom:0;margin-top:-2px}
.bub.up:after{left:50%;margin-left:-14px;bottom:100%;border-bottom-color:#C65A6D;border-top:0;margin-bottom:-2px}
.fg{position:absolute;left:0;top:0;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;background:radial-gradient(circle,rgba(60,30,40,.34),rgba(60,30,40,.22));border:3px solid rgba(255,255,255,.92);box-shadow:0 4px 14px rgba(0,0,0,.25);will-change:transform,opacity}
.rp{position:absolute;left:0;top:0;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;border:4px solid rgba(188,75,94,.85);will-change:transform,opacity}
.mc{position:absolute;background:#fff;border-radius:22px;box-shadow:0 18px 46px rgba(92,42,51,.28);will-change:transform,opacity}
`;
  const lk = document.createElement('link'); lk.rel = 'stylesheet'; lk.href = A + 'fonts/fonts.css'; document.head.appendChild(lk);
  const stl = document.createElement('style'); stl.textContent = css; document.head.appendChild(stl);

  // ───────── DOM
  const stage = document.getElementById('stage');
  const h = s => { const d = document.createElement('div'); d.innerHTML = s.trim(); return d.firstElementChild; };
  const q = id => document.getElementById(id);
  const setT = (el, tx, ty, s, r, o) => { el.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) rotate(' + (r || 0).toFixed(3) + 'deg) scale(' + s.toFixed(4) + ')'; el.style.opacity = o == null ? 1 : o.toFixed(3); };

  // фон
  const bg = h('<div class="ab" id="bg" style="left:0;top:0;width:1080px;height:1920px;background:linear-gradient(170deg,#FFFAF6 0%,#FBF0EC 55%,#F8E4E4 100%)"></div>');
  stage.appendChild(bg);
  const blobs = [[160, 700, 620, 'rgba(242,166,174,.42)'], [920, 1180, 700, 'rgba(201,165,92,.20)'], [540, 1620, 760, 'rgba(217,104,122,.22)']].map((b, i) => {
    const e = h('<div class="ab" style="left:' + (b[0] - b[2] / 2) + 'px;top:' + (b[1] - b[2] / 2) + 'px;width:' + b[2] + 'px;height:' + b[2] + 'px;border-radius:50%;background:radial-gradient(closest-side,' + b[3] + ',transparent)"></div>');
    stage.appendChild(e); return e;
  });

  // лепестки (фон, потом салют)
  const petals = [], rp = rng(7);
  for (let i = 0; i < 16; i++) { const e = h('<div class="petal"></div>'); stage.appendChild(e); petals.push({ e, x: rp() * 1080, y0: rp() * 2200, sp: 26 + rp() * 34, ph: rp() * 6.28, sz: .6 + rp() * .7, rot: rp() * 360, rs: (rp() - .5) * 60 }); }
  const burst = [], rb = rng(99);
  for (let i = 0; i < 44; i++) {
    const a = -Math.PI / 2 + (rb() - .5) * 2.6, v = 520 + rb() * 900;
    const e = h('<div class="petal" style="width:' + (28 + rb() * 22).toFixed(0) + 'px;height:' + (20 + rb() * 16).toFixed(0) + 'px"></div>'); stage.appendChild(e);
    burst.push({ e, vx: Math.cos(a) * v * (.7 + rb() * .6), vy: Math.sin(a) * v, x0: 540 + (rb() - .5) * 360, y0: 1320, w: (rb() - .5) * 760, r0: rb() * 360, dl: rb() * .25 });
  }

  // телефон
  const phw = h('<div class="ab" id="phw" style="left:0;top:0;width:1080px;height:1920px"></div>');
  phw.innerHTML = '<div id="ph"><div id="bez"></div><div id="scr"></div><div id="over"></div></div>';
  stage.appendChild(phw);
  const scr = q('scr'), over = q('over'), ph = q('ph');

  // страница в Safari
  const bannerHTML = `<div id="banner" class="ab" style="left:20px;top:592px;width:350px;display:flex;align-items:stretch;border-radius:18px;border:1px solid rgba(92,42,51,.13);background:linear-gradient(135deg,rgba(242,166,174,.20),rgba(188,75,94,.10))">
      <div style="flex:1;display:flex;align-items:center;gap:12px;padding:12px 4px 12px 14px"><div style="width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#D9687A,#BC4B5E);display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px -3px rgba(188,75,94,.55)">📲</div>
      <div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:600;color:#5C2A33">Установи Madie на iPhone</div><div style="font-size:11.5px;line-height:1.35;color:rgba(92,42,51,.8)">Значок на экране «Домой» и уведомления — за минуту</div></div></div>
      <div style="width:44px;display:flex;align-items:center;justify-content:center;font-size:22px;color:rgba(92,42,51,.7)">×</div></div>`;
  const imgs = (extra) => '<img class="ab" src="' + A + 'home-topbar.png" style="left:0;top:44px;width:390px"><img class="ab" src="' + A + 'home-hero.png" style="left:0;top:138px;width:390px"><img class="ab" src="' + A + 'home-bear.png" style="left:0;top:417px;width:390px">' + extra;
  scr.innerHTML = `
  <div id="saf" class="ab" style="inset:0;transform-origin:50% 50%">
    <div id="page" class="ab" style="inset:0;background:#FFFAF6">${imgs(bannerHTML + '<img class="ab" src="' + A + 'home-culture.png" style="left:0;top:640px;width:390px">')}</div>
    <div id="sbar" class="sbar"><div class="pill"><span class="l">${svg(IC.page, 22)}</span>koreanmadie.study<span class="r">${svg(IC.reload, 22)}</span></div>
      <div class="tb" style="left:14px">${svg(IC.back, 26)}</div><div class="tb" style="left:88px;opacity:.28">${svg(IC.fwd, 26)}</div>
      <div id="shareBtn" class="tb" style="left:158px;color:#0a7aff">${svg(IC.share, 26)}</div>
      <div class="tb" style="left:230px">${svg(IC.book, 26)}</div><div class="tb" style="left:304px">${svg(IC.tabs, 26)}</div></div>
    <div id="dim1" class="ab" style="inset:0;background:#000;opacity:0"></div>
    <div id="sheet" class="ab" style="left:0;top:844px;width:390px;height:900px;border-radius:38px 38px 0 0;background:#F2F2F7;overflow:hidden;box-shadow:0 -6px 30px rgba(0,0,0,.18)">
      <div class="ab" style="left:155px;top:8px;width:80px;height:5px;border-radius:3px;background:rgba(60,60,67,.3)"></div>
      <div class="ab" style="left:20px;top:26px;width:350px;height:48px;display:flex;align-items:center;gap:12px"><img src="${A}icon.png" style="width:44px;height:44px;border-radius:11px"><div><div style="font-weight:600;font-size:16px;color:#1c1c1e">Korean with Madie</div><div style="font-size:13px;color:#8a8a8e">koreanmadie.study</div></div></div>
      <div class="ab" style="right:20px;top:32px;width:34px;height:34px;border-radius:50%;background:rgba(120,120,128,.18);display:flex;align-items:center;justify-content:center;color:#6a6a70">${svg(IC.cross, 16, 'stroke-width="2.6"')}</div>
      <div class="ab" style="left:0;top:92px;width:390px;height:90px;display:flex;gap:18px;padding:0 20px">${['AirDrop|#2b9bff', 'Сообщения|#38d46a', 'Почта|#3f8cff', 'Заметки|#ffcc3d'].map(s => { const p = s.split('|'); return '<div style="width:74px;text-align:center"><div style="width:56px;height:56px;border-radius:50%;margin:0 auto 6px;background:' + p[1] + '"></div><div style="font-size:11px;color:#3a3a3c">' + p[0] + '</div></div>'; }).join('')}</div>
      <div class="card ab" style="left:20px;top:194px;width:350px;height:520px;overflow:hidden"><div id="sheetList" class="ab" style="left:0;top:0;width:350px;height:520px">
        <div class="row" style="top:0"><span>Скопировать</span><span>${svg(IC.copy, 22)}</span></div>
        <div class="row" style="top:52px"><span>Добавить в закладки</span><span>${svg(IC.book, 22)}</span></div>
        <div class="row" style="top:104px"><span>Добавить в «Избранное»</span><span>${svg(IC.star, 22)}</span></div>
        <div class="row" style="top:156px"><span>Добавить в список чтения</span><span>${svg(IC.list, 22)}</span></div>
        <div class="row" style="top:208px"><span>Найти на странице</span><span>${svg(IC.glass, 22)}</span></div>
        <div id="rowHome" class="row" style="top:260px;font-weight:600"><span>На экран «Домой»</span><span>${svg(IC.addhome, 22)}</span></div>
        <div class="row" style="top:312px"><span>Разметка</span><span>${svg(IC.pen, 22)}</span></div>
        <div class="row" style="top:364px;border-bottom:0"><span>Распечатать</span><span>${svg(IC.print, 22)}</span></div></div></div></div>
    <div id="dim2" class="ab" style="inset:0;background:#000;opacity:0"></div>
    <div id="add" class="ab" style="left:0;top:844px;width:390px;height:760px;border-radius:38px 38px 0 0;background:#F2F2F7;box-shadow:0 -6px 30px rgba(0,0,0,.2)">
      <div class="ab" style="left:20px;top:30px;font-size:17px;color:#0a7aff">Отменить</div>
      <div class="ab" style="left:0;width:390px;top:30px;text-align:center;font-size:17px;font-weight:600;color:#1c1c1e">На экран «Домой»</div>
      <div id="addBtn" class="ab" style="right:20px;top:30px;font-size:17px;font-weight:700;color:#0a7aff">Добавить</div>
      <div class="card ab" style="left:20px;top:80px;width:350px;height:128px">
        <img src="${A}icon.png" class="ab" style="left:16px;top:18px;width:60px;height:60px;border-radius:14px;box-shadow:0 0 0 .5px rgba(0,0,0,.15)">
        <div class="ab" style="left:92px;top:20px;width:240px;height:56px;font-size:19px;color:#1c1c1e;display:flex;align-items:center;border-bottom:.5px solid rgba(60,60,67,.2)">Madie<span class="ab" style="right:0;top:17px;width:20px;height:20px;border-radius:50%;background:rgba(120,120,128,.3);display:flex;align-items:center;justify-content:center;color:#fff">${svg(IC.cross, 12, 'stroke-width="3"')}</span></div>
        <div class="ab" style="left:16px;top:92px;font-size:15px;color:#8a8a8e">https://koreanmadie.study/</div></div>
      <div class="ab" style="left:36px;top:222px;width:318px;font-size:13px;line-height:1.35;color:#6c6c70">Значок появится на экране «Домой», чтобы быстро открывать Madie.</div></div>
  </div>
  <div id="home" class="ab" style="inset:0;opacity:0;background:linear-gradient(170deg,#E8A3AE 0%,#C9667B 45%,#7B3348 100%)"></div>
  <div id="app" class="ab" style="inset:0;background:#FFFAF6;clip-path:inset(0 0 0 0 round 48px);visibility:hidden">
    <img class="ab" src="${A}home-topbar.png" style="left:0;top:44px;width:390px"><img class="ab" src="${A}home-hero.png" style="left:0;top:138px;width:390px"><img class="ab" src="${A}home-bear.png" style="left:0;top:417px;width:390px"><img class="ab" src="${A}home-culture.png" style="left:0;top:600px;width:390px">
    <div id="appdim" class="ab" style="inset:0;background:#2a1a1e;opacity:0"></div>
    <div id="setcard" class="mc" style="left:35px;top:350px;width:320px;padding:22px 22px 24px">
      <div style="font-size:12px;font-weight:800;letter-spacing:.16em;color:#BC4B5E">НАСТРОЙКИ</div>
      <div class="disp" style="font-size:26px;margin-top:4px;color:#5C2A33">Уведомления</div>
      <div style="font-size:14px;line-height:1.45;margin-top:8px;color:rgba(92,42,51,.82)">Напоминания и сообщения — прямо на экран iPhone.</div>
      <div id="enableBtn" style="margin-top:16px;height:50px;border-radius:25px;background:linear-gradient(135deg,#D9687A,#BC4B5E);box-shadow:0 6px 0 #8F3445;color:#fff;font-weight:800;font-size:16px;letter-spacing:.04em;display:flex;align-items:center;justify-content:center">Включить уведомления</div></div>
    <div id="micdim" class="ab" style="inset:0;background:#2a1a1e;opacity:0"></div>
    <div id="mic1" class="mc" style="left:25px;top:250px;width:340px;height:132px;padding:18px 20px"><div style="display:flex;align-items:center;gap:14px"><img src="${A}icon.png" style="width:52px;height:52px;border-radius:13px"><div style="font-size:17px;font-weight:700;color:#5C2A33;line-height:1.2">Со значка<br>на «Домой»</div></div>
      <div style="display:flex;align-items:center;gap:12px;margin-top:14px;color:#5C2A33"><span style="position:relative;display:inline-block;color:rgba(92,42,51,.45)">${svg(IC.mic, 30)}<span id="micx" style="position:absolute;left:-4px;top:13px;width:38px;height:4px;border-radius:2px;background:#BC4B5E;transform:rotate(-45deg)"></span></span><span style="color:#BC4B5E">${svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 22)}</span><span style="color:#5C2A33">${svg(IC.kbd, 32)}</span><span style="font-size:16px;font-weight:700">клавиатура</span></div></div>
    <div id="mic2" class="mc" style="left:25px;top:410px;width:340px;height:132px;padding:18px 20px"><div style="display:flex;align-items:center;gap:14px"><div style="width:52px;height:52px;border-radius:13px;background:linear-gradient(135deg,#4aa3ff,#1b6fe0);display:flex;align-items:center;justify-content:center;color:#fff">${svg(IC.compass, 32)}</div><div style="font-size:17px;font-weight:700;color:#5C2A33;line-height:1.2">В Safari<br>по ссылке</div></div>
      <div style="display:flex;align-items:center;gap:12px;margin-top:14px"><span style="color:#5C2A33">${svg(IC.mic, 32)}</span><span style="font-size:16px;font-weight:700;color:#5C2A33">голосовые задания</span><span id="micok" style="margin-left:auto;width:34px;height:34px;border-radius:50%;background:#3fa56a;color:#fff;display:flex;align-items:center;justify-content:center">${svg(IC.check, 20, 'stroke-width="3.2"')}</span></div></div>
  </div>
  <div id="notif" class="ab" style="left:12px;top:56px;width:366px;border-radius:24px;background:rgba(247,247,249,.93);box-shadow:0 10px 30px rgba(0,0,0,.25);padding:12px 14px 14px;display:flex;gap:12px;z-index:40">
    <img src="${A}icon.png" style="width:40px;height:40px;border-radius:10px"><div style="flex:1"><div style="display:flex;justify-content:space-between;font-size:13px;color:#6c6c70"><span style="font-weight:600;letter-spacing:.02em">MADIE</span><span>сейчас</span></div><div style="font-size:15px;font-weight:700;color:#1c1c1e;margin-top:2px">Комдори · Пора на урок 🌱</div><div style="font-size:14px;color:#3a3a3c;line-height:1.3">10 минут хангыля — и серия не прервётся</div></div></div>
  <div id="alertdim" class="ab" style="inset:0;background:#000;opacity:0;z-index:30"></div>
  <div id="alert" class="ab" style="left:60px;top:300px;width:270px;height:216px;border-radius:16px;background:rgba(246,246,248,.97);z-index:31;overflow:hidden;box-shadow:0 14px 50px rgba(0,0,0,.35)">
    <div style="padding:20px 18px 0;text-align:center"><div style="font-size:17px;font-weight:600;line-height:1.25;color:#1c1c1e">«Madie» запрашивает разрешение на отправку уведомлений</div><div style="font-size:13px;line-height:1.3;color:#1c1c1e;margin-top:8px">Уведомления могут включать оповещения, звуки и значки. Их можно настроить в «Настройках».</div></div>
    <div class="ab" style="left:0;right:0;bottom:46px;height:.5px;background:rgba(60,60,67,.3)"></div><div class="ab" style="left:135px;bottom:0;width:.5px;height:46px;background:rgba(60,60,67,.3)"></div>
    <div class="ab" style="left:0;bottom:0;width:135px;height:46px;display:flex;align-items:center;justify-content:center;font-size:16px;color:#0a7aff">Не разрешать</div>
    <div id="allowBtn" class="ab" style="left:135px;bottom:0;width:135px;height:46px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#0a7aff">Разрешить</div></div>
  <div id="stat"><span class="tm" id="tm">9:41</span><span class="ri" id="ri">
    <svg width="20" height="13" viewBox="0 0 20 13" fill="currentColor"><rect x="0" y="8" width="3.4" height="5" rx="1"/><rect x="5.5" y="5.5" width="3.4" height="7.5" rx="1"/><rect x="11" y="3" width="3.4" height="10" rx="1"/><rect x="16.5" y="0" width="3.4" height="13" rx="1"/></svg>
    <svg width="18" height="13" viewBox="0 0 24 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M2 6.5a14 14 0 0 1 20 0M5.5 10.5a9 9 0 0 1 13 0M9 14.4a4 4 0 0 1 6 0"/></svg>
    <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x=".6" y=".6" width="22" height="11.8" rx="3.6" stroke="currentColor" opacity=".4" stroke-width="1.2"/><rect x="2.2" y="2.2" width="18.8" height="8.6" rx="2.2" fill="currentColor"/><path d="M24.2 4.5v4a2 2 0 0 0 0-4z" fill="currentColor" opacity=".45"/></svg></span></div>
  <div id="hind"></div><div id="island"></div>`;
  // экран «Домой»
  const home = q('home');
  const LAB = ['Фото', 'Камера', 'Часы', 'Карты', 'Заметки', 'Музыка', 'Погода', 'Книги', 'Файлы', 'Дом', 'Здоровье', 'Кошелёк', 'Почта', 'Видео', 'Заметки+', 'Игры', 'Диктофон', 'Лупа'];
  const COLS = ['#6aa9ff|#2f6fe0', '#8d8d95|#3a3a40', '#ff9f43|#e66a1a', '#5bd27c|#1f9d4b', '#ffd34d|#e8a900', '#ff6b81|#d4264a', '#58c7ff|#2a8ad4', '#ff8a5b|#d4501f', '#4fa7ff|#1e5fc4', '#ff9ec2|#d6568a', '#7ee0b0|#2fa56e', '#b9a1ff|#6a4bd6', '#5fb0ff|#2872d6', '#ff6a6a|#c42b2b', '#ffc94d|#e69a00', '#7c8cff|#3f4fd0', '#c6c6ce|#7a7a84', '#9ad46a|#4f9b25'];
  let hh = '';
  const slot = (c, r) => [30 + c * 88, 118 + r * 100];
  let ai = 0;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) {
    if (c === 1 && r === 3) continue; const [x, y] = slot(c, r), col = COLS[ai % COLS.length].split('|');
    hh += '<div class="apc" style="left:' + x + 'px;top:' + y + 'px;background:linear-gradient(160deg,' + col[0] + ',' + col[1] + ');box-shadow:0 3px 8px rgba(0,0,0,.18)"><div style="position:absolute;left:19px;top:19px;width:22px;height:22px;border-radius:' + (ai % 3 ? '50%' : '7px') + ';border:3px solid rgba(255,255,255,.85)"></div></div><div class="alb" style="left:' + (x - 8) + 'px;top:' + (y + 64) + 'px">' + LAB[ai % LAB.length] + '</div>'; ai++;
  }
  const [mx, my] = slot(1, 3);
  hh += '<div id="mlab" class="alb" style="left:' + (mx - 8) + 'px;top:' + (my + 64) + 'px;font-weight:700">Madie</div>';
  hh += '<div class="ab" style="left:14px;top:728px;width:362px;height:100px;border-radius:34px;background:rgba(255,255,255,.22);backdrop-filter:blur(10px)"></div>';
  for (let c = 0; c < 4; c++) { const col = COLS[(c * 3 + 5) % COLS.length].split('|'); hh += '<div class="apc" style="left:' + (30 + c * 88) + 'px;top:748px;background:linear-gradient(160deg,' + col[0] + ',' + col[1] + ')"><div style="position:absolute;left:19px;top:19px;width:22px;height:22px;border-radius:7px;border:3px solid rgba(255,255,255,.85)"></div></div>'; }
  hh += '<div class="ab" style="left:171px;top:698px;width:48px;height:8px;display:flex;gap:7px;justify-content:center"><b style="width:7px;height:7px;border-radius:50%;background:#fff"></b><b style="width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.45)"></b></div>';
  hh += '<img id="madieIcon" class="apc" src="' + A + 'icon.png" style="left:' + mx + 'px;top:' + my + 'px;box-shadow:0 6px 16px rgba(0,0,0,.3);transform-origin:50% 50%;z-index:5">';
  hh += '<div id="badge" class="ab" style="left:' + (mx + 44) + 'px;top:' + (my - 10) + 'px;width:26px;height:26px;border-radius:13px;background:#ff3b30;color:#fff;font-weight:700;font-size:15px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.3);z-index:6;opacity:0">1</div>';
  home.innerHTML = hh;
  const mIcon = q('madieIcon'), badge = q('badge'), mlab = q('mlab');

  // цели для интерактива и подсветки (в системе координат телефона)
  const tg = (id, x, y, w, hh_) => over.appendChild(h('<div id="' + id + '" class="ab" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + hh_ + 'px"></div>'));
  tg('t-share', 166, 774, 52, 52); tg('t-home', 20, 504, 350, 52); tg('t-add', 284, 114, 92, 44); tg('t-icon', mx, my, 60, 60); tg('t-enable', 52, 484, 286, 58); tg('t-allow', 196, 470, 128, 46);
  const ringEls = RINGS.map(r => { const e = h('<div class="ring" style="left:' + r.x + 'px;top:' + r.y + 'px;width:' + r.w + 'px;height:' + r.h + 'px;border-radius:' + r.r + 'px;opacity:0"></div>'); over.appendChild(e); return e; });
  const callEls = CALL.map(c => { const e = h('<div class="bub ' + c.dir + '"><b>' + c.txt + '</b></div>'); over.appendChild(e); return e; });
  const ripples = TAPS.map(() => { const e = h('<div class="rp" style="opacity:0"></div>'); over.appendChild(e); return e; });
  const fg = h('<div class="fg" style="opacity:0"></div>'); over.appendChild(fg);

  // заголовки
  const hgs = SC.map(s => {
    const dots = s.n ? '<span class="dots">' + [1, 2, 3, 4].map(k => '<b class="' + (k <= s.n ? 'on' : '') + '"></b>').join('') + '</span>' : '';
    const words = s.title.split(' ').map(w => '<span>' + w + '</span>').join(' ');
    const fs_ = s.title.length <= 15 ? 104 : s.title.length <= 16 ? 96 : s.title.length <= 17 ? 88 : 76, ty = s.sub ? 306 : 330;
    const e = h('<div class="hg"><div class="eb"><i></i><span>' + s.eb + '</span>' + dots + '<i class="r"></i></div><div class="ti disp" style="font-size:' + fs_ + 'px;top:' + ty + 'px">' + words + '</div>' + (s.sub ? '<div class="su" style="top:' + (ty + 116) + 'px">' + s.sub + '</div>' : '') + '</div>');
    return { e, ws: [].slice.call(e.querySelectorAll('.ti span')), s };
  });
  stage.appendChild(h('<div id="fade"></div>'));
  hgs.forEach(g => stage.appendChild(g.e));

  // мишки и финальная плашка
  const bear1 = h('<img class="ab" src="' + A + 'bear3.png" style="left:-60px;top:1450px;width:370px;transform-origin:50% 100%;opacity:0">'); stage.appendChild(bear1);
  const bear2 = h('<img class="ab" src="' + A + 'bear3.png" style="left:770px;top:1430px;width:380px;transform-origin:50% 100%;opacity:0;transform:scaleX(-1)">'); stage.appendChild(bear2);
  const cta = h('<div class="ab" style="left:170px;top:1560px;width:740px;height:112px;border-radius:56px;background:linear-gradient(135deg,#D9687A,#BC4B5E);box-shadow:0 10px 0 #8F3445,0 24px 44px rgba(188,75,94,.38);display:flex;align-items:center;justify-content:center;gap:16px;color:#fff;font-weight:800;font-size:46px;letter-spacing:.01em;opacity:0;transform-origin:50% 50%">koreanmadie.study</div>'); stage.appendChild(cta);
  const sparks = []; for (let i = 0; i < 9; i++) { const e = h('<div class="spark"></div>'); stage.appendChild(e); sparks.push(e); }

  // ───────── рендер
  const statEl = q('stat'), hind = q('hind'), saf = q('saf'), app = q('app');
  const sheetEl = q('sheet'), sheetList = q('sheetList'), dim1 = q('dim1'), dim2 = q('dim2'), addEl = q('add'), rowHome = q('rowHome');
  const bannerEl = q('banner'), setcard = q('setcard'), appdim = q('appdim'), alertEl = q('alert'), alertdim = q('alertdim'), notif = q('notif');
  const micdim = q('micdim'), mic1 = q('mic1'), mic2 = q('mic2'), micx = q('micx'), micok = q('micok');
  const DARK = [28, 28, 30], WHITE = [255, 255, 255];

  function renderAt(t) {
    // фон
    blobs.forEach((b, i) => setT(b, Math.sin(t * .28 + i * 2) * 50, Math.cos(t * .22 + i) * 40, 1 + Math.sin(t * .3 + i) * .05, 0, 1));
    petals.forEach(p => {
      const y = ((p.y0 + t * p.sp) % 2300) - 160, x = p.x + Math.sin(t * .9 + p.ph) * 60;
      p.e.style.opacity = .5; p.e.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + (p.rot + t * p.rs).toFixed(1) + 'deg) scale(' + p.sz.toFixed(2) + ')';
    });
    // салют: только в финале
    burst.forEach(b => {
      const dt = t - 42.3 - b.dl;
      if (dt < 0 || dt > 4.2) { b.e.style.opacity = 0; return; }
      const x = b.x0 + b.vx * dt + Math.sin(dt * 3 + b.w) * 24, y = b.y0 + b.vy * dt + 900 * dt * dt * .5;
      b.e.style.opacity = (1 - P(dt, 3.3, .9, E.lin)).toFixed(2); b.e.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + (b.r0 + b.w * dt).toFixed(1) + 'deg)';
    });

    // камера и телефон
    const c = cam(t);
    const rise = P(t, .25, 1.15, E.back), riseY = (1 - rise) * 1300, tilt = (1 - P(t, .25, 1.0, E.out3)) * 7;
    phw.style.transform = 'translate(0px,' + riseY.toFixed(1) + 'px) rotate(' + tilt.toFixed(2) + 'deg)';
    phw.style.transformOrigin = '540px 1040px';
    ph.style.transform = 'translate(540px,' + c.ay.toFixed(2) + 'px) scale(' + c.s.toFixed(4) + ') translate(' + (-c.fx).toFixed(2) + 'px,' + (-c.fy).toFixed(2) + 'px)';
    const inv = 1 / c.s;

    // — Safari-слой и переходы
    const toHome = P(t, 20.95, .55, E.inOut);                   // Safari → «Домой»
    const hv = t < 20.95 ? 0 : (t < 41.4 ? toHome : toHome);   // «Домой» виден после установки
    saf.style.opacity = (1 - toHome).toFixed(3); saf.style.transform = 'scale(' + lerp(1, .93, toHome).toFixed(4) + ')'; saf.style.visibility = toHome >= 1 ? 'hidden' : 'visible';
    home.style.opacity = hv.toFixed(3); home.style.transform = 'scale(' + lerp(1.07, 1, hv).toFixed(4) + ')';
    // баннер на странице чуть «дышит» перед шагами (подсказка, что он тоже ведёт к инструкции)
    bannerEl.style.transform = 'scale(' + (1 + Math.sin(P(t, 2.2, 1.2, E.lin) * Math.PI) * .03).toFixed(4) + ')';

    // — шторка «Поделиться»
    const s0 = st(t), shOn = t >= 10.9 && t < 17.9;
    sheetEl.style.top = s0.toFixed(2) + 'px'; sheetEl.style.visibility = (t >= 10.9 && t < 21.1) ? 'visible' : 'hidden';
    sheetList.style.transform = 'translateY(' + (-scroll(t)).toFixed(2) + 'px)';
    dim1.style.opacity = (.26 * P(t, 11.0, .6, E.out3) * (1 - P(t, 17.4, .5, E.out3))).toFixed(3);
    const flash = P(t, T_.home - .02, .1, E.lin) * (1 - P(t, T_.home + .1, .35, E.out3));
    rowHome.style.background = 'rgba(60,60,67,' + (.14 * flash).toFixed(3) + ')';
    // — шторка «На экран Домой»
    const aTop = lerp(844, 96, P(t, 17.2, .8, E.out4));
    addEl.style.top = aTop.toFixed(2) + 'px'; addEl.style.visibility = (t >= 17.15 && t < 21.2) ? 'visible' : 'hidden';
    dim2.style.opacity = (.32 * P(t, 17.3, .6, E.out3)).toFixed(3);
    q('addBtn').style.opacity = (1 - .6 * P(t, T_.add, .1, E.lin) * (1 - P(t, T_.add + .12, .2, E.lin))).toFixed(2);

    // — значок Madie: прилёт из шторки на «Домой»
    const fl = P(t, 21.15, .75, E.inOut);
    const sx = 20 + 16 + 30, sy = 96 + 80 + 18 + 30;            // центр значка в шторке
    const [mx0, my0] = [mx + 30, my + 30];
    let ix = lerp(sx, mx0, fl), iy = lerp(sy, my0, fl) - Math.sin(fl * Math.PI) * 70;
    const land = P(t, 21.9, .55, E.spring);
    const isc = t < 21.15 ? 1 : (fl < 1 ? lerp(1, 1.18, Math.sin(fl * Math.PI)) : 1 + (1 - land) * .0 + Math.sin(P(t, 21.9, .5, E.lin) * Math.PI) * .12);
    mIcon.style.transform = 'translate(' + (ix - mx0).toFixed(2) + 'px,' + (iy - my0).toFixed(2) + 'px) scale(' + isc.toFixed(4) + ')';
    mIcon.style.opacity = (t < 20.95 ? 0 : P(t, 20.95, .3, E.lin)).toFixed(2);
    mlab.style.opacity = P(t, 22.1, .3, E.lin).toFixed(2);
    badge.style.opacity = '0';
    const bp = P(t, 42.7, .5, E.spring); badge.style.opacity = t >= 42.7 ? '1' : '0'; badge.style.transform = 'scale(' + bp.toFixed(3) + ')';

    // — запуск приложения (clip-path из значка во весь экран)
    const opening = t >= 25.0 && t < 41.3;
    const u = t < 41.3 ? P(t, 25.05, .8, E.out4) : 1 - P(t, 41.3, .55, E.inOut);
    const appOn = (t >= 25.0 && t < 41.9);
    app.style.visibility = appOn ? 'visible' : 'hidden';
    const ins = { tp: lerp(my, 0, u), lf: lerp(mx, 0, u), rt: lerp(390 - mx - 60, 0, u), bt: lerp(844 - my - 60, 0, u), r: lerp(15, 48, u) };
    app.style.clipPath = 'inset(' + ins.tp.toFixed(1) + 'px ' + ins.rt.toFixed(1) + 'px ' + ins.bt.toFixed(1) + 'px ' + ins.lf.toFixed(1) + 'px round ' + ins.r.toFixed(1) + 'px)';
    app.style.opacity = P(t, 25.05, .12, E.lin).toFixed(2);
    // карточка настроек, alert, баннер уведомления
    const sc = P(t, 29.95, .45, E.back) * (1 - P(t, 34.0, .3, E.in2));
    setcard.style.opacity = clamp(sc * 1.6).toFixed(3); setcard.style.transform = 'scale(' + lerp(.86, 1, clamp(sc)).toFixed(4) + ')';
    appdim.style.opacity = (.34 * P(t, 29.9, .4, E.out3) * (1 - P(t, 34.0, .4, E.out3))).toFixed(3);
    const enF = P(t, T_.enable - .02, .1, E.lin) * (1 - P(t, T_.enable + .1, .3, E.out3));
    q('enableBtn').style.transform = 'translateY(' + (5 * enF).toFixed(2) + 'px)'; q('enableBtn').style.boxShadow = '0 ' + (6 - 5 * enF).toFixed(1) + 'px 0 #8F3445';
    const al = P(t, 32.05, .35, E.back) * (1 - P(t, 34.0, .22, E.in2));
    alertEl.style.opacity = clamp(al * 1.5).toFixed(3); alertEl.style.transform = 'scale(' + lerp(1.14, 1, clamp(al)).toFixed(4) + ')';
    alertEl.style.visibility = (al > .001) ? 'visible' : 'hidden';
    alertdim.style.opacity = (.32 * P(t, 32.0, .3, E.out3) * (1 - P(t, 34.0, .3, E.out3))).toFixed(3);
    const nIn = P(t, 34.6, .6, E.spring), nOut = P(t, 36.3, .45, E.in2);
    notif.style.transform = 'translateY(' + lerp(-150, 0, nIn - nOut).toFixed(2) + 'px)'; notif.style.opacity = (t >= 34.55 ? 1 - nOut : 0).toFixed(2);
    // — «голос»
    micdim.style.opacity = (.4 * P(t, 36.4, .4, E.out3) * (1 - P(t, 41.2, .4, E.out3))).toFixed(3);
    const m1 = P(t, 36.8, .5, E.back) * (1 - P(t, 41.2, .3, E.in2)), m2 = P(t, 38.4, .5, E.back) * (1 - P(t, 41.2, .3, E.in2));
    mic1.style.opacity = clamp(m1 * 1.6).toFixed(3); mic1.style.transform = 'translateY(' + ((1 - clamp(m1)) * 40).toFixed(1) + 'px) scale(' + lerp(.9, 1, clamp(m1)).toFixed(3) + ')';
    mic2.style.opacity = clamp(m2 * 1.6).toFixed(3); mic2.style.transform = 'translateY(' + ((1 - clamp(m2)) * 40).toFixed(1) + 'px) scale(' + lerp(.9, 1, clamp(m2)).toFixed(3) + ')';
    micx.style.transform = 'rotate(-45deg) scaleX(' + P(t, 37.5, .35, E.out3).toFixed(3) + ')';
    micok.style.transform = 'scale(' + P(t, 39.3, .45, E.spring).toFixed(3) + ')';

    // статус-бар
    const light = hv * (1 - clamp((P(t, 25.0, .1, E.lin)))) + (t >= 41.3 ? 1 - u : 0) * hv;
    const col = rgb(DARK, WHITE, clamp(t < 25.0 ? hv : (t < 41.3 ? 0 : 1 - u)));
    statEl.style.color = col; hind.style.background = (hv > .5 && t < 25.0) || t >= 41.6 ? 'rgba(255,255,255,.85)' : 'rgba(28,28,30,.85)';

    // подсветки, пузыри, палец
    RINGS.forEach((r, i) => {
      const a = P(t, r.t0, .3, E.back) * (1 - P(t, r.t1 - .25, .25, E.in2)), pulse = 1 + .05 * Math.sin((t - r.t0) * 6.2);
      ringEls[i].style.opacity = clamp(a * 1.4).toFixed(3); ringEls[i].style.transform = 'scale(' + (clamp(a) * pulse).toFixed(4) + ')';
    });
    CALL.forEach((cc, i) => {
      const a = P(t, cc.t0, .35, E.back) * (1 - P(t, cc.t1 - .22, .22, E.in2)), e = callEls[i];
      const off = cc.dir === 'down' ? '-50%,calc(-100% - 16px)' : '-50%,16px';
      e.style.transformOrigin = cc.dir === 'down' ? '50% 100%' : '50% 0%';
      e.style.transform = 'translate(' + cc.x + 'px,' + cc.y + 'px) scale(' + (inv * clamp(a)).toFixed(4) + ') translate(' + off + ')';
      e.style.opacity = clamp(a * 1.6).toFixed(3);
    });
    const f = finger(t);
    if (f) { fg.style.opacity = f.o.toFixed(3); fg.style.transform = 'translate(' + f.x.toFixed(2) + 'px,' + f.y.toFixed(2) + 'px) scale(' + (inv * (1 - .16 * f.p)).toFixed(4) + ')'; }
    else fg.style.opacity = 0;
    TAPS.forEach((tp, i) => {
      const f2 = finger(tp.t), r = ripples[i], uu = (t - tp.t) / .55;
      if (!f2 || uu < 0 || uu > 1) { r.style.opacity = 0; return; }
      const e2 = E.out3(uu); r.style.opacity = ((1 - uu) * .85).toFixed(3); r.style.transform = 'translate(' + f2.x + 'px,' + f2.y + 'px) scale(' + (inv * lerp(.7, 2.5, e2)).toFixed(4) + ')';
    });

    // заголовки
    hgs.forEach((g, i) => {
      const s = g.s, uin = P(t, s.t0, .5, E.out3), uout = i === SC.length - 1 ? 0 : P(t, s.t1 - .05, .32, E.in2);
      const vis = t >= s.t0 - .001 && t < s.t1 + .4;
      g.e.style.display = vis ? 'block' : 'none';
      if (!vis) return;
      g.e.style.opacity = (clamp(uin * 1.4) * (1 - uout)).toFixed(3);
      g.e.style.transform = 'translateY(' + ((1 - uin) * 30 - uout * 26).toFixed(2) + 'px)';
      g.ws.forEach((w, k) => { const v = P(t, s.t0 + .06 + k * .09, .45, E.out3); w.style.opacity = v.toFixed(3); w.style.transform = 'translateY(' + ((1 - v) * 34).toFixed(1) + 'px)'; });
    });
    // мишки
    const b1in = P(t, 1.7, .7, E.spring), b1out = P(t, 3.15, .5, E.in2);
    bear1.style.opacity = (t >= 1.7 && t < 3.7) ? 1 : 0; bear1.style.transform = 'translateY(' + (lerp(420, 0, b1in) + b1out * 520).toFixed(1) + 'px) rotate(' + (Math.sin(t * 3.3) * 2.2).toFixed(2) + 'deg)';
    const b2in = P(t, 42.5, .8, E.spring);
    bear2.style.opacity = t >= 42.5 ? 1 : 0; bear2.style.transform = 'translateY(' + lerp(460, 0, b2in).toFixed(1) + 'px) scaleX(-1) rotate(' + (Math.sin(t * 3.0) * 2).toFixed(2) + 'deg)';
    const cin = P(t, 43.0, .6, E.back);
    cta.style.opacity = clamp(cin * 2).toFixed(2); cta.style.transform = 'translateY(' + ((1 - cin) * 50).toFixed(1) + 'px) scale(' + lerp(.85, 1, clamp(cin)).toFixed(3) + ')';
    // искры при посадке значка
    sparks.forEach((e, i) => {
      const a = (i / sparks.length) * 6.283, dt = t - 21.95;
      if (dt < 0 || dt > .9) { e.style.opacity = 0; return; }
      const d = 40 + 120 * E.out3(dt / .9), scl = Math.sin(clamp(dt / .9) * Math.PI);
      // координаты значка на сцене: из логики камеры (стадии) считаем через проекцию
      const px = 540 + (mx0 - c.fx) * c.s, py = c.ay + (my0 - c.fy) * c.s;
      e.style.opacity = scl.toFixed(2); e.style.transform = 'translate(' + (px + Math.cos(a) * d * c.s / 1.3).toFixed(1) + 'px,' + (py + Math.sin(a) * d * c.s / 1.3).toFixed(1) + 'px) scale(' + (scl * 1.2).toFixed(2) + ') rotate(' + (dt * 200).toFixed(1) + 'deg)';
    });
  }

  // Весь сценарий проигрывается быстрее: внутренние времена — в «длинной» шкале, наружу отдаём сжатую
  const OUT_TOTAL = 34.8, K = TOTAL / OUT_TOTAL;
  const SCo = SC.map(s => Object.assign({}, s, { t0: s.t0 / K, t1: s.t1 / K }));
  const TAPSo = TAPS.map(x => Object.assign({}, x, { t: x.t / K, hold: x.hold / K }));
  const renderOut = tt => renderAt(tt * K);
  window.GUIDE = { SC: SCo, TAPS: TAPSo, TOTAL: OUT_TOTAL, K, renderAt: renderOut };
  window.renderAt = renderOut;
})();

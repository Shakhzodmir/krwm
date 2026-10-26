/* Комдори — интерактивный мишка (SVG + пружинная анимация).
 *
 * Взят из Mishka_Interactive.html (26.10.2026): оставлены только фигура, мимика, движения и синхронизация губ;
 * убраны чат, голос, настройки, декор сцены. Что добавлено под приложение:
 *   — несколько мишек на странице (уникальные id в SVG), destroy() для SPA;
 *   — настроения приложения: strict / normal / kind / happy (+ все исходные: joy, love, surprise, thinking, sad, calm, angry, evil);
 *   — listening / thinking (три точки над головой) / speak(текст) с губами по слогам (хангыль считается по слогам);
 *   — «спокойный режим»: prefers-reduced-motion и body.calm-motion выключают движение, остаётся статичная поза с мимикой.
 *
 * Использование:
 *   const box = document.querySelector('#slot');
 *   const bear = Komdori.mount(box, { mood: 'normal', pet: false });   // вставит svg и запустит анимацию
 *   bear.setMood('kind'); bear.setListening(true); bear.setLevel(.4);  // уровень микрофона 0…1
 *   bear.setThinking(true);
 *   bear.speak('안녕하세요! 만나서 반가워요', { seconds: 2.4 });       // seconds — длительность озвучки, если известна
 *   bear.boundary(charIndex);                                          // (по желанию) подгонка к событиям TTS
 *   bear.stopSpeak(); bear.perform('wave'); bear.destroy();
 */
(() => {
  'use strict';

  const SVG = `<svg class="kdb" data-uid="@U@" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
<defs>
<radialGradient id="fur-@U@" cx="37%" cy="23%" r="85%"><stop stop-color="#f4dfbc"/><stop offset=".57" stop-color="#e8c99c"/><stop offset="1" stop-color="#d5aa78"/></radialGradient>
<radialGradient id="ear-@U@" cx="35%" cy="25%" r="90%"><stop stop-color="#f0d5ac"/><stop offset="1" stop-color="#d1a16d"/></radialGradient>
<radialGradient id="inner-ear-@U@"><stop stop-color="#d2a371"/><stop offset="1" stop-color="#ddb885"/></radialGradient>
<radialGradient id="muzzle-@U@" cx="40%" cy="25%" r="80%"><stop stop-color="#fff2dc"/><stop offset="1" stop-color="#f3dcb7"/></radialGradient>
<radialGradient id="cheek-@U@"><stop id="cheek-color-@U@" stop-color="#df9a87" stop-opacity=".65"/><stop offset="1" stop-color="#df9a87" stop-opacity="0"/></radialGradient>
<linearGradient id="shirt-@U@" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#34435d"/><stop offset=".5" stop-color="#26354d"/><stop offset="1" stop-color="#17243b"/></linearGradient>
<linearGradient id="sleeve-@U@" x1="0" x2="1"><stop stop-color="#34435d"/><stop offset="1" stop-color="#24334b"/></linearGradient>
<linearGradient id="nose-@U@" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#674331"/><stop offset="1" stop-color="#412d24"/></linearGradient>
<linearGradient id="eye-@U@" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#46352d"/><stop offset="1" stop-color="#221d1d"/></linearGradient>
<filter id="soft-shadow-@U@" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
<clipPath id="eye-cut-left-@U@"><path id="eye-cut-left-path-@U@" d="M-30-32H30V32H-30Z"/></clipPath><clipPath id="eye-cut-right-@U@"><path id="eye-cut-right-path-@U@" d="M-30-32H30V32H-30Z"/></clipPath>
<clipPath id="mouth-clip-@U@"><path id="mouth-clip-path-@U@" d="M274 365Q300 372 326 365Q323 382 300 382Q277 382 274 365Z"/></clipPath>
<filter id="fur-texture-@U@"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".055"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter>
</defs>
<ellipse id="ground-@U@" cx="300" cy="582" rx="150" ry="11" fill="#6a4a3a" opacity=".13" filter="url(#soft-shadow-@U@)"/>
<g id="character-root-@U@">
<g id="bear-body-@U@">
<g id="leg-left-@U@"><ellipse cx="231" cy="554" rx="41" ry="26" fill="url(#ear-@U@)"/><path d="m213 556 2 7m9-9 1 8" stroke="#c79e72" stroke-width="2.3" stroke-linecap="round"/></g>
<g id="leg-right-@U@"><ellipse cx="369" cy="554" rx="41" ry="26" fill="url(#ear-@U@)"/><path d="m387 556-2 7m-9-9-1 8" stroke="#c79e72" stroke-width="2.3" stroke-linecap="round"/></g>
<path d="M185 436Q213 418 240 422h120q40-2 65 15 25 26 28 71l-5 34q-145 32-296 0l-5-34q3-46 38-72" fill="url(#shirt-@U@)"/>
<path d="M237 423q10 44 63 59 53-15 63-59" fill="#1a293f"/>
<path d="m236 428 64 46 64-46" fill="none" stroke="#fcf4e6" stroke-width="7" stroke-linejoin="round"/>
<path d="m237 438 63 46 63-46" fill="none" stroke="#87909b" stroke-width="1.5" opacity=".45"/>
<path d="M183 508q-8 18-4 33M417 508q8 18 4 33" fill="none" stroke="#526078" stroke-width="2" opacity=".35"/>
<path d="M368 512h20m-16-5v10m5-10v10m5-10v10" stroke="#cdb595" stroke-width="1.5" stroke-linecap="round" opacity=".9"/>
</g>
<g id="bear-head-@U@">
<g id="ear-left-@U@"><ellipse cx="156" cy="150" rx="65" ry="67" fill="url(#ear-@U@)" transform="rotate(-25 156 150)"/><ellipse cx="159" cy="153" rx="40" ry="42" fill="url(#inner-ear-@U@)" transform="rotate(-25 159 153)"/><path d="M118 136q12-33 41-32" fill="none" stroke="#f6e4c6" stroke-width="6" opacity=".4" stroke-linecap="round"/></g>
<g id="ear-right-@U@"><ellipse cx="444" cy="150" rx="65" ry="67" fill="url(#ear-@U@)" transform="rotate(25 444 150)"/><ellipse cx="441" cy="153" rx="40" ry="42" fill="url(#inner-ear-@U@)" transform="rotate(25 441 153)"/><path d="M451 105q26 3 37 31" fill="none" stroke="#f6e4c6" stroke-width="6" opacity=".3" stroke-linecap="round"/></g>
<path d="M107 296c0-107 71-178 193-178s193 71 193 178c0 100-63 166-193 166S107 396 107 296Z" fill="url(#fur-@U@)"/>
<path d="M130 270q11-116 140-131" fill="none" stroke="#fff0d7" stroke-width="5" opacity=".17" stroke-linecap="round"/>
<g id="bear-face-@U@">
<ellipse id="cheek-left-@U@" cx="174" cy="335" rx="46" ry="33" fill="url(#cheek-@U@)"/>
<ellipse id="cheek-right-@U@" cx="426" cy="335" rx="46" ry="33" fill="url(#cheek-@U@)"/>
<g id="brow-left-@U@"><path id="brow-left-path-@U@" d="M198 248Q218 237 238 246" fill="none" stroke="#6c4933" stroke-width="8" stroke-linecap="round"/></g>
<g id="brow-right-@U@"><path id="brow-right-path-@U@" d="M362 246Q382 237 402 248" fill="none" stroke="#6c4933" stroke-width="8" stroke-linecap="round"/></g>
<g id="eye-left-@U@" transform="translate(219 287)"><g id="lid-left-@U@" clip-path="url(#eye-cut-left-@U@)"><ellipse rx="17" ry="21" fill="url(#eye-@U@)"/><ellipse cx="-5" cy="-7" rx="5" ry="6" fill="#fff" opacity=".92"/><circle cx="6" cy="8" r="2.5" fill="#e9cda2" opacity=".4"/></g></g>
<g id="eye-right-@U@" transform="translate(381 287)"><g id="lid-right-@U@" clip-path="url(#eye-cut-right-@U@)"><ellipse rx="17" ry="21" fill="url(#eye-@U@)"/><ellipse cx="-5" cy="-7" rx="5" ry="6" fill="#fff" opacity=".92"/><circle cx="6" cy="8" r="2.5" fill="#e9cda2" opacity=".4"/></g></g>
<path id="happy-eye-left-@U@" d="M202 286q17-22 34 0" fill="none" stroke="#493324" stroke-width="7" stroke-linecap="round" opacity="0"/>
<path id="happy-eye-right-@U@" d="M364 286q17-22 34 0" fill="none" stroke="#493324" stroke-width="7" stroke-linecap="round" opacity="0"/>
<ellipse id="muzzle-pad-@U@" cx="300" cy="353" rx="69" ry="56" fill="url(#muzzle-@U@)"/>
<ellipse cx="300" cy="337" rx="20" ry="4" fill="#c6a27a" opacity=".1" filter="url(#soft-shadow-@U@)"/>
<path d="M280 328c0-13 40-13 40 0 0 8-13 19-20 19s-20-11-20-19Z" fill="url(#nose-@U@)"/>
<path d="M286 323q13-5 26 0" stroke="#926c50" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
<path id="philtrum-@U@" d="M300 345v8" stroke="#805b42" stroke-width="3.5" stroke-linecap="round" opacity=".55"/>
<path id="mouth-open-@U@" d="M274 365Q300 372 326 365Q323 382 300 382Q277 382 274 365Z" fill="#503129" stroke="#6c4430" stroke-width="1.6" opacity="0"/>
<g clip-path="url(#mouth-clip-@U@)"><path id="mouth-teeth-@U@" d="M265 355Q300 363 335 355L331 373Q300 377 269 373Z" fill="#fff3da" opacity="0"/><path id="mouth-tongue-@U@" d="M279 391Q300 370 321 391L321 405H279Z" fill="#ce847a" opacity="0"/></g>
<path id="mouth-smile-@U@" d="M277 365Q300 383 323 365" fill="none" stroke="#76503a" stroke-width="4" stroke-linecap="round"/>
<path id="lower-lip-@U@" d="M286 388Q300 392 314 388" fill="none" stroke="#cba37a" stroke-width="2" stroke-linecap="round" opacity="0"/>
<path id="dimple-left-@U@" d="m271 365 3-4" fill="none" stroke="#b38c64" stroke-width="2.2" stroke-linecap="round" opacity=".3"/>
<path id="dimple-right-@U@" d="m326 361 3 4" fill="none" stroke="#b38c64" stroke-width="2.2" stroke-linecap="round" opacity=".3"/>
<path id="tear-@U@" d="M414 307q-12 21 0 23 12-2 0-23Z" fill="#84b6ca" opacity="0"/>
</g>
<g id="dots-@U@" opacity="0" fill="#BC4B5E"><circle cx="262" cy="62" r="11"/><circle cx="300" cy="62" r="11"/><circle cx="338" cy="62" r="11"/></g>
<g id="anger-mark-@U@" opacity="0" fill="none" stroke="#bd7862" stroke-width="3.5" stroke-linecap="round"><path d="M420 203q0 9-9 9m25-9q0 9 9 9m-34 15q9 0 9 9m25-9q-9 0-9 9"/></g>
<g id="head-glints-@U@" opacity="0"><path d="m149 222 5 10 10 5-10 5-5 10-5-10-10-5 10-5Z" fill="#fff3cd"/><path d="m453 218 4 8 8 4-8 4-4 8-4-8-8-4 8-4Z" fill="#fff3cd"/></g>
</g>
<g id="arms-front-@U@"><g id="arm-left-@U@">
<path d="M196 439q-32-7-52 38l-15 40q6 22 36 22l35-65q15-24-4-35Z" fill="url(#sleeve-@U@)"/>
<g id="forearm-left-@U@"><path d="m143 485-14 31q5 22 34 23l18-36Z" fill="url(#sleeve-@U@)"/><path d="m131 516 30 14" fill="none" stroke="#48566c" stroke-width="3"/><g id="paw-left-@U@"><ellipse cx="143" cy="534" rx="29" ry="28" fill="url(#fur-@U@)" transform="rotate(-14 143 534)"/><ellipse cx="139" cy="531" rx="13" ry="12" fill="#edc5a2" opacity=".35"/><path d="m128 531 1 8m10-12 1 8" stroke="#c49c70" stroke-width="2" stroke-linecap="round" opacity=".6"/></g></g>
</g><g id="arm-right-@U@">
<path d="M404 439q32-7 52 38l15 40q-6 22-36 22l-35-65q-15-24 4-35Z" fill="url(#sleeve-@U@)"/>
<g id="forearm-right-@U@"><path d="m457 485 14 31q-5 22-34 23l-18-36Z" fill="url(#sleeve-@U@)"/><path d="m469 516-30 14" fill="none" stroke="#48566c" stroke-width="3"/><g id="paw-right-@U@"><ellipse cx="457" cy="534" rx="29" ry="28" fill="url(#fur-@U@)" transform="rotate(14 457 534)"/><ellipse cx="461" cy="531" rx="13" ry="12" fill="#edc5a2" opacity=".35"/><path d="m472 531-1 8m-10-12-1 8" stroke="#c49c70" stroke-width="2" stroke-linecap="round" opacity=".6"/></g></g>
</g></g>
</g>
</svg>`;

  const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);
  let uidSeq = 0;

  const neutral = { x: 0, y: 0, r: 0, sx: 1, sy: 1, bodyR: 0, headR: 0, headX: 0, headY: 0, armL: 0, armR: 0, foreL: 0, foreR: 0, eye: 0, happy: 0, smile: 0, jaw: 0, teeth: 0, round: 0, brow: 0, wink: 0, earL: 0, earR: 0, gazeX: 0, gazeY: 0, legL: 0, legR: 0 };

  // Мимика: eye — раскрытие глаз, brow — подъём бровей, browTilt — наклон (строгость), smile — улыбка, cheeks — румянец,
  // tilt — наклон головы, happy — «счастливые» дуги вместо глаз, tear — слеза
  const facePresets = {
    // настроения приложения (как «как строго проверяет» в разговоре)
    strict: { eye: .7, brow: 5, browTilt: 13, smile: -.2, cheeks: .45, tilt: -2, happy: 0, tear: 0 },
    normal: { eye: .94, brow: -1, browTilt: 0, smile: .4, cheeks: .55, tilt: 0, happy: 0, tear: 0 },
    kind: { eye: .9, brow: -3, browTilt: -3, smile: .85, cheeks: .9, tilt: 3, happy: 0, tear: 0 },
    happy: { eye: .8, brow: -2, browTilt: 0, smile: 1, cheeks: 1.2, tilt: 4, happy: .6, tear: 0 },
    // исходные
    joy: { eye: .94, brow: -2, browTilt: 0, smile: .8, cheeks: .8, tilt: -2, happy: 0, tear: 0 },
    love: { eye: .7, brow: 1, browTilt: 0, smile: 1.05, cheeks: 1.4, tilt: 5, happy: .9, tear: 0 },
    surprise: { eye: 1.22, brow: -17, browTilt: 0, smile: .05, cheeks: .4, tilt: -3, happy: 0, tear: 0 },
    thinking: { eye: .82, brow: -3, browTilt: 7, smile: .12, cheeks: .4, tilt: 8, happy: 0, tear: 0 },
    sad: { eye: .82, brow: 0, browTilt: -10, smile: -.58, cheeks: .45, tilt: -4, happy: 0, tear: .55 },
    calm: { eye: .8, brow: 3, browTilt: 0, smile: .45, cheeks: .55, tilt: 0, happy: .75, tear: 0 },
    angry: { eye: .64, brow: 8, browTilt: 19, smile: -.58, cheeks: 1, tilt: -3, happy: 0, tear: 0 },
    evil: { eye: .72, brow: 5, browTilt: 22, smile: .6, cheeks: .45, tilt: 7, happy: 0, tear: 0 }
  };

  // Позы рта по звукам: сдержанные — морда мягкая, согласные смыкают губы, пауза возвращает улыбку
  const visemes = {
    REST: { open: 0, width: 23, round: 0, teeth: 0 },
    A: { open: .78, width: 26, round: .15, teeth: .12 },
    E: { open: .34, width: 30, round: 0, teeth: .75 },
    O: { open: .66, width: 17, round: 1, teeth: 0 },
    U: { open: .38, width: 12, round: 1, teeth: 0 },
    MBP: { open: 0, width: 21, round: 0, teeth: 0 },
    FV: { open: .13, width: 25, round: 0, teeth: .95 },
    L: { open: .29, width: 26, round: .1, teeth: .4 },
    S: { open: .15, width: 24, round: .1, teeth: .35 },
    C: { open: .22, width: 24, round: .15, teeth: .08 }
  };
  function letterPose(letter) {
    if (/[мбпmbp]/i.test(letter)) return 'MBP';
    if (/[ааяa]/i.test(letter)) return 'A';
    if (/[еэиыєіїeyi]/i.test(letter)) return 'E';
    if (/[оёo]/i.test(letter)) return 'O';
    if (/[уюuw]/i.test(letter)) return 'U';
    if (/[фвfv]/i.test(letter)) return 'FV';
    if (/[лтднltdn]/i.test(letter)) return 'L';
    if (/[сзцшжщчszhjc]/i.test(letter)) return 'S';
    return /[\p{L}\p{N}]/u.test(letter) ? 'C' : 'REST';
  }
  // Текст → расписание поз рта. Хангыль раскладывается по слогам: начальная/гласная/конечная.
  function makeSpeech(text, rate = 1) {
    const cues = []; let time = .09, index = 0;
    const push = (kind, duration, charIndex) => { const length = duration / clamp(rate, .5, 2); cues.push({ kind, at: time, end: time + length, index: charIndex }); time += length; };
    push('REST', .04, 0);
    for (const letter of text) {
      const code = letter.codePointAt(0);
      if (code >= 0xac00 && code <= 0xd7a3) {
        const syl = code - 0xac00, initial = Math.floor(syl / 588), vowel = Math.floor((syl % 588) / 28), final = syl % 28;
        push([6, 7, 8, 17].includes(initial) ? 'MBP' : 'C', .045, index);
        push([0, 2, 4, 6].includes(vowel) ? 'A' : [8, 9, 10, 11, 12].includes(vowel) ? 'O' : [13, 14, 15, 16, 17].includes(vowel) ? 'U' : 'E', .105, index);
        if (final) push([16, 17, 18, 26].includes(final) ? 'MBP' : 'L', .04, index);
      } else {
        const kind = letterPose(letter);
        const duration = /[.!?。！？]/.test(letter) ? .28 : /[,;:…，]/.test(letter) ? .17 : /\s/.test(letter) ? .065 : kind === 'REST' ? .06 : kind === 'MBP' ? .075 : ['A', 'E', 'O', 'U'].includes(kind) ? .095 : .048;
        push(kind, duration, index);
      }
      index += letter.length;
    }
    push('REST', .24, text.length);
    return { cues, total: time, text };
  }
  function speechPose(timeline, time) {
    const cues = timeline.cues;
    let lo = 0, hi = cues.length - 1;
    while (lo < hi) { const mid = Math.floor((lo + hi) / 2); if (cues[mid].end < time) lo = mid + 1; else hi = mid; }
    const cue = cues[lo];
    if (time < cue.at || time > timeline.total) return { ...visemes.REST, kind: 'REST', index: cue.index };
    const next = cues[Math.min(lo + 1, cues.length - 1)];
    const blend = clamp((time - (cue.end - .025)) / .025) * .65;
    const a = visemes[cue.kind], b = visemes[next.kind], pose = { kind: cue.kind, index: cue.index };
    for (const key of ['open', 'width', 'round', 'teeth']) pose[key] = mix(a[key], b[key], smooth(blend));
    return pose;
  }

  // Движения: ключевые кадры [секунда, поза]; недостающие поля берутся из neutral
  function clip(frames) { return frames.map(([time, pose]) => ({ time, pose: { ...neutral, ...pose } })); }
  const angryRest = { armL: -98, armR: 98, foreL: -28, foreR: 28, headY: 3 };
  const evilRest = { armL: -112, armR: 112, foreL: -12, foreR: 12, headY: 6, jaw: .13, teeth: .75, sx: 1.015, sy: 1.01 };
  const clips = {
    evil: clip([[0, {}], [.2, { y: 5, headR: -5, armL: -35, armR: 35 }], [.58, { ...evilRest, headR: -3, headY: 9, eye: -.06 }], [.94, { ...evilRest, y: -4, headR: 4, jaw: .28, teeth: .9, smile: .15 }], [1.16, { ...evilRest, y: 2, headR: 1, jaw: .1 }], [1.4, { ...evilRest, y: -3, headR: 4, jaw: .24, teeth: .9, smile: .15 }], [1.65, { ...evilRest, y: 2, headR: 1, jaw: .1 }], [2.15, { ...evilRest, headR: -3, foreL: -18, foreR: 18, earL: 6, earR: -6 }], [3.15, { ...evilRest }]]),
    angry: clip([[0, {}], [.25, { y: 6, headR: -5, brow: 3, armL: -50, armR: 50 }], [.55, { ...angryRest, y: -3, headR: -4, earL: -5, earR: 5 }], [.85, { ...angryRest, y: 3, sx: 1.025, sy: .98 }], [1.1, { ...angryRest, y: -7, legL: -14, r: -3 }], [1.3, { ...angryRest, y: 7, sx: 1.035, sy: .965, headY: 5 }], [1.65, { ...angryRest, headR: 3 }], [1.95, { ...angryRest, y: -5, legR: 14, r: 3 }], [2.17, { ...angryRest, y: 6, sx: 1.03, sy: .97, headY: 5 }], [2.65, { ...angryRest, headR: -2 }], [3.2, { ...angryRest }]]),
    wave: clip([[0, {}], [.18, { y: 5, sx: 1.03, sy: .97, headR: 5, armR: 16 }], [.46, { y: -6, headR: -7, armR: -135, foreR: -15, smile: .15 }], [.73, { y: -3, headR: -5, armR: -111, foreR: 16 }], [1, { headR: -6, armR: -144, foreR: -18 }], [1.28, { headR: -4, armR: -110, foreR: 13 }], [1.55, { headR: -6, armR: -140, foreR: -16, wink: .95 }], [1.83, { headR: 2, armR: -80, foreR: 4 }], [2.25, {}]]),
    laugh: clip([[0, {}], [.22, { y: 5, headY: -3, headR: -3, happy: .5, jaw: .25, armL: -15, armR: 15 }], [.48, { y: -9, headY: -9, headR: 4, happy: 1, jaw: .8, teeth: .7, smile: .3, armL: -28, armR: 28 }], [.72, { y: 1, sy: .97, headR: -3, happy: 1, jaw: .3, teeth: .4, armL: -20, armR: 20 }], [.98, { y: -7, headY: -7, headR: 4, happy: 1, jaw: .72, teeth: .7, armL: -30, armR: 30 }], [1.22, { y: 2, sy: .97, headR: -3, happy: 1, jaw: .23, armL: -20, armR: 20 }], [1.48, { y: -7, headY: -6, headR: 3, happy: 1, jaw: .67, teeth: .7, armL: -30, armR: 30 }], [1.73, { y: 1, headR: -2, happy: .9, jaw: .25, armL: -15, armR: 15 }], [2.04, { headR: 4, happy: .6, smile: .3 }], [2.55, {}]]),
    dance: clip([[0, {}], [.2, { y: 8, sx: 1.04, sy: .94, armL: 10, armR: -10 }], [.53, { x: -15, y: -8, r: -7, headR: 10, armL: 77, armR: -16, foreL: 15, legR: 12 }], [.88, { x: 17, y: 0, r: 8, headR: -10, armL: 12, armR: -80, foreR: -15, legL: -12 }], [1.25, { x: -17, y: -8, r: -8, headR: 11, armL: 83, armR: -16, legR: 14 }], [1.62, { x: 18, y: 0, r: 8, headR: -11, armL: 13, armR: -83, legL: -14 }], [2, { x: -18, y: -9, r: -8, headR: 10, armL: 82, armR: -17, legR: 14, happy: .3 }], [2.38, { x: 18, y: 0, r: 8, headR: -10, armL: 14, armR: -82, legL: -14, happy: .3 }], [2.76, { x: -14, y: -8, r: -7, headR: 10, armL: 80, armR: -18, legR: 12 }], [3.12, { x: 14, r: 7, headR: -10, armL: 18, armR: -80, legL: -12 }], [3.45, { y: 9, sx: 1.04, sy: .95, armL: 15, armR: -15 }], [3.73, { y: -26, sx: .98, sy: 1.03, armL: 110, armR: -110, headR: 3, happy: .8, jaw: .3 }], [4.05, { y: 6, sx: 1.04, sy: .96, armL: 35, armR: -35 }], [4.55, {}]]),
    hug: clip([[0, {}], [.18, { y: 4, headR: -4, armL: 10, armR: -10 }], [.58, { headR: 8, headY: 5, armL: -112, armR: 112, foreL: -18, foreR: 18, sx: 1.025, sy: 1.015, happy: 1, smile: .3 }], [1.1, { headR: 5, headY: 7, armL: -120, armR: 120, foreL: -20, foreR: 20, sx: 1.035, sy: 1.02, happy: 1, smile: .35 }], [1.6, { headR: 9, headY: 5, armL: -110, armR: 110, foreL: -18, foreR: 18, sx: 1.02, happy: .9 }], [2.12, { headR: 5, armL: -105, armR: 105, happy: .9, smile: .2 }], [2.65, { headR: -2, armL: -35, armR: 35, happy: .5 }], [3.15, {}]]),
    celebrate: clip([[0, {}], [.22, { y: 11, sx: 1.06, sy: .93, armL: -8, armR: 8, headY: 3 }], [.5, { y: -40, sx: .96, sy: 1.05, armL: 130, armR: -130, foreL: 10, foreR: -10, headR: -7, happy: .5, jaw: .55, teeth: .35 }], [.78, { y: -24, armL: 140, armR: -140, headR: 5, happy: .8, jaw: .4 }], [1.1, { y: 7, sx: 1.05, sy: .95, armL: 48, armR: -48, headR: 3 }], [1.45, { y: -15, r: 4, armL: 95, armR: -95, headR: -8, happy: .65, jaw: .3 }], [1.78, { y: 3, sx: 1.025, sy: .98, armL: 30, armR: -30 }], [2.5, {}]]),
    surprise: clip([[0, {}], [.15, { y: 4, headR: 2 }], [.4, { y: -17, r: -3, sx: 1.025, sy: .98, headR: -6, headY: -7, armL: 56, armR: -56, eye: .2, jaw: .65, round: 1, brow: -6 }], [.78, { y: -4, headR: 5, armL: 35, armR: -35, jaw: .5, round: 1, eye: .15 }], [1.45, { headR: -3, armL: 15, armR: -15, jaw: .27, round: 1 }], [2.35, {}]]),
    ponder: clip([[0, {}], [.45, { headR: 7, headX: 3, armL: -94, foreL: -15, gazeX: 9, gazeY: -7, earR: 8 }], [1.1, { headR: 5, armL: -103, foreL: -18, gazeX: 9, gazeY: -8, brow: -2 }], [1.65, { headR: 9, armL: -96, foreL: -14, gazeX: -5, gazeY: -7, earL: -5 }], [2.2, { headR: 3, armL: -75, foreL: -5 }], [2.8, {}]]),
    comfort: clip([[0, {}], [.5, { y: 4, headY: 5, headR: -5, armL: -35, armR: 35, gazeY: 5 }], [1.1, { y: 5, headY: 6, headR: 4, armL: -86, armR: 86, foreL: -10, foreR: 10 }], [1.9, { headR: 7, armL: -80, armR: 80, smile: .12 }], [2.8, {}]]),
    breathe: clip([[0, {}], [1, { y: -4, sy: 1.025, sx: 1.005, armL: 12, armR: -12, headR: 2, happy: .2 }], [1.55, { y: -4, sy: 1.025, armL: 12, armR: -12, happy: .2 }], [3.4, {}]]),
    curious: clip([[0, {}], [.45, { headR: -8, headX: -4, gazeX: -10, gazeY: -2, earL: -9, armR: 8 }], [1.15, { headR: 7, headX: 4, gazeX: 9, gazeY: -3, earR: 10 }], [1.7, { headR: 3, wink: .8 }], [2.3, {}]])
  };
  function sampleClip(frames, time) {
    if (!frames) return { ...neutral };
    let i = 0; while (i < frames.length - 2 && frames[i + 1].time < time) i++;
    const a = frames[i], b = frames[Math.min(i + 1, frames.length - 1)];
    const factor = smooth(clamp((time - a.time) / (b.time - a.time || 1)));
    const pose = {}; for (const key of Object.keys(neutral)) pose[key] = mix(a.pose[key], b.pose[key], factor);
    return pose;
  }

  const IDS = ['character-root', 'bear-head', 'bear-body', 'arms-front', 'bear-face', 'eye-left', 'eye-right', 'lid-left', 'lid-right', 'brow-left', 'brow-right', 'happy-eye-left', 'happy-eye-right', 'mouth-open', 'mouth-clip-path', 'mouth-smile', 'mouth-tongue', 'mouth-teeth', 'lower-lip', 'dimple-left', 'dimple-right', 'muzzle-pad', 'cheek-left', 'cheek-right', 'tear', 'ear-left', 'ear-right', 'arm-left', 'arm-right', 'forearm-left', 'forearm-right', 'leg-left', 'leg-right', 'head-glints', 'ground', 'dots', 'eye-cut-left-path', 'eye-cut-right-path', 'anger-mark', 'cheek-color'];

  class Komdori {
    // root — svg.kdb или любой контейнер, в котором он лежит
    constructor(root, opts = {}) {
      const svg = (root.matches && root.matches('svg.kdb')) ? root : root.querySelector('svg.kdb');
      if (!svg) throw new Error('Komdori: нет svg.kdb');
      this.svg = svg;
      const u = svg.dataset.uid;
      const dom = {};
      for (const id of IDS) dom[id] = svg.querySelector('#' + id + '-' + u);
      this.dom = dom;
      this.opts = Object.assign({ motion: true, idle: true, pointer: true }, opts);
      this.motion = this.opts.motion;
      this.reduced = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false, addEventListener() {}, removeEventListener() {} };
      this.mode = 'idle'; this.emotion = 'normal'; this.springs = {};
      this.pointer = { x: 0, y: 0, last: 0 }; this.gaze = { x: 0, y: 0, until: 0 };
      const now = performance.now();
      this.nextGlance = now + 3200; this.nextBlink = now + 2100; this.blinkAt = -1000; this.doubleBlink = false;
      this.nextIdle = now + 8500; this.clip = null; this.speech = null; this.accent = 0; this.level = 0; this.queue = [];
      this.thinking = false; this.tickle = 0; this.lastPet = 0; this.alive = true; this.gone = 0;
      this.previous = now; this.frame = this.frame.bind(this);
      this._cleanup = [];
      const on = (target, type, fn, o) => { target.addEventListener(type, fn, o); this._cleanup.push(() => target.removeEventListener(type, fn, o)); };
      if (this.opts.pointer) {
        on(window, 'pointermove', e => {
          if (e.pointerType === 'touch') return;
          const r = this.svg.getBoundingClientRect();
          if (!r.width) return;
          this.pointer.x = clamp((e.clientX - r.left - r.width / 2) / (r.width * 1.1), -1, 1);
          this.pointer.y = clamp((e.clientY - r.top - r.height * .4) / (r.height * 1.1), -1, 1);
          this.pointer.last = performance.now();
        }, { passive: true });
        on(document, 'pointerleave', () => { this.pointer.last = 0; });
      }
      if (this.reduced.addEventListener) { const fn = () => { if (this.reduced.matches) this.cancel(); }; this.reduced.addEventListener('change', fn); this._cleanup.push(() => this.reduced.removeEventListener('change', fn)); }
      if (opts.mood) this.setMood(opts.mood);
      this.raf = requestAnimationFrame(this.frame);
    }

    // ── управление ──
    setMood(name) { if (facePresets[name]) this.emotion = name; }
    setEmotion(name) { this.setMood(name); }
    setListening(on) { this.mode = on ? 'listening' : 'idle'; if (on) this.nextBlink = performance.now() + 1000; }
    setLevel(level) { this.level = clamp(level); }
    setThinking(on) { this.thinking = !!on; }
    setMotion(enabled) { this.motion = enabled; if (!enabled) this.cancel(); }
    // text — что произносит; seconds — длительность озвучки (если знаем), иначе темп по умолчанию
    speak(text, o = {}) {
      text = String(text || '');
      let rate = o.rate || 1;
      const base = makeSpeech(text, 1);
      if (o.seconds > 0.2 && base.total > 0) rate = clamp(base.total / o.seconds, .5, 2);
      this.speech = { ...makeSpeech(text, rate), start: performance.now(), preview: !!o.preview, loop: !!o.loop, offset: 0, rate, lastIndex: -1, lastBoundary: -1 };
      if (o.preview) this.event('talk');
    }
    stopSpeak() { this.speech = null; }
    boundary(charIndex) {
      if (!this.speech || charIndex === this.speech.lastBoundary) return;
      const s = this.speech, cue = s.cues.find(c => c.index >= charIndex);
      if (cue) { s.offset = cue.at - (performance.now() - s.start) / 1000; this.accent = .85; }
      s.lastBoundary = charIndex;
    }
    event(name) {
      this.svg.dataset.motion = name || '';
      this.svg.dispatchEvent(new CustomEvent('komdori:motion', { bubbles: true, detail: { name } }));
    }
    cancel() { this.queue = []; this.clip = null; this.stopSpeak(); this.event(''); }
    _motionOk() { return this.motion && !(this.reduced && this.reduced.matches) && !(document.body && document.body.classList.contains('calm-motion')); }
    perform(name, internal = false) {
      if (!internal) this.cancel();
      if (name === 'talk') { this.speak('Привет! Я Комдори. Могу улыбаться, удивляться и говорить. Давай дружить?', { rate: .95, preview: true }); this.clip = null; return true; }
      if (!clips[name] || !this._motionOk()) return false;
      this.clip = { name, frames: clips[name], start: performance.now() };
      this.event(name); this.nextIdle = performance.now() + 11000;
      return true;
    }
    next() {
      this.clip = null;
      if (this.queue.length) { this.perform(this.queue.shift(), true); return; }
      this.event(''); this.nextIdle = performance.now() + 8000;
    }
    // Погладить: короткий клик — обнимает, частые — смеётся
    pet() {
      const now = performance.now(), quick = now - this.lastPet < 1800; this.lastPet = now; this.tickle = 1;
      this.perform(quick ? 'laugh' : 'hug');
    }
    enablePet() {
      const click = () => this.pet();
      const move = e => { if (e.pointerType !== 'touch') this.tickle = clamp(this.tickle + .055); };
      this.svg.style.cursor = 'pointer';
      this.svg.addEventListener('click', click); this.svg.addEventListener('pointermove', move, { passive: true });
      this._cleanup.push(() => { this.svg.removeEventListener('click', click); this.svg.removeEventListener('pointermove', move); });
    }
    destroy() {
      this.alive = false;
      cancelAnimationFrame(this.raf);
      this._cleanup.forEach(fn => { try { fn(); } catch (_) {} });
      this._cleanup = [];
    }

    // ── внутреннее ──
    spring(key, target, dt, k = 190, d = 24) {
      const s = this.springs[key] || (this.springs[key] = { x: target, v: 0 });
      const n = Math.max(1, Math.ceil(dt / .008)), step = dt / n;
      for (let i = 0; i < n; i++) { s.v += ((target - s.x) * k - s.v * d) * step; s.x += s.v * step; }
      if (Math.abs(s.x - target) < .00001 && Math.abs(s.v) < .0001) { s.x = target; s.v = 0; }
      return s.x;
    }
    renderMouth(open, width, round, teeth, smile, dt, smirk = 0) {
      const d = this.dom;
      const o = clamp(this.spring('mouthOpen', open, dt, 850, 48), 0, 1);
      const w = this.spring('mouthWidth', width, dt, 490, 37);
      const r = clamp(this.spring('mouthRound', round, dt, 420, 35));
      const tooth = clamp(this.spring('mouthTeeth', teeth, dt, 600, 40));
      const cy = 365 - smile * 2, upper = cy - r * o * 12 + smile * 2.5, bottom = cy + o * 32 + 1;
      const left = 300 - w, right = 300 + w;
      const ly = cy + smirk * 2, ry = cy - smirk * 6;
      const path = `M${left} ${ly}C${left + w * .45} ${upper + smirk} ${right - w * .45} ${upper - smirk * 4} ${right} ${ry}C${right + w * .08} ${bottom - 3 - smirk * 4} ${300 + w * .55} ${bottom + 2} 300 ${bottom}C${300 - w * .55} ${bottom + 2} ${left - w * .08} ${bottom - 3 + smirk} ${left} ${ly}Z`;
      d['mouth-open'].setAttribute('d', path); d['mouth-clip-path'].setAttribute('d', path);
      d['mouth-open'].style.opacity = clamp(o * 17);
      d['mouth-smile'].setAttribute('d', `M${left} ${ly}C${left + w * .45} ${cy + smile * 13 + smirk} ${right - w * .45} ${cy + smile * 13 - smirk * 3} ${right} ${ry}`);
      d['mouth-smile'].style.opacity = 1 - clamp(o * 15);
      d['mouth-teeth'].setAttribute('d', `M260 ${cy - 12}H340V${cy + 3 + o * 3}Q300 ${cy + 9 + o * 2} 260 ${cy + 3 + o * 3}Z`);
      d['mouth-teeth'].style.opacity = tooth * clamp(o * 8);
      d['mouth-tongue'].setAttribute('d', `M${300 - w * .8} ${bottom + 4}Q300 ${bottom - 15} ${300 + w * .8} ${bottom + 4}V${bottom + 12}H${300 - w * .8}Z`);
      d['mouth-tongue'].style.opacity = clamp((o - .22) * 2) * .85;
      d['lower-lip'].setAttribute('d', `M${300 - w * .5} ${bottom + 5}Q300 ${bottom + 9} ${300 + w * .5} ${bottom + 5}`); d['lower-lip'].style.opacity = o * .3;
      d['muzzle-pad'].setAttribute('cy', 353 + o * 2); d['muzzle-pad'].setAttribute('ry', 56 + o * 5);
      const dimples = clamp(smile * .4) * (1 - o * .65);
      d['dimple-left'].style.opacity = dimples; d['dimple-right'].style.opacity = dimples;
      d['dimple-left'].setAttribute('d', `M${left - 5} ${cy + 1}q-1-4 3-5`); d['dimple-right'].setAttribute('d', `M${right + 2} ${cy - 4}q4 1 3 5`);
      this.svg.dataset.viseme = o < .035 ? 'closed' : r > .6 ? 'rounded' : w > 27 ? 'wide' : 'open';
    }
    frame(now) {
      if (!this.alive) return;
      this.raf = requestAnimationFrame(this.frame);
      const dt = clamp((now - this.previous) / 1000, .001, .08); this.previous = now;
      // Мишку убрали из страницы (закрыли звонок) — тихо завершаем, чтобы не крутить кадры вхолостую
      if (!this.svg.isConnected) { if (++this.gone > 20) this.destroy(); return; }
      this.gone = 0;
      if (document.hidden) return;
      const t = now / 1000, motion = this._motionOk(), d = this.dom;
      let pose = { ...neutral, ...(this.emotion === 'angry' ? angryRest : this.emotion === 'evil' ? evilRest : {}) };
      if (this.clip) {
        const elapsed = (now - this.clip.start) / 1000;
        if (elapsed > this.clip.frames.at(-1).time) this.next();
        else pose = sampleClip(this.clip.frames, elapsed);
      }
      // «Думаю»: поза размышления по кругу, пока флаг включён
      if (!this.clip && !this.speech && this.thinking && motion) this.perform('ponder', true);
      else if (!this.clip && !this.speech && this.opts.idle && this.mode === 'idle' && motion && now > this.nextIdle) this.perform(['angry', 'evil'].includes(this.emotion) ? this.emotion : 'curious', true);
      if (now > this.nextGlance) { this.gaze = { x: (Math.sin(t * 3) * 8), y: -3 + Math.sin(t) * 3, until: now + 850 }; this.nextGlance = now + 3300 + Math.random() * 3100; }
      const pointerActive = now - this.pointer.last < 4200;
      const gx = motion ? (pointerActive ? this.pointer.x * 8 : now < this.gaze.until ? this.gaze.x : 0) + pose.gazeX : 0;
      const gy = motion ? (pointerActive ? this.pointer.y * 5 : now < this.gaze.until ? this.gaze.y : 0) + pose.gazeY : 0;
      const gazeX = this.spring('gazeX', gx, dt, 250, 27), gazeY = this.spring('gazeY', gy, dt, 250, 27);
      let articulation = null;
      if (this.speech) {
        const s = this.speech, elapsed = (now - s.start) / 1000 + s.offset;
        // loop: озвучка длиннее оценки — договариваем тот же текст по кругу, пока не скажут stopSpeak()
        if (s.loop && elapsed > s.total + .12) { s.start = now; s.offset = 0; s.lastIndex = -1; s.lastBoundary = -1; }
        if (s.preview && elapsed > s.total + .1) { this.stopSpeak(); this.next(); }
        else {
          articulation = speechPose(s, elapsed);
          if (articulation.index !== s.lastIndex) { s.lastIndex = articulation.index; if (['A', 'E', 'O'].includes(articulation.kind)) this.accent = Math.max(this.accent, .35); }
          if (motion) { pose.headR += Math.sin(t * 1.8) * 1.2; pose.headY -= this.accent * 1.5; pose.armL -= Math.max(0, Math.sin(t * 2.3)) * (11 + this.accent * 10); pose.armR += Math.max(0, -Math.sin(t * 2.3)) * (11 + this.accent * 10); pose.foreL -= this.accent * 5; pose.foreR += this.accent * 5; pose.brow -= this.accent * 1.3; }
        }
      }
      this.accent *= Math.exp(-dt * 7); this.tickle *= Math.exp(-dt * 3);
      const f = facePresets[this.emotion];
      const anger = clamp(this.spring('anger', this.emotion === 'angry' ? 1 : 0, dt, 150, 22));
      const evil = clamp(this.spring('evil', this.emotion === 'evil' ? 1 : 0, dt, 150, 22));
      d['eye-cut-left-path'].setAttribute('d', `M-30 ${mix(-32, -6, evil)}L30 ${mix(-32, 10, evil)}V32H-30Z`);
      d['eye-cut-right-path'].setAttribute('d', `M-30 ${mix(-32, 10, evil)}L30 ${mix(-32, -6, evil)}V32H-30Z`);
      d['anger-mark'].style.opacity = anger * .8;
      d['anger-mark'].setAttribute('transform', `translate(0 ${motion ? Math.sin(t * 4) * anger : 0})`);
      d['cheek-color'].setAttribute('stop-color', `rgb(223 ${Math.round(154 - anger * 34)} ${Math.round(135 - anger * 30)})`);
      // три точки «думаю» над головой
      const dotsOn = this.spring('dots', this.thinking && !this.speech ? 1 : 0, dt, 200, 26);
      d['dots'].style.opacity = clamp(dotsOn);
      d['dots'].setAttribute('transform', `translate(0 ${(1 - dotsOn) * 14})`);
      d['dots'].childNodes.forEach((c, i) => { if (c.nodeType === 1) c.setAttribute('transform', `translate(0 ${motion ? Math.sin(t * 4.2 - i * .9) * 5 : 0})`); });
      const fx = {};
      for (const key of ['eye', 'brow', 'browTilt', 'smile', 'cheeks', 'tilt', 'happy', 'tear']) {
        const add = key === 'tilt' ? pose.headR : key === 'brow' ? pose.brow : key === 'eye' ? pose.eye : key === 'happy' ? pose.happy : key === 'smile' ? pose.smile : 0;
        fx[key] = this.spring('face.' + key, f[key] + add, dt, 190, 23);
      }
      let blink = 1;
      if (motion) {
        if (now > this.nextBlink) { this.blinkAt = now; this.nextBlink = now + 2500 + Math.random() * 3900; this.doubleBlink = Math.random() < .15; }
        const blinkElapsed = (now - this.blinkAt) / 1000;
        if (blinkElapsed < .17) blink = 1 - Math.sin(blinkElapsed / .17 * Math.PI) * .985;
        else if (this.doubleBlink && blinkElapsed > .24 && blinkElapsed < .4) blink = 1 - Math.sin((blinkElapsed - .24) / .16 * Math.PI) * .985;
      }
      const happy = clamp(fx.happy), leftBlink = blink * (1 - clamp(pose.wink) * .98);
      const eye = clamp(fx.eye, .05, 1.4);
      const openEye = 1 - clamp(happy * 1.7), openEyeOpacity = 1 - clamp(happy * 2), closedEyeOpacity = clamp((happy - .3) * 2.5);
      d['lid-left'].setAttribute('transform', `scale(${1 + (eye - 1) * .12} ${Math.max(.025, eye * leftBlink * openEye)})`);
      d['lid-right'].setAttribute('transform', `scale(${1 + (eye - 1) * .12} ${Math.max(.025, eye * blink * openEye)})`);
      d['lid-left'].style.opacity = openEyeOpacity; d['lid-right'].style.opacity = openEyeOpacity;
      d['happy-eye-left'].style.opacity = closedEyeOpacity; d['happy-eye-right'].style.opacity = closedEyeOpacity;
      const lidCurve = 286 + (this.emotion === 'calm' ? 7 : -22) * clamp((happy - .15) / .55);
      d['happy-eye-left'].setAttribute('d', `M202 286Q219 ${lidCurve} 236 286`); d['happy-eye-right'].setAttribute('d', `M364 286Q381 ${lidCurve} 398 286`);
      d['eye-left'].setAttribute('transform', `translate(${219 + gazeX} ${287 + gazeY})`); d['eye-right'].setAttribute('transform', `translate(${381 + gazeX} ${287 + gazeY})`);
      d['happy-eye-left'].setAttribute('transform', `translate(${gazeX * .3} ${gazeY * .3})`); d['happy-eye-right'].setAttribute('transform', `translate(${gazeX * .3} ${gazeY * .3})`);
      d['brow-left'].setAttribute('transform', `translate(0 ${fx.brow}) rotate(${fx.browTilt} 219 246)`);
      d['brow-right'].setAttribute('transform', `translate(0 ${fx.brow + (this.emotion === 'thinking' ? 4 : 0) - evil * 7}) rotate(${-fx.browTilt + evil * 6} 381 246)`);
      const idle = motion && !this.clip ? 1 : 0, breath = motion ? Math.sin(t * 1.65) : 0;
      const listening = motion && this.mode === 'listening';
      const lean = motion ? Math.sin(t * .85) * .65 * idle : 0;
      const px = this.spring('root.x', pose.x, dt, 260, 26), py = this.spring('root.y', pose.y, dt, 280, 27);
      const rsx = this.spring('root.sx', pose.sx, dt, 260, 26), rsy = this.spring('root.sy', pose.sy, dt, 260, 26);
      const rotate = this.spring('root.r', pose.r, dt, 190, 22);
      d['character-root'].setAttribute('transform', `translate(${px} ${py + breath * 1.8}) rotate(${rotate + lean} 300 540) translate(300 540) scale(${rsx} ${rsy}) translate(-300 -540)`);
      const bodyR = this.spring('body.r', pose.bodyR, dt, 130, 20);
      d['bear-body'].setAttribute('transform', `rotate(${bodyR + lean * .7} 300 530) translate(300 540) scale(1 ${1 + breath * .003}) translate(-300 -540)`);
      const headR = fx.tilt + (motion ? gazeX * .16 + Math.sin(t * .7) * .65 : 0) + (listening ? 3 + this.level * 2 : 0);
      const headY = this.spring('head.y', pose.headY, dt, 150, 20) + (motion ? breath * 1.4 : 0);
      const headX = this.spring('head.x', pose.headX, dt, 150, 20);
      d['arms-front'].setAttribute('transform', d['bear-body'].getAttribute('transform'));
      d['bear-head'].setAttribute('transform', `translate(${headX + gazeX * .3} ${headY}) rotate(${headR} 300 407)`);
      d['bear-face'].setAttribute('transform', `translate(${gazeX * .28} ${gazeY * .23})`);
      const armL = this.spring('arm.l', pose.armL + (listening ? -12 : 0), dt, 230, 24);
      const armR = this.spring('arm.r', pose.armR + (listening ? 12 : 0), dt, 230, 24);
      d['arm-left'].setAttribute('transform', `rotate(${armL + breath * .6} 193 451)`); d['arm-right'].setAttribute('transform', `rotate(${armR - breath * .6} 407 451)`);
      d['forearm-left'].setAttribute('transform', `rotate(${this.spring('fore.l', pose.foreL, dt, 190, 22)} 153 492)`); d['forearm-right'].setAttribute('transform', `rotate(${this.spring('fore.r', pose.foreR, dt, 190, 22)} 447 492)`);
      d['leg-left'].setAttribute('transform', `rotate(${this.spring('leg.l', pose.legL, dt, 220, 22)} 240 545)`); d['leg-right'].setAttribute('transform', `rotate(${this.spring('leg.r', pose.legR, dt, 220, 22)} 360 545)`);
      const lag = motion ? Math.sin(t * .95) * .7 + this.tickle * Math.sin(t * 22) * 3.5 : 0;
      d['ear-left'].setAttribute('transform', `rotate(${this.spring('ear.l', pose.earL - headR * .15, dt, 110, 13) + lag} 156 170)`); d['ear-right'].setAttribute('transform', `rotate(${this.spring('ear.r', pose.earR - headR * .15, dt, 110, 13) - lag} 444 170)`);
      d['cheek-left'].style.opacity = fx.cheeks + happy * .18; d['cheek-right'].style.opacity = fx.cheeks + happy * .18; d['tear'].style.opacity = fx.tear;
      d['head-glints'].style.opacity = this.tickle * .6;
      const lift = clamp(-py / 50), shadowScale = 1 - lift * .35;
      d['ground'].setAttribute('transform', `translate(${300 + px * .5} 0) scale(${shadowScale + breath * .015} 1) translate(-300 0)`); d['ground'].style.opacity = (1 - lift * .6) * .13;
      let open = pose.jaw, width = 23 + Math.max(0, fx.smile) * 3, round = pose.round, teeth = pose.teeth;
      if (this.emotion === 'surprise' && !this.speech) { open = Math.max(open, .3); width = 15; round = 1; }
      if (this.emotion === 'evil' && !this.speech) { open = Math.max(open, .13); width = 31; teeth = .8; }
      if (articulation) { open = articulation.open; width = articulation.width; round = articulation.round; teeth = articulation.teeth; }
      else if (pose.jaw > .15) width = 28 + pose.jaw * 5;
      const lipSmile = articulation ? fx.smile * (articulation.kind === 'MBP' ? .12 : articulation.round > .6 ? .25 : 1) : fx.smile;
      this.renderMouth(open, width, round, teeth, this.spring('lipSmile', lipSmile, dt, 500, 38), dt, evil * (articulation && articulation.kind === 'MBP' ? .1 : 1));
    }
  }

  window.Komdori = {
    // Разметка мишки с уникальными id. Вставьте в контейнер и вызовите Komdori.attach(контейнер) — или сразу mount().
    svg() { return SVG.replace(/@U@/g, 'k' + (++uidSeq)); },
    attach(root, opts) { return new Komdori(root, opts); },
    mount(box, opts) { box.innerHTML = this.svg(); return new Komdori(box, opts); },
    makeSpeech, speechPose,
    moods: Object.keys(facePresets),
    motions: Object.keys(clips)
  };
})();
